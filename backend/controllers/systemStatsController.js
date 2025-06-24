/**
 * System Stats Controller
 * Handles system statistics and metrics API endpoints
 */
const SystemStats = require('../models/systemStatsModel');

/**
 * Get system statistics
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
exports.getSystemStats = async (req, res) => {
  try {
    console.log('API: Getting system statistics');
    const stats = await SystemStats.getSystemStats();
    console.log('Retrieved system statistics');
    res.json(stats);
  } catch (error) {
    console.error('Error getting system statistics:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve system statistics',
      details: error.message
    });
  }
};

/**
 * Get alert statistics breakdown
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
exports.getAlertStats = async (req, res) => {
  try {
    console.log('API: Getting alert statistics');
    const alertStats = await SystemStats.getAlertStats();
    console.log('Retrieved alert statistics');
    res.json(alertStats);
  } catch (error) {
    console.error('Error getting alert statistics:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve alert statistics',
      details: error.message
    });
  }
};

/**
 * Get active drivers list
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
exports.getActiveDrivers = async (req, res) => {
  try {
    console.log('API: Getting active drivers');
    const drivers = await SystemStats.getActiveDrivers();
    console.log(`Retrieved ${drivers.length} active drivers`);
    res.json(drivers);
  } catch (error) {
    console.error('Error getting active drivers:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve active drivers',
      details: error.message
    });
  }
};

/**
 * Get comprehensive filter data for dashboard
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
exports.getFilterData = async (req, res) => {
  try {
    console.log('API: Getting filter data');
    
    // Get all data needed for filters
    const [systemStats, alertStats, activeDrivers] = await Promise.all([
      SystemStats.getSystemStats(),
      SystemStats.getAlertStats(),
      SystemStats.getActiveDrivers()
    ]);
    
    const filterData = {
      systemInfo: {
        lastSync: systemStats.lastSync,
        connectedDevices: systemStats.connectedDevices,
        totalDevices: systemStats.totalDevices,
        averageLatency: systemStats.averageLatency,
        gpsQuality: systemStats.gpsQuality,
        connectionQuality: systemStats.connectionQuality
      },
      alertSummary: alertStats,
      activeDrivers: activeDrivers
    };
    
    console.log('Retrieved comprehensive filter data');
    res.json(filterData);
  } catch (error) {
    console.error('Error getting filter data:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve filter data',
      details: error.message
    });
  }
};
