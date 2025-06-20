/**
 * Quick Chrome Fix - Immediate diagnostic and fix for Chrome runtime.lastError
 * 
 * Run this script in the browser console for immediate help with Chrome WebSocket issues.
 */

(function() {
  'use strict';
  
  console.group('🚀 Quick Chrome Fix - Runtime.lastError Diagnostic');
  
  // 1. Immediate environment check
  console.log('🌐 Browser:', navigator.userAgent);
  console.log('🔗 URL:', window.location.href);
  console.log('⏰ Time:', new Date().toISOString());
  
  // 2. Check for Chrome-specific issues
  const issues = [];
  
  // Check DevTools
  const devToolsOpen = window.outerWidth - window.innerWidth > 160 || 
                      window.outerHeight - window.innerHeight > 160;
  if (devToolsOpen) {
    issues.push('DevTools is open');
    console.warn('⚠️ DevTools is open - this can cause WebSocket issues');
  }
  
  // Check for Chrome extension APIs
  if (typeof chrome !== 'undefined' && chrome.runtime) {
    issues.push('Chrome extension APIs detected');
    console.warn('⚠️ Chrome extension APIs detected - may cause runtime.lastError');
  }
  
  // Check for Service Workers
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(registrations => {
      if (registrations.length > 0) {
        issues.push(`${registrations.length} service worker(s) active`);
        console.warn(`⚠️ ${registrations.length} service worker(s) detected`);
      }
    });
  }
  
  // 3. Immediate fixes
  console.group('🔧 Applying Immediate Fixes');
  
  // Fix 1: Override runtime.lastError if it exists
  if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.lastError) {
    const originalLastError = chrome.runtime.lastError;
    Object.defineProperty(chrome.runtime, 'lastError', {
      get: function() {
        const error = originalLastError;
        if (error && error.message) {
          console.warn('🔧 Intercepted runtime.lastError:', error.message);
        }
        return error;
      },
      set: function(value) {
        originalLastError = value;
      }
    });
    console.log('✅ Runtime.lastError interception active');
  }
  
  // Fix 2: Monitor WebSocket connections
  const originalWebSocket = window.WebSocket;
  window.WebSocket = function(url, protocols) {
    console.log('🔧 Creating WebSocket connection to:', url);
    
    const ws = new originalWebSocket(url, protocols);
    
    ws.addEventListener('error', (error) => {
      console.warn('🔧 WebSocket error detected:', error);
      if (error.message && error.message.includes('runtime.lastError')) {
        console.error('🚨 Runtime.lastError in WebSocket detected!');
        console.log('💡 Try these solutions:');
        console.log('   1. Close DevTools (F12)');
        console.log('   2. Use incognito mode (Ctrl+Shift+N)');
        console.log('   3. Disable extensions (chrome://extensions/)');
      }
    });
    
    return ws;
  };
  
  // Copy static properties
  Object.setPrototypeOf(window.WebSocket, originalWebSocket);
  Object.assign(window.WebSocket, originalWebSocket);
  
  console.log('✅ WebSocket monitoring active');
  console.groupEnd();
  
  // 4. Quick solutions
  console.group('💡 Quick Solutions');
  
  if (issues.length === 0) {
    console.log('✅ No obvious issues detected');
  } else {
    console.log('⚠️ Issues detected:', issues);
  }
  
  console.log('🚀 Quick fixes to try:');
  console.log('1. Press F12 to close DevTools, then reload');
  console.log('2. Press Ctrl+Shift+N (Cmd+Shift+N on Mac) for incognito mode');
  console.log('3. Go to chrome://extensions/ and disable all extensions');
  console.log('4. Press Ctrl+Shift+Delete to clear browser data');
  console.log('5. Restart Chrome browser');
  
  console.groupEnd();
  
  // 5. Create helper functions
  window.quickChromeFix = {
    // Force reload without cache
    hardReload: () => {
      console.log('🔄 Performing hard reload...');
      window.location.reload(true);
    },
    
    // Clear all WebSocket connections
    clearWebSockets: () => {
      console.log('🧹 Clearing WebSocket connections...');
      // This will trigger cleanup in the WebSocket manager
      if (window.webSocketManager) {
        window.webSocketManager.closeAllConnections();
      }
    },
    
    // Test WebSocket connection
    testWebSocket: () => {
      console.log('🧪 Testing WebSocket connection...');
      const testUrl = `ws://${window.location.host}/ws`;
      const ws = new WebSocket(testUrl);
      
      ws.onopen = () => {
        console.log('✅ WebSocket test successful');
        ws.close();
      };
      
      ws.onerror = (error) => {
        console.error('❌ WebSocket test failed:', error);
      };
      
      setTimeout(() => {
        if (ws.readyState === WebSocket.CONNECTING) {
          console.log('⏰ WebSocket test timeout');
          ws.close();
        }
      }, 5000);
    },
    
    // Get detailed status
    getStatus: () => {
      console.group('📊 Quick Chrome Fix Status');
      console.log('Issues detected:', issues);
      console.log('DevTools open:', devToolsOpen);
      console.log('Chrome extension APIs:', typeof chrome !== 'undefined' && chrome.runtime);
      console.log('Service Workers:', 'serviceWorker' in navigator);
      console.log('WebSocket override:', window.WebSocket !== originalWebSocket);
      console.groupEnd();
    }
  };
  
  console.log('🎯 Helper functions available:');
  console.log('- quickChromeFix.hardReload() - Force reload');
  console.log('- quickChromeFix.clearWebSockets() - Clear connections');
  console.log('- quickChromeFix.testWebSocket() - Test connection');
  console.log('- quickChromeFix.getStatus() - Get detailed status');
  
  console.groupEnd();
  
  // 6. Auto-run test if no issues detected
  if (issues.length === 0) {
    setTimeout(() => {
      console.log('🧪 Auto-running WebSocket test...');
      window.quickChromeFix.testWebSocket();
    }, 2000);
  }
  
})(); 