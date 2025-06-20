const express = require('express');
const router = express.Router();
const telemetryController = require('../controllers/telemetryController');

router.get('/', telemetryController.getAll);
router.get('/:id', telemetryController.getById);
router.post('/', telemetryController.create);
router.put('/:id', telemetryController.update);
router.delete('/:id', telemetryController.remove);

module.exports = router; 