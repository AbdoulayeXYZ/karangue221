#!/usr/bin/env node

/**
 * Script pour créer des tenants de démonstration pour Karangué221
 */

require('dotenv').config();
const db = require('../config/db');

async function createDemoTenants() {
  console.log('🏢 Création des tenants de démonstration...');

  try {
    // Définir les tenants de démonstration
    const demoTenants = [
      {
        name: 'DDD Transport',
        subdomain: 'ddd',
        domain: 'ddd.karangue221.com',
        plan: 'premium',
        settings: JSON.stringify({
          features: ['gps_tracking', 'driver_analytics', 'fleet_management'],
          max_vehicles: 100,
          max_drivers: 50
        })
      },
      {
        name: 'Test Owner Company',
        subdomain: 'testowner',
        domain: 'testowner.karangue221.com',
        plan: 'basic',
        settings: JSON.stringify({
          features: ['gps_tracking', 'basic_reporting'],
          max_vehicles: 20,
          max_drivers: 10
        })
      },
      {
        name: 'TransDakar SARL',
        subdomain: 'transdakar',
        domain: 'transdakar.karangue221.com',
        plan: 'enterprise',
        settings: JSON.stringify({
          features: ['gps_tracking', 'driver_analytics', 'fleet_management', 'api_access', 'advanced_reporting'],
          max_vehicles: 500,
          max_drivers: 200
        })
      },
      {
        name: 'FleetDemo',
        subdomain: 'demo',
        domain: 'demo.karangue221.com',
        plan: 'basic',
        settings: JSON.stringify({
          features: ['gps_tracking'],
          max_vehicles: 5,
          max_drivers: 3
        })
      }
    ];

    // Créer chaque tenant
    for (const tenantData of demoTenants) {
      try {
        // Vérifier si le tenant existe déjà
        const [existing] = await db.execute(
          'SELECT id FROM tenants WHERE subdomain = ?',
          [tenantData.subdomain]
        );

        if (existing.length > 0) {
          console.log(`⚠️  Tenant ${tenantData.name} (${tenantData.subdomain}) existe déjà`);
          continue;
        }

        // Créer le tenant
        const [result] = await db.execute(`
          INSERT INTO tenants (name, subdomain, domain, plan, settings, status)
          VALUES (?, ?, ?, ?, ?, 'active')
        `, [
          tenantData.name,
          tenantData.subdomain,
          tenantData.domain,
          tenantData.plan,
          tenantData.settings
        ]);

        console.log(`✅ Tenant créé: ${tenantData.name} (ID: ${result.insertId})`);
        console.log(`   🌐 URL: https://${tenantData.domain}`);
        console.log(`   📋 Plan: ${tenantData.plan}`);

        // Créer quelques données de test pour le tenant
        await createSampleDataForTenant(result.insertId, tenantData);

      } catch (error) {
        console.error(`❌ Erreur lors de la création du tenant ${tenantData.name}:`, error.message);
      }
    }

    console.log('\n🎯 Tenants de démonstration créés avec succès !');
    console.log('\n📝 Vous pouvez maintenant tester avec:');
    console.log('   • https://ddd.karangue221.com');
    console.log('   • https://testowner.karangue221.com');
    console.log('   • https://transdakar.karangue221.com');
    console.log('   • https://demo.karangue221.com');
    console.log('\n🔧 En développement, utilisez:');
    console.log('   • http://localhost:4028?tenant_subdomain=ddd');
    console.log('   • http://localhost:4028?tenant_subdomain=testowner');

  } catch (error) {
    console.error('❌ Erreur générale:', error);
  } finally {
    process.exit(0);
  }
}

async function createSampleDataForTenant(tenantId, tenantData) {
  try {
    // Obtenir un utilisateur existant pour owner_id
    const [users] = await db.execute('SELECT id FROM users LIMIT 1');
    const ownerId = users.length > 0 ? users[0].id : 3;

    // Créer une flotte exemple
    const [fleetResult] = await db.execute(`
      INSERT INTO fleets (name, description, status, tenant_id, owner_id)
      VALUES (?, ?, 'active', ?, ?)
    `, [
      `Flotte ${tenantData.name}`,
      `Flotte principale de ${tenantData.name}`,
      tenantId,
      ownerId
    ]);

    // Créer quelques conducteurs exemple
    const drivers = [
      { first_name: 'Moussa', last_name: 'Diop', phone: '+221771234567', license: 'D001' },
      { first_name: 'Awa', last_name: 'Fall', phone: '+221772345678', license: 'D002' },
      { first_name: 'Ibrahima', last_name: 'Sarr', phone: '+221773456789', license: 'D003' }
    ];

    for (const driver of drivers) {
      await db.execute(`
        INSERT INTO drivers (first_name, last_name, phone, license_number, status, tenant_id, fleet_id)
        VALUES (?, ?, ?, ?, 'active', ?, ?)
      `, [
        driver.first_name,
        driver.last_name,
        driver.phone,
        `${driver.license}_${tenantData.subdomain}`,
        tenantId,
        fleetResult.insertId
      ]);
    }

    console.log(`   📊 Données exemple créées: 1 flotte, ${drivers.length} conducteurs`);

  } catch (error) {
    console.warn(`⚠️  Impossible de créer les données exemple pour ${tenantData.name}:`, error.message);
  }
}

// Lancer le script
if (require.main === module) {
  createDemoTenants();
}

module.exports = createDemoTenants;
