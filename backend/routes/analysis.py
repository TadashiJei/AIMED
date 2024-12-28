from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from typing import List
from ..services.ml_analysis import MedicalImageAnalyzer
from ..auth.jwt import get_current_user
from ..models.user import User
from ..models.analysis import Analysis, AnalysisCreate
from sqlalchemy.orm import Session
from ..database import get_db
import uuid
from datetime import datetime

router = APIRouter()
analyzer = MedicalImageAnalyzer()

@router.post("/analysis")
async def create_analysis(
    files: List[UploadFile] = File(...),
    patient_id: str = Form(...),
    analysis_type: str = Form(...),
    priority: str = Form(...),
    notes: str = Form(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new analysis request with AI-powered image processing"""
    
    if current_user.role not in ['doctor', 'admin']:
        raise HTTPException(status_code=403, detail="Only doctors can create analysis requests")
    
    try:
        # Initialize analysis results
        analysis_results = {}
        
        # Process each uploaded file
        for file in files:
            # Analyze based on type
            if analysis_type == 'xray':
                results = await analyzer.analyze_xray(file)
            elif analysis_type == 'skin':
                results = await analyzer.analyze_skin_lesion(file)
            elif analysis_type == 'mri':
                results = await analyzer.analyze_mri(file)
            else:
                raise HTTPException(status_code=400, detail="Unsupported analysis type")
            
            # Merge results
            analysis_results[file.filename] = results
        
        # Get risk assessment
        risk_assessment = await analyzer.get_risk_assessment(analysis_results[files[0].filename])
        
        # Create analysis record
        analysis = Analysis(
            id=str(uuid.uuid4()),
            patient_id=patient_id,
            doctor_id=current_user.id,
            analysis_type=analysis_type,
            priority=priority,
            notes=notes,
            results=analysis_results,
            risk_assessment=risk_assessment,
            status="completed",
            created_at=datetime.utcnow()
        )
        
        # Save to database
        db.add(analysis)
        db.commit()
        db.refresh(analysis)
        
        return {
            "analysis_id": analysis.id,
            "results": analysis_results,
            "risk_assessment": risk_assessment
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/analysis/{analysis_id}")
async def get_analysis(
    analysis_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get analysis results by ID"""
    
    analysis = db.query(Analysis).filter(Analysis.id == analysis_id).first()
    
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")
    
    # Check permissions
    if current_user.role == 'patient' and analysis.patient_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this analysis")
    
    return analysis

@router.get("/analysis/patient/{patient_id}")
async def get_patient_analyses(
    patient_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all analyses for a patient"""
    
    # Check permissions
    if current_user.role == 'patient' and patient_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view these analyses")
    
    analyses = db.query(Analysis).filter(Analysis.patient_id == patient_id).all()
    return analyses

@router.get("/analysis/doctor/{doctor_id}")
async def get_doctor_analyses(
    doctor_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all analyses created by a doctor"""
    
    # Check permissions
    if current_user.role == 'doctor' and doctor_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view these analyses")
    
    analyses = db.query(Analysis).filter(Analysis.doctor_id == doctor_id).all()
    return analyses
