-- Migration script to add default users (owner and admin)
-- Created: 2025-06-20

-- Start transaction to ensure all operations succeed or fail together
START TRANSACTION;

-- Check if users with these emails already exist
SELECT COUNT(*) INTO @owner_exists 
FROM users 
WHERE email = 'admin@karangue221.com';

SELECT COUNT(*) INTO @admin_exists 
FROM users 
WHERE email = 'manager@karangue221.com';

-- Add owner user if it doesn't exist
SET @owner_insert_sql = IF(@owner_exists = 0,
  "INSERT INTO users (name, email, password_hash, role, phone, status) VALUES 
   ('Admin Karangué', 'admin@karangue221.com', '$2a$12$Hq1gQ2gUdsdgTuyuYaX5TeKJhO5.r3hZcnJoRYWEPY2h8eiGdMSje', 'owner', '+221781234567', 'active')",
  'SELECT ''Owner user already exists'' AS message');
PREPARE stmt FROM @owner_insert_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add admin user if it doesn't exist
SET @admin_insert_sql = IF(@admin_exists = 0,
  "INSERT INTO users (name, email, password_hash, role, phone, status) VALUES 
   ('Manager Karangué', 'manager@karangue221.com', '$2a$12$dXhwZsTNmfK2AsE4l9jK0O8WyU.3jn95v.rcEMQmARw9S9Csl9Kf6', 'admin', '+221782345678', 'active')",
  'SELECT ''Admin user already exists'' AS message');
PREPARE stmt FROM @admin_insert_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Commit all changes if everything went well
COMMIT;
