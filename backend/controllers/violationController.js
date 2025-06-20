const Violation = require('../models/violationModel');

exports.getAll = async (req, res) => {
  const violations = await Violation.getAll();
  res.json(violations);
};

exports.getById = async (req, res) => {
  const violation = await Violation.getById(req.params.id);
  if (!violation) return res.status(404).json({ error: 'Not found' });
  res.json(violation);
};

exports.create = async (req, res) => {
  const newViolation = await Violation.create(req.body);
  res.status(201).json(newViolation);
};

exports.update = async (req, res) => {
  await Violation.update(req.params.id, req.body);
  res.json({ success: true });
};

exports.remove = async (req, res) => {
  await Violation.remove(req.params.id);
  res.json({ success: true });
}; 