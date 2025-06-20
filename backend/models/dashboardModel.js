/**
 * Dashboard Model
 * Handles interaction with dashboard_summary table
 */
const db = require('../config/db');

/**
 * Get all dashboard summary data
 * @returns {Promise<Array>} Dashboard summary records
 */
exports.getSummary = async () => {
  try {
    console.log('Getting dashboard summary data from database');
    const [rows] = await db.query('SELECT * FROM dashboard_summary');
    return rows;
  } catch (error) {
    console.error('Error in dashboardModel.getSummary:', error);
    throw error;
  }
};

/**
 * Get dashboard summary for a specific fleet
 * @param {number} fleetId - Fleet ID
 * @returns {Promise<Object>} Dashboard summary for the fleet
 */
exports.getFleetSummary = async (fleetId) => {
  try {
    console.log(`Getting dashboard summary for fleet ${fleetId}`);
    const [rows] = await db.query('SELECT * FROM dashboard_summary WHERE fleet_id = ?', [fleetId]);
    return rows[0];
  } catch (error) {
    console.error(`Error in dashboardModel.getFleetSummary(${fleetId}):`, error);
    throw error;
  }
};

/**
 * Force refresh of dashboard data
 * This recalculates all fleet metrics
 * @returns {Promise<boolean>} Success indicator
 */
exports.refreshDashboard = async () => {
  try {
    console.log('Refreshing dashboard summary data');
    
    // Execute the update query
    await db.query(`
      INSERT INTO dashboard_summary (
        fleet_id, 
        fleet_name, 
        total_vehicles, 
        active_vehicles, 
        maintenance_vehicles, 
        inactive_vehicles,
        total_drivers,
        active_drivers,
        inactive_drivers,
        total_incidents,
        open_incidents,
        total_violations
      )
      SELECT 
        f.id as fleet_id,
        f.name as fleet_name,
        COUNT(DISTINCT v.id) as total_vehicles,
        SUM(CASE WHEN v.status = 'active' THEN 1 ELSE 0 END) as active_vehicles,
        SUM(CASE WHEN v.status = 'maintenance' THEN 1 ELSE 0 END) as maintenance_vehicles,
        SUM(CASE WHEN v.status = 'inactive' THEN 1 ELSE 0 END) as inactive_vehicles,
        COUNT(DISTINCT d.id) as total_drivers,
        SUM(CASE WHEN d.status = 'active' THEN 1 ELSE 0 END) as active_drivers,
        SUM(CASE WHEN d.status = 'inactive' THEN 1 ELSE 0 END) as inactive_drivers,
        COUNT(DISTINCT i.id) as total_incidents,
        SUM(CASE WHEN i.status = 'open' THEN 1 ELSE 0 END) as open_incidents,
        COUNT(DISTINCT vio.id) as total_violations
      FROM 
        fleets f
      LEFT JOIN vehicles v ON f.id = v.fleet_id
      LEFT JOIN drivers d ON f.id = d.fleet_id
      LEFT JOIN incidents i ON v.id = i.vehicle_id
      LEFT JOIN violations vio ON v.id = vio.vehicle_id
      GROUP BY 
        f.id, f.name
      ON DUPLICATE KEY UPDATE
        fleet_name = VALUES(fleet_name),
        total_vehicles = VALUES(total_vehicles),
        active_vehicles = VALUES(active_vehicles),
        maintenance_vehicles = VALUES(maintenance_vehicles),
        inactive_vehicles = VALUES(inactive_vehicles),
        total_drivers = VALUES(total_drivers),
        active_drivers = VALUES(active_drivers),
        inactive_drivers = VALUES(inactive_drivers),
        total_incidents = VALUES(total_incidents),
        open_incidents = VALUES(open_incidents),
        total_violations = VALUES(total_violations)
    `);
    
    return true;
  } catch (error) {
    console.error('Error in dashboardModel.refreshDashboard:', error);
    return false;
  }
};
