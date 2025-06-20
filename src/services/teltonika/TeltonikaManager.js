// src/services/teltonika/TeltonikaManager.js

import TeltonikaService from './TeltonikaService';
import { TeltonikaDeviceMapper } from './utils/DeviceMapper';
import { TeltonikaDataValidator } from './utils/DataValidator';

class TeltonikaManager {
  constructor() {
    this.service = null;
    this.mapper = new TeltonikaDeviceMapper();
    this.validator = new TeltonikaDataValidator();
    this.config = this.getDefaultConfig();
    this.isInitialized = false;
    this.subscribers = new Set();
  }

  getDefaultConfig() {
    return {
      serverUrl: import.meta.env.VITE_TELTONIKA_WS_URL || 'ws://localhost:8080',
      reconnectInterval: 5000,
      maxReconnectAttempts: 10,
      heartbeatInterval: 30000,
      dataValidation: true,
      logLevel: 'info'
    };
  }

  async initialize(customConfig = {}) {
    if (this.isInitialized) {
      console.warn('TeltonikaManager already initialized');
      return;
    }

    this.config = { ...this.config, ...customConfig };
    this.service = new TeltonikaService(this.config);
    
    this.setupEventHandlers();
    
    try {
      await this.service.connect();
      this.isInitialized = true;
      console.log('Teltonika service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Teltonika service:', error);
      throw error;
    }
  }

  setupEventHandlers() {
    this.service.on('connected', () => {
      this.notifySubscribers('connected', { timestamp: new Date() });
    });

    this.service.on('disconnected', () => {
      this.notifySubscribers('disconnected', { timestamp: new Date() });
    });

    this.service.on('data', (data) => {
      this.handleDeviceData(data);
    });

    this.service.on('deviceConnected', (device) => {
      this.notifySubscribers('deviceConnected', device);
    });

    this.service.on('locationUpdate', (update) => {
      this.handleLocationUpdate(update);
    });

    this.service.on('error', (error) => {
      console.error('Teltonika service error:', error);
      this.notifySubscribers('error', error);
    });

    this.service.on('reconnecting', (info) => {
      this.notifySubscribers('reconnecting', info);
    });
  }

  handleDeviceData(data) {
    try {
      // Validate incoming data
      if (this.config.dataValidation) {
        const validationResult = this.validator.validate(data);
        if (!validationResult.isValid) {
          console.warn('Invalid data received:', validationResult.errors);
          return;
        }
      }

      // Map device data to application format
      const mappedData = this.mapper.mapDeviceData(data);
      
      this.notifySubscribers('deviceData', mappedData);
    } catch (error) {
      console.error('Error handling device data:', error);
    }
  }

  handleLocationUpdate(update) {
    try {
      const { imei, record, device } = update;
      
      // Map GPS record to standard location format
      const locationData = this.mapper.mapLocationData(imei, record, device);
      
      this.notifySubscribers('locationUpdate', locationData);
    } catch (error) {
      console.error('Error handling location update:', error);
    }
  }

  subscribe(callback) {
    if (typeof callback === 'function') {
      this.subscribers.add(callback);
      return () => this.unsubscribe(callback);
    }
    throw new Error('Callback must be a function');
  }

  unsubscribe(callback) {
    this.subscribers.delete(callback);
  }

  notifySubscribers(event, data) {
    this.subscribers.forEach(callback => {
      try {
        callback({ event, data, timestamp: new Date() });
      } catch (error) {
        console.error('Error in subscriber callback:', error);
      }
    });
  }

  getConnectedDevices() {
    return this.service?.getDevices() || [];
  }

  getDevice(imei) {
    return this.service?.getDevice(imei);
  }

  getConnectionStatus() {
    return this.service?.getConnectionStatus() || {
      connected: false,
      deviceCount: 0,
      reconnectAttempts: 0
    };
  }

  async sendCommand(imei, command) {
    if (!this.service) {
      throw new Error('Service not initialized');
    }
    
    return this.service.sendCommand(imei, command);
  }

  disconnect() {
    if (this.service) {
      this.service.disconnect();
    }
    this.isInitialized = false;
    this.subscribers.clear();
  }

  // Utility methods for external configuration
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    
    if (this.service && this.isInitialized) {
      // Restart service with new config
      this.disconnect();
      return this.initialize();
    }
  }

  getConfig() {
    return { ...this.config };
  }

  getStats() {
    const devices = this.getConnectedDevices();
    const status = this.getConnectionStatus();
    
    return {
      ...status,
      devices: devices.map(device => ({
        imei: device.imei,
        lastSeen: device.lastSeen,
        recordCount: device.recordCount,
        status: device.status
      })),
      subscriberCount: this.subscribers.size
    };
  }
}

// Export singleton instance
const teltonikaManager = new TeltonikaManager();
export default teltonikaManager;