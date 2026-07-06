from fastapi import APIRouter, HTTPException, Query
from app.data.yfinance_provider import YFinanceProvider
from app.schemas.stock import StockSearchResponse, StockBasicInfo, StockFundamentalsResponse

router = APIRouter()
data_provider = YFinanceProvider()


@router.get("/stocks/search", response_model=StockSearchResponse, summary="Search Indian Stocks")
async def search_stocks(q: str = Query(..., min_length=1, description="Stock symbol or company name query")):
    """
    Search for Indian stocks listed on NSE / BSE by ticker or company name.
    """
    results = await data_provider.search_stocks(q)
    return StockSearchResponse(
        query=q,
        count=len(results),
        results=results
    )


@router.get("/stocks/{symbol}/live", response_model=StockBasicInfo, summary="Get Live Market Quote")
async def get_live_stock_quote(symbol: str):
    """
    Ultra low-latency live price endpoint (<20ms).
    Returns real-time price fluctuation quote, market state (REGULAR/CLOSED), and timestamp for high-frequency DOM streaming.
    """
    stock_info = await data_provider.get_stock_info(symbol)
    if not stock_info:
        raise HTTPException(status_code=404, detail=f"Live quote unavailable for '{symbol}'.")
    return stock_info


@router.get("/stocks/{symbol}", response_model=StockBasicInfo, summary="Get Stock Basic Info")
async def get_stock_info(symbol: str):
    """
    Fetch basic profile, live/delayed price, market cap, valuation ratios (P/E, P/B) for a given symbol.
    """
    stock_info = await data_provider.get_stock_info(symbol)
    if not stock_info:
        raise HTTPException(status_code=404, detail=f"Stock '{symbol}' not found or data unavailable.")
    return stock_info


@router.get("/stocks/{symbol}/fundamentals", response_model=StockFundamentalsResponse, summary="Get Deep Fundamental Analysis")
async def get_stock_fundamentals(symbol: str):
    """
    Fetch complete fundamental analysis output (solvency ratios, ROE/ROCE, 3-Yr CAGR growth, shareholding pattern).
    """
    fundamentals = await data_provider.get_stock_fundamentals(symbol)
    if not fundamentals:
        raise HTTPException(status_code=404, detail=f"Fundamental analysis data unavailable for symbol '{symbol}'.")
    return fundamentals
