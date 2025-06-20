const express = require('express');
const router = express.Router();
const violationController = require('../controllers/violationController');

router.get('/', violationController.getAll);
router.get('/:id', violationController.getById);
router.post('/', violationController.create);
router.put('/:id', violationController.update);
router.delete('/:id', violationController.remove);

module.exports = router; 