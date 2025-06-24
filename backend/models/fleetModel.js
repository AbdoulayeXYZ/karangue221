const db = require('../config/db');
const { executeSelectWithTenant, executeInsertWithTenant, executeUpdateWithTenant, executeDeleteWithTenant } = require('./helpers/tenantModelHelper');

// Fonctions compatibles avec l'ancien système (sans tenant)
exports.getAll = async () => {
  const [rows] = await db.query('SELECT * FROM fleets');
  return rows;
};

exports.getById = async (id) => {
  const [rows] = await db.query('SELECT * FROM fleets WHERE id = ?', [id]);
  return rows[0];
};

exports.create = async (fleet) => {
  const [result] = await db.query('INSERT INTO fleets SET ?', fleet);
  return { id: result.insertId, ...fleet };
};

exports.update = async (id, fleet) => {
  await db.query('UPDATE fleets SET ? WHERE id = ?', [fleet, id]);
};

exports.remove = async (id) => {
  await db.query('DELETE FROM fleets WHERE id = ?', [id]);
};

// Nouvelles fonctions multi-tenant
exports.getAllByTenant = async (tenantId) => {
  return executeSelectWithTenant('SELECT * FROM fleets', tenantId);
};

exports.getByIdAndTenant = async (id, tenantId) => {
  const rows = await executeSelectWithTenant(
    'SELECT * FROM fleets WHERE id = ?', 
    tenantId, 
    [id]
  );
  return rows.length > 0 ? rows[0] : null;
};

exports.createWithTenant = async (fleet, tenantId) => {
  return executeInsertWithTenant('fleets', fleet, tenantId);
};

exports.updateWithTenant = async (id, fleet, tenantId) => {
  return executeUpdateWithTenant('fleets', fleet, id, tenantId);
};

exports.removeWithTenant = async (id, tenantId) => {
  return executeDeleteWithTenant('fleets', id, tenantId);
};

// Fonctions spécifiques aux flottes avec tenant
exports.getFleetWithVehicleCountByTenant = async (tenantId) => {
  const query = `
    SELECT f.*, 
           COUNT(v.id) as vehicle_count,
           COUNT(CASE WHEN v.status = 'active' THEN 1 END) as active_vehicles
    FROM fleets f
    LEFT JOIN vehicles v ON f.id = v.fleet_id AND v.tenant_id = f.tenant_id
    GROUP BY f.id
  `;
  return executeSelectWithTenant(query, tenantId);
};

exports.getActiveFleetsByTenant = async (tenantId) => {
  return executeSelectWithTenant(
    "SELECT * FROM fleets WHERE status = 'active'", 
    tenantId
  );
};

exports.searchFleetsByTenant = async (searchTerm, tenantId) => {
  const searchPattern = `%${searchTerm}%`;
  return executeSelectWithTenant(
    'SELECT * FROM fleets WHERE (name LIKE ? OR description LIKE ?)', 
    tenantId,
    [searchPattern, searchPattern]
  );
};
