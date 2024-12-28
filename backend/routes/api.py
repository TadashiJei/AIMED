from fastapi import APIRouter, HTTPException, Depends
from typing import List
from datetime import datetime
from pydantic import BaseModel

router = APIRouter()

# Models
class HealthMetric(BaseModel):
    date: str
    bloodPressure: int
    heartRate: int
    bloodSugar: int

class Report(BaseModel):
    id: int
    title: str
    date: str
    type: str
    status: str
    insights: List[str]

class MedicalRecord(BaseModel):
    id: int
    title: str
    type: str
    date: str
    status: str
    tags: List[str]

# Mock data
health_metrics = [
    {
        "date": "2023-12-01",
        "bloodPressure": 120,
        "heartRate": 75,
        "bloodSugar": 95,
    },
    {
        "date": "2023-12-07",
        "bloodPressure": 118,
        "heartRate": 72,
        "bloodSugar": 92,
    },
    {
        "date": "2023-12-14",
        "bloodPressure": 122,
        "heartRate": 78,
        "bloodSugar": 98,
    },
    {
        "date": "2023-12-21",
        "bloodPressure": 119,
        "heartRate": 73,
        "bloodSugar": 94,
    },
    {
        "date": "2023-12-28",
        "bloodPressure": 121,
        "heartRate": 74,
        "bloodSugar": 96,
    },
]

reports = [
    {
        "id": 1,
        "title": "Monthly Health Analysis",
        "date": "2023-12-28",
        "type": "Comprehensive",
        "status": "Completed",
        "insights": [
            "Blood pressure remains stable",
            "Heart rate shows improvement",
            "Blood sugar levels are well controlled",
        ],
    },
    {
        "id": 2,
        "title": "Quarterly Health Trends",
        "date": "2023-12-15",
        "type": "Quarterly Review",
        "status": "Completed",
        "insights": [
            "Overall health metrics show positive trends",
            "Exercise routine is effective",
            "Diet adjustments recommended",
        ],
    },
]

medical_records = [
    {
        "id": 1,
        "title": "Annual Physical Examination",
        "type": "Examination",
        "date": "2023-12-28",
        "status": "Reviewed",
        "tags": ["Physical", "Annual"],
    },
    {
        "id": 2,
        "title": "Blood Test Results",
        "type": "Laboratory",
        "date": "2023-12-15",
        "status": "Pending",
        "tags": ["Blood Work", "Lab Results"],
    },
]

# API Endpoints
@router.get("/health-metrics", response_model=List[HealthMetric])
async def get_health_metrics():
    return health_metrics

@router.get("/health-metrics/latest")
async def get_latest_metrics():
    return health_metrics[-1] if health_metrics else None

@router.post("/health-metrics")
async def add_health_metric(metric: HealthMetric):
    health_metrics.append(metric.dict())
    return {"message": "Metric added successfully"}

@router.get("/reports", response_model=List[Report])
async def get_reports():
    return reports

@router.get("/reports/{report_id}", response_model=Report)
async def get_report(report_id: int):
    report = next((r for r in reports if r["id"] == report_id), None)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return report

@router.get("/medical-records", response_model=List[MedicalRecord])
async def get_medical_records():
    return medical_records

@router.get("/medical-records/{record_id}", response_model=MedicalRecord)
async def get_medical_record(record_id: int):
    record = next((r for r in medical_records if r["id"] == record_id), None)
    if not record:
        raise HTTPException(status_code=404, detail="Medical record not found")
    return record

@router.post("/medical-records")
async def add_medical_record(record: MedicalRecord):
    medical_records.append(record.dict())
    return {"message": "Medical record added successfully"}
