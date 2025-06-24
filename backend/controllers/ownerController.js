const OwnerModel = require('../models/ownerModel');

/**
 * Contrôleur pour les fonctionnalités des owners (propriétaires de flotte)
 */
class OwnerController {
  
  /**
   * Obtenir le tableau de bord complet de l'owner
   */
  static async getDashboard(req, res) {
    try {
      console.log(`📊 Récupération du dashboard pour l'owner ${req.user.name} (Flotte: ${req.fleet.name})`);
      
      const dashboardData = await OwnerModel.getOwnerDashboard(req.user.id, req.fleetId);
      
      res.json({
        success: true,
        data: {
          ...dashboardData,
          fleet_info: {
            id: req.fleet.id,
            name: req.fleet.name,
            description: req.fleet.description,
            owner_name: req.user.name,
            owner_email: req.user.email
          }
        }
      });
    } catch (error) {
      console.error('❌ Erreur lors de la récupération du dashboard owner:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur lors de la récupération du tableau de bord',
        details: error.message
      });
    }
  }
  
  /**
   * Obtenir les véhicules de la flotte avec filtres
   */
  static async getVehicles(req, res) {
    try {
      console.log(`🚗 Récupération des véhicules pour la flotte ${req.fleet.name}`);
      
      const filters = {
        status: req.query.status,
        type: req.query.type,
        search: req.query.search
      };
      
      const vehicles = await OwnerModel.getFleetVehicles(req.fleetId, filters);
      
      res.json({
        success: true,
        data: vehicles,
        meta: {
          total: vehicles.length,
          fleet_id: req.fleetId,
          fleet_name: req.fleet.name,
          filters_applied: filters
        }
      });
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des véhicules:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur lors de la récupération des véhicules',
        details: error.message
      });
    }
  }
  
  /**
   * Obtenir les conducteurs de la flotte avec filtres
   */
  static async getDrivers(req, res) {
    try {
      console.log(`👨‍💼 Récupération des conducteurs pour la flotte ${req.fleet.name}`);
      
      const filters = {
        status: req.query.status,
        search: req.query.search
      };
      
      const drivers = await OwnerModel.getFleetDrivers(req.fleetId, filters);
      
      res.json({
        success: true,
        data: drivers,
        meta: {
          total: drivers.length,
          fleet_id: req.fleetId,
          fleet_name: req.fleet.name,
          filters_applied: filters
        }
      });
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des conducteurs:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur lors de la récupération des conducteurs',
        details: error.message
      });
    }
  }
  
  /**
   * Obtenir l'activité récente de la flotte
   */
  static async getActivity(req, res) {
    try {
      console.log(`📋 Récupération de l'activité pour la flotte ${req.fleet.name}`);
      
      const limit = parseInt(req.query.limit) || 50;
      const activities = await OwnerModel.getFleetActivity(req.fleetId, limit);
      
      res.json({
        success: true,
        data: activities,
        meta: {
          total: activities.length,
          fleet_id: req.fleetId,
          fleet_name: req.fleet.name,
          limit: limit
        }
      });
    } catch (error) {
      console.error('❌ Erreur lors de la récupération de l\'activité:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur lors de la récupération de l\'activité',
        details: error.message
      });
    }
  }
  
  /**
   * Obtenir les métriques de performance de la flotte
   */
  static async getPerformanceMetrics(req, res) {
    try {
      console.log(`⚡ Récupération des métriques pour la flotte ${req.fleet.name}`);
      
      const timeRange = req.query.timeRange || '30d';
      const metrics = await OwnerModel.getFleetPerformanceMetrics(req.fleetId, timeRange);
      
      res.json({
        success: true,
        data: metrics,
        meta: {
          fleet_id: req.fleetId,
          fleet_name: req.fleet.name,
          time_range: timeRange,
          total_records: metrics.length
        }
      });
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des métriques:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur lors de la récupération des métriques',
        details: error.message
      });
    }
  }
  
  /**
   * Obtenir les informations détaillées de la flotte
   */
  static async getFleetInfo(req, res) {
    try {
      console.log(`🏢 Récupération des infos de la flotte ${req.fleet.name}`);
      
      res.json({
        success: true,
        data: {
          ...req.fleet,
          owner_info: {
            id: req.user.id,
            name: req.user.name,
            email: req.user.email,
            phone: req.user.phone
          }
        }
      });
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des infos de flotte:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur lors de la récupération des informations',
        details: error.message
      });
    }
  }
  
  /**
   * Obtenir les violations de la flotte
   */
  static async getViolations(req, res) {
    try {
      console.log(`⚠️ Récupération des violations pour la flotte ${req.fleet.name}`);
      
      // Réutiliser l'API existante avec le filtre de flotte
      const db = require('../config/db');
      const connection = await db.getConnection();
      
      try {
        const [violations] = await connection.execute(`
          SELECT 
            viol.*,
            v.registration as vehicle_registration,
            v.brand as vehicle_brand,
            v.model as vehicle_model,
            d.first_name as driver_first_name,
            d.last_name as driver_last_name
          FROM violations viol
          JOIN vehicles v ON viol.vehicle_id = v.id
          LEFT JOIN drivers d ON viol.driver_id = d.id
          WHERE v.fleet_id = ?
          ORDER BY viol.timestamp DESC
          LIMIT 100
        `, [req.fleetId]);
        
        res.json({
          success: true,
          data: violations,
          meta: {
            total: violations.length,
            fleet_id: req.fleetId,
            fleet_name: req.fleet.name
          }
        });
        
      } finally {
        connection.release();
      }
      
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des violations:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur lors de la récupération des violations',
        details: error.message
      });
    }
  }
  
  /**
   * Obtenir les incidents de la flotte
   */
  static async getIncidents(req, res) {
    try {
      console.log(`🚨 Récupération des incidents pour la flotte ${req.fleet.name}`);
      
      const db = require('../config/db');
      const connection = await db.getConnection();
      
      try {
        const [incidents] = await connection.execute(`
          SELECT 
            i.*,
            v.registration as vehicle_registration,
            v.brand as vehicle_brand,
            v.model as vehicle_model,
            d.first_name as driver_first_name,
            d.last_name as driver_last_name
          FROM incidents i
          JOIN vehicles v ON i.vehicle_id = v.id
          LEFT JOIN drivers d ON i.driver_id = d.id
          WHERE v.fleet_id = ?
          ORDER BY i.timestamp DESC
          LIMIT 100
        `, [req.fleetId]);
        
        res.json({
          success: true,
          data: incidents,
          meta: {
            total: incidents.length,
            fleet_id: req.fleetId,
            fleet_name: req.fleet.name
          }
        });
        
      } finally {
        connection.release();
      }
      
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des incidents:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur lors de la récupération des incidents',
        details: error.message
      });
    }
  }
}

module.exports = OwnerController;
