from abc import ABC, abstractmethod
from typing import Optional
from app.schemas.stock import StockFundamentalsResponse


class BaseAIService(ABC):
    """
    Abstract Base Class for AI Services.
    Follows the Dependency Inversion Principle so business logic is decoupled from specific LLM vendors.
    The AI receives verified structured financial data from the Analysis Engine.
    """

    @abstractmethod
    async def generate_explanation(
        self,
        fundamentals: StockFundamentalsResponse,
        question_type: str = "beginner_overview",
        custom_question: Optional[str] = None
    ) -> str:
        """
        Generate educational markdown explanation interpreting structured fundamental data.
        """
        pass
