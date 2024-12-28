const { catchAsync } = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');
const analysisService = require('../services/analysis.service');
const AnalysisResult = require('../models/analysis.model');

// Analyze medical text
const analyzeMedicalText = catchAsync(async (req, res) => {
  const { text } = req.body;
  if (!text) {
    throw new ApiError(400, 'Text is required');
  }

  const analysis = new AnalysisResult({
    userId: req.user._id,
    type: 'medical-text',
    data: { text },
    status: 'processing'
  });
  await analysis.save();

  try {
    const results = await analysisService.analyzeMedicalText(text);
    analysis.results = results;
    analysis.status = 'completed';
    await analysis.save();

    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    analysis.status = 'failed';
    analysis.error = {
      message: error.message,
      details: error
    };
    await analysis.save();
    throw error;
  }
});

// Analyze medical document
const analyzeMedicalDocument = catchAsync(async (req, res) => {
  const { documentUrl } = req.body;
  if (!documentUrl) {
    throw new ApiError(400, 'Document URL is required');
  }

  const analysis = new AnalysisResult({
    userId: req.user._id,
    type: 'document',
    data: { documentUrl },
    status: 'processing'
  });
  await analysis.save();

  try {
    const results = await analysisService.analyzeMedicalDocument(documentUrl);
    analysis.results = results;
    analysis.status = 'completed';
    await analysis.save();

    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    analysis.status = 'failed';
    analysis.error = {
      message: error.message,
      details: error
    };
    await analysis.save();
    throw error;
  }
});

// Real-time health metrics analysis
const analyzeRealTimeMetrics = catchAsync(async (req, res) => {
  const { metrics } = req.body;
  if (!metrics || !Array.isArray(metrics)) {
    throw new ApiError(400, 'Valid metrics array is required');
  }

  const analysis = new AnalysisResult({
    userId: req.user._id,
    type: 'real-time',
    data: { metrics },
    status: 'processing'
  });
  await analysis.save();

  try {
    // Analyze each metric for anomalies
    const results = await analysisService.analyzeHealthTrends(metrics, '1');
    
    // Generate insights based on the analysis
    const insights = await analysisService.generateHealthInsights({
      metrics,
      analysis: results
    });

    analysis.results = {
      ...results,
      insights
    };
    analysis.status = 'completed';
    await analysis.save();

    res.json({
      success: true,
      data: analysis.results
    });
  } catch (error) {
    analysis.status = 'failed';
    analysis.error = {
      message: error.message,
      details: error
    };
    await analysis.save();
    throw error;
  }
});

// Historical health trends analysis
const analyzeHistoricalTrends = catchAsync(async (req, res) => {
  const { metrics, timeframe } = req.body;
  if (!metrics || !Array.isArray(metrics)) {
    throw new ApiError(400, 'Valid metrics array is required');
  }

  const analysis = new AnalysisResult({
    userId: req.user._id,
    type: 'health-metrics',
    data: { metrics, timeframe },
    metadata: { timeframe },
    status: 'processing'
  });
  await analysis.save();

  try {
    // Analyze trends over the specified timeframe
    const results = await analysisService.analyzeHealthTrends(metrics, timeframe);
    
    // Generate insights based on the analysis
    const insights = await analysisService.generateHealthInsights({
      metrics,
      timeframe,
      analysis: results
    });

    analysis.results = {
      ...results,
      insights
    };
    analysis.status = 'completed';
    await analysis.save();

    res.json({
      success: true,
      data: analysis.results
    });
  } catch (error) {
    analysis.status = 'failed';
    analysis.error = {
      message: error.message,
      details: error
    };
    await analysis.save();
    throw error;
  }
});

// Get analysis history
const getAnalysisHistory = catchAsync(async (req, res) => {
  const { type, status, startDate, endDate, limit = 10, page = 1 } = req.query;
  
  const query = { userId: req.user._id };
  
  if (type) query.type = type;
  if (status) query.status = status;
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  const skip = (page - 1) * limit;
  
  const [results, total] = await Promise.all([
    AnalysisResult.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .exec(),
    AnalysisResult.countDocuments(query)
  ]);

  res.json({
    success: true,
    data: {
      results,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    }
  });
});

// Generate analysis report
const generateReport = catchAsync(async (req, res) => {
  const { analysisIds } = req.body;
  if (!analysisIds || !Array.isArray(analysisIds)) {
    throw new ApiError(400, 'Analysis IDs array is required');
  }

  // Fetch all specified analyses
  const analyses = await AnalysisResult.find({
    _id: { $in: analysisIds },
    userId: req.user._id,
    status: 'completed'
  });

  if (analyses.length === 0) {
    throw new ApiError(404, 'No completed analyses found');
  }

  // Generate comprehensive report
  const report = {
    generatedAt: new Date(),
    userId: req.user._id,
    analyses: analyses.map(analysis => ({
      type: analysis.type,
      date: analysis.createdAt,
      results: analysis.results,
      metadata: analysis.metadata
    })),
    summary: await analysisService.generateHealthInsights({
      analyses: analyses.map(a => ({
        type: a.type,
        results: a.results,
        date: a.createdAt
      }))
    })
  };

  res.json({
    success: true,
    data: report
  });
});

module.exports = {
  analyzeMedicalText,
  analyzeMedicalDocument,
  analyzeRealTimeMetrics,
  analyzeHistoricalTrends,
  getAnalysisHistory,
  generateReport
};
