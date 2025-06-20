const db = require('../config/db');

exports.getAll = async () => {
  const [rows] = await db.query('SELECT * FROM incidents');
  return rows;
};

exports.getById = async (id) => {
  const [rows] = await db.query('SELECT * FROM incidents WHERE id = ?', [id]);
  return rows[0];
};

exports.create = async (incident) => {
  const [result] = await db.query('INSERT INTO incidents SET ?', incident);
  return { id: result.insertId, ...incident };
};

exports.update = async (id, incident) => {
  await db.query('UPDATE incidents SET ? WHERE id = ?', [incident, id]);
};

exports.remove = async (id) => {
  await db.query('DELETE FROM incidents WHERE id = ?', [id]);
}; 