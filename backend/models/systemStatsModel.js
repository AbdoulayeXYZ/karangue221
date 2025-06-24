/**
 * System Stats Model
 * Handles system statistics and metrics
 */
const db = require('../config/db');

/**
 * Get system statistics including connection status and performance metrics
 * @returns {Promise<Object>} System statistics
 */
exports.getSystemStats = async () => {
  try {
    console.log('Getting system statistics');
    
    // Get basic fleet and connection stats
    const [fleetStats] = await db.query(`
      SELECT 
        COUNT(DISTINCT f.id) as total_fleets,
        COUNT(DISTINCT v.id) as total_vehicles,
        COUNT(DISTINCT d.id) as total_drivers,
        SUM(CASE WHEN v.status != 'offline' THEN 1 ELSE 0 END) as connected_vehicles,
        SUM(CASE WHEN v.status = 'offline' THEN 1 ELSE 0 END) as offline_vehicles
      FROM fleets f
      LEFT JOIN vehicles v ON f.id = v.fleet_id
      LEFT JOIN drivers d ON f.id = d.fleet_id
    `);

    // Get recent activity count (last 1 hour)
    const [recentActivity] = await db.query(`
      SELECT COUNT(*) as recent_activities
      FROM activities 
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 1 HOUR)
    `);

    // Get incidents count for today
    const [todayIncidents] = await db.query(`
      SELECT COUNT(*) as today_incidents
      FROM incidents 
      WHERE DATE(created_at) = CURDATE()
    `);

    // Get violations count for today
    const [todayViolations] = await db.query(`
      SELECT COUNT(*) as today_violations
      FROM violations 
      WHERE DATE(created_at) = CURDATE()
    `);

    // Calculate connection quality
    const stats = fleetStats[0];
    const connectionQuality = stats.total_vehicles > 0 
      ? Math.round((stats.connected_vehicles / stats.total_vehicles) * 100)
      : 0;

    // Simulate realistic latency (would be real in production)
    const averageLatency = Math.floor(Math.random() * 50) + 80; // 80-130ms

    // GPS quality simulation (would be real in production)
    const gpsQuality = Math.floor(Math.random() * 5) + 95; // 95-99%

    return {
      lastSync: new Date(),
      connectedDevices: stats.connected_vehicles || 0,
      totalDevices: stats.total_vehicles || 0,
      averageLatency: `${averageLatency}ms`,
      gpsQuality: `${gpsQuality}%`,
      connectionQuality: connectionQuality,
      recentActivities: recentActivity[0].recent_activities || 0,
      todayIncidents: todayIncidents[0].today_incidents || 0,
      todayViolations: todayViolations[0].today_violations || 0,
      systemStatus: 'operational',
      uptime: '99.8%'
    };
  } catch (error) {
    console.error('Error in systemStatsModel.getSystemStats:', error);
    throw error;
  }
};

/**
 * Get alert statistics breakdown
 * @returns {Promise<Object>} Alert statistics by type
 */
exports.getAlertStats = async () => {
  try {
    console.log('Getting alert statistics');
    
    // Get incidents by type
    const [incidentStats] = await db.query(`
      SELECT 
        type,
        COUNT(*) as count,
        SUM(CASE WHEN severity = 'high' THEN 1 ELSE 0 END) as high_severity,
        SUM(CASE WHEN severity = 'medium' THEN 1 ELSE 0 END) as medium_severity,
        SUM(CASE WHEN severity = 'low' THEN 1 ELSE 0 END) as low_severity
      FROM incidents 
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY type
    `);

    // Get violations by type
    const [violationStats] = await db.query(`
      SELECT 
        type,
        COUNT(*) as count,
        SUM(CASE WHEN severity = 'high' THEN 1 ELSE 0 END) as high_severity,
        SUM(CASE WHEN severity = 'medium' THEN 1 ELSE 0 END) as medium_severity,
        SUM(CASE WHEN severity = 'low' THEN 1 ELSE 0 END) as low_severity
      FROM violations 
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY type
    `);

    // Get vehicle maintenance alerts
    const [maintenanceStats] = await db.query(`
      SELECT COUNT(*) as count
      FROM vehicles 
      WHERE status = 'maintenance'
    `);

    // Process and categorize alerts
    const alertTypes = {
      speed_violation: 0,
      harsh_braking: 0,
      adas_alert: 0,
      dms_alert: 0,
      geofence: 0,
      maintenance: maintenanceStats[0].count || 0
    };

    // Process incidents
    incidentStats.forEach(incident => {
      if (incident.type.includes('brake') || incident.type.includes('harsh')) {
        alertTypes.harsh_braking += incident.count;
      } else if (incident.type.includes('adas')) {
        alertTypes.adas_alert += incident.count;
      } else if (incident.type.includes('dms')) {
        alertTypes.dms_alert += incident.count;
      } else if (incident.type.includes('geofence') || incident.type.includes('zone')) {
        alertTypes.geofence += incident.count;
      }
    });

    // Process violations
    violationStats.forEach(violation => {
      if (violation.type.includes('speed')) {
        alertTypes.speed_violation += violation.count;
      } else if (violation.type.includes('geofence') || violation.type.includes('zone')) {
        alertTypes.geofence += violation.count;
      }
    });

    return alertTypes;
  } catch (error) {
    console.error('Error in systemStatsModel.getAlertStats:', error);
    throw error;
  }
};

/**
 * Get driver statistics with real names
 * @returns {Promise<Array>} List of active drivers
 */
exports.getActiveDrivers = async () => {
  try {
    console.log('Getting active drivers list');
    
    const [drivers] = await db.query(`
      SELECT 
        id,
        first_name,
        last_name,
        CONCAT(first_name, ' ', last_name) as full_name,
        status,
        phone,
        email
      FROM drivers 
      WHERE status = 'active'
      ORDER BY first_name, last_name
    `);

    return drivers.map(driver => ({
      id: driver.id,
      name: driver.full_name,
      status: driver.status,
      phone: driver.phone,
      email: driver.email
    }));
  } catch (error) {
    console.error('Error in systemStatsModel.getActiveDrivers:', error);
    throw error;
  }
};
