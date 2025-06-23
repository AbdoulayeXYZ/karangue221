import React, { useEffect } from "react";
import Routes from "./Routes";
import { AuthProvider } from "./contexts/AuthContext";
import ExtensionErrorSuppressor from "./components/ExtensionErrorSuppressor";
import browserExtensionDetector from "./services/utils/BrowserExtensionDetector";
import chromeSpecificDetector from "./services/utils/ChromeSpecificDetector";
import chromeWebSocketFix from "./services/utils/ChromeWebSocketFix";

function App() {
  useEffect(() => {
    // Initialize browser extension detection
    browserExtensionDetector.logDetectionInfo();
    
    // Initialize Chrome-specific detection
    chromeSpecificDetector.logChromeAnalysis();
    
    // Apply Chrome WebSocket fixes
    chromeWebSocketFix.applyFixes();
    chromeWebSocketFix.logStatus();
    
    // Set up global error handler for runtime.lastError
    window.addEventListener('error', (event) => {
      if (event.error && browserExtensionDetector.isRuntimeLastErrorFromExtension(event.error)) {
        console.warn('Runtime.lastError detected - likely caused by browser extension interference');
        console.warn('Error details:', event.error);
        
        // Log extension detection info
        browserExtensionDetector.logDetectionInfo();
        
        // Log Chrome-specific analysis
        chromeSpecificDetector.logChromeAnalysis();
        
        // Log Chrome WebSocket fix status
        chromeWebSocketFix.logStatus();
        
        // Prevent these errors from appearing in console
        event.preventDefault();
        return false;
      }
    });
    
    // Suppress specific extension-related console errors
    const originalConsoleError = console.error;
    console.error = (...args) => {
      const message = args.join(' ');
      
      // Filter out common extension errors
      if (
        message.includes('runtime.lastError') ||
        message.includes('message port closed') ||
        message.includes('Could not establish connection') ||
        message.includes('Receiving end does not exist')
      ) {
        // Log once for debugging but don't spam the console
        if (!window._extensionErrorLogged) {
          console.warn('🔌 Extension interference detected - errors suppressed');
          window._extensionErrorLogged = true;
        }
        return;
      }
      
      // Call original console.error for legitimate errors
      originalConsoleError.apply(console, args);
    };

    // Set up unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      if (event.reason && browserExtensionDetector.isRuntimeLastErrorFromExtension(event.reason)) {
        console.warn('Unhandled promise rejection with runtime.lastError - likely caused by browser extension');
        console.warn('Rejection reason:', event.reason);
        
        // Prevent the default error handling
        event.preventDefault();
        
        // Log Chrome-specific analysis
        chromeSpecificDetector.logChromeAnalysis();
        
        // Log Chrome WebSocket fix status
        chromeWebSocketFix.logStatus();
      }
    });

    // Set up WebSocket error handler
    window.addEventListener('websocket-error', (event) => {
      console.warn('WebSocket error detected:', event.detail);
      chromeSpecificDetector.logChromeAnalysis();
      chromeWebSocketFix.logStatus();
    });

    // Cleanup function
    return () => {
      // Cleanup if needed
    };
  }, []);

  return (
    <AuthProvider>
      <ExtensionErrorSuppressor />
      <Routes />
    </AuthProvider>
  );
}

export default App;
