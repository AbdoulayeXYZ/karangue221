const express = require('express');
const router = express.Router();
const OwnerController = require('../controllers/ownerController');
const auth = require('../middleware/auth');
const { ownerAuth, validateFleetResource, addFleetFilter } = require('../middleware/ownerAuth');

// Appliquer l'authentification de base puis l'authentification owner à toutes les routes
router.use(auth);
router.use(ownerAuth);

/**
 * Routes du tableau de bord owner
 */

// GET /api/owner/dashboard - Tableau de bord complet de la flotte
router.get('/dashboard', OwnerController.getDashboard);

// GET /api/owner/fleet - Informations détaillées de la flotte
router.get('/fleet', OwnerController.getFleetInfo);

// GET /api/owner/activity - Activité récente de la flotte
router.get('/activity', OwnerController.getActivity);

// GET /api/owner/performance - Métriques de performance de la flotte
router.get('/performance', OwnerController.getPerformanceMetrics);

/**
 * Routes de gestion des véhicules (filtrées par flotte)
 */

// GET /api/owner/vehicles - Obtenir tous les véhicules de la flotte
router.get('/vehicles', addFleetFilter, OwnerController.getVehicles);

// GET /api/owner/vehicles/:id - Obtenir un véhicule spécifique (avec validation)
router.get('/vehicles/:id', validateFleetResource('vehicle'), (req, res) => {
  // Rediriger vers l'API véhicule existante avec le filtre de flotte
  res.redirect(`/api/vehicles/${req.params.id}`);
});

/**
 * Routes de gestion des conducteurs (filtrées par flotte)
 */

// GET /api/owner/drivers - Obtenir tous les conducteurs de la flotte
router.get('/drivers', addFleetFilter, OwnerController.getDrivers);

// GET /api/owner/drivers/:id - Obtenir un conducteur spécifique (avec validation)
router.get('/drivers/:id', validateFleetResource('driver'), (req, res) => {
  // Rediriger vers l'API conducteur existante avec le filtre de flotte
  res.redirect(`/api/drivers/${req.params.id}`);
});

/**
 * Routes des violations et incidents (filtrées par flotte)
 */

// GET /api/owner/violations - Obtenir les violations de la flotte
router.get('/violations', OwnerController.getViolations);

// GET /api/owner/violations/:id - Obtenir une violation spécifique (avec validation)
router.get('/violations/:id', validateFleetResource('violation'), (req, res) => {
  res.redirect(`/api/violations/${req.params.id}`);
});

// GET /api/owner/incidents - Obtenir les incidents de la flotte
router.get('/incidents', OwnerController.getIncidents);

// GET /api/owner/incidents/:id - Obtenir un incident spécifique (avec validation)
router.get('/incidents/:id', validateFleetResource('incident'), (req, res) => {
  res.redirect(`/api/incidents/${req.params.id}`);
});

/**
 * Routes des données temps réel (filtrées par flotte)
 */

// GET /api/owner/telemetry - Données de télémétrie de la flotte
router.get('/telemetry', addFleetFilter, (req, res) => {
  // Ajouter le filtre de flotte et rediriger
  req.query.fleet_id = req.fleetId;
  res.redirect(`/api/telemetry?${new URLSearchParams(req.query).toString()}`);
});

/**
 * Routes de gestion spécifiques à l'owner (lecture seule pour la plupart)
 */

// GET /api/owner/stats - Statistiques rapides de la flotte
router.get('/stats', (req, res) => {
  res.json({
    success: true,
    data: {
      fleet_id: req.fleetId,
      fleet_name: req.fleet.name,
      vehicle_count: req.fleet.vehicle_count || 0,
      driver_count: req.fleet.driver_count || 0,
      owner_info: {
        name: req.user.name,
        email: req.user.email
      }
    }
  });
});

// GET /api/owner/profile - Profil de l'owner
router.get('/profile', (req, res) => {
  res.json({
    success: true,
    data: {
      user: {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        phone: req.user.phone,
        role: req.user.role
      },
      fleet: {
        id: req.fleet.id,
        name: req.fleet.name,
        description: req.fleet.description,
        vehicle_count: req.fleet.vehicle_count || 0,
        driver_count: req.fleet.driver_count || 0
      }
    }
  });
});

/**
 * Routes de mise à jour limitées (owner peut modifier certaines informations)
 */

// PUT /api/owner/profile - Mettre à jour le profil owner (limité)
router.put('/profile', async (req, res) => {
  try {
    const { name, phone } = req.body;
    
    // Validation basique
    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Le nom est requis'
      });
    }

    const db = require('../config/db');
    const connection = await db.getConnection();
    
    try {
      await connection.execute(`
        UPDATE users 
        SET name = ?, phone = ? 
        WHERE id = ? AND role = 'owner'
      `, [name, phone, req.user.id]);
      
      res.json({
        success: true,
        message: 'Profil mis à jour avec succès'
      });
      
    } finally {
      connection.release();
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour du profil:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la mise à jour du profil'
    });
  }
});

/**
 * Middleware de gestion d'erreur pour les routes owner
 */
router.use((error, req, res, next) => {
  console.error('❌ Erreur dans les routes owner:', error);
  
  if (error.code === 'FLEET_NOT_FOUND') {
    return res.status(404).json({
      success: false,
      error: 'Flotte non trouvée'
    });
  }
  
  if (error.code === 'FLEET_ACCESS_DENIED') {
    return res.status(403).json({
      success: false,
      error: 'Accès refusé à cette flotte'
    });
  }
  
  res.status(500).json({
    success: false,
    error: 'Erreur interne du serveur',
    details: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
});

module.exports = router;
