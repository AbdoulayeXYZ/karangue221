import { EventEmitter } from './utils/EventEmitter';

class WebSocketService extends EventEmitter {
  constructor() {
    super();
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    this.isConnecting = false;
    this.isConnected = false;
    this.heartbeatInterval = null;
    this.reconnectTimeout = null;
  }

  connect() {
    if (this.isConnecting || this.isConnected) return;

    this.isConnecting = true;
    this.emit('connecting');

    try {
      // Get auth token
      const token = localStorage.getItem('authToken');
      if (!token) {
        this.emit('error', 'No authentication token found');
        this.isConnecting = false;
        return;
      }

      // Connect to WebSocket server
      this.ws = new WebSocket(`ws://localhost:5001/ws?token=${token}`);

      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.isConnected = true;
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this.emit('connected');
        this.startHeartbeat();
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleMessage(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.ws.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        this.isConnected = false;
        this.isConnecting = false;
        this.stopHeartbeat();
        this.emit('disconnected', event);
        
        // Attempt to reconnect if not a normal closure
        if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.scheduleReconnect();
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.emit('error', error);
        this.isConnecting = false;
      };

    } catch (error) {
      console.error('Error creating WebSocket connection:', error);
      this.emit('error', error);
      this.isConnecting = false;
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close(1000, 'User initiated disconnect');
    }
    this.stopHeartbeat();
    this.clearReconnectTimeout();
  }

  send(data) {
    if (this.isConnected && this.ws) {
      try {
        this.ws.send(JSON.stringify(data));
      } catch (error) {
        console.error('Error sending WebSocket message:', error);
        this.emit('error', error);
      }
    } else {
      console.warn('WebSocket not connected, cannot send message');
    }
  }

  handleMessage(data) {
    const { type, payload } = data;

    switch (type) {
      case 'notification':
        this.emit('notification', payload);
        break;
      
      case 'vehicle_update':
        this.emit('vehicle_update', payload);
        break;
      
      case 'driver_update':
        this.emit('driver_update', payload);
        break;
      
      case 'system_status':
        this.emit('system_status', payload);
        break;
      
      case 'telemetry':
        this.emit('telemetry', payload);
        break;
      
      case 'incident':
        this.emit('incident', payload);
        break;
      
      case 'pong':
        // Heartbeat response
        break;
      
      default:
        console.log('Unknown WebSocket message type:', type);
    }
  }

  startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      if (this.isConnected) {
        this.send({ type: 'ping' });
      }
    }, 30000); // Send ping every 30 seconds
  }

  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  scheduleReconnect() {
    this.clearReconnectTimeout();
    this.reconnectAttempts++;
    
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    console.log(`Scheduling WebSocket reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);
    
    this.reconnectTimeout = setTimeout(() => {
      this.connect();
    }, delay);
  }

  clearReconnectTimeout() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
  }

  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      isConnecting: this.isConnecting,
      reconnectAttempts: this.reconnectAttempts
    };
  }
}

// Create singleton instance
const webSocketService = new WebSocketService();

export default webSocketService; 