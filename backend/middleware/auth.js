const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  console.log(`🔒 Vérification d'authentification pour ${req.method} ${req.originalUrl}`);
  
  // Mode développement - bypass pour les tests owner
  if (process.env.NODE_ENV === 'development' && req.originalUrl.startsWith('/api/owner')) {
    req.user = {
      id: 3,
      name: 'Test Owner',
      email: 'admin@karangue221.com',
      role: 'owner'
    };
    console.log('🔓 Mode développement: Bypass authentification pour owner');
    return next();
  }
  
  // Vérification de l'en-tête d'authentification
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    console.log('❌ Échec d\'authentification: En-tête d\'autorisation manquant');
    return res.status(401).json({ 
      error: 'Authentification requise', 
      details: 'L\'en-tête Authorization est manquant'
    });
  }
  
  // Extraction du token
  const token = authHeader.split(' ')[1];
  if (!token) {
    console.log('❌ Échec d\'authentification: Token manquant dans l\'en-tête');
    return res.status(401).json({ 
      error: 'Token manquant', 
      details: 'Le format de l\'en-tête doit être "Bearer [token]"'
    });
  }
  
  
  // Vérification du token JWT
  try {
    // Vérifier que JWT_SECRET est bien défini
    if (!process.env.JWT_SECRET) {
      console.log('❌ Erreur de configuration: JWT_SECRET n\'est pas défini');
      return res.status(500).json({
        error: 'Erreur de configuration du serveur',
        details: 'La clé secrète JWT n\'est pas configurée'
      });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    console.log(`✅ Authentification réussie pour l'utilisateur ${decoded.name || decoded.id}`);
    next();
  } catch (err) {
    console.log(`❌ Échec d'authentification: ${err.message}`);
    return res.status(401).json({ 
      error: 'Token invalide', 
      details: err.message
    });
  }
};
