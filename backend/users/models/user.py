from sqlalchemy import Column, String, Boolean, TIMESTAMP, UUID
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.ext.declarative import declarative_base
import uuid

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True)
    phone = Column(String(20))
    nick_name = Column(String(150), unique=True)
    username = Column(String(150), unique=True)
    password = Column(String(150))
    role = Column(String(150))
    source = Column(String(10), default="LOCAL")
    is_active = Column(Boolean, default=True)
    language = Column(String(10))
    create_time = Column(TIMESTAMP, default="now()")
    update_time = Column(TIMESTAMP, default="now()")
