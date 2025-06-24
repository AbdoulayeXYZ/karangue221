/**
 * Authentication service for managing auth tokens with multi-tenant support
 */

import tenantService from './tenant.js';

/**
 * Get the current authentication token from localStorage
 * @returns {string|null} The auth token or null if not found
 */
export const getAuthToken = () => {
  try {
    return localStorage.getItem('authToken');
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

/**
 * Set the authentication token in localStorage
 * @param {string} token - The auth token to store
 */
export const setAuthToken = (token) => {
  try {
    if (token) {
      localStorage.setItem('authToken', token);
    } else {
      localStorage.removeItem('authToken');
    }
  } catch (error) {
    console.error('Error setting auth token:', error);
  }
};

/**
 * Remove the authentication token from localStorage
 */
export const removeAuthToken = () => {
  try {
    localStorage.removeItem('authToken');
  } catch (error) {
    console.error('Error removing auth token:', error);
  }
};

/**
 * Check if user is authenticated
 * @returns {boolean} True if user has a valid token
 */
export const isAuthenticated = () => {
  const token = getAuthToken();
  return !!token;
};

/**
 * Get user data from localStorage
 * @returns {object|null} User data or null if not found
 */
export const getUserData = () => {
  try {
    const userData = localStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error getting user data:', error);
    return null;
  }
};

/**
 * Set user data in localStorage
 * @param {object} userData - User data to store
 */
export const setUserData = (userData) => {
  try {
    if (userData) {
      localStorage.setItem('userData', JSON.stringify(userData));
    } else {
      localStorage.removeItem('userData');
    }
  } catch (error) {
    console.error('Error setting user data:', error);
  }
};

/**
 * Clear all authentication data
 */
export const clearAuth = () => {
  removeAuthToken();
  setUserData(null);
  // Effacer aussi les données tenant
  tenantService.clearTenant();
};

/**
 * Get authentication headers with multi-tenant support
 * @returns {object} Headers object with authorization and tenant info
 */
export const getAuthHeaders = () => {
  const headers = {
    'Content-Type': 'application/json'
  };

  // Ajouter le token d'authentification
  const token = getAuthToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  // Ajouter les en-têtes tenant
  const tenantHeaders = tenantService.getTenantHeaders();
  Object.assign(headers, tenantHeaders);

  return headers;
};

/**
 * Make an authenticated API request with tenant support
 * @param {string} url - The API endpoint
 * @param {object} options - Fetch options
 * @returns {Promise} Fetch promise
 */
export const apiRequest = async (url, options = {}) => {
  const config = {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers
    }
  };

  try {
    const response = await fetch(url, config);
    
    // Gérer les erreurs d'authentification
    if (response.status === 401) {
      console.warn('Token expiré, déconnexion automatique');
      clearAuth();
      // Rediriger vers la page de connexion
      window.location.href = '/login';
      throw new Error('Session expirée');
    }

    // Gérer les erreurs de tenant
    if (response.status === 400 || response.status === 404) {
      const errorData = await response.json().catch(() => ({}));
      if (errorData.error && errorData.error.includes('tenant')) {
        console.error('Erreur tenant:', errorData.message);
        throw new Error(`Erreur tenant: ${errorData.message}`);
      }
    }

    return response;
  } catch (error) {
    console.error('Erreur API:', error);
    throw error;
  }
};

/**
 * Login with tenant support
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {string} tenantId - Optional tenant ID
 * @returns {Promise} Login result
 */
export const login = async (email, password, tenantId = null) => {
  try {
    const requestBody = { email, password };
    
    // Ajouter le tenant_id si fourni
    if (tenantId) {
      requestBody.tenant_id = tenantId;
    }

    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...tenantService.getTenantHeaders()
      },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Erreur de connexion');
    }

    // Sauvegarder les données d'authentification
    setAuthToken(data.token);
    setUserData(data.user);

    // Si des informations tenant sont retournées, les sauvegarder
    if (data.tenant) {
      tenantService.setTenant('id', data.tenant.id);
    }

    console.log('✅ Connexion réussie');
    return data;
  } catch (error) {
    console.error('❌ Erreur de connexion:', error);
    throw error;
  }
};

/**
 * Logout with tenant cleanup
 */
export const logout = async () => {
  try {
    // Tenter de notifier le backend de la déconnexion
    await apiRequest('/api/auth/logout', {
      method: 'POST'
    }).catch(() => {
      // Ignorer les erreurs de déconnexion côté serveur
      console.warn('Erreur lors de la déconnexion côté serveur (ignorée)');
    });
  } finally {
    // Toujours nettoyer les données locales
    clearAuth();
    console.log('✅ Déconnexion réussie');
  }
};

/**
 * Validate current session with tenant
 * @returns {Promise} Validation result
 */
export const validateSession = async () => {
  try {
    if (!isAuthenticated()) {
      throw new Error('Aucun token d\'authentification');
    }

    const response = await apiRequest('/api/auth/validate');
    
    if (!response.ok) {
      throw new Error('Session invalide');
    }

    const data = await response.json();
    
    // Mettre à jour les données utilisateur si nécessaires
    if (data.user) {
      setUserData(data.user);
    }

    // Valider aussi le tenant
    if (tenantService.hasTenant()) {
      await tenantService.validateTenant();
    }

    return data;
  } catch (error) {
    console.error('❌ Erreur de validation de session:', error);
    clearAuth();
    throw error;
  }
};
