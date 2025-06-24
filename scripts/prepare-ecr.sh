#!/bin/bash

# Karangué221 - Script de Préparation ECR
# Ce script prépare les images pour AWS ECR (à utiliser après configuration AWS)

set -e

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}📤 Préparation ECR - Karangué221${NC}"
echo "======================================"

# Vérifier AWS CLI
echo -e "${BLUE}🔑 Vérification AWS CLI...${NC}"
if ! aws sts get-caller-identity &> /dev/null; then
    echo -e "${RED}❌ AWS CLI n'est pas configuré${NC}"
    echo -e "${YELLOW}💡 Configurez AWS CLI avec: aws configure${NC}"
    exit 1
fi

echo -e "${GREEN}✅ AWS CLI configuré${NC}"

# Variables
PROJECT_NAME="karangue221"
AWS_REGION=$(aws configure get region 2>/dev/null || echo "us-east-1")
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
ECR_URI="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"

BACKEND_REPO="${PROJECT_NAME}-backend"
FRONTEND_REPO="${PROJECT_NAME}-frontend"

echo -e "${BLUE}📋 Configuration ECR :${NC}"
echo "  • Région AWS: ${AWS_REGION}"
echo "  • Compte AWS: ${AWS_ACCOUNT_ID}"
echo "  • URI ECR: ${ECR_URI}"
echo "  • Repo Backend: ${BACKEND_REPO}"
echo "  • Repo Frontend: ${FRONTEND_REPO}"
echo

# Créer les repositories ECR s'ils n'existent pas
echo -e "${BLUE}📦 Création des repositories ECR...${NC}"

# Backend repository
if aws ecr describe-repositories --repository-names ${BACKEND_REPO} --region ${AWS_REGION} &> /dev/null; then
    echo -e "${GREEN}✅ Repository ${BACKEND_REPO} existe déjà${NC}"
else
    echo -e "${YELLOW}📦 Création du repository ${BACKEND_REPO}...${NC}"
    aws ecr create-repository \
        --repository-name ${BACKEND_REPO} \
        --region ${AWS_REGION} \
        --image-scanning-configuration scanOnPush=true \
        --lifecycle-policy-text '{
            "rules": [
                {
                    "rulePriority": 1,
                    "selection": {
                        "tagStatus": "untagged",
                        "countType": "sinceImagePushed",
                        "countUnit": "days",
                        "countNumber": 7
                    },
                    "action": {
                        "type": "expire"
                    }
                },
                {
                    "rulePriority": 2,
                    "selection": {
                        "tagStatus": "tagged",
                        "countType": "imageCountMoreThan",
                        "countNumber": 10
                    },
                    "action": {
                        "type": "expire"
                    }
                }
            ]
        }' > /dev/null
    echo -e "${GREEN}✅ Repository ${BACKEND_REPO} créé${NC}"
fi

# Frontend repository
if aws ecr describe-repositories --repository-names ${FRONTEND_REPO} --region ${AWS_REGION} &> /dev/null; then
    echo -e "${GREEN}✅ Repository ${FRONTEND_REPO} existe déjà${NC}"
else
    echo -e "${YELLOW}📦 Création du repository ${FRONTEND_REPO}...${NC}"
    aws ecr create-repository \
        --repository-name ${FRONTEND_REPO} \
        --region ${AWS_REGION} \
        --image-scanning-configuration scanOnPush=true \
        --lifecycle-policy-text '{
            "rules": [
                {
                    "rulePriority": 1,
                    "selection": {
                        "tagStatus": "untagged",
                        "countType": "sinceImagePushed",
                        "countUnit": "days",
                        "countNumber": 7
                    },
                    "action": {
                        "type": "expire"
                    }
                },
                {
                    "rulePriority": 2,
                    "selection": {
                        "tagStatus": "tagged",
                        "countType": "imageCountMoreThan",
                        "countNumber": 10
                    },
                    "action": {
                        "type": "expire"
                    }
                }
            ]
        }' > /dev/null
    echo -e "${GREEN}✅ Repository ${FRONTEND_REPO} créé${NC}"
fi

# Login ECR
echo -e "${BLUE}🔐 Connexion à ECR...${NC}"
aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${ECR_URI}

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Connexion ECR réussie${NC}"
else
    echo -e "${RED}❌ Erreur de connexion ECR${NC}"
    exit 1
fi

# Vérifier les images locales
echo -e "${BLUE}🔍 Vérification des images locales...${NC}"
if ! docker images | grep -q "${PROJECT_NAME}-backend"; then
    echo -e "${YELLOW}⚠️  Images locales non trouvées. Construction en cours...${NC}"
    ./scripts/build-docker.sh
fi

# Tags avec timestamp
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
BACKEND_TAG_LATEST="${ECR_URI}/${BACKEND_REPO}:latest"
BACKEND_TAG_TIMESTAMP="${ECR_URI}/${BACKEND_REPO}:${TIMESTAMP}"
FRONTEND_TAG_LATEST="${ECR_URI}/${FRONTEND_REPO}:latest"
FRONTEND_TAG_TIMESTAMP="${ECR_URI}/${FRONTEND_REPO}:${TIMESTAMP}"

# Tagger les images
echo -e "${BLUE}🏷️  Tagging des images...${NC}"
docker tag ${PROJECT_NAME}-backend:latest ${BACKEND_TAG_LATEST}
docker tag ${PROJECT_NAME}-backend:latest ${BACKEND_TAG_TIMESTAMP}
docker tag ${PROJECT_NAME}-frontend:latest ${FRONTEND_TAG_LATEST}
docker tag ${PROJECT_NAME}-frontend:latest ${FRONTEND_TAG_TIMESTAMP}

echo -e "${GREEN}✅ Images taguées${NC}"

# Pousser les images vers ECR
echo -e "${BLUE}📤 Push des images vers ECR...${NC}"

echo -e "${BLUE}  • Push backend:latest...${NC}"
docker push ${BACKEND_TAG_LATEST}

echo -e "${BLUE}  • Push backend:${TIMESTAMP}...${NC}"
docker push ${BACKEND_TAG_TIMESTAMP}

echo -e "${BLUE}  • Push frontend:latest...${NC}"
docker push ${FRONTEND_TAG_LATEST}

echo -e "${BLUE}  • Push frontend:${TIMESTAMP}...${NC}"
docker push ${FRONTEND_TAG_TIMESTAMP}

echo -e "${GREEN}🎉 Push ECR terminé avec succès !${NC}"
echo
echo -e "${BLUE}📋 Images dans ECR :${NC}"
echo "  • Backend: ${BACKEND_TAG_LATEST}"
echo "  • Backend: ${BACKEND_TAG_TIMESTAMP}"
echo "  • Frontend: ${FRONTEND_TAG_LATEST}"
echo "  • Frontend: ${FRONTEND_TAG_TIMESTAMP}"
echo
echo -e "${BLUE}📄 Pour vérifier dans ECR :${NC}"
echo "  aws ecr list-images --repository-name ${BACKEND_REPO} --region ${AWS_REGION}"
echo "  aws ecr list-images --repository-name ${FRONTEND_REPO} --region ${AWS_REGION}"
echo
echo -e "${YELLOW}📝 Prochaines étapes :${NC}"
echo "  1. 🚀 Déployer l'infrastructure Terraform"
echo "  2. ⚙️  Configurer les services ECS"
echo "  3. 🔗 Configurer le nom de domaine"

# Créer un fichier avec les URI des images pour utilisation ultérieure
cat > ecr-images.txt << EOF
# Images ECR - ${TIMESTAMP}
BACKEND_IMAGE_URI=${BACKEND_TAG_LATEST}
FRONTEND_IMAGE_URI=${FRONTEND_TAG_LATEST}
BACKEND_IMAGE_URI_VERSIONED=${BACKEND_TAG_TIMESTAMP}
FRONTEND_IMAGE_URI_VERSIONED=${FRONTEND_TAG_TIMESTAMP}
EOF

echo -e "${BLUE}💾 URIs des images sauvegardées dans ecr-images.txt${NC}"
