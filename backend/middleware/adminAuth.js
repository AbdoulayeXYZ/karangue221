const jwt = require('jsonwebtoken');

/**
 * Middleware pour vérifier que l'utilisateur connecté est un administrateur
 */
module.exports = (req, res, next) => {
  console.log(`🔐 Vérification des privilèges administrateur pour ${req.method} ${req.originalUrl}`);
  
  // Vérifier que l'utilisateur est déjà authentifié
  if (!req.user) {
    console.log('❌ Échec d\'authentification admin: Utilisateur non authentifié');
    return res.status(401).json({ 
      error: 'Authentification requise', 
      details: 'Vous devez être connecté pour accéder à cette ressource'
    });
  }
  
  // Vérifier le rôle administrateur
  if (req.user.role !== 'admin') {
    console.log(`❌ Accès refusé: L'utilisateur ${req.user.name} (rôle: ${req.user.role}) n'a pas les privilèges administrateur`);
    return res.status(403).json({ 
      error: 'Accès refusé', 
      details: 'Vous devez être administrateur pour accéder à cette ressource'
    });
  }
  
  console.log(`✅ Privilèges administrateur confirmés pour ${req.user.name}`);
  next();
};
