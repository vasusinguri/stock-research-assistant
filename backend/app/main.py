from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1 import health, stocks, ai

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    description="Backend API powering the Indian Stock Research Assistant application.",
    version="1.0.0",
)

# Configure CORS middleware for security & frontend accessibility
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API v1 routers
app.include_router(health.router, prefix=settings.API_V1_STR, tags=["Health"])
app.include_router(stocks.router, prefix=settings.API_V1_STR, tags=["Stocks"])
app.include_router(ai.router, prefix=settings.API_V1_STR, tags=["AI Research"])


@app.get("/", summary="Root Endpoint")
async def root():
    return {
        "message": f"Welcome to {settings.PROJECT_NAME} API",
        "documentation": "/docs",
        "health_check": f"{settings.API_V1_STR}/health",
    }
