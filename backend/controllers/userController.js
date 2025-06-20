const User = require('../models/userModel');

exports.getAll = async (req, res) => {
  const users = await User.getAll();
  res.json(users);
};

exports.getById = async (req, res) => {
  const user = await User.getById(req.params.id);
  if (!user) return res.status(404).json({ error: 'Not found' });
  res.json(user);
};

exports.create = async (req, res) => {
  const newUser = await User.create(req.body);
  res.status(201).json(newUser);
};

exports.update = async (req, res) => {
  await User.update(req.params.id, req.body);
  res.json({ success: true });
};

exports.remove = async (req, res) => {
  await User.remove(req.params.id);
  res.json({ success: true });
}; 