-- Script pour créer un utilisateur administrateur
-- Base de données: karangue221

USE karangue221;

-- Vérifier si l'utilisateur admin existe déjà
SELECT 'Vérification de l\'existence de l\'utilisateur admin...' AS status;

SELECT id, name, email, role, status, created_at 
FROM users 
WHERE email = 'admin@karangue221.com';

-- Si l'utilisateur n'existe pas, l'insérer
-- Mot de passe hashé pour 'admin123456' (bcrypt, 10 rounds)
-- IMPORTANT: Changez ce mot de passe après la première connexion !

INSERT INTO users (name, email, password_hash, role, phone, status, created_at)
SELECT 
    'Super Administrateur',
    'admin@karangue221.com',
    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- admin123456
    'admin',
    '+221770000000',
    'active',
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM users WHERE email = 'admin@karangue221.com'
);

-- Alternative: Mettre à jour un utilisateur existant pour le rendre admin
-- Décommentez les lignes suivantes si vous voulez mettre à jour un utilisateur existant

-- UPDATE users 
-- SET 
--     name = 'Super Administrateur',
--     password_hash = '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
--     role = 'admin',
--     phone = '+221770000000',
--     status = 'active'
-- WHERE email = 'admin@karangue221.com';

-- Vérifier la création
SELECT 'Utilisateur administrateur créé/mis à jour:' AS status;

SELECT id, name, email, role, phone, status, created_at 
FROM users 
WHERE email = 'admin@karangue221.com' AND role = 'admin';

-- Afficher un résumé de tous les administrateurs
SELECT 'Tous les administrateurs du système:' AS status;

SELECT id, name, email, phone, status, created_at 
FROM users 
WHERE role = 'admin' 
ORDER BY created_at DESC;

-- Instructions pour la connexion
SELECT 
    '=== INFORMATIONS DE CONNEXION ===' AS instructions,
    'Email: admin@karangue221.com' AS email,
    'Mot de passe: admin123456' AS password,
    'IMPORTANT: Changez le mot de passe !' AS warning;
