# Guide de Configuration Multi-Tenant - Karangué221

## 📋 Vue d'ensemble

Ce guide détaille la configuration et le déploiement du système multi-tenant de Karangué221, permettant d'isoler les données de plusieurs clients sur une même instance.

## 🏗️ Architecture Multi-Tenant

### Méthodes de Tenant Identification

1. **Sous-domaines** (Production recommandée)
   - `ddd.karangue221.com` → Tenant "DDD"
   - `testowner.karangue221.com` → Tenant "testowner"

2. **En-têtes HTTP** (API et développement)
   - `X-Tenant-ID: 1`
   - `X-Tenant-Subdomain: ddd`

3. **Paramètres URL** (Développement et tests)
   - `?tenant_id=1`
   - `?tenant_subdomain=ddd`

4. **JWT Token** (Authentification)
   - Le token contient automatiquement le `tenant_id`

## 🚀 Déploiement

### 1. Configuration DNS Multi-Tenant

#### Configuration Cloudflare (Recommandée)

```bash
# Enregistrements DNS principaux
karangue221.com         A     [IP_SERVER]
*.karangue221.com       A     [IP_SERVER]

# Enregistrements CNAME spécifiques (optionnel)
ddd.karangue221.com     CNAME karangue221.com
testowner.karangue221.com CNAME karangue221.com
```

#### Configuration nginx

```nginx
# /etc/nginx/sites-available/karangue221-multitenant
server {
    listen 80;
    listen 443 ssl http2;
    
    # Support des sous-domaines wildcard
    server_name karangue221.com *.karangue221.com;
    
    # Certificats SSL wildcard
    ssl_certificate /path/to/karangue221.com.crt;
    ssl_certificate_key /path/to/karangue221.com.key;
    
    # Frontend (React)
    location / {
        root /var/www/karangue221/frontend/dist;
        try_files $uri $uri/ /index.html;
        
        # Ajouter le sous-domaine en header pour le frontend
        add_header X-Tenant-Subdomain $subdomain;
        
        # Variables nginx pour extraction du sous-domaine
        set $subdomain "";
        if ($host ~* "^([^.]+)\.karangue221\.com$") {
            set $subdomain $1;
        }
    }
    
    # API Backend
    location /api/ {
        proxy_pass http://localhost:5001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Passer le sous-domaine au backend
        proxy_set_header X-Tenant-Subdomain $subdomain;
    }
    
    # WebSocket
    location /ws {
        proxy_pass http://localhost:5001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Tenant-Subdomain $subdomain;
    }
}
```

### 2. Configuration Base de Données

#### Ajout des colonnes tenant_id

```sql
-- Script de migration pour ajouter tenant_id aux tables existantes

-- Table tenants (déjà créée)
-- Vérifier que la table tenants existe avec la structure correcte

-- Ajouter tenant_id aux tables principales
ALTER TABLE users ADD COLUMN tenant_id INT DEFAULT 1;
ALTER TABLE fleets ADD COLUMN tenant_id INT DEFAULT 1;
ALTER TABLE vehicles ADD COLUMN tenant_id INT DEFAULT 1;
ALTER TABLE drivers ADD COLUMN tenant_id INT DEFAULT 1;
ALTER TABLE incidents ADD COLUMN tenant_id INT DEFAULT 1;
ALTER TABLE violations ADD COLUMN tenant_id INT DEFAULT 1;
ALTER TABLE telemetry ADD COLUMN tenant_id INT DEFAULT 1;
ALTER TABLE notifications ADD COLUMN tenant_id INT DEFAULT 1;
ALTER TABLE activities ADD COLUMN tenant_id INT DEFAULT 1;
ALTER TABLE vehicle_assignments ADD COLUMN tenant_id INT DEFAULT 1;

-- Ajouter les contraintes de clé étrangère
ALTER TABLE users ADD CONSTRAINT fk_users_tenant 
    FOREIGN KEY (tenant_id) REFERENCES tenants(id);
ALTER TABLE fleets ADD CONSTRAINT fk_fleets_tenant 
    FOREIGN KEY (tenant_id) REFERENCES tenants(id);
ALTER TABLE vehicles ADD CONSTRAINT fk_vehicles_tenant 
    FOREIGN KEY (tenant_id) REFERENCES tenants(id);
ALTER TABLE drivers ADD CONSTRAINT fk_drivers_tenant 
    FOREIGN KEY (tenant_id) REFERENCES tenants(id);

-- Créer des index pour optimiser les requêtes multi-tenant
CREATE INDEX idx_users_tenant ON users(tenant_id);
CREATE INDEX idx_fleets_tenant ON fleets(tenant_id);
CREATE INDEX idx_vehicles_tenant ON vehicles(tenant_id);
CREATE INDEX idx_drivers_tenant ON drivers(tenant_id);
CREATE INDEX idx_incidents_tenant ON incidents(tenant_id);
CREATE INDEX idx_violations_tenant ON violations(tenant_id);
CREATE INDEX idx_telemetry_tenant ON telemetry(tenant_id);
CREATE INDEX idx_notifications_tenant ON notifications(tenant_id);

-- Table des statistiques par tenant (pour le monitoring)
CREATE TABLE tenant_stats (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tenant_id INT NOT NULL,
    tenant_name VARCHAR(255),
    tenant_status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
    total_users INT DEFAULT 0,
    total_fleets INT DEFAULT 0,
    total_vehicles INT DEFAULT 0,
    total_drivers INT DEFAULT 0,
    total_incidents INT DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id),
    UNIQUE KEY unique_tenant_stats (tenant_id)
);
```

#### Script de mise à jour des statistiques tenant

```sql
-- Procédure stockée pour mettre à jour les statistiques tenant
DELIMITER //
CREATE PROCEDURE UpdateTenantStats()
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE v_tenant_id INT;
    DECLARE tenant_cursor CURSOR FOR 
        SELECT id FROM tenants WHERE status = 'active';
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

    OPEN tenant_cursor;
    tenant_loop: LOOP
        FETCH tenant_cursor INTO v_tenant_id;
        IF done THEN
            LEAVE tenant_loop;
        END IF;

        INSERT INTO tenant_stats (
            tenant_id, 
            tenant_name, 
            tenant_status,
            total_users, 
            total_fleets, 
            total_vehicles, 
            total_drivers, 
            total_incidents
        )
        SELECT 
            t.id,
            t.name,
            t.status,
            COALESCE(u.user_count, 0),
            COALESCE(f.fleet_count, 0),
            COALESCE(v.vehicle_count, 0),
            COALESCE(d.driver_count, 0),
            COALESCE(i.incident_count, 0)
        FROM tenants t
        LEFT JOIN (SELECT tenant_id, COUNT(*) as user_count FROM users GROUP BY tenant_id) u ON t.id = u.tenant_id
        LEFT JOIN (SELECT tenant_id, COUNT(*) as fleet_count FROM fleets GROUP BY tenant_id) f ON t.id = f.tenant_id
        LEFT JOIN (SELECT tenant_id, COUNT(*) as vehicle_count FROM vehicles GROUP BY tenant_id) v ON t.id = v.tenant_id
        LEFT JOIN (SELECT tenant_id, COUNT(*) as driver_count FROM drivers GROUP BY tenant_id) d ON t.id = d.tenant_id
        LEFT JOIN (SELECT tenant_id, COUNT(*) as incident_count FROM incidents GROUP BY tenant_id) i ON t.id = i.tenant_id
        WHERE t.id = v_tenant_id
        ON DUPLICATE KEY UPDATE
            tenant_name = VALUES(tenant_name),
            tenant_status = VALUES(tenant_status),
            total_users = VALUES(total_users),
            total_fleets = VALUES(total_fleets),
            total_vehicles = VALUES(total_vehicles),
            total_drivers = VALUES(total_drivers),
            total_incidents = VALUES(total_incidents),
            last_updated = CURRENT_TIMESTAMP;

    END LOOP;
    CLOSE tenant_cursor;
END //
DELIMITER ;

-- Programmer l'exécution automatique (optionnel)
-- CREATE EVENT UpdateTenantStatsEvent
-- ON SCHEDULE EVERY 1 HOUR
-- DO CALL UpdateTenantStats();
```

### 3. Configuration Application

#### Variables d'environnement

```bash
# .env
NODE_ENV=production
PORT=5001

# Base de données
DB_HOST=localhost
DB_USER=karangue221_user
DB_PASSWORD=your_secure_password
DB_NAME=karangue221_db

# Multi-tenant
TENANT_DEFAULT_ID=1
TENANT_CACHE_TTL=300000
TENANT_ISOLATION_ENABLED=true

# Domaine principal
MAIN_DOMAIN=karangue221.com
SUBDOMAIN_ENABLED=true

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=24h

# CORS pour multi-tenant
CORS_ORIGINS=https://karangue221.com,https://*.karangue221.com
```

#### Configuration Docker Compose

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "5001:5001"
    environment:
      - NODE_ENV=production
      - TENANT_ISOLATION_ENABLED=true
      - SUBDOMAIN_ENABLED=true
      - MAIN_DOMAIN=karangue221.com
    depends_on:
      - mysql
    volumes:
      - ./backend:/app
      - /app/node_modules

  frontend:
    build: ./frontend
    ports:
      - "4028:80"
    environment:
      - REACT_APP_API_URL=https://karangue221.com/api
      - REACT_APP_TENANT_MODE=subdomain
    volumes:
      - ./frontend/dist:/usr/share/nginx/html

  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: root_password
      MYSQL_DATABASE: karangue221_db
      MYSQL_USER: karangue221_user
      MYSQL_PASSWORD: user_password
    volumes:
      - mysql_data:/var/lib/mysql
      - ./database/init:/docker-entrypoint-initdb.d
    ports:
      - "3306:3306"

volumes:
  mysql_data:
```

## 🧪 Tests et Validation

### 1. Lancer les tests d'isolation

```bash
# Backend
cd backend
node scripts/test-tenant-isolation.js

# Devrait afficher:
# ✅ Tests réussis: 7
# ❌ Tests échoués: 0
# 📊 Total: 7
# 📈 Taux de réussite: 100.0%
```

### 2. Test manuel des sous-domaines

```bash
# Test tenant 1 (ddd)
curl -H "Host: ddd.karangue221.com" \
     -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:5001/api/drivers

# Test tenant 2 (testowner)
curl -H "Host: testowner.karangue221.com" \
     -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:5001/api/drivers

# Vérifier que les réponses sont différentes et isolées
```

### 3. Test des en-têtes

```bash
# Test avec X-Tenant-ID
curl -H "X-Tenant-ID: 1" \
     -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:5001/api/drivers

# Test avec X-Tenant-Subdomain
curl -H "X-Tenant-Subdomain: ddd" \
     -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:5001/api/drivers
```

## 📊 Monitoring et Maintenance

### 1. Scripts de maintenance

```bash
# Script de nettoyage des caches tenant
cd backend
node -e "
const { clearTenantCache } = require('./middleware/tenantMiddleware');
clearTenantCache();
console.log('Cache tenant vidé');
"

# Mise à jour des statistiques tenant
mysql -u karangue221_user -p karangue221_db -e "CALL UpdateTenantStats();"
```

### 2. Surveillance des performances

```bash
# Surveiller les logs tenant
tail -f backend/logs/tenant.log | grep "TENANT"

# Surveiller les requêtes multi-tenant
tail -f backend/logs/app.log | grep "\[TENANT"
```

### 3. Sauvegarde par tenant

```bash
#!/bin/bash
# backup-tenant.sh

TENANT_ID=$1
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/tenant_${TENANT_ID}"

mkdir -p $BACKUP_DIR

# Sauvegarder les données du tenant spécifique
mysqldump -u karangue221_user -p \
  --where="tenant_id=$TENANT_ID" \
  karangue221_db users fleets vehicles drivers > \
  "$BACKUP_DIR/tenant_${TENANT_ID}_data_${DATE}.sql"

echo "Sauvegarde tenant $TENANT_ID créée: $BACKUP_DIR/tenant_${TENANT_ID}_data_${DATE}.sql"
```

## 🔧 Dépannage

### Problèmes courants

1. **Tenant non détecté**
   ```bash
   # Vérifier la configuration DNS
   nslookup ddd.karangue221.com
   
   # Vérifier les en-têtes nginx
   curl -I ddd.karangue221.com
   ```

2. **Données mélangées entre tenants**
   ```sql
   -- Vérifier l'isolation des données
   SELECT tenant_id, COUNT(*) 
   FROM drivers 
   GROUP BY tenant_id;
   ```

3. **Performances dégradées**
   ```sql
   -- Vérifier les index tenant
   SHOW INDEX FROM drivers WHERE Column_name = 'tenant_id';
   ```

### Logs de debug

```javascript
// Activer les logs détaillés tenant
// Dans backend/app.js
app.use((req, res, next) => {
  if (req.tenant_id) {
    console.log(`[TENANT DEBUG] ${req.method} ${req.path} - Tenant: ${req.tenant_id}`);
  }
  next();
});
```

## 📝 Checklist de Déploiement

- [ ] DNS configuré (wildcard *.karangue221.com)
- [ ] Certificats SSL wildcard installés
- [ ] Base de données migrée (colonnes tenant_id ajoutées)
- [ ] Variables d'environnement configurées
- [ ] nginx configuré pour multi-tenant
- [ ] Tests d'isolation passés
- [ ] Monitoring activé
- [ ] Sauvegarde configurée
- [ ] Documentation équipe mise à jour

## 🚨 Sécurité

### Bonnes pratiques

1. **Isolation stricte des données**
   - Toujours utiliser tenant_id dans les requêtes
   - Valider l'appartenance tenant avant modifications
   - Logs d'audit par tenant

2. **Gestion des accès**
   - Permissions strictes par tenant
   - Pas d'accès cross-tenant sauf admin global
   - Sessions isolées par tenant

3. **Monitoring de sécurité**
   - Alertes sur tentatives d'accès cross-tenant
   - Surveillance des anomalies par tenant
   - Audit trail complet

---

**🎯 Le système multi-tenant est maintenant configuré et prêt à supporter plusieurs clients avec une isolation complète des données !**
