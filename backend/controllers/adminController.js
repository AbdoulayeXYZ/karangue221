const AdminModel = require('../models/adminModel');
const bcrypt = require('bcrypt');

/**
 * Contrôleur pour les fonctionnalités d'administration
 */
class AdminController {
  
  /**
   * Obtenir le tableau de bord administrateur avec toutes les statistiques
   */
  static async getDashboard(req, res) {
    try {
      console.log('🏢 Récupération du tableau de bord administrateur');
      
      // Récupérer toutes les statistiques en parallèle
      const [systemStats, systemActivity, performanceMetrics] = await Promise.all([
        AdminModel.getSystemStats(),
        AdminModel.getSystemActivity(20),
        AdminModel.getPerformanceMetrics()
      ]);
      
      res.json({
        success: true,
        data: {
          statistics: systemStats,
          recent_activity: systemActivity,
          performance: performanceMetrics,
          admin_info: {
            name: req.user.name,
            email: req.user.email,
            last_login: new Date()
          }
        }
      });
    } catch (error) {
      console.error('❌ Erreur lors de la récupération du tableau de bord admin:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur lors de la récupération du tableau de bord',
        details: error.message
      });
    }
  }
  
  /**
   * Obtenir les statistiques système
   */
  static async getSystemStats(req, res) {
    try {
      console.log('📊 Récupération des statistiques système');
      
      const stats = await AdminModel.getSystemStats();
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des statistiques:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur lors de la récupération des statistiques',
        details: error.message
      });
    }
  }
  
  /**
   * Obtenir l'activité récente du système
   */
  static async getSystemActivity(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 50;
      console.log(`📋 Récupération de l'activité système (limite: ${limit})`);
      
      const activity = await AdminModel.getSystemActivity(limit);
      
      res.json({
        success: true,
        data: activity
      });
    } catch (error) {
      console.error('❌ Erreur lors de la récupération de l\'activité:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur lors de la récupération de l\'activité',
        details: error.message
      });
    }
  }
  
  /**
   * Obtenir les métriques de performance
   */
  static async getPerformanceMetrics(req, res) {
    try {
      console.log('⚡ Récupération des métriques de performance');
      
      const metrics = await AdminModel.getPerformanceMetrics();
      
      res.json({
        success: true,
        data: metrics
      });
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des métriques:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur lors de la récupération des métriques',
        details: error.message
      });
    }
  }
  
  /**
   * Gestion des utilisateurs - Obtenir tous les utilisateurs
   */
  static async getAllUsers(req, res) {
    try {
      console.log('👥 Récupération de tous les utilisateurs pour l\'admin');
      
      const filters = {
        role: req.query.role,
        status: req.query.status,
        search: req.query.search
      };
      
      const users = await AdminModel.getAllUsers(filters);
      
      res.json({
        success: true,
        data: users,
        total: users.length
      });
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des utilisateurs:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur lors de la récupération des utilisateurs',
        details: error.message
      });
    }
  }
  
  /**
   * Créer un nouvel utilisateur
   */
  static async createUser(req, res) {
    try {
      console.log('👤 Création d\'un nouvel utilisateur par l\'admin');
      
      const { name, email, password, role, phone } = req.body;
      
      // Validation des données
      if (!name || !email || !password || !role) {
        return res.status(400).json({
          success: false,
          error: 'Données manquantes',
          details: 'Nom, email, mot de passe et rôle sont requis'
        });
      }
      
      // Validation du rôle
      if (!['owner', 'admin'].includes(role)) {
        return res.status(400).json({
          success: false,
          error: 'Rôle invalide',
          details: 'Le rôle doit être "owner" ou "admin"'
        });
      }
      
      // Hash du mot de passe
      const saltRounds = 10;
      const password_hash = await bcrypt.hash(password, saltRounds);
      
      const userData = {
        name,
        email,
        password_hash,
        role,
        phone,
        status: 'active'
      };
      
      const newUser = await AdminModel.createUser(userData);
      
      // Ne pas renvoyer le hash du mot de passe
      const { password_hash: _, ...userResponse } = newUser;
      
      res.status(201).json({
        success: true,
        data: userResponse,
        message: 'Utilisateur créé avec succès'
      });
    } catch (error) {
      console.error('❌ Erreur lors de la création de l\'utilisateur:', error);
      
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({
          success: false,
          error: 'Email déjà utilisé',
          details: 'Un utilisateur avec cet email existe déjà'
        });
      }
      
      res.status(500).json({
        success: false,
        error: 'Erreur lors de la création de l\'utilisateur',
        details: error.message
      });
    }
  }
  
  /**
   * Mettre à jour un utilisateur
   */
  static async updateUser(req, res) {
    try {
      const userId = parseInt(req.params.id);
      console.log(`✏️ Mise à jour de l'utilisateur ${userId} par l'admin`);
      
      const allowedFields = ['name', 'email', 'role', 'phone', 'status'];
      const updates = {};
      
      // Filtrer les champs autorisés
      Object.keys(req.body).forEach(key => {
        if (allowedFields.includes(key) && req.body[key] !== undefined) {
          updates[key] = req.body[key];
        }
      });
      
      // Hash du nouveau mot de passe si fourni
      if (req.body.password) {
        const saltRounds = 10;
        updates.password_hash = await bcrypt.hash(req.body.password, saltRounds);
      }
      
      if (Object.keys(updates).length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Aucune donnée valide à mettre à jour'
        });
      }
      
      const success = await AdminModel.updateUser(userId, updates);
      
      if (!success) {
        return res.status(404).json({
          success: false,
          error: 'Utilisateur non trouvé'
        });
      }
      
      res.json({
        success: true,
        message: 'Utilisateur mis à jour avec succès'
      });
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour de l\'utilisateur:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur lors de la mise à jour de l\'utilisateur',
        details: error.message
      });
    }
  }
  
  /**
   * Supprimer (désactiver) un utilisateur
   */
  static async deleteUser(req, res) {
    try {
      const userId = parseInt(req.params.id);
      console.log(`🗑️ Suppression de l'utilisateur ${userId} par l'admin`);
      
      // Empêcher la suppression de son propre compte
      if (userId === req.user.id) {
        return res.status(400).json({
          success: false,
          error: 'Action interdite',
          details: 'Vous ne pouvez pas supprimer votre propre compte'
        });
      }
      
      const success = await AdminModel.deleteUser(userId);
      
      if (!success) {
        return res.status(404).json({
          success: false,
          error: 'Utilisateur non trouvé ou suppression non autorisée'
        });
      }
      
      res.json({
        success: true,
        message: 'Utilisateur désactivé avec succès'
      });
    } catch (error) {
      console.error('❌ Erreur lors de la suppression de l\'utilisateur:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur lors de la suppression de l\'utilisateur',
        details: error.message
      });
    }
  }
  
  /**
   * Obtenir l'état de santé détaillé du système
   */
  static async getSystemHealth(req, res) {
    try {
      console.log('🏥 Récupération de l\'état de santé du système');
      
      const healthData = await AdminModel.getSystemHealth();
      
      res.json({
        success: true,
        data: healthData
      });
    } catch (error) {
      console.error('❌ Erreur lors de la récupération de l\'état de santé:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur lors de la récupération de l\'état de santé',
        details: error.message
      });
    }
  }
  
  /**
   * Obtenir les logs système (pour le debugging)
   */
  static async getSystemLogs(req, res) {
    try {
      console.log('📋 Récupération des logs système');
      
      const limit = parseInt(req.query.limit) || 50;
      const logs = await AdminModel.getSystemLogs(limit);
      
      res.json({
        success: true,
        data: logs
      });
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des logs:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur lors de la récupération des logs',
        details: error.message
      });
    }
  }
}

module.exports = AdminController;
