#!/usr/bin/env node

/**
 * Script de test d'isolation multi-tenant pour Karangué221
 * 
 * Ce script vérifie que les données sont bien isolées entre les tenants
 * et que les opérations CRUD respectent la segmentation multi-tenant
 */

require('dotenv').config();
const db = require('../config/db');
const tenantController = require('../controllers/tenantController');
const driverController = require('../controllers/driverController');
const fleetController = require('../controllers/fleetController');

class TenantIsolationTester {
  constructor() {
    this.testResults = [];
    this.testTenants = [];
  }

  /**
   * Log des résultats de test
   */
  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = {
      'info': '📝',
      'success': '✅',
      'error': '❌',
      'warning': '⚠️'
    }[type] || '📝';
    
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  /**
   * Enregistre un résultat de test
   */
  recordTest(testName, passed, message) {
    this.testResults.push({
      name: testName,
      passed,
      message,
      timestamp: new Date().toISOString()
    });
    
    this.log(`${testName}: ${message}`, passed ? 'success' : 'error');
  }

  /**
   * Crée des tenants de test
   */
  async createTestTenants() {
    this.log('Création des tenants de test...');
    
    try {
      // Mock request objects pour les tests
      const createMockRequest = (body, tenant = null, user = { role: 'admin' }) => ({
        body,
        tenant_id: tenant?.id,
        tenant: tenant,
        user,
        params: {},
        query: {}
      });

      const createMockResponse = () => {
        const res = {
          status: (code) => res,
          json: (data) => { res.data = data; return res; },
          data: null
        };
        return res;
      };

      // Créer le premier tenant de test
      const req1 = createMockRequest({
        name: 'Tenant Test 1',
        subdomain: 'test1',
        domain: 'test1.karangue221.com',
        plan: 'basic'
      });
      const res1 = createMockResponse();
      
      await tenantController.createTenant(req1, res1);
      
      if (res1.data && res1.data.success) {
        this.testTenants.push(res1.data.tenant);
        this.log(`Tenant 1 créé: ${res1.data.tenant.name} (ID: ${res1.data.tenant.id})`);
      } else {
        throw new Error('Échec de création du tenant 1');
      }

      // Créer le deuxième tenant de test
      const req2 = createMockRequest({
        name: 'Tenant Test 2',
        subdomain: 'test2',
        domain: 'test2.karangue221.com',
        plan: 'premium'
      });
      const res2 = createMockResponse();
      
      await tenantController.createTenant(req2, res2);
      
      if (res2.data && res2.data.success) {
        this.testTenants.push(res2.data.tenant);
        this.log(`Tenant 2 créé: ${res2.data.tenant.name} (ID: ${res2.data.tenant.id})`);
      } else {
        throw new Error('Échec de création du tenant 2');
      }

      this.recordTest(
        'Création des tenants de test',
        this.testTenants.length === 2,
        `${this.testTenants.length}/2 tenants créés avec succès`
      );

    } catch (error) {
      this.recordTest(
        'Création des tenants de test',
        false,
        `Erreur: ${error.message}`
      );
      throw error;
    }
  }

  /**
   * Teste l'isolation des données des conducteurs
   */
  async testDriverIsolation() {
    this.log('Test d\'isolation des conducteurs...');
    
    try {
      const [tenant1, tenant2] = this.testTenants;
      
      // Mock de requêtes pour créer des conducteurs
      const createDriverRequest = (driverData, tenant) => ({
        body: driverData,
        tenant_id: tenant.id,
        tenant: tenant,
        user: { id: 1, role: 'manager' },
        params: {},
        query: {}
      });

      const createMockResponse = () => {
        const res = {
          status: (code) => res,
          json: (data) => { res.data = data; return res; },
          data: null
        };
        return res;
      };

      // Créer une flotte pour le tenant 1 d'abord
      const fleet1Data = {
        name: 'Test Fleet 1',
        description: 'Fleet for testing tenant 1',
        status: 'active'
      };
      
      const fleetReq1 = createDriverRequest(fleet1Data, tenant1);
      const fleetRes1 = createMockResponse();
      
      // Obtenir un utilisateur existant pour owner_id
      const [users] = await db.execute('SELECT id FROM users LIMIT 1');
      const ownerId = users.length > 0 ? users[0].id : 3; // Fallback vers l'admin
      
      // Créer la flotte via SQL direct pour simplifier
      const [fleet1Result] = await db.execute(
        'INSERT INTO fleets (name, description, status, tenant_id, owner_id) VALUES (?, ?, ?, ?, ?)',
        [fleet1Data.name, fleet1Data.description, fleet1Data.status, tenant1.id, ownerId]
      );
      const fleet1Id = fleet1Result.insertId;
      
      // Créer une flotte pour le tenant 2
      const fleet2Data = {
        name: 'Test Fleet 2',
        description: 'Fleet for testing tenant 2',
        status: 'active'
      };
      
      const [fleet2Result] = await db.execute(
        'INSERT INTO fleets (name, description, status, tenant_id, owner_id) VALUES (?, ?, ?, ?, ?)',
        [fleet2Data.name, fleet2Data.description, fleet2Data.status, tenant2.id, ownerId]
      );
      const fleet2Id = fleet2Result.insertId;

      // Créer un conducteur pour le tenant 1
      const driver1Data = {
        first_name: 'John',
        last_name: 'Doe',
        phone: '+221123456789',
        license_number: 'LIC001',
        status: 'active',
        fleet_id: fleet1Id
      };
      
      const req1 = createDriverRequest(driver1Data, tenant1);
      const res1 = createMockResponse();
      await driverController.create(req1, res1);
      
      if (!res1.data || !res1.data.success) {
        throw new Error('Échec création conducteur tenant 1');
      }
      
      const createdDriver1 = res1.data.driver;

      // Créer un conducteur pour le tenant 2
      const driver2Data = {
        first_name: 'Jane',
        last_name: 'Smith',
        phone: '+221987654321',
        license_number: 'LIC002',
        status: 'active',
        fleet_id: fleet2Id
      };
      
      const req2 = createDriverRequest(driver2Data, tenant2);
      const res2 = createMockResponse();
      await driverController.create(req2, res2);
      
      if (!res2.data || !res2.data.success) {
        throw new Error('Échec création conducteur tenant 2');
      }
      
      const createdDriver2 = res2.data.driver;

      // Test 1: Vérifier que tenant 1 ne voit que ses conducteurs
      const getAllReq1 = {
        tenant_id: tenant1.id,
        tenant: tenant1,
        user: { id: 1, role: 'manager' },
        params: {},
        query: {}
      };
      const getAllRes1 = createMockResponse();
      await driverController.getAll(getAllReq1, getAllRes1);
      
      const tenant1Drivers = getAllRes1.data.drivers || [];
      const hasOnlyTenant1Driver = tenant1Drivers.every(d => d.tenant_id === tenant1.id);
      const hasTenant1Driver = tenant1Drivers.some(d => d.id === createdDriver1.id);
      const hasTenant2Driver = tenant1Drivers.some(d => d.id === createdDriver2.id);
      
      this.recordTest(
        'Isolation conducteurs - Tenant 1',
        hasOnlyTenant1Driver && hasTenant1Driver && !hasTenant2Driver,
        `Tenant 1 voit ${tenant1Drivers.length} conducteurs (correct: tous du tenant 1, contient le bon driver, pas celui du tenant 2)`
      );

      // Test 2: Vérifier que tenant 2 ne voit que ses conducteurs
      const getAllReq2 = {
        tenant_id: tenant2.id,
        tenant: tenant2,
        user: { id: 1, role: 'manager' },
        params: {},
        query: {}
      };
      const getAllRes2 = createMockResponse();
      await driverController.getAll(getAllReq2, getAllRes2);
      
      const tenant2Drivers = getAllRes2.data.drivers || [];
      const hasOnlyTenant2Driver = tenant2Drivers.every(d => d.tenant_id === tenant2.id);
      const hasTenant2DriverInList = tenant2Drivers.some(d => d.id === createdDriver2.id);
      const hasTenant1DriverInList = tenant2Drivers.some(d => d.id === createdDriver1.id);
      
      this.recordTest(
        'Isolation conducteurs - Tenant 2',
        hasOnlyTenant2Driver && hasTenant2DriverInList && !hasTenant1DriverInList,
        `Tenant 2 voit ${tenant2Drivers.length} conducteurs (correct: tous du tenant 2, contient le bon driver, pas celui du tenant 1)`
      );

      // Test 3: Vérifier qu'un tenant ne peut pas accéder aux données d'un autre tenant
      const getOtherDriverReq = {
        params: { id: createdDriver2.id },
        tenant_id: tenant1.id,
        tenant: tenant1,
        user: { id: 1, role: 'manager' },
        query: {}
      };
      const getOtherDriverRes = createMockResponse();
      await driverController.getById(getOtherDriverReq, getOtherDriverRes);
      
      // Devrait retourner 404 ou null car le conducteur n'appartient pas au tenant 1
      const cannotAccessOtherTenantData = !getOtherDriverRes.data || 
                                         !getOtherDriverRes.data.success || 
                                         !getOtherDriverRes.data.driver;
      
      this.recordTest(
        'Protection accès croisé',
        cannotAccessOtherTenantData,
        'Tenant 1 ne peut pas accéder aux données du conducteur du tenant 2'
      );

    } catch (error) {
      this.recordTest(
        'Test isolation conducteurs',
        false,
        `Erreur: ${error.message}`
      );
    }
  }

  /**
   * Teste les opérations de mise à jour et suppression avec isolation
   */
  async testCRUDIsolation() {
    this.log('Test d\'isolation CRUD...');
    
    try {
      // Créer des données de test pour chaque tenant
      const [tenant1, tenant2] = this.testTenants;
      
      // Obtenir un utilisateur existant pour owner_id
      const [users] = await db.execute('SELECT id FROM users LIMIT 1');
      const ownerId = users.length > 0 ? users[0].id : 3; // Fallback vers l'admin
      
      // Créer des flottes pour les tests CRUD
      const [crudFleet1] = await db.execute(
        'INSERT INTO fleets (name, description, status, tenant_id, owner_id) VALUES (?, ?, ?, ?, ?)',
        ['CRUD Test Fleet 1', 'Fleet for CRUD testing tenant 1', 'active', tenant1.id, ownerId]
      );
      
      const [crudFleet2] = await db.execute(
        'INSERT INTO fleets (name, description, status, tenant_id, owner_id) VALUES (?, ?, ?, ?, ?)',
        ['CRUD Test Fleet 2', 'Fleet for CRUD testing tenant 2', 'active', tenant2.id, ownerId]
      );
      
      // Simuler la création de données via SQL direct pour avoir un contrôle total
      const [driver1Result] = await db.execute(
        'INSERT INTO drivers (first_name, last_name, phone, license_number, status, tenant_id, fleet_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
        ['Test', 'Driver1', '+221111111111', 'TEST001', 'active', tenant1.id, crudFleet1.insertId]
      );
      
      const [driver2Result] = await db.execute(
        'INSERT INTO drivers (first_name, last_name, phone, license_number, status, tenant_id, fleet_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
        ['Test', 'Driver2', '+221222222222', 'TEST002', 'active', tenant2.id, crudFleet2.insertId]
      );
      
      const driver1Id = driver1Result.insertId;
      const driver2Id = driver2Result.insertId;

      // Test 1: Tenant 1 essaie de modifier le conducteur du tenant 2
      const updateOtherTenantReq = {
        params: { id: driver2Id },
        body: { first_name: 'Modified' },
        tenant_id: tenant1.id,
        tenant: tenant1,
        user: { id: 1, role: 'manager' },
        query: {}
      };
      
      const updateOtherTenantRes = {
        status: (code) => updateOtherTenantRes,
        json: (data) => { updateOtherTenantRes.data = data; return updateOtherTenantRes; },
        data: null
      };
      
      await driverController.update(updateOtherTenantReq, updateOtherTenantRes);
      
      // Vérifier que la modification a été refusée
      const updateBlocked = !updateOtherTenantRes.data || !updateOtherTenantRes.data.success;
      
      this.recordTest(
        'Blocage modification cross-tenant',
        updateBlocked,
        'Tenant 1 ne peut pas modifier les données du tenant 2'
      );

      // Test 2: Tenant 1 essaie de supprimer le conducteur du tenant 2
      const deleteOtherTenantReq = {
        params: { id: driver2Id },
        tenant_id: tenant1.id,
        tenant: tenant1,
        user: { id: 1, role: 'manager' },
        query: {}
      };
      
      const deleteOtherTenantRes = {
        status: (code) => deleteOtherTenantRes,
        json: (data) => { deleteOtherTenantRes.data = data; return deleteOtherTenantRes; },
        data: null
      };
      
      await driverController.remove(deleteOtherTenantReq, deleteOtherTenantRes);
      
      // Vérifier que la suppression a été refusée
      const deleteBlocked = !deleteOtherTenantRes.data || !deleteOtherTenantRes.data.success;
      
      this.recordTest(
        'Blocage suppression cross-tenant',
        deleteBlocked,
        'Tenant 1 ne peut pas supprimer les données du tenant 2'
      );

      // Test 3: Vérifier que les données sont toujours intactes
      const [checkDriver2] = await db.execute(
        'SELECT * FROM drivers WHERE id = ? AND tenant_id = ?',
        [driver2Id, tenant2.id]
      );
      
      const dataIntact = checkDriver2.length > 0 && checkDriver2[0].first_name === 'Test';
      
      this.recordTest(
        'Intégrité des données',
        dataIntact,
        'Les données du tenant 2 sont restées intactes malgré les tentatives d\'accès du tenant 1'
      );

    } catch (error) {
      this.recordTest(
        'Test isolation CRUD',
        false,
        `Erreur: ${error.message}`
      );
    }
  }

  /**
   * Nettoie les données de test
   */
  async cleanup() {
    this.log('Nettoyage des données de test...');
    
    try {
      for (const tenant of this.testTenants) {
        // Supprimer les données associées au tenant
        await db.execute('DELETE FROM drivers WHERE tenant_id = ?', [tenant.id]);
        await db.execute('DELETE FROM fleets WHERE tenant_id = ?', [tenant.id]);
        await db.execute('DELETE FROM vehicles WHERE tenant_id = ?', [tenant.id]);
        
        // Supprimer le tenant lui-même
        await db.execute('DELETE FROM tenants WHERE id = ?', [tenant.id]);
        
        this.log(`Tenant ${tenant.name} (ID: ${tenant.id}) supprimé`);
      }
      
      this.recordTest(
        'Nettoyage des données de test',
        true,
        `${this.testTenants.length} tenants et leurs données supprimés`
      );
      
    } catch (error) {
      this.recordTest(
        'Nettoyage des données de test',
        false,
        `Erreur: ${error.message}`
      );
    }
  }

  /**
   * Génère un rapport de test
   */
  generateReport() {
    const totalTests = this.testResults.length;
    const passedTests = this.testResults.filter(t => t.passed).length;
    const failedTests = totalTests - passedTests;
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 RAPPORT DE TEST D\'ISOLATION MULTI-TENANT');
    console.log('='.repeat(60));
    console.log(`✅ Tests réussis: ${passedTests}`);
    console.log(`❌ Tests échoués: ${failedTests}`);
    console.log(`📊 Total: ${totalTests}`);
    console.log(`📈 Taux de réussite: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
    
    if (failedTests > 0) {
      console.log('\n❌ TESTS ÉCHOUÉS:');
      this.testResults
        .filter(t => !t.passed)
        .forEach(test => {
          console.log(`  • ${test.name}: ${test.message}`);
        });
    }
    
    console.log('\n📝 DÉTAILS DES TESTS:');
    this.testResults.forEach(test => {
      const status = test.passed ? '✅' : '❌';
      console.log(`  ${status} ${test.name}: ${test.message}`);
    });
    
    console.log('='.repeat(60));
    
    return passedTests === totalTests;
  }

  /**
   * Lance tous les tests
   */
  async runTests() {
    this.log('🚀 Démarrage des tests d\'isolation multi-tenant');
    
    try {
      await this.createTestTenants();
      await this.testDriverIsolation();
      await this.testCRUDIsolation();
      
    } catch (error) {
      this.log(`Erreur lors des tests: ${error.message}`, 'error');
    } finally {
      await this.cleanup();
      const allTestsPassed = this.generateReport();
      
      // Code de sortie basé sur les résultats
      process.exit(allTestsPassed ? 0 : 1);
    }
  }
}

// Lancer les tests si ce script est exécuté directement
if (require.main === module) {
  const tester = new TenantIsolationTester();
  tester.runTests();
}

module.exports = TenantIsolationTester;
