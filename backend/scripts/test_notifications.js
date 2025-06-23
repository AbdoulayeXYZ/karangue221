const Notification = require('../models/notificationModel');

async function createTestNotifications() {
  try {
    console.log('Creating test notifications...');

    const testNotifications = [
      {
        user_id: 3,
        type: 'system',
        message: 'Système de notifications activé avec succès',
        status: 'read',
        timestamp: new Date(),
        vehicle_id: null
      },
      {
        user_id: 3,
        type: 'vehicle',
        message: 'Véhicule SN-001 connecté au système GPS',
        status: 'unread',
        timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
        vehicle_id: 1
      },
      {
        user_id: 3,
        type: 'alert',
        message: 'Véhicule SN-002 en excès de vitesse - 85 km/h dans une zone 50',
        status: 'unread',
        timestamp: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
        vehicle_id: 2
      },
      {
        user_id: 3,
        type: 'maintenance',
        message: 'Maintenance programmée pour le véhicule SN-003 demain à 9h00',
        status: 'unread',
        timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
        vehicle_id: 3
      },
      {
        user_id: 3,
        type: 'driver',
        message: 'Conducteur Jean Dupont a terminé son trajet',
        status: 'read',
        timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
        vehicle_id: 1
      },
      {
        user_id: 3,
        type: 'error',
        message: 'Perte de signal GPS - Véhicule SN-004',
        status: 'unread',
        timestamp: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
        vehicle_id: 4
      },
      {
        user_id: 3,
        type: 'success',
        message: 'Mise à jour du firmware terminée pour tous les véhicules',
        status: 'read',
        timestamp: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
        vehicle_id: null
      },
      {
        user_id: 3,
        type: 'warning',
        message: 'Niveau de carburant faible - Véhicule SN-005',
        status: 'unread',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        vehicle_id: 5
      },
      {
        user_id: 3,
        type: 'alert',
        message: 'Freinage brusque détecté - Véhicule SN-001',
        status: 'unread',
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
        vehicle_id: 1
      },
      {
        user_id: 3,
        type: 'maintenance',
        message: 'Vidange d\'huile requise - Véhicule SN-002',
        status: 'unread',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
        vehicle_id: 2
      }
    ];

    // Clear existing test notifications for this user
    const existingNotifications = await Notification.getAll(3);
    for (const notification of existingNotifications) {
      await Notification.remove(notification.id);
    }
    console.log('Cleared existing notifications for user 3');

    // Create new test notifications
    for (const notification of testNotifications) {
      await Notification.create(notification);
    }

    console.log(`✅ Created ${testNotifications.length} test notifications`);

    // Get unread count
    const unreadCount = await Notification.getUnreadCount(3);
    console.log(`📊 Unread notifications: ${unreadCount}`);

    // Get all notifications
    const allNotifications = await Notification.getAll(3);
    console.log(`📊 Total notifications: ${allNotifications.length}`);

  } catch (error) {
    console.error('❌ Error creating test notifications:', error);
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  createTestNotifications()
    .then(() => {
      console.log('✅ Test notifications created successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Failed to create test notifications:', error);
      process.exit(1);
    });
}

module.exports = { createTestNotifications }; 