from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Application settings loaded from environment variables or defaults.
    Uses Pydantic BaseSettings for strong typing and validation.
    """
    PROJECT_NAME: str = "AI-Powered Indian Stock Research Assistant"
    API_V1_STR: str = "/api/v1"
    DEBUG: bool = True

    # CORS configuration - array of allowed origin URLs (includes cloud origins)
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "*"
    ]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )


settings = Settings()
