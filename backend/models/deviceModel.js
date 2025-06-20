const db = require('../config/db');

exports.getAll = async () => {
  const [rows] = await db.query('SELECT * FROM devices');
  return rows;
};

exports.getById = async (id) => {
  const [rows] = await db.query('SELECT * FROM devices WHERE id = ?', [id]);
  return rows[0];
};

exports.create = async (device) => {
  const [result] = await db.query('INSERT INTO devices SET ?', device);
  return { id: result.insertId, ...device };
};

exports.update = async (id, device) => {
  await db.query('UPDATE devices SET ? WHERE id = ?', [device, id]);
};

exports.remove = async (id) => {
  await db.query('DELETE FROM devices WHERE id = ?', [id]);
}; 