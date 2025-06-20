-- Supprimer les triggers existants s'ils existent
DROP TRIGGER IF EXISTS update_dashboard_after_vehicle_insert;
DROP TRIGGER IF EXISTS update_dashboard_after_vehicle_update;
DROP TRIGGER IF EXISTS update_dashboard_after_vehicle_delete;

-- Trigger après insertion d'un véhicule
DELIMITER //
CREATE TRIGGER update_dashboard_after_vehicle_insert
AFTER INSERT ON vehicles
FOR EACH ROW
BEGIN
    -- Mettre à jour ou insérer dans dashboard_summary pour la flotte concernée
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

-- Trigger après mise à jour d'un véhicule
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

-- Trigger après suppression d'un véhicule
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

-- Force une mise à jour initiale du tableau de bord
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
