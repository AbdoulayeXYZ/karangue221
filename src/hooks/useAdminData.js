import { useState, useEffect, useCallback } from 'react';
import * as adminApi from '../services/api/admin';

/**
 * Hook personnalisé pour gérer les données d'administration
 */
export const useAdminData = (options = {}) => {
  const {
    autoRefresh = false,
    refreshInterval = 30000, // 30 secondes par défaut
    initialLoad = true
  } = options;

  const [data, setData] = useState({
    dashboard: null,
    stats: null,
    activity: [],
    performance: null,
    users: [],
    logs: [],
    health: null
  });

  const [loading, setLoading] = useState({
    dashboard: false,
    stats: false,
    activity: false,
    performance: false,
    users: false,
    logs: false,
    health: false
  });

  const [errors, setErrors] = useState({});
  const [lastUpdated, setLastUpdated] = useState(null);

  // Fonction utilitaire pour mettre à jour le state de loading
  const setLoadingState = useCallback((key, isLoading) => {
    setLoading(prev => ({ ...prev, [key]: isLoading }));
  }, []);

  // Fonction utilitaire pour mettre à jour les erreurs
  const setError = useCallback((key, error) => {
    setErrors(prev => ({ ...prev, [key]: error }));
  }, []);

  // Récupérer le tableau de bord complet
  const loadDashboard = useCallback(async () => {
    setLoadingState('dashboard', true);
    setError('dashboard', null);
    try {
      const response = await adminApi.getDashboard();
      if (response.success) {
        setData(prev => ({ ...prev, dashboard: response.data }));
        setLastUpdated(new Date());
      }
    } catch (error) {
      setError('dashboard', error);
      console.error('Erreur lors du chargement du tableau de bord:', error);
    } finally {
      setLoadingState('dashboard', false);
    }
  }, [setLoadingState, setError]);

  // Récupérer les statistiques système
  const loadStats = useCallback(async () => {
    setLoadingState('stats', true);
    setError('stats', null);
    try {
      const response = await adminApi.getSystemStats();
      if (response.success) {
        setData(prev => ({ ...prev, stats: response.data }));
      }
    } catch (error) {
      setError('stats', error);
      console.error('Erreur lors du chargement des statistiques:', error);
    } finally {
      setLoadingState('stats', false);
    }
  }, [setLoadingState, setError]);

  // Récupérer l'activité système
  const loadActivity = useCallback(async (limit = 50) => {
    setLoadingState('activity', true);
    setError('activity', null);
    try {
      const response = await adminApi.getSystemActivity(limit);
      if (response.success) {
        setData(prev => ({ ...prev, activity: response.data }));
      }
    } catch (error) {
      setError('activity', error);
      console.error('Erreur lors du chargement de l\'activité:', error);
    } finally {
      setLoadingState('activity', false);
    }
  }, [setLoadingState, setError]);

  // Récupérer les métriques de performance
  const loadPerformance = useCallback(async () => {
    setLoadingState('performance', true);
    setError('performance', null);
    try {
      const response = await adminApi.getPerformanceMetrics();
      if (response.success) {
        setData(prev => ({ ...prev, performance: response.data }));
      }
    } catch (error) {
      setError('performance', error);
      console.error('Erreur lors du chargement des métriques:', error);
    } finally {
      setLoadingState('performance', false);
    }
  }, [setLoadingState, setError]);

  // Récupérer tous les utilisateurs
  const loadUsers = useCallback(async (filters = {}) => {
    setLoadingState('users', true);
    setError('users', null);
    try {
      const response = await adminApi.getAllUsers(filters);
      if (response.success) {
        setData(prev => ({ ...prev, users: response.data }));
      }
    } catch (error) {
      setError('users', error);
      console.error('Erreur lors du chargement des utilisateurs:', error);
    } finally {
      setLoadingState('users', false);
    }
  }, [setLoadingState, setError]);

  // Récupérer les logs système
  const loadLogs = useCallback(async () => {
    setLoadingState('logs', true);
    setError('logs', null);
    try {
      const response = await adminApi.getSystemLogs();
      if (response.success) {
        setData(prev => ({ ...prev, logs: response.data }));
      }
    } catch (error) {
      setError('logs', error);
      console.error('Erreur lors du chargement des logs:', error);
    } finally {
      setLoadingState('logs', false);
    }
  }, [setLoadingState, setError]);

  // Vérifier l'état de santé du système
  const loadHealth = useCallback(async () => {
    setLoadingState('health', true);
    setError('health', null);
    try {
      const response = await adminApi.getSystemHealth();
      if (response.success) {
        setData(prev => ({ ...prev, health: response.data }));
      }
    } catch (error) {
      setError('health', error);
      console.error('Erreur lors de la vérification de l\'état:', error);
    } finally {
      setLoadingState('health', false);
    }
  }, [setLoadingState, setError]);

  // Rafraîchir toutes les données
  const refreshAll = useCallback(async () => {
    console.log('🔄 Rafraîchissement de toutes les données admin');
    await Promise.all([
      loadDashboard(),
      loadStats(),
      loadActivity(),
      loadPerformance(),
      loadHealth()
    ]);
  }, [loadDashboard, loadStats, loadActivity, loadPerformance, loadHealth]);

  // Gestion des utilisateurs
  const createUser = useCallback(async (userData) => {
    try {
      const response = await adminApi.createUser(userData);
      if (response.success) {
        // Recharger la liste des utilisateurs après création
        await loadUsers();
        return response;
      }
    } catch (error) {
      console.error('Erreur lors de la création de l\'utilisateur:', error);
      throw error;
    }
  }, [loadUsers]);

  const updateUser = useCallback(async (userId, updates) => {
    try {
      const response = await adminApi.updateUser(userId, updates);
      if (response.success) {
        // Recharger la liste des utilisateurs après mise à jour
        await loadUsers();
        return response;
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
      throw error;
    }
  }, [loadUsers]);

  const deleteUser = useCallback(async (userId) => {
    try {
      const response = await adminApi.deleteUser(userId);
      if (response.success) {
        // Recharger la liste des utilisateurs après suppression
        await loadUsers();
        return response;
      }
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'utilisateur:', error);
      throw error;
    }
  }, [loadUsers]);

  // Chargement initial
  useEffect(() => {
    if (initialLoad) {
      refreshAll();
    }
  }, [initialLoad, refreshAll]);

  // Auto-refresh
  useEffect(() => {
    if (autoRefresh && refreshInterval > 0) {
      const interval = setInterval(() => {
        console.log('🔄 Auto-refresh des données admin');
        refreshAll();
      }, refreshInterval);

      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval, refreshAll]);

  return {
    // Données
    data,
    loading,
    errors,
    lastUpdated,

    // Fonctions de chargement individuel
    loadDashboard,
    loadStats,
    loadActivity,
    loadPerformance,
    loadUsers,
    loadLogs,
    loadHealth,

    // Fonction de rafraîchissement global
    refreshAll,

    // Gestion des utilisateurs
    createUser,
    updateUser,
    deleteUser,

    // État global
    isLoading: Object.values(loading).some(l => l),
    hasErrors: Object.keys(errors).length > 0
  };
};

export default useAdminData;
