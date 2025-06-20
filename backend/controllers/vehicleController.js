const Vehicle = require('../models/vehicleModel');

exports.getAll = async (req, res) => {
  const vehicles = await Vehicle.getAll();
  res.json(vehicles);
};

exports.getById = async (req, res) => {
  const vehicle = await Vehicle.getById(req.params.id);
  if (!vehicle) return res.status(404).json({ error: 'Not found' });
  res.json(vehicle);
};

exports.create = async (req, res) => {
  const newVehicle = await Vehicle.create(req.body);
  res.status(201).json(newVehicle);
};

exports.update = async (req, res) => {
  await Vehicle.update(req.params.id, req.body);
  res.json({ success: true });
};

exports.remove = async (req, res) => {
  await Vehicle.remove(req.params.id);
  res.json({ success: true });
}; 