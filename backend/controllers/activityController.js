const Activity = require('../models/activityModel');

exports.getAll = async (req, res) => {
  const activities = await Activity.getAll();
  res.json(activities);
};

exports.getById = async (req, res) => {
  const activity = await Activity.getById(req.params.id);
  if (!activity) return res.status(404).json({ error: 'Not found' });
  res.json(activity);
};

exports.create = async (req, res) => {
  const newActivity = await Activity.create(req.body);
  res.status(201).json(newActivity);
};

exports.update = async (req, res) => {
  await Activity.update(req.params.id, req.body);
  res.json({ success: true });
};

exports.remove = async (req, res) => {
  await Activity.remove(req.params.id);
  res.json({ success: true });
}; 