-- ================================================
-- Migration: Ajout du support multi-tenant (Version corrigée)
-- Date: 2025-06-23
-- Description: Ajoute la table tenants et les colonnes tenant_id
-- ================================================

-- 1. Créer la table des tenants en premier
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

-- 2. Insérer le tenant par défaut AVANT d'ajouter les contraintes
INSERT INTO tenants (id, name, subdomain, domain, status, plan) 
VALUES (1, 'Tenant Principal', 'app', 'karangue221.com', 'active', 'enterprise')
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- 3. Insérer des tenants de test
INSERT INTO tenants (name, subdomain, domain, status, plan) VALUES
('Dakar Dem Dikk', 'ddd', 'ddd.karangue221.com', 'active', 'enterprise'),
('Flotte Test Owner', 'testowner', 'testowner.karangue221.com', 'active', 'premium'),
('Flotte Test API', 'testapi', 'testapi.karangue221.com', 'active', 'basic')
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- 4. Ajouter tenant_id aux tables existantes SANS contraintes d'abord

-- Table users
ALTER TABLE users ADD COLUMN IF NOT EXISTS tenant_id INT NOT NULL DEFAULT 1 AFTER id;
ALTER TABLE users ADD INDEX IF NOT EXISTS idx_users_tenant (tenant_id);

-- Table fleets  
ALTER TABLE fleets ADD COLUMN IF NOT EXISTS tenant_id INT NOT NULL DEFAULT 1 AFTER id;
ALTER TABLE fleets ADD INDEX IF NOT EXISTS idx_fleets_tenant (tenant_id);

-- Table vehicles
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS tenant_id INT NOT NULL DEFAULT 1 AFTER id;
ALTER TABLE vehicles ADD INDEX IF NOT EXISTS idx_vehicles_tenant (tenant_id);

-- Table drivers
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS tenant_id INT NOT NULL DEFAULT 1 AFTER id;
ALTER TABLE drivers ADD INDEX IF NOT EXISTS idx_drivers_tenant (tenant_id);

-- Table incidents
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS tenant_id INT NOT NULL DEFAULT 1 AFTER id;
ALTER TABLE incidents ADD INDEX IF NOT EXISTS idx_incidents_tenant (tenant_id);

-- Table telemetry
ALTER TABLE telemetry ADD COLUMN IF NOT EXISTS tenant_id INT NOT NULL DEFAULT 1 AFTER id;
ALTER TABLE telemetry ADD INDEX IF NOT EXISTS idx_telemetry_tenant (tenant_id);

-- Table devices
ALTER TABLE devices ADD COLUMN IF NOT EXISTS tenant_id INT NOT NULL DEFAULT 1 AFTER id;
ALTER TABLE devices ADD INDEX IF NOT EXISTS idx_devices_tenant (tenant_id);

-- Table notifications
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS tenant_id INT NOT NULL DEFAULT 1 AFTER id;
ALTER TABLE notifications ADD INDEX IF NOT EXISTS idx_notifications_tenant (tenant_id);

-- Tables qui peuvent ne pas exister - utilisation de procédures stockées
DELIMITER $$

CREATE PROCEDURE AddTenantColumnIfTableExists(IN table_name VARCHAR(64))
BEGIN
    DECLARE table_exists INT DEFAULT 0;
    
    SELECT COUNT(*)
    INTO table_exists
    FROM information_schema.tables 
    WHERE table_schema = DATABASE() AND table_name = table_name;
    
    IF table_exists > 0 THEN
        SET @sql = CONCAT('ALTER TABLE ', table_name, ' ADD COLUMN IF NOT EXISTS tenant_id INT NOT NULL DEFAULT 1 AFTER id');
        PREPARE stmt FROM @sql;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
        
        SET @sql = CONCAT('ALTER TABLE ', table_name, ' ADD INDEX IF NOT EXISTS idx_', table_name, '_tenant (tenant_id)');
        PREPARE stmt FROM @sql;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
    END IF;
END$$

DELIMITER ;

-- Appliquer aux tables optionnelles
CALL AddTenantColumnIfTableExists('violations');
CALL AddTenantColumnIfTableExists('activities');
CALL AddTenantColumnIfTableExists('vehicle_assignments');
CALL AddTenantColumnIfTableExists('driver_scores_history');
CALL AddTenantColumnIfTableExists('maintenance_schedule');

-- Nettoyer la procédure
DROP PROCEDURE AddTenantColumnIfTableExists;

-- 5. Maintenant ajouter les contraintes de clé étrangère (optionnel et plus sûr de les omettre au début)
-- ALTER TABLE users ADD CONSTRAINT fk_users_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT;
-- ALTER TABLE fleets ADD CONSTRAINT fk_fleets_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT;
-- (etc... on peut les ajouter plus tard si nécessaire)

-- 6. Créer des index composites pour optimiser les requêtes multi-tenant
ALTER TABLE users ADD INDEX IF NOT EXISTS idx_users_tenant_email (tenant_id, email);
ALTER TABLE users ADD INDEX IF NOT EXISTS idx_users_tenant_status (tenant_id, status);

ALTER TABLE fleets ADD INDEX IF NOT EXISTS idx_fleets_tenant_owner (tenant_id, owner_id);

ALTER TABLE vehicles ADD INDEX IF NOT EXISTS idx_vehicles_tenant_fleet (tenant_id, fleet_id);
ALTER TABLE vehicles ADD INDEX IF NOT EXISTS idx_vehicles_tenant_status (tenant_id, status);

ALTER TABLE drivers ADD INDEX IF NOT EXISTS idx_drivers_tenant_fleet (tenant_id, fleet_id);
ALTER TABLE drivers ADD INDEX IF NOT EXISTS idx_drivers_tenant_status (tenant_id, status);

ALTER TABLE incidents ADD INDEX IF NOT EXISTS idx_incidents_tenant_vehicle (tenant_id, vehicle_id);
ALTER TABLE incidents ADD INDEX IF NOT EXISTS idx_incidents_tenant_driver (tenant_id, driver_id);
ALTER TABLE incidents ADD INDEX IF NOT EXISTS idx_incidents_tenant_status (tenant_id, status);

ALTER TABLE telemetry ADD INDEX IF NOT EXISTS idx_telemetry_tenant_vehicle (tenant_id, vehicle_id);
ALTER TABLE telemetry ADD INDEX IF NOT EXISTS idx_telemetry_tenant_timestamp (tenant_id, timestamp);

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
INSERT INTO migration_history (phase, timestamp, status, backup_file) 
VALUES (1, NOW(), 'completed', 'Migration multi-tenancy phase 1 - Ajout tables et colonnes (version corrigée)')
ON DUPLICATE KEY UPDATE 
  timestamp = NOW(),
  status = 'completed',
  backup_file = 'Migration multi-tenancy phase 1 - Ajout tables et colonnes (version corrigée)';

-- ================================================
-- NOTES IMPORTANTES:
-- ================================================
-- 1. Cette migration ajoute tenant_id avec une valeur par défaut de 1
-- 2. Le tenant_id = 1 est réservé pour les données existantes 
-- 3. Les contraintes de clé étrangère sont omises pour éviter les conflits
-- 4. Toutes les données existantes seront associées au tenant principal (id=1)
-- 5. Les nouveaux enregistrements devront spécifier un tenant_id valide
-- ================================================
