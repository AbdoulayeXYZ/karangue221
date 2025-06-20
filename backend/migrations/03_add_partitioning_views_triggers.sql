-- Migration script Phase 3: Performance Optimization, Views, and Triggers
-- Created: 2025-06-20

-- Start transaction to ensure all operations succeed or fail together
START TRANSACTION;

-- -----------------------------------------------------
-- 1. Create archive solution for telemetry data
-- -----------------------------------------------------

-- First, log our approach
SELECT 'MIGRATION LOG: Using archive table approach instead of partitioning for compatibility with foreign keys' AS log_message;

-- Ajout de la procédure pour créer un index si elle n'existe pas
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

-- Add optimized indexes to telemetry table
CALL create_index_if_not_exists('telemetry', 'idx_telemetry_vehicle_time', 'vehicle_id, timestamp');
CALL create_index_if_not_exists('telemetry', 'idx_telemetry_timestamp', 'timestamp');
CALL create_index_if_not_exists('telemetry', 'idx_telemetry_driver', 'driver_id');
-- CALL create_index_if_not_exists('telemetry', 'idx_telemetry_date', 'DATE(timestamp)');

-- Add a flag to indicate if a record has been archived
ALTER TABLE telemetry ADD COLUMN archived BOOLEAN DEFAULT FALSE;
CREATE INDEX idx_telemetry_archived ON telemetry(archived);

-- Create telemetry_archive table with identical structure (but without foreign keys)
CREATE TABLE telemetry_archive (
  id INT AUTO_INCREMENT PRIMARY KEY,
  vehicle_id INT NOT NULL,
  driver_id INT,
  timestamp DATETIME NOT NULL,
  latitude DECIMAL(10,7),
  longitude DECIMAL(10,7),
  speed FLOAT,
  fuel_level FLOAT,
  temperature FLOAT,
  engine_temp FLOAT,
  battery_level FLOAT,
  engine_status VARCHAR(50),
  acceleration FLOAT,
  braking FLOAT,
  heading INT,
  altitude FLOAT,
  ignition_status BOOLEAN,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  archived BOOLEAN DEFAULT TRUE,
  INDEX idx_archive_vehicle_time (vehicle_id, timestamp),
  INDEX idx_archive_timestamp (timestamp),
  INDEX idx_archive_driver (driver_id)
);

-- Create stored procedures for telemetry data management
-- Drop existing procedures if they exist to avoid conflicts
DROP PROCEDURE IF EXISTS archive_telemetry_data;
DROP PROCEDURE IF EXISTS prune_telemetry_data;
DROP PROCEDURE IF EXISTS get_telemetry_data;

-- Change delimiter for procedure creation
DELIMITER $$

-- Procedure to archive old telemetry data
CREATE PROCEDURE archive_telemetry_data(IN archive_older_than_days INT)
BEGIN
  DECLARE archive_date DATE;
  DECLARE rows_affected INT;
  
  -- Calculate cutoff date
  SET archive_date = DATE_SUB(CURRENT_DATE(), INTERVAL archive_older_than_days DAY);
  
  SELECT CONCAT('MIGRATION LOG: Archiving telemetry data older than ', archive_date) AS log_message;
  
  -- Insert old records into archive table
  INSERT INTO telemetry_archive (
    id, vehicle_id, driver_id, timestamp, latitude, longitude, 
    speed, fuel_level, temperature, engine_temp, battery_level, 
    engine_status, acceleration, braking, heading, altitude, 
    ignition_status, created_at, archived
  )
  SELECT 
    id, vehicle_id, driver_id, timestamp, latitude, longitude, 
    speed, fuel_level, temperature, engine_temp, battery_level, 
    engine_status, acceleration, braking, heading, altitude, 
    ignition_status, created_at, TRUE
  FROM telemetry
  WHERE DATE(timestamp) < archive_date
    AND archived = FALSE;
  
  -- Get rows affected
  SET rows_affected = ROW_COUNT();
  
  -- Mark records as archived
  UPDATE telemetry 
  SET archived = TRUE
  WHERE DATE(timestamp) < archive_date
    AND archived = FALSE;
  
  -- Log result
  SELECT CONCAT('MIGRATION LOG: Archived ', rows_affected, ' telemetry records') AS log_message;
END$$

-- Procedure to prune archived telemetry data
CREATE PROCEDURE prune_telemetry_data(IN retention_days INT)
BEGIN
  DECLARE prune_date DATE;
  DECLARE rows_affected INT;
  
  -- Calculate retention date
  SET prune_date = DATE_SUB(CURRENT_DATE(), INTERVAL retention_days DAY);
  
  SELECT CONCAT('MIGRATION LOG: Pruning archived telemetry data older than ', prune_date) AS log_message;
  
  -- Delete old archived records
  DELETE FROM telemetry
  WHERE DATE(timestamp) < prune_date
    AND archived = TRUE;
  
  -- Get rows affected
  SET rows_affected = ROW_COUNT();
  
  -- Log result
  SELECT CONCAT('MIGRATION LOG: Pruned ', rows_affected, ' telemetry records') AS log_message;
END$$

-- Procedure to get telemetry data (automatically checks both tables)
CREATE PROCEDURE get_telemetry_data(
  IN p_vehicle_id INT,
  IN p_start_date DATETIME,
  IN p_end_date DATETIME
)
BEGIN
  -- First check current table
  SELECT * FROM telemetry
  WHERE vehicle_id = p_vehicle_id
    AND timestamp BETWEEN p_start_date AND p_end_date
  
  UNION ALL
  
  -- Then check archive table
  SELECT * FROM telemetry_archive
  WHERE vehicle_id = p_vehicle_id
    AND timestamp BETWEEN p_start_date AND p_end_date
  
  ORDER BY timestamp;
END$$

-- Reset delimiter
DELIMITER ;

-- -----------------------------------------------------
-- 2. Create views for frequently used queries
-- -----------------------------------------------------

-- Dashboard Summary View
CREATE OR REPLACE VIEW dashboard_summary AS
SELECT 
  f.id AS fleet_id,
  f.name AS fleet_name,
  COUNT(DISTINCT v.id) AS total_vehicles,
  SUM(CASE WHEN v.status = 'active' THEN 1 ELSE 0 END) AS active_vehicles,
  SUM(CASE WHEN v.status = 'maintenance' THEN 1 ELSE 0 END) AS maintenance_vehicles,
  SUM(CASE WHEN v.status = 'inactive' THEN 1 ELSE 0 END) AS inactive_vehicles,
  COUNT(DISTINCT d.id) AS total_drivers,
  SUM(CASE WHEN d.status = 'active' THEN 1 ELSE 0 END) AS active_drivers,
  SUM(CASE WHEN d.status = 'inactive' THEN 1 ELSE 0 END) AS inactive_drivers,
  COUNT(DISTINCT i.id) AS total_incidents,
  SUM(CASE WHEN i.status = 'open' THEN 1 ELSE 0 END) AS open_incidents,
  COUNT(DISTINCT vio.id) AS total_violations
FROM 
  fleets f
  LEFT JOIN vehicles v ON f.id = v.fleet_id
  LEFT JOIN drivers d ON f.id = d.fleet_id
  LEFT JOIN incidents i ON v.id = i.vehicle_id
  LEFT JOIN violations vio ON v.id = vio.vehicle_id
GROUP BY 
  f.id, f.name;

-- Active Vehicle Status View
CREATE OR REPLACE VIEW active_vehicle_status AS
SELECT 
  v.id AS vehicle_id,
  v.registration,
  v.brand,
  v.model,
  v.fleet_id,
  f.name AS fleet_name,
  d.id AS driver_id,
  CONCAT(d.first_name, ' ', d.last_name) AS driver_name,
  t.timestamp AS last_update,
  t.latitude,
  t.longitude,
  t.speed,
  t.fuel_level,
  t.ignition_status,
  t.engine_status
FROM 
  vehicles v
  JOIN fleets f ON v.fleet_id = f.id
  LEFT JOIN (
    SELECT 
      va.vehicle_id, 
      va.driver_id
    FROM 
      vehicle_assignments va
    WHERE 
      va.status = 'active'
  ) AS current_assignment ON v.id = current_assignment.vehicle_id
  LEFT JOIN drivers d ON current_assignment.driver_id = d.id
  LEFT JOIN (
    SELECT 
      t1.vehicle_id, 
      t1.timestamp, 
      t1.latitude, 
      t1.longitude, 
      t1.speed, 
      t1.fuel_level,
      t1.ignition_status,
      t1.engine_status
    FROM 
      telemetry t1
    INNER JOIN (
      SELECT 
        vehicle_id, 
        MAX(timestamp) AS max_timestamp
      FROM 
        telemetry
      GROUP BY 
        vehicle_id
    ) t2 ON t1.vehicle_id = t2.vehicle_id AND t1.timestamp = t2.max_timestamp
  ) AS t ON v.id = t.vehicle_id
WHERE 
  v.status = 'active';

-- Driver Performance View
CREATE OR REPLACE VIEW driver_performance AS
SELECT 
  d.id AS driver_id,
  CONCAT(d.first_name, ' ', d.last_name) AS driver_name,
  d.fleet_id,
  f.name AS fleet_name,
  d.overallScore AS current_score,
  d.trend,
  COALESCE(COUNT(vio.id), 0) AS violation_count,
  COALESCE(dsh.avg_score, 0) AS average_score,
  v.registration AS current_vehicle,
  CONCAT(v.brand, ' ', v.model) AS vehicle_model
FROM 
  drivers d
  JOIN fleets f ON d.fleet_id = f.id
  LEFT JOIN violations vio ON d.id = vio.driver_id AND vio.timestamp > DATE_SUB(NOW(), INTERVAL 30 DAY)
  LEFT JOIN (
    SELECT 
      driver_id, 
      AVG(score) AS avg_score
    FROM 
      driver_scores_history
    WHERE 
      evaluation_date > DATE_SUB(NOW(), INTERVAL 6 MONTH)
    GROUP BY 
      driver_id
  ) AS dsh ON d.id = dsh.driver_id
  LEFT JOIN (
    SELECT 
      vehicle_id, 
      driver_id
    FROM 
      vehicle_assignments
    WHERE 
      status = 'active'
  ) AS va ON d.id = va.driver_id
  LEFT JOIN vehicles v ON va.vehicle_id = v.id
GROUP BY 
  d.id, d.first_name, d.last_name, d.fleet_id, f.name, d.overallScore, d.trend, 
  dsh.avg_score, v.registration, v.brand, v.model;

-- Maintenance Due View
CREATE OR REPLACE VIEW maintenance_due AS
SELECT 
  v.id AS vehicle_id,
  v.registration,
  v.brand,
  v.model,
  v.fleet_id,
  f.name AS fleet_name,
  v.last_maintenance_date,
  v.next_maintenance_date,
  v.insurance_expiry,
  v.technical_inspection_expiry,
  CASE 
    WHEN v.next_maintenance_date <= DATE_ADD(CURDATE(), INTERVAL 7 DAY) THEN 'urgent'
    WHEN v.next_maintenance_date <= DATE_ADD(CURDATE(), INTERVAL 30 DAY) THEN 'upcoming'
    ELSE 'scheduled'
  END AS maintenance_status,
  CASE 
    WHEN v.insurance_expiry <= DATE_ADD(CURDATE(), INTERVAL 7 DAY) THEN 'urgent'
    WHEN v.insurance_expiry <= DATE_ADD(CURDATE(), INTERVAL 30 DAY) THEN 'upcoming'
    ELSE 'valid'
  END AS insurance_status,
  CASE 
    WHEN v.technical_inspection_expiry <= DATE_ADD(CURDATE(), INTERVAL 7 DAY) THEN 'urgent'
    WHEN v.technical_inspection_expiry <= DATE_ADD(CURDATE(), INTERVAL 30 DAY) THEN 'upcoming'
    ELSE 'valid'
  END AS inspection_status
FROM 
  vehicles v
  JOIN fleets f ON v.fleet_id = f.id
WHERE 
  v.next_maintenance_date <= DATE_ADD(CURDATE(), INTERVAL 30 DAY)
  OR v.insurance_expiry <= DATE_ADD(CURDATE(), INTERVAL 30 DAY)
  OR v.technical_inspection_expiry <= DATE_ADD(CURDATE(), INTERVAL 30 DAY);

-- Recent Violations View
CREATE OR REPLACE VIEW recent_violations AS
SELECT 
  vio.id AS violation_id,
  vio.driver_id,
  CONCAT(d.first_name, ' ', d.last_name) AS driver_name,
  vio.vehicle_id,
  v.registration,
  vio.type AS violation_type,
  vio.severity,
  vio.timestamp,
  vio.location,
  vio.speed,
  vio.speedLimit,
  vio.status
FROM 
  violations vio
  LEFT JOIN drivers d ON vio.driver_id = d.id
  LEFT JOIN vehicles v ON vio.vehicle_id = v.id
WHERE 
  vio.timestamp > DATE_SUB(NOW(), INTERVAL 30 DAY)
ORDER BY 
  vio.timestamp DESC;

-- -----------------------------------------------------
-- 3. Create triggers for data automation
-- -----------------------------------------------------

-- Trigger to update driver score when a new violation is added
-- Drop trigger if it exists
DROP TRIGGER IF EXISTS after_violation_insert;

-- Change delimiter for trigger creation
DELIMITER $$
CREATE TRIGGER after_violation_insert
AFTER INSERT ON violations
FOR EACH ROW
BEGIN
  DECLARE current_score INT;
  DECLARE penalty INT;
  DECLARE new_trend VARCHAR(10);
  
  -- Set penalty based on severity
  CASE NEW.severity
    WHEN 'low' THEN SET penalty = 1;
    WHEN 'medium' THEN SET penalty = 3;
    WHEN 'high' THEN SET penalty = 5;
    ELSE SET penalty = 2;
  END CASE;
  
  -- Get current score
  SELECT overallScore INTO current_score FROM drivers WHERE id = NEW.driver_id;
  
  -- Calculate new trend
  IF current_score > (current_score - penalty) THEN
    SET new_trend = 'down';
  ELSE
    SET new_trend = 'stable';
  END IF;
  
  -- Update driver score
  UPDATE drivers 
  SET 
    overallScore = GREATEST(0, current_score - penalty),
    trend = new_trend
  WHERE id = NEW.driver_id;
  
  -- Insert into driver_scores_history
  INSERT INTO driver_scores_history (driver_id, score, evaluation_date, notes)
  VALUES (NEW.driver_id, GREATEST(0, current_score - penalty), CURDATE(), CONCAT('Violation penalty: ', penalty, ' points'));
  
  -- Create a notification for the fleet owner
  INSERT INTO notifications (user_id, type, message, timestamp)
  SELECT 
    u.id, 
    'violation', 
    CONCAT('New violation recorded for driver ', d.first_name, ' ', d.last_name, ': ', NEW.type), 
    NOW()
  FROM 
    drivers d
    JOIN fleets f ON d.fleet_id = f.id
    JOIN users u ON f.owner_id = u.id
  WHERE 
    d.id = NEW.driver_id;
END$$

-- Reset delimiter
DELIMITER ;

-- Trigger to update next maintenance date when maintenance is completed
-- Drop trigger if it exists
DROP TRIGGER IF EXISTS after_maintenance_update;

-- Change delimiter for trigger creation
DELIMITER $$
CREATE TRIGGER after_maintenance_update
AFTER UPDATE ON maintenance_schedule
FOR EACH ROW
BEGIN
  -- If maintenance status changed to completed
  IF OLD.status != 'completed' AND NEW.status = 'completed' THEN
    -- Update vehicle's last maintenance date
    UPDATE vehicles
    SET 
      last_maintenance_date = NEW.completed_date,
      next_maintenance_date = DATE_ADD(NEW.completed_date, INTERVAL 3 MONTH)
    WHERE id = NEW.vehicle_id;
    
    -- Create a notification for the owner
    INSERT INTO notifications (user_id, type, message, timestamp)
    SELECT 
      u.id, 
      'maintenance', 
      CONCAT('Maintenance completed for vehicle ', v.registration, '. Next maintenance due on ', 
             DATE_FORMAT(DATE_ADD(NEW.completed_date, INTERVAL 3 MONTH), '%Y-%m-%d')),
      NOW()
    FROM 
      vehicles v
      JOIN fleets f ON v.fleet_id = f.id
      JOIN users u ON f.owner_id = u.id
    WHERE 
      v.id = NEW.vehicle_id;
  END IF;
END$$

-- Reset delimiter
DELIMITER ;

-- Trigger to create notifications for upcoming expirations
-- Drop trigger if it exists
DROP TRIGGER IF EXISTS daily_expiration_check;

-- Change delimiter for trigger creation
DELIMITER $$
CREATE TRIGGER daily_expiration_check
BEFORE INSERT ON notifications
FOR EACH ROW
BEGIN
  DECLARE is_daily_check BOOLEAN DEFAULT FALSE;
  
  -- Check if this is our special daily check trigger
  IF NEW.type = 'daily_check' THEN
    SET is_daily_check = TRUE;
    
    -- Process vehicle license expirations
    INSERT INTO notifications (user_id, type, message, timestamp)
    SELECT 
      u.id,
      'expiration',
      CONCAT('Vehicle ', v.registration, ' insurance expires in ', 
             DATEDIFF(v.insurance_expiry, CURDATE()), ' days'),
      NOW()
    FROM 
      vehicles v
      JOIN fleets f ON v.fleet_id = f.id
      JOIN users u ON f.owner_id = u.id
    WHERE 
      v.insurance_expiry BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY);
    
    -- Process driver license expirations
    INSERT INTO notifications (user_id, type, message, timestamp)
    SELECT 
      u.id,
      'expiration',
      CONCAT('Driver ', d.first_name, ' ', d.last_name, '\'s license expires in ', 
             DATEDIFF(d.license_expiry_date, CURDATE()), ' days'),
      NOW()
    FROM 
      drivers d
      JOIN fleets f ON d.fleet_id = f.id
      JOIN users u ON f.owner_id = u.id
    WHERE 
      d.license_expiry_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY);
    
    -- Prevent the actual dummy notification from being inserted
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Daily check complete';
  END IF;
END$$

-- Reset delimiter
DELIMITER ;

-- -----------------------------------------------------
-- 4. Create stored procedures for common operations
-- -----------------------------------------------------

-- Procedure to assign a vehicle to a driver
-- Drop procedure if it exists
DROP PROCEDURE IF EXISTS assign_vehicle_to_driver;

-- Change delimiter for procedure creation
DELIMITER $$
CREATE PROCEDURE assign_vehicle_to_driver(
  IN p_vehicle_id INT,
  IN p_driver_id INT
)
BEGIN
  DECLARE vehicle_exists INT;
  DECLARE driver_exists INT;
  DECLARE is_assigned INT;
  
  -- Check if vehicle exists
  SELECT COUNT(*) INTO vehicle_exists FROM vehicles WHERE id = p_vehicle_id;
  
  -- Check if driver exists
  SELECT COUNT(*) INTO driver_exists FROM drivers WHERE id = p_driver_id;
  
  -- Check if vehicle is already assigned
  SELECT COUNT(*) INTO is_assigned 
  FROM vehicle_assignments 
  WHERE vehicle_id = p_vehicle_id AND status = 'active';
  
  -- Validate inputs
  IF vehicle_exists = 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Vehicle does not exist';
  ELSEIF driver_exists = 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Driver does not exist';
  ELSEIF is_assigned > 0 THEN
    -- End the current assignment
    UPDATE vehicle_assignments
    SET status = 'ended', end_date = NOW()
    WHERE vehicle_id = p_vehicle_id AND status = 'active';
  END IF;
  
  -- Create new assignment
  INSERT INTO vehicle_assignments (vehicle_id, driver_id, start_date, status)
  VALUES (p_vehicle_id, p_driver_id, NOW(), 'active');
  
  -- Update driver record with current vehicle
  UPDATE drivers
  SET vehicle = (SELECT registration FROM vehicles WHERE id = p_vehicle_id)
  WHERE id = p_driver_id;
END$$

-- Reset delimiter
DELIMITER ;

-- Procedure to generate a vehicle report
-- Drop procedure if it exists
DROP PROCEDURE IF EXISTS generate_vehicle_report;

-- Change delimiter for procedure creation
DELIMITER $$
CREATE PROCEDURE generate_vehicle_report(
  IN p_vehicle_id INT,
  IN p_start_date DATE,
  IN p_end_date DATE
)
BEGIN
  -- Get vehicle details
  SELECT 
    v.id, v.registration, v.brand, v.model, v.status,
    f.name AS fleet_name
  FROM 
    vehicles v
    JOIN fleets f ON v.fleet_id = f.id
  WHERE 
    v.id = p_vehicle_id;
  
  -- Get driver assignments
  SELECT 
    va.id, va.start_date, va.end_date, va.status,
    d.id AS driver_id, CONCAT(d.first_name, ' ', d.last_name) AS driver_name
  FROM 
    vehicle_assignments va
    JOIN drivers d ON va.driver_id = d.id
  WHERE 
    va.vehicle_id = p_vehicle_id
    AND (va.start_date BETWEEN p_start_date AND p_end_date
         OR va.end_date BETWEEN p_start_date AND p_end_date
         OR (va.start_date <= p_start_date AND (va.end_date >= p_end_date OR va.end_date IS NULL)))
  ORDER BY 
    va.start_date DESC;
  
  -- Get violations
  SELECT 
    v.id, v.type, v.severity, v.timestamp, v.location, v.speed, v.speedLimit,
    CONCAT(d.first_name, ' ', d.last_name) AS driver_name
  FROM 
    violations v
    LEFT JOIN drivers d ON v.driver_id = d.id
  WHERE 
    v.vehicle_id = p_vehicle_id
    AND v.timestamp BETWEEN p_start_date AND p_end_date
  ORDER BY 
    v.timestamp DESC;
  
  -- Get incidents
  SELECT 
    i.id, i.type, i.description, i.severity, i.status, i.timestamp,
    CONCAT(d.first_name, ' ', d.last_name) AS driver_name
  FROM 
    incidents i
    LEFT JOIN drivers d ON i.driver_id = d.id
  WHERE 
    i.vehicle_id = p_vehicle_id
    AND i.timestamp BETWEEN p_start_date AND p_end_date
  ORDER BY 
    i.timestamp DESC;
  
  -- Get maintenance records
  SELECT 
    m.id, m.maintenance_type, m.description, m.scheduled_date, m.completed_date,
    m.cost, m.status
  FROM 
    maintenance_schedule m
  WHERE 
    m.vehicle_id = p_vehicle_id
    AND (m.scheduled_date BETWEEN p_start_date AND p_end_date
         OR m.completed_date BETWEEN p_start_date AND p_end_date)
  ORDER BY 
    COALESCE(m.completed_date, m.scheduled_date) DESC;
  
  -- Get telemetry summary
  SELECT 
    COUNT(*) AS data_points,
    MIN(timestamp) AS first_data,
    MAX(timestamp) AS last_data,
    AVG(speed) AS avg_speed,
    MAX(speed) AS max_speed,
    AVG(fuel_level) AS avg_fuel_level
  FROM 
    telemetry
  WHERE 
    vehicle_id = p_vehicle_id
    AND timestamp BETWEEN p_start_date AND p_end_date;
END$$

-- Reset delimiter
DELIMITER ;

-- Procedure to calculate driver safety scores
-- Drop procedure if it exists
DROP PROCEDURE IF EXISTS calculate_driver_safety_scores;

-- Change delimiter for procedure creation
DELIMITER $$
CREATE PROCEDURE calculate_driver_safety_scores()
BEGIN
  DECLARE done INT DEFAULT FALSE;
  DECLARE d_id INT;
  DECLARE violation_count INT;
  DECLARE avg_severity DECIMAL(3,2);
  DECLARE incident_count INT;
  DECLARE current_score INT;
  DECLARE new_score INT;
  DECLARE cur CURSOR FOR 
    SELECT 
      id 
    FROM 
      drivers;
  DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
  
  OPEN cur;
  
  read_loop: LOOP
    FETCH cur INTO d_id;
    IF done THEN
      LEAVE read_loop;
    END IF;
    
    -- Count violations in the last 3 months
    SELECT 
      COUNT(*),
      AVG(CASE 
            WHEN severity = 'low' THEN 1
            WHEN severity = 'medium' THEN 2
            WHEN severity = 'high' THEN 3
            ELSE 1.5
          END)
    INTO 
      violation_count, avg_severity
    FROM 
      violations
    WHERE 
      driver_id = d_id
      AND timestamp > DATE_SUB(NOW(), INTERVAL 3 MONTH);
      
    -- Count incidents in the last 3 months
    SELECT 
      COUNT(*)
    INTO 
      incident_count
    FROM 
      incidents
    WHERE 
      driver_id = d_id
      AND timestamp > DATE_SUB(NOW(), INTERVAL 3 MONTH);
    
    -- Get current score
    SELECT 
      overallScore
    INTO 
      current_score
    FROM 
      drivers
    WHERE 
      id = d_id;
    
    -- Calculate new score (100 - deductions)
    SET new_score = 100 - (violation_count * avg_severity * 2) - (incident_count * 5);
    
    -- Ensure score is between 0 and 100
    IF new_score < 0 THEN 
      SET new_score = 0;
    ELSEIF new_score > 100 THEN
      SET new_score = 100;
    END IF;
    
    -- Update driver score
    UPDATE drivers 
    SET 
      overallScore = new_score,
      trend = CASE 
                WHEN new_score > current_score THEN 'up'
                WHEN new_score < current_score THEN 'down'
                ELSE 'stable'
              END
    WHERE 
      id = d_id;
    
    -- Add to score history
    INSERT INTO driver_scores_history (driver_id, score, evaluation_date, notes)
    VALUES (d_id, new_score, CURDATE(), 'Automatic monthly safety score update');
    
  END LOOP;
  
  CLOSE cur;
END$$

-- Reset delimiter
DELIMITER ;

-- Procedure to check and schedule maintenance
-- Drop procedure if it exists
DROP PROCEDURE IF EXISTS check_and_schedule_maintenance;

-- Change delimiter for procedure creation
DELIMITER $$
CREATE PROCEDURE check_and_schedule_maintenance()
BEGIN
  -- Find vehicles that need maintenance based on time
  INSERT INTO maintenance_schedule (
    vehicle_id, maintenance_type, description, scheduled_date, status
  )
  SELECT 
    v.id,
    'Regular service',
    'Scheduled 3-month maintenance',
    DATE_ADD(CURDATE(), INTERVAL 7 DAY),
    'scheduled'
  FROM 
    vehicles v
  WHERE 
    v.next_maintenance_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 14 DAY)
    AND NOT EXISTS (
      SELECT 1 FROM maintenance_schedule ms 
      WHERE ms.vehicle_id = v.id 
      AND ms.status = 'scheduled'
    );
  
  -- Create notifications for the scheduled maintenance
  INSERT INTO notifications (user_id, type, message, timestamp)
  SELECT 
    u.id,
    'maintenance',
    CONCAT('Maintenance scheduled for vehicle ', v.registration, ' on ', 
           DATE_FORMAT(m.scheduled_date, '%Y-%m-%d')),
    NOW()
  FROM 
    maintenance_schedule m
    JOIN vehicles v ON m.vehicle_id = v.id
    JOIN fleets f ON v.fleet_id = f.id
    JOIN users u ON f.owner_id = u.id
  WHERE 
    m.status = 'scheduled'
    AND m.created_at > DATE_SUB(NOW(), INTERVAL 1 HOUR);
END$$

-- Reset delimiter
DELIMITER ;

-- Drop existing events to avoid conflicts
DROP EVENT IF EXISTS daily_expiration_check_event;
DROP EVENT IF EXISTS monthly_driver_score_calculation;
DROP EVENT IF EXISTS weekly_maintenance_check;
DROP EVENT IF EXISTS daily_telemetry_archive;
DROP EVENT IF EXISTS monthly_telemetry_prune;

-- Create an event to run the daily expiration check
CREATE EVENT daily_expiration_check_event
ON SCHEDULE EVERY 1 DAY
STARTS CURRENT_DATE + INTERVAL 1 DAY
DO
  INSERT INTO notifications (type) VALUES ('daily_check');

-- Create an event to calculate driver scores monthly
CREATE EVENT monthly_driver_score_calculation
ON SCHEDULE EVERY 1 MONTH
STARTS CURRENT_DATE + INTERVAL 1 DAY
DO
  CALL calculate_driver_safety_scores();

-- Create an event to check and schedule maintenance weekly
CREATE EVENT weekly_maintenance_check
ON SCHEDULE EVERY 1 WEEK
STARTS CURRENT_DATE + INTERVAL 1 DAY
DO
  CALL check_and_schedule_maintenance();

-- Create events for telemetry data management
CREATE EVENT daily_telemetry_archive
ON SCHEDULE EVERY 1 DAY
STARTS CURRENT_DATE + INTERVAL 1 DAY + INTERVAL 1 HOUR
DO
  CALL archive_telemetry_data(90); -- Archive data older than 90 days

CREATE EVENT monthly_telemetry_prune
ON SCHEDULE EVERY 1 MONTH
STARTS CURRENT_DATE + INTERVAL 1 DAY + INTERVAL 2 HOUR
DO
  CALL prune_telemetry_data(365); -- Keep archived data for 1 year

-- Commit all changes if everything went well
COMMIT;
