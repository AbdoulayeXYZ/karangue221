# Configuration de la Structure SaaS - Karangue221

Ce dossier contient les scripts pour configurer la structure multi-tenant de Karangue221 avec un admin super-utilisateur et un tenant client.

## 📋 Structure à Configurer

### 1. Admin Super-Utilisateur (SaaS Owner)
- **Email**: `admin@admin.com`
- **Password**: `admin1234`
- **Rôle**: `admin`
- **Tenant ID**: `1` (tenant système)
- **Description**: Vous, le propriétaire de la plateforme SaaS

### 2. Tenant Client : "Dakar Dem Dikk"
- **Nom**: Dakar Dem Dikk
- **Subdomain**: `dakar-dem-dikk`
- **Domain**: `dakar-dem-dikk.karangue221.com`
- **Plan**: `premium`
- **Pays**: Sénégal

### 3. User Owner du Tenant
- **Nom**: Mamadou Diallo
- **Email**: `mamadou.diallo@dakar-dem-dikk.com`
- **Password**: `Dakar2024!`
- **Rôle**: `owner`
- **Tenant ID**: Lié au tenant "Dakar Dem Dikk"

### 4. Flotte pour Dakar Dem Dikk
- **Nom**: Flotte Dakar Dem Dikk
- **Description**: Flotte principale de transport urbain
- **Owner**: Mamadou Diallo
- **Capacité**: 150 véhicules, 75 conducteurs

## 🚀 Scripts Disponibles

### 1. `setup-saas-structure.js`
Script principal pour configurer toute la structure SaaS.

```bash
cd backend/scripts
node setup-saas-structure.js
```

**Fonctionnalités**:
- Crée l'admin super-utilisateur
- Crée le tenant "Dakar Dem Dikk"
- Crée l'user owner du tenant
- Crée la flotte associée
- Affiche un résumé complet de la configuration

### 2. `setup-saas-structure.sql`
Version SQL du script de configuration.

```bash
mysql -u root -p karangue221 < setup-saas-structure.sql
```

**Avantages**:
- Exécution plus rapide
- Pas besoin de Node.js
- Idéal pour les environnements de production

### 3. `verify-saas-structure.js`
Script de vérification pour s'assurer que tout est correctement configuré.

```bash
cd backend/scripts
node verify-saas-structure.js
```

**Fonctionnalités**:
- Vérifie l'existence de l'admin
- Vérifie l'existence du tenant
- Vérifie l'existence de l'owner
- Vérifie l'existence de la flotte
- Vérifie l'isolation des tenants
- Affiche un rapport détaillé

## 🔧 Prérequis

### 1. Base de Données
Assurez-vous que MySQL est démarré et que la base de données `karangue221` existe.

### 2. Variables d'Environnement
Créez un fichier `.env` dans le dossier `backend/` avec :

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=votre_mot_de_passe
DB_NAME=karangue221
DB_PORT=3306
```

### 3. Dépendances Node.js
Installez les dépendances nécessaires :

```bash
cd backend
npm install mysql2 bcrypt dotenv
```

## 📝 Étapes de Configuration

### Étape 1: Vérifier la Base de Données
```bash
mysql -u root -p
USE karangue221;
SHOW TABLES;
```

### Étape 2: Exécuter le Script de Configuration
```bash
cd backend/scripts
node setup-saas-structure.js
```

### Étape 3: Vérifier la Configuration
```bash
node verify-saas-structure.js
```

### Étape 4: Tester l'Accès
1. **Admin SaaS**: http://localhost:4028
   - Email: `admin@admin.com`
   - Password: `admin1234`

2. **Tenant Dakar Dem Dikk**: http://localhost:4028?tenant_subdomain=dakar-dem-dikk
   - Email: `mamadou.diallo@dakar-dem-dikk.com`
   - Password: `Dakar2024!`

## 🔒 Sécurité et Isolation

### Isolation des Tenants
- Chaque tenant a son propre `tenant_id`
- Les données sont isolées par `tenant_id` dans toutes les requêtes
- L'admin super-utilisateur a accès à tous les tenants
- Les owners ne voient que leurs propres données

### Permissions
- **Admin**: Accès complet à tous les tenants et fonctionnalités
- **Owner**: Accès limité à son tenant uniquement
- **Isolation**: Les requêtes incluent automatiquement le filtre `tenant_id`

## 🛠️ Dépannage

### Erreur de Connexion à la Base de Données
```bash
# Vérifier que MySQL est démarré
sudo systemctl status mysql

# Vérifier les paramètres de connexion
cat backend/.env
```

### Erreur de Permissions
```bash
# Vérifier les permissions MySQL
mysql -u root -p
GRANT ALL PRIVILEGES ON karangue221.* TO 'votre_user'@'localhost';
FLUSH PRIVILEGES;
```

### Erreur de Dépendances
```bash
# Réinstaller les dépendances
cd backend
rm -rf node_modules package-lock.json
npm install
```

## 📊 Structure de Données

### Table `users`
```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  tenant_id INT NOT NULL DEFAULT 1,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('owner','admin') NOT NULL DEFAULT 'owner',
  phone VARCHAR(30),
  status ENUM('active','inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Table `tenants`
```sql
CREATE TABLE tenants (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  subdomain VARCHAR(50) NOT NULL UNIQUE,
  domain VARCHAR(100),
  status ENUM('active','inactive','suspended') DEFAULT 'active',
  plan ENUM('basic','premium','enterprise') DEFAULT 'basic',
  settings JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Table `fleets`
```sql
CREATE TABLE fleets (
  id INT PRIMARY KEY AUTO_INCREMENT,
  tenant_id INT NOT NULL DEFAULT 1,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  owner_id INT NOT NULL,
  status ENUM('active','inactive','suspended') DEFAULT 'active',
  -- ... autres champs
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🎯 Utilisation en Production

### 1. Changer les Mots de Passe
⚠️ **IMPORTANT**: Changez immédiatement les mots de passe par défaut en production.

### 2. Configuration SSL
Configurez SSL pour les domaines des tenants.

### 3. Sauvegarde
Mettez en place des sauvegardes automatiques de la base de données.

### 4. Monitoring
Configurez le monitoring pour surveiller les performances et la sécurité.

## 📞 Support

Pour toute question ou problème :
1. Vérifiez les logs d'erreur
2. Exécutez le script de vérification
3. Consultez la documentation de l'API
4. Contactez l'équipe de développement 