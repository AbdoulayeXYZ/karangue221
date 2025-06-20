-- Migration script Phase 2: Add new tables and enhance existing tables
-- Created: 2025-06-20

-- Start transaction to ensure all operations succeed or fail together
START TRANSACTION;

-- Log start of migration phase 2
SELECT 'MIGRATION LOG: Starting phase 2 - adding new tables and enhancing existing ones' AS log_message;

-- -----------------------------------------------------
-- 1. Create maintenance_schedule table
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS maintenance_schedule (
  id INT AUTO_INCREMENT PRIMARY KEY,
  vehicle_id INT NOT NULL,
  maintenance_type VARCHAR(50) NOT NULL,
  description TEXT,
  scheduled_date DATE NOT NULL,
  completed_date DATE,
  cost DECIMAL(10,2),
  notes TEXT,
  status ENUM('scheduled', 'completed', 'canceled', 'overdue') DEFAULT 'scheduled',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_maintenance_vehicle FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
);

-- Add index for fast querying of maintenance by date (with existence check)
-- First, we'll create a procedure to check and create indexes safely
DROP PROCEDURE IF EXISTS create_index_if_not_exists;
DELIMITER $$
CREATE PROCEDURE create_index_if_not_exists(
    IN p_table_name VARCHAR(64),
    IN p_index_name VARCHAR(64),
    IN p_column_list VARCHAR(255)
)
BEGIN
    DECLARE index_exists INT;
    
    SELECT COUNT(*) INTO index_exists
    FROM information_schema.statistics
    WHERE table_schema = DATABASE() 
    AND table_name = p_table_name 
    AND index_name = p_index_name
    LIMIT 1;
    
    IF index_exists = 0 THEN
        SET @sql = CONCAT('CREATE INDEX ', p_index_name, ' ON ', p_table_name, '(', p_column_list, ')');
        PREPARE stmt FROM @sql;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
        
        SELECT CONCAT('MIGRATION LOG: Created index ', p_index_name, ' on table ', p_table_name) AS log_message;
    ELSE
        SELECT CONCAT('MIGRATION LOG: Index ', p_index_name, ' already exists on table ', p_table_name) AS log_message;
    END IF;
END$$
DELIMITER ;

-- Now use this procedure for all index creation
CALL create_index_if_not_exists('maintenance_schedule', 'idx_maintenance_scheduled_date', 'scheduled_date');
CALL create_index_if_not_exists('maintenance_schedule', 'idx_maintenance_status', 'status');

-- -----------------------------------------------------
-- 2. Create driver_scores_history table
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS driver_scores_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  driver_id INT NOT NULL,
  score INT NOT NULL,
  evaluation_date DATE NOT NULL,
  evaluator_id INT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_driver_scores_driver FOREIGN KEY (driver_id) REFERENCES drivers(id) ON DELETE CASCADE,
  CONSTRAINT fk_driver_scores_evaluator FOREIGN KEY (evaluator_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Add index for efficient querying
CALL create_index_if_not_exists('driver_scores_history', 'idx_driver_scores_driver', 'driver_id');
CALL create_index_if_not_exists('driver_scores_history', 'idx_driver_scores_date', 'evaluation_date');

-- -----------------------------------------------------
-- 3. Create device_telemetry_config table
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS device_telemetry_config (
  id INT AUTO_INCREMENT PRIMARY KEY,
  device_id INT NOT NULL,
  config_name VARCHAR(50) NOT NULL,
  config_value TEXT NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_device_config_device FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE,
  CONSTRAINT uk_device_config UNIQUE (device_id, config_name)
);

-- Add index for quick lookups
CALL create_index_if_not_exists('device_telemetry_config', 'idx_device_config_device', 'device_id');
CALL create_index_if_not_exists('device_telemetry_config', 'idx_device_config_active', 'active');

-- -----------------------------------------------------
-- 4. Create vehicle_cameras table
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS vehicle_cameras (
  id INT AUTO_INCREMENT PRIMARY KEY,
  vehicle_id INT NOT NULL,
  camera_type VARCHAR(50) NOT NULL,
  location VARCHAR(50) NOT NULL,
  serial_number VARCHAR(50),
  installation_date DATE,
  status ENUM('active', 'inactive', 'maintenance') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_vehicle_cameras_vehicle FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
);

-- Add index for efficient querying
CALL create_index_if_not_exists('vehicle_cameras', 'idx_vehicle_cameras_vehicle', 'vehicle_id');
CALL create_index_if_not_exists('vehicle_cameras', 'idx_vehicle_cameras_status', 'status');

-- -----------------------------------------------------
-- 5. Add new columns to existing tables
-- -----------------------------------------------------

-- Enhance vehicles table (check if columns exist before adding them)
SELECT 'MIGRATION LOG: Enhancing vehicles table with new columns' AS log_message;

-- Function to check if a column exists
DROP PROCEDURE IF EXISTS add_column_if_not_exists;
DELIMITER $$
CREATE PROCEDURE add_column_if_not_exists(
    IN table_name VARCHAR(64),
    IN column_name VARCHAR(64),
    IN column_definition VARCHAR(255)
)
BEGIN
    DECLARE column_exists INT DEFAULT 0;
    SET @sql := CONCAT(
      'SELECT COUNT(*) INTO @column_exists FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = ''', table_name, ''' AND column_name = ''', column_name, ''''
    );
    PREPARE stmt FROM @sql;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
    SET column_exists = @column_exists;
    
    IF column_exists = 0 THEN
        SET @sql = CONCAT('ALTER TABLE ', table_name, ' ADD COLUMN ', column_name, ' ', column_definition);
        PREPARE stmt FROM @sql;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
        
        SELECT CONCAT('MIGRATION LOG: Added column ', column_name, ' to table ', table_name) AS log_message;
    ELSE
        SELECT CONCAT('MIGRATION LOG: Column ', column_name, ' already exists in table ', table_name) AS log_message;
    END IF;
END$$
DELIMITER ;

-- Add columns to vehicles table if they don't exist
CALL add_column_if_not_exists('vehicles', 'last_maintenance_date', 'DATE');
CALL add_column_if_not_exists('vehicles', 'next_maintenance_date', 'DATE');
CALL add_column_if_not_exists('vehicles', 'fuel_type', 'ENUM(''diesel'', ''gasoline'', ''electric'', ''hybrid'', ''other'') DEFAULT ''diesel''');
CALL add_column_if_not_exists('vehicles', 'tank_capacity', 'DECIMAL(8,2)');
CALL add_column_if_not_exists('vehicles', 'mileage', 'INT DEFAULT 0');
CALL add_column_if_not_exists('vehicles', 'insurance_expiry', 'DATE');
CALL add_column_if_not_exists('vehicles', 'technical_inspection_date', 'DATE');
CALL add_column_if_not_exists('vehicles', 'technical_inspection_expiry', 'DATE');

-- Indexes will be created at the end after all columns are added

-- Enhance drivers table (check if columns exist before adding them)
SELECT 'MIGRATION LOG: Enhancing drivers table with new columns' AS log_message;

-- Add columns to drivers table if they don't exist
CALL add_column_if_not_exists('drivers', 'last_training_date', 'DATE');
CALL add_column_if_not_exists('drivers', 'next_training_date', 'DATE');
CALL add_column_if_not_exists('drivers', 'license_expiry_date', 'DATE');
CALL add_column_if_not_exists('drivers', 'profile_picture', 'VARCHAR(255)');
CALL add_column_if_not_exists('drivers', 'emergency_contact', 'VARCHAR(100)');
CALL add_column_if_not_exists('drivers', 'emergency_phone', 'VARCHAR(30)');
CALL add_column_if_not_exists('drivers', 'hire_date', 'DATE');

-- Indexes will be created at the end after all columns are added

-- Enhance telemetry table (check if columns exist before adding them)
SELECT 'MIGRATION LOG: Enhancing telemetry table with new columns' AS log_message;

-- Add columns to telemetry table if they don't exist
CALL add_column_if_not_exists('telemetry', 'engine_temp', 'FLOAT');
CALL add_column_if_not_exists('telemetry', 'battery_level', 'FLOAT');
CALL add_column_if_not_exists('telemetry', 'engine_status', 'VARCHAR(50)');
CALL add_column_if_not_exists('telemetry', 'acceleration', 'FLOAT');
CALL add_column_if_not_exists('telemetry', 'braking', 'FLOAT');
CALL add_column_if_not_exists('telemetry', 'heading', 'INT');
CALL add_column_if_not_exists('telemetry', 'altitude', 'FLOAT');
CALL add_column_if_not_exists('telemetry', 'ignition_status', 'BOOLEAN');

-- Enhance devices table (check if columns exist before adding them)
SELECT 'MIGRATION LOG: Enhancing devices table with new columns' AS log_message;

-- Add columns to devices table if they don't exist
CALL add_column_if_not_exists('devices', 'installation_date', 'DATE');
CALL add_column_if_not_exists('devices', 'last_maintenance_date', 'DATE');
CALL add_column_if_not_exists('devices', 'model', 'VARCHAR(50)');
CALL add_column_if_not_exists('devices', 'manufacturer', 'VARCHAR(50)');
CALL add_column_if_not_exists('devices', 'sim_number', 'VARCHAR(50)');
CALL add_column_if_not_exists('devices', 'ip_address', 'VARCHAR(45)');
CALL add_column_if_not_exists('devices', 'last_connection', 'DATETIME');

-- Indexes will be created at the end after all columns are added

-- -----------------------------------------------------
-- 6. Migrate cameras data from vehicles table
-- -----------------------------------------------------

-- Instead of using a stored procedure with cursors which can be problematic,
-- use a simpler direct approach to migrate camera data
SELECT 'MIGRATION LOG: Using simplified approach for camera migration' AS log_message;

-- Insert front cameras for vehicles that have cameras JSON data but no existing camera records
INSERT INTO vehicle_cameras (vehicle_id, camera_type, location)
SELECT v.id, 'DVR', 'Front'
FROM vehicles v
WHERE v.cameras IS NOT NULL 
  AND JSON_LENGTH(v.cameras) > 0
  AND NOT EXISTS (
    SELECT 1 FROM vehicle_cameras vc 
    WHERE vc.vehicle_id = v.id AND vc.location = 'Front'
  );

-- Count how many front cameras were added
SELECT COUNT(*) INTO @front_cameras_added
FROM vehicle_cameras
WHERE location = 'Front'
  AND created_at > DATE_SUB(NOW(), INTERVAL 1 MINUTE);

SELECT CONCAT('MIGRATION LOG: Added ', @front_cameras_added, ' front cameras') AS log_message;

-- Insert cabin cameras for vehicles that have cameras JSON data with at least 2 elements
INSERT INTO vehicle_cameras (vehicle_id, camera_type, location)
SELECT v.id, 'DVR', 'Cabin'
FROM vehicles v
WHERE v.cameras IS NOT NULL 
  AND JSON_LENGTH(v.cameras) > 1
  AND NOT EXISTS (
    SELECT 1 FROM vehicle_cameras vc 
    WHERE vc.vehicle_id = v.id AND vc.location = 'Cabin'
  );

-- Count how many cabin cameras were added
SELECT COUNT(*) INTO @cabin_cameras_added
FROM vehicle_cameras
WHERE location = 'Cabin'
  AND created_at > DATE_SUB(NOW(), INTERVAL 1 MINUTE);

SELECT CONCAT('MIGRATION LOG: Added ', @cabin_cameras_added, ' cabin cameras') AS log_message;
SELECT CONCAT('MIGRATION LOG: Camera migration completed - added ', @front_cameras_added + @cabin_cameras_added, ' total camera records') AS log_message;

-- -----------------------------------------------------
-- 7. Create all indexes after all columns have been added
-- -----------------------------------------------------
SELECT 'MIGRATION LOG: Creating indexes on newly added columns' AS log_message;

-- First verify that all columns exist before creating indexes
-- Indexes for vehicles table
CALL create_index_if_not_exists('vehicles', 'idx_vehicles_next_maintenance', 'next_maintenance_date');
SELECT 'MIGRATION LOG: Created index on vehicles.next_maintenance_date' AS log_message;
CALL create_index_if_not_exists('vehicles', 'idx_vehicles_insurance_expiry', 'insurance_expiry');
SELECT 'MIGRATION LOG: Created index on vehicles.insurance_expiry' AS log_message;
CALL create_index_if_not_exists('vehicles', 'idx_vehicles_technical_inspection_expiry', 'technical_inspection_expiry');
SELECT 'MIGRATION LOG: Created index on vehicles.technical_inspection_expiry' AS log_message;

-- Indexes for drivers table
CALL create_index_if_not_exists('drivers', 'idx_drivers_license_expiry', 'license_expiry_date');
SELECT 'MIGRATION LOG: Created index on drivers.license_expiry_date' AS log_message;
CALL create_index_if_not_exists('drivers', 'idx_drivers_next_training', 'next_training_date');
SELECT 'MIGRATION LOG: Created index on drivers.next_training_date' AS log_message;

-- Indexes for devices table
CALL create_index_if_not_exists('devices', 'idx_devices_last_connection', 'last_connection');
SELECT 'MIGRATION LOG: Created index on devices.last_connection' AS log_message;

-- Drop the procedures after use
DROP PROCEDURE IF EXISTS migrate_vehicle_cameras;
DROP PROCEDURE IF EXISTS add_column_if_not_exists;
DROP PROCEDURE IF EXISTS create_index_if_not_exists;

-- Commit all changes if everything went well
COMMIT;
