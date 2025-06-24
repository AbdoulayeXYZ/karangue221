-- Migration: Ajout des tables et fonctionnalités pour les sessions owner
-- Date: 2025-06-23
-- Description: Ajoute les tables nécessaires pour gérer les sessions de flotte et les permissions

-- 1. Table des sessions de flotte
CREATE TABLE IF NOT EXISTS fleet_sessions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    fleet_id INT NOT NULL,
    owner_id INT NOT NULL,
    created_by_admin_id INT NOT NULL,
    status ENUM('active', 'suspended', 'expired', 'revoked') DEFAULT 'active',
    expires_at TIMESTAMP NULL,
    session_data JSON NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (fleet_id) REFERENCES fleets(id) ON DELETE CASCADE,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by_admin_id) REFERENCES users(id),
    
    INDEX idx_fleet_sessions_fleet (fleet_id),
    INDEX idx_fleet_sessions_owner (owner_id),
    INDEX idx_fleet_sessions_status (status),
    INDEX idx_fleet_sessions_expires (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Table des permissions par flotte
CREATE TABLE IF NOT EXISTS fleet_permissions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    fleet_id INT NOT NULL,
    feature VARCHAR(100) NOT NULL,
    enabled BOOLEAN DEFAULT TRUE,
    limits JSON NULL COMMENT 'Limites spécifiques (ex: max_vehicles, max_drivers)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (fleet_id) REFERENCES fleets(id) ON DELETE CASCADE,
    
    UNIQUE KEY unique_fleet_feature (fleet_id, feature),
    INDEX idx_fleet_permissions_fleet (fleet_id),
    INDEX idx_fleet_permissions_feature (feature)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Amélioration de la table fleets avec des colonnes supplémentaires
-- Utilisation de procédure pour vérifier l'existence des colonnes
DELIMITER $$

CREATE PROCEDURE IF NOT EXISTS AddFleetColumnsIfNotExists()
BEGIN
    -- Vérifier et ajouter les colonnes une par une
    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'fleets' AND COLUMN_NAME = 'status') THEN
        ALTER TABLE fleets ADD COLUMN status ENUM('active', 'inactive', 'suspended') DEFAULT 'active';
    END IF;
    
    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'fleets' AND COLUMN_NAME = 'logo') THEN
        ALTER TABLE fleets ADD COLUMN logo VARCHAR(255) NULL COMMENT 'URL du logo de la flotte';
    END IF;
    
    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'fleets' AND COLUMN_NAME = 'max_vehicles') THEN
        ALTER TABLE fleets ADD COLUMN max_vehicles INT DEFAULT 100 COMMENT 'Limite maximum de véhicules';
    END IF;
    
    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'fleets' AND COLUMN_NAME = 'max_drivers') THEN
        ALTER TABLE fleets ADD COLUMN max_drivers INT DEFAULT 200 COMMENT 'Limite maximum de conducteurs';
    END IF;
    
    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'fleets' AND COLUMN_NAME = 'subscription_type') THEN
        ALTER TABLE fleets ADD COLUMN subscription_type ENUM('basic', 'premium', 'enterprise') DEFAULT 'basic';
    END IF;
    
    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'fleets' AND COLUMN_NAME = 'subscription_expires_at') THEN
        ALTER TABLE fleets ADD COLUMN subscription_expires_at TIMESTAMP NULL;
    END IF;
    
    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'fleets' AND COLUMN_NAME = 'updated_at') THEN
        ALTER TABLE fleets ADD COLUMN updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP;
    END IF;
END$$

DELIMITER ;

-- Exécuter la procédure
CALL AddFleetColumnsIfNotExists();

-- Supprimer la procédure après utilisation
DROP PROCEDURE AddFleetColumnsIfNotExists;

-- 4. Table des logs d'activité owner (optionnel)
CREATE TABLE IF NOT EXISTS owner_activity_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    owner_id INT NOT NULL,
    fleet_id INT NOT NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NULL COMMENT 'Type d\'entité affectée (vehicle, driver, etc.)',
    entity_id INT NULL COMMENT 'ID de l\'entité affectée',
    details JSON NULL COMMENT 'Détails de l\'action',
    ip_address VARCHAR(45) NULL,
    user_agent TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (fleet_id) REFERENCES fleets(id) ON DELETE CASCADE,
    
    INDEX idx_owner_logs_owner (owner_id),
    INDEX idx_owner_logs_fleet (fleet_id),
    INDEX idx_owner_logs_action (action),
    INDEX idx_owner_logs_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Insérer des permissions par défaut pour les flottes existantes
INSERT IGNORE INTO fleet_permissions (fleet_id, feature, enabled, limits)
SELECT 
    f.id,
    'vehicle_management' as feature,
    TRUE as enabled,
    JSON_OBJECT('max_vehicles', COALESCE(f.max_vehicles, 100)) as limits
FROM fleets f;

INSERT IGNORE INTO fleet_permissions (fleet_id, feature, enabled, limits)
SELECT 
    f.id,
    'driver_management' as feature,
    TRUE as enabled,
    JSON_OBJECT('max_drivers', COALESCE(f.max_drivers, 200)) as limits
FROM fleets f;

INSERT IGNORE INTO fleet_permissions (fleet_id, feature, enabled, limits)
SELECT 
    f.id,
    'reports_analytics' as feature,
    TRUE as enabled,
    JSON_OBJECT('retention_days', 90) as limits
FROM fleets f;

INSERT IGNORE INTO fleet_permissions (fleet_id, feature, enabled, limits)
SELECT 
    f.id,
    'real_time_tracking' as feature,
    TRUE as enabled,
    JSON_OBJECT('update_frequency', 30) as limits
FROM fleets f;

-- 6. Créer des sessions actives pour les owners existants
INSERT IGNORE INTO fleet_sessions (fleet_id, owner_id, created_by_admin_id, status)
SELECT 
    f.id as fleet_id,
    f.owner_id,
    (SELECT id FROM users WHERE role = 'admin' LIMIT 1) as created_by_admin_id,
    'active' as status
FROM fleets f
JOIN users u ON f.owner_id = u.id
WHERE u.role = 'owner';

-- 7. Index supplémentaires pour les performances
CREATE INDEX IF NOT EXISTS idx_vehicles_fleet_status ON vehicles(fleet_id, status);
CREATE INDEX IF NOT EXISTS idx_drivers_fleet_status ON drivers(fleet_id, status);
CREATE INDEX IF NOT EXISTS idx_violations_vehicle_timestamp ON violations(vehicle_id, timestamp);
CREATE INDEX IF NOT EXISTS idx_incidents_vehicle_timestamp ON incidents(vehicle_id, timestamp);
CREATE INDEX IF NOT EXISTS idx_telemetry_vehicle_timestamp ON telemetry(vehicle_id, timestamp);

-- 8. Vue pour les statistiques rapides des flottes (optionnel, pour les performances)
CREATE OR REPLACE VIEW fleet_quick_stats AS
SELECT 
    f.id as fleet_id,
    f.name as fleet_name,
    f.owner_id,
    u.name as owner_name,
    COUNT(DISTINCT v.id) as total_vehicles,
    COUNT(DISTINCT CASE WHEN v.status = 'active' THEN v.id END) as active_vehicles,
    COUNT(DISTINCT d.id) as total_drivers,
    COUNT(DISTINCT CASE WHEN d.status = 'active' THEN d.id END) as active_drivers,
    COUNT(DISTINCT viol.id) as total_violations_30d,
    COUNT(DISTINCT inc.id) as total_incidents_30d
FROM fleets f
LEFT JOIN users u ON f.owner_id = u.id
LEFT JOIN vehicles v ON f.id = v.fleet_id
LEFT JOIN drivers d ON f.id = d.fleet_id
LEFT JOIN violations viol ON v.id = viol.vehicle_id AND viol.timestamp >= DATE_SUB(NOW(), INTERVAL 30 DAY)
LEFT JOIN incidents inc ON v.id = inc.vehicle_id AND inc.timestamp >= DATE_SUB(NOW(), INTERVAL 30 DAY)
WHERE f.status = 'active'
GROUP BY f.id, f.name, f.owner_id, u.name;

-- 9. Procédure stockée pour créer une session complète (optionnel)
DELIMITER $$

CREATE PROCEDURE IF NOT EXISTS CreateFleetSession(
    IN p_admin_id INT,
    IN p_owner_id INT,
    IN p_fleet_name VARCHAR(100),
    IN p_fleet_description TEXT,
    IN p_subscription_type ENUM('basic', 'premium', 'enterprise'),
    IN p_max_vehicles INT,
    IN p_max_drivers INT
)
BEGIN
    DECLARE v_fleet_id INT;
    DECLARE v_session_id INT;
    
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;
    
    START TRANSACTION;
    
    -- Créer la flotte
    INSERT INTO fleets (name, description, owner_id, max_vehicles, max_drivers, subscription_type, status)
    VALUES (p_fleet_name, p_fleet_description, p_owner_id, p_max_vehicles, p_max_drivers, p_subscription_type, 'active');
    
    SET v_fleet_id = LAST_INSERT_ID();
    
    -- Créer la session
    INSERT INTO fleet_sessions (fleet_id, owner_id, created_by_admin_id, status)
    VALUES (v_fleet_id, p_owner_id, p_admin_id, 'active');
    
    SET v_session_id = LAST_INSERT_ID();
    
    -- Créer les permissions par défaut
    INSERT INTO fleet_permissions (fleet_id, feature, enabled, limits) VALUES
    (v_fleet_id, 'vehicle_management', TRUE, JSON_OBJECT('max_vehicles', p_max_vehicles)),
    (v_fleet_id, 'driver_management', TRUE, JSON_OBJECT('max_drivers', p_max_drivers)),
    (v_fleet_id, 'reports_analytics', TRUE, JSON_OBJECT('retention_days', 90)),
    (v_fleet_id, 'real_time_tracking', TRUE, JSON_OBJECT('update_frequency', 30));
    
    COMMIT;
    
    SELECT v_fleet_id as fleet_id, v_session_id as session_id;
END$$

DELIMITER ;

-- 10. Commentaires finaux
-- Cette migration ajoute toutes les structures nécessaires pour :
-- - Gérer les sessions de flotte pour les owners
-- - Contrôler les permissions par flotte
-- - Logger l'activité des owners
-- - Optimiser les requêtes avec des index appropriés
-- - Fournir des vues pour les statistiques rapides

-- Pour appliquer cette migration :
-- mysql -u [username] -p [database_name] < add_owner_session_tables.sql
