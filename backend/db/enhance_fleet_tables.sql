-- 1. Amélioration de la table fleets avec des champs additionnels pertinents
ALTER TABLE fleets
ADD COLUMN logo VARCHAR(255) NULL COMMENT 'URL du logo de la flotte',
ADD COLUMN status ENUM('active', 'inactive', 'suspended') NOT NULL DEFAULT 'active',
ADD COLUMN founding_date DATE NULL COMMENT 'Date de création de l\'entreprise',
ADD COLUMN license_number VARCHAR(50) NULL COMMENT 'Numéro de licence d\'exploitation',
ADD COLUMN main_address TEXT NULL COMMENT 'Adresse principale',
ADD COLUMN city VARCHAR(100) NULL COMMENT 'Ville principale',
ADD COLUMN postal_code VARCHAR(20) NULL COMMENT 'Code postal',
ADD COLUMN country VARCHAR(100) DEFAULT 'Sénégal',
ADD COLUMN phone VARCHAR(50) NULL,
ADD COLUMN email VARCHAR(100) NULL,
ADD COLUMN website VARCHAR(255) NULL,
ADD COLUMN max_vehicles INT DEFAULT 0 COMMENT 'Capacité maximale de véhicules autorisés',
ADD COLUMN updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP;

-- 2. Création de tables complémentaires

-- Table pour les emplacements de la flotte
CREATE TABLE IF NOT EXISTS fleet_locations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    fleet_id INT NOT NULL,
    name VARCHAR(100) NOT NULL COMMENT 'Nom de l\'emplacement (dépôt, gare, etc.)',
    type ENUM('depot', 'station', 'office', 'repair_center', 'other') NOT NULL DEFAULT 'depot',
    address TEXT NULL,
    city VARCHAR(100) NULL,
    postal_code VARCHAR(20) NULL,
    latitude DECIMAL(10, 8) NULL,
    longitude DECIMAL(11, 8) NULL,
    capacity INT NULL COMMENT 'Capacité de véhicules à cet emplacement',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (fleet_id) REFERENCES fleets(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table pour les contacts de la flotte
CREATE TABLE IF NOT EXISTS fleet_contacts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    fleet_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(100) NULL,
    department VARCHAR(100) NULL,
    phone VARCHAR(50) NULL,
    email VARCHAR(100) NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (fleet_id) REFERENCES fleets(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Insertion des données de Dakar Dem Dikk

-- Insérer dans la table fleets
INSERT INTO fleets (
    name, 
    description, 
    owner_id, 
    logo, 
    status, 
    founding_date, 
    license_number, 
    main_address, 
    city, 
    postal_code, 
    phone, 
    email, 
    website, 
    max_vehicles
) VALUES (
    'Dakar Dem Dikk',
    'Société de transport public officielle de Dakar, fournissant des services de bus urbains et interurbains dans la région de Dakar et ses environs.',
    1, -- Supposant que l'ID du propriétaire est 1
    'https://example.com/logos/ddd_logo.png',
    'active',
    '2000-10-21',
    'LIC-DKR-2000-01',
    'Autoroute Seydina Limamou Laye, Parcelles Assainies',
    'Dakar',
    '11000',
    '+221 33 879 61 61',
    'contact@dakardemdikk.sn',
    'https://www.dakardemdikk.sn',
    500
);

-- Récupérer l'ID de la flotte nouvellement créée
SET @dakar_dem_dikk_id = LAST_INSERT_ID();

-- Insérer les emplacements de la flotte
INSERT INTO fleet_locations (
    fleet_id, 
    name, 
    type, 
    address, 
    city, 
    latitude, 
    longitude, 
    capacity
) VALUES 
(@dakar_dem_dikk_id, 'Dépôt Principal Parcelles Assainies', 'depot', 'Autoroute Seydina Limamou Laye, Parcelles Assainies', 'Dakar', 14.7645, -17.4150, 200),
(@dakar_dem_dikk_id, 'Gare de Petersen', 'station', 'Avenue Blaise Diagne, Plateau', 'Dakar', 14.6814, -17.4387, 50),
(@dakar_dem_dikk_id, 'Centre Technique Pikine', 'repair_center', 'Route Nationale 1, Pikine', 'Dakar', 14.7556, -17.3925, 75),
(@dakar_dem_dikk_id, 'Bureau Central Plateau', 'office', 'Avenue Faidherbe, Plateau', 'Dakar', 14.6775, -17.4365, 0);

-- Insérer les contacts de la flotte
INSERT INTO fleet_contacts (
    fleet_id, 
    name, 
    role, 
    department, 
    phone, 
    email, 
    is_primary
) VALUES 
(@dakar_dem_dikk_id, 'Ousmane Diallo', 'Directeur Général', 'Direction', '+221 77 123 45 67', 'dg@dakardemdikk.sn', TRUE),
(@dakar_dem_dikk_id, 'Fatou Ndiaye', 'Responsable des Opérations', 'Opérations', '+221 77 234 56 78', 'operations@dakardemdikk.sn', FALSE),
(@dakar_dem_dikk_id, 'Moussa Sow', 'Chef de la Maintenance', 'Maintenance', '+221 77 345 67 89', 'maintenance@dakardemdikk.sn', FALSE),
(@dakar_dem_dikk_id, 'Aminata Diop', 'Responsable Ressources Humaines', 'Ressources Humaines', '+221 77 456 78 90', 'rh@dakardemdikk.sn', FALSE);
