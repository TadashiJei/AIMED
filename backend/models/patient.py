from sqlalchemy import Column, Integer, String, Float, ForeignKey, Text
from sqlalchemy.orm import relationship
from .database import Base

class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    occupation = Column(String(100))
    blood_type = Column(String(10))
    height = Column(Float)  # in cm
    weight = Column(Float)  # in kg
    emergency_contact_name = Column(String(100))
    emergency_contact_number = Column(String(20))
    insurance_provider = Column(String(100))
    insurance_policy_number = Column(String(50))
    allergies = Column(Text)  # Stored as comma-separated values
    current_medications = Column(Text)  # Stored as comma-separated values
    medical_conditions = Column(Text)  # Stored as comma-separated values

    # Relationships
    user = relationship("User", back_populates="patient")
    vitals = relationship("PatientVitals", back_populates="patient")
    appointments = relationship("Appointment", back_populates="patient")
