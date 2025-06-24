#!/usr/bin/env node

const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');
require('dotenv').config();

/**
 * Script pour réinitialiser le mot de passe d'un administrateur
 * Usage: node scripts/reset-admin-password.js
 */

async function resetAdminPassword() {
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  function question(query) {
    return new Promise(resolve => rl.question(query, resolve));
  }

  try {
    console.log('\n🔄 === RÉINITIALISATION MOT DE PASSE ADMINISTRATEUR ===\n');

    // Connexion à la base de données pour lister les admins
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'karangue221'
    });

    // Récupérer la liste des administrateurs
    const [admins] = await connection.execute(`
      SELECT id, name, email, status
      FROM users 
      WHERE role = 'admin' AND status = 'active'
      ORDER BY created_at DESC
    `);

    if (admins.length === 0) {
      console.log('❌ Aucun administrateur actif trouvé.');
      await connection.end();
      rl.close();
      return;
    }

    console.log('📋 Administrateurs disponibles:\n');
    admins.forEach((admin, index) => {
      console.log(`${index + 1}. ${admin.name} (${admin.email})`);
    });

    console.log('');
    const choice = await question('Sélectionnez un administrateur (numéro): ');
    const adminIndex = parseInt(choice) - 1;

    if (adminIndex < 0 || adminIndex >= admins.length) {
      console.log('❌ Sélection invalide.');
      await connection.end();
      rl.close();
      return;
    }

    const selectedAdmin = admins[adminIndex];
    console.log(`\n👤 Administrateur sélectionné: ${selectedAdmin.name} (${selectedAdmin.email})\n`);

    // Demander le nouveau mot de passe
    const newPassword = await question('Nouveau mot de passe: ');
    const confirmPassword = await question('Confirmer le nouveau mot de passe: ');

    if (newPassword !== confirmPassword) {
      console.log('❌ Les mots de passe ne correspondent pas.');
      await connection.end();
      rl.close();
      return;
    }

    if (newPassword.length < 6) {
      console.log('❌ Le mot de passe doit contenir au moins 6 caractères.');
      await connection.end();
      rl.close();
      return;
    }

    console.log('\n⏳ Réinitialisation du mot de passe...\n');

    // Hacher le nouveau mot de passe
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(newPassword, saltRounds);

    // Mettre à jour le mot de passe
    await connection.execute(`
      UPDATE users 
      SET password_hash = ?
      WHERE id = ? AND role = 'admin'
    `, [passwordHash, selectedAdmin.id]);

    await connection.end();

    console.log('✅ Mot de passe réinitialisé avec succès !');
    console.log('\n📋 === NOUVELLES INFORMATIONS DE CONNEXION ===');
    console.log(`📧 Email: ${selectedAdmin.email}`);
    console.log(`🔑 Nouveau mot de passe: ${newPassword}`);
    console.log(`👤 Nom: ${selectedAdmin.name}`);
    console.log('\n🌐 Vous pouvez maintenant vous connecter avec ces identifiants.');
    console.log(`📍 URL d'accès: http://localhost:3000/admin-dashboard`);
    
    console.log('\n🔒 === SÉCURITÉ ===');
    console.log('⚠️  Conservez ces informations en lieu sûr');
    console.log('⚠️  Considérez changer le mot de passe à nouveau après la première connexion');
    console.log('⚠️  Ne partagez jamais ces identifiants');

  } catch (error) {
    console.error('❌ Erreur lors de la réinitialisation:', error.message);
  } finally {
    rl.close();
  }
}

// Exécuter le script
if (require.main === module) {
  resetAdminPassword().catch(error => {
    console.error('❌ Erreur fatale:', error.message);
    process.exit(1);
  });
}

module.exports = { resetAdminPassword };
