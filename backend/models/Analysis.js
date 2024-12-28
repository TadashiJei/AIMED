const mongoose = require('mongoose');

const analysisSchema = new mongoose.Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Patient'
    },
    doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    type: {
        type: String,
        required: true,
        trim: true
    },
    status: {
        type: String,
        required: true,
        enum: ['pending', 'processing', 'completed', 'failed'],
        default: 'pending'
    },
    result: {
        type: mongoose.Schema.Types.Mixed
    },
    processingTime: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

const Analysis = mongoose.model('Analysis', analysisSchema);

module.exports = Analysis;
