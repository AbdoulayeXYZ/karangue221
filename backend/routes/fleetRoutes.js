const express = require('express');
const router = express.Router();
const fleetController = require('../controllers/fleetController');

router.get('/', fleetController.getAll);
router.get('/:id', fleetController.getById);
router.post('/', fleetController.create);
router.put('/:id', fleetController.update);
router.delete('/:id', fleetController.remove);

module.exports = router; 