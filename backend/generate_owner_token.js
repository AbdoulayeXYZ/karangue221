const jwt = require('jsonwebtoken');

// Données de l'owner de test
const ownerData = {
  userId: 7,
  email: 'owner@test.com',
  role: 'owner',
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 heures
};

// Générer le token avec la même clé secrète que le serveur
require('dotenv').config();
const secret = process.env.JWT_SECRET || '/NZssYjVT8vFNgrPPMV4ad6ZlehNkCmGSg6adb+sCSi2dZlpkhn/qm/Jby21Cmzvq9Zk17OBWBuggvxLuSXgVQ==';
const token = jwt.sign(ownerData, secret);

console.log('Token Owner généré:');
console.log(token);
console.log('\nUtilisez ce token dans l\'en-tête Authorization: Bearer [token]');
