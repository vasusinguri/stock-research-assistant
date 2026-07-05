import os
import json
import requests
from typing import Optional
from app.ai.base import BaseAIService
from app.ai.prompts import (
    SYSTEM_PROMPT,
    build_beginner_overview_prompt,
    build_strengths_weaknesses_prompt,
    build_custom_question_prompt
)
from app.schemas.stock import StockFundamentalsResponse


class GeminiAIService(BaseAIService):
    """
    Gemini AI Service implementation of BaseAIService.
    Uses Gemini API when GEMINI_API_KEY environment variable is set.
    Includes a structured rule-based educational fallback engine when API key is unconfigured.
    """

    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")

    async def generate_explanation(
        self,
        fundamentals: StockFundamentalsResponse,
        question_type: str = "beginner_overview",
        custom_question: Optional[str] = None
    ) -> str:
        stock_name = fundamentals.info.name
        symbol = fundamentals.info.symbol

        # Serialize structured DTO to JSON context for LLM
        context_dict = fundamentals.model_dump()
        context_json = json.dumps(context_dict, indent=2, default=str)

        # 1. If API key exists, call Gemini REST API
        if self.api_key:
            try:
                if question_type == "strengths_weaknesses":
                    prompt = build_strengths_weaknesses_prompt(stock_name, symbol, context_json)
                elif question_type == "custom" and custom_question:
                    prompt = build_custom_question_prompt(stock_name, symbol, context_json, custom_question)
                else:
                    prompt = build_beginner_overview_prompt(stock_name, symbol, context_json)

                url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={self.api_key}"
                payload = {
                    "contents": [{
                        "parts": [
                            {"text": SYSTEM_PROMPT},
                            {"text": prompt}
                        ]
                    }]
                }
                headers = {"Content-Type": "application/json"}
                response = requests.post(url, json=payload, headers=headers, timeout=15)
                if response.status_code == 200:
                    data = response.json()
                    candidates = data.get("candidates", [])
                    if candidates:
                        parts = candidates[0].get("content", {}).get("parts", [])
                        if parts:
                            return parts[0].get("text", "")
            except Exception as e:
                print(f"Gemini API request failed ({e}), switching to Structured Educational Fallback Engine.")

        # 2. Fallback Rule-Based Educational AI Analyst Engine (Zero External Latency / No API key needed)
        return self._generate_fallback_explanation(fundamentals, question_type, custom_question)

    def _generate_fallback_explanation(
        self,
        fundamentals: StockFundamentalsResponse,
        question_type: str,
        custom_question: Optional[str]
    ) -> str:
        info = fundamentals.info
        ratios = fundamentals.ratios
        growth = fundamentals.growth
        health = fundamentals.health_score
        sector = fundamentals.sector_comparison
        shareholding = fundamentals.shareholding

        if question_type == "strengths_weaknesses":
            strengths = []
            risks = []

            if ratios.debt_to_equity is not None and ratios.debt_to_equity <= 0.5:
                strengths.append(f"**Low Solvency Risk**: Debt to Equity ratio of `{ratios.debt_to_equity}` indicates minimal financial leverage.")
            else:
                risks.append(f"**Debt Load Warning**: Debt to Equity ratio of `{ratios.debt_to_equity or 'N/A'}` requires ongoing monitoring.")

            if ratios.roe is not None and ratios.roe >= 15:
                strengths.append(f"**High Capital Efficiency**: Return on Equity (ROE) of `{ratios.roe}%` demonstrates strong shareholder value creation.")
            else:
                risks.append(f"**Subdued Profitability**: ROE of `{ratios.roe or 'N/A'}%` is below the 15% preferred benchmark.")

            if growth.revenue_cagr_3yr is not None and growth.revenue_cagr_3yr > 8:
                strengths.append(f"**Consistent Top-Line Expansion**: 3-Year Revenue CAGR of `{growth.revenue_cagr_3yr}%` reflects expanding market demand.")

            if shareholding.promoter_holding is not None and shareholding.promoter_holding > 50:
                strengths.append(f"**Strong Founder Alignment**: High promoter holding of `{shareholding.promoter_holding}%` aligns management with shareholders.")

            if info.pe_ratio is not None and info.pe_ratio > 40:
                risks.append(f"**Elevated Valuation**: P/E ratio of `{info.pe_ratio.toFixed(2) if isinstance(info.pe_ratio, float) else info.pe_ratio}` trades at a premium valuation.")

            s_str = "\n".join([f"- {s}" for s in strengths]) if strengths else "- Stable core operations."
            r_str = "\n".join([f"- {r}" for r in risks]) if risks else "- No immediate high-risk red flags identified."

            return f"""
### 💪 Key Fundamental Strengths
{s_str}

### ⚠️ Potential Risks & Areas to Monitor
{r_str}

### 🎯 Analyst Summary
**{info.name}** holds a **Financial Health Score of {health.score if health else 'N/A'}/100 ({health.grade if health else ''})**. It demonstrates solid operational capabilities within the **{info.sector or 'general'}** sector.
"""

        elif question_type == "custom" and custom_question:
            q_lower = custom_question.lower()
            if "pe" in q_lower or "price to earnings" in q_lower:
                return f"""
### 📊 Understanding P/E Ratio for {info.name}
The **Price-to-Earnings (P/E) Ratio** measures how much investors are willing to pay for every ₹1 of profit generated by the company.

- **Current P/E Ratio**: `{info.pe_ratio or 'N/A'}`
- **Sector Average P/E**: `{sector.sector_pe if sector else '25.0'}`
- **Interpretation**: {sector.pe_status if sector else 'Trading at fair market valuation.'}

A lower P/E relative to sector peers suggests potential value, while a higher P/E reflects high growth expectations.
"""
            elif "debt" in q_lower or "solvency" in q_lower:
                return f"""
### 🛡️ Understanding Debt & Solvency for {info.name}
The **Debt to Equity Ratio** measures how much debt the company uses to finance its assets relative to shareholder capital.

- **Debt to Equity**: `{ratios.debt_to_equity if ratios.debt_to_equity is not None else 'N/A'}`
- **Solvency Risk Status**: `{ratios.solvency_status}`
- **Health Pillar Score**: `{health.solvency_score if health else '20'}/30 points`

Companies with Debt/Equity < 0.5 are considered financially robust and debt-safe during economic downturns.
"""
            else:
                return f"""
### 💡 Analysis for: "{custom_question}"
**Company**: {info.name} ({info.symbol})  
**Sector**: {info.sector or 'N/A'} | **Market Cap**: ₹ {((info.market_cap or 0)/10000000):,.2f} Cr

- **Health Grade**: **{health.grade if health else 'A'} ({health.score if health else '80'}/100)**
- **ROE**: `{ratios.roe}%` | **Debt/Equity**: `{ratios.debt_to_equity}`
- **3-Yr Revenue Growth**: `{growth.revenue_cagr_3yr}% CAGR`

{info.summary or 'No additional business description available.'}
"""

        else: # beginner_overview
            return f"""
### 🏢 1. Business & Model Overview
**{info.name} ({info.symbol})** is a leading company operating in the **{info.sector or 'Indian Market'}** sector ({info.industry or 'Core Industry'}). 
It commands a total market capitalization of **₹ {((info.market_cap or 0)/10000000):,.2f} Crores**.

### 🛡️ 2. Financial Solvency & Health Status
- **Financial Health Score**: **{health.score if health else '80'}/100 (Grade {health.grade if health else 'A'})**
- **Debt to Equity Ratio**: `{ratios.debt_to_equity if ratios.debt_to_equity is not None else 'N/A'}`
- **Solvency Risk**: `{ratios.solvency_status}`

### 📈 3. Profitability & Growth Trajectory
- **Return on Equity (ROE)**: `{ratios.roe}%` (Measures how efficiently management generates profits from shareholder capital).
- **Return on Capital Employed (ROCE)**: `{ratios.roce}%`
- **3-Year Revenue Growth (CAGR)**: `{growth.revenue_cagr_3yr}%` compounding annually over the last 3 years.

### 💡 4. Takeaway for Long-Term Investors
{info.name} exhibits a **{health.status if health else 'Strong Health'}** profile. Long-term investors should monitor sustained ROE profitability above 15% and ongoing competitive positioning in the {info.sector} space.
"""
