const mongoose = require('mongoose');

const analysisResultSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['medical-text', 'document', 'health-metrics', 'real-time'],
    required: true
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  metadata: {
    source: String,
    documentId: mongoose.Schema.Types.ObjectId,
    timeframe: String,
    metrics: [String]
  },
  results: {
    entities: [{
      text: String,
      category: String,
      subCategory: String,
      confidence: Number,
      links: [{ name: String, url: String }]
    }],
    keyPhrases: [String],
    sentiment: {
      overall: String,
      scores: {
        positive: Number,
        neutral: Number,
        negative: Number
      }
    },
    anomalies: [{
      timestamp: Date,
      value: Number,
      isAnomaly: Boolean,
      expectedValue: Number,
      deviationScore: Number
    }],
    insights: String,
    trends: {
      type: Map,
      of: {
        stats: {
          mean: Number,
          min: Number,
          max: Number,
          anomalyCount: Number
        },
        trendDirection: String,
        dataPoints: Number
      }
    }
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  error: {
    message: String,
    details: mongoose.Schema.Types.Mixed
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for faster querying
analysisResultSchema.index({ userId: 1, type: 1, createdAt: -1 });
analysisResultSchema.index({ status: 1 });

const AnalysisResult = mongoose.model('AnalysisResult', analysisResultSchema);

module.exports = AnalysisResult;
