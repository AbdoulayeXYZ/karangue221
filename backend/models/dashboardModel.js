/**
 * Dashboard Model
 * Handles interaction with dashboard_summary table
 */
const db = require('../config/db');

// Mutex to prevent concurrent dashboard refreshes
let refreshMutex = false;

/**
 * Get all dashboard summary data
 * @returns {Promise<Array>} Dashboard summary records
 */
exports.getSummary = async () => {
  try {
    console.log('Getting dashboard summary data from database');
    const [rows] = await db.query('SELECT * FROM dashboard_summary ORDER BY fleet_name');
    
    // If no data exists, refresh it first
    if (rows.length === 0 && !refreshMutex) {
      refreshMutex = true;
      console.log('No dashboard data found, refreshing...');
      await this.refreshDashboard();
      refreshMutex = false;
      const [refreshedRows] = await db.query('SELECT * FROM dashboard_summary ORDER BY fleet_name');
      return refreshedRows;
    }
    
    console.log(`Retrieved ${rows.length} dashboard records`);
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
 * This recalculates all fleet metrics using UPSERT to avoid conflicts with triggers
 * @returns {Promise<boolean>} Success indicator
 */
exports.refreshDashboard = async () => {
  try {
    console.log('Refreshing dashboard summary data using UPSERT strategy');
    
    // First, let's check what fleets exist
    const [fleets] = await db.query('SELECT id, name FROM fleets');
    console.log(`Found ${fleets.length} fleets:`, fleets.map(f => `${f.name} (ID: ${f.id})`));
    
    if (fleets.length === 0) {
      console.warn('No fleets found in database');
      return false;
    }
    
    // Use REPLACE INTO to avoid conflicts with existing data and triggers
    // REPLACE INTO will delete existing row and insert new one atomically
    for (const fleet of fleets) {
      console.log(`Processing fleet: ${fleet.name} (ID: ${fleet.id})`);
      
      const [result] = await db.query(`
        REPLACE INTO dashboard_summary (
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
          total_violations,
          last_updated
        )
        SELECT 
          ? as fleet_id,
          ? as fleet_name,
          COUNT(DISTINCT v.id) as total_vehicles,
          SUM(CASE WHEN v.status = 'active' THEN 1 ELSE 0 END) as active_vehicles,
          SUM(CASE WHEN v.status = 'maintenance' THEN 1 ELSE 0 END) as maintenance_vehicles,
          SUM(CASE WHEN v.status = 'inactive' THEN 1 ELSE 0 END) as inactive_vehicles,
          COUNT(DISTINCT d.id) as total_drivers,
          SUM(CASE WHEN d.status = 'active' THEN 1 ELSE 0 END) as active_drivers,
          SUM(CASE WHEN d.status = 'inactive' THEN 1 ELSE 0 END) as inactive_drivers,
          COUNT(DISTINCT i.id) as total_incidents,
          SUM(CASE WHEN i.status = 'open' THEN 1 ELSE 0 END) as open_incidents,
          COUNT(DISTINCT vio.id) as total_violations,
          NOW() as last_updated
        FROM 
          fleets f
        LEFT JOIN vehicles v ON f.id = v.fleet_id
        LEFT JOIN drivers d ON f.id = d.fleet_id
        LEFT JOIN incidents i ON v.id = i.vehicle_id
        LEFT JOIN violations vio ON v.id = vio.vehicle_id
        WHERE f.id = ?
        GROUP BY f.id, f.name
      `, [fleet.id, fleet.name, fleet.id]);
      
      console.log(`Updated dashboard data for fleet ${fleet.name} (affected rows: ${result.affectedRows})`);
    }
    
    // Verify the data was updated
    const [verification] = await db.query('SELECT COUNT(*) as count FROM dashboard_summary');
    console.log(`Dashboard refresh complete. Total records: ${verification[0].count}`);
    
    return true;
  } catch (error) {
    console.error('Error in dashboardModel.refreshDashboard:', error);
    
    // Check if it's a duplicate entry error
    if (error.code === 'ER_DUP_ENTRY') {
      console.error('Duplicate entry error detected. This suggests a race condition with database triggers.');
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        errno: error.errno,
        sqlState: error.sqlState
      });
    }
    
    return false;
  }
};
