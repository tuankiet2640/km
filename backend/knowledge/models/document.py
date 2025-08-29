from sqlalchemy import Column, String, ForeignKey, Integer
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.ext.declarative import declarative_base
import uuid

Base = declarative_base()

class Document(Base):
    __tablename__ = "documents"
    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    knowledge_id = Column(PG_UUID(as_uuid=True), ForeignKey("knowledges.id"))
    name = Column(String(150))
    char_length = Column(Integer)
    status = Column(String(20), default="")
