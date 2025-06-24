# 🔑 Guide de Configuration AWS pour Karangué221

## 📋 Étape 1 : Créer un Compte AWS (si nécessaire)

Si vous n'avez pas encore de compte AWS :

1. 📺 Rendez-vous sur [aws.amazon.com](https://aws.amazon.com)
2. 🆕 Cliquez sur "Créer un compte AWS"
3. 📝 Remplissez les informations requises
4. 💳 Ajoutez une méthode de paiement (carte de crédit)
5. ☎️ Vérifiez votre identité par téléphone
6. 📦 Choisissez le plan de support "Basic" (gratuit)

## 🔐 Étape 2 : Créer un Utilisateur IAM avec les Permissions Nécessaires

### 2.1 Se connecter à la Console AWS
1. 🌐 Allez sur [console.aws.amazon.com](https://console.aws.amazon.com)
2. 🔐 Connectez-vous avec votre compte root

### 2.2 Accéder au Service IAM
1. 🔍 Recherchez "IAM" dans la barre de recherche AWS
2. 🎯 Cliquez sur "IAM" (Identity and Access Management)

### 2.3 Créer un Utilisateur
1. 👥 Dans le menu de gauche, cliquez sur "Users"
2. ➕ Cliquez sur "Add users" (Ajouter des utilisateurs)
3. 📝 Nom d'utilisateur : `karangue221-deploy`
4. ✅ Cochez "Access key - Programmatic access"
5. ⏭️ Cliquez sur "Next: Permissions"

### 2.4 Attacher les Permissions
Pour simplifier le déploiement initial, nous allons donner des permissions administrateur.

**Option 1 : Permissions Administrateur (plus simple)**
1. ☑️ Cochez "Attach existing policies directly"
2. 🔍 Recherchez "AdministratorAccess"
3. ✅ Cochez la policy "AdministratorAccess"
4. ⏭️ Cliquez sur "Next: Tags"

**Option 2 : Permissions Granulaires (plus sécurisé)**
Attachez ces policies spécifiques :
- `AmazonVPCFullAccess`
- `AmazonEC2FullAccess`
- `AmazonRDSFullAccess`
- `AmazonS3FullAccess`
- `AmazonECS_FullAccess`
- `ElastiCacheFullAccess`
- `CloudWatchFullAccess`
- `IAMFullAccess`
- `ApplicationAutoScalingFullAccess`

### 2.5 Finaliser la Création
1. 🏷️ Tags (optionnel) : Ajoutez des tags si souhaité
2. ⏭️ Cliquez sur "Next: Review"
3. 👀 Vérifiez les informations
4. ✅ Cliquez sur "Create user"

### 2.6 Récupérer les Credentials
⚠️ **IMPORTANT** : Cette étape est critique !

1. 📋 **Copiez immédiatement** les informations affichées :
   - `Access key ID` : Commence par "AKIA..."
   - `Secret access key` : Chaîne longue et aléatoire
2. 💾 **Sauvegardez ces informations** dans un endroit sûr
3. ⬇️ Optionnel : Téléchargez le fichier .csv

❗ **ATTENTION** : Le Secret Access Key ne sera plus jamais affiché après cette étape !

## 🛠️ Étape 3 : Configurer AWS CLI

### 3.1 Configuration Interactive
```bash
# Lancer la configuration AWS CLI
aws configure

# Entrez vos informations :
# AWS Access Key ID : [Votre Access Key ID]
# AWS Secret Access Key : [Votre Secret Access Key]  
# Default region name : us-west-2
# Default output format : json
```

### 3.2 Vérification de la Configuration
```bash
# Tester la configuration
aws sts get-caller-identity

# Vous devriez voir quelque chose comme :
# {
#     "UserId": "AIDACKCEVSQ6C2EXAMPLE",
#     "Account": "123456789012",
#     "Arn": "arn:aws:iam::123456789012:user/karangue221-deploy"
# }
```

## 🎯 Étape 4 : Vérification des Quotas et Limites

Vérifiez que votre compte AWS a les quotas suffisants :

```bash
# Vérifier les limites VPC
aws ec2 describe-account-attributes --attribute-names supported-platforms

# Vérifier les limites ECS
aws ecs describe-account-settings
```

## 🌍 Étape 5 : Choix de la Région AWS

Pour ce projet, nous recommandons **us-west-2** (Oregon) car :
- ✅ Tous les services AWS sont disponibles
- 💰 Coûts compétitifs
- 🚀 Bonne latence depuis l'Afrique de l'Ouest
- 🛡️ Conformité et sécurité

Autres régions possibles :
- `eu-west-1` (Irlande) - Plus proche de l'Afrique
- `us-east-1` (Virginie) - Moins cher pour certains services

## 💰 Étape 6 : Estimation des Coûts

### Coûts de l'Infrastructure de Dev (premier mois)
- **RDS MySQL (db.t3.micro)** : ~$15-20
- **ElastiCache (cache.t3.micro)** : ~$15-20  
- **ECS Fargate** : ~$30-50
- **Load Balancer** : ~$20-25
- **VPC, S3, CloudWatch** : ~$10-20
- **Total estimé** : ~$90-135/mois

### 📊 Surveillance des Coûts
1. 💳 Activez la billing alert dans AWS
2. 📈 Configurez CloudWatch billing alarms
3. 🎯 Définissez un budget mensuel

## 🔒 Étape 7 : Bonnes Pratiques de Sécurité

### 7.1 Sécurisation des Credentials
```bash
# Vérifiez que .aws/ est dans .gitignore
echo ".aws/" >> .gitignore

# Définissez des permissions strictes sur les fichiers AWS
chmod 600 ~/.aws/credentials
chmod 600 ~/.aws/config
```

### 7.2 Rotation des Clés
- 🔄 Changez vos access keys tous les 90 jours
- 📱 Activez MFA sur votre compte root AWS
- 🔐 Utilisez AWS Secrets Manager pour les secrets d'application

## 🚨 Dépannage Courant

### Erreur "Unable to locate credentials"
```bash
# Vérifiez la configuration
aws configure list

# Re-configurez si nécessaire
aws configure
```

### Erreur de permissions
```bash
# Vérifiez votre identité
aws sts get-caller-identity

# Vérifiez les policies attachées à votre utilisateur
aws iam list-attached-user-policies --user-name karangue221-deploy
```

### Erreur de région
```bash
# Changez la région par défaut
aws configure set region us-west-2
```

## ✅ Checklist de Validation

Avant de continuer avec Terraform :

- [ ] ✅ Compte AWS créé et vérifié
- [ ] 👤 Utilisateur IAM créé avec les bonnes permissions
- [ ] 🔑 Access Key et Secret Key récupérés et sauvegardés
- [ ] ⚙️ AWS CLI configuré
- [ ] 🧪 `aws sts get-caller-identity` fonctionne
- [ ] 🌍 Région configurée sur `us-west-2`
- [ ] 💰 Billing alerts configurées
- [ ] 🔒 Credentials sécurisés

## 🔄 Prochaines Étapes

Une fois AWS configuré :
1. 🚀 Retour au script : `./scripts/setup-aws.sh`
2. 🏗️ Initialisation Terraform : `cd terraform && terraform init`
3. 📋 Planification : `terraform plan`
4. 🚀 Déploiement : `terraform apply`

---

**🆘 Besoin d'aide ?**
- 📖 [Documentation AWS CLI](https://docs.aws.amazon.com/cli/)
- 🎓 [AWS Getting Started](https://aws.amazon.com/getting-started/)
- 💬 Support AWS (payant) ou forums communautaires
