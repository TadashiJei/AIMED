const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
    emailNotifications: {
        type: Boolean,
        default: true
    },
    dailyReports: {
        type: Boolean,
        default: false
    },
    autoVerification: {
        type: Boolean,
        default: false
    },
    maintenanceMode: {
        type: Boolean,
        default: false
    },
    systemEmail: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if (!value.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
                throw new Error('Email is invalid');
            }
        }
    },
    backupFrequency: {
        type: String,
        required: true,
        enum: ['daily', 'weekly', 'monthly'],
        default: 'daily'
    },
    maxUploadSize: {
        type: Number,
        required: true,
        min: 1,
        max: 100,
        default: 10
    },
    retentionDays: {
        type: Number,
        required: true,
        min: 30,
        max: 365,
        default: 90
    }
}, {
    timestamps: true
});

const Settings = mongoose.model('Settings', settingsSchema);

module.exports = Settings;
