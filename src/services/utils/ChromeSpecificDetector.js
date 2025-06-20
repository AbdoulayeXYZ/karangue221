/**
 * ChromeSpecificDetector - Detects Chrome-specific features that might cause runtime.lastError
 * 
 * This utility specifically targets Chrome browser features that can interfere
 * with WebSocket connections and cause runtime.lastError issues.
 */

class ChromeSpecificDetector {
  constructor() {
    this.chromeFeatures = new Map();
    this.detectedIssues = [];
  }

  /**
   * Detect Chrome-specific features that might cause runtime.lastError
   */
  detectChromeFeatures() {
    const features = {
      // Chrome DevTools
      hasDevTools: this.detectDevTools(),
      
      // Chrome Extensions
      hasExtensions: this.detectChromeExtensions(),
      
      // Chrome Service Workers
      hasServiceWorkers: this.detectServiceWorkers(),
      
      // Chrome's internal messaging
      hasInternalMessaging: this.detectInternalMessaging(),
      
      // Chrome's WebRTC features
      hasWebRTC: this.detectWebRTC(),
      
      // Chrome's WebSocket implementation
      hasWebSocketIssues: this.detectWebSocketIssues(),
      
      // Chrome's security features
      hasSecurityFeatures: this.detectSecurityFeatures(),
      
      // Chrome's network features
      hasNetworkFeatures: this.detectNetworkFeatures()
    };

    this.chromeFeatures = new Map(Object.entries(features));
    return features;
  }

  /**
   * Detect if Chrome DevTools is open
   */
  detectDevTools() {
    const devtools = {
      isOpen: false,
      orientation: null,
      size: null
    };

    // Method 1: Check window size
    const threshold = 160;
    const widthThreshold = window.outerWidth - window.innerWidth > threshold;
    const heightThreshold = window.outerHeight - window.innerHeight > threshold;
    
    if (widthThreshold || heightThreshold) {
      devtools.isOpen = true;
      devtools.orientation = widthThreshold ? 'vertical' : 'horizontal';
    }

    // Method 2: Check console timing
    const start = performance.now();
    console.log('%c', 'color: transparent');
    const end = performance.now();
    if (end - start > 100) {
      devtools.isOpen = true;
    }

    return devtools;
  }

  /**
   * Detect Chrome extensions more thoroughly
   */
  detectChromeExtensions() {
    const extensions = {
      hasRuntimeAPI: typeof chrome !== 'undefined' && chrome.runtime,
      hasExtensionAPI: typeof chrome !== 'undefined' && chrome.extension,
      hasTabsAPI: typeof chrome !== 'undefined' && chrome.tabs,
      hasWebRequestAPI: typeof chrome !== 'undefined' && chrome.webRequest,
      extensionIds: [],
      contentScripts: []
    };

    if (extensions.hasRuntimeAPI) {
      try {
        // Check for extension ID
        if (chrome.runtime.id) {
          extensions.extensionIds.push(chrome.runtime.id);
        }

        // Check for content scripts
        if (chrome.runtime.onMessage) {
          extensions.contentScripts.push('runtime.onMessage');
        }

        // Check for background scripts
        if (chrome.runtime.onInstalled) {
          extensions.contentScripts.push('runtime.onInstalled');
        }
      } catch (error) {
        console.warn('Error detecting Chrome extensions:', error);
      }
    }

    return extensions;
  }

  /**
   * Detect Service Workers
   */
  detectServiceWorkers() {
    const serviceWorkers = {
      hasServiceWorker: 'serviceWorker' in navigator,
      hasPushManager: 'PushManager' in window,
      hasNotification: 'Notification' in window,
      registrations: []
    };

    if (serviceWorkers.hasServiceWorker) {
      navigator.serviceWorker.getRegistrations().then(registrations => {
        serviceWorkers.registrations = registrations.map(reg => ({
          scope: reg.scope,
          active: !!reg.active,
          waiting: !!reg.waiting,
          installing: !!reg.installing
        }));
      }).catch(error => {
        console.warn('Error getting service worker registrations:', error);
      });
    }

    return serviceWorkers;
  }

  /**
   * Detect Chrome's internal messaging system
   */
  detectInternalMessaging() {
    const messaging = {
      hasPostMessage: typeof window.postMessage === 'function',
      hasMessageEvent: typeof MessageEvent !== 'undefined',
      hasBroadcastChannel: typeof BroadcastChannel !== 'undefined',
      hasSharedWorker: typeof SharedWorker !== 'undefined',
      hasWorker: typeof Worker !== 'undefined'
    };

    return messaging;
  }

  /**
   * Detect WebRTC features that might interfere
   */
  detectWebRTC() {
    const webrtc = {
      hasRTCPeerConnection: typeof RTCPeerConnection !== 'undefined',
      hasRTCDataChannel: typeof RTCDataChannel !== 'undefined',
      hasGetUserMedia: typeof navigator.mediaDevices !== 'undefined' && 
                      typeof navigator.mediaDevices.getUserMedia === 'function',
      hasGetDisplayMedia: typeof navigator.mediaDevices !== 'undefined' && 
                         typeof navigator.mediaDevices.getDisplayMedia === 'function'
    };

    return webrtc;
  }

  /**
   * Detect WebSocket implementation issues
   */
  detectWebSocketIssues() {
    const websocket = {
      hasWebSocket: typeof WebSocket !== 'undefined',
      readyStates: {
        CONNECTING: WebSocket.CONNECTING,
        OPEN: WebSocket.OPEN,
        CLOSING: WebSocket.CLOSING,
        CLOSED: WebSocket.CLOSED
      },
      hasBinaryType: false,
      hasExtensions: false,
      hasProtocol: false
    };

    if (websocket.hasWebSocket) {
      // Check WebSocket properties without making actual connections
      try {
        // Create a mock WebSocket object to check properties
        const mockWs = {
          binaryType: 'blob',
          extensions: '',
          protocol: ''
        };
        
        websocket.hasBinaryType = 'binaryType' in mockWs;
        websocket.hasExtensions = 'extensions' in mockWs;
        websocket.hasProtocol = 'protocol' in mockWs;
      } catch (error) {
        // Fallback to basic checks
        websocket.hasBinaryType = 'binaryType' in WebSocket.prototype;
        websocket.hasExtensions = 'extensions' in WebSocket.prototype;
        websocket.hasProtocol = 'protocol' in WebSocket.prototype;
      }
    }

    return websocket;
  }

  /**
   * Detect Chrome's security features
   */
  detectSecurityFeatures() {
    const security = {
      hasCSP: 'securityPolicyViolationEvent' in window,
      hasTrustedTypes: typeof TrustedTypes !== 'undefined',
      hasCredentialManager: typeof navigator.credentials !== 'undefined',
      hasPermissions: typeof navigator.permissions !== 'undefined',
      hasClipboard: typeof navigator.clipboard !== 'undefined'
    };

    return security;
  }

  /**
   * Detect Chrome's network features
   */
  detectNetworkFeatures() {
    const network = {
      hasFetch: typeof fetch !== 'undefined',
      hasXMLHttpRequest: typeof XMLHttpRequest !== 'undefined',
      hasBeacon: typeof navigator.sendBeacon === 'function',
      hasConnection: typeof navigator.connection !== 'undefined',
      hasNetworkInformation: typeof NetworkInformation !== 'undefined'
    };

    return network;
  }

  /**
   * Analyze potential causes of runtime.lastError
   */
  analyzeRuntimeLastError() {
    const analysis = {
      likelyCauses: [],
      recommendations: [],
      severity: 'low'
    };

    const features = this.detectChromeFeatures();

    // Check DevTools
    if (features.hasDevTools.isOpen) {
      analysis.likelyCauses.push('Chrome DevTools is open');
      analysis.recommendations.push('Close Chrome DevTools and reload the page');
      analysis.severity = 'medium';
    }

    // Check Extensions
    if (features.hasExtensions.hasRuntimeAPI) {
      analysis.likelyCauses.push('Chrome extension APIs detected');
      analysis.recommendations.push('Try incognito mode to disable extensions');
      analysis.severity = 'high';
    }

    // Check Service Workers
    if (features.hasServiceWorkers.hasServiceWorker) {
      analysis.likelyCauses.push('Service Workers detected');
      analysis.recommendations.push('Check for service worker conflicts');
      analysis.severity = 'medium';
    }

    // Check WebRTC
    if (features.hasWebRTC.hasRTCPeerConnection) {
      analysis.likelyCauses.push('WebRTC features detected');
      analysis.recommendations.push('WebRTC might interfere with WebSocket connections');
      analysis.severity = 'low';
    }

    return analysis;
  }

  /**
   * Get specific Chrome troubleshooting steps
   */
  getChromeTroubleshootingSteps() {
    return [
      {
        step: 1,
        title: 'Close Chrome DevTools',
        description: 'Chrome DevTools can interfere with WebSocket connections',
        action: 'Press F12 to close DevTools, then reload the page'
      },
      {
        step: 2,
        title: 'Use Incognito Mode',
        description: 'Incognito mode disables most extensions',
        action: 'Press Ctrl+Shift+N (or Cmd+Shift+N on Mac) to open incognito window'
      },
      {
        step: 3,
        title: 'Disable Extensions',
        description: 'Chrome extensions can cause runtime.lastError',
        action: 'Go to chrome://extensions/ and disable all extensions temporarily'
      },
      {
        step: 4,
        title: 'Clear Browser Data',
        description: 'Clear cache and cookies that might be corrupted',
        action: 'Press Ctrl+Shift+Delete (or Cmd+Shift+Delete on Mac) and clear browsing data'
      },
      {
        step: 5,
        title: 'Check Chrome Flags',
        description: 'Some Chrome flags can affect WebSocket behavior',
        action: 'Go to chrome://flags/ and search for "websocket" or "network"'
      },
      {
        step: 6,
        title: 'Update Chrome',
        description: 'Older Chrome versions might have WebSocket bugs',
        action: 'Go to chrome://settings/help to check for updates'
      }
    ];
  }

  /**
   * Log comprehensive Chrome analysis
   */
  logChromeAnalysis() {
    const features = this.detectChromeFeatures();
    const analysis = this.analyzeRuntimeLastError();
    const steps = this.getChromeTroubleshootingSteps();

    console.group('🔍 Chrome-Specific Analysis');
    
    console.group('📊 Detected Features');
    Object.entries(features).forEach(([key, value]) => {
      console.log(`${key}:`, value);
    });
    console.groupEnd();

    console.group('⚠️ Runtime.lastError Analysis');
    console.log('Likely Causes:', analysis.likelyCauses);
    console.log('Severity:', analysis.severity);
    console.log('Recommendations:', analysis.recommendations);
    console.groupEnd();

    console.group('🛠️ Troubleshooting Steps');
    steps.forEach(step => {
      console.log(`${step.step}. ${step.title}`);
      console.log(`   ${step.description}`);
      console.log(`   Action: ${step.action}`);
    });
    console.groupEnd();

    console.groupEnd();

    return {
      features,
      analysis,
      steps
    };
  }
}

// Create singleton instance
const chromeSpecificDetector = new ChromeSpecificDetector();

// Auto-detect on load
if (typeof window !== 'undefined') {
  // Delay detection to ensure page is fully loaded
  setTimeout(() => {
    chromeSpecificDetector.logChromeAnalysis();
  }, 1500);
}

export default chromeSpecificDetector; 