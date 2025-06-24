-- ================================================
-- Migration: Ajout du support multi-tenant (Version simple)
-- Date: 2025-06-23
-- Description: Ajoute la table tenants et les colonnes tenant_id
-- ================================================

-- 1. Créer la table des tenants
CREATE TABLE IF NOT EXISTS tenants (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  subdomain VARCHAR(50) NOT NULL UNIQUE,
  domain VARCHAR(100),
  status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
  plan ENUM('basic', 'premium', 'enterprise') DEFAULT 'basic',
  settings JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_tenant_subdomain (subdomain),
  INDEX idx_tenant_status (status)
);

-- 2. Insérer le tenant par défaut
INSERT IGNORE INTO tenants (id, name, subdomain, domain, status, plan) 
VALUES (1, 'Tenant Principal', 'app', 'karangue221.com', 'active', 'enterprise');

-- 3. Insérer des tenants de test
INSERT IGNORE INTO tenants (name, subdomain, domain, status, plan) VALUES
('Dakar Dem Dikk', 'ddd', 'ddd.karangue221.com', 'active', 'enterprise'),
('Flotte Test Owner', 'testowner', 'testowner.karangue221.com', 'active', 'premium'),
('Flotte Test API', 'testapi', 'testapi.karangue221.com', 'active', 'basic');

-- 4. Vérifier et ajouter les colonnes tenant_id (avec gestion d'erreur via procédure)
DELIMITER $$

CREATE PROCEDURE AddTenantColumns()
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION BEGIN END;
    
    -- Users
    ALTER TABLE users ADD COLUMN tenant_id INT NOT NULL DEFAULT 1 AFTER id;
    ALTER TABLE users ADD INDEX idx_users_tenant (tenant_id);
    
    -- Fleets
    ALTER TABLE fleets ADD COLUMN tenant_id INT NOT NULL DEFAULT 1 AFTER id;
    ALTER TABLE fleets ADD INDEX idx_fleets_tenant (tenant_id);
    
    -- Vehicles  
    ALTER TABLE vehicles ADD COLUMN tenant_id INT NOT NULL DEFAULT 1 AFTER id;
    ALTER TABLE vehicles ADD INDEX idx_vehicles_tenant (tenant_id);
    
    -- Drivers
    ALTER TABLE drivers ADD COLUMN tenant_id INT NOT NULL DEFAULT 1 AFTER id;
    ALTER TABLE drivers ADD INDEX idx_drivers_tenant (tenant_id);
    
    -- Incidents
    ALTER TABLE incidents ADD COLUMN tenant_id INT NOT NULL DEFAULT 1 AFTER id;
    ALTER TABLE incidents ADD INDEX idx_incidents_tenant (tenant_id);
    
    -- Telemetry
    ALTER TABLE telemetry ADD COLUMN tenant_id INT NOT NULL DEFAULT 1 AFTER id;
    ALTER TABLE telemetry ADD INDEX idx_telemetry_tenant (tenant_id);
    
    -- Devices
    ALTER TABLE devices ADD COLUMN tenant_id INT NOT NULL DEFAULT 1 AFTER id;
    ALTER TABLE devices ADD INDEX idx_devices_tenant (tenant_id);
    
    -- Notifications
    ALTER TABLE notifications ADD COLUMN tenant_id INT NOT NULL DEFAULT 1 AFTER id;
    ALTER TABLE notifications ADD INDEX idx_notifications_tenant (tenant_id);
    
END$$

DELIMITER ;

-- Exécuter la procédure
CALL AddTenantColumns();

-- Nettoyer
DROP PROCEDURE AddTenantColumns;

-- 5. Ajouter les colonnes aux tables optionnelles
DELIMITER $$

CREATE PROCEDURE AddTenantToOptionalTables()
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION BEGIN END;
    
    -- Violations
    ALTER TABLE violations ADD COLUMN tenant_id INT NOT NULL DEFAULT 1 AFTER id;
    ALTER TABLE violations ADD INDEX idx_violations_tenant (tenant_id);
    
    -- Activities
    ALTER TABLE activities ADD COLUMN tenant_id INT NOT NULL DEFAULT 1 AFTER id;
    ALTER TABLE activities ADD INDEX idx_activities_tenant (tenant_id);
    
    -- Vehicle assignments
    ALTER TABLE vehicle_assignments ADD COLUMN tenant_id INT NOT NULL DEFAULT 1 AFTER id;
    ALTER TABLE vehicle_assignments ADD INDEX idx_vehicle_assignments_tenant (tenant_id);
    
    -- Driver scores history
    ALTER TABLE driver_scores_history ADD COLUMN tenant_id INT NOT NULL DEFAULT 1 AFTER id;
    ALTER TABLE driver_scores_history ADD INDEX idx_driver_scores_history_tenant (tenant_id);
    
    -- Maintenance schedule
    ALTER TABLE maintenance_schedule ADD COLUMN tenant_id INT NOT NULL DEFAULT 1 AFTER id;
    ALTER TABLE maintenance_schedule ADD INDEX idx_maintenance_schedule_tenant (tenant_id);
    
END$$

DELIMITER ;

-- Exécuter la procédure pour les tables optionnelles
CALL AddTenantToOptionalTables();

-- Nettoyer
DROP PROCEDURE AddTenantToOptionalTables;

-- 6. Ajouter des index composites pour optimiser les requêtes multi-tenant
DELIMITER $$

CREATE PROCEDURE AddCompositeIndexes()
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION BEGIN END;
    
    -- Users
    ALTER TABLE users ADD INDEX idx_users_tenant_email (tenant_id, email);
    ALTER TABLE users ADD INDEX idx_users_tenant_status (tenant_id, status);
    
    -- Fleets
    ALTER TABLE fleets ADD INDEX idx_fleets_tenant_owner (tenant_id, owner_id);
    
    -- Vehicles
    ALTER TABLE vehicles ADD INDEX idx_vehicles_tenant_fleet (tenant_id, fleet_id);
    ALTER TABLE vehicles ADD INDEX idx_vehicles_tenant_status (tenant_id, status);
    
    -- Drivers
    ALTER TABLE drivers ADD INDEX idx_drivers_tenant_fleet (tenant_id, fleet_id);
    ALTER TABLE drivers ADD INDEX idx_drivers_tenant_status (tenant_id, status);
    
    -- Incidents
    ALTER TABLE incidents ADD INDEX idx_incidents_tenant_vehicle (tenant_id, vehicle_id);
    ALTER TABLE incidents ADD INDEX idx_incidents_tenant_driver (tenant_id, driver_id);
    ALTER TABLE incidents ADD INDEX idx_incidents_tenant_status (tenant_id, status);
    
    -- Telemetry
    ALTER TABLE telemetry ADD INDEX idx_telemetry_tenant_vehicle (tenant_id, vehicle_id);
    ALTER TABLE telemetry ADD INDEX idx_telemetry_tenant_timestamp (tenant_id, timestamp);
    
END$$

DELIMITER ;

-- Exécuter la procédure pour les index composites
CALL AddCompositeIndexes();

-- Nettoyer
DROP PROCEDURE AddCompositeIndexes;

-- 7. Créer une vue pour les statistiques par tenant
CREATE OR REPLACE VIEW tenant_stats AS
SELECT 
    t.id as tenant_id,
    t.name as tenant_name,
    t.subdomain,
    t.status as tenant_status,
    COUNT(DISTINCT u.id) as total_users,
    COUNT(DISTINCT f.id) as total_fleets,
    COUNT(DISTINCT v.id) as total_vehicles,
    COUNT(DISTINCT d.id) as total_drivers,
    COUNT(DISTINCT i.id) as total_incidents,
    t.created_at as tenant_created_at
FROM tenants t
LEFT JOIN users u ON t.id = u.tenant_id AND u.status = 'active'
LEFT JOIN fleets f ON t.id = f.tenant_id
LEFT JOIN vehicles v ON t.id = v.tenant_id
LEFT JOIN drivers d ON t.id = d.tenant_id AND d.status = 'active'
LEFT JOIN incidents i ON t.id = i.tenant_id
GROUP BY t.id, t.name, t.subdomain, t.status, t.created_at;

-- 8. Enregistrer la migration
INSERT IGNORE INTO migration_history (phase, timestamp, status, backup_file) 
VALUES (1, NOW(), 'completed', 'Migration multi-tenancy phase 1 - Version simple');

-- ================================================
-- FIN DE LA MIGRATION
-- ================================================
