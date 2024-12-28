const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    type: {
        type: String,
        required: true,
        enum: ['patient-summary', 'staff-activity', 'system-health']
    },
    status: {
        type: String,
        required: true,
        enum: ['processing', 'completed', 'failed'],
        default: 'processing'
    },
    downloadUrl: {
        type: String,
        trim: true
    },
    generatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    data: {
        type: mongoose.Schema.Types.Mixed
    },
    error: {
        message: String,
        details: mongoose.Schema.Types.Mixed
    }
}, {
    timestamps: true
});

// Index for faster querying
reportSchema.index({ type: 1, status: 1, createdAt: -1 });

const Report = mongoose.model('Report', reportSchema);

module.exports = Report;
