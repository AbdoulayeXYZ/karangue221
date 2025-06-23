const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/adminController');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

// Appliquer l'authentification et les privilèges admin à toutes les routes
router.use(auth);
router.use(adminAuth);

/**
 * Routes du tableau de bord administrateur
 */

// GET /api/admin/dashboard - Tableau de bord complet
router.get('/dashboard', AdminController.getDashboard);

// GET /api/admin/stats - Statistiques système
router.get('/stats', AdminController.getSystemStats);

// GET /api/admin/activity - Activité récente
router.get('/activity', AdminController.getSystemActivity);

// GET /api/admin/performance - Métriques de performance
router.get('/performance', AdminController.getPerformanceMetrics);

// GET /api/admin/logs - Logs système
router.get('/logs', AdminController.getSystemLogs);

/**
 * Routes de gestion des utilisateurs
 */

// GET /api/admin/users - Obtenir tous les utilisateurs
router.get('/users', AdminController.getAllUsers);

// POST /api/admin/users - Créer un nouvel utilisateur
router.post('/users', AdminController.createUser);

// PUT /api/admin/users/:id - Mettre à jour un utilisateur
router.put('/users/:id', AdminController.updateUser);

// DELETE /api/admin/users/:id - Supprimer (désactiver) un utilisateur
router.delete('/users/:id', AdminController.deleteUser);

/**
 * Routes de gestion avancée (à implémenter selon les besoins)
 */

// GET /api/admin/backup - Créer une sauvegarde
router.get('/backup', (req, res) => {
  res.json({
    success: false,
    message: 'Fonctionnalité de sauvegarde à implémenter'
  });
});

// POST /api/admin/maintenance - Mode maintenance
router.post('/maintenance', (req, res) => {
  res.json({
    success: false,
    message: 'Mode maintenance à implémenter'
  });
});

// GET /api/admin/health - État de santé du système détaillé
router.get('/health', AdminController.getSystemHealth);

module.exports = router;
