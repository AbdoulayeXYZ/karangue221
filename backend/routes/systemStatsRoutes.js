/**
 * System Stats Routes
 * Defines API endpoints for system statistics and metrics
 */
const express = require('express');
const router = express.Router();
const systemStatsController = require('../controllers/systemStatsController');

/**
 * GET /api/system-stats/system
 * Get general system statistics
 */
router.get('/system', systemStatsController.getSystemStats);

/**
 * GET /api/system-stats/alerts
 * Get alert statistics breakdown
 */
router.get('/alerts', systemStatsController.getAlertStats);

/**
 * GET /api/system-stats/drivers
 * Get active drivers list
 */
router.get('/drivers', systemStatsController.getActiveDrivers);

/**
 * GET /api/system-stats/filter-data
 * Get comprehensive filter data for dashboard
 */
router.get('/filter-data', systemStatsController.getFilterData);

module.exports = router;
