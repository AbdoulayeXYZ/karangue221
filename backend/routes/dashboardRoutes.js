/**
 * Dashboard Routes
 * Defines routes for dashboard-related endpoints
 */
const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

// Get all dashboard summaries
router.get('/summary', dashboardController.getSummary);

// Get dashboard summary for a specific fleet
router.get('/summary/:fleetId', dashboardController.getFleetSummary);

// Force refresh of dashboard data
router.post('/refresh', dashboardController.refreshSummary);

module.exports = router;
