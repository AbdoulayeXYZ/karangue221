const db = require('../config/db');

exports.getAll = async () => {
  const [rows] = await db.query('SELECT * FROM notifications');
  return rows;
};

exports.getById = async (id) => {
  const [rows] = await db.query('SELECT * FROM notifications WHERE id = ?', [id]);
  return rows[0];
};

exports.create = async (notification) => {
  const [result] = await db.query('INSERT INTO notifications SET ?', notification);
  return { id: result.insertId, ...notification };
};

exports.update = async (id, notification) => {
  await db.query('UPDATE notifications SET ? WHERE id = ?', [notification, id]);
};

exports.remove = async (id) => {
  await db.query('DELETE FROM notifications WHERE id = ?', [id]);
}; 