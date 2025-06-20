const Driver = require('../models/driverModel');

exports.getAll = async (req, res) => {
  const drivers = await Driver.getAll();
  res.json(drivers);
};

exports.getById = async (req, res) => {
  const driver = await Driver.getById(req.params.id);
  if (!driver) return res.status(404).json({ error: 'Not found' });
  res.json(driver);
};

exports.create = async (req, res) => {
  const newDriver = await Driver.create(req.body);
  res.status(201).json(newDriver);
};

exports.update = async (req, res) => {
  await Driver.update(req.params.id, req.body);
  res.json({ success: true });
};

exports.remove = async (req, res) => {
  await Driver.remove(req.params.id);
  res.json({ success: true });
}; 