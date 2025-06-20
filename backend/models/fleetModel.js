const db = require('../config/db');

exports.getAll = async () => {
  const [rows] = await db.query('SELECT * FROM fleets');
  return rows;
};

exports.getById = async (id) => {
  const [rows] = await db.query('SELECT * FROM fleets WHERE id = ?', [id]);
  return rows[0];
};

exports.create = async (fleet) => {
  const [result] = await db.query('INSERT INTO fleets SET ?', fleet);
  return { id: result.insertId, ...fleet };
};

exports.update = async (id, fleet) => {
  await db.query('UPDATE fleets SET ? WHERE id = ?', [fleet, id]);
};

exports.remove = async (id) => {
  await db.query('DELETE FROM fleets WHERE id = ?', [id]);
}; 