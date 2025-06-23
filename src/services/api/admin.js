import axios from 'axios';
import { getAuthToken, clearAuth } from '../auth';

const API_BASE_URL = 'http://localhost:5001/api/admin';

// Configuration axios pour l'admin
const adminApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token d'authentification
adminApi.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs de réponse
adminApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 403) {
      console.error('Accès refusé: Privilèges administrateur requis. Déconnexion...');
      // Les privilèges sont insuffisants, le token est peut-être valide mais pour un utilisateur non-admin
      // On déconnecte l'utilisateur pour forcer une nouvelle authentification
      clearAuth();
      window.location.href = '/login?session=expired';
    } else if (error.response?.status === 401) {
      console.error('Authentification requise. Redirection vers la page de connexion...');
      // Le token est manquant ou invalide
      clearAuth();
      window.location.href = '/login?session=unauthorized';
    }
    return Promise.reject(error);
  }
);

/**
 * API Admin Dashboard
 */
export const getDashboard = async () => {
  try {
    const response = await adminApi.get('/dashboard');
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération du tableau de bord admin:', error);
    throw error;
  }
};

export const getSystemStats = async () => {
  try {
    const response = await adminApi.get('/stats');
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    throw error;
  }
};

export const getSystemActivity = async (limit = 50) => {
  try {
    const response = await adminApi.get('/activity', {
      params: { limit }
    });
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'activité:', error);
    throw error;
  }
};

export const getPerformanceMetrics = async () => {
  try {
    const response = await adminApi.get('/performance');
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des métriques:', error);
    throw error;
  }
};

export const getSystemLogs = async () => {
  try {
    const response = await adminApi.get('/logs');
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des logs:', error);
    throw error;
  }
};

export const getSystemHealth = async () => {
  try {
    const response = await adminApi.get('/health');
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la vérification de l\'état système:', error);
    throw error;
  }
};

/**
 * API Gestion des utilisateurs
 */
export const getAllUsers = async (filters = {}) => {
  try {
    const response = await adminApi.get('/users', {
      params: filters
    });
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    throw error;
  }
};

export const createUser = async (userData) => {
  try {
    const response = await adminApi.post('/users', userData);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la création de l\'utilisateur:', error);
    throw error;
  }
};

export const updateUser = async (userId, updates) => {
  try {
    const response = await adminApi.put(`/users/${userId}`, updates);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
    throw error;
  }
};

export const deleteUser = async (userId) => {
  try {
    const response = await adminApi.delete(`/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'utilisateur:', error);
    throw error;
  }
};

/**
 * API Utilitaires
 */
export const createBackup = async () => {
  try {
    const response = await adminApi.get('/backup');
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la création de la sauvegarde:', error);
    throw error;
  }
};

export const toggleMaintenanceMode = async () => {
  try {
    const response = await adminApi.post('/maintenance');
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la bascule du mode maintenance:', error);
    throw error;
  }
};

export default {
  // Dashboard
  getDashboard,
  getSystemStats,
  getSystemActivity,
  getPerformanceMetrics,
  getSystemLogs,
  getSystemHealth,
  
  // Gestion des utilisateurs
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  
  // Utilitaires
  createBackup,
  toggleMaintenanceMode
};
