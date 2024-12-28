from azure.storage.blob import BlobServiceClient
from azure.iot.hub import IoTHubRegistryManager
from azure.iot.hub.models import Twin, TwinProperties
from typing import Dict, List, Any
import json
from datetime import datetime, timedelta
import asyncio
from fastapi import WebSocket
import os
from sqlalchemy.orm import Session
from ..models.patient_vitals import PatientVitalsThreshold, VitalsReading, DEFAULT_THRESHOLDS
import numpy as np
from scipy import stats
import pandas as pd

class WearableDataService:
    def __init__(self, db: Session):
        # Azure IoT Hub connection
        self.iothub_connection_str = os.getenv("AZURE_IOTHUB_CONNECTION_STRING")
        self.registry_manager = IoTHubRegistryManager(self.iothub_connection_str)
        self.db = db

        # Azure Blob Storage for historical data
        self.blob_connection_str = os.getenv("AZURE_STORAGE_CONNECTION_STRING")
        self.blob_service_client = BlobServiceClient.from_connection_string(self.blob_connection_str)
        self.container_name = "wearable-data"

    async def register_device(self, user_id: str, device_info: Dict[str, Any]) -> str:
        """Register an Apple Watch device with Azure IoT Hub"""
        try:
            # Create device identity
            device_id = f"apple-watch-{user_id}"
            device = self.registry_manager.create_device_with_sas(device_id)

            # Store device info in blob storage
            device_info.update({
                "registration_date": datetime.utcnow().isoformat(),
                "user_id": user_id
            })
            
            blob_client = self.blob_service_client.get_blob_client(
                container=self.container_name,
                blob=f"devices/{device_id}/info.json"
            )
            blob_client.upload_blob(json.dumps(device_info))

            return device.authentication.symmetric_key.primary_key
        except Exception as e:
            print(f"Error registering device: {str(e)}")
            raise

    async def get_live_bp_data(self, user_id: str) -> Dict[str, Any]:
        """Get live blood pressure data from Apple Watch"""
        try:
            device_id = f"apple-watch-{user_id}"
            twin = self.registry_manager.get_twin(device_id)
            
            # Get latest BP reading from device twin
            reported_properties = twin.properties.reported
            if "vitals" in reported_properties:
                return {
                    "systolic": reported_properties["vitals"]["bp_systolic"],
                    "diastolic": reported_properties["vitals"]["bp_diastolic"],
                    "timestamp": reported_properties["vitals"]["timestamp"],
                    "heart_rate": reported_properties["vitals"]["heart_rate"]
                }
            return None
        except Exception as e:
            print(f"Error getting BP data: {str(e)}")
            raise

    async def start_bp_monitoring(self, user_id: str, websocket: WebSocket):
        """Start real-time BP monitoring through WebSocket"""
        try:
            device_id = f"apple-watch-{user_id}"
            await websocket.accept()

            while True:
                # Get latest BP data
                bp_data = await self.get_live_bp_data(user_id)
                if bp_data:
                    # Send data through WebSocket
                    await websocket.send_json(bp_data)

                # Check for abnormal readings
                if bp_data and self._is_bp_abnormal(bp_data):
                    await self._handle_abnormal_bp(user_id, bp_data)

                # Wait for 30 seconds before next reading
                await asyncio.sleep(30)

        except Exception as e:
            print(f"Error in BP monitoring: {str(e)}")
            if websocket.client_state.CONNECTED:
                await websocket.close()

    def _is_bp_abnormal(self, bp_data: Dict[str, Any]) -> bool:
        """Check if BP reading is abnormal"""
        systolic = bp_data["systolic"]
        diastolic = bp_data["diastolic"]

        # Define BP thresholds
        if systolic > 140 or systolic < 90 or diastolic > 90 or diastolic < 60:
            return True
        return False

    async def _handle_abnormal_bp(self, user_id: str, bp_data: Dict[str, Any]):
        """Handle abnormal BP readings with enhanced analytics"""
        # Get patient's thresholds
        threshold = self.db.query(PatientVitalsThreshold).filter(
            PatientVitalsThreshold.patient_id == user_id
        ).first()

        if not threshold:
            # Use default thresholds based on patient condition
            patient = self.db.query(User).filter(User.id == user_id).first()
            condition = patient.medical_condition or "normal"
            threshold_values = DEFAULT_THRESHOLDS.get(condition, DEFAULT_THRESHOLDS["normal"])
        else:
            threshold_values = {
                "systolic_max": threshold.systolic_max,
                "systolic_min": threshold.systolic_min,
                "diastolic_max": threshold.diastolic_max,
                "diastolic_min": threshold.diastolic_min,
                "heart_rate_max": threshold.heart_rate_max,
                "heart_rate_min": threshold.heart_rate_min
            }

        # Analyze severity
        severity = self._calculate_severity(bp_data, threshold_values)
        
        # Store reading with context
        reading = VitalsReading(
            patient_id=user_id,
            device_id=f"apple-watch-{user_id}",
            timestamp=datetime.fromisoformat(bp_data["timestamp"]),
            systolic=bp_data["systolic"],
            diastolic=bp_data["diastolic"],
            heart_rate=bp_data["heart_rate"],
            alert_generated=True,
            alert_details={
                "severity": severity,
                "threshold_exceeded": self._get_exceeded_thresholds(bp_data, threshold_values),
                "context": self._get_reading_context(bp_data)
            }
        )
        self.db.add(reading)
        self.db.commit()

        # Generate alert if needed
        if severity in ["high", "critical"]:
            await self._generate_alert(user_id, bp_data, severity, threshold)

    def _calculate_severity(self, bp_data: Dict[str, Any], thresholds: Dict[str, int]) -> str:
        """Calculate the severity of abnormal readings"""
        systolic = bp_data["systolic"]
        diastolic = bp_data["diastolic"]
        
        # Calculate percentage deviation from thresholds
        systolic_dev = max(
            abs(systolic - thresholds["systolic_max"]) / thresholds["systolic_max"],
            abs(systolic - thresholds["systolic_min"]) / thresholds["systolic_min"]
        ) if systolic > thresholds["systolic_max"] or systolic < thresholds["systolic_min"] else 0

        diastolic_dev = max(
            abs(diastolic - thresholds["diastolic_max"]) / thresholds["diastolic_max"],
            abs(diastolic - thresholds["diastolic_min"]) / thresholds["diastolic_min"]
        ) if diastolic > thresholds["diastolic_max"] or diastolic < thresholds["diastolic_min"] else 0

        max_deviation = max(systolic_dev, diastolic_dev)

        if max_deviation > 0.2:  # More than 20% deviation
            return "critical"
        elif max_deviation > 0.1:  # 10-20% deviation
            return "high"
        else:
            return "moderate"

    def _get_exceeded_thresholds(self, bp_data: Dict[str, Any], thresholds: Dict[str, int]) -> List[str]:
        """Identify which thresholds were exceeded"""
        exceeded = []
        if bp_data["systolic"] > thresholds["systolic_max"]:
            exceeded.append("high_systolic")
        if bp_data["systolic"] < thresholds["systolic_min"]:
            exceeded.append("low_systolic")
        if bp_data["diastolic"] > thresholds["diastolic_max"]:
            exceeded.append("high_diastolic")
        if bp_data["diastolic"] < thresholds["diastolic_min"]:
            exceeded.append("low_diastolic")
        if "heart_rate" in bp_data:
            if bp_data["heart_rate"] > thresholds["heart_rate_max"]:
                exceeded.append("high_heart_rate")
            if bp_data["heart_rate"] < thresholds["heart_rate_min"]:
                exceeded.append("low_heart_rate")
        return exceeded

    def _get_reading_context(self, bp_data: Dict[str, Any]) -> Dict[str, Any]:
        """Get contextual information for the reading"""
        return {
            "time_of_day": datetime.fromisoformat(bp_data["timestamp"]).strftime("%H:%M"),
            "activity": bp_data.get("activity_type", "unknown"),
            "location": bp_data.get("location", "unknown"),
            "ambient_temp": bp_data.get("ambient_temperature")
        }

    async def analyze_bp_patterns(self, user_id: str) -> Dict[str, Any]:
        """Analyze BP patterns and provide detailed insights"""
        # Get readings from last 30 days
        readings = self.db.query(VitalsReading).filter(
            VitalsReading.patient_id == user_id,
            VitalsReading.timestamp >= datetime.utcnow() - timedelta(days=30)
        ).all()

        if not readings:
            return None

        # Convert to pandas DataFrame for analysis
        df = pd.DataFrame([{
            'timestamp': r.timestamp,
            'systolic': r.systolic,
            'diastolic': r.diastolic,
            'heart_rate': r.heart_rate,
            'activity': r.activity_type,
            'time_of_day': r.timestamp.strftime("%H:%M")
        } for r in readings])

        # Time-based patterns
        df['hour'] = df['timestamp'].dt.hour
        morning_readings = df[df['hour'].between(6, 11)]
        evening_readings = df[df['hour'].between(17, 22)]

        # Activity-based patterns
        activity_patterns = df.groupby('activity').agg({
            'systolic': ['mean', 'std'],
            'diastolic': ['mean', 'std']
        }).to_dict()

        # Variability analysis
        systolic_variability = np.std(df['systolic'])
        diastolic_variability = np.std(df['diastolic'])

        # Correlation analysis
        hr_bp_corr = stats.pearsonr(df['heart_rate'], df['systolic'])[0]

        # Morning surge analysis
        if not morning_readings.empty and not evening_readings.empty:
            morning_surge = morning_readings['systolic'].mean() - evening_readings['systolic'].mean()
        else:
            morning_surge = None

        return {
            "time_patterns": {
                "morning_average": {
                    "systolic": morning_readings['systolic'].mean() if not morning_readings.empty else None,
                    "diastolic": morning_readings['diastolic'].mean() if not morning_readings.empty else None
                },
                "evening_average": {
                    "systolic": evening_readings['systolic'].mean() if not evening_readings.empty else None,
                    "diastolic": evening_readings['diastolic'].mean() if not evening_readings.empty else None
                },
                "morning_surge": morning_surge
            },
            "activity_patterns": activity_patterns,
            "variability": {
                "systolic": systolic_variability,
                "diastolic": diastolic_variability
            },
            "correlations": {
                "heart_rate_bp": hr_bp_corr
            },
            "risk_factors": self._analyze_risk_factors(df)
        }

    def _analyze_risk_factors(self, df: pd.DataFrame) -> List[Dict[str, Any]]:
        """Analyze potential risk factors from BP patterns"""
        risk_factors = []

        # High variability risk
        systolic_cv = np.std(df['systolic']) / np.mean(df['systolic'])
        if systolic_cv > 0.15:  # More than 15% coefficient of variation
            risk_factors.append({
                "type": "high_variability",
                "description": "High blood pressure variability detected",
                "severity": "moderate",
                "recommendation": "Consider more frequent monitoring and lifestyle modifications"
            })

        # Morning surge risk
        df['hour'] = df['timestamp'].dt.hour
        morning = df[df['hour'].between(6, 11)]['systolic'].mean()
        night = df[df['hour'].between(0, 5)]['systolic'].mean()
        if morning - night > 20:  # More than 20 mmHg surge
            risk_factors.append({
                "type": "morning_surge",
                "description": "Significant morning blood pressure surge detected",
                "severity": "high",
                "recommendation": "Consider adjusting medication timing and evening routine"
            })

        # Sustained elevation risk
        elevated_readings = len(df[df['systolic'] >= 140]) / len(df) * 100
        if elevated_readings > 30:  # More than 30% readings are elevated
            risk_factors.append({
                "type": "sustained_elevation",
                "description": "Sustained blood pressure elevation detected",
                "severity": "high",
                "recommendation": "Urgent medical review recommended"
            })

        return risk_factors

    async def get_historical_bp_data(
        self,
        user_id: str,
        start_date: datetime,
        end_date: datetime
    ) -> List[Dict[str, Any]]:
        """Get historical BP data from Azure Blob Storage"""
        try:
            container_client = self.blob_service_client.get_container_client(self.container_name)
            blobs = container_client.list_blobs(name_starts_with=f"data/{user_id}/")
            
            bp_data = []
            for blob in blobs:
                blob_client = container_client.get_blob_client(blob)
                data = json.loads(blob_client.download_blob().readall())
                
                # Filter by date range
                timestamp = datetime.fromisoformat(data["timestamp"])
                if start_date <= timestamp <= end_date:
                    bp_data.append(data)
            
            return sorted(bp_data, key=lambda x: x["timestamp"])
        except Exception as e:
            print(f"Error getting historical BP data: {str(e)}")
            raise

    async def analyze_bp_trends(self, user_id: str) -> Dict[str, Any]:
        """Analyze BP trends over time"""
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=30)  # Last 30 days
        
        bp_data = await self.get_historical_bp_data(user_id, start_date, end_date)
        
        if not bp_data:
            return None

        # Calculate averages and trends
        systolic_values = [reading["systolic"] for reading in bp_data]
        diastolic_values = [reading["diastolic"] for reading in bp_data]
        
        analysis = {
            "average_systolic": sum(systolic_values) / len(systolic_values),
            "average_diastolic": sum(diastolic_values) / len(diastolic_values),
            "max_systolic": max(systolic_values),
            "max_diastolic": max(diastolic_values),
            "min_systolic": min(systolic_values),
            "min_diastolic": min(diastolic_values),
            "readings_count": len(bp_data),
            "abnormal_readings": sum(1 for reading in bp_data if self._is_bp_abnormal(reading)),
            "trend": self._calculate_bp_trend(bp_data)
        }
        
        return analysis

    def _calculate_bp_trend(self, bp_data: List[Dict[str, Any]]) -> str:
        """Calculate BP trend direction"""
        if len(bp_data) < 2:
            return "insufficient_data"

        # Calculate trend using last 5 readings
        recent_readings = sorted(bp_data[-5:], key=lambda x: x["timestamp"])
        
        first_systolic = recent_readings[0]["systolic"]
        last_systolic = recent_readings[-1]["systolic"]
        
        if last_systolic - first_systolic > 5:
            return "increasing"
        elif first_systolic - last_systolic > 5:
            return "decreasing"
        return "stable"
