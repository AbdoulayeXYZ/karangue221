-- Script SQL pour configurer la structure SaaS complète
-- - Admin Super-Utilisateur (SaaS Owner)
-- - Tenant "Dakar Dem Dikk"
-- - User Owner du Tenant
-- - Flotte pour Dakar Dem Dikk

-- =====================================================
-- ÉTAPE 1: CRÉER L'ADMIN SUPER-UTILISATEUR (SaaS Owner)
-- =====================================================

-- Vérifier si l'admin existe déjà et le mettre à jour ou le créer
INSERT INTO users (name, email, password_hash, role, phone, status, tenant_id, created_at)
VALUES (
    'Super Administrateur SaaS',
    'admin@admin.com',
    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- admin1234
    'admin',
    '+221770000000',
    'active',
    1, -- Tenant système pour l'admin
    NOW()
)
ON DUPLICATE KEY UPDATE
    name = VALUES(name),
    password_hash = VALUES(password_hash),
    role = VALUES(role),
    phone = VALUES(phone),
    status = VALUES(status),
    tenant_id = VALUES(tenant_id);

-- =====================================================
-- ÉTAPE 2: CRÉER LE TENANT "DAKAR DEM DIKK"
-- =====================================================

INSERT INTO tenants (name, subdomain, domain, plan, settings, status, created_at)
VALUES (
    'Dakar Dem Dikk',
    'dakar-dem-dikk',
    'dakar-dem-dikk.karangue221.com',
    'premium',
    '{"features": ["gps_tracking", "driver_analytics", "fleet_management", "incident_management"], "max_vehicles": 150, "max_drivers": 75, "country": "Sénégal", "timezone": "Africa/Dakar"}',
    'active',
    NOW()
)
ON DUPLICATE KEY UPDATE
    name = VALUES(name),
    domain = VALUES(domain),
    plan = VALUES(plan),
    settings = VALUES(settings),
    status = VALUES(status);

-- =====================================================
-- ÉTAPE 3: CRÉER L'USER OWNER DU TENANT
-- =====================================================

-- Récupérer l'ID du tenant Dakar Dem Dikk
SET @tenant_id = (SELECT id FROM tenants WHERE subdomain = 'dakar-dem-dikk' LIMIT 1);

INSERT INTO users (name, email, password_hash, role, phone, status, tenant_id, created_at)
VALUES (
    'Mamadou Diallo',
    'mamadou.diallo@dakar-dem-dikk.com',
    '$2b$10$YourHashedPasswordHere', -- Dakar2024! - À hasher avec bcrypt
    'owner',
    '+221771234567',
    'active',
    @tenant_id,
    NOW()
)
ON DUPLICATE KEY UPDATE
    name = VALUES(name),
    password_hash = VALUES(password_hash),
    role = VALUES(role),
    phone = VALUES(phone),
    status = VALUES(status),
    tenant_id = VALUES(tenant_id);

-- =====================================================
-- ÉTAPE 4: CRÉER LA FLOTTE POUR DAKAR DEM DIKK
-- =====================================================

-- Récupérer l'ID de l'owner
SET @owner_id = (SELECT id FROM users WHERE email = 'mamadou.diallo@dakar-dem-dikk.com' LIMIT 1);

INSERT INTO fleets (
    name, description, owner_id, tenant_id, status, founding_date,
    license_number, main_address, city, postal_code, country, phone,
    email, website, max_vehicles, max_drivers, subscription_type,
    subscription_expires_at, created_at
)
VALUES (
    'Flotte Dakar Dem Dikk',
    'Flotte principale de transport urbain Dakar Dem Dikk',
    @owner_id,
    @tenant_id,
    'active',
    '2020-01-15',
    'DDD-2020-001',
    'Route de Ouakam, Dakar',
    'Dakar',
    '10000',
    'Sénégal',
    '+221338200000',
    'contact@dakar-dem-dikk.com',
    'https://dakar-dem-dikk.com',
    150,
    75,
    'premium',
    '2025-12-31 23:59:59',
    NOW()
)
ON DUPLICATE KEY UPDATE
    description = VALUES(description),
    owner_id = VALUES(owner_id),
    status = VALUES(status),
    founding_date = VALUES(founding_date),
    license_number = VALUES(license_number),
    main_address = VALUES(main_address),
    city = VALUES(city),
    postal_code = VALUES(postal_code),
    country = VALUES(country),
    phone = VALUES(phone),
    email = VALUES(email),
    website = VALUES(website),
    max_vehicles = VALUES(max_vehicles),
    max_drivers = VALUES(max_drivers),
    subscription_type = VALUES(subscription_type),
    subscription_expires_at = VALUES(subscription_expires_at);

-- =====================================================
-- VÉRIFICATION ET AFFICHAGE DES RÉSULTATS
-- =====================================================

-- Afficher l'admin créé
SELECT 
    'ADMIN SUPER-UTILISATEUR' as type,
    id,
    name,
    email,
    role,
    tenant_id,
    status
FROM users 
WHERE email = 'admin@admin.com';

-- Afficher le tenant créé
SELECT 
    'TENANT DAKAR DEM DIKK' as type,
    id,
    name,
    subdomain,
    domain,
    plan,
    status
FROM tenants 
WHERE subdomain = 'dakar-dem-dikk';

-- Afficher l'owner créé
SELECT 
    'USER OWNER' as type,
    id,
    name,
    email,
    role,
    tenant_id,
    status
FROM users 
WHERE email = 'mamadou.diallo@dakar-dem-dikk.com';

-- Afficher la flotte créée
SELECT 
    'FLOTTE' as type,
    id,
    name,
    description,
    owner_id,
    tenant_id,
    status,
    email,
    website
FROM fleets 
WHERE tenant_id = @tenant_id;

-- =====================================================
-- INFORMATIONS DE CONNEXION
-- =====================================================

SELECT 
    'INFORMATIONS DE CONNEXION' as info,
    'Admin SaaS: admin@admin.com / admin1234' as credentials
UNION ALL
SELECT 
    'INFORMATIONS DE CONNEXION' as info,
    'Owner Tenant: mamadou.diallo@dakar-dem-dikk.com / Dakar2024!' as credentials
UNION ALL
SELECT 
    'URLS D\'ACCÈS' as info,
    'Admin: http://localhost:4028' as credentials
UNION ALL
SELECT 
    'URLS D\'ACCÈS' as info,
    'Tenant: http://localhost:4028?tenant_subdomain=dakar-dem-dikk' as credentials; 