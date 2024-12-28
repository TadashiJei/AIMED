from typing import Dict, List, Any
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func
from ..models.analysis import Analysis
from ..models.appointment import Appointment
from ..models.user import User

class HealthInsightsService:
    def __init__(self, db: Session):
        self.db = db

    def get_health_trends(self, user_id: str) -> Dict[str, Any]:
        """Analyze health trends based on historical data"""
        
        # Get all analyses for the user
        analyses = self.db.query(Analysis).filter(
            Analysis.patient_id == user_id
        ).order_by(Analysis.created_at.desc()).all()

        # Extract conditions and their probabilities over time
        conditions_over_time = {}
        for analysis in analyses:
            for result in analysis.results.values():
                for condition, probability in result.items():
                    if condition not in conditions_over_time:
                        conditions_over_time[condition] = []
                    conditions_over_time[condition].append({
                        'date': analysis.created_at,
                        'probability': probability
                    })

        # Calculate trend direction for each condition
        trends = {}
        for condition, data in conditions_over_time.items():
            if len(data) > 1:
                # Sort by date
                sorted_data = sorted(data, key=lambda x: x['date'])
                # Calculate trend
                first_prob = sorted_data[0]['probability']
                last_prob = sorted_data[-1]['probability']
                trend = 'improving' if last_prob < first_prob else 'worsening' if last_prob > first_prob else 'stable'
                change = abs(last_prob - first_prob)
                
                trends[condition] = {
                    'trend': trend,
                    'change': change,
                    'current_value': last_prob,
                    'historical_data': sorted_data
                }

        return trends

    def get_risk_factors(self, user_id: str) -> List[Dict[str, Any]]:
        """Identify potential risk factors based on analysis results"""
        
        # Get recent analyses
        recent_analyses = self.db.query(Analysis).filter(
            Analysis.patient_id == user_id,
            Analysis.created_at >= datetime.utcnow() - timedelta(days=90)
        ).all()

        risk_factors = []
        for analysis in recent_analyses:
            if analysis.risk_assessment:
                for risk_level, risks in analysis.risk_assessment['risk_levels'].items():
                    for risk in risks:
                        risk_factors.append({
                            'condition': risk['condition'],
                            'probability': risk['probability'],
                            'severity': risk_level,
                            'detected_at': analysis.created_at,
                            'recommendation': risk.get('recommendation', '')
                        })

        # Sort by probability and severity
        risk_factors.sort(key=lambda x: (
            {'high': 3, 'medium': 2, 'low': 1}[x['severity']],
            x['probability']
        ), reverse=True)

        return risk_factors

    def get_personalized_recommendations(self, user_id: str) -> List[Dict[str, str]]:
        """Generate personalized health recommendations"""
        
        recommendations = []
        risk_factors = self.get_risk_factors(user_id)
        health_trends = self.get_health_trends(user_id)

        # Add recommendations based on risk factors
        for risk in risk_factors:
            if risk['severity'] in ['high', 'medium']:
                recommendations.append({
                    'type': 'risk_mitigation',
                    'priority': 'high' if risk['severity'] == 'high' else 'medium',
                    'message': f"Monitor {risk['condition']} closely. {risk['recommendation']}"
                })

        # Add recommendations based on trends
        for condition, trend_data in health_trends.items():
            if trend_data['trend'] == 'worsening' and trend_data['change'] > 0.1:
                recommendations.append({
                    'type': 'trend_alert',
                    'priority': 'high',
                    'message': f"Increasing trend detected for {condition}. Consider scheduling a check-up."
                })

        # Add preventive care recommendations
        last_appointment = self.db.query(Appointment).filter(
            Appointment.patient_id == user_id
        ).order_by(Appointment.scheduled_time.desc()).first()

        if not last_appointment or (datetime.utcnow() - last_appointment.scheduled_time).days > 180:
            recommendations.append({
                'type': 'preventive_care',
                'priority': 'medium',
                'message': "It's been over 6 months since your last check-up. Consider scheduling a routine examination."
            })

        return recommendations

    def get_health_summary(self, user_id: str) -> Dict[str, Any]:
        """Generate a comprehensive health summary"""
        
        risk_factors = self.get_risk_factors(user_id)
        health_trends = self.get_health_trends(user_id)
        recommendations = self.get_personalized_recommendations(user_id)

        # Calculate overall health score
        health_score = self._calculate_health_score(risk_factors, health_trends)

        # Generate action items
        action_items = self._generate_action_items(risk_factors, recommendations)

        return {
            'health_score': health_score,
            'risk_factors': risk_factors,
            'health_trends': health_trends,
            'recommendations': recommendations,
            'action_items': action_items,
            'last_updated': datetime.utcnow()
        }

    def _calculate_health_score(self, risk_factors: List[Dict], health_trends: Dict) -> float:
        """Calculate an overall health score based on various factors"""
        
        base_score = 100.0
        
        # Deduct points for risk factors
        risk_deductions = {
            'high': 15.0,
            'medium': 10.0,
            'low': 5.0
        }
        
        for risk in risk_factors:
            base_score -= risk_deductions[risk['severity']] * risk['probability']

        # Adjust for trends
        for trend_data in health_trends.values():
            if trend_data['trend'] == 'improving':
                base_score += 2.0
            elif trend_data['trend'] == 'worsening':
                base_score -= 2.0

        # Ensure score stays within 0-100 range
        return max(0.0, min(100.0, base_score))

    def _generate_action_items(
        self,
        risk_factors: List[Dict],
        recommendations: List[Dict]
    ) -> List[Dict[str, str]]:
        """Generate specific action items based on risks and recommendations"""
        
        action_items = []

        # Add high-priority actions from risk factors
        for risk in risk_factors:
            if risk['severity'] == 'high':
                action_items.append({
                    'priority': 'high',
                    'action': f"Schedule consultation for {risk['condition']}",
                    'deadline': 'Within 1 week'
                })

        # Add actions from recommendations
        for rec in recommendations:
            if rec['priority'] == 'high':
                action_items.append({
                    'priority': 'high',
                    'action': rec['message'],
                    'deadline': 'Within 2 weeks'
                })
            elif rec['priority'] == 'medium':
                action_items.append({
                    'priority': 'medium',
                    'action': rec['message'],
                    'deadline': 'Within 1 month'
                })

        return sorted(action_items, key=lambda x: {'high': 0, 'medium': 1, 'low': 2}[x['priority']])
