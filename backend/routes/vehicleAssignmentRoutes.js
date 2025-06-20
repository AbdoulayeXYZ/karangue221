const express = require('express');
const router = express.Router();
const assignmentController = require('../controllers/vehicleAssignmentController');

router.get('/', assignmentController.getAll);
router.get('/:id', assignmentController.getById);
router.post('/', assignmentController.create);
router.put('/:id', assignmentController.update);
router.delete('/:id', assignmentController.remove);

module.exports = router; 