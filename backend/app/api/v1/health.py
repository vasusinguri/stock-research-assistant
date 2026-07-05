from fastapi import APIRouter
from datetime import datetime, timezone

router = APIRouter()


@router.get("/health", summary="API Health Check")
async def health_check():
    """
    Returns system status, confirming backend API operational readiness.
    """
    return {
        "status": "healthy",
        "service": "AI-Powered Indian Stock Research Assistant API",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "version": "1.0.0",
    }
