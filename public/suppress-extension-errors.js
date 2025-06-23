// Script pour supprimer les erreurs d'extensions de navigateur
// À charger avant l'application principale

(function() {
    'use strict';
    
    console.log('🔌 Extension Error Suppressor Loading...');
    
    // Messages d'erreur à supprimer
    const EXTENSION_ERROR_PATTERNS = [
        'runtime.lastError',
        'message port closed',
        'could not establish connection',
        'receiving end does not exist',
        'extension context invalidated',
        'chrome-extension:',
        'moz-extension:',
        'safari-extension:',
        'context invalidated',
        'port closed',
        'no receiving end',
        'pejdijmoenmkgeppbflobdenhhabjlaj',
        'extensionstate.js',
        'heuristicsredefinitions.js',
        'utils.js',
        'completion_list.html',
        'net::err_file_not_found'
    ];
    
    // Fonction pour vérifier si une erreur est liée aux extensions
    function isExtensionError(message) {
        if (!message || typeof message !== 'string') return false;
        
        const lowerMessage = message.toLowerCase();
        return EXTENSION_ERROR_PATTERNS.some(pattern => 
            lowerMessage.includes(pattern.toLowerCase())
        );
    }
    
    // Intercepter console.error
    const originalError = console.error;
    console.error = function(...args) {
        const message = args.join(' ');
        if (isExtensionError(message)) {
            // Supprimer l'erreur d'extension
            return;
        }
        return originalError.apply(console, args);
    };
    
    // Intercepter console.warn
    const originalWarn = console.warn;
    console.warn = function(...args) {
        const message = args.join(' ');
        if (isExtensionError(message)) {
            // Supprimer l'avertissement d'extension
            return;
        }
        return originalWarn.apply(console, args);
    };
    
    // Intercepter les erreurs globales
    window.addEventListener('error', function(event) {
        if (event.error && event.error.message) {
            if (isExtensionError(event.error.message)) {
                event.preventDefault();
                event.stopImmediatePropagation();
                return false;
            }
        }
    }, true);
    
    // Intercepter les rejets de promesses
    window.addEventListener('unhandledrejection', function(event) {
        if (event.reason && event.reason.message) {
            if (isExtensionError(event.reason.message)) {
                event.preventDefault();
                return false;
            }
        }
    }, true);
    
    // Intercepter Chrome runtime errors
    if (window.chrome && window.chrome.runtime) {
        // Override runtime.lastError getter
        Object.defineProperty(window.chrome.runtime, 'lastError', {
            get: function() {
                // Retourner undefined pour supprimer l'erreur
                return undefined;
            },
            configurable: true
        });
    }
    
    console.log('✅ Extension Error Suppressor Active');
    
})();
