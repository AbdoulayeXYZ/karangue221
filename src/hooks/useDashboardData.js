import { useState, useEffect, useCallback, useRef } from 'react';
import * as dashboardApi from '../services/api/dashboard';

// Refresh interval in milliseconds (increased from 5 to 15 seconds to reduce load)
const REFRESH_INTERVAL = 15000;

// Minimum time between refresh attempts (to prevent flooding)
const MIN_REFRESH_DELAY = 5000;

// Maximum number of retries on error
const MAX_RETRIES = 3;

// Delay between retry attempts (exponential backoff)
const RETRY_DELAY = 3000;

/**
 * Hook for fetching and managing dashboard summary data
 * @param {Object} options - Configuration options
 * @param {boolean} options.autoRefresh - Whether to auto-refresh data
 * @param {number} options.refreshInterval - Refresh interval in milliseconds
 * @returns {Object} Dashboard data, loading state, and refresh function
 */
export default function useDashboardData({ 
  autoRefresh = true, 
  refreshInterval = REFRESH_INTERVAL 
} = {}) {
  const [dashboardData, setDashboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [refreshCount, setRefreshCount] = useState(0);
  const [retryCount, setRetryCount] = useState(0);
  const [lastRefreshAttempt, setLastRefreshAttempt] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // --- Stable refs for functions ---
  const fetchDashboardDataRef = useRef();
  const refreshDashboardRef = useRef();

  /**
   * Fetch dashboard summary data
   */
  const fetchDashboardData = useCallback(async (force = false) => {
    // Prevent rapid successive calls unless forced
    const now = Date.now();
    if (!force && isRefreshing) {
      console.log('🔄 Refresh already in progress, skipping this request');
      return;
    }
    
    // Enforce minimum delay between refreshes unless forced
    if (!force && now - lastRefreshAttempt < MIN_REFRESH_DELAY) {
      console.log(`⏱️ Too soon for another refresh (${((now - lastRefreshAttempt) / 1000).toFixed(1)}s < ${MIN_REFRESH_DELAY / 1000}s), skipping`);
      return;
    }
    
    setLastRefreshAttempt(now);
    setIsRefreshing(true);
    
    try {
      if (!loading) setLoading(true);
      
      // Check if we have a token - log it for debugging (exclude in production)
      const token = localStorage.getItem('authToken');
      console.log(`🔑 Auth token available: ${!!token} (${token ? token.substring(0, 10) + '...' : 'none'})`);
      
      if (!token) {
        console.warn('⚠️ No auth token found before API call - this may cause authentication failure');
        console.warn('⚠️ Check if user is properly logged in and token is stored correctly');
        
        // Add additional debug logging for auth state
        const authTokenInSession = !!sessionStorage.getItem('authToken');
        console.log(`🔐 Auth state check:
          - localStorage token: ${!!token}
          - sessionStorage token: ${authTokenInSession}
          - User appears logged in: ${!!token || authTokenInSession}
        `);
      }
      
      console.log('📊 Fetching dashboard data from API endpoint...');
      const data = await dashboardApi.getDashboardSummary();
      
      // Add additional logging to understand data format and structure
      console.log('📊 Raw dashboard data received:', data);
      console.log('📊 Dashboard data type:', typeof data);
      
      if (data && Array.isArray(data)) {
        console.log(`📊 Got ${data.length} fleet(s) data:`, 
          data.map(d => `${d.fleet_name}: ${d.total_vehicles} vehicles (${d.active_vehicles} active)`).join(', '));
        
        // Log individual fleet data structure for debugging display issues
        if (data.length > 0) {
          console.log('📊 Fleet data structure example:', JSON.stringify(data[0], null, 2));
        }
        
        setDashboardData(data);
        setLastUpdated(new Date());
        console.log('✅ Dashboard data updated in state at', new Date().toLocaleTimeString());
      } else if (data && typeof data === 'object') {
        // Handle case where data is an object but not an array
        console.log('📊 Data is an object, not an array. Converting to array format.');
        const formattedData = [data]; // Wrap in array for consistent handling
        setDashboardData(formattedData);
        setLastUpdated(new Date());
        console.log('✅ Dashboard data (converted from object) updated in state at', new Date().toLocaleTimeString());
      } else {
        console.warn('⚠️ Dashboard data is not in expected format:', data);
        console.warn('⚠️ Setting empty dashboard data');
        setDashboardData([]);
      }
      
      setError(null);
    } catch (err) {
      console.error('❌ Error fetching dashboard summary:', err);
      console.error('❌ Error details:', err.stack);
      
      // Handle auth errors specifically
      if (err.message.includes('Unauthorized') || err.message.includes('Token')) {
        console.error('🔐 Authentication error detected. Token may be invalid or expired.');
        
        // Clear token if it seems invalid and retry without it
        if (localStorage.getItem('authToken')) {
          console.log('🔄 Attempting to refresh token...');
          // In a real app, you might trigger a token refresh here
        }
      }
      
      // Handle retry logic for transient errors
      if (retryCount < MAX_RETRIES) {
        const nextRetry = retryCount + 1;
        const delay = RETRY_DELAY * Math.pow(2, retryCount);
        
        console.log(`🔄 Retry ${nextRetry}/${MAX_RETRIES} scheduled in ${delay/1000}s`);
        setRetryCount(nextRetry);
        
        setTimeout(() => {
          console.log(`🔄 Executing retry ${nextRetry}/${MAX_RETRIES}`);
          fetchDashboardData(true);
        }, delay);
      } else if (retryCount >= MAX_RETRIES) {
        console.error(`❌ Maximum retries (${MAX_RETRIES}) reached, giving up`);
        setError(err.message || 'Failed to load dashboard data after multiple attempts');
        setRetryCount(0); // Reset for next time
      } else {
        setError(err.message || 'Failed to load dashboard data');
      }
    } finally {
      setLoading(false);
      setIsRefreshing(false);
      setRefreshCount(prev => prev + 1);
      console.log('🔄 Dashboard data fetch complete (success or error)');
    }
  }, [retryCount, isRefreshing, lastRefreshAttempt, loading]);
  
  /**
   * Force refresh of dashboard data via API
   * This first forces a recalculation on the server
   */
  const refreshDashboard = useCallback(async (force = false) => {
    // Prevent rapid successive calls unless forced
    const now = Date.now();
    if (!force && isRefreshing) {
      console.log('🔄 Refresh already in progress, skipping this request');
      return false;
    }
    
    // Enforce minimum delay between refreshes unless forced
    if (!force && now - lastRefreshAttempt < MIN_REFRESH_DELAY) {
      console.log(`⏱️ Too soon for another refresh (${((now - lastRefreshAttempt) / 1000).toFixed(1)}s < ${MIN_REFRESH_DELAY / 1000}s), skipping`);
      return false;
    }
    
    setLastRefreshAttempt(now);
    setIsRefreshing(true);
    
    try {
      if (!loading) setLoading(true);
      
      // First try to force refresh on the server
      console.log('🔄 Forcing dashboard data refresh on server...');
      const result = await dashboardApi.refreshDashboard();
      
      if (result?.success && result?.data) {
        console.log('✅ Dashboard refresh successful:', result.data.length, 'items');
        setDashboardData(result.data);
        setLastUpdated(new Date());
        setRetryCount(0); // Reset retry counter on success
      } else {
        console.log('⚠️ Server refresh returned no data, fetching latest...');
        await fetchDashboardData(true);
      }
      
      setError(null);
      return true;
    } catch (err) {
      console.error('❌ Error refreshing dashboard:', err);
      
      // On error, try normal fetch as fallback, but only if we're not already retrying
      if (retryCount === 0) {
        try {
          console.log('🔄 Attempting fallback fetch...');
          await fetchDashboardData(true);
          return true;
        } catch (fallbackErr) {
          console.error('❌ Fallback fetch also failed:', fallbackErr);
          setError(fallbackErr.message || 'Failed to refresh dashboard');
          return false;
        }
      } else {
        console.log('⚠️ Not attempting fallback fetch because we are already in retry mode');
        setError(err.message || 'Failed to refresh dashboard');
        return false;
      }
    } finally {
      setLoading(false);
      setIsRefreshing(false);
      setRefreshCount(prev => prev + 1);
    }
  }, [fetchDashboardData, isRefreshing, lastRefreshAttempt, loading, retryCount]);
  
  // --- Keep refs up to date ---
  fetchDashboardDataRef.current = fetchDashboardData;
  refreshDashboardRef.current = refreshDashboard;

  // --- Main effect: only depends on config ---
  useEffect(() => {
    console.log(`📊 Dashboard data hook initializing at ${new Date().toLocaleTimeString()}`);
    // Use refs to call the latest version
    refreshDashboardRef.current(true).then(success => {
      console.log(`Initial dashboard refresh ${success ? 'succeeded' : 'failed'}`);
      if (!success) {
        fetchDashboardDataRef.current(true);
      }
    });
    let refreshTimer = null;
    if (autoRefresh && refreshInterval > 0) {
      refreshTimer = setInterval(() => {
        if (!isRefreshing) {
          fetchDashboardDataRef.current();
        }
      }, refreshInterval);
    }
    const forcedRefreshTimer = setInterval(() => {
      if (!isRefreshing) {
        refreshDashboardRef.current();
      }
    }, 180000);
    return () => {
      if (refreshTimer) clearInterval(refreshTimer);
      clearInterval(forcedRefreshTimer);
    };
  }, [autoRefresh, refreshInterval]);
  
  // Log refresh statistics when refreshCount changes
  useEffect(() => {
    if (refreshCount > 0) {
      console.log(`📊 Dashboard refresh statistics:
        - Total refreshes: ${refreshCount}
        - Last updated: ${lastUpdated ? lastUpdated.toLocaleTimeString() : 'never'}
        - Current retry count: ${retryCount}
        - Data items: ${dashboardData?.length || 0}
      `);
    }
  }, [refreshCount, lastUpdated, retryCount, dashboardData]);
  
  return {
    dashboardData,
    loading,
    error,
    lastUpdated,
    refreshDashboard,
    fetchDashboardData,
    // Additional stats for debugging
    refreshCount,
    isRefreshing
  };
}
