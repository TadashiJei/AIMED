const express = require('express');
const router = express.Router();
const adminAuth = require('../middleware/adminAuth');
const adminController = require('../controllers/adminController');

// Analytics Routes
router.get('/analytics', adminAuth, adminController.getAnalytics);

// Patient Routes
router.get('/patients', adminAuth, adminController.getPatients);

// Reports Routes
router.get('/reports', adminAuth, adminController.getReports);
router.post('/reports/generate', adminAuth, adminController.generateReport);

// Settings Routes
router.get('/settings', adminAuth, adminController.getSettings);
router.patch('/settings', adminAuth, adminController.updateSettings);

module.exports = router;
