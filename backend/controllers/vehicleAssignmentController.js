const Assignment = require('../models/vehicleAssignmentModel');

exports.getAll = async (req, res) => {
  const assignments = await Assignment.getAll();
  res.json(assignments);
};

exports.getById = async (req, res) => {
  const assignment = await Assignment.getById(req.params.id);
  if (!assignment) return res.status(404).json({ error: 'Not found' });
  res.json(assignment);
};

exports.create = async (req, res) => {
  const newAssignment = await Assignment.create(req.body);
  res.status(201).json(newAssignment);
};

exports.update = async (req, res) => {
  await Assignment.update(req.params.id, req.body);
  res.json({ success: true });
};

exports.remove = async (req, res) => {
  await Assignment.remove(req.params.id);
  res.json({ success: true });
}; 