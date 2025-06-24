const db = require('../config/db');

/**
 * Middleware d'authentification spécifique aux owners
 * Vérifie que l'utilisateur est un owner et récupère sa flotte associée
 */
const ownerAuth = async (req, res, next) => {
  try {
    // Vérifier que l'utilisateur est authentifié
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Non authentifié'
      });
    }

    // Vérifier que l'utilisateur a le rôle owner
    if (req.user.role !== 'owner') {
      return res.status(403).json({
        success: false,
        error: 'Accès refusé - Privilèges owner requis'
      });
    }

    // Récupérer la flotte associée à cet owner
    const connection = await db.getConnection();
    
    try {
      const [fleetRows] = await connection.execute(`
        SELECT 
          f.*,
          COUNT(v.id) as vehicle_count,
          COUNT(d.id) as driver_count
        FROM fleets f
        LEFT JOIN vehicles v ON f.id = v.fleet_id AND v.status != 'inactive'
        LEFT JOIN drivers d ON f.id = d.fleet_id AND d.status != 'inactive'
        WHERE f.owner_id = ? AND f.status = 'active'
        GROUP BY f.id
      `, [req.user.id]);

      if (fleetRows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Aucune flotte active trouvée pour cet owner'
        });
      }

      // Ajouter les informations de flotte à la requête
      req.fleet = fleetRows[0];
      req.fleetId = fleetRows[0].id;

      console.log(`🏢 Owner ${req.user.name} accède à la flotte "${req.fleet.name}" (ID: ${req.fleetId})`);
      
    } finally {
      connection.release();
    }

    next();
  } catch (error) {
    console.error('❌ Erreur dans ownerAuth middleware:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur interne du serveur'
    });
  }
};

/**
 * Middleware pour vérifier que les ressources appartiennent à la flotte de l'owner
 */
const validateFleetResource = (resourceType) => {
  return async (req, res, next) => {
    try {
      const connection = await db.getConnection();
      const resourceId = req.params.id;
      
      let query = '';
      let params = [];

      switch (resourceType) {
        case 'vehicle':
          query = 'SELECT fleet_id FROM vehicles WHERE id = ?';
          params = [resourceId];
          break;
          
        case 'driver':
          query = 'SELECT fleet_id FROM drivers WHERE id = ?';
          params = [resourceId];
          break;
          
        case 'violation':
          query = `
            SELECT v.fleet_id 
            FROM violations viol
            JOIN vehicles v ON viol.vehicle_id = v.id
            WHERE viol.id = ?
          `;
          params = [resourceId];
          break;
          
        case 'incident':
          query = `
            SELECT v.fleet_id 
            FROM incidents i
            JOIN vehicles v ON i.vehicle_id = v.id
            WHERE i.id = ?
          `;
          params = [resourceId];
          break;
          
        default:
          return res.status(400).json({
            success: false,
            error: 'Type de ressource non supporté'
          });
      }

      try {
        const [rows] = await connection.execute(query, params);
        
        if (rows.length === 0) {
          return res.status(404).json({
            success: false,
            error: `${resourceType} non trouvé`
          });
        }

        if (rows[0].fleet_id !== req.fleetId) {
          return res.status(403).json({
            success: false,
            error: 'Accès refusé - Cette ressource n\'appartient pas à votre flotte'
          });
        }

        next();
        
      } finally {
        connection.release();
      }
      
    } catch (error) {
      console.error(`❌ Erreur lors de la validation de ${resourceType}:`, error);
      res.status(500).json({
        success: false,
        error: 'Erreur interne du serveur'
      });
    }
  };
};

/**
 * Middleware pour ajouter automatiquement le filtre fleet_id aux requêtes
 */
const addFleetFilter = (req, res, next) => {
  // Ajouter le fleet_id aux filtres de la requête
  req.fleetFilter = {
    fleet_id: req.fleetId
  };
  
  // Si des filtres existent déjà, les combiner
  if (req.query.filters) {
    try {
      const existingFilters = JSON.parse(req.query.filters);
      req.fleetFilter = { ...existingFilters, fleet_id: req.fleetId };
    } catch (error) {
      // Si parsing échoue, garder seulement le filtre fleet_id
    }
  }
  
  next();
};

module.exports = {
  ownerAuth,
  validateFleetResource,
  addFleetFilter
};
