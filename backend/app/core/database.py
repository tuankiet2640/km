"""
Database configuration and session management for KM.
"""

from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy import MetaData, text
import logging
import os

logger = logging.getLogger(__name__)

# Quick local development override - use SQLite if no PostgreSQL available
def get_database_url():
    """Get database URL with fallback to SQLite for local development."""
    try:
        from app.core.config import settings
        return str(settings.DATABASE_URL)
    except Exception as e:
        # Fallback to SQLite for local development
        logger.info(f"Config loading failed ({e}), using SQLite fallback for local development")
        return "sqlite+aiosqlite:///./km_local.db"

# Database engine
engine = create_async_engine(
    get_database_url(),
    pool_size=20,
    max_overflow=0,
    echo=True,  # Enable for debugging
    future=True,
)

# Session factory
async_session_maker = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


class Base(DeclarativeBase):
    """Base class for all database models."""
    
    metadata = MetaData(
        naming_convention={
            "ix": "ix_%(column_0_label)s",
            "uq": "uq_%(table_name)s_%(column_0_name)s",
            "ck": "ck_%(table_name)s_%(constraint_name)s",
            "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
            "pk": "pk_%(table_name)s",
        }
    )


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    Dependency function that yields database sessions.
    
    Yields:
        AsyncSession: Database session
    """
    async with async_session_maker() as session:
        try:
            yield session
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def init_db() -> None:
    """
    Initialize database and create tables.
    """
    try:
        # Import all models to ensure they are registered with SQLAlchemy
        from app.models import (
            user, dataset, application, document, chat, model, workflow, mcp
        )
        
        logger.info("Initializing database...")
        
        # Create all tables
        async with engine.begin() as conn:
            await conn.execute(text('CREATE EXTENSION IF NOT EXISTS vector'))
            await conn.run_sync(Base.metadata.create_all)
            
        logger.info("Database initialized successfully")
        
    except Exception as e:
        logger.error(f"Failed to initialize database: {e}")
        raise


async def close_db() -> None:
    """
    Close database connections.
    """
    await engine.dispose()
    logger.info("Database connections closed") 