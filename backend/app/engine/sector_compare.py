"""
Sector Peer Benchmarking Engine.
Compares individual stock valuation (P/E), profitability (ROE), and leverage (Debt/Equity)
against sector averages for Indian listed equities.
"""

from typing import Optional
from app.schemas.stock import SectorComparison, StockBasicInfo, FinancialRatios

SECTOR_BENCHMARKS = {
    "Technology": {"pe": 28.5, "roe": 22.0, "de": 0.10, "growth": 10.5},
    "Financial Services": {"pe": 18.2, "roe": 14.5, "de": 0.75, "growth": 12.0},
    "Energy": {"pe": 16.5, "roe": 13.0, "de": 0.45, "growth": 7.5},
    "Utilities": {"pe": 15.0, "roe": 11.5, "de": 1.20, "growth": 6.0},
    "Consumer Goods": {"pe": 45.0, "roe": 24.0, "de": 0.15, "growth": 9.0},
    "Automobile": {"pe": 24.0, "roe": 16.0, "de": 0.35, "growth": 11.0},
    "Telecommunication": {"pe": 30.0, "roe": 10.0, "de": 1.10, "growth": 8.0},
    "Infrastructure": {"pe": 22.0, "roe": 12.5, "de": 0.65, "growth": 10.0},
    "Metals": {"pe": 12.0, "roe": 14.0, "de": 0.50, "growth": 8.0},
    "Healthcare": {"pe": 32.0, "roe": 15.0, "de": 0.25, "growth": 10.0},
    "Consumer Durables": {"pe": 40.0, "roe": 18.0, "de": 0.20, "growth": 9.5},
}


def compute_sector_comparison(info: StockBasicInfo, ratios: FinancialRatios) -> SectorComparison:
    """
    Generate peer sector benchmark metrics comparing stock vs sector medians.
    """
    sector_key = info.sector or "General"
    benchmark = SECTOR_BENCHMARKS.get(sector_key, {"pe": 25.0, "roe": 15.0, "de": 0.50, "growth": 8.5})

    stock_pe = info.pe_ratio
    stock_roe = ratios.roe
    stock_de = ratios.debt_to_equity

    pe_status = "In-Line with Sector"
    if stock_pe is not None:
        if stock_pe < benchmark["pe"] * 0.85:
            pe_status = "Below Sector Avg (Attractive Valuation)"
        elif stock_pe > benchmark["pe"] * 1.15:
            pe_status = "Above Sector Avg (Premium Valuation)"

    roe_status = "In-Line with Sector"
    if stock_roe is not None:
        if stock_roe > benchmark["roe"] * 1.1:
            roe_status = "Outperforming Sector ROE"
        elif stock_roe < benchmark["roe"] * 0.9:
            roe_status = "Underperforming Sector ROE"

    return SectorComparison(
        sector_name=sector_key,
        stock_pe=round(stock_pe, 2) if stock_pe else None,
        sector_pe=benchmark["pe"],
        stock_roe=round(stock_roe, 2) if stock_roe else None,
        sector_roe=benchmark["roe"],
        stock_de=round(stock_de, 2) if stock_de is not None else None,
        sector_de=benchmark["de"],
        pe_status=pe_status,
        roe_status=roe_status
    )
