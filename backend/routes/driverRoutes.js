const express = require('express');
const router = express.Router();
const driverController = require('../controllers/driverController');

router.get('/', driverController.getAll);
router.get('/:id', driverController.getById);
router.post('/', driverController.create);
router.put('/:id', driverController.update);
router.delete('/:id', driverController.remove);

module.exports = router; 