from typing import Optional, List
from pydantic import BaseModel, Field


class StockSearchResult(BaseModel):
    """
    Schema representing a stock search autocomplete result item.
    """
    symbol: str = Field(..., description="Stock ticker symbol (e.g. RELIANCE.NS)")
    name: str = Field(..., description="Company name (e.g. Reliance Industries Ltd)")
    exchange: str = Field(default="NSE", description="Stock Exchange (NSE or BSE)")
    sector: Optional[str] = Field(default=None, description="Industry sector")
    industry: Optional[str] = Field(default=None, description="Industry category")


class StockSearchResponse(BaseModel):
    """
    Response schema for stock search endpoint.
    """
    query: str
    count: int
    results: List[StockSearchResult]


class StockBasicInfo(BaseModel):
    """
    Schema for basic stock information and real-time market quote data.
    """
    symbol: str
    name: str
    exchange: str = "NSE"
    currency: str = "INR"
    current_price: Optional[float] = None
    previous_close: Optional[float] = None
    price_change: Optional[float] = None
    price_change_percent: Optional[float] = None
    market_cap: Optional[float] = None
    pe_ratio: Optional[float] = None
    pb_ratio: Optional[float] = None
    dividend_yield: Optional[float] = None
    fifty_two_week_high: Optional[float] = None
    fifty_two_week_low: Optional[float] = None
    day_high: Optional[float] = Field(default=None, description="Intraday Day High price")
    day_low: Optional[float] = Field(default=None, description="Intraday Day Low price")
    sector: Optional[str] = None
    industry: Optional[str] = None
    summary: Optional[str] = None
    website: Optional[str] = None
    is_market_open: bool = Field(default=False, description="Whether Indian Stock Exchange is currently open")
    market_state: Optional[str] = Field(default="CLOSED", description="Market status (REGULAR, CLOSED, PRE)")
    last_updated: Optional[str] = Field(default=None, description="ISO timestamp of last price quote update")


class FinancialRatios(BaseModel):
    """
    Schema for financial solvency, liquidity, and profitability ratios.
    """
    debt_to_equity: Optional[float] = Field(None, description="Total Debt / Total Shareholder Equity")
    interest_coverage: Optional[float] = Field(None, description="EBIT / Interest Expense (Solvency indicator)")
    current_ratio: Optional[float] = Field(None, description="Current Assets / Current Liabilities")
    roe: Optional[float] = Field(None, description="Return on Equity (%)")
    roce: Optional[float] = Field(None, description="Return on Capital Employed (%)")
    opm: Optional[float] = Field(None, description="Operating Profit Margin (%)")
    net_profit_margin: Optional[float] = Field(None, description="Net Profit Margin (%)")
    solvency_status: Optional[str] = Field(None, description="Low Risk / Moderate Risk / High Risk")


class GrowthMetrics(BaseModel):
    """
    Schema for revenue and profit growth trends.
    """
    revenue_cagr_3yr: Optional[float] = Field(None, description="3-Year Revenue CAGR (%)")
    profit_cagr_3yr: Optional[float] = Field(None, description="3-Year Net Profit CAGR (%)")
    revenue_growth_yoy: Optional[float] = Field(None, description="YoY Revenue Growth (%)")
    profit_growth_yoy: Optional[float] = Field(None, description="YoY Net Profit Growth (%)")


class ShareholdingPattern(BaseModel):
    """
    Schema for promoter, institutional, and retail shareholding breakdown.
    """
    promoter_holding: Optional[float] = Field(None, description="Promoter holding %")
    fii_holding: Optional[float] = Field(None, description="Foreign Institutional Investors %")
    dii_holding: Optional[float] = Field(None, description="Domestic Institutional Investors %")
    public_holding: Optional[float] = Field(None, description="Public & Retail holding %")


class HealthScore(BaseModel):
    """
    Schema for Financial Health Score DTO.
    """
    score: int
    grade: str
    status: str
    solvency_score: int
    profitability_score: int
    growth_score: int
    valuation_score: int
    summary: str


class SectorComparison(BaseModel):
    """
    Schema for Sector Comparison Benchmarking DTO.
    """
    sector_name: str
    stock_pe: Optional[float] = None
    sector_pe: float
    stock_roe: Optional[float] = None
    sector_roe: float
    stock_de: Optional[float] = None
    sector_de: float
    pe_status: str
    roe_status: str


class StockFundamentalsResponse(BaseModel):
    """
    Full aggregated fundamental analysis DTO schema.
    """
    info: StockBasicInfo
    ratios: FinancialRatios
    growth: GrowthMetrics
    shareholding: ShareholdingPattern
    health_score: Optional[HealthScore] = None
    sector_comparison: Optional[SectorComparison] = None
