import requests
import yfinance as yf
from datetime import datetime, timezone, timedelta
from typing import List, Optional, Tuple
from app.data.base import BaseStockDataProvider
from app.schemas.stock import StockSearchResult, StockBasicInfo, StockFundamentalsResponse
from app.engine.metrics import (
    compute_financial_ratios,
    compute_growth_metrics,
    compute_shareholding_pattern
)
from app.engine.health_score import calculate_financial_health_score
from app.engine.sector_compare import compute_sector_comparison


# Common Indian ticker alias map for fast prefix hints (e.g. 'rel' -> RELIANCE, 'info' -> INFY, 'hdf' -> HDFCBANK)
TICKER_ALIAS_HINTS = {
    'REL': 'RELIANCE',
    'RELI': 'RELIANCE',
    'INFO': 'INFY',
    'INFOSYS': 'INFY',
    'HDF': 'HDFCBANK',
    'HDFC': 'HDFCBANK',
    'TCS': 'TCS',
    'WIPRO': 'WIPRO',
    'ICICI': 'ICICIBANK',
    'SBI': 'SBIN',
    'TATA': 'TATAMOTORS',
}


def is_indian_market_open() -> Tuple[bool, str]:
    """
    Check if Indian Stock Exchanges (NSE / BSE) are currently open for regular trading.
    NSE/BSE Hours: Mon-Fri, 9:15 AM to 3:30 PM IST (UTC + 5:30).
    """
    ist_now = datetime.now(timezone.utc) + timedelta(hours=5, minutes=30)
    
    # Check weekday (Monday = 0, Sunday = 6)
    weekday = ist_now.weekday()
    if weekday >= 5:  # Saturday or Sunday
        return False, "CLOSED"

    current_minutes = ist_now.hour * 60 + ist_now.minute
    open_minutes = 9 * 60 + 15    # 09:15 AM IST
    close_minutes = 15 * 60 + 30  # 03:30 PM IST

    if open_minutes <= current_minutes <= close_minutes:
        return True, "REGULAR"
    elif 9 * 60 <= current_minutes < 9 * 60 + 15:
        return False, "PRE"
    else:
        return False, "CLOSED"


class YFinanceProvider(BaseStockDataProvider):
    """
    Yahoo Finance online data provider implementation of BaseStockDataProvider.
    Provides live internet-based stock search and market data fetch for Indian stocks (.NS for NSE, .BO for BSE).
    """

    async def search_stocks(self, query: str) -> List[StockSearchResult]:
        """
        Fetch matching Indian stocks from online Yahoo Finance search API in real-time.
        Case-insensitive autocomplete supporting NSE (.NS) and BSE (.BO) stocks.
        """
        query_clean = query.strip().upper()
        if not query_clean:
            return []

        results: List[StockSearchResult] = []
        seen_symbols = set()

        search_queries = [query_clean]

        if query_clean in TICKER_ALIAS_HINTS:
            hint_symbol = TICKER_ALIAS_HINTS[query_clean]
            search_queries.insert(0, f"{hint_symbol}.NS")
            search_queries.insert(1, hint_symbol)

        search_queries.append(f"{query_clean}.NS")
        search_queries.append(f"{query_clean} India")

        headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}

        for search_term in search_queries:
            if len(results) >= 10:
                break

            url = f"https://query1.finance.yahoo.com/v1/finance/search?q={search_term}&quotesCount=15&newsCount=0&enableFuzzyQuery=true"
            try:
                response = requests.get(url, headers=headers, timeout=3)
                if response.status_code != 200:
                    continue

                data = response.json()
                quotes = data.get("quotes", [])

                for item in quotes:
                    sym = item.get("symbol", "").upper()
                    quote_type = item.get("quoteType", "")
                    exch = item.get("exchange", "")

                    is_indian = sym.endswith(".NS") or sym.endswith(".BO") or exch in ("NSI", "BOM", "NSE", "BSE")
                    is_equity = quote_type in ("EQUITY", "ETF", "MUTUALFUND")

                    if is_indian and is_equity and sym not in seen_symbols:
                        seen_symbols.add(sym)
                        name = item.get("longname") or item.get("shortname") or sym
                        exchange_clean = "BSE" if (sym.endswith(".BO") or exch == "BOM") else "NSE"

                        results.append(StockSearchResult(
                            symbol=sym,
                            name=name,
                            exchange=exchange_clean,
                            sector=item.get("sector") or item.get("industry") or "N/A",
                            industry=item.get("industry")
                        ))
            except Exception as e:
                print(f"Error fetching online search results for '{search_term}': {e}")
                continue

        return results[:10]

    async def get_stock_info(self, symbol: str) -> Optional[StockBasicInfo]:
        """
        Fetch company basic profile and real-time market data via yfinance fast_info and info.
        """
        clean_symbol = symbol.strip().upper()
        if not (clean_symbol.endswith(".NS") or clean_symbol.endswith(".BO") or "." in clean_symbol):
            clean_symbol = f"{clean_symbol}.NS"

        try:
            ticker = yf.Ticker(clean_symbol)
            
            # Sub-50ms fast price retrieval
            fast_info = {}
            try:
                fast_info = ticker.fast_info
            except Exception:
                pass

            info = {}
            try:
                info = ticker.info
            except Exception:
                pass

            if not info or len(info) <= 5:
                if clean_symbol.endswith(".NS"):
                    clean_symbol = clean_symbol.replace(".NS", ".BO")
                    ticker = yf.Ticker(clean_symbol)
                    try:
                        fast_info = ticker.fast_info
                    except Exception:
                        pass
                    try:
                        info = ticker.info
                    except Exception:
                        pass

            current_price = (
                fast_info.get("lastPrice")
                or info.get("currentPrice")
                or info.get("regularMarketPrice")
            )
            if current_price:
                current_price = round(current_price, 2)

            previous_close = (
                fast_info.get("previousClose")
                or info.get("previousClose")
                or info.get("regularMarketPreviousClose")
            )
            if previous_close:
                previous_close = round(previous_close, 2)

            price_change = None
            price_change_percent = None
            if current_price and previous_close:
                price_change = round(current_price - previous_close, 2)
                price_change_percent = round((price_change / previous_close) * 100, 2)

            name = info.get("longName") or info.get("shortName") or clean_symbol
            is_open, market_state = is_indian_market_open()
            last_updated_str = datetime.now(timezone.utc).isoformat()

            return StockBasicInfo(
                symbol=clean_symbol,
                name=name,
                exchange="BSE" if clean_symbol.endswith(".BO") else "NSE",
                currency=info.get("currency", "INR"),
                current_price=current_price,
                previous_close=previous_close,
                price_change=price_change,
                price_change_percent=price_change_percent,
                market_cap=fast_info.get("marketCap") or info.get("marketCap"),
                pe_ratio=info.get("trailingPE"),
                pb_ratio=info.get("priceToBook"),
                dividend_yield=round(info["dividendYield"] * 100, 2) if info.get("dividendYield") else None,
                fifty_two_week_high=fast_info.get("yearHigh") or info.get("fiftyTwoWeekHigh"),
                fifty_two_week_low=fast_info.get("yearLow") or info.get("fiftyTwoWeekLow"),
                sector=info.get("sector"),
                industry=info.get("industry"),
                summary=info.get("longBusinessSummary"),
                website=info.get("website"),
                is_market_open=is_open,
                market_state=market_state,
                last_updated=last_updated_str
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
