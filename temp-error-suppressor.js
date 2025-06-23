// Copiez et collez ce code dans la console du navigateur (F12)
// pour supprimer immédiatement les erreurs d'extensions

(function() {
    console.log('🔧 Suppression temporaire des erreurs d\'extensions activée');
    
    // Override console.error
    const originalError = console.error;
    console.error = function(...args) {
        const message = args.join(' ').toLowerCase();
        if (
            message.includes('runtime.lasterror') ||
            message.includes('message port closed') ||
            message.includes('could not establish connection') ||
            message.includes('receiving end does not exist')
        ) {
            return; // Supprimer ces erreurs
        }
        return originalError.apply(console, args);
    };
    
    // Override console.warn  
    const originalWarn = console.warn;
    console.warn = function(...args) {
        const message = args.join(' ').toLowerCase();
        if (
            message.includes('runtime.lasterror') ||
            message.includes('message port closed') ||
            message.includes('could not establish connection') ||
            message.includes('receiving end does not exist')
        ) {
            return; // Supprimer ces avertissements
        }
        return originalWarn.apply(console, args);
    };
    
    console.log('✅ Erreurs d\'extensions supprimées. Rechargez la page pour voir l\'effet.');
})();
