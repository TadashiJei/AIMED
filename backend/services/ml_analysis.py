import torch
import torchvision.transforms as transforms
from PIL import Image
import io
import numpy as np
from typing import Dict, List, Tuple
import tensorflow as tf
from tensorflow.keras.applications import DenseNet121
from tensorflow.keras.applications.densenet import preprocess_input
import cv2
from fastapi import UploadFile
import os
import json

class MedicalImageAnalyzer:
    def __init__(self):
        # Initialize models
        self.xray_model = self._load_xray_model()
        self.skin_model = self._load_skin_model()
        self.mri_model = self._load_mri_model()
        
        # Load disease labels
        self.disease_labels = self._load_disease_labels()
        
        # Image preprocessing
        self.transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
        ])

    def _load_xray_model(self):
        """Load pre-trained model for X-ray analysis"""
        model = DenseNet121(weights=None, include_top=True, classes=14)
        model.load_weights('models/xray_model.h5')  # You'll need to provide the model weights
        return model

    def _load_skin_model(self):
        """Load pre-trained model for skin lesion analysis"""
        model = torch.hub.load('pytorch/vision:v0.10.0', 'densenet121', pretrained=True)
        model.load_state_dict(torch.load('models/skin_model.pth'))  # You'll need to provide the model weights
        return model

    def _load_mri_model(self):
        """Load pre-trained model for MRI analysis"""
        model = DenseNet121(weights=None, include_top=True, classes=8)
        model.load_weights('models/mri_model.h5')  # You'll need to provide the model weights
        return model

    def _load_disease_labels(self) -> Dict[str, List[str]]:
        """Load disease labels for each type of analysis"""
        with open('models/disease_labels.json', 'r') as f:
            return json.load(f)

    async def analyze_xray(self, image: UploadFile) -> Dict[str, float]:
        """Analyze chest X-ray images for various conditions"""
        try:
            # Read and preprocess image
            contents = await image.read()
            img = Image.open(io.BytesIO(contents)).convert('RGB')
            img = img.resize((224, 224))
            img_array = np.array(img)
            img_array = preprocess_input(img_array)
            img_array = np.expand_dims(img_array, axis=0)

            # Get predictions
            predictions = self.xray_model.predict(img_array)[0]
            
            # Map predictions to diseases
            results = {}
            for disease, prob in zip(self.disease_labels['xray'], predictions):
                if prob > 0.2:  # Only include significant probabilities
                    results[disease] = float(prob)
            
            return results
        except Exception as e:
            print(f"Error analyzing X-ray: {str(e)}")
            raise

    async def analyze_skin_lesion(self, image: UploadFile) -> Dict[str, float]:
        """Analyze skin lesions for various conditions"""
        try:
            # Read and preprocess image
            contents = await image.read()
            img = Image.open(io.BytesIO(contents)).convert('RGB')
            img_tensor = self.transform(img)
            img_tensor = img_tensor.unsqueeze(0)

            # Get predictions
            with torch.no_grad():
                predictions = torch.nn.functional.softmax(self.skin_model(img_tensor), dim=1)[0]
            
            # Map predictions to conditions
            results = {}
            for condition, prob in zip(self.disease_labels['skin'], predictions):
                if prob > 0.2:
                    results[condition] = float(prob)
            
            return results
        except Exception as e:
            print(f"Error analyzing skin lesion: {str(e)}")
            raise

    async def analyze_mri(self, image: UploadFile) -> Dict[str, float]:
        """Analyze MRI scans for various conditions"""
        try:
            # Read and preprocess image
            contents = await image.read()
            img = Image.open(io.BytesIO(contents)).convert('RGB')
            img = img.resize((224, 224))
            img_array = np.array(img)
            img_array = preprocess_input(img_array)
            img_array = np.expand_dims(img_array, axis=0)

            # Get predictions
            predictions = self.mri_model.predict(img_array)[0]
            
            # Map predictions to conditions
            results = {}
            for condition, prob in zip(self.disease_labels['mri'], predictions):
                if prob > 0.2:
                    results[condition] = float(prob)
            
            return results
        except Exception as e:
            print(f"Error analyzing MRI: {str(e)}")
            raise

    async def get_risk_assessment(self, analysis_results: Dict[str, float]) -> Dict[str, any]:
        """Generate risk assessment based on analysis results"""
        high_risk_threshold = 0.7
        medium_risk_threshold = 0.4

        risks = {
            "high": [],
            "medium": [],
            "low": []
        }

        for condition, probability in analysis_results.items():
            if probability >= high_risk_threshold:
                risks["high"].append({
                    "condition": condition,
                    "probability": probability,
                    "recommendation": self._get_recommendation(condition)
                })
            elif probability >= medium_risk_threshold:
                risks["medium"].append({
                    "condition": condition,
                    "probability": probability,
                    "recommendation": self._get_recommendation(condition)
                })
            else:
                risks["low"].append({
                    "condition": condition,
                    "probability": probability
                })

        return {
            "risk_levels": risks,
            "summary": self._generate_risk_summary(risks),
            "immediate_actions": self._get_immediate_actions(risks)
        }

    def _get_recommendation(self, condition: str) -> str:
        """Get medical recommendations for a specific condition"""
        # This would be replaced with actual medical recommendations
        recommendations = {
            "pneumonia": "Consult a pulmonologist for detailed examination",
            "melanoma": "Schedule an immediate appointment with a dermatologist",
            "brain_tumor": "Urgent consultation with a neurologist required"
            # Add more recommendations as needed
        }
        return recommendations.get(condition, "Consult with a medical professional for proper evaluation")

    def _generate_risk_summary(self, risks: Dict) -> str:
        """Generate a summary of the risk assessment"""
        high_risk_count = len(risks["high"])
        medium_risk_count = len(risks["medium"])
        
        if high_risk_count > 0:
            return f"Urgent medical attention recommended. {high_risk_count} high-risk conditions detected."
        elif medium_risk_count > 0:
            return f"Medical consultation recommended. {medium_risk_count} medium-risk conditions detected."
        return "No significant risks detected. Continue regular health monitoring."

    def _get_immediate_actions(self, risks: Dict) -> List[str]:
        """Generate list of immediate actions based on risks"""
        actions = []
        if risks["high"]:
            actions.append("Schedule immediate consultation with a specialist")
            actions.append("Prepare complete medical history for review")
        elif risks["medium"]:
            actions.append("Schedule follow-up examination within 2 weeks")
            actions.append("Monitor symptoms and document any changes")
        else:
            actions.append("Continue regular health check-ups")
            actions.append("Maintain healthy lifestyle practices")
        return actions
