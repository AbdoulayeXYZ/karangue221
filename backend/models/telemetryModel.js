const db = require('../config/db');

exports.getAll = async () => {
  const [rows] = await db.query('SELECT * FROM telemetry');
  return rows;
};

exports.getById = async (id) => {
  const [rows] = await db.query('SELECT * FROM telemetry WHERE id = ?', [id]);
  return rows[0];
};

exports.create = async (telemetry) => {
  const [result] = await db.query('INSERT INTO telemetry SET ?', telemetry);
  return { id: result.insertId, ...telemetry };
};

exports.update = async (id, telemetry) => {
  await db.query('UPDATE telemetry SET ? WHERE id = ?', [telemetry, id]);
};

exports.remove = async (id) => {
  await db.query('DELETE FROM telemetry WHERE id = ?', [id]);
}; 