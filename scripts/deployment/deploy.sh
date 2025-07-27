#!/bin/bash

# Script de déploiement pour Video-IA.net
# Usage: ./deploy.sh

set -e

echo "🚀 Déploiement de Video-IA.net..."

# Variables
PROJECT_NAME="video-ia"
DOMAIN="video-ia.net"
PROJECT_PATH="/var/www/$DOMAIN"
NGINX_CONFIG="/etc/nginx/sites-available/$DOMAIN"

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Fonction pour afficher les messages
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Vérifier si on est root
if [[ $EUID -eq 0 ]]; then
   print_error "Ce script ne doit pas être exécuté en tant que root"
   exit 1
fi

# Vérifier les prérequis
print_status "Vérification des prérequis..."

# Vérifier Node.js
if ! command -v node &> /dev/null; then
    print_error "Node.js n'est pas installé"
    exit 1
fi

# Vérifier npm
if ! command -v npm &> /dev/null; then
    print_error "npm n'est pas installé"
    exit 1
fi

# Vérifier PM2
if ! command -v pm2 &> /dev/null; then
    print_warning "PM2 n'est pas installé, installation..."
    sudo npm install -g pm2
fi

# Vérifier Nginx
if ! command -v nginx &> /dev/null; then
    print_warning "Nginx n'est pas installé, installation..."
    sudo apt update
    sudo apt install nginx -y
fi

print_status "Prérequis vérifiés ✅"

# Créer le répertoire du projet
print_status "Création du répertoire du projet..."
sudo mkdir -p $PROJECT_PATH
sudo chown $USER:$USER $PROJECT_PATH

# Copier les fichiers du projet
print_status "Copie des fichiers du projet..."
cp -r . $PROJECT_PATH/
cd $PROJECT_PATH

# Installer les dépendances
print_status "Installation des dépendances..."
npm install

# Vérifier que le fichier CSV existe
if [ ! -f "working_database_rationalized_full.csv" ]; then
    print_error "Le fichier working_database_rationalized_full.csv n'est pas présent"
    exit 1
fi

# Construire le projet
print_status "Construction du projet..."
npm run build

# Configurer PM2
print_status "Configuration de PM2..."
pm2 delete $PROJECT_NAME 2>/dev/null || true
pm2 start npm --name $PROJECT_NAME -- start
pm2 save
pm2 startup

# Configurer Nginx
print_status "Configuration de Nginx..."

sudo tee $NGINX_CONFIG > /dev/null <<EOF
server {
    listen 80;
    server_name www.$DOMAIN $DOMAIN;

    root $PROJECT_PATH/out;
    index index.html;

    # Compression gzip
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # Cache statique
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|webp)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Pages dynamiques
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # Sécurité
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Logs
    access_log /var/log/nginx/$DOMAIN.access.log;
    error_log /var/log/nginx/$DOMAIN.error.log;
}
EOF

# Activer le site
print_status "Activation du site..."
sudo ln -sf $NGINX_CONFIG /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Configurer le firewall
print_status "Configuration du firewall..."
sudo ufw allow 'Nginx Full'
sudo ufw allow ssh
sudo ufw --force enable

# Configurer SSL (optionnel)
read -p "Voulez-vous configurer SSL avec Let's Encrypt ? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_status "Configuration SSL..."
    
    # Installer Certbot
    sudo apt install certbot python3-certbot-nginx -y
    
    # Obtenir le certificat SSL
    sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN
    
    # Configurer le renouvellement automatique
    (crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | crontab -
fi

# Vérifier le statut
print_status "Vérification du statut..."
pm2 status
sudo systemctl status nginx

print_status "🎉 Déploiement terminé avec succès !"
print_status "Site accessible sur: http://$DOMAIN"
if [ -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]; then
    print_status "SSL configuré: https://$DOMAIN"
fi

print_status "Commandes utiles:"
echo "  - Redémarrer l'app: pm2 restart $PROJECT_NAME"
echo "  - Voir les logs: pm2 logs $PROJECT_NAME"
echo "  - Redémarrer Nginx: sudo systemctl restart nginx"
echo "  - Voir le statut: pm2 status" 