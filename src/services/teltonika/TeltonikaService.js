import { EventEmitter } from '../utils/EventEmitter';

/**
 * TeltonikaService - Service for handling real-time telemetry data via WebSocket
 * 
 * This service manages the connection to the Teltonika tracking server and provides
 * real-time updates for vehicle locations, telemetry, and events.
 */
class TeltonikaService {
  constructor() {
    // Initialize event emitter for publishing events to subscribers
    this.events = new EventEmitter();
    
    // WebSocket connection
    this.socket = null;
    
    // Connection state
    this.connected = false;
    this.connecting = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 10;
    this.reconnectDelay = 2000; // Start with 2 seconds
    this.reconnectTimeout = null;
    
    // Store for latest telemetry data by vehicle ID
    this.telemetryData = new Map();
    
    // Data subscription types
    this.subscriptionTypes = {
      LOCATION: 'location',
      TELEMETRY: 'telemetry',
      EVENTS: 'events',
      ALL: 'all'
    };
    
    // Active subscriptions by type
    this.activeSubscriptions = new Set();
    
    // Authentication token
    this.authToken = null;
  }
  
  /**
   * Initialize the service and connect to the WebSocket server
   * @param {string} token - Authentication token
   * @param {string} baseUrl - WebSocket server URL (optional, defaults to environment variable)
   * @returns {Promise} Resolves when connected
   */
  initialize(token, baseUrl) {
    this.authToken = token;
    this.baseUrl = baseUrl || process.env.REACT_APP_WS_URL || `ws://${window.location.host}/api/ws`;
    
    return this.connect();
  }
  
  /**
   * Connect to the WebSocket server
   * @returns {Promise} Resolves when connected
   */
  connect() {
    if (this.connected || this.connecting) {
      return Promise.resolve();
    }
    
    this.connecting = true;
    
    return new Promise((resolve, reject) => {
      try {
        // Close existing socket if any
        if (this.socket) {
          try {
            this.socket.close(1000, 'Reconnecting');
          } catch (error) {
            console.warn('Error closing existing WebSocket:', error);
          }
          this.socket = null;
        }
        
        // Create new WebSocket connection
        const wsUrl = `${this.baseUrl}?token=${this.authToken}`;
        this.socket = new WebSocket(wsUrl);
        
        // Setup event handlers
        this.socket.onopen = () => {
          console.log('WebSocket connection established');
          this.connected = true;
          this.connecting = false;
          this.reconnectAttempts = 0;
          this.reconnectDelay = 2000; // Reset delay
          
          // Resubscribe to active subscriptions
          this.resubscribe();
          
          // Resolve the promise
          resolve();
          
          // Emit connection event
          this.events.emit('connected');
        };
        
        this.socket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            this.handleMessage(data);
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };
        
        this.socket.onerror = (error) => {
          console.error('WebSocket error:', error);
          
          // Check for runtime.lastError
          if (error && error.message && error.message.includes('runtime.lastError')) {
            console.warn('Runtime.lastError detected - this may be a browser extension issue');
          }
          
          this.events.emit('error', error);
          
          if (this.connecting) {
            reject(error);
            this.connecting = false;
          }
        };
        
        this.socket.onclose = (event) => {
          console.log(`WebSocket connection closed: ${event.code} ${event.reason}`);
          this.connected = false;
          this.connecting = false;
          
          // Emit disconnected event
          this.events.emit('disconnected', event);
          
          // Attempt to reconnect if not explicitly closed by user
          if (!event.wasClean) {
            this.scheduleReconnect();
          }
        };
      } catch (error) {
        console.error('Error creating WebSocket connection:', error);
        this.connecting = false;
        reject(error);
        this.scheduleReconnect();
      }
    });
  }
  
  /**
   * Schedule a reconnection attempt
   */
  scheduleReconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }
    
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      // Exponential backoff
      const delay = Math.min(30000, this.reconnectDelay * Math.pow(1.5, this.reconnectAttempts));
      
      console.log(`Scheduling reconnect attempt ${this.reconnectAttempts + 1} in ${delay}ms`);
      
      this.reconnectTimeout = setTimeout(() => {
        this.reconnectAttempts++;
        this.events.emit('reconnecting', this.reconnectAttempts);
        this.connect().catch(() => {
          // Failed to reconnect, will be handled by scheduleReconnect in onclose
        });
      }, delay);
    } else {
      console.error(`Maximum reconnection attempts (${this.maxReconnectAttempts}) reached`);
      this.events.emit('reconnect_failed');
    }
  }
  
  /**
   * Disconnect from the WebSocket server
   */
  disconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    
    if (this.socket) {
      this.socket.close(1000, 'Client disconnecting');
      this.socket = null;
    }
    
    this.connected = false;
    this.connecting = false;
    this.activeSubscriptions.clear();
  }
  
  /**
   * Handle incoming WebSocket messages
   * @param {Object} data - Message data
   */
  handleMessage(data) {
    if (!data || !data.type) {
      console.warn('Received invalid WebSocket message:', data);
      return;
    }
    
    switch (data.type) {
      case 'auth_success':
        console.log('Authentication successful');
        break;
        
      case 'auth_error':
        console.error('Authentication failed:', data.message);
        this.events.emit('auth_error', data.message);
        break;
        
      case 'location_update':
        this.handleLocationUpdate(data.vehicles);
        break;
        
      case 'telemetry_update':
        this.handleTelemetryUpdate(data.vehicles);
        break;
        
      case 'event':
        this.handleEvent(data.event);
        break;
        
      case 'error':
        console.error('Server error:', data.message);
        this.events.emit('server_error', data.message);
        break;
        
      default:
        console.warn('Unknown message type:', data.type);
    }
  }
  
  /**
   * Handle location updates for vehicles
   * @param {Array} vehicles - Array of vehicle location data
   */
  handleLocationUpdate(vehicles) {
    if (!Array.isArray(vehicles)) return;
    
    vehicles.forEach(vehicle => {
      // Update stored telemetry data
      const existingData = this.telemetryData.get(vehicle.id) || {};
      this.telemetryData.set(vehicle.id, {
        ...existingData,
        location: vehicle.location,
        speed: vehicle.speed,
        heading: vehicle.heading,
        lastUpdate: new Date()
      });
    });
    
    // Emit event for subscribers
    this.events.emit('location_update', vehicles);
  }
  
  /**
   * Handle telemetry updates for vehicles
   * @param {Array} vehicles - Array of vehicle telemetry data
   */
  handleTelemetryUpdate(vehicles) {
    if (!Array.isArray(vehicles)) return;
    
    vehicles.forEach(vehicle => {
      // Update stored telemetry data
      const existingData = this.telemetryData.get(vehicle.id) || {};
      this.telemetryData.set(vehicle.id, {
        ...existingData,
        ...vehicle.telemetry,
        lastUpdate: new Date()
      });
    });
    
    // Emit event for subscribers
    this.events.emit('telemetry_update', vehicles);
  }
  
  /**
   * Handle events from vehicles
   * @param {Object} event - Event data
   */
  handleEvent(event) {
    // Emit event for subscribers
    this.events.emit('vehicle_event', event);
  }
  
  /**
   * Send a message to the WebSocket server
   * @param {Object} message - Message to send
   * @returns {boolean} Success status
   */
  sendMessage(message) {
    if (!this.connected || !this.socket) {
      console.error('Cannot send message: WebSocket not connected');
      return false;
    }
    
    try {
      this.socket.send(JSON.stringify(message));
      return true;
    } catch (error) {
      console.error('Error sending WebSocket message:', error);
      return false;
    }
  }
  
  /**
   * Subscribe to real-time updates for specific vehicles
   * @param {string} type - Subscription type (location, telemetry, events, all)
   * @param {Array} vehicleIds - Array of vehicle IDs to subscribe to (optional, if not provided subscribes to all)
   * @returns {boolean} Success status
   */
  subscribe(type, vehicleIds = []) {
    if (!this.subscriptionTypes[type.toUpperCase()]) {
      console.error(`Invalid subscription type: ${type}`);
      return false;
    }
    
    const subscriptionType = this.subscriptionTypes[type.toUpperCase()];
    this.activeSubscriptions.add(subscriptionType);
    
    return this.sendMessage({
      action: 'subscribe',
      type: subscriptionType,
      vehicleIds: vehicleIds
    });
  }
  
  /**
   * Unsubscribe from real-time updates for specific vehicles
   * @param {string} type - Subscription type (location, telemetry, events, all)
   * @param {Array} vehicleIds - Array of vehicle IDs to unsubscribe from (optional, if not provided unsubscribes from all)
   * @returns {boolean} Success status
   */
  unsubscribe(type, vehicleIds = []) {
    if (!this.subscriptionTypes[type.toUpperCase()]) {
      console.error(`Invalid subscription type: ${type}`);
      return false;
    }
    
    const subscriptionType = this.subscriptionTypes[type.toUpperCase()];
    this.activeSubscriptions.delete(subscriptionType);
    
    return this.sendMessage({
      action: 'unsubscribe',
      type: subscriptionType,
      vehicleIds: vehicleIds
    });
  }
  
  /**
   * Resubscribe to all active subscriptions (used after reconnection)
   */
  resubscribe() {
    this.activeSubscriptions.forEach(type => {
      this.sendMessage({
        action: 'subscribe',
        type: type
      });
    });
  }
  
  /**
   * Get the latest telemetry data for a specific vehicle
   * @param {string} vehicleId - Vehicle ID
   * @returns {Object|null} Vehicle telemetry data or null if not available
   */
  getVehicleTelemetry(vehicleId) {
    return this.telemetryData.get(vehicleId) || null;
  }
  
  /**
   * Get the latest telemetry data for all vehicles
   * @returns {Array} Array of vehicle telemetry data
   */
  getAllVehiclesTelemetry() {
    const result = [];
    this.telemetryData.forEach((data, id) => {
      result.push({ id, ...data });
    });
    return result;
  }
  
  /**
   * Register an event listener
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   */
  on(event, callback) {
    this.events.on(event, callback);
  }
  
  /**
   * Remove an event listener
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   */
  off(event, callback) {
    this.events.off(event, callback);
  }
  
  /**
   * Check if the WebSocket is connected
   * @returns {boolean} Connection status
   */
  isConnected() {
    return this.connected;
  }
}

// Create a singleton instance
const teltonikaService = new TeltonikaService();

export default teltonikaService;