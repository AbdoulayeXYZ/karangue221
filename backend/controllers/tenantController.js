const db = require('../config/db');
const { clearTenantCache } = require('../middleware/tenantMiddleware');

const tenantController = {
  /**
   * Obtenir les informations du tenant courant
   */
  getCurrentTenantInfo: async (req, res) => {
    try {
      if (!req.tenant) {
        return res.status(400).json({
          error: 'Aucun tenant identifié',
          message: 'Le middleware tenant doit être configuré'
        });
      }

      // Retourner les informations du tenant sans données sensibles
      const tenantInfo = {
        id: req.tenant.id,
        name: req.tenant.name,
        subdomain: req.tenant.subdomain,
        domain: req.tenant.domain,
        status: req.tenant.status,
        plan: req.tenant.plan,
        created_at: req.tenant.created_at
      };

      res.json({
        success: true,
        tenant: tenantInfo
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des infos tenant:', error);
      res.status(500).json({
        error: 'Erreur serveur',
        message: 'Impossible de récupérer les informations du tenant'
      });
    }
  },

  /**
   * Vérifier la disponibilité d'un sous-domaine
   */
  checkSubdomainAvailability: async (req, res) => {
    try {
      const { subdomain } = req.params;

      if (!subdomain) {
        return res.status(400).json({
          error: 'Sous-domaine requis',
          message: 'Le paramètre subdomain est obligatoire'
        });
      }

      // Vérifier si le sous-domaine existe déjà
      const [existing] = await db.execute(
        'SELECT id FROM tenants WHERE subdomain = ?',
        [subdomain]
      );

      res.json({
        available: existing.length === 0,
        subdomain: subdomain
      });
    } catch (error) {
      console.error('Erreur lors de la vérification du sous-domaine:', error);
      res.status(500).json({
        error: 'Erreur serveur',
        message: 'Impossible de vérifier la disponibilité du sous-domaine'
      });
    }
  },

  /**
   * Obtenir tous les tenants (admin seulement)
   */
  getAllTenants: async (req, res) => {
    try {
      // Vérifier les permissions admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          error: 'Accès refusé',
          message: 'Seuls les administrateurs peuvent voir tous les tenants'
        });
      }

      const [tenants] = await db.execute(`
        SELECT 
          t.*,
          ts.total_users,
          ts.total_fleets,
          ts.total_vehicles,
          ts.total_drivers,
          ts.total_incidents
        FROM tenants t
        LEFT JOIN tenant_stats ts ON t.id = ts.tenant_id
        WHERE t.status != 'deleted'
        ORDER BY t.created_at DESC
      `);

      res.json({
        success: true,
        tenants: tenants
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des tenants:', error);
      res.status(500).json({
        error: 'Erreur serveur',
        message: 'Impossible de récupérer la liste des tenants'
      });
    }
  },

  /**
   * Obtenir un tenant par ID
   */
  getTenantById: async (req, res) => {
    try {
      const { id } = req.params;

      // Vérifier les permissions
      if (req.user.role !== 'admin' && req.tenant_id != id) {
        return res.status(403).json({
          error: 'Accès refusé',
          message: 'Vous ne pouvez voir que votre propre tenant'
        });
      }

      const [tenants] = await db.execute(`
        SELECT 
          t.*,
          ts.total_users,
          ts.total_fleets,
          ts.total_vehicles,
          ts.total_drivers,
          ts.total_incidents
        FROM tenants t
        LEFT JOIN tenant_stats ts ON t.id = ts.tenant_id
        WHERE t.id = ? AND t.status != 'deleted'
      `, [id]);

      if (tenants.length === 0) {
        return res.status(404).json({
          error: 'Tenant introuvable',
          message: `Aucun tenant trouvé avec l'ID ${id}`
        });
      }

      res.json({
        success: true,
        tenant: tenants[0]
      });
    } catch (error) {
      console.error('Erreur lors de la récupération du tenant:', error);
      res.status(500).json({
        error: 'Erreur serveur',
        message: 'Impossible de récupérer le tenant'
      });
    }
  },

  /**
   * Créer un nouveau tenant
   */
  createTenant: async (req, res) => {
    try {
      // Vérifier les permissions admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          error: 'Accès refusé',
          message: 'Seuls les administrateurs peuvent créer des tenants'
        });
      }

      const { name, subdomain, domain, plan, settings } = req.body;

      if (!name || !subdomain) {
        return res.status(400).json({
          error: 'Données manquantes',
          message: 'Le nom et le sous-domaine sont obligatoires'
        });
      }

      // Vérifier que le sous-domaine n'existe pas déjà
      const [existing] = await db.execute(
        'SELECT id FROM tenants WHERE subdomain = ?',
        [subdomain]
      );

      if (existing.length > 0) {
        return res.status(409).json({
          error: 'Sous-domaine déjà utilisé',
          message: `Le sous-domaine '${subdomain}' est déjà pris`
        });
      }

      // Créer le tenant
      const [result] = await db.execute(`
        INSERT INTO tenants (name, subdomain, domain, plan, settings, status)
        VALUES (?, ?, ?, ?, ?, 'active')
      `, [
        name,
        subdomain,
        domain || `${subdomain}.karangue221.com`,
        plan || 'basic',
        settings ? JSON.stringify(settings) : null
      ]);

      // Récupérer le tenant créé
      const [newTenant] = await db.execute(
        'SELECT * FROM tenants WHERE id = ?',
        [result.insertId]
      );

      // Vider le cache des tenants
      clearTenantCache();

      res.status(201).json({
        success: true,
        message: 'Tenant créé avec succès',
        tenant: newTenant[0]
      });
    } catch (error) {
      console.error('Erreur lors de la création du tenant:', error);
      res.status(500).json({
        error: 'Erreur serveur',
        message: 'Impossible de créer le tenant'
      });
    }
  },

  /**
   * Mettre à jour un tenant
   */
  updateTenant: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, subdomain, domain, plan, settings } = req.body;

      // Vérifier les permissions
      if (req.user.role !== 'admin' && req.tenant_id != id) {
        return res.status(403).json({
          error: 'Accès refusé',
          message: 'Vous ne pouvez modifier que votre propre tenant'
        });
      }

      // Vérifier si le tenant existe
      const [existing] = await db.execute(
        'SELECT * FROM tenants WHERE id = ? AND status != "deleted"',
        [id]
      );

      if (existing.length === 0) {
        return res.status(404).json({
          error: 'Tenant introuvable',
          message: `Aucun tenant trouvé avec l'ID ${id}`
        });
      }

      // Si le sous-domaine change, vérifier qu'il n'est pas déjà pris
      if (subdomain && subdomain !== existing[0].subdomain) {
        const [subdomainCheck] = await db.execute(
          'SELECT id FROM tenants WHERE subdomain = ? AND id != ?',
          [subdomain, id]
        );

        if (subdomainCheck.length > 0) {
          return res.status(409).json({
            error: 'Sous-domaine déjà utilisé',
            message: `Le sous-domaine '${subdomain}' est déjà pris`
          });
        }
      }

      // Construire la requête de mise à jour
      const updates = [];
      const values = [];

      if (name) {
        updates.push('name = ?');
        values.push(name);
      }
      if (subdomain) {
        updates.push('subdomain = ?');
        values.push(subdomain);
      }
      if (domain) {
        updates.push('domain = ?');
        values.push(domain);
      }
      if (plan) {
        updates.push('plan = ?');
        values.push(plan);
      }
      if (settings) {
        updates.push('settings = ?');
        values.push(JSON.stringify(settings));
      }

      updates.push('updated_at = CURRENT_TIMESTAMP');
      values.push(id);

      if (updates.length === 1) { // Seulement updated_at
        return res.status(400).json({
          error: 'Aucune donnée à mettre à jour',
          message: 'Veuillez fournir au moins un champ à modifier'
        });
      }

      // Exécuter la mise à jour
      await db.execute(
        `UPDATE tenants SET ${updates.join(', ')} WHERE id = ?`,
        values
      );

      // Récupérer le tenant mis à jour
      const [updatedTenant] = await db.execute(
        'SELECT * FROM tenants WHERE id = ?',
        [id]
      );

      // Vider le cache des tenants
      clearTenantCache();

      res.json({
        success: true,
        message: 'Tenant mis à jour avec succès',
        tenant: updatedTenant[0]
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour du tenant:', error);
      res.status(500).json({
        error: 'Erreur serveur',
        message: 'Impossible de mettre à jour le tenant'
      });
    }
  },

  /**
   * Supprimer un tenant (soft delete)
   */
  deleteTenant: async (req, res) => {
    try {
      const { id } = req.params;

      // Seuls les admins peuvent supprimer des tenants
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          error: 'Accès refusé',
          message: 'Seuls les administrateurs peuvent supprimer des tenants'
        });
      }

      // Ne pas permettre la suppression du tenant principal
      if (id == 1) {
        return res.status(400).json({
          error: 'Suppression interdite',
          message: 'Le tenant principal ne peut pas être supprimé'
        });
      }

      // Vérifier si le tenant existe
      const [existing] = await db.execute(
        'SELECT * FROM tenants WHERE id = ? AND status != "deleted"',
        [id]
      );

      if (existing.length === 0) {
        return res.status(404).json({
          error: 'Tenant introuvable',
          message: `Aucun tenant trouvé avec l'ID ${id}`
        });
      }

      // Soft delete du tenant
      await db.execute(
        'UPDATE tenants SET status = "deleted", updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [id]
      );

      // Vider le cache des tenants
      clearTenantCache();

      res.json({
        success: true,
        message: 'Tenant supprimé avec succès'
      });
    } catch (error) {
      console.error('Erreur lors de la suppression du tenant:', error);
      res.status(500).json({
        error: 'Erreur serveur',
        message: 'Impossible de supprimer le tenant'
      });
    }
  },

  /**
   * Activer un tenant
   */
  activateTenant: async (req, res) => {
    try {
      const { id } = req.params;

      if (req.user.role !== 'admin') {
        return res.status(403).json({
          error: 'Accès refusé',
          message: 'Seuls les administrateurs peuvent activer des tenants'
        });
      }

      await db.execute(
        'UPDATE tenants SET status = "active", updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [id]
      );

      clearTenantCache();

      res.json({
        success: true,
        message: 'Tenant activé avec succès'
      });
    } catch (error) {
      console.error('Erreur lors de l\'activation du tenant:', error);
      res.status(500).json({
        error: 'Erreur serveur',
        message: 'Impossible d\'activer le tenant'
      });
    }
  },

  /**
   * Suspendre un tenant
   */
  suspendTenant: async (req, res) => {
    try {
      const { id } = req.params;

      if (req.user.role !== 'admin') {
        return res.status(403).json({
          error: 'Accès refusé',
          message: 'Seuls les administrateurs peuvent suspendre des tenants'
        });
      }

      // Ne pas permettre la suspension du tenant principal
      if (id == 1) {
        return res.status(400).json({
          error: 'Suspension interdite',
          message: 'Le tenant principal ne peut pas être suspendu'
        });
      }

      await db.execute(
        'UPDATE tenants SET status = "suspended", updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [id]
      );

      clearTenantCache();

      res.json({
        success: true,
        message: 'Tenant suspendu avec succès'
      });
    } catch (error) {
      console.error('Erreur lors de la suspension du tenant:', error);
      res.status(500).json({
        error: 'Erreur serveur',
        message: 'Impossible de suspendre le tenant'
      });
    }
  },

  /**
   * Désactiver un tenant
   */
  deactivateTenant: async (req, res) => {
    try {
      const { id } = req.params;

      if (req.user.role !== 'admin') {
        return res.status(403).json({
          error: 'Accès refusé',
          message: 'Seuls les administrateurs peuvent désactiver des tenants'
        });
      }

      // Ne pas permettre la désactivation du tenant principal
      if (id == 1) {
        return res.status(400).json({
          error: 'Désactivation interdite',
          message: 'Le tenant principal ne peut pas être désactivé'
        });
      }

      await db.execute(
        'UPDATE tenants SET status = "inactive", updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [id]
      );

      clearTenantCache();

      res.json({
        success: true,
        message: 'Tenant désactivé avec succès'
      });
    } catch (error) {
      console.error('Erreur lors de la désactivation du tenant:', error);
      res.status(500).json({
        error: 'Erreur serveur',
        message: 'Impossible de désactiver le tenant'
      });
    }
  },

  /**
   * Obtenir les statistiques d'un tenant
   */
  getTenantStats: async (req, res) => {
    try {
      const { id } = req.params;

      // Vérifier les permissions
      if (req.user.role !== 'admin' && req.tenant_id != id) {
        return res.status(403).json({
          error: 'Accès refusé',
          message: 'Vous ne pouvez voir que vos propres statistiques'
        });
      }

      const [stats] = await db.execute(
        'SELECT * FROM tenant_stats WHERE tenant_id = ?',
        [id]
      );

      if (stats.length === 0) {
        return res.status(404).json({
          error: 'Statistiques introuvables',
          message: `Aucune statistique trouvée pour le tenant ${id}`
        });
      }

      res.json({
        success: true,
        stats: stats[0]
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      res.status(500).json({
        error: 'Erreur serveur',
        message: 'Impossible de récupérer les statistiques du tenant'
      });
    }
  },

  /**
   * Obtenir les statistiques de tous les tenants
   */
  getAllTenantsStats: async (req, res) => {
    try {
      // Seuls les admins peuvent voir toutes les statistiques
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          error: 'Accès refusé',
          message: 'Seuls les administrateurs peuvent voir toutes les statistiques'
        });
      }

      const [stats] = await db.execute(`
        SELECT * FROM tenant_stats 
        WHERE tenant_status = 'active'
        ORDER BY total_vehicles DESC
      `);

      res.json({
        success: true,
        stats: stats
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques globales:', error);
      res.status(500).json({
        error: 'Erreur serveur',
        message: 'Impossible de récupérer les statistiques globales'
      });
    }
  }
};

module.exports = tenantController;
