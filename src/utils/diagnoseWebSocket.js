/**
 * WebSocket Diagnostic Script
 * 
 * Run this script in the browser console to diagnose WebSocket connection issues
 * and runtime.lastError problems.
 */

async function diagnoseWebSocketIssues() {
  console.group('🔍 WebSocket Diagnostic Report');
  
  // 1. Check browser environment
  console.group('🌐 Browser Environment');
  console.log('User Agent:', navigator.userAgent);
  console.log('Protocol:', window.location.protocol);
  console.log('Host:', window.location.host);
  console.log('URL:', window.location.href);
  console.groupEnd();
  
  // 2. Check for browser extensions
  console.group('🔧 Browser Extensions');
  const extensionInfo = {
    hasChromeRuntime: typeof chrome !== 'undefined' && chrome.runtime,
    hasBrowserRuntime: typeof browser !== 'undefined' && browser.runtime,
    hasSafariExtension: typeof safari !== 'undefined' && safari.extension,
    inExtensionContext: window.location.href.includes('chrome-extension://') || 
                       window.location.href.includes('moz-extension://') ||
                       window.location.href.includes('safari-extension://')
  };
  console.log('Extension Detection:', extensionInfo);
  
  if (extensionInfo.hasChromeRuntime) {
    try {
      console.log('Chrome Runtime ID:', chrome.runtime.id);
      console.log('Chrome Runtime URL:', chrome.runtime.getURL(''));
    } catch (e) {
      console.log('Chrome Runtime Error:', e.message);
    }
  }
  console.groupEnd();
  
  // 3. Check WebSocket support
  console.group('🔌 WebSocket Support');
  console.log('WebSocket Supported:', typeof WebSocket !== 'undefined');
  if (typeof WebSocket !== 'undefined') {
    console.log('WebSocket Ready States:', {
      CONNECTING: WebSocket.CONNECTING,
      OPEN: WebSocket.OPEN,
      CLOSING: WebSocket.CLOSING,
      CLOSED: WebSocket.CLOSED
    });
  }
  console.groupEnd();
  
  // 4. Check for active WebSocket connections
  console.group('📡 Active Connections');
  try {
    // Try to import and use WebSocket manager
    const webSocketManager = await import('../services/utils/WebSocketManager.js');
    const manager = webSocketManager.default;
    
    console.log('Active Connections:', manager.getActiveConnections());
    console.log('Connection Count:', manager.getConnectionCount());
    
    const connections = manager.getActiveConnections();
    connections.forEach(id => {
      const state = manager.getConnectionState(id);
      console.log(`Connection ${id}:`, state);
    });
  } catch (error) {
    console.log('WebSocket Manager not available:', error.message);
  }
  console.groupEnd();
  
  // 5. Test WebSocket connectivity
  console.group('🧪 Connectivity Test');
  const testUrl = `ws://${window.location.host}/ws`;
  console.log('Testing connection to:', testUrl);
  
  try {
    const testSocket = new WebSocket(testUrl);
    
    testSocket.onopen = () => {
      console.log('✅ Test connection successful');
      testSocket.close();
    };
    
    testSocket.onerror = (error) => {
      console.log('❌ Test connection failed:', error);
    };
    
    testSocket.onclose = (event) => {
      console.log('🔒 Test connection closed:', event.code, event.reason);
    };
    
    // Timeout after 5 seconds
    setTimeout(() => {
      if (testSocket.readyState === WebSocket.CONNECTING) {
        console.log('⏰ Test connection timeout');
        testSocket.close();
      }
    }, 5000);
    
  } catch (error) {
    console.log('❌ Failed to create test connection:', error);
  }
  console.groupEnd();
  
  // 6. Check for runtime.lastError patterns
  console.group('⚠️ Runtime.lastError Analysis');
  const errorPatterns = [
    'runtime.lastError',
    'could not establish connection',
    'receiving end does not exist',
    'extension',
    'content script'
  ];
  
  console.log('Looking for error patterns in console history...');
  console.log('Note: Check the console for any recent errors matching these patterns:');
  errorPatterns.forEach(pattern => {
    console.log(`- ${pattern}`);
  });
  console.groupEnd();
  
  // 7. Recommendations
  console.group('💡 Recommendations');
  
  if (extensionInfo.inExtensionContext) {
    console.warn('⚠️ Running in extension context - this may cause WebSocket issues');
    console.log('Recommendation: Access the application directly via URL');
  }
  
  if (extensionInfo.hasChromeRuntime || extensionInfo.hasBrowserRuntime) {
    console.warn('⚠️ Browser extension APIs detected');
    console.log('Recommendation: Try incognito/private mode to disable extensions');
  }
  
  console.log('General recommendations:');
  console.log('1. Clear browser cache and reload');
  console.log('2. Disable browser extensions temporarily');
  console.log('3. Check network connectivity');
  console.log('4. Restart the application server');
  console.log('5. Check server logs for errors');
  
  console.groupEnd();
  
  console.groupEnd();
  
  return {
    extensionInfo,
    recommendations: [
      'Check console for runtime.lastError messages',
      'Try incognito mode to disable extensions',
      'Clear browser cache and reload',
      'Restart the application server'
    ]
  };
}

// Auto-run diagnosis if called directly
if (typeof window !== 'undefined') {
  // Make function globally available
  window.diagnoseWebSocketIssues = diagnoseWebSocketIssues;
  
  // Auto-run after a short delay
  setTimeout(() => {
    console.log('🔍 Running automatic WebSocket diagnosis...');
    diagnoseWebSocketIssues();
  }, 2000);
}

export default diagnoseWebSocketIssues; 