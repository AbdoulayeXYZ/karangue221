/**
 * Custom hook for WebSocket connectivity for real-time Teltonika GPS data
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import websocketService from '../services/websocket';

/**
 * Custom hook for WebSocket connection to Teltonika GPS data
 * @param {Object} options - Options for the hook
 * @param {boolean} options.autoConnect - Whether to connect automatically
 * @param {Array<string>} options.channels - Channels to subscribe to
 * @returns {Object} - WebSocket state and methods
 */
const useTeltonika = (options = {}) => {
  const { 
    autoConnect = true,
    channels = ['vehicles', 'telemetry']
  } = options;
  
  // Connection state
  const [connectionState, setConnectionState] = useState('disconnected');
  const [error, setError] = useState(null);
  const [reconnectAttempt, setReconnectAttempt] = useState(0);
  
  // Data state
  const [fleetData, setFleetData] = useState({
    vehicles: [],
    drivers: [],
    incidents: [],
    violations: [],
    telemetry: []
  });
  
  const [lastUpdate, setLastUpdate] = useState(null);
  
  // Track if mounted to prevent updates after unmount
  const [isMounted, setIsMounted] = useState(true);
  
  // Connect to WebSocket
  const connect = useCallback(async () => {
    setConnectionState('connecting');
    setError(null);
    
    try {
      await websocketService.connect();
      if (isMounted) {
        setConnectionState('connected');
      }
    } catch (err) {
      if (isMounted) {
        setConnectionState('error');
        setError(err.message || 'Failed to connect');
      }
    }
  }, [isMounted]);
  
  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    websocketService.disconnect();
    if (isMounted) {
      setConnectionState('disconnected');
    }
  }, [isMounted]);
  
  // Subscribe to channels
  const subscribe = useCallback((newChannels) => {
    websocketService.subscribe(newChannels);
  }, []);
  
  // Request data refresh
  const refreshData = useCallback(() => {
    if (websocketService.isConnected()) {
      websocketService.send({ action: 'get_initial_data' });
    }
  }, []);
  
  // Setup event listeners when component mounts
  useEffect(() => {
    setIsMounted(true);
    
    // Connect handlers
    const handleConnected = () => {
      if (isMounted) {
        setConnectionState('connected');
        setError(null);
        
        // Subscribe to channels
        if (channels.length > 0) {
          websocketService.subscribe(channels);
        }
      }
    };
    
    // Disconnect handlers
    const handleDisconnected = () => {
      if (isMounted) {
        setConnectionState('disconnected');
      }
    };
    
    // Error handler
    const handleError = (err) => {
      if (isMounted) {
        setError(err.message || 'WebSocket error');
      }
    };
    
    // Reconnecting handler
    const handleReconnecting = (attempt) => {
      if (isMounted) {
        setConnectionState('reconnecting');
        setReconnectAttempt(attempt);
      }
    };
    
    // Data handler
    const handleFleetData = (data) => {
      if (isMounted) {
        setFleetData(prevData => ({
          vehicles: data.vehicles || prevData.vehicles,
          drivers: data.drivers || prevData.drivers,
          incidents: data.incidents || prevData.incidents,
          violations: data.violations || prevData.violations,
          telemetry: data.telemetry || prevData.telemetry
        }));
        setLastUpdate(new Date());
      }
    };
    
    // Register event listeners
    websocketService.on('connected', handleConnected);
    websocketService.on('disconnected', handleDisconnected);
    websocketService.on('error', handleError);
    websocketService.on('reconnecting', handleReconnecting);
    websocketService.on('fleet_data', handleFleetData);
    
    // Auto-connect if specified
    if (autoConnect) {
      connect();
    }
    
    // Cleanup on unmount
    return () => {
      setIsMounted(false);
      
      // Remove event listeners
      websocketService.events.removeListener('connected', handleConnected);
      websocketService.events.removeListener('disconnected', handleDisconnected);
      websocketService.events.removeListener('error', handleError);
      websocketService.events.removeListener('reconnecting', handleReconnecting);
      websocketService.events.removeListener('fleet_data', handleFleetData);
    };
  }, [autoConnect, channels, connect, isMounted]);
  
  // Derived state
  const isConnected = useMemo(() => 
    connectionState === 'connected', [connectionState]);
  
  const isConnecting = useMemo(() => 
    connectionState === 'connecting' || connectionState === 'reconnecting', 
    [connectionState]);
  
  // Return hook state and methods
  return {
    // Connection state
    connectionState,
    isConnected,
    isConnecting,
    error,
    reconnectAttempt,
    
    // Data
    fleetData,
    vehicles: fleetData.vehicles,
    drivers: fleetData.drivers,
    incidents: fleetData.incidents,
    violations: fleetData.violations,
    telemetry: fleetData.telemetry,
    lastUpdate,
    
    // Methods
    connect,
    disconnect,
    subscribe,
    refreshData,
    
    // Low-level access
    websocketService
  };
};

export default useTeltonika;
