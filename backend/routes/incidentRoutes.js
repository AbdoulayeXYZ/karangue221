const express = require('express');
const router = express.Router();
const incidentController = require('../controllers/incidentController');

router.get('/', incidentController.getAll);
router.get('/:id', incidentController.getById);
router.post('/', incidentController.create);
router.put('/:id', incidentController.update);
router.delete('/:id', incidentController.remove);

module.exports = router; 