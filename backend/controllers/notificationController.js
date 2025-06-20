const Notification = require('../models/notificationModel');

exports.getAll = async (req, res) => {
  const notifications = await Notification.getAll();
  res.json(notifications);
};

exports.getById = async (req, res) => {
  const notification = await Notification.getById(req.params.id);
  if (!notification) return res.status(404).json({ error: 'Not found' });
  res.json(notification);
};

exports.create = async (req, res) => {
  const newNotification = await Notification.create(req.body);
  res.status(201).json(newNotification);
};

exports.update = async (req, res) => {
  await Notification.update(req.params.id, req.body);
  res.json({ success: true });
};

exports.remove = async (req, res) => {
  await Notification.remove(req.params.id);
  res.json({ success: true });
}; 