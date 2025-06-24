import { useState, useEffect, useCallback } from 'react';
import * as ownerApi from '../services/api/owner';

/**
 * Hook personnalisé pour gérer les données de l'owner
 * Fournit toutes les données nécessaires pour l'interface owner
 */
export const useOwnerData = (options = {}) => {
  const {
    autoRefresh = false,
    refreshInterval = 30000, // 30 secondes par défaut
    initialLoad = true
  } = options;

  // États pour les différentes données
  const [data, setData] = useState({
    dashboard: null,
    vehicles: [],
    drivers: [],
    violations: [],
    incidents: [],
    activity: [],
    performance: [],
    fleet: null,
    profile: null
  });

  // États pour le chargement
  const [loading, setLoading] = useState({
    dashboard: false,
    vehicles: false,
    drivers: false,
    violations: false,
    incidents: false,
    activity: false,
    performance: false,
    fleet: false,
    profile: false
  });

  // États pour les erreurs
  const [errors, setErrors] = useState({
    dashboard: null,
    vehicles: null,
    drivers: null,
    violations: null,
    incidents: null,
    activity: null,
    performance: null,
    fleet: null,
    profile: null
  });

  const [lastUpdated, setLastUpdated] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasErrors, setHasErrors] = useState(false);

  // Fonction utilitaire pour mettre à jour un état spécifique
  const updateState = useCallback((key, newData, isError = false) => {
    if (isError) {
      setErrors(prev => ({ ...prev, [key]: newData }));
      setLoading(prev => ({ ...prev, [key]: false }));
    } else {
      setData(prev => ({ ...prev, [key]: newData }));
      setErrors(prev => ({ ...prev, [key]: null }));
      setLoading(prev => ({ ...prev, [key]: false }));
    }
    
    setLastUpdated(new Date());
    setIsLoading(false);
    
    // Vérifier s'il y a des erreurs
    const newErrors = isError 
      ? { ...errors, [key]: newData }
      : { ...errors, [key]: null };
    setHasErrors(Object.values(newErrors).some(error => error !== null));
  }, [errors]);

  // Fonction pour charger le dashboard
  const loadDashboard = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, dashboard: true }));
      setIsLoading(true);
      
      const dashboardData = await ownerApi.getDashboard();
      updateState('dashboard', dashboardData);
      
      console.log('📊 Dashboard owner chargé avec succès');
    } catch (error) {
      console.error('❌ Erreur lors du chargement du dashboard owner:', error);
      updateState('dashboard', error, true);
    }
  }, [updateState]);

  // Fonction pour charger les véhicules
  const loadVehicles = useCallback(async (filters = {}) => {
    try {
      setLoading(prev => ({ ...prev, vehicles: true }));
      setIsLoading(true);
      
      const vehiclesData = await ownerApi.getVehicles(filters);
      updateState('vehicles', vehiclesData);
      
      console.log(`🚗 ${vehiclesData.length} véhicules chargés`);
    } catch (error) {
      console.error('❌ Erreur lors du chargement des véhicules:', error);
      updateState('vehicles', error, true);
    }
  }, [updateState]);

  // Fonction pour charger les conducteurs
  const loadDrivers = useCallback(async (filters = {}) => {
    try {
      setLoading(prev => ({ ...prev, drivers: true }));
      setIsLoading(true);
      
      const driversData = await ownerApi.getDrivers(filters);
      updateState('drivers', driversData);
      
      console.log(`👨‍💼 ${driversData.length} conducteurs chargés`);
    } catch (error) {
      console.error('❌ Erreur lors du chargement des conducteurs:', error);
      updateState('drivers', error, true);
    }
  }, [updateState]);

  // Fonction pour charger les violations
  const loadViolations = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, violations: true }));
      setIsLoading(true);
      
      const violationsData = await ownerApi.getViolations();
      updateState('violations', violationsData);
      
      console.log(`⚠️ ${violationsData.length} violations chargées`);
    } catch (error) {
      console.error('❌ Erreur lors du chargement des violations:', error);
      updateState('violations', error, true);
    }
  }, [updateState]);

  // Fonction pour charger les incidents
  const loadIncidents = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, incidents: true }));
      setIsLoading(true);
      
      const incidentsData = await ownerApi.getIncidents();
      updateState('incidents', incidentsData);
      
      console.log(`🚨 ${incidentsData.length} incidents chargés`);
    } catch (error) {
      console.error('❌ Erreur lors du chargement des incidents:', error);
      updateState('incidents', error, true);
    }
  }, [updateState]);

  // Fonction pour charger l'activité
  const loadActivity = useCallback(async (limit = 50) => {
    try {
      setLoading(prev => ({ ...prev, activity: true }));
      setIsLoading(true);
      
      const activityData = await ownerApi.getActivity(limit);
      updateState('activity', activityData);
      
      console.log(`📋 ${activityData.length} activités chargées`);
    } catch (error) {
      console.error('❌ Erreur lors du chargement de l\'activité:', error);
      updateState('activity', error, true);
    }
  }, [updateState]);

  // Fonction pour charger les métriques de performance
  const loadPerformance = useCallback(async (timeRange = '30d') => {
    try {
      setLoading(prev => ({ ...prev, performance: true }));
      setIsLoading(true);
      
      const performanceData = await ownerApi.getPerformanceMetrics(timeRange);
      updateState('performance', performanceData);
      
      console.log(`⚡ Métriques de performance chargées (${timeRange})`);
    } catch (error) {
      console.error('❌ Erreur lors du chargement des métriques:', error);
      updateState('performance', error, true);
    }
  }, [updateState]);

  // Fonction pour charger les infos de la flotte
  const loadFleetInfo = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, fleet: true }));
      setIsLoading(true);
      
      const fleetData = await ownerApi.getFleetInfo();
      updateState('fleet', fleetData);
      
      console.log('🏢 Informations de la flotte chargées');
    } catch (error) {
      console.error('❌ Erreur lors du chargement des infos de flotte:', error);
      updateState('fleet', error, true);
    }
  }, [updateState]);

  // Fonction pour charger le profil
  const loadProfile = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, profile: true }));
      setIsLoading(true);
      
      const profileData = await ownerApi.getProfile();
      updateState('profile', profileData);
      
      console.log('👤 Profil owner chargé');
    } catch (error) {
      console.error('❌ Erreur lors du chargement du profil:', error);
      updateState('profile', error, true);
    }
  }, [updateState]);

  // Fonction pour mettre à jour le profil
  const updateProfile = useCallback(async (profileData) => {
    try {
      setLoading(prev => ({ ...prev, profile: true }));
      setIsLoading(true);
      
      await ownerApi.updateProfile(profileData);
      
      // Recharger le profil après mise à jour
      await loadProfile();
      
      console.log('✅ Profil mis à jour avec succès');
      return true;
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour du profil:', error);
      updateState('profile', error, true);
      return false;
    }
  }, [loadProfile, updateState]);

  // Fonction pour rafraîchir toutes les données
  const refreshAll = useCallback(async () => {
    console.log('🔄 Rafraîchissement de toutes les données owner...');
    
    await Promise.allSettled([
      loadDashboard(),
      loadFleetInfo(),
      loadActivity()
    ]);
    
    console.log('✅ Rafraîchissement terminé');
  }, [loadDashboard, loadFleetInfo, loadActivity]);

  // Fonction pour rafraîchir les données essentielles
  const refreshEssential = useCallback(async () => {
    console.log('🔄 Rafraîchissement des données essentielles...');
    
    await Promise.allSettled([
      loadDashboard(),
      loadVehicles(),
      loadDrivers()
    ]);
    
    console.log('✅ Rafraîchissement essentiel terminé');
  }, [loadDashboard, loadVehicles, loadDrivers]);

  // Chargement initial
  useEffect(() => {
    if (initialLoad) {
      refreshAll();
    }
  }, [initialLoad, refreshAll]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      console.log('🔄 Auto-refresh des données owner');
      refreshEssential();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, refreshEssential]);

  return {
    // Données
    data,
    
    // États de chargement
    loading,
    errors,
    lastUpdated,
    isLoading,
    hasErrors,
    
    // Fonctions de chargement spécifiques
    loadDashboard,
    loadVehicles,
    loadDrivers,
    loadViolations,
    loadIncidents,
    loadActivity,
    loadPerformance,
    loadFleetInfo,
    loadProfile,
    
    // Fonctions de mise à jour
    updateProfile,
    
    // Fonctions de rafraîchissement
    refreshAll,
    refreshEssential
  };
};
