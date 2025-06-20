/**
 * Authentication service for managing auth tokens
 */

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
}; 