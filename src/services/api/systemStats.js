/**
 * System Stats API Service
 * Handles system statistics and metrics API calls
 */

const API_URL = 'http://localhost:5001/api/system-stats';

function getAuthHeaders() {
  const token = localStorage.getItem('authToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * Get system statistics
 * @returns {Promise<Object>} System statistics
 */
export const getSystemStats = async () => {
  try {
    console.log('🔄 Fetching system statistics...');
    const response = await fetch(`${API_URL}/system`, { headers: getAuthHeaders() });
    if (!response.ok) throw new Error('Failed to fetch system statistics');
    const data = await response.json();
    console.log('✅ System statistics retrieved:', data);
    return data;
  } catch (error) {
    console.error('❌ Error fetching system statistics:', error);
    throw error;
  }
};

/**
 * Get alert statistics breakdown
 * @returns {Promise<Object>} Alert statistics by type
 */
export const getAlertStats = async () => {
  try {
    console.log('🔄 Fetching alert statistics...');
    const response = await fetch(`${API_URL}/alerts`, { headers: getAuthHeaders() });
    if (!response.ok) throw new Error('Failed to fetch alert statistics');
    const data = await response.json();
    console.log('✅ Alert statistics retrieved:', data);
    return data;
  } catch (error) {
    console.error('❌ Error fetching alert statistics:', error);
    throw error;
  }
};

/**
 * Get active drivers list
 * @returns {Promise<Array>} List of active drivers
 */
export const getActiveDrivers = async () => {
  try {
    console.log('🔄 Fetching active drivers...');
    const response = await fetch(`${API_URL}/drivers`, { headers: getAuthHeaders() });
    if (!response.ok) throw new Error('Failed to fetch active drivers');
    const data = await response.json();
    console.log('✅ Active drivers retrieved:', data);
    return data;
  } catch (error) {
    console.error('❌ Error fetching active drivers:', error);
    throw error;
  }
};

/**
 * Get comprehensive filter data for dashboard
 * @returns {Promise<Object>} Filter data including system info, alerts, and drivers
 */
export const getFilterData = async () => {
  try {
    console.log('🔄 Fetching comprehensive filter data...');
    const response = await fetch(`${API_URL}/filter-data`, { headers: getAuthHeaders() });
    if (!response.ok) throw new Error('Failed to fetch filter data');
    const data = await response.json();
    console.log('✅ Filter data retrieved:', data);
    return data;
  } catch (error) {
    console.error('❌ Error fetching filter data:', error);
    throw error;
  }
};
