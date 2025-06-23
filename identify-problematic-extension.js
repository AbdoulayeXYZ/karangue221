// Script pour identifier l'extension problématique
// Copiez et collez ce code dans la console du navigateur (F12)

(function() {
    console.log('🔍 Identification de l\'extension problématique');
    console.log('=============================================');
    
    // L'ID de l'extension problématique
    const problematicExtensionId = 'pejdijmoenmkgeppbflobdenhhabjlaj';
    
    console.log(`🎯 Extension ID: ${problematicExtensionId}`);
    
    // Vérifier si l'extension est active
    if (window.chrome && window.chrome.runtime) {
        try {
            // Tentative de communication avec l'extension
            chrome.runtime.sendMessage(problematicExtensionId, {ping: true}, function(response) {
                if (chrome.runtime.lastError) {
                    console.log('❌ Extension défectueuse détectée:', chrome.runtime.lastError.message);
                } else {
                    console.log('✅ Extension répond normalement');
                }
            });
        } catch(e) {
            console.log('❌ Erreur lors de la communication avec l\'extension:', e.message);
        }
    }
    
    // Messages d'information pour l'utilisateur
    console.log('\n📋 Actions recommandées:');
    console.log('1. Allez sur chrome://extensions/');
    console.log('2. Recherchez une extension avec l\'ID:', problematicExtensionId);
    console.log('3. Désactivez-la temporairement');
    console.log('\n🎯 Extensions communes qui causent ce problème:');
    console.log('- Gestionnaires de mots de passe');
    console.log('- Extensions d\'autocomplétion');
    console.log('- Bloqueurs de publicité obsolètes');
    console.log('- Extensions de productivité');
    
    // Bloquer les requêtes vers cette extension
    console.log('\n🛡️ Blocage des requêtes vers l\'extension défectueuse...');
    
    // Intercepter les requêtes réseau
    const originalFetch = window.fetch;
    window.fetch = function(...args) {
        const url = args[0];
        if (typeof url === 'string' && url.includes(problematicExtensionId)) {
            console.log('🚫 Requête bloquée vers extension défectueuse:', url);
            return Promise.reject(new Error('Extension request blocked'));
        }
        return originalFetch.apply(this, args);
    };
    
    console.log('✅ Protection contre l\'extension défectueuse activée!');
})();
