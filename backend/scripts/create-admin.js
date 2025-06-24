#!/usr/bin/env node

const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');
require('dotenv').config();

/**
 * Script pour créer un nouveau compte administrateur
 * Usage: node scripts/create-admin.js
 */

async function createAdmin() {
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  function question(query) {
    return new Promise(resolve => rl.question(query, resolve));
  }

  try {
    console.log('\n🔧 === CRÉATION D\'UN COMPTE ADMINISTRATEUR ===\n');

    // Récupérer les informations de l'admin
    const name = await question('Nom complet: ');
    const email = await question('Email: ');
    const phone = await question('Téléphone (optionnel): ');
    
    // Mot de passe avec confirmation
    const password = await question('Mot de passe: ');
    const confirmPassword = await question('Confirmer le mot de passe: ');

    if (password !== confirmPassword) {
      console.log('❌ Les mots de passe ne correspondent pas.');
      process.exit(1);
    }

    if (password.length < 6) {
      console.log('❌ Le mot de passe doit contenir au moins 6 caractères.');
      process.exit(1);
    }

    // Validation de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log('❌ Format d\'email invalide.');
      process.exit(1);
    }

    console.log('\n⏳ Création du compte administrateur...\n');

    // Connexion à la base de données
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'karangue221'
    });

    // Vérifier si l'email existe déjà
    const [existingUsers] = await connection.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      console.log('❌ Un utilisateur avec cet email existe déjà.');
      await connection.end();
      process.exit(1);
    }

    // Hacher le mot de passe
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Créer l'utilisateur admin
    const [result] = await connection.execute(`
      INSERT INTO users (name, email, password_hash, role, phone, status, created_at)
      VALUES (?, ?, ?, 'admin', ?, 'active', NOW())
    `, [name, email, passwordHash, phone || null]);

    await connection.end();

    console.log('✅ Compte administrateur créé avec succès !');
    console.log('\n📋 === INFORMATIONS DE CONNEXION ===');
    console.log(`📧 Email: ${email}`);
    console.log(`🔑 Mot de passe: ${password}`);
    console.log(`👤 Nom: ${name}`);
    console.log(`🆔 ID utilisateur: ${result.insertId}`);
    console.log(`📱 Téléphone: ${phone || 'Non défini'}`);
    console.log('\n🌐 Vous pouvez maintenant vous connecter au dashboard admin avec ces identifiants.');
    console.log(`📍 URL d'accès: http://localhost:3000/admin-dashboard`);
    
    console.log('\n🔒 === SÉCURITÉ ===');
    console.log('⚠️  Conservez ces informations en lieu sûr');
    console.log('⚠️  Changez le mot de passe lors de la première connexion');
    console.log('⚠️  Ne partagez jamais ces identifiants');

  } catch (error) {
    console.error('❌ Erreur lors de la création de l\'administrateur:', error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

// Gestionnaire pour les comptes existants
async function listExistingAdmins() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'karangue221'
    });

    const [admins] = await connection.execute(`
      SELECT id, name, email, phone, status, created_at
      FROM users 
      WHERE role = 'admin' 
      ORDER BY created_at DESC
    `);

    await connection.end();

    if (admins.length > 0) {
      console.log('\n👥 === ADMINISTRATEURS EXISTANTS ===\n');
      admins.forEach((admin, index) => {
        console.log(`${index + 1}. ${admin.name}`);
        console.log(`   📧 Email: ${admin.email}`);
        console.log(`   📱 Téléphone: ${admin.phone || 'Non défini'}`);
        console.log(`   📊 Statut: ${admin.status}`);
        console.log(`   📅 Créé le: ${new Date(admin.created_at).toLocaleDateString('fr-FR')}`);
        console.log('');
      });
    } else {
      console.log('\n❌ Aucun administrateur trouvé dans la base de données.');
    }

  } catch (error) {
    console.error('❌ Erreur lors de la récupération des administrateurs:', error.message);
  }
}

// Menu principal
async function main() {
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  function question(query) {
    return new Promise(resolve => rl.question(query, resolve));
  }

  console.log('\n🏢 === GESTION DES ADMINISTRATEURS KARANGUÉ221 ===\n');
  console.log('1. Créer un nouveau compte administrateur');
  console.log('2. Voir les administrateurs existants');
  console.log('3. Quitter\n');

  const choice = await question('Choisissez une option (1-3): ');

  switch (choice) {
    case '1':
      rl.close();
      await createAdmin();
      break;
    case '2':
      rl.close();
      await listExistingAdmins();
      break;
    case '3':
      console.log('👋 Au revoir !');
      rl.close();
      break;
    default:
      console.log('❌ Option invalide. Veuillez choisir 1, 2 ou 3.');
      rl.close();
      break;
  }
}

// Exécuter le script
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Erreur fatale:', error.message);
    process.exit(1);
  });
}

module.exports = { createAdmin, listExistingAdmins };
