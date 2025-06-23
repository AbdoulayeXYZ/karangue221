/**
 * Dashboard API service
 * Provides functions to interact with the dashboard API endpoints
 */

import { getAuthToken } from '../auth';

const API_URL = 'http://localhost:5001/api/dashboard';

/**
 * Get authentication headers with JWT token
 * @returns {Object} Headers with Authorization if token exists
 */
function getAuthHeaders() {
  // Try to get token from different sources to help with debugging
  const localStorageToken = localStorage.getItem('authToken');
  const sessionStorageToken = sessionStorage.getItem('authToken');
  const authServiceToken = getAuthToken();
  
  // Use the token from auth service as primary, fallback to localStorage
  const token = authServiceToken || localStorageToken || sessionStorageToken;
  
  // Enhanced debugging
  if (!token) {
    console.warn('⚠️ No auth token found - dashboard API calls will likely fail');
    console.log('🔍 Auth state check:', {
      'localStorage token': !!localStorageToken,
      'sessionStorage token': !!sessionStorageToken,
      'auth service token': !!authServiceToken
    });
    
    // In development mode, offer more detailed troubleshooting
    if (process.env.NODE_ENV === 'development') {
      console.log('🧪 Development mode detected, troubleshooting authentication:');
      console.log('💡 Possible solutions:');
      console.log('  1. Ensure you are logged in before accessing dashboard');
      console.log('  2. Check browser console for auth-related errors');
      console.log('  3. Try clearing localStorage and logging in again');
      console.log('  4. Verify backend auth endpoint is working properly');
    }
  } else {
    console.log(`🔑 Dashboard API using auth token: ${token.substring(0, 10)}...`);
    console.log('🔍 Token source:', 
      token === authServiceToken ? 'auth service' : 
      token === localStorageToken ? 'localStorage' : 'sessionStorage');
  }
  
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * Get all dashboard summary data
 * @returns {Promise<Array>} Dashboard summary data for all fleets
 */
export async function getDashboardSummary() {
  console.log('📊 Fetching dashboard summary from API:', `${API_URL}/summary`);
  
  const headers = getAuthHeaders();
  console.log('🔐 Request headers:', JSON.stringify(headers));
  
  // Check if we have auth headers and warn if not
  if (!headers.Authorization) {
    console.warn('⚠️ No Authorization header present - API call will likely fail with 401');
    // In development, we might want to show this warning to the user
    if (process.env.NODE_ENV === 'development') {
      // Could dispatch an action here to show a login prompt in the UI
      console.log('🔄 Consider redirecting to login page or showing login modal');
    }
  }
  
  try {
    console.log('🚀 Sending request to dashboard API...');
    const res = await fetch(`${API_URL}/summary`, { 
      headers: headers,
      // Add credentials to include cookies if using cookie-based auth
      credentials: 'include'
    });
    
    console.log('📡 API response status:', res.status, res.statusText);
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error('❌ Error fetching dashboard summary:', errorText);
      console.error('❌ Response status:', res.status, res.statusText);
      
      // Special handling for authentication errors
      if (res.status === 401) {
        console.error('🔐 Authentication error - token may be invalid or expired');
        
        // Clear potentially invalid tokens
        if (localStorage.getItem('authToken')) {
          console.log('🧹 Clearing potentially invalid token from localStorage');
          // Uncomment to actually clear tokens:
          // localStorage.removeItem('authToken');
        }
        
        throw new Error('Session expirée. Veuillez vous reconnecter.');
      }
      
      throw new Error(`Erreur chargement données tableau de bord: ${res.status} ${res.statusText}`);
    }
    
    const data = await res.json();
    console.log('✅ Dashboard summary fetched successfully:', data);
    
    // Log data structure to help debug display issues
    if (Array.isArray(data)) {
      console.log(`📊 Dashboard data is an array with ${data.length} items`);
      if (data.length > 0) {
        console.log('📊 First item structure:', Object.keys(data[0]));
      } else {
        console.warn('⚠️ Dashboard data array is empty - this may indicate no fleets exist or refresh is needed');
      }
    } else {
      console.log('📊 Dashboard data is not an array, structure:', Object.keys(data || {}));
    }
    
    return data;
  } catch (error) {
    console.error('❌ Exception in getDashboardSummary:', error);
    // Add the original error message for better debugging
    error.originalMessage = error.message;
    error.message = `Erreur de chargement des données: ${error.message}`;
    throw error;
  }
}

/**
 * Get dashboard summary for a specific fleet
 * @param {number} fleetId - Fleet ID
 * @returns {Promise<Object>} Dashboard summary for the specified fleet
 */
export async function getFleetDashboardSummary(fleetId) {
  console.log(`📊 Fetching dashboard summary for fleet ${fleetId}`);
  
  const headers = getAuthHeaders();
  console.log('🔐 Request headers:', JSON.stringify(headers));
  
  try {
    const res = await fetch(`${API_URL}/summary/${fleetId}`, { 
      headers: headers
    });
    
    console.log('📡 API response status:', res.status, res.statusText);
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error(`❌ Error fetching dashboard summary for fleet ${fleetId}:`, errorText);
      console.error('❌ Response status:', res.status, res.statusText);
      throw new Error(`Erreur chargement données tableau de bord de la flotte: ${res.status} ${res.statusText}`);
    }
    
    const data = await res.json();
    console.log(`✅ Dashboard summary for fleet ${fleetId} fetched successfully:`, data);
    return data;
  } catch (error) {
    console.error(`❌ Exception in getFleetDashboardSummary for fleet ${fleetId}:`, error);
    throw error;
  }
}

/**
 * Force refresh of dashboard data
 * @returns {Promise<Object>} Result of the refresh operation
 */
export async function refreshDashboard() {
  console.log('🔄 Forcing dashboard refresh via API');
  
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeaders()
  };
  console.log('🔐 Request headers:', JSON.stringify(headers));
  
  try {
    const res = await fetch(`${API_URL}/refresh`, {
      method: 'POST',
      headers: headers
    });
    
    console.log('📡 API response status:', res.status, res.statusText);
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error('❌ Error refreshing dashboard:', errorText);
      console.error('❌ Response status:', res.status, res.statusText);
      throw new Error(`Erreur actualisation données tableau de bord: ${res.status} ${res.statusText}`);
    }
    
    const data = await res.json();
    console.log('✅ Dashboard refresh successful:', data);
    return data;
  } catch (error) {
    console.error('❌ Exception in refreshDashboard:', error);
    throw error;
  }
}
