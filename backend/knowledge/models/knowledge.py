from sqlalchemy import Column, String, ForeignKey, Integer, JSON
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.ext.declarative import declarative_base
import uuid

Base = declarative_base()

class Knowledge(Base):
    __tablename__ = "knowledges"
    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(150))
    workspace_id = Column(String(64), default="default")
    description = Column(String(256))
    user_id = Column(PG_UUID(as_uuid=True), ForeignKey("users.id"))
    type = Column(Integer, default=0)
    scope = Column(String(20), default="WORKSPACE")
    folder_id = Column(String(64), ForeignKey("knowledgefolders.id"))
    embedding_model_id = Column(PG_UUID(as_uuid=True), ForeignKey("models.id"))
    file_size_limit = Column(Integer, default=100)
    file_count_limit = Column(Integer, default=50)
    meta = Column(JSON)
