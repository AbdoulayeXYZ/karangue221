const Notification = require('../models/notificationModel');

exports.getAll = async (req, res) => {
  try {
    const userId = req.user?.id;
    const filters = {
      status: req.query.status,
      type: req.query.type,
      limit: req.query.limit ? parseInt(req.query.limit) : null
    };
    
    const notifications = await Notification.getAll(userId, filters);
    res.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des notifications' });
  }
};

exports.getById = async (req, res) => {
  try {
    const notification = await Notification.getById(req.params.id);
    if (!notification) {
      return res.status(404).json({ error: 'Notification non trouvée' });
    }
    res.json(notification);
  } catch (error) {
    console.error('Error fetching notification:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération de la notification' });
  }
};

exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.user?.id;
    const count = await Notification.getUnreadCount(userId);
    res.json({ count });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération du compteur' });
  }
};

exports.create = async (req, res) => {
  try {
    const notificationData = {
      ...req.body,
      user_id: req.user?.id || req.body.user_id,
      timestamp: new Date()
    };
    
    const newNotification = await Notification.create(notificationData);
    res.status(201).json(newNotification);
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ error: 'Erreur lors de la création de la notification' });
  }
};

exports.update = async (req, res) => {
  try {
    await Notification.update(req.params.id, req.body);
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating notification:', error);
    res.status(500).json({ error: 'Erreur lors de la modification de la notification' });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    await Notification.markAsRead(req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: 'Erreur lors du marquage de la notification' });
  }
};

exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.user?.id;
    await Notification.markAllAsRead(userId);
    res.json({ success: true });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ error: 'Erreur lors du marquage des notifications' });
  }
};

exports.remove = async (req, res) => {
  try {
    await Notification.remove(req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error('Error removing notification:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression de la notification' });
  }
};

exports.removeOld = async (req, res) => {
  try {
    const days = req.query.days ? parseInt(req.query.days) : 30;
    await Notification.removeOld(days);
    res.json({ success: true });
  } catch (error) {
    console.error('Error removing old notifications:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression des anciennes notifications' });
  }
};

// Create system notification
exports.createSystemNotification = async (req, res) => {
  try {
    const { type, message, userId } = req.body;
    const notification = await Notification.createSystemNotification(type, message, userId);
    res.status(201).json(notification);
  } catch (error) {
    console.error('Error creating system notification:', error);
    res.status(500).json({ error: 'Erreur lors de la création de la notification système' });
  }
}; 