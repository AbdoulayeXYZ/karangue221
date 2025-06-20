-- Migration script Phase 1: Fix redundancy and add reference tables
-- Created: 2025-06-20

-- Start transaction to ensure all operations succeed or fail together
START TRANSACTION;

-- -----------------------------------------------------
-- 1. Fix redundancy in telemetry table
-- -----------------------------------------------------

-- Create a safer approach by creating a new table structure and migrating data
-- instead of directly modifying columns with foreign key constraints

-- First, check if telemetry_old table exists, if so, drop it 
-- (This may be from a previous migration attempt)
SELECT @old_table_exists := COUNT(*)
FROM information_schema.tables
WHERE table_schema = DATABASE() 
  AND table_name = 'telemetry_old';

SET @drop_old_table_sql = IF(@old_table_exists > 0,
  'DROP TABLE telemetry_old',
  'SELECT 1');
PREPARE stmt FROM @drop_old_table_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Log the beginning of telemetry table migration
SELECT 'MIGRATION LOG: Starting telemetry table restructuring' AS log_message;

-- Check if any foreign key constraints exist for telemetry table
SELECT @constraint_count := COUNT(*) 
FROM information_schema.table_constraints 
WHERE constraint_schema = DATABASE() 
  AND table_name = 'telemetry' 
  AND constraint_type = 'FOREIGN KEY';

SELECT CONCAT('MIGRATION LOG: Found ', @constraint_count, ' foreign key constraints on telemetry table') AS log_message;

-- Disable foreign key checks temporarily for this session
SET FOREIGN_KEY_CHECKS = 0;
SELECT 'MIGRATION LOG: Disabled foreign key checks for migration' AS log_message;

-- Create a new table with the correct structure
CREATE TABLE telemetry_new (
  id INT AUTO_INCREMENT PRIMARY KEY,
  vehicle_id INT NOT NULL,
  driver_id INT,
  timestamp DATETIME,
  latitude DECIMAL(10,7),
  longitude DECIMAL(10,7),
  speed FLOAT,
  fuel_level FLOAT,
  temperature FLOAT,
  CONSTRAINT fk_telemetry_vehicle 
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
  CONSTRAINT fk_telemetry_driver
    FOREIGN KEY (driver_id) REFERENCES drivers(id) ON DELETE SET NULL,
  INDEX idx_telemetry_timestamp (timestamp),
  INDEX idx_telemetry_vehicle_time (vehicle_id, timestamp)
);

SELECT 'MIGRATION LOG: Created new telemetry table structure' AS log_message;

-- Count records in original table
SELECT @original_count := COUNT(*) FROM telemetry;
SELECT CONCAT('MIGRATION LOG: Original telemetry table has ', @original_count, ' records') AS log_message;

-- Copy data from the original table to the new one
-- Use column names explicitly to avoid duplicate column issues
INSERT INTO telemetry_new (
  id, vehicle_id, timestamp, latitude, longitude, 
  speed, fuel_level, temperature
)
SELECT 
  id, vehicle_id, timestamp, latitude, longitude, 
  speed, fuel_level, temperature
FROM telemetry;

-- Count records in the new table to verify migration
SELECT @new_count := COUNT(*) FROM telemetry_new;
SELECT CONCAT('MIGRATION LOG: New telemetry table has ', @new_count, ' records') AS log_message;

-- Verify counts match
SELECT IF(@original_count = @new_count, 
  'MIGRATION LOG: Data migration successful - record counts match', 
  'MIGRATION LOG: WARNING - record counts do not match!') AS log_message;

-- Rename tables to replace the original with the fixed version
RENAME TABLE telemetry TO telemetry_old, telemetry_new TO telemetry;
SELECT 'MIGRATION LOG: Renamed tables to replace original with new structure' AS log_message;

-- Drop the old table to completely remove redundant columns
DROP TABLE telemetry_old;
SELECT 'MIGRATION LOG: Dropped old telemetry table with redundant columns' AS log_message;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;
SELECT 'MIGRATION LOG: Re-enabled foreign key checks' AS log_message;

-- Verify the telemetry table no longer has redundant columns
SELECT @redundant_count := COUNT(*) 
FROM information_schema.columns 
WHERE table_schema = DATABASE() 
  AND table_name = 'telemetry' 
  AND column_name IN ('vehicle_id', 'latitude', 'longitude', 'speed')
  AND column_name = CONCAT('_', column_name);

SELECT IF(@redundant_count = 0, 
  'MIGRATION LOG: Verification successful - no redundant columns found', 
  'MIGRATION LOG: ERROR - redundant columns still exist!') AS log_message;

-- -----------------------------------------------------
-- 2. Create reference tables for enumeration types
-- -----------------------------------------------------

-- Create violation_types table if it doesn't exist
CREATE TABLE IF NOT EXISTS violation_types (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  severity ENUM('low', 'medium', 'high') DEFAULT 'medium',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create incident_types table if it doesn't exist
CREATE TABLE IF NOT EXISTS incident_types (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  severity ENUM('low', 'medium', 'high') DEFAULT 'medium',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create activity_types table if it doesn't exist
CREATE TABLE IF NOT EXISTS activity_types (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create device_types table if it doesn't exist
CREATE TABLE IF NOT EXISTS device_types (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(30) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------
-- 3. Add foreign keys to link to reference tables
-- -----------------------------------------------------

-- Check if violation_type_id column exists in violations table
SELECT @column_exists := COUNT(*)
FROM information_schema.columns 
WHERE table_schema = DATABASE() 
  AND table_name = 'violations' 
  AND column_name = 'violation_type_id';

-- Add column only if it doesn't exist
SET @add_column_sql = IF(@column_exists = 0,
  'ALTER TABLE violations ADD COLUMN violation_type_id INT AFTER type',
  'SELECT 1');
PREPARE stmt FROM @add_column_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Create index if it doesn't exist
SELECT @index_exists := COUNT(*)
FROM information_schema.statistics
WHERE table_schema = DATABASE() 
  AND table_name = 'violations' 
  AND index_name = 'idx_violations_type';

SET @create_index_sql = IF(@index_exists = 0,
  'CREATE INDEX idx_violations_type ON violations(violation_type_id)',
  'SELECT 1');
PREPARE stmt FROM @create_index_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Similar pattern for incidents table
SELECT @column_exists := COUNT(*)
FROM information_schema.columns 
WHERE table_schema = DATABASE() 
  AND table_name = 'incidents' 
  AND column_name = 'incident_type_id';

SET @add_column_sql = IF(@column_exists = 0,
  'ALTER TABLE incidents ADD COLUMN incident_type_id INT AFTER type',
  'SELECT 1');
PREPARE stmt FROM @add_column_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SELECT @index_exists := COUNT(*)
FROM information_schema.statistics
WHERE table_schema = DATABASE() 
  AND table_name = 'incidents' 
  AND index_name = 'idx_incidents_type';

SET @create_index_sql = IF(@index_exists = 0,
  'CREATE INDEX idx_incidents_type ON incidents(incident_type_id)',
  'SELECT 1');
PREPARE stmt FROM @create_index_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Similar pattern for activities table
SELECT @column_exists := COUNT(*)
FROM information_schema.columns 
WHERE table_schema = DATABASE() 
  AND table_name = 'activities' 
  AND column_name = 'activity_type_id';

SET @add_column_sql = IF(@column_exists = 0,
  'ALTER TABLE activities ADD COLUMN activity_type_id INT AFTER type',
  'SELECT 1');
PREPARE stmt FROM @add_column_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SELECT @index_exists := COUNT(*)
FROM information_schema.statistics
WHERE table_schema = DATABASE() 
  AND table_name = 'activities' 
  AND index_name = 'idx_activities_type';

SET @create_index_sql = IF(@index_exists = 0,
  'CREATE INDEX idx_activities_type ON activities(activity_type_id)',
  'SELECT 1');
PREPARE stmt FROM @create_index_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Similar pattern for devices table
SELECT @column_exists := COUNT(*)
FROM information_schema.columns 
WHERE table_schema = DATABASE() 
  AND table_name = 'devices' 
  AND column_name = 'device_type_id';

SET @add_column_sql = IF(@column_exists = 0,
  'ALTER TABLE devices ADD COLUMN device_type_id INT AFTER type',
  'SELECT 1');
PREPARE stmt FROM @add_column_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SELECT @index_exists := COUNT(*)
FROM information_schema.statistics
WHERE table_schema = DATABASE() 
  AND table_name = 'devices' 
  AND index_name = 'idx_devices_type';

SET @create_index_sql = IF(@index_exists = 0,
  'CREATE INDEX idx_devices_type ON devices(device_type_id)',
  'SELECT 1');
PREPARE stmt FROM @create_index_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- We'll migrate the data in a separate step

-- -----------------------------------------------------
-- 4. Add necessary indexes for better performance
-- -----------------------------------------------------

-- Function to check and create indexes if they don't exist
DELIMITER //
CREATE PROCEDURE IF NOT EXISTS create_index_if_not_exists(
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
      AND index_name = p_index_name;
    
    IF index_exists = 0 THEN
        SET @create_index_sql = CONCAT('CREATE INDEX ', p_index_name, ' ON ', p_table_name, '(', p_column_list, ')');
        PREPARE stmt FROM @create_index_sql;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
    END IF;
END //
DELIMITER ;

-- Call the procedure for each index we want to create
CALL create_index_if_not_exists('vehicles', 'idx_vehicles_registration', 'registration');
CALL create_index_if_not_exists('drivers', 'idx_drivers_license', 'license_number');
CALL create_index_if_not_exists('vehicle_assignments', 'idx_vehicle_assignments_vehicle_driver', 'vehicle_id, driver_id');
CALL create_index_if_not_exists('incidents', 'idx_incidents_timestamp', 'timestamp');
CALL create_index_if_not_exists('violations', 'idx_violations_timestamp', 'timestamp');
CALL create_index_if_not_exists('activities', 'idx_activities_timestamp', 'timestamp');
CALL create_index_if_not_exists('notifications', 'idx_notifications_user', 'user_id');
CALL create_index_if_not_exists('notifications', 'idx_notifications_timestamp', 'timestamp');

-- Drop the procedure after use
DROP PROCEDURE IF EXISTS create_index_if_not_exists;

-- -----------------------------------------------------
-- 5. Fix ON DELETE behavior for foreign keys
-- -----------------------------------------------------

-- Function to safely update foreign key constraints
DELIMITER //
CREATE PROCEDURE IF NOT EXISTS update_foreign_key(
    IN p_table_name VARCHAR(64),
    IN p_constraint_name VARCHAR(64),
    IN p_column_name VARCHAR(64),
    IN p_referenced_table VARCHAR(64),
    IN p_referenced_column VARCHAR(64),
    IN p_on_delete VARCHAR(64)
)
BEGIN
    DECLARE constraint_exists INT;
    
    -- Check if the constraint exists
    SELECT COUNT(*) INTO constraint_exists
    FROM information_schema.table_constraints
    WHERE table_schema = DATABASE() 
      AND table_name = p_table_name 
      AND constraint_name = p_constraint_name
      AND constraint_type = 'FOREIGN KEY';
    
    -- If it exists, drop it
    IF constraint_exists > 0 THEN
        SET @drop_fk_sql = CONCAT('ALTER TABLE ', p_table_name, ' DROP FOREIGN KEY ', p_constraint_name);
        PREPARE stmt FROM @drop_fk_sql;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
    END IF;
    
    -- Add the new constraint with proper ON DELETE behavior
    SET @add_fk_sql = CONCAT(
        'ALTER TABLE ', p_table_name, 
        ' ADD CONSTRAINT ', p_constraint_name,
        ' FOREIGN KEY (', p_column_name, ')',
        ' REFERENCES ', p_referenced_table, '(', p_referenced_column, ')',
        ' ON DELETE ', p_on_delete
    );
    
    PREPARE stmt FROM @add_fk_sql;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
END //
DELIMITER ;

-- We don't need to fix the telemetry table because we already created it with the proper constraints

-- Fix foreign keys for all other tables
CALL update_foreign_key('vehicle_assignments', 'fk_vehicle_assignments_vehicle', 'vehicle_id', 'vehicles', 'id', 'CASCADE');
CALL update_foreign_key('vehicle_assignments', 'fk_vehicle_assignments_driver', 'driver_id', 'drivers', 'id', 'CASCADE');

CALL update_foreign_key('incidents', 'fk_incidents_vehicle', 'vehicle_id', 'vehicles', 'id', 'SET NULL');
CALL update_foreign_key('incidents', 'fk_incidents_driver', 'driver_id', 'drivers', 'id', 'SET NULL');

CALL update_foreign_key('violations', 'fk_violations_driver', 'driver_id', 'drivers', 'id', 'SET NULL');
CALL update_foreign_key('violations', 'fk_violations_vehicle', 'vehicle_id', 'vehicles', 'id', 'SET NULL');

CALL update_foreign_key('activities', 'fk_activities_vehicle', 'vehicle_id', 'vehicles', 'id', 'SET NULL');
CALL update_foreign_key('activities', 'fk_activities_driver', 'driver_id', 'drivers', 'id', 'SET NULL');

CALL update_foreign_key('devices', 'fk_devices_vehicle', 'vehicle_id', 'vehicles', 'id', 'SET NULL');

CALL update_foreign_key('notifications', 'fk_notifications_user', 'user_id', 'users', 'id', 'CASCADE');

-- Add foreign key constraints for the type reference tables
CALL update_foreign_key('violations', 'fk_violations_type', 'violation_type_id', 'violation_types', 'id', 'SET NULL');
CALL update_foreign_key('incidents', 'fk_incidents_type', 'incident_type_id', 'incident_types', 'id', 'SET NULL');
CALL update_foreign_key('activities', 'fk_activities_type', 'activity_type_id', 'activity_types', 'id', 'SET NULL');
CALL update_foreign_key('devices', 'fk_devices_type', 'device_type_id', 'device_types', 'id', 'SET NULL');

-- Drop the procedure after use
DROP PROCEDURE IF EXISTS update_foreign_key;

-- Commit all changes if everything went well
COMMIT;
