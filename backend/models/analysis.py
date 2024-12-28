from sqlalchemy import Column, String, DateTime, JSON, ForeignKey
from sqlalchemy.orm import relationship
from backend.database.db import Base
from datetime import datetime
from pydantic import BaseModel
from typing import Dict, Optional, Any

class Analysis(Base):
    __tablename__ = "analyses"

    id = Column(String, primary_key=True, index=True)
    patient_id = Column(String, ForeignKey("users.id"))
    doctor_id = Column(String, ForeignKey("users.id"))
    analysis_type = Column(String)  # 'xray', 'skin', 'mri'
    priority = Column(String)  # 'low', 'medium', 'high'
    notes = Column(String)
    results = Column(JSON)  # Store analysis results
    risk_assessment = Column(JSON)  # Store risk assessment
    status = Column(String)  # 'pending', 'processing', 'completed', 'failed'
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)

    # Relationships
    patient = relationship("User", foreign_keys=[patient_id])
    doctor = relationship("User", foreign_keys=[doctor_id])

class AnalysisCreate(BaseModel):
    patient_id: str
    analysis_type: str
    priority: str
    notes: Optional[str] = None

class AnalysisResponse(BaseModel):
    id: str
    patient_id: str
    doctor_id: str
    analysis_type: str
    priority: str
    notes: Optional[str]
    results: Dict[str, Any]
    risk_assessment: Dict[str, Any]
    status: str
    created_at: datetime
    completed_at: Optional[datetime]

    class Config:
        from_attributes = True
