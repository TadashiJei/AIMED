const express = require('express');
const { body, query } = require('express-validator');
const router = express.Router();
const { validate } = require('../middleware/validate.middleware');
const { verifyToken } = require('../controllers/auth.controller');
const metricsController = require('../controllers/metrics.controller');

// Validation rules for adding metrics
const addMetricsValidation = [
  body('metrics').isArray(),
  body('metrics.*.type').isIn(['height', 'weight', 'blood_pressure', 'heart_rate', 'temperature']),
  body('metrics.*.value').isNumeric()
];

// Validation rules for getting metrics
const getMetricsValidation = [
  query('type').optional().isIn(['height', 'weight', 'blood_pressure', 'heart_rate', 'temperature']),
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601()
];

// Add new metrics
router.post('/',
  verifyToken,
  validate(addMetricsValidation),
  metricsController.addMetrics
);

// Get metrics with optional filtering
router.get('/',
  verifyToken,
  validate(getMetricsValidation),
  metricsController.getMetrics
);

// Get metrics summary
router.get('/summary',
  verifyToken,
  metricsController.getMetricsSummary
);

module.exports = router;
