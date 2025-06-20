-- Script d'insertion des données uniquement (sans création de tables)
-- Pour Dakar Dem Dikk

-- 1. Utiliser l'ID de l'administrateur existant (ID = 5)
SET @admin_id = 5;

-- 2. Insérer dans la table fleets
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
    @admin_id,
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

-- 3. Insérer les emplacements de la flotte
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

-- 4. Insérer les contacts de la flotte
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

-- 5. S'assurer que les colonnes requises existent dans la table vehicles
-- Si non, exécuter d'abord le script alter_vehicles_table.sql

-- 6. Insérer des véhicules avec des données complètes
INSERT INTO vehicles (
    registration,
    brand,
    model,
    year,
    color,
    status,
    fleet_id,
    imei_device,
    type,
    fuel_type,
    tank_capacity,
    mileage,
    insurance_provider,
    policy_number,
    insurance_expiry,
    insurance_coverage_type,
    engine_details,
    vin_number,
    passenger_capacity,
    last_maintenance_date,
    next_maintenance_date,
    technical_inspection_date,
    technical_inspection_expiry
) VALUES 
-- Bus urbain standard
(
    'DK-3456-AA',
    'Mercedes-Benz',
    'Citaro',
    2023,
    'Bleu',
    'active',
    @dakar_dem_dikk_id,
    '351756108997001',
    'Bus',
    'diesel',
    280,
    5000,
    'NSIA Assurances',
    'POL-2023-MB1',
    '2026-05-15',
    'Tous risques',
    '7.7L OM936 Euro 6',
    'WDB9630031L739452',
    '90',
    '2025-03-15',
    '2025-09-15',
    '2025-01-15',
    '2026-01-15'
),

-- Minibus pour les lignes secondaires
(
    'DK-5678-BB',
    'Toyota',
    'Coaster',
    2022,
    'Blanc',
    'active',
    @dakar_dem_dikk_id,
    '351756108997002',
    'Minibus',
    'diesel',
    95,
    12000,
    'NSIA Assurances',
    'POL-2022-TC1',
    '2026-03-20',
    'Tous risques',
    '4.2L Diesel',
    'JTGFB718501064573',
    '29',
    '2025-04-22',
    '2025-10-22',
    '2024-12-10',
    '2025-12-10'
),

-- Bus articulé pour les lignes principales
(
    'DK-7890-CC',
    'Volvo',
    'B9LA',
    2024,
    'Rouge',
    'active',
    @dakar_dem_dikk_id,
    '351756108997003',
    'Bus',
    'diesel',
    350,
    2500,
    'NSIA Assurances',
    'POL-2024-VB1',
    '2026-07-10',
    'Tous risques',
    '9.0L D9B',
    'YV3R9L627EA159843',
    '150',
    '2025-06-05',
    '2025-12-05',
    '2025-05-20',
    '2026-05-20'
);
