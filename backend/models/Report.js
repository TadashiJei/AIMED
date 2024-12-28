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
    }
}, {
    timestamps: true
});

const Report = mongoose.model('Report', reportSchema);

module.exports = Report;
