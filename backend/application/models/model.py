from sqlalchemy import Column, String, ForeignKey, Text, JSON, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.ext.declarative import declarative_base
import uuid

Base = declarative_base()

class Model(Base):
    __tablename__ = "models"
    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(128))
    status = Column(String(20), default="SUCCESS")
    model_type = Column(String(128))
    model_name = Column(String(128))
    user_id = Column(PG_UUID(as_uuid=True), ForeignKey("users.id"))
    provider = Column(String(128))
    credential = Column(Text)
    meta = Column(JSON)
    model_params_form = Column(JSON)
    workspace_id = Column(String(64), default="default")
    __table_args__ = (UniqueConstraint('name', 'workspace_id', name='_name_workspace_uc'),)
