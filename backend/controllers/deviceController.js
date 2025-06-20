const Device = require('../models/deviceModel');

exports.getAll = async (req, res) => {
  const devices = await Device.getAll();
  res.json(devices);
};

exports.getById = async (req, res) => {
  const device = await Device.getById(req.params.id);
  if (!device) return res.status(404).json({ error: 'Not found' });
  res.json(device);
};

exports.create = async (req, res) => {
  const newDevice = await Device.create(req.body);
  res.status(201).json(newDevice);
};

exports.update = async (req, res) => {
  await Device.update(req.params.id, req.body);
  res.json({ success: true });
};

exports.remove = async (req, res) => {
  await Device.remove(req.params.id);
  res.json({ success: true });
}; 