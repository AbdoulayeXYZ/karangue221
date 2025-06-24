#!/usr/bin/env node

/**
 * Script pour créer le tenant Salam Transport avec utilisateurs et données complètes
 */

require('dotenv').config();
const db = require('../config/db');
const bcrypt = require('bcrypt');

async function createSalamTransport() {
  console.log('🚛 Création du tenant Salam Transport...');

  try {
    // 1. Créer le tenant Salam Transport
    console.log('\n📋 Étape 1: Création du tenant...');
    
    // Vérifier si le tenant existe déjà
    const [existingTenant] = await db.execute(
      'SELECT id FROM tenants WHERE subdomain = ?',
      ['salam']
    );

    let tenantId;
    if (existingTenant.length > 0) {
      tenantId = existingTenant[0].id;
      console.log(`⚠️  Tenant Salam Transport existe déjà (ID: ${tenantId})`);
    } else {
      // Créer le nouveau tenant
      const [tenantResult] = await db.execute(`
        INSERT INTO tenants (name, subdomain, domain, plan, settings, status)
        VALUES (?, ?, ?, ?, ?, 'active')
      `, [
        'Salam Transport',
        'salam',
        'salam.karangue221.com',
        'premium',
        JSON.stringify({
          features: ['gps_tracking', 'driver_analytics', 'fleet_management', 'maintenance_alerts'],
          max_vehicles: 150,
          max_drivers: 75,
          language: 'fr',
          timezone: 'Africa/Dakar'
        })
      ]);

      tenantId = tenantResult.insertId;
      console.log(`✅ Tenant créé: Salam Transport (ID: ${tenantId})`);
    }

    // 2. Créer les utilisateurs pour ce tenant
    console.log('\n👥 Étape 2: Création des utilisateurs...');
    
    const users = [
      {
        email: 'admin@salamtransport.sn',
        password: 'SalamAdmin2024!',
        name: 'Amadou DIALLO',
        role: 'admin',
        phone: '+221771234567'
      },
      {
        email: 'owner@salamtransport.sn', 
        password: 'SalamOwner2024!',
        name: 'Fatou NDIAYE',
        role: 'owner',
        phone: '+221772345678'
      },
      {
        email: 'manager@salamtransport.sn',
        password: 'SalamManager2024!',
        name: 'Ousmane FALL',
        role: 'admin',
        phone: '+221773456789'
      }
    ];

    const createdUsers = [];
    
    for (const userData of users) {
      // Vérifier si l'utilisateur existe déjà
      const [existingUser] = await db.execute(
        'SELECT id FROM users WHERE email = ? AND tenant_id = ?',
        [userData.email, tenantId]
      );

      if (existingUser.length > 0) {
        console.log(`⚠️  Utilisateur ${userData.email} existe déjà`);
        createdUsers.push({...userData, id: existingUser[0].id});
        continue;
      }

      // Hasher le mot de passe
      const hashedPassword = await bcrypt.hash(userData.password, 10);

      // Créer l'utilisateur
      const [userResult] = await db.execute(`
        INSERT INTO users (email, password_hash, name, role, phone, tenant_id, status)
        VALUES (?, ?, ?, ?, ?, ?, 'active')
      `, [
        userData.email,
        hashedPassword,
        userData.name,
        userData.role,
        userData.phone,
        tenantId
      ]);

      createdUsers.push({...userData, id: userResult.insertId});
      console.log(`✅ Utilisateur créé: ${userData.name} (${userData.role})`);
    }

    // 3. Créer les flottes
    console.log('\n🚛 Étape 3: Création des flottes...');
    
    const adminUser = createdUsers.find(u => u.role === 'admin');
    
    const fleets = [
      {
        name: 'Flotte Urbaine Dakar',
        description: 'Véhicules pour les liaisons urbaines de Dakar',
        owner_id: adminUser.id
      },
      {
        name: 'Flotte Interurbaine',
        description: 'Véhicules pour les liaisons interurbaines',
        owner_id: adminUser.id
      },
      {
        name: 'Flotte Marchandises',
        description: 'Véhicules pour le transport de marchandises',
        owner_id: adminUser.id
      }
    ];

    const createdFleets = [];
    
    for (const fleetData of fleets) {
      const [fleetResult] = await db.execute(`
        INSERT INTO fleets (name, description, status, tenant_id, owner_id, max_vehicles, city, country)
        VALUES (?, ?, 'active', ?, ?, ?, 'Dakar', 'Sénégal')
      `, [
        fleetData.name,
        fleetData.description,
        tenantId,
        fleetData.owner_id,
        50 // max_vehicles par flotte
      ]);

      createdFleets.push({...fleetData, id: fleetResult.insertId});
      console.log(`✅ Flotte créée: ${fleetData.name}`);
    }

    // 4. Créer les conducteurs
    console.log('\n👨‍✈️ Étape 4: Création des conducteurs...');
    
    const drivers = [
      {
        first_name: 'Mamadou',
        last_name: 'KANE',
        phone: '+221775551111',
        license_number: 'SL001DK2024',
        fleet_id: createdFleets[0].id,
        experience: '5 ans'
      },
      {
        first_name: 'Aïssatou',
        last_name: 'SOW',
        phone: '+221775552222',
        license_number: 'SL002DK2024',
        fleet_id: createdFleets[0].id,
        experience: '3 ans'
      },
      {
        first_name: 'Ibrahima',
        last_name: 'DIOUF',
        phone: '+221775553333',
        license_number: 'SL003DK2024',
        fleet_id: createdFleets[1].id,
        experience: '8 ans'
      },
      {
        first_name: 'Mariama',
        last_name: 'CAMARA',
        phone: '+221775554444',
        license_number: 'SL004DK2024',
        fleet_id: createdFleets[1].id,
        experience: '4 ans'
      },
      {
        first_name: 'Cheikh',
        last_name: 'MBENGUE',
        phone: '+221775555555',
        license_number: 'SL005DK2024',
        fleet_id: createdFleets[2].id,
        experience: '10 ans'
      }
    ];

    for (const driverData of drivers) {
      const [driverResult] = await db.execute(`
        INSERT INTO drivers (first_name, last_name, phone, license_number, status, tenant_id, fleet_id, experience, hire_date)
        VALUES (?, ?, ?, ?, 'active', ?, ?, ?, CURDATE())
      `, [
        driverData.first_name,
        driverData.last_name,
        driverData.phone,
        driverData.license_number,
        tenantId,
        driverData.fleet_id,
        driverData.experience
      ]);

      console.log(`✅ Conducteur créé: ${driverData.first_name} ${driverData.last_name} (${driverData.license_number})`);
    }

    // 5. Créer quelques véhicules
    console.log('\n🚌 Étape 5: Création des véhicules...');
    
    const vehicles = [
      {
        registration: 'DK-2024-ST01',
        brand: 'Mercedes-Benz',
        model: 'Sprinter',
        year: 2023,
        vin_number: 'WDAPF4CC0N1234567',
        fleet_id: createdFleets[0].id,
        type: 'bus',
        color: 'Blanc'
      },
      {
        registration: 'DK-2024-ST02',
        brand: 'Iveco',
        model: 'Daily',
        year: 2023,
        vin_number: 'ZCFC35A0005234567',
        fleet_id: createdFleets[0].id,
        type: 'minibus',
        color: 'Bleu'
      },
      {
        registration: 'DK-2024-ST03',
        brand: 'MAN',
        model: 'Lion Coach',
        year: 2022,
        vin_number: 'WMAN26XXX4M234567',
        fleet_id: createdFleets[1].id,
        type: 'bus',
        color: 'Rouge'
      },
      {
        registration: 'DK-2024-ST04',
        brand: 'Renault',
        model: 'Master',
        year: 2023,
        vin_number: 'VF1MA000X65234567',
        fleet_id: createdFleets[2].id,
        type: 'van',
        color: 'Blanc'
      },
      {
        registration: 'DK-2024-ST05',
        brand: 'Ford',
        model: 'Transit',
        year: 2022,
        vin_number: '1FTBW2CM5GKA34567',
        fleet_id: createdFleets[2].id,
        type: 'van',
        color: 'Gris'
      }
    ];

    for (const vehicleData of vehicles) {
      const [vehicleResult] = await db.execute(`
        INSERT INTO vehicles (registration, brand, model, year, vin_number, fleet_id, tenant_id, status, type, fuel_type, mileage, color)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'active', ?, 'diesel', ?, ?)
      `, [
        vehicleData.registration,
        vehicleData.brand,
        vehicleData.model,
        vehicleData.year,
        vehicleData.vin_number,
        vehicleData.fleet_id,
        tenantId,
        vehicleData.type,
        Math.floor(Math.random() * 50000) + 10000, // Kilométrage aléatoire
        vehicleData.color
      ]);

      console.log(`✅ Véhicule créé: ${vehicleData.registration} - ${vehicleData.brand} ${vehicleData.model}`);
    }

    // 6. Afficher le récapitulatif
    console.log('\n' + '='.repeat(60));
    console.log('🎉 TENANT SALAM TRANSPORT CRÉÉ AVEC SUCCÈS !');
    console.log('='.repeat(60));
    
    console.log('\n🏢 INFORMATIONS DU TENANT:');
    console.log(`Nom: Salam Transport`);
    console.log(`Sous-domaine: salam`);
    console.log(`URL de production: https://salam.karangue221.com`);
    console.log(`URL de développement: http://localhost:4028?tenant_subdomain=salam`);
    console.log(`Plan: Premium`);
    console.log(`ID Tenant: ${tenantId}`);
    
    console.log('\n👥 IDENTIFIANTS DE CONNEXION:');
    console.log('\n🔑 ADMINISTRATEUR:');
    console.log(`Email: admin@salamtransport.sn`);
    console.log(`Mot de passe: SalamAdmin2024!`);
    console.log(`Nom: Amadou DIALLO`);
    console.log(`Rôle: Administrateur`);
    
    console.log('\n🔑 PROPRIÉTAIRE:');
    console.log(`Email: owner@salamtransport.sn`);
    console.log(`Mot de passe: SalamOwner2024!`);
    console.log(`Nom: Fatou NDIAYE`);
    console.log(`Rôle: Propriétaire`);
    
    console.log('\n🔑 GESTIONNAIRE:');
    console.log(`Email: manager@salamtransport.sn`);
    console.log(`Mot de passe: SalamManager2024!`);
    console.log(`Nom: Ousmane FALL`);
    console.log(`Rôle: Administrateur`);
    
    console.log('\n📊 DONNÉES CRÉÉES:');
    console.log(`• 3 utilisateurs avec rôles différents`);
    console.log(`• 3 flottes spécialisées`);
    console.log(`• 5 conducteurs qualifiés`);
    console.log(`• 5 véhicules modernes`);
    
    console.log('\n🧪 TESTS RECOMMANDÉS:');
    console.log('1. Connexion avec les identifiants admin');
    console.log('2. Vérification isolation tenant via API:');
    console.log('   curl -H "X-Tenant-Subdomain: salam" http://localhost:5001/api/tenants/info');
    console.log('3. Test des données spécifiques au tenant');
    
    console.log('\n📝 NOTES IMPORTANTES:');
    console.log('• Les mots de passe sont sécurisés (hachés avec bcrypt)');
    console.log('• Tous les utilisateurs ont le statut "actif"');
    console.log('• Le tenant est configuré en plan Premium');
    console.log('• Les données sont isolées des autres tenants');
    
    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ Erreur lors de la création du tenant:', error);
    console.error('Détails:', error.message);
  } finally {
    process.exit(0);
  }
}

// Lancer le script
if (require.main === module) {
  createSalamTransport();
}

module.exports = createSalamTransport;
