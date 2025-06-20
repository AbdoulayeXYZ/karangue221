/**
 * WebSocket service for real-time data
 * 
 * This service manages WebSocket connections and reconnection.
 */

import { EventEmitter } from 'events';
import { getAuthToken } from './auth';

// Constants
const WS_RECONNECT_INTERVAL = 5000; // 5 seconds
const WS_PING_INTERVAL = 20000; // 20 seconds
const WS_RECONNECT_MAX_RETRIES = 10;

class WebSocketService {
  constructor() {
    this.socket = null;
    this.connected = false;
    this.reconnectAttempts = 0;
    this.reconnectTimer = null;
    this.pingTimer = null;
    this.events = new EventEmitter();
    this.lastMessageTime = 0;
    this.subscriptions = [];
    
    // Bind methods to this
    this.connect = this.connect.bind(this);
    this.disconnect = this.disconnect.bind(this);
    this.reconnect = this.reconnect.bind(this);
    this.handleMessage = this.handleMessage.bind(this);
    this.send = this.send.bind(this);
    this.subscribe = this.subscribe.bind(this);
    this.unsubscribe = this.unsubscribe.bind(this);
    this.ping = this.ping.bind(this);
  }
  
  /**
   * Connect to WebSocket server
   * @returns {Promise} - Resolves when connected
   */
  connect() {
    return new Promise((resolve, reject) => {
      if (this.socket && this.connected) {
        resolve(this.socket);
        return;
      }
      
      // Clean up any existing socket
      this.disconnect();
      
      // Get auth token for authenticated connection
      const token = getAuthToken();
      const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      
      // Fix the host construction - use localhost:5001 directly
      const host = process.env.REACT_APP_API_URL || 'localhost:5001';
      const wsUrl = `${wsProtocol}//${host}/ws${token ? `?token=${token}` : ''}`;
      
      console.log(`Connecting to WebSocket at ${wsUrl}`);
      
      try {
        this.socket = new WebSocket(wsUrl);
        
        // Set up connection timeout
        const connectionTimeout = setTimeout(() => {
          if (!this.connected) {
            console.error('WebSocket connection timeout');
            this.socket.close();
            reject(new Error('Connection timeout'));
          }
        }, 10000);
        
        // Connection opened
        this.socket.addEventListener('open', () => {
          console.log('WebSocket connection established');
          this.connected = true;
          this.reconnectAttempts = 0;
          clearTimeout(connectionTimeout);
          
          // Start ping interval
          this.startPingInterval();
          
          // Resubscribe to channels
          if (this.subscriptions.length > 0) {
            this.send({ 
              action: 'subscribe', 
              channels: this.subscriptions 
            });
          }
          
          // Request initial data
          this.send({ action: 'get_initial_data' });
          
          // Notify listeners
          this.events.emit('connected');
          resolve(this.socket);
        });
        
        // Listen for messages
        this.socket.addEventListener('message', this.handleMessage);
        
        // Listen for errors
        this.socket.addEventListener('error', (error) => {
          console.error('WebSocket error:', error);
          this.events.emit('error', error);
        });
        
        // Connection closed
        this.socket.addEventListener('close', (event) => {
          console.log(`WebSocket connection closed: ${event.code} ${event.reason}`);
          this.connected = false;
          clearInterval(this.pingTimer);
          
          // Notify listeners
          this.events.emit('disconnected', event);
          
          // Attempt to reconnect
          this.scheduleReconnect();
        });
      } catch (error) {
        console.error('Failed to create WebSocket:', error);
        reject(error);
      }
    });
  }
  
  /**
   * Disconnect from WebSocket server
   */
  disconnect() {
    if (this.socket) {
      // Remove event listeners
      this.socket.removeEventListener('message', this.handleMessage);
      
      // Close connection
      if (this.socket.readyState === WebSocket.OPEN) {
        this.socket.close(1000, 'Client disconnecting');
      }
      
      this.socket = null;
      this.connected = false;
    }
    
    // Clear timers
    clearTimeout(this.reconnectTimer);
    clearInterval(this.pingTimer);
  }
  
  /**
   * Schedule reconnection attempt
   */
  scheduleReconnect() {
    // Clear any existing reconnect timer
    clearTimeout(this.reconnectTimer);
    
    // Stop reconnecting after max attempts
    if (this.reconnectAttempts >= WS_RECONNECT_MAX_RETRIES) {
      console.error('Max reconnection attempts reached');
      this.events.emit('reconnect_failed');
      return;
    }
    
    // Exponential backoff
    const delay = Math.min(
      30000, // Max 30 seconds
      WS_RECONNECT_INTERVAL * Math.pow(1.5, this.reconnectAttempts)
    );
    
    console.log(`Scheduling reconnect in ${delay}ms (attempt ${this.reconnectAttempts + 1}/${WS_RECONNECT_MAX_RETRIES})`);
    
    this.reconnectTimer = setTimeout(() => {
      this.reconnectAttempts++;
      this.events.emit('reconnecting', this.reconnectAttempts);
      this.connect().catch(error => {
        console.error('Reconnection failed:', error);
      });
    }, delay);
  }
  
  /**
   * Start ping interval to keep connection alive
   */
  startPingInterval() {
    clearInterval(this.pingTimer);
    this.pingTimer = setInterval(this.ping, WS_PING_INTERVAL);
  }
  
  /**
   * Send ping to server
   */
  ping() {
    this.send({ action: 'ping', timestamp: new Date().toISOString() });
  }
  
  /**
   * Handle incoming WebSocket messages
   * @param {MessageEvent} event - WebSocket message event
   */
  handleMessage(event) {
    try {
      const data = JSON.parse(event.data);
      this.lastMessageTime = Date.now();
      
      // Log message for debugging
      console.debug('WebSocket message:', data);
      
      // Handle system messages
      switch (data.type) {
        case 'connected':
          this.events.emit('auth_success', data);
          break;
          
        case 'error':
          this.events.emit('server_error', data);
          console.error('Server error:', data.message);
          break;
          
        case 'pong':
          // Server responded to ping
          this.events.emit('pong', data);
          break;
          
        case 'subscription_confirmed':
          this.events.emit('subscription_confirmed', data.channels);
          break;
          
        case 'fleet_data':
          // Process fleet data
          this.events.emit('fleet_data', data.data);
          break;
          
        default:
          // Forward any other message types to listeners
          this.events.emit(data.type, data);
      }
      
      // Emit all messages on the 'message' event
      this.events.emit('message', data);
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
      console.error('Raw message:', event.data);
    }
  }
  
  /**
   * Send message to WebSocket server
   * @param {Object} message - Message to send
   * @returns {boolean} - True if sent successfully
   */
  send(message) {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      console.warn('WebSocket not connected, cannot send message');
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
   * Subscribe to channel(s)
   * @param {string|Array<string>} channels - Channel(s) to subscribe to
   */
  subscribe(channels) {
    const channelArray = Array.isArray(channels) ? channels : [channels];
    
    // Add channels to subscriptions
    channelArray.forEach(channel => {
      if (!this.subscriptions.includes(channel)) {
        this.subscriptions.push(channel);
      }
    });
    
    // Send subscription request
    if (this.connected) {
      this.send({ action: 'subscribe', channels: this.subscriptions });
    }
  }
  
  /**
   * Unsubscribe from channel(s)
   * @param {string|Array<string>} channels - Channel(s) to unsubscribe from
   */
  unsubscribe(channels) {
    const channelArray = Array.isArray(channels) ? channels : [channels];
    
    // Remove channels from subscriptions
    this.subscriptions = this.subscriptions.filter(
      channel => !channelArray.includes(channel)
    );
    
    // Send updated subscription list
    if (this.connected) {
      this.send({ action: 'subscribe', channels: this.subscriptions });
    }
  }
  
  /**
   * Listen for events
   * @param {string} event - Event name
   * @param {Function} callback - Event callback
   * @returns {Function} - Unsubscribe function
   */
  on(event, callback) {
    this.events.on(event, callback);
    return () => this.events.removeListener(event, callback);
  }
  
  /**
   * Listen for events once
   * @param {string} event - Event name
   * @param {Function} callback - Event callback
   */
  once(event, callback) {
    this.events.once(event, callback);
  }
  
  /**
   * Check if socket is connected
   * @returns {boolean} - True if connected
   */
  isConnected() {
    return this.connected && 
           this.socket && 
           this.socket.readyState === WebSocket.OPEN;
  }
  
  /**
   * Get connection state as string
   * @returns {string} - Connection state
   */
  getState() {
    if (!this.socket) return 'closed';
    
    switch (this.socket.readyState) {
      case WebSocket.CONNECTING: return 'connecting';
      case WebSocket.OPEN: return 'open';
      case WebSocket.CLOSING: return 'closing';
      case WebSocket.CLOSED: return 'closed';
      default: return 'unknown';
    }
  }
}

// Export singleton instance
const websocketService = new WebSocketService();
export default websocketService;
