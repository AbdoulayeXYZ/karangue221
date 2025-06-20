/**
 * WebSocket.js - Service for handling WebSocket connections.
 * 
 * This module sets up a WebSocket server for real-time updates with
 * improved development mode and connection stability features.
 */

const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const url = require('url');

// Configuration
const JWT_SECRET = process.env.JWT_SECRET || 'votre_clé_secrète_temporaire';
const IS_DEV_MODE = process.env.NODE_ENV !== 'production';
const HEARTBEAT_INTERVAL = 30000; // 30 seconds
const CONNECTION_TIMEOUT = 60000; // 60 seconds

class WebSocketService {
  constructor(server) {
    this.wss = new WebSocket.Server({ server, path: '/ws' });
    this.clients = new Map();
    
    console.log(`🔌 WebSocket server initialized. Dev mode: ${IS_DEV_MODE ? 'ON' : 'OFF'}`);
    
    // Set up WebSocket server events
    this.wss.on('connection', (ws, req) => {
      this.handleConnection(ws, req);
    });
    
    // Set up heartbeat to keep connections alive
    this.setupHeartbeat();
  }
  
  /**
   * Handle new WebSocket connections
   * @param {WebSocket} ws - WebSocket client
   * @param {IncomingMessage} req - HTTP request
   */
  handleConnection(ws, req) {
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    console.log(`WebSocket connection from ${clientIp}`);
    
    // Parse URL and extract token
    const parsedUrl = url.parse(req.url, true);
    const token = parsedUrl.query.token;
    
    if (IS_DEV_MODE && !token) {
      // In development mode, allow connections without token
      console.log('⚠️ Dev mode: Accepting connection without token');
      this.acceptConnection(ws, { id: 'dev-user', role: 'dev' });
    } else {
      // In production, require token authentication
      this.authenticate(ws, token);
    }
  }

  /**
   * Authenticate WebSocket connection
   * @param {WebSocket} ws - WebSocket client
   * @param {string} token - JWT token
   */
  authenticate(ws, token) {
    // Handle missing token
    if (!token) {
      console.log('❌ Connection rejected: No token provided');
      ws.send(JSON.stringify({ 
        type: 'error', 
        message: 'Authentication required. Please provide a token.',
        code: 'AUTH_REQUIRED'
      }));
      
      // In development mode, provide reconnection information
      if (IS_DEV_MODE) {
        setTimeout(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
              type: 'info',
              message: 'Dev mode: You can reconnect without a token by using: ws://localhost:5001/ws'
            }));
          }
        }, 1000);
      } else {
        ws.close(1008, 'Token required');
      }
      return;
    }
    
    // Verify token
    try {
      const payload = jwt.verify(token, JWT_SECRET);
      this.acceptConnection(ws, payload);
    } catch (err) {
      console.log(`❌ Connection rejected: Invalid token - ${err.message}`);
      
      // Special handling for development mode
      if (IS_DEV_MODE) {
        console.log('⚠️ Dev mode: Accepting connection despite invalid token');
        this.acceptConnection(ws, { id: 'dev-user', role: 'dev' });
      } else {
        ws.send(JSON.stringify({ 
          type: 'error', 
          message: 'Invalid or expired token. Please login again.',
          code: 'INVALID_TOKEN'
        }));
        ws.close(1008, 'Invalid token');
      }
    }
  }

  /**
   * Accept a WebSocket connection
   * @param {WebSocket} ws - WebSocket client
   * @param {Object} userData - User data from token
   */
  acceptConnection(ws, userData) {
    // Initialize client data
    const clientData = {
      id: userData.id,
      role: userData.role || 'user',
      time: new Date(),
      isAlive: true,
      lastActivity: Date.now()
    };
    
    // Store client information
    this.clients.set(ws, clientData);
    
    // Setup WebSocket event listeners
    this.setupListeners(ws);
    
    // Send connection confirmation
    ws.send(JSON.stringify({ 
      type: 'connected', 
      message: 'Successfully connected to WebSocket server',
      userId: userData.id,
      timestamp: new Date().toISOString(),
      role: userData.role
    }));
    
    console.log(`✅ Client connected: ${userData.id} (${userData.role})`);
    
    // Automatically send initial data to client
    this.sendInitialData(ws);
  }

  /**
   * Setup heartbeat mechanism to keep connections alive
   */
  setupHeartbeat() {
    setInterval(() => {
      this.clients.forEach((client, ws) => {
        // Check if client is still alive
        if (client.isAlive === false) {
          console.log(`❌ Client ${client.id} timed out, terminating connection`);
          this.clients.delete(ws);
          return ws.terminate();
        }
        
        // Mark as inactive for next check and send ping
        client.isAlive = false;
        
        // Send ping to client
        try {
          ws.ping();
        } catch (e) {
          // Handle potential errors when sending ping
          console.error(`Error sending ping to client ${client.id}:`, e.message);
          this.clients.delete(ws);
          ws.terminate();
        }
      });
    }, HEARTBEAT_INTERVAL);
  }

  /**
   * Setup event listeners for the WebSocket
   * @param {WebSocket} ws - WebSocket client
   */
  setupListeners(ws) {
    // Message handler
    ws.on('message', (message) => this.handleMessage(ws, message));
    
    // Close event
    ws.on('close', (code, reason) => this.handleClose(ws, code, reason));
    
    // Error handler
    ws.on('error', (error) => {
      const client = this.clients.get(ws);
      console.error(`WebSocket error for client ${client?.id || 'unknown'}:`, error.message);
    });
    
    // Pong handler - response to our ping
    ws.on('pong', () => {
      const client = this.clients.get(ws);
      if (client) {
        client.isAlive = true;
        client.lastActivity = Date.now();
      }
    });
  }

  /**
   * Handle incoming messages
   * @param {WebSocket} ws - WebSocket client
   * @param {Buffer|string} message - Message data
   */
  handleMessage(ws, message) {
    try {
      const data = JSON.parse(message.toString());
      const client = this.clients.get(ws);
      
      // Update client activity timestamp
      if (client) {
        client.lastActivity = Date.now();
      }
      
      console.log(`📩 Message from ${client?.id || 'unknown'}: ${data.action || 'unknown action'}`);
      
      // Handle different message types
      switch (data.action) {
        case 'get_initial_data':
          this.sendInitialData(ws);
          break;
          
        case 'ping':
          ws.send(JSON.stringify({ 
            type: 'pong', 
            timestamp: new Date().toISOString(),
            serverId: 'karangue-ws-server'
          }));
          break;
          
        case 'subscribe':
          this.handleSubscription(ws, data.channels || []);
          break;
          
        default:
          console.log('Unknown message action:', data.action);
          ws.send(JSON.stringify({
            type: 'error',
            message: `Unknown action: ${data.action}`,
            originalAction: data.action
          }));
      }
    } catch (error) {
      console.error('Error processing message:', error.message);
      ws.send(JSON.stringify({ 
        type: 'error', 
        message: 'Failed to process message',
        error: IS_DEV_MODE ? error.message : 'Internal error'
      }));
    }
  }

  /**
   * Handle channel subscriptions
   * @param {WebSocket} ws - WebSocket client
   * @param {Array<string>} channels - Channel names to subscribe to
   */
  handleSubscription(ws, channels) {
    const client = this.clients.get(ws);
    if (!client) return;
    
    // Initialize or update subscriptions
    client.subscriptions = channels;
    
    console.log(`Client ${client.id} subscribed to channels: ${channels.join(', ')}`);
    
    // Confirm subscription
    ws.send(JSON.stringify({
      type: 'subscription_confirmed',
      channels: channels,
      timestamp: new Date().toISOString()
    }));
  }

  /**
   * Send initial fleet data to client
   * @param {WebSocket} ws - WebSocket client
   */
  async sendInitialData(ws) {
    const client = this.clients.get(ws);
    console.log(`📊 Sending initial data to client ${client?.id || 'unknown'}`);
    
    try {
      // Import database connection
      const db = require('../config/db');
      
      // Get fleet data from database
      const [vehicles] = await db.query('SELECT * FROM vehicles WHERE status = "active" LIMIT 10');
      const [drivers] = await db.query('SELECT * FROM drivers WHERE status = "active" LIMIT 10');
      const [incidents] = await db.query('SELECT * FROM incidents WHERE status = "open" LIMIT 10');
      const [violations] = await db.query('SELECT * FROM violations WHERE status = "pending" LIMIT 10');
      const [telemetry] = await db.query('SELECT * FROM telemetry ORDER BY timestamp DESC LIMIT 20');
      
      // Create some sample data if database is empty
      const hasData = vehicles.length > 0 || drivers.length > 0;
      const data = hasData ? {
        vehicles,
        drivers,
        incidents,
        violations,
        telemetry
      } : this.generateSampleData();
      
      // Send data to client
      ws.send(JSON.stringify({
        type: 'fleet_data',
        data: data,
        timestamp: new Date().toISOString(),
        source: hasData ? 'database' : 'sample'
      }));
      
      console.log(`✅ Initial data sent to client ${client?.id || 'unknown'}`);
    } catch (error) {
      console.error('Error sending initial data:', error.message);
      
      // Send error to client
      ws.send(JSON.stringify({ 
        type: 'error', 
        message: 'Failed to load initial data',
        error: IS_DEV_MODE ? error.message : 'Database error',
        code: 'DATA_LOAD_ERROR'
      }));
      
      // In development mode, send sample data as fallback
      if (IS_DEV_MODE) {
        setTimeout(() => {
          if (ws.readyState === WebSocket.OPEN) {
            const sampleData = this.generateSampleData();
            ws.send(JSON.stringify({
              type: 'fleet_data',
              data: sampleData,
              timestamp: new Date().toISOString(),
              source: 'sample',
              notice: 'Using sample data due to database error'
            }));
            console.log(`⚠️ Sent sample data to client ${client?.id || 'unknown'} as fallback`);
          }
        }, 1000);
      }
    }
  }
  
  /**
   * Generate sample data when database is empty
   * @returns {Object} Sample fleet data
   */
  generateSampleData() {
    console.log('⚠️ Generating sample data because database returned no results');
    
    // Generate 5 sample vehicles
    const vehicles = Array.from({ length: 5 }, (_, i) => ({
      id: i + 1,
      registration: `SEN-${1000 + i}`,
      brand: ['Toyota', 'Renault', 'Ford', 'Mitsubishi', 'Peugeot'][i % 5],
      model: ['Hilux', 'Duster', 'Ranger', 'L200', '3008'][i % 5],
      year: 2020 + (i % 5),
      status: 'active',
      fleet_id: 1,
      type: ['pickup', 'suv', 'van', 'pickup', 'suv'][i % 5],
      imei_device: `3635${i}00000${i}`,
      created_at: new Date().toISOString()
    }));
    
    // Generate 5 sample drivers
    const drivers = Array.from({ length: 5 }, (_, i) => ({
      id: i + 1,
      first_name: ['Abdou', 'Fatou', 'Mamadou', 'Aminata', 'Ousmane'][i % 5],
      last_name: ['Diop', 'Ndiaye', 'Sow', 'Ba', 'Fall'][i % 5],
      license_number: `DK202${i}0000${i}`,
      phone: `+22177${i}000000`,
      email: `driver${i+1}@karangue221.com`,
      status: 'active',
      fleet_id: 1,
      created_at: new Date().toISOString(),
      overallScore: 70 + (i * 5) % 30,
      trend: ['up', 'down', 'stable'][i % 3],
      experience: `${3 + i} years`
    }));
    
    // Generate 3 sample incidents
    const incidents = Array.from({ length: 3 }, (_, i) => ({
      id: i + 1,
      vehicle_id: i + 1,
      driver_id: i + 1,
      type: ['accident', 'breakdown', 'theft'][i % 3],
      description: `Sample incident ${i+1} description`,
      severity: ['low', 'medium', 'high'][i % 3],
      status: 'open',
      timestamp: new Date(Date.now() - i * 86400000).toISOString(),
    }));
    
    // Generate 5 sample violations
    const violations = Array.from({ length: 5 }, (_, i) => ({
      id: i + 1,
      driver_id: (i % 5) + 1,
      vehicle_id: (i % 5) + 1,
      type: ['speeding', 'harsh_braking', 'distraction', 'phone_use', 'fatigue'][i % 5],
      severity: ['low', 'medium', 'high'][i % 3],
      description: `Sample violation ${i+1}`,
      status: 'pending',
      timestamp: new Date(Date.now() - i * 3600000).toISOString(),
      location: 'Dakar, Senegal',
    }));
    
    // Generate 10 sample telemetry records
    const telemetry = Array.from({ length: 10 }, (_, i) => {
      const baseTime = Date.now() - i * 600000; // 10 minutes apart
      return {
        id: i + 1,
        vehicle_id: (i % 5) + 1,
        driver_id: (i % 5) + 1,
        timestamp: new Date(baseTime).toISOString(),
        latitude: 14.7645 + (Math.random() - 0.5) * 0.05,
        longitude: -17.3660 + (Math.random() - 0.5) * 0.05,
        speed: 20 + Math.floor(Math.random() * 80),
        fuel_level: 50 + Math.floor(Math.random() * 50),
        temperature: 25 + Math.floor(Math.random() * 15),
      };
    });
    
    return { vehicles, drivers, incidents, violations, telemetry };
  }

  /**
   * Handle WebSocket closure
   * @param {WebSocket} ws - WebSocket client
   * @param {number} code - Close code
   * @param {string} reason - Close reason
   */
  handleClose(ws, code, reason) {
    const client = this.clients.get(ws);
    console.log(`Client disconnected${client ? ` (${client.id})` : ''} - Code: ${code}, Reason: ${reason || 'No reason provided'}`);
    this.clients.delete(ws);
  }

  /**
   * Broadcast message to all connected clients
   * @param {string} type - Message type
   * @param {Object} data - Message data
   * @param {Array<string>} channels - Optional: Only broadcast to clients subscribed to these channels
   */
  broadcast(type, data, channels = []) {
    const message = JSON.stringify({ 
      type, 
      ...data,
      timestamp: new Date().toISOString(),
      broadcast: true
    });
    
    let sentCount = 0;
    this.clients.forEach((client, ws) => {
      // Skip clients that are not subscribed to any of the specified channels
      if (channels.length > 0 && (!client.subscriptions || !channels.some(ch => client.subscriptions.includes(ch)))) {
        return;
      }
      
      if (ws.readyState === WebSocket.OPEN) {
        try {
          ws.send(message);
          sentCount++;
        } catch (e) {
          console.error(`Error broadcasting to client ${client.id}:`, e.message);
        }
      }
    });
    
    console.log(`📢 Broadcast sent to ${sentCount} clients${channels.length > 0 ? ` in channels: ${channels.join(', ')}` : ''}`);
  }
}

module.exports = (server) => new WebSocketService(server);
