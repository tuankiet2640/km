from typing import Any, Dict, Optional, List
from pydantic import PostgresDsn, AnyHttpUrl
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "Knowledge Management"
    API_V1_STR: str = "/api/v1"
    
    # Security
    SECRET_KEY: str = "key-here"  # Change in production
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Database
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "postgres"
    POSTGRES_DB: str = "km_db"
    SQLALCHEMY_DATABASE_URI: str = f"postgresql://{POSTGRES_USER}:{POSTGRES_PASSWORD}@{POSTGRES_SERVER}/{POSTGRES_DB}"

    # CORS
    BACKEND_CORS_ORIGINS: List[AnyHttpUrl] = []

    # # Cache
    # REDIS_URL: str = "redis://localhost:6379/0"

    model_config = SettingsConfigDict(case_sensitive=True, env_file=".env")

settings = Settings()
