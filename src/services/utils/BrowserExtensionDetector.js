/**
 * BrowserExtensionDetector - Utility to detect browser extensions
 * 
 * This utility helps identify browser extensions that might be causing
 * runtime.lastError issues with WebSocket connections.
 */

class BrowserExtensionDetector {
  constructor() {
    this.detectedExtensions = new Set();
    this.extensionPatterns = [
      // Common extension patterns that might interfere with WebSocket connections
      'chrome-extension://',
      'moz-extension://',
      'safari-extension://',
      'ms-browser-extension://'
    ];
  }

  /**
   * Detect if runtime.lastError is available (indicates browser extension context)
   * @returns {boolean} True if in extension context
   */
  isInExtensionContext() {
    return typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.lastError;
  }

  /**
   * Check for common browser extensions that might interfere
   * @returns {Array} Array of detected extension patterns
   */
  detectInterferingExtensions() {
    const detected = [];
    
    // Check for Chrome extensions
    if (typeof chrome !== 'undefined' && chrome.runtime) {
      try {
        // Check if we're in a content script context
        if (chrome.runtime.onMessage) {
          detected.push('chrome-extension-content-script');
        }
        
        // Check for specific extensions that might interfere
        if (chrome.runtime.id) {
          detected.push(`chrome-extension-${chrome.runtime.id}`);
        }
      } catch (error) {
        // Ignore errors when checking extension APIs
      }
    }

    // Check for Firefox extensions
    if (typeof browser !== 'undefined' && browser.runtime) {
      try {
        if (browser.runtime.onMessage) {
          detected.push('firefox-extension-content-script');
        }
      } catch (error) {
        // Ignore errors when checking extension APIs
      }
    }

    // Check for Safari extensions
    if (typeof safari !== 'undefined' && safari.extension) {
      detected.push('safari-extension');
    }

    return detected;
  }

  /**
   * Check if current page is loaded in an extension context
   * @returns {boolean} True if page is in extension context
   */
  isPageInExtensionContext() {
    const url = window.location.href;
    return this.extensionPatterns.some(pattern => url.startsWith(pattern));
  }

  /**
   * Get information about potential extension interference
   * @returns {Object} Extension interference information
   */
  getExtensionInterferenceInfo() {
    const info = {
      inExtensionContext: this.isInExtensionContext(),
      pageInExtensionContext: this.isPageInExtensionContext(),
      detectedExtensions: this.detectInterferingExtensions(),
      userAgent: navigator.userAgent,
      hasRuntimeAPI: typeof chrome !== 'undefined' && chrome.runtime,
      hasBrowserAPI: typeof browser !== 'undefined' && browser.runtime,
      hasSafariAPI: typeof safari !== 'undefined' && safari.extension
    };

    // Log detection results
    if (info.detectedExtensions.length > 0) {
      console.warn('Browser extension interference detected:', info);
    }

    return info;
  }

  /**
   * Check if runtime.lastError is likely caused by extension interference
   * @param {Error} error - The error to check
   * @returns {boolean} True if likely caused by extension
   */
  isRuntimeLastErrorFromExtension(error) {
    if (!error || !error.message) {
      return false;
    }

    const message = error.message.toLowerCase();
    const extensionIndicators = [
      'runtime.lasterror',
      'could not establish connection',
      'receiving end does not exist',
      'extension',
      'content script',
      'background script'
    ];

    return extensionIndicators.some(indicator => message.includes(indicator));
  }

  /**
   * Get recommendations for handling extension interference
   * @returns {Array} Array of recommendations
   */
  getRecommendations() {
    const recommendations = [];
    const info = this.getExtensionInterferenceInfo();

    if (info.detectedExtensions.length > 0) {
      recommendations.push(
        'Browser extensions detected that may interfere with WebSocket connections.',
        'Consider temporarily disabling browser extensions to isolate the issue.',
        'Check if any ad blockers, VPN extensions, or security extensions are active.'
      );
    }

    if (info.inExtensionContext) {
      recommendations.push(
        'Running in browser extension context - this may cause WebSocket connection issues.',
        'Consider running the application in a regular browser tab instead.'
      );
    }

    if (info.pageInExtensionContext) {
      recommendations.push(
        'Page is loaded in extension context - WebSocket connections may be restricted.',
        'Try accessing the application directly via URL instead of through an extension.'
      );
    }

    return recommendations;
  }

  /**
   * Log detailed extension detection information
   */
  logDetectionInfo() {
    const info = this.getExtensionInterferenceInfo();
    const recommendations = this.getRecommendations();

    console.group('Browser Extension Detection');
    console.log('Detection Info:', info);
    
    if (recommendations.length > 0) {
      console.warn('Recommendations:');
      recommendations.forEach(rec => console.warn('- ' + rec));
    }
    
    console.groupEnd();
  }
}

// Create singleton instance
const browserExtensionDetector = new BrowserExtensionDetector();

// Auto-detect on load
if (typeof window !== 'undefined') {
  // Delay detection to ensure page is fully loaded
  setTimeout(() => {
    browserExtensionDetector.logDetectionInfo();
  }, 1000);
}

export default browserExtensionDetector; 