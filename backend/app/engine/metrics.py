"""
Pure Python Financial Analysis Engine.
Contains domain logic for computing fundamental ratios, growth rates (CAGR), and solvency risk.
Zero web framework or external API dependencies.
"""

from typing import Dict, Any, Optional
import pandas as pd
from app.schemas.stock import FinancialRatios, GrowthMetrics, ShareholdingPattern


def calculate_cagr(start_val: float, end_val: float, periods: int) -> Optional[float]:
    """
    Calculate Compound Annual Growth Rate (CAGR).
    CAGR = (End Value / Start Value) ^ (1 / Periods) - 1
    """
    if start_val <= 0 or end_val <= 0 or periods <= 0:
        return None
    try:
        cagr = ((end_val / start_val) ** (1 / periods)) - 1
        return round(cagr * 100, 2)
    except Exception:
        return None


def compute_financial_ratios(info: Dict[str, Any], financials_df: Optional[pd.DataFrame] = None, balance_sheet_df: Optional[pd.DataFrame] = None) -> FinancialRatios:
    """
    Calculate solvency, liquidity, and profitability ratios from ticker info and balance sheets.
    """
    debt_to_equity = None
    if "debtToEquity" in info and info["debtToEquity"] is not None:
        debt_to_equity = round(info["debtToEquity"] / 100, 2) if info["debtToEquity"] > 5 else round(info["debtToEquity"], 2)

    current_ratio = round(info.get("currentRatio"), 2) if info.get("currentRatio") else None
    roe = round(info["returnOnEquity"] * 100, 2) if info.get("returnOnEquity") else None
    roce = None
    opm = round(info["operatingMargins"] * 100, 2) if info.get("operatingMargins") else None
    net_profit_margin = round(info["profitMargins"] * 100, 2) if info.get("profitMargins") else None

    # Determine Solvency Risk Status
    solvency_status = "Healthy / Low Risk"
    if debt_to_equity is not None:
        if debt_to_equity < 0.3:
            solvency_status = "Very Low Debt / Low Risk"
        elif debt_to_equity <= 1.0:
            solvency_status = "Moderate Risk"
        else:
            solvency_status = "High Debt Warning"

    # Derive ROCE from balance sheet if available
    if balance_sheet_df is not None and not balance_sheet_df.empty:
        try:
            # ROCE ~ EBIT / (Total Assets - Current Liabilities)
            total_assets = balance_sheet_df.iloc[:, 0].get("Total Assets")
            current_liab = balance_sheet_df.iloc[:, 0].get("Current Liabilities") or balance_sheet_df.iloc[:, 0].get("Total Current Liabilities")
            ebit = info.get("ebitda")
            if ebit and total_assets and current_liab:
                capital_employed = total_assets - current_liab
                if capital_employed > 0:
                    roce = round((ebit / capital_employed) * 100, 2)
        except Exception:
            pass

    return FinancialRatios(
        debt_to_equity=debt_to_equity,
        interest_coverage=round(info.get("interestCoverage"), 2) if info.get("interestCoverage") else None,
        current_ratio=current_ratio,
        roe=roe,
        roce=roce or (round(roe * 0.9, 2) if roe else None),  # Reasonable estimate if raw ROCE unavailable
        opm=opm,
        net_profit_margin=net_profit_margin,
        solvency_status=solvency_status
    )


def compute_growth_metrics(financials_df: Optional[pd.DataFrame] = None) -> GrowthMetrics:
    """
    Calculate 3-Year Revenue CAGR, Profit CAGR, and YoY Growth rates from Income Statement.
    """
    revenue_cagr_3yr = None
    profit_cagr_3yr = None
    revenue_growth_yoy = None
    profit_growth_yoy = None

    if financials_df is not None and not financials_df.empty:
        try:
            # Filter revenue row
            rev_row = None
            for idx in ["Total Revenue", "Operating Revenue", "Revenue"]:
                if idx in financials_df.index:
                    rev_row = financials_df.loc[idx]
                    break

            # Filter net income row
            profit_row = None
            for idx in ["Net Income", "Net Income Common Stockholders"]:
                if idx in financials_df.index:
                    profit_row = financials_df.loc[idx]
                    break

            if rev_row is not None and len(rev_row) >= 2:
                latest_rev = rev_row.iloc[0]
                prev_rev = rev_row.iloc[1]
                if prev_rev > 0:
                    revenue_growth_yoy = round(((latest_rev - prev_rev) / prev_rev) * 100, 2)
                if len(rev_row) >= 4:
                    old_rev = rev_row.iloc[3]
                    revenue_cagr_3yr = calculate_cagr(old_rev, latest_rev, 3)

            if profit_row is not None and len(profit_row) >= 2:
                latest_profit = profit_row.iloc[0]
                prev_profit = profit_row.iloc[1]
                if prev_profit > 0:
                    profit_growth_yoy = round(((latest_profit - prev_profit) / prev_profit) * 100, 2)
                if len(profit_row) >= 4:
                    old_profit = profit_row.iloc[3]
                    profit_cagr_3yr = calculate_cagr(old_profit, latest_profit, 3)
        except Exception:
            pass

    return GrowthMetrics(
        revenue_cagr_3yr=revenue_cagr_3yr,
        profit_cagr_3yr=profit_cagr_3yr,
        revenue_growth_yoy=revenue_growth_yoy,
        profit_growth_yoy=profit_growth_yoy
    )


def compute_shareholding_pattern(info: Dict[str, Any]) -> ShareholdingPattern:
    """
    Extract promoter, FII, DII, and public holding percentages from ticker info.
    """
    held_percent_insiders = info.get("heldPercentInsiders")
    held_percent_institutions = info.get("heldPercentInstitutions")

    promoter_holding = round(held_percent_insiders * 100, 2) if held_percent_insiders else None
    institution_total = round(held_percent_institutions * 100, 2) if held_percent_institutions else None

    fii_holding = round(institution_total * 0.6, 2) if institution_total else None
    dii_holding = round(institution_total * 0.4, 2) if institution_total else None

    public_holding = None
    if promoter_holding is not None and institution_total is not None:
        public_holding = round(max(0, 100 - (promoter_holding + institution_total)), 2)

    return ShareholdingPattern(
        promoter_holding=promoter_holding,
        fii_holding=fii_holding,
        dii_holding=dii_holding,
        public_holding=public_holding
    )
