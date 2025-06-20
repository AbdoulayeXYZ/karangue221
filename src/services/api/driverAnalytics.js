const API_URL = 'http://localhost:5001/api';
const ANALYTICS_API_URL = 'http://localhost:5001/api/analytics';

// Improved authentication handling with dev fallback and debugging
function getAuthHeaders() {
  const token = localStorage.getItem('authToken');
  
  // Debug token retrieval
  console.debug('Auth token from localStorage:', token ? 'Present' : 'Missing');
  
  // For development only - provide a fallback token
  if (!token && process.env.NODE_ENV === 'development') {
    console.warn('⚠️ Using development token - NOT FOR PRODUCTION');
    return { Authorization: 'Bearer dev_token_for_testing' };
  }
  
  // Ensure we always add Bearer prefix correctly
  if (token) {
    return { Authorization: token.startsWith('Bearer ') ? token : `Bearer ${token}` };
  }
  
  return {};
}

/**
 * Récupère les analyses complètes d'un conducteur
 * @param {number} driverId - ID du conducteur
 * @returns {Promise<Object>} - Données d'analyse
 */
export async function getDriverAnalytics(driverId) {
  try {
    console.debug(`Fetching analytics for driver ${driverId}...`);
    const headers = getAuthHeaders();
    console.debug('Using headers:', headers);
    
    const res = await fetch(`${ANALYTICS_API_URL}/drivers/${driverId}/analytics`, { 
      headers,
      credentials: 'include'
    });
    
    if (!res.ok) {
      if (res.status === 401) {
        console.error('Authentication failed. Token may be invalid or expired.');
        throw new Error('Erreur d\'authentification - veuillez vous reconnecter');
      }
      throw new Error(`HTTP Error ${res.status}: ${await res.text()}`);
    }
    
    const data = await res.json();
    console.debug('Successfully fetched driver analytics:', data);
    return data;
  } catch (error) {
    console.error('Error fetching driver analytics:', error);
    throw new Error('Erreur lors du chargement des analyses du conducteur');
  }
}

/**
 * Récupère la liste des types de violations possibles
 * @returns {Promise<Array>} - Liste des types de violations
 */
export async function getViolationTypes() {
  try {
    console.debug('Fetching violation types from API...');
    
    // Try the public endpoint first (no auth required)
    const res = await fetch(`${API_URL}/violations/types`);
    
    if (!res.ok) {
      console.warn(`Error ${res.status} from public endpoint, trying authenticated endpoint...`);
      
      // If that fails, try the authenticated endpoint
      const authRes = await fetch(`${API_URL}/violations/types`, {
        headers: getAuthHeaders()
      });
      
      if (!authRes.ok) {
        throw new Error(`HTTP Error ${authRes.status}: ${await authRes.text()}`);
      }
      
      const data = await authRes.json();
      console.debug('Successfully fetched violation types with auth:', data);
      return data;
    }
    
    const data = await res.json();
    console.debug('Successfully fetched violation types:', data);
    return data;
  } catch (error) {
    console.error('Error fetching violation types:', error);
    throw new Error('Erreur lors du chargement des types de violations');
  }
}

/**
 * Récupère les violations d'un conducteur avec filtrage par date
 * @param {number} driverId - ID du conducteur
 * @param {string} startDate - Date de début (YYYY-MM-DD)
 * @param {string} endDate - Date de fin (YYYY-MM-DD)
 * @returns {Promise<Array>} - Liste des violations filtrées
 */
export async function getDriverViolations(driverId, startDate, endDate) {
  try {
    let url = `${ANALYTICS_API_URL}/drivers/${driverId}/violations`;
    
    // Ajouter les paramètres de requête si fournis
    if (startDate || endDate) {
      const params = new URLSearchParams();
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);
      url += `?${params.toString()}`;
    }
    
    console.debug(`Fetching violations for driver ${driverId} with filters:`, { startDate, endDate });
    const headers = getAuthHeaders();
    
    const res = await fetch(url, {
      headers,
      credentials: 'include'
    });
    
    if (!res.ok) {
      if (res.status === 401) {
        console.error('Authentication failed when fetching violations');
        throw new Error('Erreur d\'authentification - veuillez vous reconnecter');
      }
      throw new Error(`HTTP Error ${res.status}: ${await res.text()}`);
    }
    
    const data = await res.json();
    console.debug(`Successfully fetched ${data.length} violations`);
    return data;
  } catch (error) {
    console.error('Error fetching driver violations:', error);
    throw new Error('Erreur lors du chargement des violations du conducteur');
  }
}

/**
 * Récupère les métriques calculées pour un conducteur
 * @param {number} driverId - ID du conducteur
 * @returns {Promise<Object>} - Métriques du conducteur
 */
export async function getDriverMetrics(driverId) {
  try {
    console.debug(`Fetching metrics for driver ${driverId}...`);
    const headers = getAuthHeaders();
    
    const res = await fetch(`${ANALYTICS_API_URL}/drivers/${driverId}/metrics`, {
      headers,
      credentials: 'include'
    });
    
    if (!res.ok) {
      if (res.status === 401) {
        console.error('Authentication failed when fetching metrics');
        throw new Error('Erreur d\'authentification - veuillez vous reconnecter');
      }
      throw new Error(`HTTP Error ${res.status}: ${await res.text()}`);
    }
    
    const data = await res.json();
    console.debug('Successfully fetched driver metrics:', data);
    return data;
  } catch (error) {
    console.error('Error fetching driver metrics:', error);
    throw new Error('Erreur lors du chargement des métriques du conducteur');
  }
}

/**
 * Génère un rapport PDF pour un conducteur
 * @param {number} driverId - ID du conducteur
 * @param {string} startDate - Date de début (YYYY-MM-DD)
 * @param {string} endDate - Date de fin (YYYY-MM-DD)
 * @returns {Promise<Blob>} - Fichier PDF en tant que Blob
 */
export async function exportPDFReport(driverId, startDate, endDate) {
  let url = `${API_URL}/drivers/${driverId}/export/pdf`;
  
  // Ajouter les paramètres de requête si fournis
  if (startDate || endDate) {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    url += `?${params.toString()}`;
  }
  
  const res = await fetch(url, {
    headers: getAuthHeaders()
  });
  
  if (!res.ok) throw new Error('Erreur lors de la génération du rapport PDF');
  return res.blob();
}

/**
 * Exporte les données d'un conducteur au format CSV
 * @param {number} driverId - ID du conducteur
 * @param {string} startDate - Date de début (YYYY-MM-DD)
 * @param {string} endDate - Date de fin (YYYY-MM-DD)
 * @returns {Promise<Blob>} - Fichier CSV en tant que Blob
 */
export async function exportCSVData(driverId, startDate, endDate) {
  let url = `${API_URL}/drivers/${driverId}/export/csv`;
  
  // Ajouter les paramètres de requête si fournis
  if (startDate || endDate) {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    url += `?${params.toString()}`;
  }
  
  const res = await fetch(url, {
    headers: getAuthHeaders()
  });
  
  if (!res.ok) throw new Error('Erreur lors de l\'export CSV');
  return res.blob();
}

/**
 * Envoie un rapport par email
 * @param {number} driverId - ID du conducteur
 * @param {string} email - Adresse email destinataire
 * @param {string} startDate - Date de début (YYYY-MM-DD)
 * @param {string} endDate - Date de fin (YYYY-MM-DD)
 * @param {string} reportType - Type de rapport ('pdf' ou 'csv')
 * @returns {Promise<Object>} - Résultat de l'envoi
 */
export async function emailReport(driverId, email, startDate, endDate, reportType = 'pdf') {
  const res = await fetch(`${API_URL}/drivers/${driverId}/export/email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify({
      email,
      start_date: startDate,
      end_date: endDate,
      report_type: reportType
    })
  });
  
  if (!res.ok) throw new Error('Erreur lors de l\'envoi du rapport par email');
  return res.json();
}
