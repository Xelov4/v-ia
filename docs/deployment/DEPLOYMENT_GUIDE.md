# Guide de Déploiement - Video-IA.net

**Date de création** : 27 juillet 2024  
**Version** : 1.0.0  
**Auteur** : Video-IA.net Team

## 📋 Table des matières

1. [Prérequis](#prérequis)
2. [Installation automatique](#installation-automatique)
3. [Installation manuelle](#installation-manuelle)
4. [Configuration SSL](#configuration-ssl)
5. [Maintenance](#maintenance)
6. [Dépannage](#dépannage)

## 🎯 Prérequis

### Serveur VPS
- **OS** : Ubuntu 20.04+ ou Debian 11+
- **RAM** : 2GB minimum (4GB recommandé)
- **CPU** : 2 cores minimum
- **Stockage** : 20GB minimum
- **Domaine** : www.video-ia.net (configuré)

### Accès
- **SSH** : Accès root au serveur
- **Git** : Repository GitHub configuré
- **DNS** : Domaine pointant vers l'IP du VPS

## 🚀 Installation automatique

### Étape 1 : Préparer le script

```bash
# Éditer le script avec votre IP
nano scripts/deployment/deploy-vps.sh

# Modifier la variable VPS_IP
VPS_IP="votre-ip-vps"
```

### Étape 2 : Exécuter le déploiement

```bash
# Rendre le script exécutable
chmod +x scripts/deployment/deploy-vps.sh

# Lancer le déploiement
./scripts/deployment/deploy-vps.sh
```

### Étape 3 : Vérifier l'installation

```bash
# Tester le site
curl -I https://www.video-ia.net

# Vérifier les services
ssh root@votre-ip-vps "systemctl status nginx postgresql"
```

## 🔧 Installation manuelle

### 1. Connexion au VPS

```bash
ssh root@votre-ip-vps
```

### 2. Mise à jour du système

```bash
apt update && apt upgrade -y
```

### 3. Installation de Node.js

```bash
# Ajouter le repository Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -

# Installer Node.js
apt install -y nodejs

# Vérifier l'installation
node --version
npm --version
```

### 4. Installation de PostgreSQL

```bash
# Installer PostgreSQL
apt install -y postgresql postgresql-contrib

# Démarrer et activer le service
systemctl start postgresql
systemctl enable postgresql

# Vérifier le statut
systemctl status postgresql
```

### 5. Configuration de la base de données

```bash
# Créer la base de données et l'utilisateur
sudo -u postgres psql << EOF
CREATE DATABASE video_ia_db;
CREATE USER video_ia_user WITH PASSWORD 'video_ia_password_secure_2024';
GRANT ALL PRIVILEGES ON DATABASE video_ia_db TO video_ia_user;
\c video_ia_db;
GRANT ALL ON SCHEMA public TO video_ia_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO video_ia_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO video_ia_user;
\q
EOF
```

### 6. Installation de Nginx

```bash
# Installer Nginx
apt install -y nginx

# Configurer le site
cat > /etc/nginx/sites-available/video-ia << 'EOF'
server {
    listen 80;
    server_name www.video-ia.net;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

# Activer le site
ln -sf /etc/nginx/sites-available/video-ia /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Tester la configuration
nginx -t

# Redémarrer Nginx
systemctl restart nginx
systemctl enable nginx
```

### 7. Installation de PM2

```bash
# Installer PM2 globalement
npm install -g pm2

# Configurer PM2 pour démarrer au boot
pm2 startup
```

### 8. Déploiement de l'application

```bash
# Créer le répertoire de l'application
mkdir -p /var/www/video-ia
cd /var/www/video-ia

# Cloner le repository (remplacer par votre URL)
git clone https://github.com/video-ia/video-ia-directory.git .

# Installer les dépendances
npm install

# Créer le fichier .env
cat > .env << 'EOF'
# Database
DATABASE_URL="postgresql://video_ia_user:video_ia_password_secure_2024@localhost:5432/video_ia_db"

# Next.js
NEXTAUTH_SECRET="$(openssl rand -base64 32)"
NEXTAUTH_URL="https://www.video-ia.net"

# App
NEXT_PUBLIC_APP_URL="https://www.video-ia.net"
NEXT_PUBLIC_SITE_NAME="Video-IA.net"
EOF

# Générer le client Prisma
npm run db:generate

# Créer les tables
npm run db:push

# Migrer les données CSV
npm run db:seed

# Construire l'application
npm run build

# Démarrer avec PM2
pm2 start npm --name "video-ia" -- start
pm2 save
```

## 🔒 Configuration SSL

### Installation de Certbot

```bash
# Installer Certbot
apt install -y certbot python3-certbot-nginx

# Obtenir le certificat SSL
certbot --nginx -d www.video-ia.net --non-interactive --agree-tos --email votre-email@example.com

# Configurer le renouvellement automatique
echo "0 12 * * * /usr/bin/certbot renew --quiet" | crontab -
```

### Vérification SSL

```bash
# Tester la configuration SSL
curl -I https://www.video-ia.net

# Vérifier le certificat
openssl s_client -connect www.video-ia.net:443 -servername www.video-ia.net
```

## 🔧 Maintenance

### Commandes utiles

```bash
# Voir les logs de l'application
pm2 logs video-ia

# Redémarrer l'application
pm2 restart video-ia

# Monitorer les processus
pm2 monit

# Voir le statut des services
systemctl status nginx postgresql

# Vérifier l'espace disque
df -h

# Vérifier la mémoire
free -h
```

### Sauvegarde de la base de données

```bash
# Créer une sauvegarde
pg_dump -h localhost -U video_ia_user video_ia_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Restaurer une sauvegarde
psql -h localhost -U video_ia_user video_ia_db < backup.sql
```

### Mise à jour de l'application

```bash
# Arrêter l'application
pm2 stop video-ia

# Sauvegarder les données actuelles
cp -r /var/www/video-ia /var/www/video-ia.backup.$(date +%Y%m%d_%H%M%S)

# Mettre à jour le code
cd /var/www/video-ia
git pull origin main

# Installer les nouvelles dépendances
npm install

# Générer le client Prisma (si nécessaire)
npm run db:generate

# Construire l'application
npm run build

# Redémarrer l'application
pm2 start video-ia
```

## 🐛 Dépannage

### Problèmes courants

#### 1. L'application ne démarre pas

```bash
# Vérifier les logs
pm2 logs video-ia

# Vérifier la configuration
npm run type-check

# Vérifier la base de données
psql -h localhost -U video_ia_user -d video_ia_db -c "SELECT COUNT(*) FROM tools;"
```

#### 2. Nginx ne fonctionne pas

```bash
# Vérifier la configuration
nginx -t

# Vérifier les logs
tail -f /var/log/nginx/error.log

# Redémarrer Nginx
systemctl restart nginx
```

#### 3. Base de données inaccessible

```bash
# Vérifier le service PostgreSQL
systemctl status postgresql

# Vérifier la connexion
psql -h localhost -U video_ia_user -d video_ia_db

# Redémarrer PostgreSQL
systemctl restart postgresql
```

#### 4. Certificat SSL expiré

```bash
# Renouveler le certificat
certbot renew

# Vérifier le statut
certbot certificates
```

### Logs utiles

```bash
# Logs de l'application
pm2 logs video-ia

# Logs Nginx
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log

# Logs PostgreSQL
tail -f /var/log/postgresql/postgresql-*.log

# Logs système
journalctl -u nginx
journalctl -u postgresql
```

## 📊 Monitoring

### Outils recommandés

- **PM2** : Monitoring des processus Node.js
- **htop** : Monitoring système
- **nginx-status** : Statistiques Nginx
- **pg_stat_statements** : Statistiques PostgreSQL

### Alertes

Configurer des alertes pour :
- Utilisation CPU > 80%
- Utilisation mémoire > 90%
- Espace disque < 10%
- Temps de réponse > 5s

## 🔐 Sécurité

### Firewall

```bash
# Installer UFW
apt install -y ufw

# Configurer les règles
ufw allow ssh
ufw allow 80
ufw allow 443
ufw enable
```

### Mise à jour automatique

```bash
# Configurer les mises à jour automatiques
apt install -y unattended-upgrades
dpkg-reconfigure -plow unattended-upgrades
```

### Monitoring de sécurité

```bash
# Installer fail2ban
apt install -y fail2ban

# Configurer pour Nginx et SSH
cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
systemctl restart fail2ban
```

## 📞 Support

En cas de problème :

1. **Vérifier les logs** : `pm2 logs video-ia`
2. **Consulter la documentation** : `/docs`
3. **Créer une issue** : GitHub Issues
4. **Contacter l'équipe** : contact@video-ia.net

---

**Dernière mise à jour** : 27 juillet 2024  
**Version du guide** : 1.0.0 