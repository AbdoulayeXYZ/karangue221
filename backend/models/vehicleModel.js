const db = require('../config/db');

exports.getAll = async () => {
  const [rows] = await db.query('SELECT * FROM vehicles');
  return rows;
};

exports.getById = async (id) => {
  const [rows] = await db.query('SELECT * FROM vehicles WHERE id = ?', [id]);
  return rows[0];
};

exports.create = async (vehicle) => {
  const [result] = await db.query('INSERT INTO vehicles SET ?', vehicle);
  return { id: result.insertId, ...vehicle };
};

exports.update = async (id, vehicle) => {
  await db.query('UPDATE vehicles SET ? WHERE id = ?', [vehicle, id]);
};

exports.remove = async (id) => {
  await db.query('DELETE FROM vehicles WHERE id = ?', [id]);
}; 