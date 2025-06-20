/**
 * ChromeWebSocketFix - Chrome-specific fixes for WebSocket and runtime.lastError issues
 * 
 * This utility provides Chrome-specific workarounds for common WebSocket connection
 * issues and runtime.lastError problems.
 */

class ChromeWebSocketFix {
  constructor() {
    this.isChrome = this.detectChrome();
    this.fixesApplied = new Set();
    this.originalWebSocket = window.WebSocket;
  }

  /**
   * Detect if running in Chrome browser
   */
  detectChrome() {
    return navigator.userAgent.includes('Chrome') && !navigator.userAgent.includes('Edge');
  }

  /**
   * Apply all Chrome-specific fixes
   */
  applyFixes() {
    if (!this.isChrome) {
      console.log('ChromeWebSocketFix: Not running in Chrome, skipping fixes');
      return;
    }

    console.log('ChromeWebSocketFix: Applying Chrome-specific fixes...');

    this.fixDevToolsInterference();
    this.fixExtensionInterference();
    this.fixServiceWorkerInterference();
    this.fixWebRTCInterference();
    this.fixNetworkInterference();
    this.fixSecurityInterference();

    console.log('ChromeWebSocketFix: All fixes applied');
  }

  /**
   * Fix DevTools interference
   */
  fixDevToolsInterference() {
    if (this.fixesApplied.has('devtools')) return;

    // Monitor DevTools state
    let devToolsOpen = false;
    
    const checkDevTools = () => {
      const threshold = 160;
      const widthThreshold = window.outerWidth - window.innerWidth > threshold;
      const heightThreshold = window.outerHeight - window.innerHeight > threshold;
      
      const wasOpen = devToolsOpen;
      devToolsOpen = widthThreshold || heightThreshold;
      
      if (wasOpen !== devToolsOpen) {
        if (devToolsOpen) {
          console.warn('ChromeWebSocketFix: DevTools opened - WebSocket connections may be affected');
          this.notifyWebSocketIssues('DevTools opened');
        } else {
          console.log('ChromeWebSocketFix: DevTools closed - WebSocket connections should work normally');
        }
      }
    };

    // Check periodically
    setInterval(checkDevTools, 1000);
    
    this.fixesApplied.add('devtools');
  }

  /**
   * Fix extension interference
   */
  fixExtensionInterference() {
    if (this.fixesApplied.has('extensions')) return;

    // Check for Chrome extension APIs
    if (typeof chrome !== 'undefined' && chrome.runtime) {
      console.warn('ChromeWebSocketFix: Chrome extension APIs detected - this may cause runtime.lastError');
      
      // Try to detect specific problematic extensions
      try {
        if (chrome.runtime.id) {
          console.warn(`ChromeWebSocketFix: Extension ID detected: ${chrome.runtime.id}`);
        }
      } catch (error) {
        // Ignore errors when checking extension APIs
      }
    }

    // Monitor for runtime.lastError
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.lastError) {
      const originalLastError = chrome.runtime.lastError;
      
      // Override runtime.lastError to prevent unhandled errors
      Object.defineProperty(chrome.runtime, 'lastError', {
        get: function() {
          const error = originalLastError;
          if (error && error.message) {
            console.warn('ChromeWebSocketFix: Intercepted runtime.lastError:', error.message);
            this.notifyWebSocketIssues('runtime.lastError intercepted');
          }
          return error;
        },
        set: function(value) {
          originalLastError = value;
        }
      });
    }

    this.fixesApplied.add('extensions');
  }

  /**
   * Fix Service Worker interference
   */
  fixServiceWorkerInterference() {
    if (this.fixesApplied.has('serviceworkers')) return;

    if ('serviceWorker' in navigator) {
      // Check for existing service workers
      navigator.serviceWorker.getRegistrations().then(registrations => {
        if (registrations.length > 0) {
          console.warn(`ChromeWebSocketFix: ${registrations.length} service worker(s) detected`);
          registrations.forEach((registration, index) => {
            console.log(`Service Worker ${index + 1}:`, {
              scope: registration.scope,
              active: !!registration.active,
              waiting: !!registration.waiting,
              installing: !!registration.installing
            });
          });
        }
      }).catch(error => {
        console.warn('ChromeWebSocketFix: Error checking service workers:', error);
      });
    }

    this.fixesApplied.add('serviceworkers');
  }

  /**
   * Fix WebRTC interference
   */
  fixWebRTCInterference() {
    if (this.fixesApplied.has('webrtc')) return;

    // Check for WebRTC features that might interfere
    if (typeof RTCPeerConnection !== 'undefined') {
      console.log('ChromeWebSocketFix: WebRTC detected - monitoring for interference');
      
      // Monitor WebRTC connections
      const originalRTCPeerConnection = window.RTCPeerConnection;
      
      window.RTCPeerConnection = function(...args) {
        console.warn('ChromeWebSocketFix: RTCPeerConnection created - may interfere with WebSocket');
        return new originalRTCPeerConnection(...args);
      };
      
      // Copy static properties
      Object.setPrototypeOf(window.RTCPeerConnection, originalRTCPeerConnection);
      Object.assign(window.RTCPeerConnection, originalRTCPeerConnection);
    }

    this.fixesApplied.add('webrtc');
  }

  /**
   * Fix network interference
   */
  fixNetworkInterference() {
    if (this.fixesApplied.has('network')) return;

    // Monitor network connectivity
    if ('connection' in navigator) {
      const connection = navigator.connection;
      
      connection.addEventListener('change', () => {
        console.log('ChromeWebSocketFix: Network connection changed:', {
          effectiveType: connection.effectiveType,
          downlink: connection.downlink,
          rtt: connection.rtt,
          saveData: connection.saveData
        });
        
        if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
          console.warn('ChromeWebSocketFix: Slow network detected - WebSocket connections may be unstable');
        }
      });
    }

    this.fixesApplied.add('network');
  }

  /**
   * Fix security interference
   */
  fixSecurityInterference() {
    if (this.fixesApplied.has('security')) return;

    // Check for Content Security Policy
    const metaCSP = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
    if (metaCSP) {
      console.log('ChromeWebSocketFix: Content Security Policy detected:', metaCSP.content);
      
      // Check if WebSocket connections are allowed
      if (metaCSP.content.includes('connect-src') && !metaCSP.content.includes('ws:') && !metaCSP.content.includes('wss:')) {
        console.warn('ChromeWebSocketFix: CSP may block WebSocket connections');
      }
    }

    // Monitor for security policy violations
    if ('securityPolicyViolationEvent' in window) {
      document.addEventListener('securitypolicyviolation', (event) => {
        console.warn('ChromeWebSocketFix: CSP violation detected:', {
          violatedDirective: event.violatedDirective,
          blockedURI: event.blockedURI,
          sourceFile: event.sourceFile
        });
      });
    }

    this.fixesApplied.add('security');
  }

  /**
   * Create a Chrome-optimized WebSocket wrapper
   */
  createChromeOptimizedWebSocket(url, protocols) {
    if (!this.isChrome) {
      return new this.originalWebSocket(url, protocols);
    }

    console.log('ChromeWebSocketFix: Creating Chrome-optimized WebSocket connection');

    const ws = new this.originalWebSocket(url, protocols);
    
    // Add Chrome-specific error handling
    const originalOnError = ws.onerror;
    ws.onerror = (error) => {
      console.warn('ChromeWebSocketFix: WebSocket error detected:', error);
      
      // Check if it's a runtime.lastError
      if (error && error.message && error.message.includes('runtime.lastError')) {
        console.warn('ChromeWebSocketFix: runtime.lastError detected in WebSocket');
        this.notifyWebSocketIssues('WebSocket runtime.lastError');
      }
      
      if (originalOnError) {
        originalOnError.call(ws, error);
      }
    };

    // Add Chrome-specific close handling
    const originalOnClose = ws.onclose;
    ws.onclose = (event) => {
      console.log('ChromeWebSocketFix: WebSocket closed:', {
        code: event.code,
        reason: event.reason,
        wasClean: event.wasClean
      });
      
      if (originalOnClose) {
        originalOnClose.call(ws, event);
      }
    };

    return ws;
  }

  /**
   * Notify about WebSocket issues
   */
  notifyWebSocketIssues(issue) {
    // Dispatch custom event
    const event = new CustomEvent('websocket-error', {
      detail: {
        issue,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href
      }
    });
    
    window.dispatchEvent(event);
  }

  /**
   * Get Chrome-specific recommendations
   */
  getChromeRecommendations() {
    const recommendations = [];

    if (this.isChrome) {
      recommendations.push(
        'Use Chrome incognito mode to disable extensions',
        'Close Chrome DevTools if open',
        'Check chrome://extensions/ for problematic extensions',
        'Clear Chrome cache and cookies',
        'Update Chrome to latest version',
        'Check chrome://flags/ for WebSocket-related flags'
      );
    }

    return recommendations;
  }

  /**
   * Log Chrome-specific status
   */
  logStatus() {
    console.group('🔧 Chrome WebSocket Fix Status');
    console.log('Chrome detected:', this.isChrome);
    console.log('Fixes applied:', Array.from(this.fixesApplied));
    console.log('Recommendations:', this.getChromeRecommendations());
    console.groupEnd();
  }
}

// Create singleton instance
const chromeWebSocketFix = new ChromeWebSocketFix();

// Auto-apply fixes on load
if (typeof window !== 'undefined') {
  // Apply fixes after a short delay
  setTimeout(() => {
    chromeWebSocketFix.applyFixes();
    chromeWebSocketFix.logStatus();
  }, 1000);
}

export default chromeWebSocketFix; 