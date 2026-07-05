from fastapi import APIRouter, HTTPException
from app.data.yfinance_provider import YFinanceProvider
from app.ai.gemini_service import GeminiAIService
from app.schemas.ai import AIExplainRequest, AIExplainResponse

router = APIRouter()
data_provider = YFinanceProvider()
ai_service = GeminiAIService()


@router.post("/ai/explain", response_model=AIExplainResponse, summary="AI Educational Stock Explanation")
async def explain_stock(payload: AIExplainRequest):
    """
    Generate educational stock analysis interpreting structured data output from the Analysis Engine.
    The AI receives verified JSON facts and never invents financial figures.
    """
    fundamentals = await data_provider.get_stock_fundamentals(payload.symbol)
    if not fundamentals:
        raise HTTPException(
            status_code=404, 
            detail=f"Stock '{payload.symbol}' not found or fundamental analysis data unavailable."
        )

    explanation = await ai_service.generate_explanation(
        fundamentals=fundamentals,
        question_type=payload.question_type,
        custom_question=payload.user_question
    )

    return AIExplainResponse(
        symbol=payload.symbol,
        question_type=payload.question_type,
        explanation=explanation
    )
