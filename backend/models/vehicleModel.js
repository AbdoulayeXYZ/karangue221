const db = require('../config/db');

/**
 * Check if the vehicle_devices table exists, if not create it
 */
async function ensureDevicesTableExists() {
  try {
    // Check if table exists
    const [tables] = await db.query(`
      SHOW TABLES LIKE 'vehicle_devices'
    `);
    
    if (tables.length === 0) {
      console.log('Creating vehicle_devices table...');
      
      // Create the table if it doesn't exist
      await db.query(`
        CREATE TABLE vehicle_devices (
          id INT AUTO_INCREMENT PRIMARY KEY,
          vehicle_id INT NOT NULL,
          device_type ENUM('gps', 'adas', 'dms', 'camera') NOT NULL,
          status ENUM('connected', 'warning', 'offline') NOT NULL DEFAULT 'offline',
          signal_strength INT,
          last_update DATETIME,
          firmware_version VARCHAR(20),
          FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
          UNIQUE KEY unique_vehicle_device (vehicle_id, device_type)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);
      
      // Add some sample data for existing vehicles
      const [vehicles] = await db.query('SELECT id FROM vehicles');
      
      if (vehicles.length > 0) {
        const deviceTypes = ['gps', 'adas', 'dms', 'camera'];
        const statuses = ['connected', 'warning', 'offline'];
        
        for (const vehicle of vehicles) {
          for (const deviceType of deviceTypes) {
            const status = statuses[Math.floor(Math.random() * statuses.length)];
            const signalStrength = status === 'connected' ? 
              Math.floor(Math.random() * 40) + 60 : // 60-100 for connected
              status === 'warning' ? 
                Math.floor(Math.random() * 30) + 30 : // 30-60 for warning
                Math.floor(Math.random() * 30); // 0-30 for offline
            
            await db.query(`
              INSERT INTO vehicle_devices (vehicle_id, device_type, status, signal_strength, last_update, firmware_version)
              VALUES (?, ?, ?, ?, NOW(), ?)
            `, [
              vehicle.id, 
              deviceType, 
              status, 
              signalStrength,
              `v2.${Math.floor(Math.random() * 10)}.${Math.floor(Math.random() * 10)}`
            ]);
          }
        }
      }
      
      console.log('vehicle_devices table created and populated successfully');
    }
  } catch (error) {
    console.error('Error ensuring devices table exists:', error);
  }
}

// Ensure the devices table exists when this module is loaded
ensureDevicesTableExists();
exports.getAll = async (tenantId = null) => {
  try {
    // Get vehicles with driver and device information through JOINs
    // Support multi-tenant filtering
    let baseQuery = `
      SELECT v.*, 
             d.id as driver_id, 
             CONCAT(IFNULL(d.first_name, ''), ' ', IFNULL(d.last_name, '')) as driver_name, 
             d.phone as driver_phone, 
             d.license_number as driver_ibutton,
             
             -- GPS device
             (SELECT status FROM vehicle_devices WHERE vehicle_id = v.id AND device_type = 'gps') as gps_status,
           (SELECT signal_strength FROM vehicle_devices WHERE vehicle_id = v.id AND device_type = 'gps') as gps_signal_strength,
           (SELECT last_update FROM vehicle_devices WHERE vehicle_id = v.id AND device_type = 'gps') as gps_last_update,
           (SELECT firmware_version FROM vehicle_devices WHERE vehicle_id = v.id AND device_type = 'gps') as gps_firmware_version,
           
           -- ADAS device
           (SELECT status FROM vehicle_devices WHERE vehicle_id = v.id AND device_type = 'adas') as adas_status,
           (SELECT signal_strength FROM vehicle_devices WHERE vehicle_id = v.id AND device_type = 'adas') as adas_signal_strength,
           (SELECT last_update FROM vehicle_devices WHERE vehicle_id = v.id AND device_type = 'adas') as adas_last_update,
           (SELECT firmware_version FROM vehicle_devices WHERE vehicle_id = v.id AND device_type = 'adas') as adas_firmware_version,
           
           -- DMS device
           (SELECT status FROM vehicle_devices WHERE vehicle_id = v.id AND device_type = 'dms') as dms_status,
           (SELECT signal_strength FROM vehicle_devices WHERE vehicle_id = v.id AND device_type = 'dms') as dms_signal_strength,
           (SELECT last_update FROM vehicle_devices WHERE vehicle_id = v.id AND device_type = 'dms') as dms_last_update,
           (SELECT firmware_version FROM vehicle_devices WHERE vehicle_id = v.id AND device_type = 'dms') as dms_firmware_version,
           
           -- Camera device
           (SELECT status FROM vehicle_devices WHERE vehicle_id = v.id AND device_type = 'camera') as camera_status,
           (SELECT signal_strength FROM vehicle_devices WHERE vehicle_id = v.id AND device_type = 'camera') as camera_signal_strength,
           (SELECT last_update FROM vehicle_devices WHERE vehicle_id = v.id AND device_type = 'camera') as camera_last_update,
           (SELECT firmware_version FROM vehicle_devices WHERE vehicle_id = v.id AND device_type = 'camera') as camera_firmware_version
           
    FROM vehicles v
      LEFT JOIN drivers d ON v.driver_id = d.id`;
    
    let params = [];
    
    // Add tenant filtering if tenantId is provided
    if (tenantId) {
      baseQuery += ` WHERE v.tenant_id = ?`;
      params.push(tenantId);
    }
    
    // Add ORDER BY clause
    baseQuery += ` ORDER BY v.created_at DESC`;
    
    // Execute the query
    const [rows] = await db.query(baseQuery, params);
    
    console.log(`Successfully fetched ${rows.length} vehicles with device information`);
    return rows;
  } catch (error) {
    console.error('Error fetching all vehicles:', error);
    console.error('SQL Error Details:', error.message);
    if (error.sql) {
      console.error('Failed SQL Query:', error.sql);
    }
    if (error.errno) {
      console.error('MySQL Error Number:', error.errno);
    }
    throw error;
  }
};

exports.getById = async (id) => {
  try {
    // Get vehicle with driver and device information through JOINs
    const [rows] = await db.query(`
      SELECT v.*, 
             d.id as driver_id, 
             CONCAT(IFNULL(d.first_name, ''), ' ', IFNULL(d.last_name, '')) as driver_name, 
             d.phone as driver_phone, 
             d.license_number as driver_ibutton,
             
             -- GPS device
             (SELECT status FROM vehicle_devices WHERE vehicle_id = v.id AND device_type = 'gps') as gps_status,
           (SELECT signal_strength FROM vehicle_devices WHERE vehicle_id = v.id AND device_type = 'gps') as gps_signal_strength,
           (SELECT last_update FROM vehicle_devices WHERE vehicle_id = v.id AND device_type = 'gps') as gps_last_update,
           (SELECT firmware_version FROM vehicle_devices WHERE vehicle_id = v.id AND device_type = 'gps') as gps_firmware_version,
           
           -- ADAS device
           (SELECT status FROM vehicle_devices WHERE vehicle_id = v.id AND device_type = 'adas') as adas_status,
           (SELECT signal_strength FROM vehicle_devices WHERE vehicle_id = v.id AND device_type = 'adas') as adas_signal_strength,
           (SELECT last_update FROM vehicle_devices WHERE vehicle_id = v.id AND device_type = 'adas') as adas_last_update,
           (SELECT firmware_version FROM vehicle_devices WHERE vehicle_id = v.id AND device_type = 'adas') as adas_firmware_version,
           
           -- DMS device
           (SELECT status FROM vehicle_devices WHERE vehicle_id = v.id AND device_type = 'dms') as dms_status,
           (SELECT signal_strength FROM vehicle_devices WHERE vehicle_id = v.id AND device_type = 'dms') as dms_signal_strength,
           (SELECT last_update FROM vehicle_devices WHERE vehicle_id = v.id AND device_type = 'dms') as dms_last_update,
           (SELECT firmware_version FROM vehicle_devices WHERE vehicle_id = v.id AND device_type = 'dms') as dms_firmware_version,
           
           -- Camera device
           (SELECT status FROM vehicle_devices WHERE vehicle_id = v.id AND device_type = 'camera') as camera_status,
           (SELECT signal_strength FROM vehicle_devices WHERE vehicle_id = v.id AND device_type = 'camera') as camera_signal_strength,
           (SELECT last_update FROM vehicle_devices WHERE vehicle_id = v.id AND device_type = 'camera') as camera_last_update,
           (SELECT firmware_version FROM vehicle_devices WHERE vehicle_id = v.id AND device_type = 'camera') as camera_firmware_version
           
    FROM vehicles v
      LEFT JOIN drivers d ON v.driver_id = d.id
      WHERE v.id = ?
    `, [id]);
    
    if (rows.length === 0) {
      console.log(`Vehicle with ID ${id} not found`);
      return null;
    }
    
    console.log(`Successfully fetched vehicle with ID ${id}`);
    return rows[0];
  } catch (error) {
    console.error(`Error fetching vehicle ${id}:`, error);
    console.error('SQL Error Details:', error.message);
    if (error.sql) {
      console.error('Failed SQL Query:', error.sql);
    }
    if (error.errno) {
      console.error('MySQL Error Number:', error.errno);
    }
    throw error;
  }
};

exports.create = async (vehicle) => {
  try {
    const [result] = await db.query('INSERT INTO vehicles SET ?', vehicle);
    console.log(`Created new vehicle with ID ${result.insertId}`);
    return { id: result.insertId, ...vehicle };
  } catch (error) {
    console.error('Error creating vehicle:', error);
    console.error('SQL Error Details:', error.message);
    if (error.sql) {
      console.error('Failed SQL Query:', error.sql);
    }
    throw error;
  }
};

exports.update = async (id, vehicle) => {
  try {
    const [result] = await db.query('UPDATE vehicles SET ? WHERE id = ?', [vehicle, id]);
    console.log(`Updated vehicle with ID ${id}, affected rows: ${result.affectedRows}`);
    return result.affectedRows > 0;
  } catch (error) {
    console.error(`Error updating vehicle ${id}:`, error);
    console.error('SQL Error Details:', error.message);
    if (error.sql) {
      console.error('Failed SQL Query:', error.sql);
    }
    throw error;
  }
};

exports.remove = async (id) => {
  try {
    const [result] = await db.query('DELETE FROM vehicles WHERE id = ?', [id]);
    console.log(`Removed vehicle with ID ${id}, affected rows: ${result.affectedRows}`);
    return result.affectedRows > 0;
  } catch (error) {
    console.error(`Error removing vehicle ${id}:`, error);
    console.error('SQL Error Details:', error.message);
    if (error.sql) {
      console.error('Failed SQL Query:', error.sql);
    }
    throw error;
  }
};

// Import tenant helper functions
const { executeSelectWithTenant, executeInsertWithTenant, executeUpdateWithTenant, executeDeleteWithTenant } = require('./helpers/tenantModelHelper');

// Multi-tenant functions
exports.getAllByTenant = async (tenantId) => {
  // Use the existing getAll function with tenantId parameter
  return exports.getAll(tenantId);
};

exports.getByIdAndTenant = async (id, tenantId) => {
  try {
    const baseQuery = `
      SELECT v.*, 
             d.id as driver_id, 
             CONCAT(IFNULL(d.first_name, ''), ' ', IFNULL(d.last_name, '')) as driver_name, 
             d.phone as driver_phone, 
             d.license_number as driver_ibutton,
             
             -- GPS device
             (SELECT status FROM vehicle_devices WHERE vehicle_id = v.id AND device_type = 'gps') as gps_status,
             (SELECT signal_strength FROM vehicle_devices WHERE vehicle_id = v.id AND device_type = 'gps') as gps_signal_strength,
             (SELECT last_update FROM vehicle_devices WHERE vehicle_id = v.id AND device_type = 'gps') as gps_last_update,
             (SELECT firmware_version FROM vehicle_devices WHERE vehicle_id = v.id AND device_type = 'gps') as gps_firmware_version,
             
             -- ADAS device
             (SELECT status FROM vehicle_devices WHERE vehicle_id = v.id AND device_type = 'adas') as adas_status,
             (SELECT signal_strength FROM vehicle_devices WHERE vehicle_id = v.id AND device_type = 'adas') as adas_signal_strength,
             (SELECT last_update FROM vehicle_devices WHERE vehicle_id = v.id AND device_type = 'adas') as adas_last_update,
             (SELECT firmware_version FROM vehicle_devices WHERE vehicle_id = v.id AND device_type = 'adas') as adas_firmware_version,
             
             -- DMS device
             (SELECT status FROM vehicle_devices WHERE vehicle_id = v.id AND device_type = 'dms') as dms_status,
             (SELECT signal_strength FROM vehicle_devices WHERE vehicle_id = v.id AND device_type = 'dms') as dms_signal_strength,
             (SELECT last_update FROM vehicle_devices WHERE vehicle_id = v.id AND device_type = 'dms') as dms_last_update,
             (SELECT firmware_version FROM vehicle_devices WHERE vehicle_id = v.id AND device_type = 'dms') as dms_firmware_version,
             
             -- Camera device
             (SELECT status FROM vehicle_devices WHERE vehicle_id = v.id AND device_type = 'camera') as camera_status,
             (SELECT signal_strength FROM vehicle_devices WHERE vehicle_id = v.id AND device_type = 'camera') as camera_signal_strength,
             (SELECT last_update FROM vehicle_devices WHERE vehicle_id = v.id AND device_type = 'camera') as camera_last_update,
             (SELECT firmware_version FROM vehicle_devices WHERE vehicle_id = v.id AND device_type = 'camera') as camera_firmware_version
             
      FROM vehicles v
        LEFT JOIN drivers d ON v.driver_id = d.id
        WHERE v.id = ?`;
    
    const rows = await executeSelectWithTenant(baseQuery, tenantId, [id]);
    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    console.error(`Error fetching vehicle ${id} for tenant ${tenantId}:`, error);
    throw error;
  }
};

exports.createWithTenant = async (vehicle, tenantId) => {
  return executeInsertWithTenant('vehicles', vehicle, tenantId);
};

exports.updateWithTenant = async (id, vehicle, tenantId) => {
  return executeUpdateWithTenant('vehicles', vehicle, id, tenantId);
};

exports.removeWithTenant = async (id, tenantId) => {
  return executeDeleteWithTenant('vehicles', id, tenantId);
};

// Additional multi-tenant specific functions
exports.getVehiclesByFleetAndTenant = async (fleetId, tenantId) => {
  return executeSelectWithTenant(
    'SELECT * FROM vehicles WHERE fleet_id = ?', 
    tenantId, 
    [fleetId]
  );
};

exports.getActiveVehiclesByTenant = async (tenantId) => {
  return executeSelectWithTenant(
    "SELECT * FROM vehicles WHERE status = 'active'", 
    tenantId
  );
};

exports.searchVehiclesByTenant = async (searchTerm, tenantId) => {
  const searchPattern = `%${searchTerm}%`;
  return executeSelectWithTenant(
    'SELECT * FROM vehicles WHERE (license_plate LIKE ? OR make LIKE ? OR model LIKE ? OR vin LIKE ?)', 
    tenantId,
    [searchPattern, searchPattern, searchPattern, searchPattern]
  );
};
