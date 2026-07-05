"""
Financial Analyst AI Prompts & Prompt Templates for Indian Retail Investors.
"""

SYSTEM_PROMPT = """
You are a Senior Software Architect and Financial Education Mentor specializing in the Indian Stock Market (NSE/BSE).
Your mission is to educate retail investors, college students, and beginner investors on long-term fundamental analysis.

STRICT INSTRUCTIONS:
1. Ground all your financial statements strictly on the provided structured JSON context. Never invent or hallucinate numbers.
2. NEVER give buy/sell/hold trading recommendations. This is an educational research assistant.
3. Explain concepts in simple, jargon-free English suitable for a beginner developer or investor.
4. Format your response clearly in GitHub-flavored Markdown using clean headings, bullet points, and bold terms.
"""

def build_beginner_overview_prompt(stock_name: str, symbol: str, context_json: str) -> str:
    return f"""
Analyze the structured financial data for **{stock_name} ({symbol})** below and explain the company to a beginner investor.

STRUCTURED FINANCIAL CONTEXT:
{context_json}

Provide your response in Markdown with these exact sections:
### 🏢 1. Business & Model Overview
Explain what {stock_name} does, what sector it operates in, and how it generates revenue.

### 🛡️ 2. Financial Solvency & Health Status
Explain its Debt to Equity ratio, current liquidity, and overall Financial Health Score in plain English.

### 📈 3. Profitability & Growth Trajectory
Explain its Return on Equity (ROE %), Return on Capital Employed (ROCE %), and 3-Year Growth CAGR trends.

### 💡 4. Takeaway for Long-Term Investors
Summarize the core business fundamentals in 2-3 sentence sentences for a beginner.
"""

def build_strengths_weaknesses_prompt(stock_name: str, symbol: str, context_json: str) -> str:
    return f"""
Analyze the structured financial data for **{stock_name} ({symbol})** and summarize its key strengths and risks.

STRUCTURED FINANCIAL CONTEXT:
{context_json}

Provide your response in Markdown:
### 💪 Key Fundamental Strengths
- Detail 3-4 major strengths (e.g. low debt, high ROE, dominant promoter holding, strong CAGR growth).

### ⚠️ Potential Risks & Areas to Monitor
- Detail 2-3 risk factors or monitoring areas (e.g. high valuation P/E, sector headwinds, debt load).

### 🎯 Analyst Summary
A brief 2-sentence summary of its risk-reward profile for long-term fundamental investors.
"""

def build_custom_question_prompt(stock_name: str, symbol: str, context_json: str, question: str) -> str:
    return f"""
Answer the investor's specific question regarding **{stock_name} ({symbol})**.

INVESTOR QUESTION: "{question}"

STRUCTURED FINANCIAL CONTEXT:
{context_json}

Provide a helpful, educational answer in clear Markdown, explaining any financial terms mentioned.
"""
