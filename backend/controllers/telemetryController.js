const Telemetry = require('../models/telemetryModel');

exports.getAll = async (req, res) => {
  const telemetry = await Telemetry.getAll();
  res.json(telemetry);
};

exports.getById = async (req, res) => {
  const telemetry = await Telemetry.getById(req.params.id);
  if (!telemetry) return res.status(404).json({ error: 'Not found' });
  res.json(telemetry);
};

exports.create = async (req, res) => {
  const newTelemetry = await Telemetry.create(req.body);
  res.status(201).json(newTelemetry);
};

exports.update = async (req, res) => {
  await Telemetry.update(req.params.id, req.body);
  res.json({ success: true });
};

exports.remove = async (req, res) => {
  await Telemetry.remove(req.params.id);
  res.json({ success: true });
}; 