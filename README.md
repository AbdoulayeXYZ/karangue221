# 🚗 Karangue221 - Système de Gestion de Flotte

Karangue221 est une solution complète de gestion de flotte conçue pour les entreprises sénégalaises. Elle permet le suivi en temps réel des véhicules, la gestion des conducteurs, le suivi de la maintenance et la génération de rapports d'incidents.

![Karangue221 Dashboard](https://via.placeholder.com/800x400?text=Karangue221+Dashboard)

## 📋 Fonctionnalités principales

- **Tableau de bord en temps réel** - Visualisation des données clés de la flotte
- **Gestion des véhicules** - Suivi des informations complètes sur chaque véhicule
- **Gestion des conducteurs** - Profils, permis, formations et évaluations
- **Suivi des incidents** - Enregistrement et analyse des incidents
- **Maintenance préventive** - Planification et suivi des opérations de maintenance
- **Rapports et analyses** - Génération de rapports détaillés sur les performances
- **Authentification sécurisée** - Système d'authentification JWT avec différents niveaux d'accès

## 🛠️ Technologies utilisées

- **Frontend:**
  - React 18
  - TailwindCSS pour l'interface utilisateur
  - Recharts pour la visualisation des données
  - React Router v6
  - Vite (serveur de développement et build)

- **Backend:**
  - Node.js & Express
  - MySQL pour la base de données
  - JWT pour l'authentification
  - WebSockets pour les mises à jour en temps réel

## 📡 Équipements Teltonika

Karangue221 s'appuie sur une suite d'équipements Teltonika pour la collecte de données en temps réel. Ces dispositifs sont installés dans les véhicules pour assurer le suivi, la sécurité et l'optimisation de la flotte.

### Vue d'ensemble du système

![Système Teltonika Complet](devices_picture/System%20Complet.jpeg)

Le système complet intègre plusieurs dispositifs qui fonctionnent ensemble pour offrir une solution complète de gestion de flotte avec des fonctionnalités avancées de sécurité et de suivi.

### Traceur GPS FMC650

![Teltonika FMC650](devices_picture/Teltonika%20FMC650.png)

Le FMC650 est un terminal GPS avancé avec les caractéristiques suivantes:

- Suivi GPS/GNSS en temps réel
- Communication GPRS/4G
- Détection d'événements (accélération, freinage, virages brusques)
- Surveillance de la consommation de carburant
- Interfaces multiples pour capteurs externes
- Gestion à distance via serveur

### Système ADAS (Advanced Driver Assistance System)

![Teltonika ADAS](devices_picture/Teltonika%20ADAS.jpg)

Le système ADAS améliore la sécurité de conduite avec:

- Avertissement de collision frontale
- Alerte de franchissement de ligne
- Détection de distance de sécurité
- Reconnaissance des panneaux de signalisation
- Alerte de démarrage du véhicule précédent

### Système DSM (Driver Safety Monitoring)

![Teltonika DSM](devices_picture/Teltonika%20DSM.png)

Le système DSM surveille le comportement du conducteur et détecte:

- Fatigue et somnolence au volant
- Distraction (téléphone, nourriture)
- Non-respect du port de la ceinture de sécurité
- Fumeur au volant
- Identification du conducteur

### Caméra DualCam

![Teltonika DualCam](devices_picture/Teltonika%20DualCam.png)

La DualCam offre une surveillance vidéo à l'intérieur et à l'extérieur du véhicule:

- Enregistrement en continu ou sur événement
- Vision nocturne
- Caméra avant pour la route et arrière pour l'habitacle
- Stockage sur carte SD
- Transfert d'images via GPRS/4G en cas d'incident

### iButton pour l'identification des conducteurs

![Teltonika iButton](devices_picture/Teltonika%20ibutton.webp)

Le système iButton permet:

- Identification unique des conducteurs
- Autorisation de démarrage du véhicule
- Suivi du temps de conduite par conducteur
- Intégration avec le système DSM pour l'analyse comportementale

## ⚙️ Prérequis

- Node.js (v16.x ou supérieur)
- MySQL (v8.0 ou supérieur)
- npm ou yarn

## 📥 Installation

### Cloner le projet

```bash
git clone https://github.com/username/karangue221.git
cd karangue221
```

### Configuration du Backend

1. Installer les dépendances du backend:

```bash
cd backend
npm install
```

2. Créer un fichier `.env` dans le dossier `backend` avec les informations suivantes:

```env
# Connexion à la base de données
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=votre_mot_de_passe
DB_NAME=karangue221

# Configuration du serveur
PORT=5001
NODE_ENV=development

# JWT Secret (à remplacer par une valeur aléatoire)
JWT_SECRET=votre_secret_jwt_securise
```

Pour générer un secret JWT sécurisé, vous pouvez utiliser la commande:

```bash
openssl rand -base64 32
```

3. Créer la base de données MySQL:

```bash
mysql -u root -p
```

```sql
CREATE DATABASE karangue221;
USE karangue221;
```

4. Importer le schéma de base de données:

```bash
mysql -u root -p karangue221 < backend/db_schema.sql
```

5. Démarrer le serveur backend:

```bash
npm run dev
```

Le serveur backend sera accessible à l'adresse `http://localhost:5001`.

### Configuration du Frontend

1. Ouvrez un nouveau terminal et installez les dépendances du frontend:

```bash
cd frontend  # ou à la racine du projet, selon la structure
npm install
```

2. Créez un fichier `.env` à la racine du projet frontend avec:

```env
VITE_API_URL=http://localhost:5001/api
```

3. Démarrez le serveur de développement frontend:

```bash
npm run dev
```

Le frontend sera accessible à l'adresse `http://localhost:4028`.

## 🚦 Utilisation

### Connexion au système

1. Accédez à `http://localhost:4028` dans votre navigateur
2. Utilisez les identifiants suivants pour vous connecter:
   - **Admin:** admin@karangue221.com / Admin123!
   - **Manager:** manager@karangue221.com / Manager123!

### Structure du projet

```
karangue221/
├── backend/                # Serveur Node.js/Express
│   ├── config/             # Configuration (DB, environnement)
│   ├── controllers/        # Contrôleurs REST API
│   ├── middleware/         # Middleware (auth, validation)
│   ├── models/             # Modèles de données
│   ├── routes/             # Routes API
│   ├── app.js              # Point d'entrée de l'application
│   └── package.json        # Dépendances backend
├── src/                    # Frontend React
│   ├── assets/             # Images, fonts, etc.
│   ├── components/         # Composants réutilisables
│   ├── hooks/              # Hooks personnalisés
│   ├── pages/              # Composants de pages
│   ├── services/           # Services d'API
│   ├── styles/             # Styles globaux
│   ├── App.jsx             # Composant principal
│   └── main.jsx            # Point d'entrée React
├── .env                    # Variables d'environnement
├── package.json            # Dépendances frontend
└── README.md               # Documentation
```

## 🔄 Fonctionnalités principales

### Tableau de bord

Le tableau de bord affiche:
- Nombre total de véhicules
- Véhicules actifs, en maintenance et inactifs
- Statistiques des conducteurs
- Incidents récents
- Carte des véhicules (si disponible)

### Gestion des véhicules

Permet de:
- Ajouter de nouveaux véhicules
- Mettre à jour les informations (assurance, maintenance, etc.)
- Assigner des conducteurs
- Suivre l'historique du véhicule

### Gestion des conducteurs

Permet de:
- Gérer les profils des conducteurs
- Suivre les dates d'expiration des permis
- Enregistrer les formations
- Évaluer les performances

## 🐛 Résolution des problèmes

### Problèmes de connexion à la base de données

Vérifiez:
- Que le service MySQL est démarré
- Que les identifiants dans le fichier `.env` sont corrects
- Que la base de données `karangue221` existe

### Problèmes d'authentification

Si vous rencontrez des problèmes d'authentification:
- Vérifiez que le `JWT_SECRET` est correctement configuré
- Assurez-vous que les tokens ne sont pas expirés
- En mode développement, vous pouvez utiliser l'endpoint `/api/auth/dev-token` pour obtenir un token valide

### Mises à jour en temps réel

Si les mises à jour en temps réel ne fonctionnent pas:
- Vérifiez que le WebSocket est connecté (messages dans la console)
- Assurez-vous que le pare-feu autorise les connexions WebSocket
- Vérifiez que le token d'authentification est valide

## 📈 Développement

### Ajouter un nouveau module

1. Créez les modèles de données dans `backend/models`
2. Implémentez les contrôleurs dans `backend/controllers`
3. Définissez les routes dans `backend/routes`
4. Créez les composants frontend dans `src/components` et `src/pages`
5. Ajoutez les services API dans `src/services/api`

### Tests

Exécutez les tests avec:

```bash
# Backend
cd backend
npm test

# Frontend
cd frontend
npm test
```

## 🔒 Sécurité

- L'authentification utilise JWT avec une expiration de 12 heures
- Les mots de passe sont hachés avec bcrypt
- L'API utilise CORS pour limiter les accès
- Les variables sensibles sont stockées dans les fichiers `.env`

## 📚 Documentation API

La documentation API est disponible à l'adresse `http://localhost:5001/api-docs` lorsque le serveur est en cours d'exécution.

## 🤝 Contribution

Les contributions sont les bienvenues! Veuillez suivre ces étapes:

1. Forkez le projet
2. Créez une branche de fonctionnalité (`git checkout -b feature/amazing-feature`)
3. Committez vos changements (`git commit -m 'Add some amazing feature'`)
4. Poussez la branche (`git push origin feature/amazing-feature`)
5. Ouvrez une Pull Request

## 📄 Licence

Ce projet est sous licence [MIT](LICENSE).

## 📧 Contact

Pour toute question ou suggestion, veuillez contacter l'équipe à [contact@karangue221.com](mailto:contact@karangue221.com).

---

Développé avec ❤️ au Sénégal pour les entreprises sénégalaises.
