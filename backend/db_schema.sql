-- users (owner, admin)
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('owner', 'admin') NOT NULL DEFAULT 'owner',
  phone VARCHAR(30),
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- fleet
CREATE TABLE fleets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  owner_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (owner_id) REFERENCES users(id)
);

-- vehicle
CREATE TABLE vehicles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  registration VARCHAR(50) NOT NULL UNIQUE,
  brand VARCHAR(50),
  model VARCHAR(50),
  year INT,
  color VARCHAR(30),
  status ENUM('active', 'inactive', 'maintenance') DEFAULT 'active',
  fleet_id INT NOT NULL,
  imei_device VARCHAR(30),
  type VARCHAR(30),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (fleet_id) REFERENCES fleets(id)
);

-- driver
CREATE TABLE drivers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(50),
  last_name VARCHAR(50),
  license_number VARCHAR(50),
  phone VARCHAR(30),
  email VARCHAR(100),
  status ENUM('active', 'inactive') DEFAULT 'active',
  fleet_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (fleet_id) REFERENCES fleets(id)
);

-- vehicle assignment (historique)
CREATE TABLE vehicle_assignments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  vehicle_id INT NOT NULL,
  driver_id INT NOT NULL,
  start_date DATETIME,
  end_date DATETIME,
  status ENUM('active', 'ended') DEFAULT 'active',
  FOREIGN KEY (vehicle_id) REFERENCES vehicles(id),
  FOREIGN KEY (driver_id) REFERENCES drivers(id)
);

-- incident
CREATE TABLE incidents (
  id INT AUTO_INCREMENT PRIMARY KEY,
  vehicle_id INT,
  driver_id INT,
  type VARCHAR(50),
  description TEXT,
  severity ENUM('low', 'medium', 'high'),
  status ENUM('open', 'resolved', 'ignored') DEFAULT 'open',
  timestamp DATETIME,
  media_url VARCHAR(255),
  FOREIGN KEY (vehicle_id) REFERENCES vehicles(id),
  FOREIGN KEY (driver_id) REFERENCES drivers(id)
);

-- violation
CREATE TABLE violations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  driver_id INT,
  vehicle_id INT,
  type VARCHAR(50),
  severity ENUM('low', 'medium', 'high'),
  description TEXT,
  status ENUM('pending', 'confirmed', 'dismissed') DEFAULT 'pending',
  timestamp DATETIME,
  FOREIGN KEY (driver_id) REFERENCES drivers(id),
  FOREIGN KEY (vehicle_id) REFERENCES vehicles(id)
);

-- activity
CREATE TABLE activities (
  id INT AUTO_INCREMENT PRIMARY KEY,
  type VARCHAR(50),
  description TEXT,
  vehicle_id INT,
  driver_id INT,
  timestamp DATETIME,
  FOREIGN KEY (vehicle_id) REFERENCES vehicles(id),
  FOREIGN KEY (driver_id) REFERENCES drivers(id)
);

-- telemetry
CREATE TABLE telemetry (
  id INT AUTO_INCREMENT PRIMARY KEY,
  vehicle_id INT NOT NULL,
  timestamp DATETIME,
  latitude DECIMAL(10,7),
  longitude DECIMAL(10,7),
  speed FLOAT,
  fuel_level FLOAT,
  temperature FLOAT,
  FOREIGN KEY (vehicle_id) REFERENCES vehicles(id)
);

-- device
CREATE TABLE devices (
  id INT AUTO_INCREMENT PRIMARY KEY,
  imei VARCHAR(30) NOT NULL UNIQUE,
  type VARCHAR(30),
  status ENUM('active', 'inactive') DEFAULT 'active',
  vehicle_id INT,
  firmware VARCHAR(50),
  FOREIGN KEY (vehicle_id) REFERENCES vehicles(id)
);

-- notification
CREATE TABLE notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  type VARCHAR(50),
  message TEXT,
  status ENUM('unread', 'read') DEFAULT 'unread',
  timestamp DATETIME,
  FOREIGN KEY (user_id) REFERENCES users(id)
); 


-- DRIVERS
ALTER TABLE drivers
  ADD COLUMN vehicle VARCHAR(100) DEFAULT NULL,
  ADD COLUMN overallScore INT DEFAULT 0,
  ADD COLUMN trend ENUM('up', 'down', 'stable') DEFAULT 'stable',
  ADD COLUMN experience VARCHAR(50) DEFAULT NULL;


  -- VIOLATIONS
ALTER TABLE violations
  ADD COLUMN driver_id INT,
  ADD COLUMN type VARCHAR(100),
  ADD COLUMN severity VARCHAR(20),
  ADD COLUMN location VARCHAR(255),
  ADD COLUMN speed INT,
  ADD COLUMN speedLimit INT,
  ADD COLUMN gForce VARCHAR(10),
  ADD COLUMN eyeClosure VARCHAR(10),
  ADD COLUMN lateralG VARCHAR(10),
  ADD COLUMN duration VARCHAR(20),
  ADD COLUMN hasVideo BOOLEAN DEFAULT 0,
  ADD COLUMN cost INT DEFAULT 0,
  ADD COLUMN date DATETIME;

-- TELEMETRY
ALTER TABLE telemetry
  ADD COLUMN vehicle_id INT,
  ADD COLUMN driver_id INT,
  ADD COLUMN timestamp DATETIME,
  ADD COLUMN speed INT,
  ADD COLUMN latitude DOUBLE,
  ADD COLUMN longitude DOUBLE;

-- VEHICLES
ALTER TABLE vehicles
  ADD COLUMN cameras JSON,
  ADD COLUMN lastUpdate DATETIME;