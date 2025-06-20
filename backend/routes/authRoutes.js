const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/login', authController.login);

// Development-only route to get a JWT token
// This should be removed or disabled in production
router.get('/dev-token', authController.getDevToken);

module.exports = router;
