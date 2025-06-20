# Troubleshooting Guide

## Runtime.lastError: Could not establish connection. Receiving end does not exist.

This error typically occurs when there are issues with WebSocket connections or browser extension interference.

### Common Causes

1. **Browser Extension Interference**
   - Ad blockers
   - VPN extensions
   - Security extensions
   - Developer tools extensions
   - Content script conflicts

2. **WebSocket Connection Issues**
   - Multiple simultaneous connections
   - Improper connection cleanup
   - Network connectivity problems
   - Server-side connection limits

3. **Browser Context Issues**
   - Running in extension context
   - Content script execution
   - Background script communication

### Solutions

#### 1. Browser Extension Troubleshooting

**Step 1: Identify Interfering Extensions**
```javascript
// Open browser console and run:
import('./services/utils/BrowserExtensionDetector.js').then(module => {
  const detector = module.default;
  detector.logDetectionInfo();
});
```

**Step 2: Temporarily Disable Extensions**
1. Open browser settings
2. Go to Extensions/Add-ons
3. Disable all extensions temporarily
4. Test the application
5. Re-enable extensions one by one to identify the problematic one

**Step 3: Use Incognito/Private Mode**
- Test the application in incognito/private browsing mode
- This disables most extensions by default

#### 2. WebSocket Connection Management

**Step 1: Check Connection Status**
```javascript
// In browser console:
import('./services/utils/WebSocketManager.js').then(module => {
  const manager = module.default;
  console.log('Active connections:', manager.getActiveConnections());
  console.log('Connection count:', manager.getConnectionCount());
});
```

**Step 2: Force Cleanup**
```javascript
// Force close all WebSocket connections:
import('./services/utils/WebSocketManager.js').then(module => {
  const manager = module.default;
  manager.closeAllConnections();
});
```

#### 3. Network and Server Issues

**Step 1: Check Server Status**
```bash
# Check if the backend server is running
curl http://localhost:5001/api/health

# Check WebSocket endpoint
curl -i -N -H "Connection: Upgrade" -H "Upgrade: websocket" -H "Sec-WebSocket-Version: 13" -H "Sec-WebSocket-Key: x3JJHMbDL1EzLkh9GBhXDw==" http://localhost:5001/ws
```

**Step 2: Check Network Connectivity**
```bash
# Test WebSocket connection
wscat -c ws://localhost:5001/ws
```

#### 4. Application-Specific Solutions

**Step 1: Clear Browser Cache**
1. Open browser developer tools (F12)
2. Right-click on refresh button
3. Select "Empty Cache and Hard Reload"

**Step 2: Check Console for Errors**
1. Open browser developer tools (F12)
2. Go to Console tab
3. Look for WebSocket-related errors
4. Check for extension-related warnings

**Step 3: Restart Application**
```bash
# Stop the application
Ctrl+C

# Clear any remaining processes
pkill -f "node.*app.js"

# Restart the application
cd backend && npm start
```

### Prevention Measures

#### 1. Use WebSocket Manager
The application now includes a centralized WebSocket manager that:
- Prevents multiple simultaneous connections
- Handles connection cleanup properly
- Provides connection state monitoring
- Implements proper error handling

#### 2. Browser Extension Detection
The application automatically detects browser extension interference and:
- Logs detection information
- Provides recommendations
- Handles runtime.lastError gracefully

#### 3. Connection Monitoring
Monitor WebSocket connections in real-time:
```javascript
// Add to any component:
import webSocketManager from '../services/utils/WebSocketManager';

// Monitor connections
setInterval(() => {
  console.log('Active connections:', webSocketManager.getActiveConnections());
}, 5000);
```

### Debug Information

#### Enable Debug Logging
```javascript
// In browser console:
localStorage.setItem('debug', 'websocket:*');
location.reload();
```

#### Check Connection States
```javascript
// Get detailed connection information:
import('./services/utils/WebSocketManager.js').then(module => {
  const manager = module.default;
  const connections = manager.getActiveConnections();
  
  connections.forEach(id => {
    const state = manager.getConnectionState(id);
    console.log(`Connection ${id}:`, state);
  });
});
```

### Common Error Messages and Solutions

| Error Message | Cause | Solution |
|---------------|-------|----------|
| `runtime.lastError: Could not establish connection` | Browser extension interference | Disable extensions, use incognito mode |
| `WebSocket connection closed unexpectedly` | Network issues, server restart | Check server status, restart application |
| `Connection timeout` | Server overload, network latency | Increase timeout, check server resources |
| `Authentication failed` | Invalid token, expired session | Re-login, check token validity |

### Getting Help

If the issue persists:

1. **Collect Debug Information**
   ```javascript
   // Run in browser console:
   console.log('User Agent:', navigator.userAgent);
   console.log('Extensions:', browserExtensionDetector.getExtensionInterferenceInfo());
   console.log('WebSocket State:', webSocketManager.getConnectionCount());
   ```

2. **Check Server Logs**
   ```bash
   # View backend logs
   tail -f backend/app.js
   ```

3. **Report Issue**
   - Include browser type and version
   - List active extensions
   - Provide console error logs
   - Include network connectivity information

### Additional Resources

- [WebSocket API Documentation](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
- [Chrome Extension Troubleshooting](https://developer.chrome.com/docs/extensions/mv3/troubleshooting/)
- [Browser Extension Best Practices](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Best_practices) 