"""
Configuration settings for AI Knowledge Platform FastAPI backend.
Uses Pydantic Settings for environment variable management.
Updated to support advanced AI features including MCP, workflows, and multi-modal capabilities.
"""

from typing import List, Optional, Union
from pydantic import AnyHttpUrl, PostgresDsn, RedisDsn, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True)
    
    # Application
    APP_NAME: str = "KM AI Platform"
    APP_VERSION: str = "2.0.0"
    DEBUG: bool = False
    ENVIRONMENT: str = "production"
    LOG_LEVEL: str = "INFO"
    API_V1_STR: str = "/api/v1"
    
    # Security
    SECRET_KEY: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    ALGORITHM: str = "HS256"
    
    # Database
    DATABASE_URL: PostgresDsn
    DATABASE_POOL_SIZE: int = 20
    DATABASE_MAX_OVERFLOW: int = 0
    
    # Redis
    REDIS_URL: RedisDsn
    REDIS_PASSWORD: Optional[str] = None
    
    # AI Models - Enhanced for multiple providers
    OPENAI_API_KEY: Optional[str] = None
    ANTHROPIC_API_KEY: Optional[str] = None
    DEEPSEEK_API_KEY: Optional[str] = None
    QWEN_API_KEY: Optional[str] = None
    DEFAULT_MODEL_PROVIDER: str = "openai"
    DEFAULT_LLM_MODEL: str = "gpt-3.5-turbo"
    DEFAULT_EMBEDDING_MODEL: str = "text-embedding-ada-002"
    
    # File Upload - Enhanced
    MAX_FILE_SIZE_MB: int = 100
    UPLOAD_DIR: str = "./uploads"
    ALLOWED_EXTENSIONS: str = "pdf,docx,txt,md,csv,xlsx,pptx,xls,json,yaml,yml"
    
    # Vector Database - Enhanced
    VECTOR_DIMENSION: int = 1536
    VECTOR_INDEX_TYPE: str = "ivfflat"
    VECTOR_LISTS: int = 100
    SIMILARITY_THRESHOLD: float = 0.7
    RETRIEVAL_LIMIT: int = 10
    SEARCH_MODE: str = "semantic"  # semantic, keyword, hybrid
    
    # Celery
    CELERY_BROKER_URL: RedisDsn
    CELERY_RESULT_BACKEND: RedisDsn
    
    # CORS
    ALLOWED_ORIGINS: Union[str, List[str]] = []
    ALLOWED_METHODS: Union[str, List[str]] = ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"]
    ALLOWED_HEADERS: Union[str, List[str]] = ["*"]
    ALLOWED_HOSTS: List[str] = ["*"]
    
    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = 60
    RATE_LIMIT_BURST: int = 100
    
    # Advanced AI Features
    MCP_ENABLED: bool = True
    MCP_TIMEOUT: int = 180
    WORKFLOW_ENGINE_ENABLED: bool = True
    MULTIMODAL_ENABLED: bool = True
    STREAMING_ENABLED: bool = True
    
    # Web Scraping & Crawling
    WEB_SCRAPING_ENABLED: bool = True
    MAX_CRAWL_DEPTH: int = 3
    CRAWL_DELAY: int = 1
    
    # SSO & Enterprise Features
    SSO_ENABLED: bool = False
    LDAP_ENABLED: bool = False
    
    # Analytics & Monitoring
    ANALYTICS_ENABLED: bool = True
    METRICS_ENABLED: bool = True
    
    @field_validator("ALLOWED_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> Union[List[str], str]:
        """Parse CORS origins from string or list."""
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)
    
    @field_validator("ALLOWED_METHODS", mode="before")
    @classmethod
    def assemble_cors_methods(cls, v: Union[str, List[str]]) -> Union[List[str], str]:
        """Parse CORS methods from string or list."""
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)
    
    @field_validator("ALLOWED_HEADERS", mode="before")
    @classmethod
    def assemble_cors_headers(cls, v: Union[str, List[str]]) -> Union[List[str], str]:
        """Parse CORS headers from string or list."""
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)
    
    @property
    def allowed_file_extensions(self) -> List[str]:
        """Get list of allowed file extensions."""
        return [ext.strip() for ext in self.ALLOWED_EXTENSIONS.split(",")]
    
    @property
    def max_file_size_bytes(self) -> int:
        """Get maximum file size in bytes."""
        return self.MAX_FILE_SIZE_MB * 1024 * 1024
    
    @property
    def supported_ai_providers(self) -> List[str]:
        """Get list of supported AI providers."""
        providers = []
        if self.OPENAI_API_KEY:
            providers.append("openai")
        if self.ANTHROPIC_API_KEY:
            providers.append("anthropic")
        if self.DEEPSEEK_API_KEY:
            providers.append("deepseek")
        if self.QWEN_API_KEY:
            providers.append("qwen")
        return providers


# Global settings instance
settings = Settings() 