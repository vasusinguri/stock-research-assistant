from typing import Optional
from pydantic import BaseModel, Field


class AIExplainRequest(BaseModel):
    """
    Schema for AI Explanation Request payload.
    """
    symbol: str = Field(..., description="Stock ticker symbol (e.g. RELIANCE.NS)")
    question_type: str = Field(
        default="beginner_overview",
        description="Type of question: 'beginner_overview' | 'strengths_weaknesses' | 'ratio_explanation' | 'custom'"
    )
    user_question: Optional[str] = Field(None, description="Custom user question string if question_type is 'custom'")


class AIExplainResponse(BaseModel):
    """
    Schema for AI Explanation Response payload.
    """
    symbol: str
    question_type: str
    explanation: str = Field(..., description="Markdown-formatted educational explanation produced by AI")
    disclaimer: str = Field(
        default="Educational Research Only • Not Financial or Investment Advice.",
        description="Standard financial disclaimer"
    )
