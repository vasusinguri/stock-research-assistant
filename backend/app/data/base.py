from abc import ABC, abstractmethod
from typing import List, Optional
from app.schemas.stock import StockSearchResult, StockBasicInfo, StockFundamentalsResponse


class BaseStockDataProvider(ABC):
    """
    Abstract Base Class defining the contract for stock data providers.
    Follows the Dependency Inversion Principle so business logic is decoupled
    from third-party financial data sources.
    """

    @abstractmethod
    async def search_stocks(self, query: str) -> List[StockSearchResult]:
        """
        Search for stock ticker symbols or company names matching query.
        """
        pass

    @abstractmethod
    async def get_stock_info(self, symbol: str) -> Optional[StockBasicInfo]:
        """
        Fetch high-level company profile, price, and fundamental summary.
        """
        pass

    @abstractmethod
    async def get_stock_fundamentals(self, symbol: str) -> Optional[StockFundamentalsResponse]:
        """
        Fetch complete fundamental analysis DTO including ratios, growth, and shareholding pattern.
        """
        pass
