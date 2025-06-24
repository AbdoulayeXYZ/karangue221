-- Migration simplifiée: Tables pour les sessions owner
-- Compatible avec MySQL 5.7+

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
    FOREIGN KEY (created_by_admin_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Table des permissions par flotte
CREATE TABLE IF NOT EXISTS fleet_permissions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    fleet_id INT NOT NULL,
    feature VARCHAR(100) NOT NULL,
    enabled BOOLEAN DEFAULT TRUE,
    limits JSON NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (fleet_id) REFERENCES fleets(id) ON DELETE CASCADE,
    UNIQUE KEY unique_fleet_feature (fleet_id, feature)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Table des logs d'activité owner
CREATE TABLE IF NOT EXISTS owner_activity_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    owner_id INT NOT NULL,
    fleet_id INT NOT NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NULL,
    entity_id INT NULL,
    details JSON NULL,
    ip_address VARCHAR(45) NULL,
    user_agent TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (fleet_id) REFERENCES fleets(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Créer des sessions actives pour les owners existants
INSERT IGNORE INTO fleet_sessions (fleet_id, owner_id, created_by_admin_id, status)
SELECT 
    f.id as fleet_id,
    f.owner_id,
    (SELECT id FROM users WHERE role = 'admin' LIMIT 1) as created_by_admin_id,
    'active' as status
FROM fleets f
JOIN users u ON f.owner_id = u.id
WHERE u.role = 'owner';

-- 5. Insérer des permissions par défaut pour les flottes existantes
INSERT IGNORE INTO fleet_permissions (fleet_id, feature, enabled, limits)
SELECT 
    f.id,
    'vehicle_management' as feature,
    TRUE as enabled,
    JSON_OBJECT('max_vehicles', 100) as limits
FROM fleets f;

INSERT IGNORE INTO fleet_permissions (fleet_id, feature, enabled, limits)
SELECT 
    f.id,
    'driver_management' as feature,
    TRUE as enabled,
    JSON_OBJECT('max_drivers', 200) as limits
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
