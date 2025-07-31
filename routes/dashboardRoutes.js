const express = require('express');
const router = express.Router();
const DashboardController = require('../controllers/dashboardController');
const { ensureAuthenticated } = require('../middleware/authMiddleware');

// Dashboard routes
router.get('/data', ensureAuthenticated, (req, res) => DashboardController.getDashboardData(req, res));
router.get('/analytics', ensureAuthenticated, (req, res) => DashboardController.getAnalyticsData(req, res));

module.exports = router; 