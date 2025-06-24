#!/usr/bin/env node

/**
 * Script pour configurer la structure SaaS complète
 * - Admin Super-Utilisateur (SaaS Owner)
 * - Tenant "Dakar Dem Dikk"
 * - User Owner du Tenant
 */

const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function setupSaaSStructure() {
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

    console.log('🚀 Configuration de la structure SaaS - Karangue221');
    console.log('==================================================\n');

    console.log('🔌 Connexion à la base de données...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connecté à la base de données MySQL');

    // 1. CRÉER L'ADMIN SUPER-UTILISATEUR (SaaS Owner)
    console.log('\n👑 ÉTAPE 1: Création de l\'Admin Super-Utilisateur');
    console.log('--------------------------------------------------');
    
    const adminData = {
      name: 'Super Administrateur SaaS',
      email: 'admin@admin.com',
      password: 'admin1234',
      role: 'admin',
      phone: '+221770000000',
      status: 'active',
      tenant_id: 1 // Tenant système pour l'admin
    };

    const adminUserId = await createOrUpdateAdminUser(connection, adminData);
    console.log(`✅ Admin Super-Utilisateur créé/mis à jour (ID: ${adminUserId})`);

    // 2. CRÉER LE TENANT "DAKAR DEM DIKK"
    console.log('\n🏢 ÉTAPE 2: Création du Tenant "Dakar Dem Dikk"');
    console.log('------------------------------------------------');
    
    const tenantData = {
      name: 'Dakar Dem Dikk',
      subdomain: 'dakar-dem-dikk',
      domain: 'dakar-dem-dikk.karangue221.com',
      plan: 'premium',
      settings: JSON.stringify({
        features: ['gps_tracking', 'driver_analytics', 'fleet_management', 'incident_management'],
        max_vehicles: 150,
        max_drivers: 75,
        country: 'Sénégal',
        timezone: 'Africa/Dakar'
      })
    };

    const tenantId = await createTenant(connection, tenantData);
    console.log(`✅ Tenant "Dakar Dem Dikk" créé (ID: ${tenantId})`);

    // 3. CRÉER L'USER OWNER DU TENANT
    console.log('\n👤 ÉTAPE 3: Création de l\'User Owner du Tenant');
    console.log('------------------------------------------------');
    
    const ownerData = {
      name: 'Mamadou Diallo',
      email: 'mamadou.diallo@dakar-dem-dikk.com',
      password: 'Dakar2024!',
      role: 'owner',
      phone: '+221771234567',
      status: 'active',
      tenant_id: tenantId
    };

    const ownerUserId = await createOwnerUser(connection, ownerData);
    console.log(`✅ User Owner créé (ID: ${ownerUserId})`);

    // 4. CRÉER LA FLOTTE POUR DAKAR DEM DIKK
    console.log('\n🚗 ÉTAPE 4: Création de la Flotte');
    console.log('----------------------------------');
    
    const fleetData = {
      name: 'Flotte Dakar Dem Dikk',
      description: 'Flotte principale de transport urbain Dakar Dem Dikk',
      owner_id: ownerUserId,
      tenant_id: tenantId,
      status: 'active',
      founding_date: '2020-01-15',
      license_number: 'DDD-2020-001',
      main_address: 'Route de Ouakam, Dakar',
      city: 'Dakar',
      postal_code: '10000',
      country: 'Sénégal',
      phone: '+221338200000',
      email: 'contact@dakar-dem-dikk.com',
      website: 'https://dakar-dem-dikk.com',
      max_vehicles: 150,
      max_drivers: 75,
      subscription_type: 'premium',
      subscription_expires_at: '2025-12-31 23:59:59'
    };

    const fleetId = await createFleet(connection, fleetData);
    console.log(`✅ Flotte créée (ID: ${fleetId})`);

    // 5. AFFICHER LE RÉSUMÉ COMPLET
    console.log('\n🎉 RÉSUMÉ DE LA CONFIGURATION');
    console.log('==============================');
    console.log('\n👑 ADMIN SUPER-UTILISATEUR (SaaS Owner):');
    console.log(`   📧 Email: ${adminData.email}`);
    console.log(`   🔑 Mot de passe: ${adminData.password}`);
    console.log(`   👤 Nom: ${adminData.name}`);
    console.log(`   🔐 Rôle: ${adminData.role}`);
    console.log(`   🏢 Tenant ID: ${adminData.tenant_id} (Système)`);

    console.log('\n🏢 TENANT "DAKAR DEM DIKK":');
    console.log(`   🏢 Nom: ${tenantData.name}`);
    console.log(`   🌐 Subdomain: ${tenantData.subdomain}`);
    console.log(`   🌍 Domain: ${tenantData.domain}`);
    console.log(`   📋 Plan: ${tenantData.plan}`);
    console.log(`   🆔 Tenant ID: ${tenantId}`);

    console.log('\n👤 USER OWNER DU TENANT:');
    console.log(`   📧 Email: ${ownerData.email}`);
    console.log(`   🔑 Mot de passe: ${ownerData.password}`);
    console.log(`   👤 Nom: ${ownerData.name}`);
    console.log(`   🔐 Rôle: ${ownerData.role}`);
    console.log(`   🏢 Tenant ID: ${tenantId}`);

    console.log('\n🚗 FLOTTE:');
    console.log(`   🚗 Nom: ${fleetData.name}`);
    console.log(`   📧 Email: ${fleetData.email}`);
    console.log(`   🌐 Site web: ${fleetData.website}`);
    console.log(`   📱 Téléphone: ${fleetData.phone}`);
    console.log(`   🆔 Fleet ID: ${fleetId}`);

    console.log('\n🔗 URLS D\'ACCÈS:');
    console.log('   🌐 Admin SaaS: http://localhost:4028 (admin@admin.com)');
    console.log('   🏢 Tenant Dakar Dem Dikk: http://localhost:4028?tenant_subdomain=dakar-dem-dikk');
    console.log('   👤 Owner Login: mamadou.diallo@dakar-dem-dikk.com');

    console.log('\n⚠️  IMPORTANT:');
    console.log('   • Changez les mots de passe lors de la première connexion');
    console.log('   • L\'admin super-utilisateur a accès à tous les tenants');
    console.log('   • L\'owner du tenant ne voit que ses propres données');

  } catch (error) {
    console.error('❌ Erreur lors de la configuration:', error.message);
    
    if (error.code === 'ER_DUP_ENTRY') {
      console.log('💡 Conseil: Un utilisateur ou tenant avec ces identifiants existe déjà.');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('💡 Conseil: Vérifiez que MySQL est démarré et que les paramètres de connexion sont corrects.');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('💡 Conseil: Vérifiez les identifiants de connexion à la base de données.');
    }
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Connexion fermée');
    }
  }
}

async function createOrUpdateAdminUser(connection, adminData) {
  // Vérifier si l'admin existe déjà
  const [existingUsers] = await connection.execute(
    'SELECT id FROM users WHERE email = ?',
    [adminData.email]
  );

  if (existingUsers.length > 0) {
    console.log(`⚠️  Admin avec email ${adminData.email} existe déjà, mise à jour...`);
    
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(adminData.password, saltRounds);
    
    await connection.execute(
      'UPDATE users SET name = ?, password_hash = ?, role = ?, phone = ?, status = ?, tenant_id = ? WHERE email = ?',
      [adminData.name, hashedPassword, adminData.role, adminData.phone, adminData.status, adminData.tenant_id, adminData.email]
    );
    
    return existingUsers[0].id;
  } else {
    // Créer un nouvel admin
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(adminData.password, saltRounds);
    
    const [result] = await connection.execute(
      'INSERT INTO users (name, email, password_hash, role, phone, status, tenant_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())',
      [adminData.name, adminData.email, hashedPassword, adminData.role, adminData.phone, adminData.status, adminData.tenant_id]
    );
    
    return result.insertId;
  }
}

async function createTenant(connection, tenantData) {
  // Vérifier si le tenant existe déjà
  const [existingTenants] = await connection.execute(
    'SELECT id FROM tenants WHERE subdomain = ?',
    [tenantData.subdomain]
  );

  if (existingTenants.length > 0) {
    console.log(`⚠️  Tenant avec subdomain ${tenantData.subdomain} existe déjà, mise à jour...`);
    
    await connection.execute(
      'UPDATE tenants SET name = ?, domain = ?, plan = ?, settings = ?, status = ? WHERE subdomain = ?',
      [tenantData.name, tenantData.domain, tenantData.plan, tenantData.settings, 'active', tenantData.subdomain]
    );
    
    return existingTenants[0].id;
  } else {
    // Créer un nouveau tenant
    const [result] = await connection.execute(
      'INSERT INTO tenants (name, subdomain, domain, plan, settings, status, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())',
      [tenantData.name, tenantData.subdomain, tenantData.domain, tenantData.plan, tenantData.settings, 'active']
    );
    
    return result.insertId;
  }
}

async function createOwnerUser(connection, ownerData) {
  // Vérifier si l'owner existe déjà
  const [existingUsers] = await connection.execute(
    'SELECT id FROM users WHERE email = ?',
    [ownerData.email]
  );

  if (existingUsers.length > 0) {
    console.log(`⚠️  Owner avec email ${ownerData.email} existe déjà, mise à jour...`);
    
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(ownerData.password, saltRounds);
    
    await connection.execute(
      'UPDATE users SET name = ?, password_hash = ?, role = ?, phone = ?, status = ?, tenant_id = ? WHERE email = ?',
      [ownerData.name, hashedPassword, ownerData.role, ownerData.phone, ownerData.status, ownerData.tenant_id, ownerData.email]
    );
    
    return existingUsers[0].id;
  } else {
    // Créer un nouvel owner
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(ownerData.password, saltRounds);
    
    const [result] = await connection.execute(
      'INSERT INTO users (name, email, password_hash, role, phone, status, tenant_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())',
      [ownerData.name, ownerData.email, hashedPassword, ownerData.role, ownerData.phone, ownerData.status, ownerData.tenant_id]
    );
    
    return result.insertId;
  }
}

async function createFleet(connection, fleetData) {
  // Vérifier si la flotte existe déjà pour ce tenant
  const [existingFleets] = await connection.execute(
    'SELECT id FROM fleets WHERE tenant_id = ? AND name = ?',
    [fleetData.tenant_id, fleetData.name]
  );

  if (existingFleets.length > 0) {
    console.log(`⚠️  Flotte ${fleetData.name} existe déjà pour ce tenant, mise à jour...`);
    
    await connection.execute(`
      UPDATE fleets SET 
        description = ?, owner_id = ?, status = ?, founding_date = ?, 
        license_number = ?, main_address = ?, city = ?, postal_code = ?, 
        country = ?, phone = ?, email = ?, website = ?, max_vehicles = ?, 
        max_drivers = ?, subscription_type = ?, subscription_expires_at = ?
      WHERE tenant_id = ? AND name = ?
    `, [
      fleetData.description, fleetData.owner_id, fleetData.status, fleetData.founding_date,
      fleetData.license_number, fleetData.main_address, fleetData.city, fleetData.postal_code,
      fleetData.country, fleetData.phone, fleetData.email, fleetData.website, fleetData.max_vehicles,
      fleetData.max_drivers, fleetData.subscription_type, fleetData.subscription_expires_at,
      fleetData.tenant_id, fleetData.name
    ]);
    
    return existingFleets[0].id;
  } else {
    // Créer une nouvelle flotte
    const [result] = await connection.execute(`
      INSERT INTO fleets (
        name, description, owner_id, tenant_id, status, founding_date,
        license_number, main_address, city, postal_code, country, phone,
        email, website, max_vehicles, max_drivers, subscription_type,
        subscription_expires_at, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `, [
      fleetData.name, fleetData.description, fleetData.owner_id, fleetData.tenant_id,
      fleetData.status, fleetData.founding_date, fleetData.license_number,
      fleetData.main_address, fleetData.city, fleetData.postal_code, fleetData.country,
      fleetData.phone, fleetData.email, fleetData.website, fleetData.max_vehicles,
      fleetData.max_drivers, fleetData.subscription_type, fleetData.subscription_expires_at
    ]);
    
    return result.insertId;
  }
}

// Fonction principale
async function main() {
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

  await setupSaaSStructure();
}

// Exécuter le script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { setupSaaSStructure }; 