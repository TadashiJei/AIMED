const User = require('../models/user.model');
const Patient = require('../models/patient.model');
const AnalysisResult = require('../models/analysis.model');
const Settings = require('../models/settings.model');
const Report = require('../models/report.model');

// Analytics Controller
exports.getAnalytics = async (req, res) => {
    try {
        // Get user statistics
        const totalUsers = await User.countDocuments();
        const doctors = await User.countDocuments({ role: 'doctor' });
        const patients = await User.countDocuments({ role: 'patient' });
        const pendingVerifications = await User.countDocuments({ isVerified: false });

        // Get daily signups for the last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const dailySignups = await User.aggregate([
            {
                $match: {
                    createdAt: { $gte: thirtyDaysAgo }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { _id: 1 }
            }
        ]);

        // Get analysis metrics
        const totalAnalyses = await AnalysisResult.countDocuments();
        const statusDistribution = await AnalysisResult.aggregate([
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 }
                }
            }
        ]);

        const analysisTypes = await AnalysisResult.aggregate([
            {
                $group: {
                    _id: "$type",
                    count: { $sum: 1 }
                }
            }
        ]);

        // Get system usage metrics
        const dailyActiveUsers = await User.aggregate([
            {
                $match: {
                    lastLogin: { $gte: thirtyDaysAgo }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$lastLogin" } },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { _id: 1 }
            }
        ]);

        res.json({
            userStats: {
                totalUsers,
                doctors,
                patients,
                pendingVerifications,
                dailySignups: dailySignups.map(item => ({
                    date: item._id,
                    count: item.count
                }))
            },
            analysisMetrics: {
                totalAnalyses,
                statusDistribution: Object.fromEntries(
                    statusDistribution.map(item => [item._id, item.count])
                ),
                analysisTypes: Object.fromEntries(
                    analysisTypes.map(item => [item._id, item.count])
                )
            },
            systemUsage: {
                dailyActiveUsers: dailyActiveUsers.map(item => ({
                    date: item._id,
                    count: item.count
                }))
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

// Patient Controller
exports.getPatients = async (req, res) => {
    try {
        const patients = await Patient.find()
            .select('fullName email age gender lastVisit status')
            .sort({ createdAt: -1 });

        res.json(patients);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

// Report Controller
exports.getReports = async (req, res) => {
    try {
        const reports = await Report.find()
            .sort({ createdAt: -1 });

        res.json(reports);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

exports.generateReport = async (req, res) => {
    try {
        const { type } = req.body;
        
        // Create a new report
        const report = new Report({
            title: `${type.charAt(0).toUpperCase() + type.slice(1)} Report`,
            type,
            status: 'processing',
            generatedBy: req.user._id
        });

        await report.save();

        // Start report generation process (this would typically be handled by a background job)
        setTimeout(async () => {
            report.status = 'completed';
            report.downloadUrl = `/api/admin/reports/${report._id}/download`;
            await report.save();
        }, 5000);

        res.json(report);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

// Settings Controller
exports.getSettings = async (req, res) => {
    try {
        let settings = await Settings.findOne();
        
        if (!settings) {
            // Create default settings if none exist
            settings = new Settings({
                emailNotifications: true,
                dailyReports: false,
                autoVerification: false,
                maintenanceMode: false,
                systemEmail: 'system@aimed.com',
                backupFrequency: 'daily',
                maxUploadSize: 10,
                retentionDays: 90
            });
            await settings.save();
        }

        res.json(settings);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

exports.updateSettings = async (req, res) => {
    try {
        const updates = Object.keys(req.body);
        const allowedUpdates = [
            'emailNotifications',
            'dailyReports',
            'autoVerification',
            'maintenanceMode',
            'systemEmail',
            'backupFrequency',
            'maxUploadSize',
            'retentionDays'
        ];

        const isValidOperation = updates.every(update => allowedUpdates.includes(update));

        if (!isValidOperation) {
            return res.status(400).json({ error: 'Invalid updates' });
        }

        let settings = await Settings.findOne();

        if (!settings) {
            settings = new Settings(req.body);
        } else {
            updates.forEach(update => settings[update] = req.body[update]);
        }

        await settings.save();
        res.json(settings);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};