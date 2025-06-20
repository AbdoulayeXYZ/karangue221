const db = require('../config/db');

exports.getAll = async () => {
  const [rows] = await db.query('SELECT * FROM violations');
  return rows;
};

exports.getById = async (id) => {
  const [rows] = await db.query('SELECT * FROM violations WHERE id = ?', [id]);
  return rows[0];
};

exports.create = async (violation) => {
  const [result] = await db.query('INSERT INTO violations SET ?', violation);
  return { id: result.insertId, ...violation };
};

exports.update = async (id, violation) => {
  await db.query('UPDATE violations SET ? WHERE id = ?', [violation, id]);
};

exports.remove = async (id) => {
  await db.query('DELETE FROM violations WHERE id = ?', [id]);
}; 