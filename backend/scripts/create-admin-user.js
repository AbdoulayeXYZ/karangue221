const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function createAdminUser() {
  let connection;
  
  try {
    // Configuration de la base de données
    const dbConfig = {
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'karangue221',
      port: process.env.DB_PORT || 3306
    };

    console.log('🔌 Connexion à la base de données...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connecté à la base de données MySQL');

    // Données de l'utilisateur admin
    const adminData = {
      name: 'Super Administrateur',
      email: 'admin@karangue221.com',
      password: 'admin123456', // Mot de passe par défaut - À CHANGER IMMÉDIATEMENT
      role: 'admin',
      phone: '+221770000000',
      status: 'active'
    };

    // Vérifier si l'email existe déjà
    console.log('🔍 Vérification de l\'existence de l\'utilisateur...');
    const [existingUsers] = await connection.execute(
      'SELECT id, email FROM users WHERE email = ?',
      [adminData.email]
    );

    if (existingUsers.length > 0) {
      console.log('⚠️  Un utilisateur avec cet email existe déjà:');
      console.log(`   ID: ${existingUsers[0].id}`);
      console.log(`   Email: ${existingUsers[0].email}`);
      
      const answer = await askQuestion('Voulez-vous mettre à jour cet utilisateur vers admin ? (y/N): ');
      if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
        // Mettre à jour l'utilisateur existant
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(adminData.password, saltRounds);
        
        await connection.execute(
          'UPDATE users SET name = ?, password_hash = ?, role = ?, phone = ?, status = ? WHERE email = ?',
          [adminData.name, hashedPassword, adminData.role, adminData.phone, adminData.status, adminData.email]
        );
        
        console.log('✅ Utilisateur mis à jour avec succès !');
      } else {
        console.log('❌ Opération annulée');
        return;
      }
    } else {
      // Créer un nouvel utilisateur
      console.log('👤 Création du nouvel utilisateur administrateur...');
      
      // Hash du mot de passe
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(adminData.password, saltRounds);
      
      // Insérer l'utilisateur
      const [result] = await connection.execute(
        'INSERT INTO users (name, email, password_hash, role, phone, status, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())',
        [adminData.name, adminData.email, hashedPassword, adminData.role, adminData.phone, adminData.status]
      );
      
      console.log('✅ Utilisateur administrateur créé avec succès !');
      console.log(`   ID: ${result.insertId}`);
    }

    // Afficher les informations de connexion
    console.log('\n🎉 INFORMATIONS DE CONNEXION ADMINISTRATEUR:');
    console.log('=====================================');
    console.log(`📧 Email: ${adminData.email}`);
    console.log(`🔑 Mot de passe: ${adminData.password}`);
    console.log(`👤 Nom: ${adminData.name}`);
    console.log(`📱 Téléphone: ${adminData.phone}`);
    console.log(`🔐 Rôle: ${adminData.role}`);
    console.log('=====================================');
    console.log('⚠️  IMPORTANT: Changez le mot de passe lors de la première connexion !');

    // Vérifier les privilèges admin
    console.log('\n🔍 Vérification des privilèges...');
    const [adminUser] = await connection.execute(
      'SELECT id, name, email, role, status FROM users WHERE email = ? AND role = ?',
      [adminData.email, 'admin']
    );

    if (adminUser.length > 0) {
      console.log('✅ Privilèges administrateur confirmés');
      console.log(`   Utilisateur: ${adminUser[0].name} (ID: ${adminUser[0].id})`);
      console.log(`   Statut: ${adminUser[0].status}`);
    } else {
      console.log('❌ Erreur: Privilèges administrateur non trouvés');
    }

  } catch (error) {
    console.error('❌ Erreur lors de la création de l\'utilisateur administrateur:', error.message);
    
    if (error.code === 'ER_DUP_ENTRY') {
      console.log('💡 Conseil: Un utilisateur avec cet email existe déjà. Utilisez un email différent ou mettez à jour l\'utilisateur existant.');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('💡 Conseil: Vérifiez que MySQL est démarré et que les paramètres de connexion sont corrects.');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('💡 Conseil: Vérifiez les identifiants de connexion à la base de données.');
    }
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Connexion fermée');
    }
  }
}

// Fonction utilitaire pour poser des questions
function askQuestion(question) {
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

// Fonction principale avec gestion d'arguments
async function main() {
  console.log('🚀 Script de création d\'utilisateur administrateur - Karangue221');
  console.log('================================================================\n');

  // Vérifier les variables d'environnement
  if (!process.env.DB_PASSWORD && !process.env.DB_USER) {
    console.log('⚠️  Variables d\'environnement non trouvées');
    console.log('💡 Assurez-vous que le fichier .env est configuré avec:');
    console.log('   DB_HOST=localhost');
    console.log('   DB_USER=root');
    console.log('   DB_PASSWORD=votre_mot_de_passe');
    console.log('   DB_NAME=karangue221');
    console.log('   DB_PORT=3306\n');
  }

  await createAdminUser();
}

// Exécuter le script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { createAdminUser };
