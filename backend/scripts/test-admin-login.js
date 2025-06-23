const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function testAdminLogin() {
  let connection;
  
  try {
    console.log('🧪 Test de connexion administrateur');
    console.log('====================================');
    
    // Configuration de la base de données
    const dbConfig = {
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'karangue221',
      port: process.env.DB_PORT || 3306
    };

    connection = await mysql.createConnection(dbConfig);
    
    // Données de test
    const testEmail = 'admin@karangue221.com';
    const testPassword = 'admin123456';
    
    console.log(`📧 Email de test: ${testEmail}`);
    console.log(`🔑 Mot de passe de test: ${testPassword}`);
    
    // Récupérer l'utilisateur
    const [users] = await connection.execute(
      'SELECT id, name, email, password_hash, role, status FROM users WHERE email = ?',
      [testEmail]
    );
    
    if (users.length === 0) {
      console.log('❌ Utilisateur non trouvé dans la base de données');
      return;
    }
    
    const user = users[0];
    console.log('\n👤 Utilisateur trouvé:');
    console.log(`   ID: ${user.id}`);
    console.log(`   Nom: ${user.name}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Rôle: ${user.role}`);
    console.log(`   Statut: ${user.status}`);
    
    // Tester le mot de passe
    console.log('\n🔐 Test du mot de passe...');
    const isPasswordValid = await bcrypt.compare(testPassword, user.password_hash);
    
    if (isPasswordValid) {
      console.log('✅ Mot de passe valide !');
    } else {
      console.log('❌ Mot de passe invalide !');
      
      // Essayer de hacher le mot de passe pour comparaison
      console.log('\n🔧 Test de hachage...');
      const hashedPassword = await bcrypt.hash(testPassword, 10);
      console.log(`Hash attendu: ${user.password_hash}`);
      console.log(`Hash généré: ${hashedPassword}`);
    }
    
    // Simulation d'un login complet
    if (isPasswordValid && user.role === 'admin' && user.status === 'active') {
      console.log('\n🎉 TEST DE CONNEXION ADMINISTRATEUR RÉUSSI !');
      console.log('✅ Email valide');
      console.log('✅ Mot de passe valide');
      console.log('✅ Rôle administrateur confirmé');
      console.log('✅ Compte actif');
      
      // Simulation de la réponse API
      const apiResponse = {
        token: 'jwt_token_would_be_here',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      };
      
      console.log('\n📝 Réponse API simulée:');
      console.log(JSON.stringify(apiResponse, null, 2));
      
    } else {
      console.log('\n❌ ÉCHEC DU TEST DE CONNEXION');
      console.log(`   Mot de passe valide: ${isPasswordValid}`);
      console.log(`   Rôle admin: ${user.role === 'admin'}`);
      console.log(`   Compte actif: ${user.status === 'active'}`);
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

testAdminLogin().catch(console.error);
