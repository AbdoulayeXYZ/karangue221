const Fleet = require('../models/fleetModel');

exports.getAll = async (req, res) => {
  const fleets = await Fleet.getAll();
  res.json(fleets);
};

exports.getById = async (req, res) => {
  const fleet = await Fleet.getById(req.params.id);
  if (!fleet) return res.status(404).json({ error: 'Not found' });
  res.json(fleet);
};

exports.create = async (req, res) => {
  const newFleet = await Fleet.create(req.body);
  res.status(201).json(newFleet);
};

exports.update = async (req, res) => {
  await Fleet.update(req.params.id, req.body);
  res.json({ success: true });
};

exports.remove = async (req, res) => {
  await Fleet.remove(req.params.id);
  res.json({ success: true });
}; 