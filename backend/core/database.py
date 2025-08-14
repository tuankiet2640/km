from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from backend.core.config import settings

engine = create_engine(str(settings.SQLALCHEMY_DATABASE_URI))
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass

# Dependency for FastAPI
from typing import Generator
def get_db() -> Generator:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
