// src/hooks/useTeltonika.js

import { useState, useEffect, useCallback, useRef } from 'react';
import teltonikaManager from '../services/teltonika/TeltonikaManager';

const useTeltonika = (config = {}) => {
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [liveData, setLiveData] = useState({});
  const [error, setError] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [stats, setStats] = useState({
    connected: false,
    deviceCount: 0,
    reconnectAttempts: 0,
    subscriberCount: 0
  });
  
  const unsubscribeRef = useRef(null);
  const initializationPromise = useRef(null);

  // Initialize Teltonika service
  const initialize = useCallback(async (customConfig = {}) => {
    if (initializationPromise.current) {
      return initializationPromise.current;
    }

    initializationPromise.current = (async () => {
      try {
        setError(null);
        setConnectionStatus('connecting');
        
        await teltonikaManager.initialize({ ...config, ...customConfig });
        setIsInitialized(true);
        
        return true;
      } catch (err) {
        setError(err.message);
        setConnectionStatus('disconnected');
        setIsInitialized(false);
        throw err;
      } finally {
        initializationPromise.current = null;
      }
    })();

    return initializationPromise.current;
  }, [config]);

  // Handle Teltonika events
  const handleTeltonikaEvent = useCallback((event) => {
    const { event: eventType, data, timestamp } = event;
    
    switch (eventType) {
      case 'connected': setConnectionStatus('connected');
        setError(null);
        break;
        
      case 'disconnected': setConnectionStatus('disconnected');
        break;
        
      case 'reconnecting': setConnectionStatus('reconnecting');
        break;
        
      case 'deviceConnected':
        setDevices(prev => {
          const existing = prev.find(d => d.imei === data.imei);
          if (existing) {
            return prev.map(d => d.imei === data.imei ? { ...d, ...data } : d);
          }
          return [...prev, data];
        });
        break;
        
      case 'deviceData':
        setDevices(prev => 
          prev.map(device => 
            device.imei === data.imei ? { ...device, ...data } : device
          )
        );
        
        // Update live data for selected device
        if (selectedDevice && selectedDevice.imei === data.imei) {
          setLiveData(prev => ({ ...prev, ...data }));
        }
        break;
        
      case 'locationUpdate':
        // Handle real-time location updates
        setDevices(prev => 
          prev.map(device => {
            if (device.imei === data.deviceId) {
              return {
                ...device,
                location: {
                  lat: data.coordinates.latitude,
                  lng: data.coordinates.longitude,
                  altitude: data.coordinates.altitude,
                  address: data.address || device.location?.address
                },
                speed: data.speed,
                heading: data.heading,
                lastUpdate: data.timestamp
              };
            }
            return device;
          })
        );
        break;
        
      case 'error': setError(data.message ||'Unknown error occurred');
        break;
        
      default:
        console.log('Unhandled Teltonika event:', eventType, data);
    }

    // Update stats
    const currentStats = teltonikaManager.getStats();
    setStats(currentStats);
  }, [selectedDevice]);

  // Subscribe to Teltonika events
  useEffect(() => {
    if (isInitialized && !unsubscribeRef.current) {
      unsubscribeRef.current = teltonikaManager.subscribe(handleTeltonikaEvent);
      
      // Initial data load
      const connectedDevices = teltonikaManager.getConnectedDevices();
      setDevices(connectedDevices);
      
      const initialStats = teltonikaManager.getStats();
      setStats(initialStats);
    }
    
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [isInitialized, handleTeltonikaEvent]);

  // Auto-initialize on mount
  useEffect(() => {
    if (!isInitialized && !initializationPromise.current) {
      initialize().catch(err => {
        console.error('Failed to auto-initialize Teltonika:', err);
      });
    }
  }, [initialize, isInitialized]);

  // Send command to device
  const sendCommand = useCallback(async (imei, command) => {
    if (!isInitialized) {
      throw new Error('Teltonika service not initialized');
    }
    
    try {
      return await teltonikaManager.sendCommand(imei, command);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [isInitialized]);

  // Get device by IMEI
  const getDevice = useCallback((imei) => {
    return devices.find(device => device.imei === imei) || null;
  }, [devices]);

  // Select device for detailed monitoring
  const selectDevice = useCallback((device) => {
    setSelectedDevice(device);
    if (device) {
      setLiveData(device);
    } else {
      setLiveData({});
    }
  }, []);

  // Filter devices by status
  const getDevicesByStatus = useCallback((status) => {
    return devices.filter(device => device.status === status);
  }, [devices]);

  // Get device statistics
  const getDeviceStats = useCallback(() => {
    const statusCounts = devices.reduce((acc, device) => {
      acc[device.status] = (acc[device.status] || 0) + 1;
      return acc;
    }, {});
    
    return {
      total: devices.length,
      active: statusCounts.active || 0,
      idle: statusCounts.idle || 0,
      warning: statusCounts.warning || 0,
      offline: statusCounts.offline || 0,
      ...statusCounts
    };
  }, [devices]);

  // Disconnect from service
  const disconnect = useCallback(() => {
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }
    
    teltonikaManager.disconnect();
    setIsInitialized(false);
    setConnectionStatus('disconnected');
    setDevices([]);
    setSelectedDevice(null);
    setLiveData({});
    setError(null);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, []);

  return {
    // State
    connectionStatus,
    devices,
    selectedDevice,
    liveData,
    error,
    isInitialized,
    stats,
    
    // Actions
    initialize,
    sendCommand,
    getDevice,
    selectDevice,
    getDevicesByStatus,
    getDeviceStats,
    disconnect,
    
    // Utility
    isConnected: connectionStatus === 'connected',
    isConnecting: connectionStatus === 'connecting',
    isReconnecting: connectionStatus === 'reconnecting',
    hasError: !!error,
    deviceCount: devices.length
  };
};

export default useTeltonika;