// src/services/teltonika/TeltonikaService.js

import { TeltonikaCodec8Extended } from './codecs/Codec8Extended';
import { TeltonikaWebSocket } from './transport/WebSocketTransport';
import { EventEmitter } from '../utils/EventEmitter';

class TeltonikaService extends EventEmitter {
  constructor(config = {}) {
    super();
    this.config = {
      serverUrl: config.serverUrl || 'ws://gps.karangue.sn:8080',
      reconnectInterval: config.reconnectInterval || 5000,
      maxReconnectAttempts: config.maxReconnectAttempts || 10,
      heartbeatInterval: config.heartbeatInterval || 30000,
      ...config
    };
    
    this.codec = new TeltonikaCodec8Extended();
    this.transport = new TeltonikaWebSocket(this.config);
    this.isConnected = false;
    this.devices = new Map();
    this.reconnectAttempts = 0;
    this.heartbeatTimer = null;
    
    this.setupEventHandlers();
  }

  setupEventHandlers() {
    this.transport.on('connected', () => {
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.startHeartbeat();
      this.emit('connected');
    });

    this.transport.on('disconnected', () => {
      this.isConnected = false;
      this.stopHeartbeat();
      this.emit('disconnected');
      this.handleReconnection();
    });

    this.transport.on('data', (data) => {
      this.handleIncomingData(data);
    });

    this.transport.on('error', (error) => {
      this.emit('error', error);
    });
  }

  async connect() {
    try {
      await this.transport.connect();
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  disconnect() {
    this.stopHeartbeat();
    this.transport.disconnect();
  }

  handleIncomingData(rawData) {
    try {
      const parsedData = this.codec.decode(rawData);
      
      if (parsedData) {
        this.processDeviceData(parsedData);
        this.emit('data', parsedData);
      }
    } catch (error) {
      this.emit('parseError', { error, rawData });
    }
  }

  processDeviceData(data) {
    const { imei, records } = data;
    
    if (!this.devices.has(imei)) {
      this.devices.set(imei, {
        imei,
        lastSeen: new Date(),
        recordCount: 0,
        status: 'active'
      });
      this.emit('deviceConnected', { imei });
    }

    const device = this.devices.get(imei);
    device.lastSeen = new Date();
    device.recordCount += records?.length || 0;
    device.lastData = data;

    // Process each GPS record
    records?.forEach(record => {
      this.emit('locationUpdate', {
        imei,
        record,
        device
      });
    });

    // Send acknowledgment
    this.sendAcknowledgment(records?.length || 0);
  }

  sendAcknowledgment(recordCount) {
    const ackData = this.codec.createAcknowledgment(recordCount);
    this.transport.send(ackData);
  }

  sendCommand(imei, command) {
    const commandData = this.codec.encodeCommand(imei, command);
    return this.transport.send(commandData);
  }

  startHeartbeat() {
    this.heartbeatTimer = setInterval(() => {
      if (this.isConnected) {
        this.transport.ping();
      }
    }, this.config.heartbeatInterval);
  }

  stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  handleReconnection() {
    if (this.reconnectAttempts < this.config.maxReconnectAttempts) {
      this.reconnectAttempts++;
      
      setTimeout(() => {
        this.emit('reconnecting', { attempt: this.reconnectAttempts });
        this.connect().catch(() => {
          // Retry logic handled by recursive calls
        });
      }, this.config.reconnectInterval * this.reconnectAttempts);
    } else {
      this.emit('maxReconnectAttemptsReached');
    }
  }

  getDevices() {
    return Array.from(this.devices.values());
  }

  getDevice(imei) {
    return this.devices.get(imei);
  }

  getConnectionStatus() {
    return {
      connected: this.isConnected,
      deviceCount: this.devices.size,
      reconnectAttempts: this.reconnectAttempts
    };
  }
}

export default TeltonikaService;