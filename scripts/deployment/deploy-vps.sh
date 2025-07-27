#!/bin/bash

# Script de déploiement automatique pour Video-IA.net
# Date: 27 juillet 2024
# Auteur: Video-IA.net Team

set -e  # Arrêter en cas d'erreur

# Configuration
VPS_IP="46.202.129.104"
VPS_USER="root"
REPO_URL="https://github.com/Xelov4/v-ia.git"
APP_NAME="video-ia"
APP_DIR="/var/www/video-ia"
DOMAIN="www.video-ia.net"
EMAIL="jhiad.ejjilali@gmail.com"

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Déploiement automatique Video-IA.net${NC}"
echo -e "${BLUE}=====================================${NC}"

echo -e "${GREEN}✅ Configuration validée${NC}"
echo -e "${BLUE}📍 VPS IP: $VPS_IP${NC}"
echo -e "${BLUE}📧 Email: $EMAIL${NC}"
echo -e "${BLUE}📦 Repository: $REPO_URL${NC}"
echo -e "${BLUE}🌐 Domaine: $DOMAIN${NC}"

# Fonction pour exécuter des commandes sur le VPS
run_on_vps() {
    ssh -o StrictHostKeyChecking=no $VPS_USER@$VPS_IP "$1"
}

# Fonction pour afficher les étapes
step() {
    echo -e "${BLUE}📋 $1${NC}"
}

# Fonction pour afficher les succès
success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# Fonction pour afficher les erreurs
error() {
    echo -e "${RED}❌ $1${NC}"
}

# Fonction pour afficher les avertissements
warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

step "1. Préparation du VPS..."

# Mettre à jour le système
run_on_vps "apt update && apt upgrade -y"
success "Système mis à jour"

# Installer les prérequis
step "2. Installation des prérequis..."

run_on_vps "apt install -y curl wget git unzip software-properties-common apt-transport-https ca-certificates gnupg lsb-release"
success "Packages essentiels installés"

# Installer Node.js 18
run_on_vps "curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && apt install -y nodejs"
success "Node.js 18 installé"

# Installer PostgreSQL
run_on_vps "apt install -y postgresql postgresql-contrib"
run_on_vps "systemctl start postgresql && systemctl enable postgresql"
success "PostgreSQL installé et configuré"

# Installer Nginx
run_on_vps "apt install -y nginx"
run_on_vps "systemctl start nginx && systemctl enable nginx"
success "Nginx installé et configuré"

# Installer PM2
run_on_vps "npm install -g pm2"
run_on_vps "pm2 startup"
success "PM2 installé et configuré"

# Installer Certbot
run_on_vps "apt install -y certbot python3-certbot-nginx"
success "Certbot installé"

step "3. Configuration de la base de données..."

# Créer la base de données et l'utilisateur
run_on_vps "sudo -u postgres psql << 'EOF'
CREATE DATABASE video_ia_db;
CREATE USER video_ia_user WITH PASSWORD 'video_ia_password_secure_2024';
GRANT ALL PRIVILEGES ON DATABASE video_ia_db TO video_ia_user;
\\c video_ia_db;
GRANT ALL ON SCHEMA public TO video_ia_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO video_ia_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO video_ia_user;
\\q
EOF"
success "Base de données créée"

step "4. Déploiement de l'application..."

# Créer le répertoire de l'application
run_on_vps "mkdir -p $APP_DIR"
run_on_vps "cd $APP_DIR"

# Cloner le repository
run_on_vps "cd $APP_DIR && git clone $REPO_URL ."
success "Repository cloné"

# Donner les bonnes permissions
run_on_vps "chown -R www-data:www-data $APP_DIR"
run_on_vps "chmod -R 755 $APP_DIR"

# Installer les dépendances
run_on_vps "cd $APP_DIR && npm install"
success "Dépendances installées"

step "5. Configuration de l'environnement..."

# Créer le fichier .env
run_on_vps "cd $APP_DIR && cat > .env << 'EOF'
# Database
DATABASE_URL=\"postgresql://video_ia_user:video_ia_password_secure_2024@localhost:5432/video_ia_db\"

# Next.js
NEXTAUTH_SECRET=\"\$(openssl rand -base64 32)\"
NEXTAUTH_URL=\"https://$DOMAIN\"

# App
NEXT_PUBLIC_APP_URL=\"https://$DOMAIN\"
NEXT_PUBLIC_SITE_NAME=\"Video-IA.net\"
EOF"
success "Variables d'environnement configurées"

step "6. Configuration de la base de données..."

# Générer le client Prisma
run_on_vps "cd $APP_DIR && npm run db:generate"
success "Client Prisma généré"

# Créer les tables
run_on_vps "cd $APP_DIR && npm run db:push"
success "Tables créées"

# Migrer les données CSV (si le fichier est présent)
if run_on_vps "cd $APP_DIR && [ -f \"data/raw/working_database_rationalized_full.csv\" ]"; then
    run_on_vps "cd $APP_DIR && npm run db:seed"
    success "Données CSV migrées"
else
    warning "Fichier CSV non trouvé. Les données devront être ajoutées manuellement."
fi

step "7. Build de l'application..."

# Construire l'application
run_on_vps "cd $APP_DIR && npm run build"
success "Application construite"

step "8. Démarrage avec PM2..."

# Arrêter les processus existants
run_on_vps "pm2 stop $APP_NAME || true"
run_on_vps "pm2 delete $APP_NAME || true"

# Démarrer l'application
run_on_vps "cd $APP_DIR && pm2 start npm --name \"$APP_NAME\" -- start"
run_on_vps "pm2 save"
success "Application démarrée avec PM2"

step "9. Configuration de Nginx..."

# Créer la configuration Nginx
run_on_vps "cat > /etc/nginx/sites-available/video-ia << 'EOF'
server {
    listen 80;
    server_name $DOMAIN;
    
    # Logs
    access_log /var/log/nginx/video-ia.access.log;
    error_log /var/log/nginx/video-ia.error.log;

    # Proxy vers l'application Next.js
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # Cache statique
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control \"public, immutable\";
    }

    # Sécurité
    add_header X-Frame-Options \"SAMEORIGIN\" always;
    add_header X-XSS-Protection \"1; mode=block\" always;
    add_header X-Content-Type-Options \"nosniff\" always;
    add_header Referrer-Policy \"no-referrer-when-downgrade\" always;
    add_header Content-Security-Policy \"default-src 'self' http: https: data: blob: 'unsafe-inline'\" always;
}
EOF"

# Activer le site
run_on_vps "ln -sf /etc/nginx/sites-available/video-ia /etc/nginx/sites-enabled/"
run_on_vps "rm -f /etc/nginx/sites-enabled/default"

# Tester la configuration
run_on_vps "nginx -t"
run_on_vps "systemctl restart nginx"
success "Nginx configuré"

step "10. Configuration du firewall..."

# Installer et configurer UFW
run_on_vps "apt install -y ufw"
run_on_vps "ufw allow ssh"
run_on_vps "ufw allow 80"
run_on_vps "ufw allow 443"
run_on_vps "ufw --force enable"
success "Firewall configuré"

step "11. Configuration SSL..."

# Obtenir le certificat SSL avec votre email
run_on_vps "certbot --nginx -d $DOMAIN --non-interactive --agree-tos --email $EMAIL"

# Configurer le renouvellement automatique
run_on_vps "echo \"0 12 * * * /usr/bin/certbot renew --quiet\" | crontab -"
success "SSL configuré"

step "12. Vérifications finales..."

# Vérifier les services
run_on_vps "systemctl status nginx postgresql"
run_on_vps "pm2 status"

# Tester l'application
run_on_vps "curl -I http://localhost:3000 || echo 'Application non accessible'"
run_on_vps "curl -I http://$DOMAIN || echo 'Domaine non accessible'"

success "Déploiement terminé !"

echo -e "${GREEN}🎉 Déploiement réussi !${NC}"
echo -e "${BLUE}🌐 Site: https://$DOMAIN${NC}"
echo -e "${BLUE}📊 PM2: pm2 monit${NC}"
echo -e "${BLUE}📝 Logs: pm2 logs $APP_NAME${NC}"
echo -e "${BLUE}🗄️  DB: npm run db:studio${NC}"

echo -e "${YELLOW}⚠️  Actions manuelles requises:${NC}"
echo -e "${YELLOW}1. Vérifier que le domaine pointe vers $VPS_IP${NC}"
echo -e "${YELLOW}2. Tester le site: https://$DOMAIN${NC}"
echo -e "${YELLOW}3. Vérifier les logs: pm2 logs $APP_NAME${NC}"

echo -e "${BLUE}📚 Documentation: /docs${NC}"
echo -e "${BLUE}🔧 Scripts: /scripts${NC}" 