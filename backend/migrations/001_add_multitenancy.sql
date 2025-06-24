-- ================================================
-- Migration: Ajout du support multi-tenant
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

-- 2. Ajouter tenant_id à la table users
ALTER TABLE users 
ADD COLUMN tenant_id INT NOT NULL DEFAULT 1 AFTER id,
ADD INDEX idx_users_tenant (tenant_id),
ADD CONSTRAINT fk_users_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT;

-- 3. Ajouter tenant_id à la table fleets
ALTER TABLE fleets 
ADD COLUMN tenant_id INT NOT NULL DEFAULT 1 AFTER id,
ADD INDEX idx_fleets_tenant (tenant_id),
ADD CONSTRAINT fk_fleets_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT;

-- 4. Ajouter tenant_id à la table vehicles
ALTER TABLE vehicles 
ADD COLUMN tenant_id INT NOT NULL DEFAULT 1 AFTER id,
ADD INDEX idx_vehicles_tenant (tenant_id),
ADD CONSTRAINT fk_vehicles_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT;

-- 5. Ajouter tenant_id à la table drivers
ALTER TABLE drivers 
ADD COLUMN tenant_id INT NOT NULL DEFAULT 1 AFTER id,
ADD INDEX idx_drivers_tenant (tenant_id),
ADD CONSTRAINT fk_drivers_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT;

-- 6. Ajouter tenant_id à la table incidents
ALTER TABLE incidents 
ADD COLUMN tenant_id INT NOT NULL DEFAULT 1 AFTER id,
ADD INDEX idx_incidents_tenant (tenant_id),
ADD CONSTRAINT fk_incidents_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT;

-- 7. Ajouter tenant_id à la table violations (si elle existe)
ALTER TABLE violations 
ADD COLUMN tenant_id INT NOT NULL DEFAULT 1 AFTER id,
ADD INDEX idx_violations_tenant (tenant_id),
ADD CONSTRAINT fk_violations_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT;

-- 8. Ajouter tenant_id à la table activities (si elle existe)
ALTER TABLE activities 
ADD COLUMN tenant_id INT NOT NULL DEFAULT 1 AFTER id,
ADD INDEX idx_activities_tenant (tenant_id),
ADD CONSTRAINT fk_activities_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT;

-- 9. Ajouter tenant_id à la table telemetry
ALTER TABLE telemetry 
ADD COLUMN tenant_id INT NOT NULL DEFAULT 1 AFTER id,
ADD INDEX idx_telemetry_tenant (tenant_id),
ADD CONSTRAINT fk_telemetry_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT;

-- 10. Ajouter tenant_id à la table devices
ALTER TABLE devices 
ADD COLUMN tenant_id INT NOT NULL DEFAULT 1 AFTER id,
ADD INDEX idx_devices_tenant (tenant_id),
ADD CONSTRAINT fk_devices_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT;

-- 11. Ajouter tenant_id à la table notifications
ALTER TABLE notifications 
ADD COLUMN tenant_id INT NOT NULL DEFAULT 1 AFTER id,
ADD INDEX idx_notifications_tenant (tenant_id),
ADD CONSTRAINT fk_notifications_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT;

-- 12. Ajouter tenant_id aux tables spécialisées (si elles existent)
-- Table vehicle_assignments
ALTER TABLE vehicle_assignments 
ADD COLUMN tenant_id INT NOT NULL DEFAULT 1 AFTER id,
ADD INDEX idx_vehicle_assignments_tenant (tenant_id),
ADD CONSTRAINT fk_vehicle_assignments_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT;

-- Table driver_scores_history
ALTER TABLE driver_scores_history 
ADD COLUMN tenant_id INT NOT NULL DEFAULT 1 AFTER id,
ADD INDEX idx_driver_scores_history_tenant (tenant_id),
ADD CONSTRAINT fk_driver_scores_history_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT;

-- Table maintenance_schedule
ALTER TABLE maintenance_schedule 
ADD COLUMN tenant_id INT NOT NULL DEFAULT 1 AFTER id,
ADD INDEX idx_maintenance_schedule_tenant (tenant_id),
ADD CONSTRAINT fk_maintenance_schedule_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT;

-- 13. Insérer le tenant par défaut (pour les données existantes)
INSERT INTO tenants (id, name, subdomain, domain, status, plan) 
VALUES (1, 'Tenant Principal', 'app', 'karangue221.com', 'active', 'enterprise')
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- 14. Insérer des tenants de test
INSERT INTO tenants (name, subdomain, domain, status, plan) VALUES
('Dakar Dem Dikk', 'ddd', 'ddd.karangue221.com', 'active', 'enterprise'),
('Flotte Test Owner', 'testowner', 'testowner.karangue221.com', 'active', 'premium'),
('Flotte Test API', 'testapi', 'testapi.karangue221.com', 'active', 'basic')
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- 15. Créer des index composites pour optimiser les requêtes multi-tenant
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

-- 16. Mettre à jour les contraintes de clés étrangères pour inclure tenant_id
-- Note: Cette section nécessiterait de supprimer et recréer les contraintes existantes
-- Ce qui peut être risqué. Pour l'instant, nous allons ajouter des contraintes additionnelles.

-- 17. Créer une vue pour les statistiques par tenant
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

-- 18. Enregistrer la migration
INSERT INTO migration_history (phase, timestamp, status, backup_file) 
VALUES (1, NOW(), 'completed', 'Migration multi-tenancy phase 1 - Ajout tables et colonnes');

-- ================================================
-- NOTES IMPORTANTES:
-- ================================================
-- 1. Cette migration ajoute tenant_id avec une valeur par défaut de 1
-- 2. Le tenant_id = 1 est réservé pour les données existantes
-- 3. Tous les nouveaux enregistrements devront spécifier un tenant_id valide
-- 4. Le middleware multi-tenant devra être configuré pour filtrer automatiquement par tenant_id
-- 5. Les requêtes existantes devront être mises à jour pour inclure le tenant_id
-- ================================================
