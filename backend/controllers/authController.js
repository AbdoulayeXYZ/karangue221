const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email et mot de passe requis.' });
  }
  try {
    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(401).json({ error: 'Identifiants invalides.' });
    }
    const user = users[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ error: 'Identifiants invalides.' });
    }
    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '12h' }
    );
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur.' });
  }
};

/**
 * DEV ONLY: Generate a development JWT token
 * This route should ONLY be used during development to facilitate testing
 * and should be disabled in production
 */
exports.getDevToken = async (req, res) => {
  // Only allow this in development environment
  if (process.env.NODE_ENV === 'production') {
    console.log('🚫 Tentative d\'accès à la route de développement en production');
    return res.status(404).json({ error: 'Route non disponible' });
  }

  try {
    console.log('🔑 Génération d\'un token de développement');
    
    // Try to get an admin user from the database first
    const [users] = await db.query('SELECT * FROM users WHERE role IN ("admin", "owner") LIMIT 1');
    
    let user;
    
    if (users && users.length > 0) {
      // Use an existing admin user if available
      user = users[0];
      console.log(`✅ Utilisation de l'utilisateur existant: ${user.name} (${user.email})`);
    } else {
      // Create a fake user if no admin found
      user = {
        id: 999,
        name: 'Admin Développement',
        email: 'dev@karangue221.com',
        role: 'admin'
      };
      console.log('⚠️ Aucun administrateur trouvé dans la base de données, utilisation d\'un utilisateur fictif');
    }
    
    // Generate token valid for 24 hours
    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    // Return the token and user info
    console.log(`✅ Token de développement généré pour ${user.name}`);
    res.json({ 
      token, 
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      message: 'Token de développement généré avec succès. NE PAS UTILISER EN PRODUCTION.'
    });
  } catch (err) {
    console.error('❌ Erreur lors de la génération du token de développement:', err);
    res.status(500).json({ error: 'Erreur serveur lors de la génération du token.' });
  }
};
