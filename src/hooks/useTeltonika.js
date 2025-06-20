import { useState, useEffect, useCallback, useRef } from 'react';
import teltonikaService from '../services/teltonika/TeltonikaService';

/**
 * Custom hook for using the Teltonika WebSocket service
 * 
 * This hook provides an interface to the Teltonika service for React components,
 * handling connection management, data updates, and error handling.
 * 
 * @param {Object} options - Configuration options
 * @param {string} options.token - Authentication token (required)
 * @param {string} options.baseUrl - WebSocket server URL (optional)
 * @param {boolean} options.autoConnect - Whether to connect automatically (default: true)
 * @param {boolean} options.autoSubscribe - Whether to subscribe to all data types automatically (default: true)
 * @param {Array} options.vehicleIds - Array of vehicle IDs to subscribe to (optional)
 * @returns {Object} Teltonika hook interface
 */
const useTeltonika = (options = {}) => {
  const {
    token,
    baseUrl,
    autoConnect = true,
    autoSubscribe = true,
    vehicleIds = []
  } = options;

  // State for connection status
  const [connectionState, setConnectionState] = useState({
    connected: false,
    connecting: false,
    error: null,
    reconnecting: false,
    reconnectAttempt: 0
  });

  // State for vehicle data
  const [vehicles, setVehicles] = useState([]);
  const [telemetryData, setTelemetryData] = useState({});
  const [events, setEvents] = useState([]);
  const [lastUpdate, setLastUpdate] = useState(null);
  
  // Track mounted status to avoid state updates after unmount
  const isMounted = useRef(true);
  
  // Track active subscriptions
  const activeSubscriptions = useRef(new Set());

  /**
   * Initialize the connection to the Teltonika service
   */
  const connect = useCallback(async () => {
    if (!token) {
      setConnectionState(prev => ({
        ...prev,
        error: new Error('Authentication token is required')
      }));
      return;
    }

    try {
      setConnectionState(prev => ({ ...prev, connecting: true, error: null }));
      await teltonikaService.initialize(token, baseUrl);
      
      if (isMounted.current) {
        setConnectionState(prev => ({ 
          ...prev, 
          connected: true, 
          connecting: false,
          reconnecting: false,
          reconnectAttempt: 0
        }));
      }
    } catch (error) {
      if (isMounted.current) {
        setConnectionState(prev => ({ 
          ...prev, 
          connected: false, 
          connecting: false, 
          error 
        }));
      }
    }
  }, [token, baseUrl]);

  /**
   * Disconnect from the Teltonika service
   */
  const disconnect = useCallback(() => {
    teltonikaService.disconnect();
    
    if (isMounted.current) {
      setConnectionState(prev => ({
        ...prev,
        connected: false,
        connecting: false,
        reconnecting: false
      }));
      
      // Clear active subscriptions
      activeSubscriptions.current.clear();
    }
  }, []);

  /**
   * Subscribe to a specific data type for vehicles
   * @param {string} type - Subscription type ('location', 'telemetry', 'events', 'all')
   * @param {Array} ids - Array of vehicle IDs to subscribe to (optional)
   * @returns {boolean} Success status
   */
  const subscribe = useCallback((type, ids = vehicleIds) => {
    if (!connectionState.connected) {
      console.warn('Cannot subscribe: not connected to Teltonika service');
      return false;
    }
    
    const result = teltonikaService.subscribe(type, ids);
    
    if (result) {
      activeSubscriptions.current.add(type.toLowerCase());
    }
    
    return result;
  }, [connectionState.connected, vehicleIds]);

  /**
   * Unsubscribe from a specific data type for vehicles
   * @param {string} type - Subscription type ('location', 'telemetry', 'events', 'all')
   * @param {Array} ids - Array of vehicle IDs to unsubscribe from (optional)
   * @returns {boolean} Success status
   */
  const unsubscribe = useCallback((type, ids = vehicleIds) => {
    if (!connectionState.connected) {
      return false;
    }
    
    const result = teltonikaService.unsubscribe(type, ids);
    
    if (result) {
      activeSubscriptions.current.delete(type.toLowerCase());
    }
    
    return result;
  }, [connectionState.connected, vehicleIds]);

  /**
   * Get the latest telemetry data for a specific vehicle
   * @param {string} vehicleId - Vehicle ID
   * @returns {Object|null} Vehicle telemetry data or null if not available
   */
  const getVehicleTelemetry = useCallback((vehicleId) => {
    return teltonikaService.getVehicleTelemetry(vehicleId);
  }, []);

  /**
   * Update local state with the latest vehicles data
   */
  const updateVehiclesData = useCallback(() => {
    const allTelemetry = teltonikaService.getAllVehiclesTelemetry();
    
    if (isMounted.current) {
      setVehicles(allTelemetry);
      
      // Create a map of vehicle ID to telemetry data
      const telemetryMap = {};
      allTelemetry.forEach(vehicle => {
        telemetryMap[vehicle.id] = vehicle;
      });
      
      setTelemetryData(telemetryMap);
      setLastUpdate(new Date());
    }
  }, []);

  // Set up event listeners for the Teltonika service
  useEffect(() => {
    // Connected event
    const handleConnected = () => {
      if (isMounted.current) {
        setConnectionState(prev => ({ 
          ...prev, 
          connected: true, 
          connecting: false,
          reconnecting: false,
          reconnectAttempt: 0
        }));
        
        // Auto-subscribe if enabled
        if (autoSubscribe) {
          teltonikaService.subscribe('ALL', vehicleIds);
          activeSubscriptions.current.add('all');
        }
      }
    };
    
    // Disconnected event
    const handleDisconnected = () => {
      if (isMounted.current) {
        setConnectionState(prev => ({ 
          ...prev, 
          connected: false, 
          connecting: false 
        }));
      }
    };
    
    // Reconnecting event
    const handleReconnecting = (attempt) => {
      if (isMounted.current) {
        setConnectionState(prev => ({ 
          ...prev, 
          reconnecting: true,
          reconnectAttempt: attempt
        }));
      }
    };
    
    // Error event
    const handleError = (error) => {
      if (isMounted.current) {
        setConnectionState(prev => ({ ...prev, error }));
      }
    };
    
    // Location update event
    const handleLocationUpdate = () => {
      updateVehiclesData();
    };
    
    // Telemetry update event
    const handleTelemetryUpdate = () => {
      updateVehiclesData();
    };
    
    // Vehicle event
    const handleVehicleEvent = (event) => {
      if (isMounted.current) {
        // Add the new event to the existing events list
        setEvents(prevEvents => {
          const newEvents = [...prevEvents, { ...event, timestamp: new Date() }];
          
          // Sort by timestamp, newest first
          newEvents.sort((a, b) => b.timestamp - a.timestamp);
          
          // Keep only the latest 100 events to prevent memory issues
          return newEvents.slice(0, 100);
        });
        
        // Update vehicles data as well since an event might affect status
        updateVehiclesData();
      }
    };
    
    // Register event listeners
    teltonikaService.on('connected', handleConnected);
    teltonikaService.on('disconnected', handleDisconnected);
    teltonikaService.on('reconnecting', handleReconnecting);
    teltonikaService.on('error', handleError);
    teltonikaService.on('auth_error', handleError);
    teltonikaService.on('server_error', handleError);
    teltonikaService.on('location_update', handleLocationUpdate);
    teltonikaService.on('telemetry_update', handleTelemetryUpdate);
    teltonikaService.on('vehicle_event', handleVehicleEvent);
    
    // Automatically connect if autoConnect is true
    if (autoConnect && token) {
      connect();
    }
    
    // Cleanup function to remove event listeners
    return () => {
      isMounted.current = false;
      
      teltonikaService.off('connected', handleConnected);
      teltonikaService.off('disconnected', handleDisconnected);
      teltonikaService.off('reconnecting', handleReconnecting);
      teltonikaService.off('error', handleError);
      teltonikaService.off('auth_error', handleError);
      teltonikaService.off('server_error', handleError);
      teltonikaService.off('location_update', handleLocationUpdate);
      teltonikaService.off('telemetry_update', handleTelemetryUpdate);
      teltonikaService.off('vehicle_event', handleVehicleEvent);
    };
  }, [connect, autoConnect, autoSubscribe, token, vehicleIds, updateVehiclesData]);

  return {
    // Connection state and controls
    connectionState,
    connect,
    disconnect,
    isConnected: connectionState.connected,
    isConnecting: connectionState.connecting,
    isReconnecting: connectionState.reconnecting,
    reconnectAttempt: connectionState.reconnectAttempt,
    error: connectionState.error,
    
    // Data access
    vehicles,
    telemetryData,
    events,
    lastUpdate,
    getVehicleTelemetry,
    
    // Subscription controls
    subscribe,
    unsubscribe,
    activeSubscriptions: Array.from(activeSubscriptions.current),
    
    // Refresh data manually if needed
    refreshData: updateVehiclesData
  };
};

export default useTeltonika;