import yfinance as yf
from typing import List, Optional
from app.data.base import BaseStockDataProvider
from app.data.indian_stocks_db import INDIAN_STOCKS_REGISTRY
from app.schemas.stock import StockSearchResult, StockBasicInfo, StockFundamentalsResponse
from app.engine.metrics import (
    compute_financial_ratios,
    compute_growth_metrics,
    compute_shareholding_pattern
)
from app.engine.health_score import calculate_financial_health_score
from app.engine.sector_compare import compute_sector_comparison


class YFinanceProvider(BaseStockDataProvider):
    """
    Yahoo Finance provider implementation of BaseStockDataProvider.
    Handles Indian stock symbol formatting (.NS for NSE, .BO for BSE).
    """

    async def search_stocks(self, query: str) -> List[StockSearchResult]:
        query_clean = query.strip().upper()
        if not query_clean:
            return []

        matched_results = []
        # 1. Search in curated Indian stock registry for instant sub-millisecond match
        for stock in INDIAN_STOCKS_REGISTRY:
            sym_raw = stock["symbol"].replace(".NS", "").replace(".BO", "")
            if (query_clean in sym_raw) or (query_clean in stock["name"].upper()):
                matched_results.append(StockSearchResult(
                    symbol=stock["symbol"],
                    name=stock["name"],
                    exchange=stock["exchange"],
                    sector=stock.get("sector"),
                    industry=stock.get("industry")
                ))

        # Limit local search results to top 10 matches
        if matched_results:
            return matched_results[:10]

        # 2. Fallback to yfinance ticker search if query isn't in local registry
        try:
            formatted_symbol = query_clean if ("." in query_clean) else f"{query_clean}.NS"
            ticker = yf.Ticker(formatted_symbol)
            info = ticker.info
            if info and ("shortName" in info or "longName" in info):
                name = info.get("longName") or info.get("shortName") or formatted_symbol
                return [StockSearchResult(
                    symbol=formatted_symbol,
                    name=name,
                    exchange="BSE" if formatted_symbol.endswith(".BO") else "NSE",
                    sector=info.get("sector"),
                    industry=info.get("industry")
                )]
        except Exception:
            pass

        return []

    async def get_stock_info(self, symbol: str) -> Optional[StockBasicInfo]:
        """
        Fetch company basic profile and real-time market data via yfinance.
        """
        clean_symbol = symbol.strip().upper()
        if not (clean_symbol.endswith(".NS") or clean_symbol.endswith(".BO") or "." in clean_symbol):
            clean_symbol = f"{clean_symbol}.NS"

        try:
            ticker = yf.Ticker(clean_symbol)
            info = ticker.info

            if not info or len(info) <= 5:
                if clean_symbol.endswith(".NS"):
                    clean_symbol = clean_symbol.replace(".NS", ".BO")
                    ticker = yf.Ticker(clean_symbol)
                    info = ticker.info

            current_price = info.get("currentPrice") or info.get("regularMarketPrice")
            previous_close = info.get("previousClose") or info.get("regularMarketPreviousClose")
            
            price_change = None
            price_change_percent = None
            if current_price and previous_close:
                price_change = round(current_price - previous_close, 2)
                price_change_percent = round((price_change / previous_close) * 100, 2)

            name = info.get("longName") or info.get("shortName") or clean_symbol

            return StockBasicInfo(
                symbol=clean_symbol,
                name=name,
                exchange="BSE" if clean_symbol.endswith(".BO") else "NSE",
                currency=info.get("currency", "INR"),
                current_price=current_price,
                previous_close=previous_close,
                price_change=price_change,
                price_change_percent=price_change_percent,
                market_cap=info.get("marketCap"),
                pe_ratio=info.get("trailingPE"),
                pb_ratio=info.get("priceToBook"),
                dividend_yield=round(info["dividendYield"] * 100, 2) if info.get("dividendYield") else None,
                fifty_two_week_high=info.get("fiftyTwoWeekHigh"),
                fifty_two_week_low=info.get("fiftyTwoWeekLow"),
                sector=info.get("sector"),
                industry=info.get("industry"),
                summary=info.get("longBusinessSummary"),
                website=info.get("website")
            )
        except Exception as e:
            print(f"Error fetching stock info for {clean_symbol}: {e}")
            return None

    async def get_stock_fundamentals(self, symbol: str) -> Optional[StockFundamentalsResponse]:
        """
        Fetch complete fundamental analysis DTO by pulling financial statements and executing Analysis Engine modules.
        """
        clean_symbol = symbol.strip().upper()
        if not (clean_symbol.endswith(".NS") or clean_symbol.endswith(".BO") or "." in clean_symbol):
            clean_symbol = f"{clean_symbol}.NS"

        try:
            ticker = yf.Ticker(clean_symbol)
            info = ticker.info

            info_dto = await self.get_stock_info(clean_symbol)
            if not info_dto:
                return None

            financials_df = None
            balance_sheet_df = None
            try:
                financials_df = ticker.financials
            except Exception:
                pass

            try:
                balance_sheet_df = ticker.balance_sheet
            except Exception:
                pass

            # Execute Analysis Engine domain calculations
            ratios_dto = compute_financial_ratios(info, financials_df, balance_sheet_df)
            growth_dto = compute_growth_metrics(financials_df)
            shareholding_dto = compute_shareholding_pattern(info)
            health_score_dto = calculate_financial_health_score(info_dto, ratios_dto, growth_dto)
            sector_comp_dto = compute_sector_comparison(info_dto, ratios_dto)

            return StockFundamentalsResponse(
                info=info_dto,
                ratios=ratios_dto,
                growth=growth_dto,
                shareholding=shareholding_dto,
                health_score=health_score_dto,
                sector_comparison=sector_comp_dto
            )
        except Exception as e:
            print(f"Error computing fundamentals for {clean_symbol}: {e}")
            return None
