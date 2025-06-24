const express = require('express');
const router = express.Router();
const tenantController = require('../controllers/tenantController');
const auth = require('../middleware/auth');

// Routes publiques pour la gestion des tenants
router.get('/current', tenantController.getCurrentTenantInfo);
router.get('/info', tenantController.getCurrentTenantInfo);
router.get('/check/:subdomain', tenantController.checkSubdomainAvailability);

// Routes protégées (nécessitent une authentification admin)
router.use(auth);

// CRUD pour les tenants (admin seulement)
router.get('/', tenantController.getAllTenants);
router.get('/:id', tenantController.getTenantById);
router.post('/', tenantController.createTenant);
router.put('/:id', tenantController.updateTenant);
router.delete('/:id', tenantController.deleteTenant);

// Gestion du statut des tenants
router.patch('/:id/activate', tenantController.activateTenant);
router.patch('/:id/suspend', tenantController.suspendTenant);
router.patch('/:id/deactivate', tenantController.deactivateTenant);

// Statistiques des tenants
router.get('/:id/stats', tenantController.getTenantStats);
router.get('/stats/all', tenantController.getAllTenantsStats);

module.exports = router;
