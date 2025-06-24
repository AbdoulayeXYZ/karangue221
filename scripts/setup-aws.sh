#!/bin/bash

# Karangué221 - Script de Configuration AWS
# Ce script vous guide dans la configuration de votre environnement AWS

set -e

echo "🚀 Configuration AWS pour Karangué221"
echo "======================================"

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}📋 Vérification des prérequis...${NC}"

# Vérifier AWS CLI
if ! command -v aws &> /dev/null; then
    echo -e "${RED}❌ AWS CLI n'est pas installé${NC}"
    exit 1
fi

# Vérifier Terraform
if ! command -v terraform &> /dev/null; then
    echo -e "${RED}❌ Terraform n'est pas installé${NC}"
    exit 1
fi

echo -e "${GREEN}✅ AWS CLI et Terraform sont installés${NC}"

# Vérifier si AWS est configuré
echo -e "${BLUE}🔑 Vérification de la configuration AWS...${NC}"

if aws sts get-caller-identity &> /dev/null; then
    echo -e "${GREEN}✅ AWS CLI est déjà configuré${NC}"
    aws sts get-caller-identity
    
    read -p "Voulez-vous reconfigurer AWS CLI ? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${BLUE}Configuration AWS actuelle conservée${NC}"
    else
        echo -e "${YELLOW}⚠️  Reconfiguration d'AWS CLI...${NC}"
        aws configure
    fi
else
    echo -e "${YELLOW}⚙️  Configuration d'AWS CLI nécessaire${NC}"
    echo
    echo -e "${BLUE}Pour configurer AWS CLI, vous aurez besoin de :${NC}"
    echo "  1. 🔑 AWS Access Key ID"
    echo "  2. 🔒 AWS Secret Access Key" 
    echo "  3. 🌍 Default region (recommandé: us-west-2)"
    echo "  4. 📄 Default output format (recommandé: json)"
    echo
    echo -e "${YELLOW}💡 Si vous n'avez pas de credentials AWS :${NC}"
    echo "  1. Connectez-vous à la console AWS"
    echo "  2. Allez dans IAM > Users > Votre utilisateur"
    echo "  3. Onglet 'Security credentials'"
    echo "  4. Créez une nouvelle 'Access key'"
    echo
    
    read -p "Appuyez sur Entrée quand vous êtes prêt à configurer AWS CLI..."
    
    # Configuration AWS CLI
    aws configure
    
    # Vérifier la configuration
    echo -e "${BLUE}🧪 Test de la configuration...${NC}"
    if aws sts get-caller-identity; then
        echo -e "${GREEN}✅ Configuration AWS réussie !${NC}"
    else
        echo -e "${RED}❌ Erreur de configuration AWS${NC}"
        exit 1
    fi
fi

echo -e "${BLUE}📁 Création du fichier de variables Terraform...${NC}"

# Créer terraform.tfvars s'il n'existe pas
if [ ! -f "terraform/terraform.tfvars" ]; then
    cp terraform/terraform.tfvars.example terraform/terraform.tfvars
    echo -e "${GREEN}✅ Fichier terraform.tfvars créé${NC}"
    echo -e "${YELLOW}💡 Modifiez terraform/terraform.tfvars selon vos besoins${NC}"
else
    echo -e "${BLUE}ℹ️  Le fichier terraform.tfvars existe déjà${NC}"
fi

# Créer .env s'il n'existe pas
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo -e "${GREEN}✅ Fichier .env créé${NC}"
    echo -e "${YELLOW}💡 Modifiez .env avec vos variables d'environnement${NC}"
else
    echo -e "${BLUE}ℹ️  Le fichier .env existe déjà${NC}"
fi

echo
echo -e "${GREEN}🎉 Configuration terminée !${NC}"
echo -e "${BLUE}Prochaines étapes :${NC}"
echo "  1. 📝 Modifiez .env avec vos variables"
echo "  2. 📝 Modifiez terraform/terraform.tfvars si nécessaire"
echo "  3. 🚀 Lancez: cd terraform && terraform init"
echo "  4. 🚀 Lancez: terraform plan"
echo "  5. 🚀 Lancez: terraform apply"
