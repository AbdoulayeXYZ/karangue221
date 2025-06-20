// src/services/teltonika/transport/WebSocketTransport.js

import { EventEmitter } from '../../utils/EventEmitter';

class TeltonikaWebSocket extends EventEmitter {
  constructor(config) {
    super();
    this.config = config;
    this.ws = null;
    this.isConnecting = false;
    this.lastPingTime = null;
    this.pingInterval = null;
  }

  async connect() {
    if (this.isConnecting || (this.ws && this.ws.readyState === WebSocket.OPEN)) {
      return;
    }

    this.isConnecting = true;
    
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.config.serverUrl, ['teltonika-gps']);
        
        this.ws.binaryType = 'arraybuffer';

        this.ws.onopen = () => {
          this.isConnecting = false;
          this.emit('connected');
          this.startPingInterval();
          resolve();
        };

        this.ws.onmessage = (event) => {
          this.handleMessage(event.data);
        };

        this.ws.onclose = (event) => {
          this.isConnecting = false;
          this.stopPingInterval();
          this.emit('disconnected', {
            code: event.code,
            reason: event.reason,
            wasClean: event.wasClean
          });
        };

        this.ws.onerror = (error) => {
          this.isConnecting = false;
          this.emit('error', {
            type: 'websocket_error',
            message: 'WebSocket connection error',
            error
          });
          reject(error);
        };

        // Connection timeout
        setTimeout(() => {
          if (this.isConnecting) {
            this.isConnecting = false;
            this.ws?.close();
            reject(new Error('Connection timeout'));
          }
        }, 10000);

      } catch (error) {
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  disconnect() {
    this.stopPingInterval();
    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }
  }

  send(data) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(data);
        return true;
      } catch (error) {
        this.emit('error', {
          type: 'send_error',
          message: 'Failed to send data',
          error
        });
        return false;
      }
    }
    return false;
  }

  ping() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.lastPingTime = Date.now();
      // Send ping frame or custom ping message
      const pingData = new ArrayBuffer(4);
      const view = new DataView(pingData);
      view.setUint32(0, 0xFFFFFFFF); // Ping identifier
      this.send(pingData);
    }
  }

  handleMessage(data) {
    try {
      if (data instanceof ArrayBuffer) {
        // Check if it's a pong response
        if (data.byteLength === 4) {
          const view = new DataView(data);
          const identifier = view.getUint32(0);
          
          if (identifier === 0xFFFFFFFF) {
            // This is a pong response
            const latency = Date.now() - this.lastPingTime;
            this.emit('pong', { latency });
            return;
          }
        }
        
        // Regular GPS data
        this.emit('data', data);
      } else {
        // Handle text messages (commands, status, etc.)
        this.emit('message', data);
      }
    } catch (error) {
      this.emit('error', {
        type: 'message_processing_error',
        message: 'Failed to process incoming message',
        error
      });
    }
  }

  startPingInterval() {
    this.pingInterval = setInterval(() => {
      this.ping();
    }, 30000); // Ping every 30 seconds
  }

  stopPingInterval() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  getState() {
    return {
      connected: this.ws && this.ws.readyState === WebSocket.OPEN,
      connecting: this.isConnecting,
      readyState: this.ws?.readyState,
      url: this.config.serverUrl
    };
  }
}

export { TeltonikaWebSocket };