const db = require('../config/db');
const { executeSelectWithTenant, executeInsertWithTenant, executeUpdateWithTenant, executeDeleteWithTenant } = require('./helpers/tenantModelHelper');

// Fonctions compatibles avec l'ancien système (sans tenant)
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

// Nouvelles fonctions multi-tenant
exports.getAllByTenant = async (tenantId) => {
  return executeSelectWithTenant('SELECT * FROM drivers', tenantId);
};

exports.getByIdAndTenant = async (id, tenantId) => {
  const rows = await executeSelectWithTenant(
    'SELECT * FROM drivers WHERE id = ?', 
    tenantId, 
    [id]
  );
  return rows.length > 0 ? rows[0] : null;
};

exports.createWithTenant = async (driver, tenantId) => {
  return executeInsertWithTenant('drivers', driver, tenantId);
};

exports.updateWithTenant = async (id, driver, tenantId) => {
  return executeUpdateWithTenant('drivers', driver, id, tenantId);
};

exports.removeWithTenant = async (id, tenantId) => {
  return executeDeleteWithTenant('drivers', id, tenantId);
};

// Fonctions spécifiques aux conducteurs avec tenant
exports.getDriversByFleetAndTenant = async (fleetId, tenantId) => {
  return executeSelectWithTenant(
    'SELECT * FROM drivers WHERE fleet_id = ?', 
    tenantId, 
    [fleetId]
  );
};

exports.getActiveDriversByTenant = async (tenantId) => {
  return executeSelectWithTenant(
    "SELECT * FROM drivers WHERE status = 'active'", 
    tenantId
  );
};

exports.searchDriversByTenant = async (searchTerm, tenantId) => {
  const searchPattern = `%${searchTerm}%`;
  return executeSelectWithTenant(
    'SELECT * FROM drivers WHERE (first_name LIKE ? OR last_name LIKE ? OR phone LIKE ? OR license_number LIKE ?)', 
    tenantId,
    [searchPattern, searchPattern, searchPattern, searchPattern]
  );
};
