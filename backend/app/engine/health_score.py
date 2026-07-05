"""
Pure Python Financial Health Scoring Algorithm.
Evaluates Solvency, Profitability, Growth, and Valuation to compute a 0-100 score and risk grade.
"""

from typing import Dict, Any, Optional
from app.schemas.stock import HealthScore, FinancialRatios, GrowthMetrics, StockBasicInfo


def calculate_financial_health_score(
    info: StockBasicInfo,
    ratios: FinancialRatios,
    growth: GrowthMetrics
) -> HealthScore:
    """
    Compute weighted 0-100 Financial Health Score based on 4 core pillars.
    """
    # Pillar 1: Solvency (30 Points Max)
    solvency_pts = 20  # Default baseline
    de = ratios.debt_to_equity
    if de is not None:
        if de <= 0.3:
            solvency_pts = 30
        elif de <= 0.8:
            solvency_pts = 22
        elif de <= 1.5:
            solvency_pts = 12
        else:
            solvency_pts = 4
    elif ratios.solvency_status and "Low Risk" in ratios.solvency_status:
        solvency_pts = 28

    # Pillar 2: Profitability (30 Points Max)
    profitability_pts = 15  # Default baseline
    roe = ratios.roe
    opm = ratios.opm
    if roe is not None:
        if roe >= 18:
            profitability_pts = 30
        elif roe >= 12:
            profitability_pts = 22
        elif roe >= 6:
            profitability_pts = 14
        else:
            profitability_pts = 6

    # Adjust for OPM if available
    if opm is not None and opm > 20:
        profitability_pts = min(30, profitability_pts + 3)

    # Pillar 3: Growth (20 Points Max)
    growth_pts = 10  # Default baseline
    rev_cagr = growth.revenue_cagr_3yr
    profit_cagr = growth.profit_cagr_3yr
    if rev_cagr is not None:
        if rev_cagr >= 12:
            growth_pts = 20
        elif rev_cagr >= 6:
            growth_pts = 14
        elif rev_cagr > 0:
            growth_pts = 8
        else:
            growth_pts = 3
    elif growth.revenue_growth_yoy is not None:
        if growth.revenue_growth_yoy >= 10:
            growth_pts = 16
        elif growth.revenue_growth_yoy > 0:
            growth_pts = 10

    # Pillar 4: Valuation (20 Points Max)
    valuation_pts = 12  # Default baseline
    pe = info.pe_ratio
    if pe is not None and pe > 0:
        if pe <= 22:
            valuation_pts = 20
        elif pe <= 35:
            valuation_pts = 14
        elif pe <= 55:
            valuation_pts = 8
        else:
            valuation_pts = 4

    total_score = min(100, max(0, solvency_pts + profitability_pts + growth_pts + valuation_pts))

    # Grade & Status Assignment
    if total_score >= 85:
        grade = "A+"
        status = "Excellent Fundamental Health"
        summary = "Exceptional balance sheet solvency, high capital efficiency (ROE/ROCE), and strong growth consistency."
    elif total_score >= 72:
        grade = "A"
        status = "Strong Fundamental Health"
        summary = "Solid financial fundamentals with low debt risk and healthy operational margins."
    elif total_score >= 58:
        grade = "B"
        status = "Moderate Health"
        summary = "Decent financial position with acceptable profitability, though debt or growth rates warrant monitoring."
    elif total_score >= 45:
        grade = "C"
        status = "Fair / Average Health"
        summary = "Fair financial health with room for improvement in debt management or profit margins."
    else:
        grade = "D"
        status = "Elevated Risk Caution"
        summary = "Higher financial risk profile due to heavy leverage, subdued growth, or weak return metrics."

    return HealthScore(
        score=total_score,
        grade=grade,
        status=status,
        solvency_score=solvency_pts,
        profitability_score=profitability_pts,
        growth_score=growth_pts,
        valuation_score=valuation_pts,
        summary=summary
    )
