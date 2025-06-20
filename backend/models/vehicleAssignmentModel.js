const db = require('../config/db');

exports.getAll = async () => {
  const [rows] = await db.query('SELECT * FROM vehicle_assignments');
  return rows;
};

exports.getById = async (id) => {
  const [rows] = await db.query('SELECT * FROM vehicle_assignments WHERE id = ?', [id]);
  return rows[0];
};

exports.create = async (assignment) => {
  const [result] = await db.query('INSERT INTO vehicle_assignments SET ?', assignment);
  return { id: result.insertId, ...assignment };
};

exports.update = async (id, assignment) => {
  await db.query('UPDATE vehicle_assignments SET ? WHERE id = ?', [assignment, id]);
};

exports.remove = async (id) => {
  await db.query('DELETE FROM vehicle_assignments WHERE id = ?', [id]);
}; 