const Incident = require('../models/incidentModel');

exports.getAll = async (req, res) => {
  const incidents = await Incident.getAll();
  res.json(incidents);
};

exports.getById = async (req, res) => {
  const incident = await Incident.getById(req.params.id);
  if (!incident) return res.status(404).json({ error: 'Not found' });
  res.json(incident);
};

exports.create = async (req, res) => {
  const newIncident = await Incident.create(req.body);
  res.status(201).json(newIncident);
};

exports.update = async (req, res) => {
  await Incident.update(req.params.id, req.body);
  res.json({ success: true });
};

exports.remove = async (req, res) => {
  await Incident.remove(req.params.id);
  res.json({ success: true });
}; 