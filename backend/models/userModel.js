const db = require('../config/db');

exports.getAll = async () => {
  const [rows] = await db.query('SELECT * FROM users');
  return rows;
};

exports.getById = async (id) => {
  const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
  return rows[0];
};

exports.create = async (user) => {
  const [result] = await db.query('INSERT INTO users SET ?', user);
  return { id: result.insertId, ...user };
};

exports.update = async (id, user) => {
  await db.query('UPDATE users SET ? WHERE id = ?', [user, id]);
};

exports.remove = async (id) => {
  await db.query('DELETE FROM users WHERE id = ?', [id]);
}; 