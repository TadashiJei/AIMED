from sqlalchemy import Column, String, DateTime, JSON, ForeignKey
from sqlalchemy.orm import relationship
from backend.database.db import Base
from datetime import datetime
from pydantic import BaseModel
from typing import Optional

class Report(Base):
    __tablename__ = "reports"

    id = Column(String, primary_key=True, index=True)
    title = Column(String, nullable=False)
    type = Column(String, nullable=False)  # 'patient-summary', 'staff-activity', 'system-health'
    status = Column(String, nullable=False)  # 'processing', 'completed', 'failed'
    download_url = Column(String, nullable=True)
    generated_by = Column(String, ForeignKey("users.id"))
    data = Column(JSON, nullable=True)
    error = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)

    # Relationships
    admin = relationship("User", foreign_keys=[generated_by])

class ReportResponse(BaseModel):
    id: str
    title: str
    type: str
    status: str
    download_url: Optional[str]
    generated_by: str
    created_at: datetime
    completed_at: Optional[datetime]
    error: Optional[str]

    class Config:
        from_attributes = True
