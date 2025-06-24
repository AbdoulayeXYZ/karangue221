// Helper Multi-Tenant pour tous les modèles
const db = require('../../config/db');

/**
 * Ajoute automatiquement tenant_id à une requête SELECT
 * @param {string} baseQuery - Requête SQL de base
 * @param {number} tenantId - ID du tenant
 * @param {Array} params - Paramètres existants
 * @returns {Object} Requête et paramètres modifiés
 */
function addTenantFilter(baseQuery, tenantId, params = []) {
    if (!tenantId) {
        throw new Error('tenant_id est requis pour les requêtes multi-tenant');
    }

    // Vérifier si la requête a déjà une clause WHERE
    const hasWhere = baseQuery.toLowerCase().includes('where');
    const connector = hasWhere ? ' AND' : ' WHERE';
    
    // Ajouter le filtre tenant
    const tenantQuery = `${baseQuery}${connector} tenant_id = ?`;
    const tenantParams = [...params, tenantId];
    
    return {
        query: tenantQuery,
        params: tenantParams
    };
}

/**
 * Ajoute tenant_id à un objet de données pour INSERT/UPDATE
 * @param {Object} data - Données à insérer/modifier
 * @param {number} tenantId - ID du tenant
 * @returns {Object} Données avec tenant_id
 */
function addTenantToData(data, tenantId) {
    if (!tenantId) {
        throw new Error('tenant_id est requis');
    }
    
    return {
        ...data,
        tenant_id: tenantId
    };
}

/**
 * Exécute une requête SELECT avec filtrage tenant automatique
 * @param {string} baseQuery - Requête SQL de base
 * @param {number} tenantId - ID du tenant
 * @param {Array} params - Paramètres de la requête
 * @returns {Promise<Array>} Résultats de la requête
 */
async function executeSelectWithTenant(baseQuery, tenantId, params = []) {
    const { query, params: tenantParams } = addTenantFilter(baseQuery, tenantId, params);
    
    console.log(`[TENANT ${tenantId}] Executing query:`, query);
    console.log(`[TENANT ${tenantId}] With params:`, tenantParams);
    
    const [rows] = await db.execute(query, tenantParams);
    return rows;
}

/**
 * Exécute une requête INSERT avec tenant_id automatique
 * @param {string} tableName - Nom de la table
 * @param {Object} data - Données à insérer
 * @param {number} tenantId - ID du tenant
 * @returns {Promise<Object>} Résultat de l'insertion
 */
async function executeInsertWithTenant(tableName, data, tenantId) {
    const tenantData = addTenantToData(data, tenantId);
    
    const columns = Object.keys(tenantData).join(', ');
    const placeholders = Object.keys(tenantData).map(() => '?').join(', ');
    const values = Object.values(tenantData);
    
    const query = `INSERT INTO ${tableName} (${columns}) VALUES (${placeholders})`;
    
    console.log(`[TENANT ${tenantId}] Executing insert:`, query);
    console.log(`[TENANT ${tenantId}] With values:`, values);
    
    const [result] = await db.execute(query, values);
    return {
        id: result.insertId,
        ...tenantData
    };
}

/**
 * Exécute une requête UPDATE avec filtrage tenant automatique
 * @param {string} tableName - Nom de la table
 * @param {Object} data - Données à modifier
 * @param {number} id - ID de l'enregistrement
 * @param {number} tenantId - ID du tenant
 * @returns {Promise<boolean>} Succès de la mise à jour
 */
async function executeUpdateWithTenant(tableName, data, id, tenantId) {
    if (!id) {
        throw new Error('ID est requis pour la mise à jour');
    }
    
    const columns = Object.keys(data);
    const setClause = columns.map(col => `${col} = ?`).join(', ');
    const values = [...Object.values(data), id, tenantId];
    
    const query = `UPDATE ${tableName} SET ${setClause} WHERE id = ? AND tenant_id = ?`;
    
    console.log(`[TENANT ${tenantId}] Executing update:`, query);
    console.log(`[TENANT ${tenantId}] With values:`, values);
    
    const [result] = await db.execute(query, values);
    return result.affectedRows > 0;
}

/**
 * Exécute une requête DELETE avec filtrage tenant automatique
 * @param {string} tableName - Nom de la table
 * @param {number} id - ID de l'enregistrement
 * @param {number} tenantId - ID du tenant
 * @returns {Promise<boolean>} Succès de la suppression
 */
async function executeDeleteWithTenant(tableName, id, tenantId) {
    if (!id) {
        throw new Error('ID est requis pour la suppression');
    }
    
    const query = `DELETE FROM ${tableName} WHERE id = ? AND tenant_id = ?`;
    const params = [id, tenantId];
    
    console.log(`[TENANT ${tenantId}] Executing delete:`, query);
    console.log(`[TENANT ${tenantId}] With params:`, params);
    
    const [result] = await db.execute(query, params);
    return result.affectedRows > 0;
}

/**
 * Vérifie qu'un enregistrement appartient au tenant
 * @param {string} tableName - Nom de la table
 * @param {number} id - ID de l'enregistrement
 * @param {number} tenantId - ID du tenant
 * @returns {Promise<boolean>} True si l'enregistrement appartient au tenant
 */
async function verifyTenantOwnership(tableName, id, tenantId) {
    const query = `SELECT id FROM ${tableName} WHERE id = ? AND tenant_id = ?`;
    const [rows] = await db.execute(query, [id, tenantId]);
    return rows.length > 0;
}

/**
 * Obtient des statistiques pour un tenant
 * @param {string} tableName - Nom de la table
 * @param {number} tenantId - ID du tenant
 * @returns {Promise<Object>} Statistiques
 */
async function getTenantStats(tableName, tenantId) {
    const countQuery = `SELECT COUNT(*) as total FROM ${tableName} WHERE tenant_id = ?`;
    const [countResult] = await db.execute(countQuery, [tenantId]);
    
    const activeQuery = `SELECT COUNT(*) as active FROM ${tableName} WHERE tenant_id = ? AND status = 'active'`;
    const [activeResult] = await db.execute(activeQuery, [tenantId]);
    
    return {
        total: countResult[0].total,
        active: activeResult[0].active || 0
    };
}

/**
 * Classe de base pour les modèles multi-tenant
 */
class TenantModel {
    constructor(tableName) {
        this.tableName = tableName;
    }

    async getAll(tenantId) {
        return executeSelectWithTenant(`SELECT * FROM ${this.tableName}`, tenantId);
    }

    async getById(id, tenantId) {
        const rows = await executeSelectWithTenant(
            `SELECT * FROM ${this.tableName} WHERE id = ?`, 
            tenantId, 
            [id]
        );
        return rows.length > 0 ? rows[0] : null;
    }

    async create(data, tenantId) {
        return executeInsertWithTenant(this.tableName, data, tenantId);
    }

    async update(id, data, tenantId) {
        return executeUpdateWithTenant(this.tableName, data, id, tenantId);
    }

    async delete(id, tenantId) {
        return executeDeleteWithTenant(this.tableName, id, tenantId);
    }

    async exists(id, tenantId) {
        return verifyTenantOwnership(this.tableName, id, tenantId);
    }

    async getStats(tenantId) {
        return getTenantStats(this.tableName, tenantId);
    }
}

module.exports = {
    addTenantFilter,
    addTenantToData,
    executeSelectWithTenant,
    executeInsertWithTenant,
    executeUpdateWithTenant,
    executeDeleteWithTenant,
    verifyTenantOwnership,
    getTenantStats,
    TenantModel
};
