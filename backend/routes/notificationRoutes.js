const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const auth = require('../middleware/auth');

// Apply authentication middleware to all routes
router.use(auth);

// Get all notifications with optional filters
router.get('/', notificationController.getAll);

// Get unread count
router.get('/unread/count', notificationController.getUnreadCount);

// Get specific notification
router.get('/:id', notificationController.getById);

// Create new notification
router.post('/', notificationController.create);

// Create system notification
router.post('/system', notificationController.createSystemNotification);

// Update notification
router.put('/:id', notificationController.update);

// Mark notification as read
router.patch('/:id/read', notificationController.markAsRead);

// Mark all notifications as read
router.patch('/read-all', notificationController.markAllAsRead);

// Delete notification
router.delete('/:id', notificationController.remove);

// Remove old notifications
router.delete('/cleanup/old', notificationController.removeOld);

module.exports = router; 