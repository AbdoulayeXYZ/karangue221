#!/bin/bash

# Karangué221 - Script de Test Local
# Ce script teste l'application localement avec Docker Compose

set -e

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🧪 Test Local - Karangué221${NC}"
echo "=============================="

# Vérifier que nous sommes dans le bon répertoire
if [ ! -f "docker-compose.yml" ]; then
    echo -e "${RED}❌ Erreur: docker-compose.yml non trouvé${NC}"
    exit 1
fi

# Vérifier Docker et Docker Compose
echo -e "${BLUE}🔍 Vérification de Docker Compose...${NC}"
if ! docker-compose --version &> /dev/null; then
    echo -e "${RED}❌ Docker Compose n'est pas installé${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Docker Compose disponible${NC}"
docker-compose --version

# Fonction pour nettoyer en cas d'interruption
cleanup() {
    echo -e "\n${YELLOW}🧹 Nettoyage en cours...${NC}"
    docker-compose down
    exit 1
}

# Gérer l'interruption Ctrl+C
trap cleanup INT

# Vérifier si les images existent
echo -e "${BLUE}🔍 Vérification des images Docker...${NC}"
if ! docker images | grep -q "karangue221-backend"; then
    echo -e "${YELLOW}⚠️  Image backend non trouvée. Construction en cours...${NC}"
    ./scripts/build-docker.sh
fi

# Créer le fichier .env pour le développement local s'il n'existe pas
if [ ! -f ".env.local" ]; then
    echo -e "${BLUE}📝 Création du fichier .env.local...${NC}"
    cat > .env.local << EOF
# Configuration pour le développement local avec Docker
NODE_ENV=development
PORT=3000

# Base de données
DB_HOST=mysql
DB_PORT=3306
DB_NAME=karangue221_dev
DB_USER=karangue221_user
DB_PASSWORD=dev_password_123

# Redis
REDIS_HOST=redis
REDIS_PORT=6379

# JWT
JWT_SECRET=dev_jwt_secret_key_for_local_testing_only

# API URLs
REACT_APP_API_URL=http://localhost:5001/api
REACT_APP_WS_URL=ws://localhost:5001/ws

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_PATH=/app/uploads

# Email (désactivé en développement)
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
EOF
    echo -e "${GREEN}✅ Fichier .env.local créé${NC}"
fi

# Arrêter les services existants
echo -e "${BLUE}🛑 Arrêt des services existants...${NC}"
docker-compose down --remove-orphans

# Construire et démarrer les services
echo -e "${BLUE}🚀 Démarrage des services...${NC}"
docker-compose --env-file .env.local up -d --build

# Attendre que les services soient prêts
echo -e "${BLUE}⏳ Attente du démarrage des services...${NC}"
sleep 10

# Vérifier l'état des services
echo -e "${BLUE}📊 État des services :${NC}"
docker-compose ps

# Vérifier la connectivité
echo -e "${BLUE}🔍 Vérification de la connectivité...${NC}"

# Tester la base de données
echo -n "  • MySQL: "
if docker-compose exec -T mysql mysqladmin ping -h localhost -u karangue221_user -pdev_password_123 &> /dev/null; then
    echo -e "${GREEN}✅ Connecté${NC}"
else
    echo -e "${RED}❌ Non connecté${NC}"
fi

# Tester Redis
echo -n "  • Redis: "
if docker-compose exec -T redis redis-cli ping &> /dev/null; then
    echo -e "${GREEN}✅ Connecté${NC}"
else
    echo -e "${RED}❌ Non connecté${NC}"
fi

# Tester le backend
echo -n "  • Backend: "
if curl -s http://localhost:5001/api/health &> /dev/null; then
    echo -e "${GREEN}✅ Disponible${NC}"
else
    echo -e "${YELLOW}⚠️  En cours de démarrage...${NC}"
fi

# Tester le frontend
echo -n "  • Frontend: "
if curl -s http://localhost:3000 &> /dev/null; then
    echo -e "${GREEN}✅ Disponible${NC}"
else
    echo -e "${YELLOW}⚠️  En cours de démarrage...${NC}"
fi

echo
echo -e "${GREEN}🎉 Services démarrés avec succès !${NC}"
echo
echo -e "${BLUE}📋 Accès aux services :${NC}"
echo "  • Frontend: http://localhost:3000"
echo "  • Backend API: http://localhost:5001/api"
echo "  • MySQL: localhost:3306"
echo "  • Redis: localhost:6379"
echo
echo -e "${BLUE}📊 Monitoring :${NC}"
echo "  • Logs en temps réel: docker-compose logs -f"
echo "  • Logs backend: docker-compose logs -f backend"
echo "  • Logs frontend: docker-compose logs -f frontend"
echo "  • État des services: docker-compose ps"
echo
echo -e "${BLUE}🛑 Pour arrêter :${NC}"
echo "  docker-compose down"
echo
echo -e "${YELLOW}💡 Tip: L'application peut prendre quelques minutes pour être complètement opérationnelle${NC}"

# Suivre les logs en temps réel (optionnel)
read -p "Voulez-vous suivre les logs en temps réel ? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${BLUE}📄 Suivi des logs (Ctrl+C pour arrêter)...${NC}"
    docker-compose logs -f
fi
