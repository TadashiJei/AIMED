from sqlalchemy import Column, String, Integer, Float, JSON, ForeignKey, DateTime, Boolean
from sqlalchemy.orm import relationship
from ..database import Base
from datetime import datetime
from typing import Dict, List, Optional
from pydantic import BaseModel

class PatientVitalsThreshold(Base):
    __tablename__ = "patient_vitals_thresholds"

    id = Column(String, primary_key=True)
    patient_id = Column(String, ForeignKey("users.id"))
    condition = Column(String)  # e.g., "hypertension", "diabetes", "pregnancy"
    
    # BP Thresholds
    systolic_max = Column(Integer)
    systolic_min = Column(Integer)
    diastolic_max = Column(Integer)
    diastolic_min = Column(Integer)
    
    # Heart Rate Thresholds
    heart_rate_max = Column(Integer)
    heart_rate_min = Column(Integer)
    
    # Additional Thresholds
    oxygen_saturation_min = Column(Integer)
    temperature_max = Column(Float)
    
    # Alert Settings
    alert_frequency = Column(Integer)  # minutes between alerts
    alert_methods = Column(JSON)  # ["email", "sms", "push"]
    alert_recipients = Column(JSON)  # List of healthcare provider IDs
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    patient = relationship("User", foreign_keys=[patient_id])

class VitalsReading(Base):
    __tablename__ = "vitals_readings"

    id = Column(String, primary_key=True)
    patient_id = Column(String, ForeignKey("users.id"))
    device_id = Column(String)
    timestamp = Column(DateTime)
    
    # Vital Signs
    systolic = Column(Integer)
    diastolic = Column(Integer)
    heart_rate = Column(Integer)
    oxygen_saturation = Column(Integer, nullable=True)
    temperature = Column(Float, nullable=True)
    
    # Activity Context
    activity_type = Column(String, nullable=True)  # "resting", "walking", "exercising"
    steps_count = Column(Integer, nullable=True)
    
    # Environmental Context
    location = Column(String, nullable=True)
    ambient_temperature = Column(Float, nullable=True)
    
    # Alert Status
    alert_generated = Column(Boolean, default=False)
    alert_details = Column(JSON, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    patient = relationship("User", foreign_keys=[patient_id])

# Pydantic Models for API
class ThresholdCreate(BaseModel):
    condition: str
    systolic_max: int
    systolic_min: int
    diastolic_max: int
    diastolic_min: int
    heart_rate_max: int
    heart_rate_min: int
    oxygen_saturation_min: Optional[int] = None
    temperature_max: Optional[float] = None
    alert_frequency: int
    alert_methods: List[str]
    alert_recipients: List[str]

class ThresholdUpdate(BaseModel):
    condition: Optional[str]
    systolic_max: Optional[int]
    systolic_min: Optional[int]
    diastolic_max: Optional[int]
    diastolic_min: Optional[int]
    heart_rate_max: Optional[int]
    heart_rate_min: Optional[int]
    oxygen_saturation_min: Optional[int]
    temperature_max: Optional[float]
    alert_frequency: Optional[int]
    alert_methods: Optional[List[str]]
    alert_recipients: Optional[List[str]]

class VitalsReadingCreate(BaseModel):
    device_id: str
    timestamp: datetime
    systolic: int
    diastolic: int
    heart_rate: int
    oxygen_saturation: Optional[int]
    temperature: Optional[float]
    activity_type: Optional[str]
    steps_count: Optional[int]
    location: Optional[str]
    ambient_temperature: Optional[float]

# Predefined condition thresholds
DEFAULT_THRESHOLDS = {
    "normal": {
        "systolic_max": 130,
        "systolic_min": 90,
        "diastolic_max": 85,
        "diastolic_min": 60,
        "heart_rate_max": 100,
        "heart_rate_min": 60
    },
    "hypertension": {
        "systolic_max": 140,
        "systolic_min": 90,
        "diastolic_max": 90,
        "diastolic_min": 60,
        "heart_rate_max": 100,
        "heart_rate_min": 60
    },
    "pregnancy": {
        "systolic_max": 135,
        "systolic_min": 90,
        "diastolic_max": 85,
        "diastolic_min": 60,
        "heart_rate_max": 110,
        "heart_rate_min": 60
    },
    "elderly": {
        "systolic_max": 135,
        "systolic_min": 95,
        "diastolic_max": 85,
        "diastolic_min": 65,
        "heart_rate_max": 90,
        "heart_rate_min": 55
    },
    "diabetes": {
        "systolic_max": 130,
        "systolic_min": 90,
        "diastolic_max": 80,
        "diastolic_min": 60,
        "heart_rate_max": 100,
        "heart_rate_min": 60
    },
    "athlete": {
        "systolic_max": 140,
        "systolic_min": 85,
        "diastolic_max": 90,
        "diastolic_min": 55,
        "heart_rate_max": 120,
        "heart_rate_min": 40
    }
}
