const express = require('express');
const { validate } = require('../middleware/validate.middleware');
const { auth } = require('../middleware/auth.middleware');
const { body, query } = require('express-validator');
const analysisController = require('../controllers/analysis.controller');

const router = express.Router();

// Apply authentication to all routes
router.use(auth);

// Medical text analysis
router.post(
  '/text',
  validate([
    body('text')
      .isString()
      .notEmpty()
      .withMessage('Text content is required')
  ]),
  analysisController.analyzeMedicalText
);

// Document analysis
router.post(
  '/document',
  validate([
    body('documentUrl')
      .isURL()
      .withMessage('Valid document URL is required')
  ]),
  analysisController.analyzeMedicalDocument
);

// Real-time metrics analysis
router.post(
  '/realtime',
  validate([
    body('metrics')
      .isArray()
      .withMessage('Metrics must be an array')
      .notEmpty()
      .withMessage('At least one metric is required'),
    body('metrics.*.type')
      .isString()
      .notEmpty()
      .withMessage('Metric type is required'),
    body('metrics.*.value')
      .isNumeric()
      .withMessage('Metric value must be a number'),
    body('metrics.*.timestamp')
      .optional()
      .isISO8601()
      .withMessage('Invalid timestamp format')
  ]),
  analysisController.analyzeRealTimeMetrics
);

// Historical trends analysis
router.post(
  '/trends',
  validate([
    body('metrics')
      .isArray()
      .withMessage('Metrics must be an array')
      .notEmpty()
      .withMessage('At least one metric is required'),
    body('metrics.*.type')
      .isString()
      .notEmpty()
      .withMessage('Metric type is required'),
    body('metrics.*.value')
      .isNumeric()
      .withMessage('Metric value must be a number'),
    body('metrics.*.date')
      .isISO8601()
      .withMessage('Invalid date format'),
    body('timeframe')
      .optional()
      .isString()
      .matches(/^\d+[dMy]$/)
      .withMessage('Invalid timeframe format (e.g., 30d, 6M, 1y)')
  ]),
  analysisController.analyzeHistoricalTrends
);

// Get analysis history
router.get(
  '/history',
  validate([
    query('type')
      .optional()
      .isIn(['medical-text', 'document', 'health-metrics', 'real-time'])
      .withMessage('Invalid analysis type'),
    query('status')
      .optional()
      .isIn(['pending', 'processing', 'completed', 'failed'])
      .withMessage('Invalid status'),
    query('startDate')
      .optional()
      .isISO8601()
      .withMessage('Invalid start date format'),
    query('endDate')
      .optional()
      .isISO8601()
      .withMessage('Invalid end date format'),
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100')
  ]),
  analysisController.getAnalysisHistory
);

// Generate report
router.post(
  '/report',
  validate([
    body('analysisIds')
      .isArray()
      .withMessage('Analysis IDs must be an array')
      .notEmpty()
      .withMessage('At least one analysis ID is required'),
    body('analysisIds.*')
      .isMongoId()
      .withMessage('Invalid analysis ID format')
  ]),
  analysisController.generateReport
);

module.exports = router;
