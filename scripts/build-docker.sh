#!/bin/bash

# Karangué221 - Script de Construction Docker
# Ce script construit les images Docker pour frontend et backend

set -e

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🐳 Construction des Images Docker - Karangué221${NC}"
echo "=================================================="

# Vérifier que nous sommes dans le bon répertoire
if [ ! -f "package.json" ] || [ ! -f "backend/package.json" ]; then
    echo -e "${RED}❌ Erreur: Lancez ce script depuis la racine du projet${NC}"
    exit 1
fi

# Vérifier Docker
echo -e "${BLUE}🔍 Vérification de Docker...${NC}"
if ! docker --version &> /dev/null; then
    echo -e "${RED}❌ Docker n'est pas installé ou pas disponible${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Docker disponible${NC}"
docker --version

# Variables
PROJECT_NAME="karangue221"
BACKEND_IMAGE="${PROJECT_NAME}-backend"
FRONTEND_IMAGE="${PROJECT_NAME}-frontend"
TAG="latest"

echo -e "${BLUE}📋 Images à construire :${NC}"
echo "  • Backend: ${BACKEND_IMAGE}:${TAG}"
echo "  • Frontend: ${FRONTEND_IMAGE}:${TAG}"
echo

# Construction de l'image backend
echo -e "${BLUE}🏗️  Construction de l'image backend...${NC}"
docker build -t ${BACKEND_IMAGE}:${TAG} -f backend/Dockerfile backend/

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Image backend construite avec succès${NC}"
else
    echo -e "${RED}❌ Erreur lors de la construction de l'image backend${NC}"
    exit 1
fi

# Construction de l'image frontend
echo -e "${BLUE}🏗️  Construction de l'image frontend...${NC}"
docker build -t ${FRONTEND_IMAGE}:${TAG} .

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Image frontend construite avec succès${NC}"
else
    echo -e "${RED}❌ Erreur lors de la construction de l'image frontend${NC}"
    exit 1
fi

# Afficher les images créées
echo -e "${BLUE}📦 Images Docker créées :${NC}"
docker images | grep ${PROJECT_NAME}

# Vérifier la taille des images
echo -e "${BLUE}📊 Taille des images :${NC}"
BACKEND_SIZE=$(docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}" | grep ${BACKEND_IMAGE} | awk '{print $3}')
FRONTEND_SIZE=$(docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}" | grep ${FRONTEND_IMAGE} | awk '{print $3}')

echo "  • Backend: ${BACKEND_SIZE}"
echo "  • Frontend: ${FRONTEND_SIZE}"

echo -e "${GREEN}🎉 Construction Docker terminée avec succès !${NC}"
echo
echo -e "${YELLOW}📝 Prochaines étapes :${NC}"
echo "  1. 🧪 Tester les images localement avec docker-compose"
echo "  2. 🏷️  Tagger les images pour ECR (après configuration AWS)"
echo "  3. 📤 Pousser les images vers ECR"
echo "  4. 🚀 Déployer sur ECS"
echo
echo -e "${BLUE}💡 Pour tester localement :${NC}"
echo "  docker-compose up -d"
echo
echo -e "${BLUE}💡 Pour voir les logs :${NC}"
echo "  docker-compose logs -f"
