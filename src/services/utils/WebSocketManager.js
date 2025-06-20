/**
 * WebSocketManager - Centralized WebSocket connection management
 * 
 * This utility helps prevent connection conflicts and runtime.lastError issues
 * by managing all WebSocket connections centrally.
 */

class WebSocketManager {
  constructor() {
    this.connections = new Map();
    this.connectionStates = new Map();
  }

  /**
   * Create a new WebSocket connection with proper error handling
   * @param {string} id - Unique identifier for the connection
   * @param {string} url - WebSocket URL
   * @param {Object} options - Connection options
   * @returns {Promise<WebSocket>} WebSocket instance
   */
  async createConnection(id, url, options = {}) {
    // Check if connection already exists
    if (this.connections.has(id)) {
      const existingConnection = this.connections.get(id);
      if (existingConnection.readyState === WebSocket.OPEN) {
        console.warn(`WebSocket connection ${id} already exists and is open`);
        return existingConnection;
      }
      
      // Close existing connection
      this.closeConnection(id);
    }

    return new Promise((resolve, reject) => {
      try {
        const ws = new WebSocket(url, options.protocols);
        
        // Set binary type if specified
        if (options.binaryType) {
          ws.binaryType = options.binaryType;
        }

        // Track connection state
        this.connectionStates.set(id, {
          connecting: true,
          connected: false,
          error: null
        });

        ws.onopen = () => {
          console.log(`WebSocket connection ${id} established`);
          this.connectionStates.set(id, {
            connecting: false,
            connected: true,
            error: null
          });
          resolve(ws);
        };

        ws.onerror = (error) => {
          console.error(`WebSocket error for connection ${id}:`, error);
          
          // Check for runtime.lastError
          if (error && error.message && error.message.includes('runtime.lastError')) {
            console.warn(`Runtime.lastError detected for connection ${id} - this may be a browser extension issue`);
          }
          
          this.connectionStates.set(id, {
            connecting: false,
            connected: false,
            error: error
          });
          
          if (!this.connections.has(id)) {
            reject(error);
          }
        };

        ws.onclose = (event) => {
          console.log(`WebSocket connection ${id} closed: ${event.code} ${event.reason}`);
          this.connectionStates.set(id, {
            connecting: false,
            connected: false,
            error: null
          });
          
          // Remove from connections map
          this.connections.delete(id);
        };

        // Store the connection
        this.connections.set(id, ws);
        
        // Set up timeout for connection
        const timeout = options.timeout || 10000;
        setTimeout(() => {
          if (this.connectionStates.get(id)?.connecting) {
            console.error(`WebSocket connection ${id} timeout`);
            this.closeConnection(id);
            reject(new Error('Connection timeout'));
          }
        }, timeout);

      } catch (error) {
        console.error(`Error creating WebSocket connection ${id}:`, error);
        reject(error);
      }
    });
  }

  /**
   * Close a WebSocket connection
   * @param {string} id - Connection identifier
   */
  closeConnection(id) {
    const connection = this.connections.get(id);
    if (connection) {
      try {
        if (connection.readyState === WebSocket.OPEN) {
          connection.close(1000, 'Manager disconnect');
        }
      } catch (error) {
        console.warn(`Error closing WebSocket connection ${id}:`, error);
      }
      this.connections.delete(id);
      this.connectionStates.delete(id);
    }
  }

  /**
   * Close all WebSocket connections
   */
  closeAllConnections() {
    for (const [id] of this.connections) {
      this.closeConnection(id);
    }
  }

  /**
   * Get connection state
   * @param {string} id - Connection identifier
   * @returns {Object} Connection state
   */
  getConnectionState(id) {
    return this.connectionStates.get(id) || {
      connecting: false,
      connected: false,
      error: null
    };
  }

  /**
   * Check if connection exists and is open
   * @param {string} id - Connection identifier
   * @returns {boolean} True if connection is open
   */
  isConnectionOpen(id) {
    const connection = this.connections.get(id);
    return connection && connection.readyState === WebSocket.OPEN;
  }

  /**
   * Send message through a connection
   * @param {string} id - Connection identifier
   * @param {any} data - Data to send
   * @returns {boolean} Success status
   */
  sendMessage(id, data) {
    const connection = this.connections.get(id);
    if (connection && connection.readyState === WebSocket.OPEN) {
      try {
        connection.send(data);
        return true;
      } catch (error) {
        console.error(`Error sending message through connection ${id}:`, error);
        return false;
      }
    }
    return false;
  }

  /**
   * Get all active connections
   * @returns {Array} Array of connection IDs
   */
  getActiveConnections() {
    return Array.from(this.connections.keys());
  }

  /**
   * Get connection count
   * @returns {number} Number of active connections
   */
  getConnectionCount() {
    return this.connections.size;
  }
}

// Create singleton instance
const webSocketManager = new WebSocketManager();

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  webSocketManager.closeAllConnections();
});

export default webSocketManager; 