const express = require('express');
const router = express.Router();
const driverController = require('../controllers/driverController');

// Routes principales (avec support multi-tenant automatique)
router.get('/', driverController.getAll);
router.get('/:id', driverController.getById);
router.post('/', driverController.create);
router.put('/:id', driverController.update);
router.delete('/:id', driverController.remove);

// Routes spécialisées multi-tenant
router.get('/fleet/:fleetId', driverController.getByFleet);
router.get('/status/active', driverController.getActive);
router.get('/search/query', driverController.search);

module.exports = router;
