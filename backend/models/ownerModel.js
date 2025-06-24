const db = require('../config/db');

class OwnerModel {
  /**
   * Obtenir le tableau de bord complet pour un owner (données de sa flotte uniquement)
   */
  static async getOwnerDashboard(ownerId, fleetId) {
    try {
      const connection = await db.getConnection();
      
      // Statistiques de la flotte
      const [fleetStats] = await connection.execute(`
        SELECT 
          f.id,
          f.name,
          f.description,
          COUNT(DISTINCT v.id) as total_vehicles,
          COUNT(DISTINCT CASE WHEN v.status = 'active' THEN v.id END) as active_vehicles,
          COUNT(DISTINCT CASE WHEN v.status = 'maintenance' THEN v.id END) as maintenance_vehicles,
          COUNT(DISTINCT CASE WHEN v.status = 'inactive' THEN v.id END) as inactive_vehicles,
          COUNT(DISTINCT d.id) as total_drivers,
          COUNT(DISTINCT CASE WHEN d.status = 'active' THEN d.id END) as active_drivers
        FROM fleets f
        LEFT JOIN vehicles v ON f.id = v.fleet_id
        LEFT JOIN drivers d ON f.id = d.fleet_id
        WHERE f.owner_id = ? AND f.id = ?
        GROUP BY f.id
      `, [ownerId, fleetId]);

      // Violations récentes (30 derniers jours)
      const [violationStats] = await connection.execute(`
        SELECT 
          COUNT(*) as total_violations,
          COUNT(CASE WHEN viol.status = 'pending' THEN 1 END) as pending_violations,
          COUNT(CASE WHEN viol.status = 'confirmed' THEN 1 END) as confirmed_violations,
          COUNT(CASE WHEN viol.severity = 'high' THEN 1 END) as high_severity_violations,
          AVG(CASE WHEN viol.status = 'confirmed' THEN viol.cost ELSE 0 END) as avg_violation_cost
        FROM violations viol
        JOIN vehicles v ON viol.vehicle_id = v.id
        WHERE v.fleet_id = ? AND viol.timestamp >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      `, [fleetId]);

      // Incidents récents (30 derniers jours)
      const [incidentStats] = await connection.execute(`
        SELECT 
          COUNT(*) as total_incidents,
          COUNT(CASE WHEN i.status = 'open' THEN 1 END) as open_incidents,
          COUNT(CASE WHEN i.status = 'resolved' THEN 1 END) as resolved_incidents,
          COUNT(CASE WHEN i.severity = 'high' THEN 1 END) as high_severity_incidents
        FROM incidents i
        JOIN vehicles v ON i.vehicle_id = v.id
        WHERE v.fleet_id = ? AND i.timestamp >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      `, [fleetId]);

      // Données de télémétrie récentes (dernières 24h)
      const [telemetryStats] = await connection.execute(`
        SELECT 
          COUNT(*) as total_records,
          AVG(speed) as avg_speed,
          MAX(speed) as max_speed,
          AVG(fuel_level) as avg_fuel_level,
          COUNT(DISTINCT vehicle_id) as active_vehicles_today
        FROM telemetry t
        JOIN vehicles v ON t.vehicle_id = v.id
        WHERE v.fleet_id = ? AND t.timestamp >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
      `, [fleetId]);

      connection.release();

      return {
        fleet: fleetStats[0] || {},
        violations: violationStats[0] || {},
        incidents: incidentStats[0] || {},
        telemetry: telemetryStats[0] || {},
        last_updated: new Date()
      };
    } catch (error) {
      console.error('Erreur lors de la récupération du dashboard owner:', error);
      throw error;
    }
  }

  /**
   * Obtenir les véhicules de la flotte de l'owner avec filtres
   */
  static async getFleetVehicles(fleetId, filters = {}) {
    try {
      const connection = await db.getConnection();
      
      let whereClause = 'WHERE v.fleet_id = ?';
      let params = [fleetId];
      
      // Appliquer les filtres
      if (filters.status && filters.status !== 'all') {
        whereClause += ' AND v.status = ?';
        params.push(filters.status);
      }
      
      if (filters.type && filters.type !== 'all') {
        whereClause += ' AND v.type = ?';
        params.push(filters.type);
      }
      
      if (filters.search) {
        whereClause += ' AND (v.registration LIKE ? OR v.brand LIKE ? OR v.model LIKE ?)';
        const searchTerm = `%${filters.search}%`;
        params.push(searchTerm, searchTerm, searchTerm);
      }

      const [vehicles] = await connection.execute(`
        SELECT 
          v.*,
          d.first_name as driver_first_name,
          d.last_name as driver_last_name,
          d.phone as driver_phone,
          va.status as assignment_status
        FROM vehicles v
        LEFT JOIN vehicle_assignments va ON v.id = va.vehicle_id AND va.status = 'active'
        LEFT JOIN drivers d ON va.driver_id = d.id
        ${whereClause}
        ORDER BY v.created_at DESC
      `, params);

      connection.release();
      return vehicles;
    } catch (error) {
      console.error('Erreur lors de la récupération des véhicules:', error);
      throw error;
    }
  }

  /**
   * Obtenir les conducteurs de la flotte de l'owner
   */
  static async getFleetDrivers(fleetId, filters = {}) {
    try {
      const connection = await db.getConnection();
      
      let whereClause = 'WHERE d.fleet_id = ?';
      let params = [fleetId];
      
      if (filters.status && filters.status !== 'all') {
        whereClause += ' AND d.status = ?';
        params.push(filters.status);
      }
      
      if (filters.search) {
        whereClause += ' AND (d.first_name LIKE ? OR d.last_name LIKE ? OR d.license_number LIKE ?)';
        const searchTerm = `%${filters.search}%`;
        params.push(searchTerm, searchTerm, searchTerm);
      }

      const [drivers] = await connection.execute(`
        SELECT 
          d.*,
          v.registration as assigned_vehicle,
          v.brand as vehicle_brand,
          v.model as vehicle_model
        FROM drivers d
        LEFT JOIN vehicle_assignments va ON d.id = va.driver_id AND va.status = 'active'
        LEFT JOIN vehicles v ON va.vehicle_id = v.id
        ${whereClause}
        ORDER BY d.created_at DESC
      `, params);

      connection.release();
      return drivers;
    } catch (error) {
      console.error('Erreur lors de la récupération des conducteurs:', error);
      throw error;
    }
  }

  /**
   * Obtenir l'activité récente de la flotte
   */
  static async getFleetActivity(fleetId, limit = 50) {
    try {
      const connection = await db.getConnection();
      
      const activities = [];
      
      // Violations récentes
      try {
        const [violations] = await connection.execute(`
          SELECT 
            'violation' as type,
            CONCAT('Violation: ', viol.type, ' - ', v.registration) as description,
            viol.timestamp,
            viol.id as entity_id,
            viol.severity
          FROM violations viol
          JOIN vehicles v ON viol.vehicle_id = v.id
          WHERE v.fleet_id = ?
          ORDER BY viol.timestamp DESC
          LIMIT 10
        `, [fleetId]);
        activities.push(...violations);
      } catch (err) {
        console.log('Pas de violations récentes');
      }
      
      // Incidents récents
      try {
        const [incidents] = await connection.execute(`
          SELECT 
            'incident' as type,
            CONCAT('Incident: ', i.type, ' - ', v.registration) as description,
            i.timestamp,
            i.id as entity_id,
            i.severity
          FROM incidents i
          JOIN vehicles v ON i.vehicle_id = v.id
          WHERE v.fleet_id = ?
          ORDER BY i.timestamp DESC
          LIMIT 10
        `, [fleetId]);
        activities.push(...incidents);
      } catch (err) {
        console.log('Pas d\'incidents récents');
      }
      
      // Véhicules récemment ajoutés
      try {
        const [vehicles] = await connection.execute(`
          SELECT 
            'vehicle' as type,
            CONCAT('Véhicule ajouté: ', registration, ' (', brand, ' ', model, ')') as description,
            created_at as timestamp,
            id as entity_id,
            'info' as severity
          FROM vehicles
          WHERE fleet_id = ?
          ORDER BY created_at DESC
          LIMIT 5
        `, [fleetId]);
        activities.push(...vehicles);
      } catch (err) {
        console.log('Pas de véhicules récents');
      }

      // Trier par timestamp et limiter
      activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      const limitedActivities = activities.slice(0, limit);
      
      connection.release();
      return limitedActivities;
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'activité de la flotte:', error);
      throw error;
    }
  }

  /**
   * Obtenir les métriques de performance de la flotte
   */
  static async getFleetPerformanceMetrics(fleetId, timeRange = '30d') {
    try {
      const connection = await db.getConnection();
      
      let interval = '';
      switch (timeRange) {
        case '7d':
          interval = 'INTERVAL 7 DAY';
          break;
        case '30d':
          interval = 'INTERVAL 30 DAY';
          break;
        case '90d':
          interval = 'INTERVAL 90 DAY';
          break;
        default:
          interval = 'INTERVAL 30 DAY';
      }

      // Métriques de performance
      const [performanceData] = await connection.execute(`
        SELECT 
          DATE(t.timestamp) as date,
          COUNT(DISTINCT t.vehicle_id) as active_vehicles,
          AVG(t.speed) as avg_speed,
          MAX(t.speed) as max_speed,
          AVG(t.fuel_level) as avg_fuel_level,
          COUNT(viol.id) as daily_violations,
          COUNT(i.id) as daily_incidents
        FROM telemetry t
        JOIN vehicles v ON t.vehicle_id = v.id
        LEFT JOIN violations viol ON v.id = viol.vehicle_id AND DATE(viol.timestamp) = DATE(t.timestamp)
        LEFT JOIN incidents i ON v.id = i.vehicle_id AND DATE(i.timestamp) = DATE(t.timestamp)
        WHERE v.fleet_id = ? AND t.timestamp >= DATE_SUB(NOW(), ${interval})
        GROUP BY DATE(t.timestamp)
        ORDER BY date DESC
      `, [fleetId]);

      connection.release();
      return performanceData;
    } catch (error) {
      console.error('Erreur lors de la récupération des métriques de performance:', error);
      throw error;
    }
  }

  /**
   * Créer une session de flotte pour un client (utilisé par l'admin)
   */
  static async createFleetSession(adminId, ownerId, fleetId, sessionData = {}) {
    try {
      const connection = await db.getConnection();
      await connection.beginTransaction();

      try {
        // Vérifier que la flotte appartient bien à l'owner
        const [fleetCheck] = await connection.execute(`
          SELECT id FROM fleets WHERE id = ? AND owner_id = ?
        `, [fleetId, ownerId]);

        if (fleetCheck.length === 0) {
          throw new Error('Flotte non trouvée ou n\'appartient pas à cet owner');
        }

        // Créer la session
        const [sessionResult] = await connection.execute(`
          INSERT INTO fleet_sessions (
            fleet_id, 
            owner_id, 
            created_by_admin_id, 
            status, 
            expires_at, 
            session_data
          ) VALUES (?, ?, ?, 'active', ?, ?)
        `, [
          fleetId,
          ownerId,
          adminId,
          sessionData.expires_at || null,
          JSON.stringify(sessionData)
        ]);

        await connection.commit();
        
        return {
          session_id: sessionResult.insertId,
          fleet_id: fleetId,
          owner_id: ownerId,
          status: 'active',
          created_at: new Date()
        };
        
      } catch (error) {
        await connection.rollback();
        throw error;
      } finally {
        connection.release();
      }
      
    } catch (error) {
      console.error('Erreur lors de la création de la session de flotte:', error);
      throw error;
    }
  }
}

module.exports = OwnerModel;
