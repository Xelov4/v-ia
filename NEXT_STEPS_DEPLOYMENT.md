# 🚀 Next Steps - Déploiement Video-IA.net

**Date de création** : 27 juillet 2024  
**Version** : 1.0.0  
**Auteur** : Video-IA.net Team

## 📋 Table des matières

1. [Corrections urgentes avant déploiement](#corrections-urgentes-avant-déploiement)
2. [Préparation du VPS](#préparation-du-vps)
3. [Installation de la base de données](#installation-de-la-base-de-données)
4. [Déploiement de l'application](#déploiement-de-lapplication)
5. [Configuration du serveur web](#configuration-du-serveur-web)
6. [Configuration SSL](#configuration-ssl)
7. [Vérifications finales](#vérifications-finales)
8. [Maintenance et monitoring](#maintenance-et-monitoring)

---

## 🔧 Corrections urgentes avant déploiement

### 1. Corriger l'erreur `generateStaticParams()`

**Problème** : L'erreur indique que Next.js essaie d'utiliser `output: 'export'` mais les pages dynamiques n'ont pas de `generateStaticParams()`.

**Solution** : Supprimer `output: 'export'` de `next.config.js`

```bash
# Éditer next.config.js
nano next.config.js
```

Remplacer le contenu par :
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['statics.topai.tools'],
    unoptimized: true,
  },
  trailingSlash: true,
}

module.exports = nextConfig
```

### 2. Corriger l'erreur `fs` module

**Problème** : Le module `fs` ne peut pas être utilisé côté client.

**Solution** : Mettre à jour `lib/data.ts` pour utiliser les données statiques

```bash
# Éditer lib/data.ts
nano lib/data.ts
```

Remplacer par :
```typescript
import { Tool } from './types'

// Données statiques pour développement
const toolsData: Tool[] = [
  {
    tool_name: "ChatGPT",
    tool_category: "AI Assistant",
    tool_link: "https://chat.openai.com",
    overview: "Assistant IA conversationnel",
    tool_description: "ChatGPT est un modèle de langage développé par OpenAI...",
    target_audience: "Professionnels, étudiants, créateurs",
    key_features: "Conversation naturelle, génération de texte, assistance",
    use_cases: "Rédaction, programmation, brainstorming",
    tags: "AI, chatbot, texte, assistant",
    image_url: "https://statics.topai.tools/chatgpt.png"
  },
  // Ajouter 2-3 autres outils pour les tests
]

export class DataManager {
  getAllTools(): Tool[] {
    return toolsData
  }

  getToolBySlug(slug: string): Tool | undefined {
    return toolsData.find(tool => 
      tool.tool_name.toLowerCase().replace(/\s+/g, '-') === slug
    )
  }

  getCategories(): string[] {
    return [...new Set(toolsData.map(tool => tool.tool_category))]
  }
}

export const dataManager = new DataManager()
```

### 3. Corriger l'avertissement `appDir`

**Problème** : `appDir` n'est plus nécessaire dans Next.js 14.

**Solution** : Supprimer `experimental.appDir` de `next.config.js`

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['statics.topai.tools'],
    unoptimized: true,
  },
  trailingSlash: true,
}

module.exports = nextConfig
```

---

## 🖥️ Préparation du VPS

### 1. Connexion au VPS

```bash
# Se connecter au VPS (remplacer par votre IP)
ssh root@VOTRE_IP_VPS

# Mettre à jour le système
apt update && apt upgrade -y
```

### 2. Installation des prérequis

```bash
# Installer les packages essentiels
apt install -y curl wget git unzip software-properties-common apt-transport-https ca-certificates gnupg lsb-release

# Installer Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Vérifier l'installation
node --version  # Doit afficher v18.x.x
npm --version   # Doit afficher 8.x.x ou plus
```

### 3. Installation de PostgreSQL

```bash
# Installer PostgreSQL
apt install -y postgresql postgresql-contrib

# Démarrer et activer PostgreSQL
systemctl start postgresql
systemctl enable postgresql

# Vérifier le statut
systemctl status postgresql
```

### 4. Installation de Nginx

```bash
# Installer Nginx
apt install -y nginx

# Démarrer et activer Nginx
systemctl start nginx
systemctl enable nginx

# Vérifier le statut
systemctl status nginx
```

### 5. Installation de PM2

```bash
# Installer PM2 globalement
npm install -g pm2

# Configurer PM2 pour démarrer au boot
pm2 startup
```

### 6. Installation de Certbot (SSL)

```bash
# Installer Certbot
apt install -y certbot python3-certbot-nginx

# Vérifier l'installation
certbot --version
```

---

## 🗄️ Installation de la base de données

### 1. Configuration de PostgreSQL

```bash
# Se connecter à PostgreSQL
sudo -u postgres psql

# Créer la base de données et l'utilisateur
CREATE DATABASE video_ia_db;
CREATE USER video_ia_user WITH PASSWORD 'video_ia_password_secure_2024';
GRANT ALL PRIVILEGES ON DATABASE video_ia_db TO video_ia_user;
\c video_ia_db;
GRANT ALL ON SCHEMA public TO video_ia_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO video_ia_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO video_ia_user;
\q
```

### 2. Configuration pour les connexions distantes

```bash
# Éditer la configuration PostgreSQL
nano /etc/postgresql/*/main/postgresql.conf

# Décommenter et modifier :
listen_addresses = '*'

# Éditer pg_hba.conf
nano /etc/postgresql/*/main/pg_hba.conf

# Ajouter à la fin :
host    all             all             0.0.0.0/0               md5

# Redémarrer PostgreSQL
systemctl restart postgresql
```

---

## 🚀 Déploiement de l'application

### 1. Préparer le répertoire de l'application

```bash
# Créer le répertoire de l'application
mkdir -p /var/www/video-ia
cd /var/www/video-ia

# Cloner le repository (remplacer par votre URL GitHub)
git clone https://github.com/video-ia/video-ia-directory.git .

# Donner les bonnes permissions
chown -R www-data:www-data /var/www/video-ia
chmod -R 755 /var/www/video-ia
```

### 2. Installation des dépendances

```bash
# Installer les dépendances
npm install

# Vérifier que tout s'installe correctement
npm run type-check
```

### 3. Configuration de l'environnement

```bash
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

# Vérifier le contenu
cat .env
```

### 4. Configuration de la base de données

```bash
# Générer le client Prisma
npm run db:generate

# Créer les tables
npm run db:push

# Migrer les données CSV (si le fichier est présent)
if [ -f "data/raw/working_database_rationalized_full.csv" ]; then
    npm run db:seed
else
    echo "⚠️  Fichier CSV non trouvé. Les données devront être ajoutées manuellement."
fi
```

### 5. Build de l'application

```bash
# Construire l'application
npm run build

# Vérifier que le build s'est bien passé
ls -la .next/
```

### 6. Démarrage avec PM2

```bash
# Démarrer l'application avec PM2
pm2 start npm --name "video-ia" -- start

# Sauvegarder la configuration PM2
pm2 save

# Vérifier que l'application fonctionne
pm2 status
pm2 logs video-ia
```

---

## 🌐 Configuration du serveur web

### 1. Configuration Nginx

```bash
# Créer la configuration du site
cat > /etc/nginx/sites-available/video-ia << 'EOF'
server {
    listen 80;
    server_name www.video-ia.net video-ia.net;

    # Logs
    access_log /var/log/nginx/video-ia.access.log;
    error_log /var/log/nginx/video-ia.error.log;

    # Proxy vers l'application Next.js
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
        add_header Cache-Control "public, immutable";
    }

    # Sécurité
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
}
EOF

# Activer le site
ln -sf /etc/nginx/sites-available/video-ia /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Tester la configuration
nginx -t

# Redémarrer Nginx
systemctl restart nginx
```

### 2. Configuration du firewall

```bash
# Installer UFW
apt install -y ufw

# Configurer les règles
ufw allow ssh
ufw allow 80
ufw allow 443
ufw --force enable

# Vérifier le statut
ufw status
```

---

## 🔒 Configuration SSL

### 1. Obtenir le certificat SSL

```bash
# Obtenir le certificat SSL (remplacer par votre email)
certbot --nginx -d www.video-ia.net --non-interactive --agree-tos --email votre-email@example.com

# Vérifier le certificat
certbot certificates
```

### 2. Configuration du renouvellement automatique

```bash
# Ajouter au crontab
echo "0 12 * * * /usr/bin/certbot renew --quiet" | crontab -

# Vérifier le crontab
crontab -l
```

---

## ✅ Vérifications finales

### 1. Vérifier que tous les services fonctionnent

```bash
# Vérifier les services
systemctl status nginx postgresql

# Vérifier PM2
pm2 status

# Vérifier les ports
netstat -tlnp | grep -E ':(80|443|3000|5432)'
```

### 2. Tester l'application

```bash
# Tester l'application localement
curl -I http://localhost:3000

# Tester via Nginx
curl -I http://www.video-ia.net

# Tester HTTPS
curl -I https://www.video-ia.net
```

### 3. Vérifier la base de données

```bash
# Se connecter à la base de données
psql -h localhost -U video_ia_user -d video_ia_db

# Vérifier les tables
\dt

# Vérifier le nombre d'outils
SELECT COUNT(*) FROM tools;

# Vérifier les catégories
SELECT category, COUNT(*) FROM tools GROUP BY category;

\q
```

### 4. Vérifier les logs

```bash
# Logs de l'application
pm2 logs video-ia

# Logs Nginx
tail -f /var/log/nginx/video-ia.access.log
tail -f /var/log/nginx/video-ia.error.log

# Logs PostgreSQL
tail -f /var/log/postgresql/postgresql-*.log
```

---

## 🔧 Maintenance et monitoring

### 1. Commandes utiles

```bash
# Redémarrer l'application
pm2 restart video-ia

# Voir les logs en temps réel
pm2 logs video-ia --lines 100

# Monitorer les ressources
pm2 monit

# Vérifier l'espace disque
df -h

# Vérifier la mémoire
free -h

# Vérifier les processus
htop
```

### 2. Sauvegarde de la base de données

```bash
# Créer une sauvegarde
pg_dump -h localhost -U video_ia_user video_ia_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Restaurer une sauvegarde
psql -h localhost -U video_ia_user video_ia_db < backup.sql
```

### 3. Mise à jour de l'application

```bash
# Arrêter l'application
pm2 stop video-ia

# Sauvegarder
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

# Redémarrer
pm2 start video-ia
```

### 4. Monitoring de sécurité

```bash
# Installer fail2ban
apt install -y fail2ban

# Configurer pour Nginx et SSH
cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
systemctl restart fail2ban

# Vérifier le statut
fail2ban-client status
```

---

## 🚨 Dépannage

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

---

## 📞 Support

En cas de problème :

1. **Vérifier les logs** : `pm2 logs video-ia`
2. **Consulter la documentation** : `/docs`
3. **Créer une issue** : GitHub Issues
4. **Contacter l'équipe** : contact@video-ia.net

---

## 📋 Checklist de déploiement

- [ ] Corrections urgentes appliquées
- [ ] VPS préparé avec tous les prérequis
- [ ] PostgreSQL installé et configuré
- [ ] Base de données créée et migrée
- [ ] Application clonée et configurée
- [ ] Variables d'environnement définies
- [ ] Application buildée et démarrée avec PM2
- [ ] Nginx configuré et fonctionnel
- [ ] SSL configuré avec Certbot
- [ ] Firewall configuré
- [ ] Tests de fonctionnement effectués
- [ ] Monitoring et sauvegarde configurés

---

**Dernière mise à jour** : 27 juillet 2024  
**Version du guide** : 1.0.0  
**Statut** : Prêt pour déploiement 