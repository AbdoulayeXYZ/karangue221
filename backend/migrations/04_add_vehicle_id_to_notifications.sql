-- Add vehicle_id column to notifications table
ALTER TABLE notifications 
ADD COLUMN vehicle_id INT,
ADD FOREIGN KEY (vehicle_id) REFERENCES vehicles(id);

-- Add index for better performance
CREATE INDEX idx_notifications_vehicle_id ON notifications(vehicle_id);
CREATE INDEX idx_notifications_user_status ON notifications(user_id, status);
CREATE INDEX idx_notifications_timestamp ON notifications(timestamp DESC);

-- Insert some sample notifications for testing
INSERT INTO notifications (user_id, type, message, status, timestamp, vehicle_id) VALUES
(1, 'system', 'Système de notifications activé avec succès', 'read', NOW(), NULL),
(1, 'vehicle', 'Véhicule SN-001 connecté au système GPS', 'unread', NOW() - INTERVAL 5 MINUTE, 1),
(1, 'alert', 'Véhicule SN-002 en excès de vitesse - 85 km/h dans une zone 50', 'unread', NOW() - INTERVAL 10 MINUTE, 2),
(1, 'maintenance', 'Maintenance programmée pour le véhicule SN-003 demain à 9h00', 'unread', NOW() - INTERVAL 15 MINUTE, 3),
(1, 'driver', 'Conducteur Jean Dupont a terminé son trajet', 'read', NOW() - INTERVAL 30 MINUTE, 1),
(1, 'error', 'Perte de signal GPS - Véhicule SN-004', 'unread', NOW() - INTERVAL 45 MINUTE, 4),
(1, 'success', 'Mise à jour du firmware terminée pour tous les véhicules', 'read', NOW() - INTERVAL 1 HOUR, NULL),
(1, 'warning', 'Niveau de carburant faible - Véhicule SN-005', 'unread', NOW() - INTERVAL 2 HOUR, 5); 