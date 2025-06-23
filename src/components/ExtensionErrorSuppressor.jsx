import { useEffect } from 'react';

/**
 * Composant pour supprimer les erreurs causées par les extensions de navigateur
 * Ces erreurs n'affectent pas le fonctionnement de l'application
 */
const ExtensionErrorSuppressor = () => {
  useEffect(() => {
    // Messages d'erreur d'extension à supprimer
    const extensionErrorPatterns = [
      'runtime.lastError',
      'message port closed',
      'Could not establish connection',
      'Receiving end does not exist',
      'Extension context invalidated',
      'chrome-extension:',
      'moz-extension:',
      'safari-extension:'
    ];

    // Intercepter window.chrome.runtime.lastError
    if (window.chrome && window.chrome.runtime) {
      const originalRuntime = window.chrome.runtime;
      
      Object.defineProperty(window.chrome.runtime, 'lastError', {
        get: function() {
          // Supprimer silencieusement l'erreur
          return undefined;
        },
        configurable: true
      });
    }

    // Intercepter les erreurs non capturées
    const handleError = (event) => {
      const error = event.error || event.reason;
      
      if (error && typeof error === 'object') {
        const errorMessage = error.message || error.toString();
        
        // Vérifier si l'erreur correspond aux patterns d'extension
        const isExtensionError = extensionErrorPatterns.some(pattern => 
          errorMessage.toLowerCase().includes(pattern.toLowerCase())
        );
        
        if (isExtensionError) {
          console.debug('🔌 Extension error suppressed:', errorMessage);
          event.preventDefault();
          event.stopImmediatePropagation();
          return false;
        }
      }
    };

    // Intercepter les erreurs d'événements
    window.addEventListener('error', handleError, true);
    window.addEventListener('unhandledrejection', handleError, true);

    // Intercepter console.error pour filtrer les erreurs d'extension
    const originalConsoleError = console.error;
    console.error = function(...args) {
      const message = args.join(' ').toLowerCase();
      
      // Vérifier si le message contient des patterns d'extension
      const isExtensionError = extensionErrorPatterns.some(pattern => 
        message.includes(pattern.toLowerCase())
      );
      
      if (isExtensionError) {
        // Ne pas afficher l'erreur, mais la logger en debug si nécessaire
        console.debug('🔌 Console error suppressed (extension):', ...args);
        return;
      }
      
      // Appeler la fonction console.error originale pour les vraies erreurs
      originalConsoleError.apply(console, args);
    };

    // Intercepter console.warn pour filtrer les avertissements d'extension
    const originalConsoleWarn = console.warn;
    console.warn = function(...args) {
      const message = args.join(' ').toLowerCase();
      
      const isExtensionWarning = extensionErrorPatterns.some(pattern => 
        message.includes(pattern.toLowerCase())
      );
      
      if (isExtensionWarning) {
        console.debug('🔌 Console warning suppressed (extension):', ...args);
        return;
      }
      
      originalConsoleWarn.apply(console, args);
    };

    // Message informatif unique
    let suppressionMessageShown = false;
    const showSuppressionMessage = () => {
      if (!suppressionMessageShown) {
        console.info(
          '🔌 Extension Error Suppressor Active\n' +
          '───────────────────────────────────\n' +
          '• Browser extension errors are being filtered\n' +
          '• This does not affect application functionality\n' +
          '• Only legitimate application errors will be shown'
        );
        suppressionMessageShown = true;
      }
    };

    // Afficher le message après un délai
    setTimeout(showSuppressionMessage, 1000);

    // Fonction de nettoyage
    return () => {
      window.removeEventListener('error', handleError, true);
      window.removeEventListener('unhandledrejection', handleError, true);
      
      // Restaurer les fonctions console originales
      console.error = originalConsoleError;
      console.warn = originalConsoleWarn;
    };
  }, []);

  // Ce composant ne rend rien
  return null;
};

export default ExtensionErrorSuppressor;
