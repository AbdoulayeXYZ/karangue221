#!/bin/bash

# Karangué221 - Script de Déploiement Terraform
# Ce script déploie l'infrastructure AWS avec Terraform

set -e

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Déploiement Infrastructure Karangué221${NC}"
echo "=============================================="

# Vérifier que nous sommes dans le bon répertoire
if [ ! -f "terraform/main.tf" ]; then
    echo -e "${RED}❌ Erreur: Lancez ce script depuis la racine du projet${NC}"
    exit 1
fi

# Vérifier AWS CLI
echo -e "${BLUE}🔑 Vérification AWS CLI...${NC}"
if ! aws sts get-caller-identity &> /dev/null; then
    echo -e "${RED}❌ AWS CLI n'est pas configuré correctement${NC}"
    echo -e "${YELLOW}💡 Consultez docs/AWS-SETUP-GUIDE.md pour configurer AWS${NC}"
    exit 1
fi

echo -e "${GREEN}✅ AWS CLI configuré${NC}"
aws sts get-caller-identity

# Aller dans le répertoire Terraform
cd terraform

# Demander le mot de passe de la base de données de façon sécurisée
echo -e "${BLUE}🔐 Configuration de la base de données...${NC}"
read -s -p "Entrez un mot de passe sécurisé pour la base de données: " DB_PASSWORD
echo
read -s -p "Confirmez le mot de passe: " DB_PASSWORD_CONFIRM
echo

if [ "$DB_PASSWORD" != "$DB_PASSWORD_CONFIRM" ]; then
    echo -e "${RED}❌ Les mots de passe ne correspondent pas${NC}"
    exit 1
fi

if [ ${#DB_PASSWORD} -lt 8 ]; then
    echo -e "${RED}❌ Le mot de passe doit contenir au moins 8 caractères${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Mot de passe configuré${NC}"

# Planification Terraform
echo -e "${BLUE}📋 Planification Terraform...${NC}"
terraform plan -var="db_password=$DB_PASSWORD" -out=tfplan

echo -e "${YELLOW}⚠️  Veuillez examiner le plan ci-dessus.${NC}"
echo -e "${BLUE}Ce plan va créer les ressources suivantes :${NC}"
echo "  • VPC avec subnets publics et privés"
echo "  • Base de données RDS MySQL"
echo "  • Cache ElastiCache Redis"
echo "  • Cluster ECS pour les containers"
echo "  • Load Balancer pour la répartition de charge"
echo "  • Repositories ECR pour les images Docker"
echo "  • Roles IAM et groupes de sécurité"
echo "  • Bucket S3 pour les fichiers media"
echo

# Estimation des coûts
echo -e "${YELLOW}💰 Estimation des coûts (par mois) :${NC}"
echo "  • RDS MySQL (db.t3.micro): ~\$15-20"
echo "  • ElastiCache (cache.t3.micro): ~\$15-20"
echo "  • Application Load Balancer: ~\$20-25"
echo "  • VPC NAT Gateways: ~\$45-50"
echo "  • S3, CloudWatch, autres: ~\$10-20"
echo "  • Total estimé: ~\$105-135/mois"
echo

read -p "Voulez-vous continuer avec le déploiement ? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${BLUE}Déploiement annulé par l'utilisateur${NC}"
    rm -f tfplan
    exit 0
fi

# Application du plan
echo -e "${BLUE}🚀 Application du plan Terraform...${NC}"
terraform apply tfplan

# Sauvegarde des outputs
echo -e "${BLUE}📄 Sauvegarde des outputs...${NC}"
terraform output > ../terraform-outputs.txt
terraform output -json > ../terraform-outputs.json

echo -e "${GREEN}🎉 Déploiement terminé avec succès !${NC}"
echo
echo -e "${BLUE}📋 Informations importantes :${NC}"

# Afficher les informations importantes
ALB_DNS=$(terraform output -raw load_balancer_dns_name 2>/dev/null || echo "Non disponible")
RDS_ENDPOINT=$(terraform output -raw rds_endpoint 2>/dev/null || echo "Non disponible")
S3_BUCKET=$(terraform output -raw s3_bucket_name 2>/dev/null || echo "Non disponible")

echo "  • Load Balancer DNS: $ALB_DNS"
echo "  • Base de données RDS: $RDS_ENDPOINT"
echo "  • Bucket S3: $S3_BUCKET"
echo
echo -e "${YELLOW}📝 Prochaines étapes :${NC}"
echo "  1. 🐳 Construire et pousser les images Docker"
echo "  2. ⚙️  Configurer les services ECS"
echo "  3. 🔗 Configurer le nom de domaine (optionnel)"
echo "  4. 📊 Configurer le monitoring CloudWatch"
echo
echo -e "${BLUE}📁 Les outputs Terraform sont sauvegardés dans :${NC}"
echo "  • terraform-outputs.txt (format texte)"
echo "  • terraform-outputs.json (format JSON)"

# Nettoyer
rm -f tfplan

echo -e "${GREEN}✅ Phase 1 du déploiement terminée !${NC}"
