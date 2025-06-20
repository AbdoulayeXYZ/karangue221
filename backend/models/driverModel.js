const db = require('../config/db');

exports.getAll = async () => {
  const [rows] = await db.query('SELECT * FROM drivers');
  return rows;
};

exports.getById = async (id) => {
  const [rows] = await db.query('SELECT * FROM drivers WHERE id = ?', [id]);
  return rows[0];
};

exports.create = async (driver) => {
  const [result] = await db.query('INSERT INTO drivers SET ?', driver);
  return { id: result.insertId, ...driver };
};

exports.update = async (id, driver) => {
  await db.query('UPDATE drivers SET ? WHERE id = ?', [driver, id]);
};

exports.remove = async (id) => {
  await db.query('DELETE FROM drivers WHERE id = ?', [id]);
}; 