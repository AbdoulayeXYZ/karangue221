-- Script pour convertir dashboard_summary de vue en table physique

-- 1. Sauvegarder les données actuelles (optionnel)
CREATE TEMPORARY TABLE temp_dashboard_summary AS SELECT * FROM dashboard_summary;

-- 2. Supprimer la vue existante
DROP VIEW IF EXISTS dashboard_summary;

-- 3. Créer une nouvelle table avec la même structure
CREATE TABLE dashboard_summary (
    fleet_id INT NOT NULL PRIMARY KEY,
    fleet_name VARCHAR(100) NOT NULL,
    total_vehicles INT NOT NULL DEFAULT 0,
    active_vehicles INT NOT NULL DEFAULT 0,
    maintenance_vehicles INT NOT NULL DEFAULT 0,
    inactive_vehicles INT NOT NULL DEFAULT 0,
    total_drivers INT NOT NULL DEFAULT 0,
    active_drivers INT NOT NULL DEFAULT 0,
    inactive_drivers INT NOT NULL DEFAULT 0,
    total_incidents INT NOT NULL DEFAULT 0,
    open_incidents INT NOT NULL DEFAULT 0,
    total_violations INT NOT NULL DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 4. Restaurer les données à partir de la sauvegarde temporaire
INSERT INTO dashboard_summary (
    fleet_id, 
    fleet_name,
    total_vehicles, 
    active_vehicles, 
    maintenance_vehicles, 
    inactive_vehicles,
    total_drivers,
    active_drivers,
    inactive_drivers,
    total_incidents,
    open_incidents,
    total_violations
)
SELECT 
    fleet_id, 
    fleet_name,
    total_vehicles, 
    active_vehicles, 
    maintenance_vehicles, 
    inactive_vehicles,
    total_drivers,
    active_drivers,
    inactive_drivers,
    total_incidents,
    open_incidents,
    total_violations
FROM temp_dashboard_summary;

-- 5. Supprimer les triggers existants s'ils existent
DROP TRIGGER IF EXISTS update_dashboard_after_vehicle_insert;
DROP TRIGGER IF EXISTS update_dashboard_after_vehicle_update;
DROP TRIGGER IF EXISTS update_dashboard_after_vehicle_delete;

-- 6. Trigger après insertion d'un véhicule
DELIMITER //
CREATE TRIGGER update_dashboard_after_vehicle_insert
AFTER INSERT ON vehicles
FOR EACH ROW
BEGIN
    -- Mettre à jour dashboard_summary pour la flotte concernée
    INSERT INTO dashboard_summary (
        fleet_id, 
        fleet_name, 
        total_vehicles, 
        active_vehicles, 
        maintenance_vehicles, 
        inactive_vehicles,
        total_drivers,
        active_drivers,
        inactive_drivers,
        total_incidents,
        open_incidents,
        total_violations
    )
    SELECT 
        f.id as fleet_id,
        f.name as fleet_name,
        COUNT(v.id) as total_vehicles,
        SUM(CASE WHEN v.status = 'active' THEN 1 ELSE 0 END) as active_vehicles,
        SUM(CASE WHEN v.status = 'maintenance' THEN 1 ELSE 0 END) as maintenance_vehicles,
        SUM(CASE WHEN v.status = 'inactive' THEN 1 ELSE 0 END) as inactive_vehicles,
        (SELECT COUNT(*) FROM drivers d WHERE d.fleet_id = f.id) as total_drivers,
        (SELECT COUNT(*) FROM drivers d WHERE d.fleet_id = f.id AND d.status = 'active') as active_drivers,
        (SELECT COUNT(*) FROM drivers d WHERE d.fleet_id = f.id AND d.status = 'inactive') as inactive_drivers,
        (SELECT COUNT(*) FROM incidents i WHERE i.fleet_id = f.id) as total_incidents,
        (SELECT COUNT(*) FROM incidents i WHERE i.fleet_id = f.id AND i.status = 'open') as open_incidents,
        (SELECT COUNT(*) FROM violations v WHERE v.fleet_id = f.id) as total_violations
    FROM 
        fleets f
    LEFT JOIN 
        vehicles v ON f.id = v.fleet_id
    WHERE 
        f.id = NEW.fleet_id
    GROUP BY 
        f.id, f.name
    ON DUPLICATE KEY UPDATE
        fleet_name = VALUES(fleet_name),
        total_vehicles = VALUES(total_vehicles),
        active_vehicles = VALUES(active_vehicles),
        maintenance_vehicles = VALUES(maintenance_vehicles),
        inactive_vehicles = VALUES(inactive_vehicles),
        total_drivers = VALUES(total_drivers),
        active_drivers = VALUES(active_drivers),
        inactive_drivers = VALUES(inactive_drivers),
        total_incidents = VALUES(total_incidents),
        open_incidents = VALUES(open_incidents),
        total_violations = VALUES(total_violations);
END //
DELIMITER ;

-- 7. Trigger après mise à jour d'un véhicule
DELIMITER //
CREATE TRIGGER update_dashboard_after_vehicle_update
AFTER UPDATE ON vehicles
FOR EACH ROW
BEGIN
    -- Si le fleet_id a changé, mettre à jour les deux flottes
    IF OLD.fleet_id != NEW.fleet_id THEN
        -- Mettre à jour l'ancienne flotte
        INSERT INTO dashboard_summary (
            fleet_id, 
            fleet_name, 
            total_vehicles, 
            active_vehicles, 
            maintenance_vehicles, 
            inactive_vehicles,
            total_drivers,
            active_drivers,
            inactive_drivers,
            total_incidents,
            open_incidents,
            total_violations
        )
        SELECT 
            f.id as fleet_id,
            f.name as fleet_name,
            COUNT(v.id) as total_vehicles,
            SUM(CASE WHEN v.status = 'active' THEN 1 ELSE 0 END) as active_vehicles,
            SUM(CASE WHEN v.status = 'maintenance' THEN 1 ELSE 0 END) as maintenance_vehicles,
            SUM(CASE WHEN v.status = 'inactive' THEN 1 ELSE 0 END) as inactive_vehicles,
            (SELECT COUNT(*) FROM drivers d WHERE d.fleet_id = f.id) as total_drivers,
            (SELECT COUNT(*) FROM drivers d WHERE d.fleet_id = f.id AND d.status = 'active') as active_drivers,
            (SELECT COUNT(*) FROM drivers d WHERE d.fleet_id = f.id AND d.status = 'inactive') as inactive_drivers,
            (SELECT COUNT(*) FROM incidents i WHERE i.fleet_id = f.id) as total_incidents,
            (SELECT COUNT(*) FROM incidents i WHERE i.fleet_id = f.id AND i.status = 'open') as open_incidents,
            (SELECT COUNT(*) FROM violations v WHERE v.fleet_id = f.id) as total_violations
        FROM 
            fleets f
        LEFT JOIN 
            vehicles v ON f.id = v.fleet_id
        WHERE 
            f.id = OLD.fleet_id
        GROUP BY 
            f.id, f.name
        ON DUPLICATE KEY UPDATE
            fleet_name = VALUES(fleet_name),
            total_vehicles = VALUES(total_vehicles),
            active_vehicles = VALUES(active_vehicles),
            maintenance_vehicles = VALUES(maintenance_vehicles),
            inactive_vehicles = VALUES(inactive_vehicles),
            total_drivers = VALUES(total_drivers),
            active_drivers = VALUES(active_drivers),
            inactive_drivers = VALUES(inactive_drivers),
            total_incidents = VALUES(total_incidents),
            open_incidents = VALUES(open_incidents),
            total_violations = VALUES(total_violations);
    END IF;
    
    -- Mettre à jour la nouvelle flotte (ou la même si fleet_id n'a pas changé)
    INSERT INTO dashboard_summary (
        fleet_id, 
        fleet_name, 
        total_vehicles, 
        active_vehicles, 
        maintenance_vehicles, 
        inactive_vehicles,
        total_drivers,
        active_drivers,
        inactive_drivers,
        total_incidents,
        open_incidents,
        total_violations
    )
    SELECT 
        f.id as fleet_id,
        f.name as fleet_name,
        COUNT(v.id) as total_vehicles,
        SUM(CASE WHEN v.status = 'active' THEN 1 ELSE 0 END) as active_vehicles,
        SUM(CASE WHEN v.status = 'maintenance' THEN 1 ELSE 0 END) as maintenance_vehicles,
        SUM(CASE WHEN v.status = 'inactive' THEN 1 ELSE 0 END) as inactive_vehicles,
        (SELECT COUNT(*) FROM drivers d WHERE d.fleet_id = f.id) as total_drivers,
        (SELECT COUNT(*) FROM drivers d WHERE d.fleet_id = f.id AND d.status = 'active') as active_drivers,
        (SELECT COUNT(*) FROM drivers d WHERE d.fleet_id = f.id AND d.status = 'inactive') as inactive_drivers,
        (SELECT COUNT(*) FROM incidents i WHERE i.fleet_id = f.id) as total_incidents,
        (SELECT COUNT(*) FROM incidents i WHERE i.fleet_id = f.id AND i.status = 'open') as open_incidents,
        (SELECT COUNT(*) FROM violations v WHERE v.fleet_id = f.id) as total_violations
    FROM 
        fleets f
    LEFT JOIN 
        vehicles v ON f.id = v.fleet_id
    WHERE 
        f.id = NEW.fleet_id
    GROUP BY 
        f.id, f.name
    ON DUPLICATE KEY UPDATE
        fleet_name = VALUES(fleet_name),
        total_vehicles = VALUES(total_vehicles),
        active_vehicles = VALUES(active_vehicles),
        maintenance_vehicles = VALUES(maintenance_vehicles),
        inactive_vehicles = VALUES(inactive_vehicles),
        total_drivers = VALUES(total_drivers),
        active_drivers = VALUES(active_drivers),
        inactive_drivers = VALUES(inactive_drivers),
        total_incidents = VALUES(total_incidents),
        open_incidents = VALUES(open_incidents),
        total_violations = VALUES(total_violations);
END //
DELIMITER ;

-- 8. Trigger après suppression d'un véhicule
DELIMITER //
CREATE TRIGGER update_dashboard_after_vehicle_delete
AFTER DELETE ON vehicles
FOR EACH ROW
BEGIN
    -- Mettre à jour dashboard_summary pour la flotte concernée
    INSERT INTO dashboard_summary (
        fleet_id, 
        fleet_name, 
        total_vehicles, 
        active_vehicles, 
        maintenance_vehicles, 
        inactive_vehicles,
        total_drivers,
        active_drivers,
        inactive_drivers,
        total_incidents,
        open_incidents,
        total_violations
    )
    SELECT 
        f.id as fleet_id,
        f.name as fleet_name,
        COUNT(v.id) as total_vehicles,
        SUM(CASE WHEN v.status = 'active' THEN 1 ELSE 0 END) as active_vehicles,
        SUM(CASE WHEN v.status = 'maintenance' THEN 1 ELSE 0 END) as maintenance_vehicles,
        SUM(CASE WHEN v.status = 'inactive' THEN 1 ELSE 0 END) as inactive_vehicles,
        (SELECT COUNT(*) FROM drivers d WHERE d.fleet_id = f.id) as total_drivers,
        (SELECT COUNT(*) FROM drivers d WHERE d.fleet_id = f.id AND d.status = 'active') as active_drivers,
        (SELECT COUNT(*) FROM drivers d WHERE d.fleet_id = f.id AND d.status = 'inactive') as inactive_drivers,
        (SELECT COUNT(*) FROM incidents i WHERE i.fleet_id = f.id) as total_incidents,
        (SELECT COUNT(*) FROM incidents i WHERE i.fleet_id = f.id AND i.status = 'open') as open_incidents,
        (SELECT COUNT(*) FROM violations v WHERE v.fleet_id = f.id) as total_violations
    FROM 
        fleets f
    LEFT JOIN 
        vehicles v ON f.id = v.fleet_id
    WHERE 
        f.id = OLD.fleet_id
    GROUP BY 
        f.id, f.name
    ON DUPLICATE KEY UPDATE
        fleet_name = VALUES(fleet_name),
        total_vehicles = VALUES(total_vehicles),
        active_vehicles = VALUES(active_vehicles),
        maintenance_vehicles = VALUES(maintenance_vehicles),
        inactive_vehicles = VALUES(inactive_vehicles),
        total_drivers = VALUES(total_drivers),
        active_drivers = VALUES(active_drivers),
        inactive_drivers = VALUES(inactive_drivers),
        total_incidents = VALUES(total_incidents),
        open_incidents = VALUES(open_incidents),
        total_violations = VALUES(total_violations);
END //
DELIMITER ;

-- 9. Recalculer les valeurs pour toutes les flottes (pour s'assurer que tout est synchronisé)
INSERT INTO dashboard_summary (
    fleet_id, 
    fleet_name, 
    total_vehicles, 
    active_vehicles, 
    maintenance_vehicles, 
    inactive_vehicles,
    total_drivers,
    active_drivers,
    inactive_drivers,
    total_incidents,
    open_incidents,
    total_violations
)
SELECT 
    f.id as fleet_id,
    f.name as fleet_name,
    COUNT(DISTINCT v.id) as total_vehicles,
    SUM(CASE WHEN v.status = 'active' THEN 1 ELSE 0 END) as active_vehicles,
    SUM(CASE WHEN v.status = 'maintenance' THEN 1 ELSE 0 END) as maintenance_vehicles,
    SUM(CASE WHEN v.status = 'inactive' THEN 1 ELSE 0 END) as inactive_vehicles,
    COUNT(DISTINCT d.id) as total_drivers,
    SUM(CASE WHEN d.status = 'active' THEN 1 ELSE 0 END) as active_drivers,
    SUM(CASE WHEN d.status = 'inactive' THEN 1 ELSE 0 END) as inactive_drivers,
    COUNT(DISTINCT i.id) as total_incidents,
    SUM(CASE WHEN i.status = 'open' THEN 1 ELSE 0 END) as open_incidents,
    COUNT(DISTINCT vio.id) as total_violations
FROM 
    fleets f
LEFT JOIN vehicles v ON f.id = v.fleet_id
LEFT JOIN drivers d ON f.id = d.fleet_id
LEFT JOIN incidents i ON v.id = i.vehicle_id
LEFT JOIN violations vio ON v.id = vio.vehicle_id
GROUP BY 
    f.id, f.name
ON DUPLICATE KEY UPDATE
    fleet_name = VALUES(fleet_name),
    total_vehicles = VALUES(total_vehicles),
    active_vehicles = VALUES(active_vehicles),
    maintenance_vehicles = VALUES(maintenance_vehicles),
    inactive_vehicles = VALUES(inactive_vehicles),
    total_drivers = VALUES(total_drivers),
    active_drivers = VALUES(active_drivers),
    inactive_drivers = VALUES(inactive_drivers),
    total_incidents = VALUES(total_incidents),
    open_incidents = VALUES(open_incidents),
    total_violations = VALUES(total_violations);

-- Afficher un message de confirmation
SELECT 'Dashboard_summary convertie en table avec succès et triggers créés' AS message;
