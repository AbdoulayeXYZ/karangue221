#!/usr/bin/env node

/**
 * Script de vérification de la structure SaaS
 * Vérifie que l'admin, le tenant et l'owner sont correctement configurés
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

async function verifySaaSStructure() {
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

    console.log('🔍 Vérification de la structure SaaS - Karangue221');
    console.log('================================================\n');

    console.log('🔌 Connexion à la base de données...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connecté à la base de données MySQL');

    // 1. VÉRIFIER L'ADMIN SUPER-UTILISATEUR
    console.log('\n👑 VÉRIFICATION DE L\'ADMIN SUPER-UTILISATEUR');
    console.log('----------------------------------------------');
    
    const [adminUsers] = await connection.execute(
      'SELECT id, name, email, role, tenant_id, status FROM users WHERE email = ? AND role = ?',
      ['admin@admin.com', 'admin']
    );

    if (adminUsers.length > 0) {
      const admin = adminUsers[0];
      console.log('✅ Admin Super-Utilisateur trouvé:');
      console.log(`   🆔 ID: ${admin.id}`);
      console.log(`   👤 Nom: ${admin.name}`);
      console.log(`   📧 Email: ${admin.email}`);
      console.log(`   🔐 Rôle: ${admin.role}`);
      console.log(`   🏢 Tenant ID: ${admin.tenant_id}`);
      console.log(`   📊 Statut: ${admin.status}`);
    } else {
      console.log('❌ Admin Super-Utilisateur non trouvé');
      console.log('💡 Exécutez le script setup-saas-structure.js pour le créer');
    }

    // 2. VÉRIFIER LE TENANT "DAKAR DEM DIKK"
    console.log('\n🏢 VÉRIFICATION DU TENANT "DAKAR DEM DIKK"');
    console.log('-------------------------------------------');
    
    const [tenants] = await connection.execute(
      'SELECT id, name, subdomain, domain, plan, status, settings FROM tenants WHERE subdomain = ?',
      ['dakar-dem-dikk']
    );

    if (tenants.length > 0) {
      const tenant = tenants[0];
      console.log('✅ Tenant "Dakar Dem Dikk" trouvé:');
      console.log(`   🆔 ID: ${tenant.id}`);
      console.log(`   🏢 Nom: ${tenant.name}`);
      console.log(`   🌐 Subdomain: ${tenant.subdomain}`);
      console.log(`   🌍 Domain: ${tenant.domain}`);
      console.log(`   📋 Plan: ${tenant.plan}`);
      console.log(`   📊 Statut: ${tenant.status}`);
      
      try {
        const settings = JSON.parse(tenant.settings);
        console.log(`   ⚙️  Features: ${settings.features ? settings.features.join(', ') : 'Aucune'}`);
        console.log(`   🚗 Max véhicules: ${settings.max_vehicles || 'Non défini'}`);
        console.log(`   👥 Max conducteurs: ${settings.max_drivers || 'Non défini'}`);
      } catch (e) {
        console.log(`   ⚙️  Settings: ${tenant.settings}`);
      }
    } else {
      console.log('❌ Tenant "Dakar Dem Dikk" non trouvé');
      console.log('💡 Exécutez le script setup-saas-structure.js pour le créer');
    }

    // 3. VÉRIFIER L'USER OWNER DU TENANT
    console.log('\n👤 VÉRIFICATION DE L\'USER OWNER');
    console.log('--------------------------------');
    
    const [ownerUsers] = await connection.execute(
      'SELECT id, name, email, role, tenant_id, status FROM users WHERE email = ? AND role = ?',
      ['mamadou.diallo@dakar-dem-dikk.com', 'owner']
    );

    if (ownerUsers.length > 0) {
      const owner = ownerUsers[0];
      console.log('✅ User Owner trouvé:');
      console.log(`   🆔 ID: ${owner.id}`);
      console.log(`   👤 Nom: ${owner.name}`);
      console.log(`   📧 Email: ${owner.email}`);
      console.log(`   🔐 Rôle: ${owner.role}`);
      console.log(`   🏢 Tenant ID: ${owner.tenant_id}`);
      console.log(`   📊 Statut: ${owner.status}`);
    } else {
      console.log('❌ User Owner non trouvé');
      console.log('💡 Exécutez le script setup-saas-structure.js pour le créer');
    }

    // 4. VÉRIFIER LA FLOTTE
    console.log('\n🚗 VÉRIFICATION DE LA FLOTTE');
    console.log('----------------------------');
    
    const tenantId = tenants.length > 0 ? tenants[0].id : null;
    let fleets = [];
    
    if (tenantId) {
      const [fleetsResult] = await connection.execute(
        'SELECT id, name, description, owner_id, tenant_id, status, email, website FROM fleets WHERE tenant_id = ?',
        [tenantId]
      );
      fleets = fleetsResult;

      if (fleets.length > 0) {
        const fleet = fleets[0];
        console.log('✅ Flotte trouvée:');
        console.log(`   🆔 ID: ${fleet.id}`);
        console.log(`   🚗 Nom: ${fleet.name}`);
        console.log(`   📝 Description: ${fleet.description}`);
        console.log(`   👤 Owner ID: ${fleet.owner_id}`);
        console.log(`   🏢 Tenant ID: ${fleet.tenant_id}`);
        console.log(`   📊 Statut: ${fleet.status}`);
        console.log(`   📧 Email: ${fleet.email}`);
        console.log(`   🌐 Site web: ${fleet.website}`);
      } else {
        console.log('❌ Aucune flotte trouvée pour ce tenant');
        console.log('💡 Exécutez le script setup-saas-structure.js pour la créer');
      }
    } else {
      console.log('❌ Impossible de vérifier la flotte - Tenant non trouvé');
    }

    // 5. VÉRIFIER L'ISOLATION DES TENANTS
    console.log('\n🔒 VÉRIFICATION DE L\'ISOLATION DES TENANTS');
    console.log('-------------------------------------------');
    
    const [allUsers] = await connection.execute(
      'SELECT tenant_id, COUNT(*) as user_count FROM users GROUP BY tenant_id'
    );

    console.log('📊 Répartition des utilisateurs par tenant:');
    for (const userGroup of allUsers) {
      const [tenantInfo] = await connection.execute(
        'SELECT name, subdomain FROM tenants WHERE id = ?',
        [userGroup.tenant_id]
      );
      
      const tenantName = tenantInfo.length > 0 ? tenantInfo[0].name : `Tenant ID ${userGroup.tenant_id}`;
      const tenantSubdomain = tenantInfo.length > 0 ? tenantInfo[0].subdomain : 'N/A';
      
      console.log(`   🏢 ${tenantName} (${tenantSubdomain}): ${userGroup.user_count} utilisateur(s)`);
    }

    // 6. VÉRIFIER LES PERMISSIONS
    console.log('\n🔐 VÉRIFICATION DES PERMISSIONS');
    console.log('-------------------------------');
    
    const [adminCount] = await connection.execute(
      'SELECT COUNT(*) as count FROM users WHERE role = ?',
      ['admin']
    );
    
    const [ownerCount] = await connection.execute(
      'SELECT COUNT(*) as count FROM users WHERE role = ?',
      ['owner']
    );

    console.log(`   👑 Admins: ${adminCount[0].count}`);
    console.log(`   👤 Owners: ${ownerCount[0].count}`);

    // 7. RÉSUMÉ DE LA CONFIGURATION
    console.log('\n📋 RÉSUMÉ DE LA CONFIGURATION');
    console.log('==============================');
    
    const hasAdmin = adminUsers.length > 0;
    const hasTenant = tenants.length > 0;
    const hasOwner = ownerUsers.length > 0;
    const hasFleet = fleets && fleets.length > 0;

    console.log(`   👑 Admin Super-Utilisateur: ${hasAdmin ? '✅' : '❌'}`);
    console.log(`   🏢 Tenant Dakar Dem Dikk: ${hasTenant ? '✅' : '❌'}`);
    console.log(`   👤 User Owner: ${hasOwner ? '✅' : '❌'}`);
    console.log(`   🚗 Flotte: ${hasFleet ? '✅' : '❌'}`);

    if (hasAdmin && hasTenant && hasOwner && hasFleet) {
      console.log('\n🎉 Configuration SaaS complète et fonctionnelle !');
      console.log('\n🔗 URLs d\'accès:');
      console.log('   🌐 Admin SaaS: http://localhost:4028');
      console.log('   🏢 Tenant Dakar Dem Dikk: http://localhost:4028?tenant_subdomain=dakar-dem-dikk');
      console.log('\n👤 Identifiants de connexion:');
      console.log('   📧 Admin: admin@admin.com / admin1234');
      console.log('   📧 Owner: mamadou.diallo@dakar-dem-dikk.com / Dakar2024!');
    } else {
      console.log('\n⚠️  Configuration incomplète');
      console.log('💡 Exécutez le script setup-saas-structure.js pour compléter la configuration');
    }

  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Conseil: Vérifiez que MySQL est démarré et que les paramètres de connexion sont corrects.');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('💡 Conseil: Vérifiez les identifiants de connexion à la base de données.');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.log('💡 Conseil: Vérifiez que la base de données existe et que le nom est correct.');
    }
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Connexion fermée');
    }
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

  await verifySaaSStructure();
}

// Exécuter le script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { verifySaaSStructure }; 