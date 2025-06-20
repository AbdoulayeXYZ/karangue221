const db = require('../config/db');

exports.getAll = async () => {
  const [rows] = await db.query('SELECT * FROM activities');
  return rows;
};

exports.getById = async (id) => {
  const [rows] = await db.query('SELECT * FROM activities WHERE id = ?', [id]);
  return rows[0];
};

exports.create = async (activity) => {
  const [result] = await db.query('INSERT INTO activities SET ?', activity);
  return { id: result.insertId, ...activity };
};

exports.update = async (id, activity) => {
  await db.query('UPDATE activities SET ? WHERE id = ?', [activity, id]);
};

exports.remove = async (id) => {
  await db.query('DELETE FROM activities WHERE id = ?', [id]);
}; 