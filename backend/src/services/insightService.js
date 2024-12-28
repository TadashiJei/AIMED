// Helper function to calculate trends
const calculateTrend = (data, field) => {
    if (!data || data.length < 2) return 'stable';
    
    const values = data.map(item => item.vitals[field]).filter(Boolean);
    if (values.length < 2) return 'stable';

    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));

    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

    const changePct = ((secondAvg - firstAvg) / firstAvg) * 100;

    if (changePct > 5) return 'increasing';
    if (changePct < -5) return 'decreasing';
    return 'stable';
};

// Main insights calculation function
exports.calculateInsights = async (records) => {
    const insights = {
        heartRate: {
            trend: calculateTrend(records, 'heartRate'),
            summary: '',
            recommendations: []
        },
        bloodPressure: {
            trend: calculateTrend(records, 'bloodPressure'),
            summary: '',
            recommendations: []
        },
        oxygenLevel: {
            trend: calculateTrend(records, 'oxygenLevel'),
            summary: '',
            recommendations: []
        }
    };

    // Heart Rate Insights
    if (insights.heartRate.trend === 'increasing') {
        insights.heartRate.summary = 'Your heart rate has been trending higher than usual';
        insights.heartRate.recommendations.push(
            'Consider increasing rest periods',
            'Monitor stress levels',
            'Consult with your healthcare provider if this trend continues'
        );
    }

    // Blood Pressure Insights
    if (insights.bloodPressure.trend === 'increasing') {
        insights.bloodPressure.summary = 'Your blood pressure has been trending upward';
        insights.bloodPressure.recommendations.push(
            'Monitor salt intake',
            'Maintain regular exercise',
            'Consider stress management techniques'
        );
    }

    // Oxygen Level Insights
    if (insights.oxygenLevel.trend === 'decreasing') {
        insights.oxygenLevel.summary = 'Your oxygen levels have shown a slight decrease';
        insights.oxygenLevel.recommendations.push(
            'Practice deep breathing exercises',
            'Ensure good ventilation in living spaces',
            'Consider consulting with a healthcare provider'
        );
    }

    return insights;
};
