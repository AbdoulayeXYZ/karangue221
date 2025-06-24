// Middleware Multi-Tenant pour Karangué221

const jwt = require('jsonwebtoken');
const db = require('../config/db');

/**
 * Cache des tenants pour éviter les requêtes répétées
 */
const tenantCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Middleware d'extraction et validation du tenant
 */
const extractTenant = async (req, res, next) => {
    // PATCH: Autoriser la route de login à passer sans tenant (pour l'admin global)
    if (
      req.path === '/api/auth/login' ||
      (req.originalUrl && req.originalUrl.startsWith('/api/auth/login'))
    ) {
      return next();
    }

    try {
        let tenantIdentifier = null;
        let tenantType = null;

        // Méthode 1: Sous-domaine (ddd.karangue221.com)
        const host = req.get('host');
        if (host && host.includes('.')) {
            const subdomain = host.split('.')[0];
            if (subdomain !== 'www' && subdomain !== 'api' && subdomain !== 'localhost') {
                tenantIdentifier = subdomain;
                tenantType = 'subdomain';
            }
        }

        // Méthode 2: Header personnalisé pour l'ID
        if (!tenantIdentifier && req.headers['x-tenant-id']) {
            tenantIdentifier = req.headers['x-tenant-id'];
            tenantType = 'id';
        }

        // Méthode 3: Header personnalisé pour le sous-domaine
        if (!tenantIdentifier && req.headers['x-tenant-subdomain']) {
            tenantIdentifier = req.headers['x-tenant-subdomain'];
            tenantType = 'subdomain';
        }

        // Méthode 4: Token JWT (contient tenant_id)
        if (!tenantIdentifier && req.headers.authorization) {
            try {
                const token = req.headers.authorization.replace('Bearer ', '');
                const decoded = jwt.decode(token);
                if (decoded && decoded.tenant_id) {
                    tenantIdentifier = decoded.tenant_id.toString();
                    tenantType = 'id';
                }
            } catch (error) {
                // Token invalide, continuer avec d'autres méthodes
            }
        }

        // Méthode 5: Paramètres URL (pour développement et tests)
        if (!tenantIdentifier && req.query.tenant_id) {
            tenantIdentifier = req.query.tenant_id;
            tenantType = 'id';
        }
        if (!tenantIdentifier && req.query.tenant_subdomain) {
            tenantIdentifier = req.query.tenant_subdomain;
            tenantType = 'subdomain';
        }

        // Tenant par défaut pour le développement
        if (!tenantIdentifier && process.env.NODE_ENV === 'development') {
            tenantIdentifier = '1';
            tenantType = 'id';
        }

        if (!tenantIdentifier) {
            return res.status(400).json({
                error: 'Tenant non identifié',
                message: 'Impossible de déterminer le tenant à partir de la requête'
            });
        }

        // Résoudre le tenant à partir de l'identifiant
        const tenant = await resolveTenant(tenantIdentifier, tenantType);
        
        if (!tenant) {
            return res.status(404).json({
                error: 'Tenant introuvable',
                message: `Le tenant '${tenantIdentifier}' n'existe pas`
            });
        }

        if (tenant.status !== 'active') {
            return res.status(403).json({
                error: 'Tenant non actif',
                message: `Le tenant '${tenant.name}' est ${tenant.status}`
            });
        }

        // Ajouter les informations du tenant à la requête
        req.tenant = tenant;
        req.tenant_id = tenant.id;
        
        // Logger pour debugging
        console.log(`[TENANT] ${req.method} ${req.path} - Tenant: ${tenant.name} (ID: ${tenant.id})`);
        
        next();
    } catch (error) {
        console.error('[TENANT ERROR]', error);
        return res.status(500).json({
            error: 'Erreur extraction tenant',
            message: error.message
        });
    }
};

/**
 * Résout les informations du tenant à partir de l'identifiant
 */
async function resolveTenant(identifier, type) {
    const cacheKey = `${type}:${identifier}`;
    
    // Vérifier le cache
    const cached = tenantCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
        return cached.tenant;
    }

    // Requête base de données
    let query, params;
    
    if (type === 'id') {
        query = 'SELECT * FROM tenants WHERE id = ? AND status != ?';
        params = [identifier, 'deleted'];
    } else if (type === 'subdomain') {
        query = 'SELECT * FROM tenants WHERE subdomain = ? AND status != ?';
        params = [identifier, 'deleted'];
    } else {
        return null;
    }

    try {
        const [rows] = await db.execute(query, params);
        const tenant = rows.length > 0 ? rows[0] : null;

        // Mettre en cache
        if (tenant) {
            tenantCache.set(cacheKey, {
                tenant,
                timestamp: Date.now()
            });
        }

        return tenant;
    } catch (error) {
        console.error('Erreur lors de la résolution du tenant:', error);
        return null;
    }
}

/**
 * Middleware de validation tenant en base (optionnel - déjà fait dans extractTenant)
 */
const validateTenant = async (req, res, next) => {
    // La validation est maintenant faite dans extractTenant
    // Ce middleware est gardé pour compatibilité
    if (!req.tenant || !req.tenant_id) {
        return res.status(400).json({
            error: 'Tenant non configuré',
            message: 'Le middleware extractTenant doit être appelé en premier'
        });
    }
    
    next();
};

/**
 * Helper pour ajouter automatiquement tenant_id aux requêtes
 */
const addTenantFilter = (baseQuery, tenantId, params = []) => {
    // Ajouter WHERE tenant_id = ? ou AND tenant_id = ?
    const hasWhere = baseQuery.toLowerCase().includes('where');
    const connector = hasWhere ? ' AND' : ' WHERE';
    
    return {
        query: `${baseQuery}${connector} tenant_id = ?`,
        params: [...params, tenantId]
    };
};

/**
 * Middleware pour injecter automatiquement tenant_id dans les requêtes DB
 */
const injectTenantQueries = (req, res, next) => {
    // Wrapper pour les requêtes DB qui ajoute automatiquement tenant_id
    const originalQuery = req.db.query;
    
    req.db.tenantQuery = async (query, params = []) => {
        const { query: tenantQuery, params: tenantParams } = addTenantFilter(
            query, 
            req.tenant_id, 
            params
        );
        
        console.log(`[DB TENANT] ${tenantQuery}`, tenantParams);
        return originalQuery.call(req.db, tenantQuery, tenantParams);
    };

    next();
};

/**
 * Middleware complet multi-tenant
 */
const multiTenantMiddleware = [
    extractTenant,
    validateTenant,
    injectTenantQueries
];

/**
 * Vide le cache des tenants
 */
function clearTenantCache() {
    tenantCache.clear();
}

/**
 * Obtient les statistiques du cache
 */
function getTenantCacheStats() {
    return {
        size: tenantCache.size,
        entries: Array.from(tenantCache.keys())
    };
}

module.exports = {
    extractTenant,
    validateTenant,
    injectTenantQueries,
    multiTenantMiddleware,
    addTenantFilter,
    clearTenantCache,
    getTenantCacheStats
};
