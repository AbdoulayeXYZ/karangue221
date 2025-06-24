/**
 * Dashboard Controller
 * Handles dashboard-related API endpoints
 */
const Dashboard = require('../models/dashboardModel');

// Global refresh lock to prevent concurrent refreshes
let refreshInProgress = false;
let refreshQueue = [];

/**
 * Get all dashboard summary data
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
exports.getSummary = async (req, res) => {
  try {
    console.log('API: Getting dashboard summary');
    const summary = await Dashboard.getSummary();
    console.log(`Retrieved ${summary.length} dashboard records`);
    res.json(summary);
  } catch (error) {
    console.error('Error getting dashboard summary:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve dashboard summary',
      details: error.message
    });
  }
};

/**
 * Get dashboard summary for a specific fleet
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
exports.getFleetSummary = async (req, res) => {
  try {
    const fleetId = req.params.fleetId;
    console.log(`API: Getting dashboard summary for fleet ${fleetId}`);
    
    const summary = await Dashboard.getFleetSummary(fleetId);
    
    if (!summary) {
      console.log(`No dashboard data found for fleet ${fleetId}`);
      return res.status(404).json({ error: 'Fleet dashboard data not found' });
    }
    
    console.log(`Retrieved dashboard data for fleet ${fleetId}`);
    res.json(summary);
  } catch (error) {
    console.error(`Error getting fleet dashboard summary for fleet ${req.params.fleetId}:`, error);
    res.status(500).json({ 
      error: 'Failed to retrieve fleet dashboard summary',
      details: error.message
    });
  }
};

/**
 * Force refresh of dashboard data
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
exports.refreshSummary = async (req, res) => {
  try {
    console.log('API: Force refreshing dashboard summary');
    
    // Check if refresh is already in progress
    if (refreshInProgress) {
      console.log('Refresh already in progress, returning current data');
      const currentSummary = await Dashboard.getSummary();
      return res.json({ 
        success: true, 
        message: 'Refresh already in progress',
        data: currentSummary
      });
    }
    
    // Set lock
    refreshInProgress = true;
    
    try {
      const success = await Dashboard.refreshDashboard();
      
      if (success) {
        console.log('Dashboard refresh successful, fetching updated data');
        const updatedSummary = await Dashboard.getSummary();
        res.json({ 
          success: true, 
          message: 'Dashboard summary refreshed successfully',
          data: updatedSummary
        });
      } else {
        console.error('Dashboard refresh failed');
        res.status(500).json({ error: 'Failed to refresh dashboard summary' });
      }
    } finally {
      // Always release lock
      refreshInProgress = false;
    }
  } catch (error) {
    // Ensure lock is released even on error
    refreshInProgress = false;
    console.error('Error refreshing dashboard summary:', error);
    res.status(500).json({ 
      error: 'Failed to refresh dashboard summary',
      details: error.message
    });
  }
};
