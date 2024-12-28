const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const dashboardController = require('../controllers/dashboardController');

// All routes are protected with authentication middleware
router.use(auth);

// Dashboard endpoints
router.get('/metrics', dashboardController.getUserMetrics);
router.get('/data', dashboardController.getDashboardData);
router.get('/activities', dashboardController.getRecentActivities);
router.get('/statistics', dashboardController.getUserStatistics);
router.get('/insights', dashboardController.getHealthInsights);

module.exports = router;
