const { Record } = require('../models/record.model');
const { User } = require('../models/user.model');
const { calculateInsights } = require('../services/insightService');

// Get user metrics for dashboard
exports.getUserMetrics = async (req, res) => {
    try {
        const userId = req.user.id;
        const timeRange = req.query.timeRange || '24h'; // Default to last 24 hours

        const metrics = await Record.aggregate([
            { $match: { userId: userId } },
            { $sort: { timestamp: -1 } },
            { $group: {
                _id: null,
                currentHeartRate: { $first: "$vitals.heartRate" },
                avgHeartRate: { $avg: "$vitals.heartRate" },
                currentBloodPressure: { $first: "$vitals.bloodPressure" },
                currentOxygenLevel: { $first: "$vitals.oxygenLevel" },
                avgOxygenLevel: { $avg: "$vitals.oxygenLevel" }
            }}
        ]);

        res.json({
            success: true,
            data: metrics[0] || {}
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Error fetching user metrics'
        });
    }
};

// Get aggregated dashboard data
exports.getDashboardData = async (req, res) => {
    try {
        const userId = req.user.id;
        
        const [metrics, activities, stats] = await Promise.all([
            Record.find({ userId }).sort({ timestamp: -1 }).limit(10),
            getRecentActivities(userId),
            getUserStatistics(userId)
        ]);

        res.json({
            success: true,
            data: {
                metrics,
                activities,
                stats
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Error fetching dashboard data'
        });
    }
};

// Get recent activities
exports.getRecentActivities = async (req, res) => {
    try {
        const userId = req.user.id;
        const limit = parseInt(req.query.limit) || 10;

        const activities = await Record.find({ userId })
            .sort({ timestamp: -1 })
            .limit(limit)
            .select('type timestamp vitals status');

        res.json({
            success: true,
            data: activities
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Error fetching recent activities'
        });
    }
};

// Get user statistics
exports.getUserStatistics = async (req, res) => {
    try {
        const userId = req.user.id;
        const timeRange = req.query.timeRange || '7d'; // Default to last 7 days

        const stats = await Record.aggregate([
            { $match: { userId: userId } },
            { $group: {
                _id: null,
                totalReadings: { $sum: 1 },
                avgHeartRate: { $avg: "$vitals.heartRate" },
                avgOxygenLevel: { $avg: "$vitals.oxygenLevel" },
                normalReadings: {
                    $sum: { $cond: [{ $eq: ["$status", "normal"] }, 1, 0] }
                },
                alertReadings: {
                    $sum: { $cond: [{ $eq: ["$status", "alert"] }, 1, 0] }
                }
            }}
        ]);

        res.json({
            success: true,
            data: stats[0] || {}
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Error fetching user statistics'
        });
    }
};

// Get health insights
exports.getHealthInsights = async (req, res) => {
    try {
        const userId = req.user.id;
        const timeRange = req.query.timeRange || '30d'; // Default to last 30 days

        const records = await Record.find({ userId })
            .sort({ timestamp: -1 })
            .limit(100);

        const insights = await calculateInsights(records);

        res.json({
            success: true,
            data: insights
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Error generating health insights'
        });
    }
};
