const mongoose = require('mongoose');

const recordSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['lab_result', 'prescription', 'medical_report', 'imaging', 'other']
  },
  fileUrl: {
    type: String,
    required: true
  },
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {}
  },
  tags: [{
    type: String,
    trim: true
  }],
  analysisResults: [{
    type: {
      type: String,
      required: true
    },
    result: mongoose.Schema.Types.Mixed,
    confidence: Number,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  sharedWith: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    accessLevel: {
      type: String,
      enum: ['read', 'write'],
      default: 'read'
    },
    sharedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Index for faster queries
recordSchema.index({ user: 1, type: 1 });
recordSchema.index({ tags: 1 });

const Record = mongoose.model('Record', recordSchema);

module.exports = Record;
