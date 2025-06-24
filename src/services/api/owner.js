import api from './api';

/**
 * Service API pour les fonctionnalités Owner
 * Toutes les requêtes sont automatiquement filtrées par la flotte de l'owner
 */

/**
 * Obtenir le tableau de bord complet de l'owner
 */
export const getDashboard = async () => {
  try {
    const response = await api.get('/owner/dashboard');
    return response.data.data;
  } catch (error) {
    console.error('Erreur lors de la récupération du dashboard owner:', error);
    throw error;
  }
};

/**
 * Obtenir les informations de la flotte
 */
export const getFleetInfo = async () => {
  try {
    const response = await api.get('/owner/fleet');
    return response.data.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des infos de flotte:', error);
    throw error;
  }
};

/**
 * Obtenir le profil de l'owner
 */
export const getProfile = async () => {
  try {
    const response = await api.get('/owner/profile');
    return response.data.data;
  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error);
    throw error;
  }
};

/**
 * Mettre à jour le profil de l'owner
 */
export const updateProfile = async (profileData) => {
  try {
    const response = await api.put('/owner/profile', profileData);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la mise à jour du profil:', error);
    throw error;
  }
};

/**
 * Obtenir les véhicules de la flotte avec filtres
 */
export const getVehicles = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    
    Object.keys(filters).forEach(key => {
      if (filters[key] && filters[key] !== 'all') {
        params.append(key, filters[key]);
      }
    });
    
    const response = await api.get(`/owner/vehicles?${params.toString()}`);
    return response.data.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des véhicules:', error);
    throw error;
  }
};

/**
 * Obtenir un véhicule spécifique
 */
export const getVehicle = async (vehicleId) => {
  try {
    const response = await api.get(`/owner/vehicles/${vehicleId}`);
    return response.data.data;
  } catch (error) {
    console.error('Erreur lors de la récupération du véhicule:', error);
    throw error;
  }
};

/**
 * Obtenir les conducteurs de la flotte avec filtres
 */
export const getDrivers = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    
    Object.keys(filters).forEach(key => {
      if (filters[key] && filters[key] !== 'all') {
        params.append(key, filters[key]);
      }
    });
    
    const response = await api.get(`/owner/drivers?${params.toString()}`);
    return response.data.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des conducteurs:', error);
    throw error;
  }
};

/**
 * Obtenir un conducteur spécifique
 */
export const getDriver = async (driverId) => {
  try {
    const response = await api.get(`/owner/drivers/${driverId}`);
    return response.data.data;
  } catch (error) {
    console.error('Erreur lors de la récupération du conducteur:', error);
    throw error;
  }
};

/**
 * Obtenir les violations de la flotte
 */
export const getViolations = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    
    Object.keys(filters).forEach(key => {
      if (filters[key] && filters[key] !== 'all') {
        params.append(key, filters[key]);
      }
    });
    
    const response = await api.get(`/owner/violations?${params.toString()}`);
    return response.data.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des violations:', error);
    throw error;
  }
};

/**
 * Obtenir une violation spécifique
 */
export const getViolation = async (violationId) => {
  try {
    const response = await api.get(`/owner/violations/${violationId}`);
    return response.data.data;
  } catch (error) {
    console.error('Erreur lors de la récupération de la violation:', error);
    throw error;
  }
};

/**
 * Obtenir les incidents de la flotte
 */
export const getIncidents = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    
    Object.keys(filters).forEach(key => {
      if (filters[key] && filters[key] !== 'all') {
        params.append(key, filters[key]);
      }
    });
    
    const response = await api.get(`/owner/incidents?${params.toString()}`);
    return response.data.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des incidents:', error);
    throw error;
  }
};

/**
 * Obtenir un incident spécifique
 */
export const getIncident = async (incidentId) => {
  try {
    const response = await api.get(`/owner/incidents/${incidentId}`);
    return response.data.data;
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'incident:', error);
    throw error;
  }
};

/**
 * Obtenir l'activité récente de la flotte
 */
export const getActivity = async (limit = 50) => {
  try {
    const response = await api.get(`/owner/activity?limit=${limit}`);
    return response.data.data;
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'activité:', error);
    throw error;
  }
};

/**
 * Obtenir les métriques de performance de la flotte
 */
export const getPerformanceMetrics = async (timeRange = '30d') => {
  try {
    const response = await api.get(`/owner/performance?timeRange=${timeRange}`);
    return response.data.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des métriques:', error);
    throw error;
  }
};

/**
 * Obtenir les données de télémétrie de la flotte
 */
export const getTelemetry = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    
    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        params.append(key, filters[key]);
      }
    });
    
    const response = await api.get(`/owner/telemetry?${params.toString()}`);
    return response.data.data;
  } catch (error) {
    console.error('Erreur lors de la récupération de la télémétrie:', error);
    throw error;
  }
};

/**
 * Obtenir les statistiques rapides de la flotte
 */
export const getStats = async () => {
  try {
    const response = await api.get('/owner/stats');
    return response.data.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    throw error;
  }
};

/**
 * Exporter les données de la flotte (si implémenté)
 */
export const exportFleetData = async (type = 'pdf', filters = {}) => {
  try {
    const params = new URLSearchParams();
    params.append('type', type);
    
    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        params.append(key, filters[key]);
      }
    });
    
    const response = await api.get(`/owner/export?${params.toString()}`, {
      responseType: 'blob'
    });
    
    return response.data;
  } catch (error) {
    console.error('Erreur lors de l\'export:', error);
    throw error;
  }
};

/**
 * Obtenir un rapport personnalisé
 */
export const getCustomReport = async (reportConfig) => {
  try {
    const response = await api.post('/owner/reports/custom', reportConfig);
    return response.data.data;
  } catch (error) {
    console.error('Erreur lors de la génération du rapport:', error);
    throw error;
  }
};

/**
 * Vérifier les permissions de la flotte
 */
export const getPermissions = async () => {
  try {
    const response = await api.get('/owner/permissions');
    return response.data.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des permissions:', error);
    throw error;
  }
};

/**
 * Obtenir l'historique des sessions
 */
export const getSessionHistory = async () => {
  try {
    const response = await api.get('/owner/sessions');
    return response.data.data;
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'historique:', error);
    throw error;
  }
};

// Fonctions utilitaires pour la transformation des données

/**
 * Formatter les données du dashboard pour l'affichage
 */
export const formatDashboardData = (dashboardData) => {
  if (!dashboardData) return null;
  
  return {
    ...dashboardData,
    fleet: {
      ...dashboardData.fleet,
      utilizationRate: dashboardData.fleet.total_vehicles > 0 
        ? Math.round((dashboardData.fleet.active_vehicles / dashboardData.fleet.total_vehicles) * 100)
        : 0
    },
    violations: {
      ...dashboardData.violations,
      resolutionRate: dashboardData.violations.total_violations > 0
        ? Math.round((dashboardData.violations.confirmed_violations / dashboardData.violations.total_violations) * 100)
        : 0
    },
    incidents: {
      ...dashboardData.incidents,
      resolutionRate: dashboardData.incidents.total_incidents > 0
        ? Math.round((dashboardData.incidents.resolved_incidents / dashboardData.incidents.total_incidents) * 100)
        : 0
    }
  };
};

/**
 * Formatter les données de véhicules pour l'affichage
 */
export const formatVehicleData = (vehicles) => {
  if (!Array.isArray(vehicles)) return [];
  
  return vehicles.map(vehicle => ({
    ...vehicle,
    displayStatus: getVehicleStatusDisplay(vehicle.status),
    hasDriver: !!(vehicle.driver_first_name && vehicle.driver_last_name),
    driverName: vehicle.driver_first_name && vehicle.driver_last_name 
      ? `${vehicle.driver_first_name} ${vehicle.driver_last_name}`
      : 'Non assigné',
    lastUpdateFormatted: vehicle.lastUpdate 
      ? new Date(vehicle.lastUpdate).toLocaleString('fr-FR')
      : 'Jamais'
  }));
};

/**
 * Obtenir l'affichage du statut d'un véhicule
 */
export const getVehicleStatusDisplay = (status) => {
  const statusMap = {
    'active': { label: 'Actif', color: 'success' },
    'inactive': { label: 'Inactif', color: 'error' },
    'maintenance': { label: 'Maintenance', color: 'warning' }
  };
  
  return statusMap[status] || { label: status, color: 'default' };
};

/**
 * Formatter les données de conducteurs pour l'affichage
 */
export const formatDriverData = (drivers) => {
  if (!Array.isArray(drivers)) return [];
  
  return drivers.map(driver => ({
    ...driver,
    fullName: `${driver.first_name} ${driver.last_name}`,
    displayStatus: getDriverStatusDisplay(driver.status),
    hasVehicle: !!driver.assigned_vehicle,
    vehicleInfo: driver.assigned_vehicle 
      ? `${driver.assigned_vehicle} (${driver.vehicle_brand} ${driver.vehicle_model})`
      : 'Aucun véhicule assigné'
  }));
};

/**
 * Obtenir l'affichage du statut d'un conducteur
 */
export const getDriverStatusDisplay = (status) => {
  const statusMap = {
    'active': { label: 'Actif', color: 'success' },
    'inactive': { label: 'Inactif', color: 'error' },
    'suspended': { label: 'Suspendu', color: 'warning' }
  };
  
  return statusMap[status] || { label: status, color: 'default' };
};
