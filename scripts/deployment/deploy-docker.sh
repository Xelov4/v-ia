#!/bin/bash

# Script de déploiement Docker pour Video-IA.net
# Usage: ./deploy-docker.sh

set -e

echo "🐳 Déploiement Docker de Video-IA.net..."

# Variables
PROJECT_NAME="video-ia"
DOMAIN="video-ia.net"

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

# Vérifier les prérequis
print_status "Vérification des prérequis..."

# Vérifier Docker
if ! command -v docker &> /dev/null; then
    print_error "Docker n'est pas installé"
    exit 1
fi

# Vérifier Docker Compose
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose n'est pas installé"
    exit 1
fi

# Vérifier que le fichier CSV existe
if [ ! -f "working_database_rationalized_full.csv" ]; then
    print_error "Le fichier working_database_rationalized_full.csv n'est pas présent"
    exit 1
fi

print_status "Prérequis vérifiés ✅"

# Créer le répertoire SSL s'il n'existe pas
print_status "Configuration SSL..."
mkdir -p ssl

# Générer des certificats auto-signés pour le développement
if [ ! -f "ssl/cert.pem" ] || [ ! -f "ssl/key.pem" ]; then
    print_warning "Génération de certificats SSL auto-signés..."
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout ssl/key.pem \
        -out ssl/cert.pem \
        -subj "/C=FR/ST=France/L=Paris/O=Video-IA/CN=$DOMAIN"
fi

# Arrêter les conteneurs existants
print_status "Arrêt des conteneurs existants..."
docker-compose down 2>/dev/null || true

# Construire et démarrer les conteneurs
print_status "Construction et démarrage des conteneurs..."
docker-compose up -d --build

# Attendre que les conteneurs soient prêts
print_status "Attente du démarrage des services..."
sleep 30

# Vérifier le statut des conteneurs
print_status "Vérification du statut des conteneurs..."
docker-compose ps

# Vérifier les logs
print_status "Vérification des logs..."
docker-compose logs --tail=20

# Test de connectivité
print_status "Test de connectivité..."
if curl -f http://localhost/health > /dev/null 2>&1; then
    print_status "✅ Application accessible sur http://localhost"
else
    print_warning "⚠️  L'application n'est pas encore accessible, attendez quelques secondes..."
fi

print_status "🎉 Déploiement Docker terminé !"
print_status "Site accessible sur: http://localhost"
print_status "Admin accessible sur: http://localhost/admin"

print_status "Commandes utiles:"
echo "  - Voir les logs: docker-compose logs -f"
echo "  - Redémarrer: docker-compose restart"
echo "  - Arrêter: docker-compose down"
echo "  - Mettre à jour: docker-compose pull && docker-compose up -d"
echo "  - Voir le statut: docker-compose ps"

# Configuration SSL avec Let's Encrypt (optionnel)
read -p "Voulez-vous configurer SSL avec Let's Encrypt ? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_status "Configuration SSL avec Let's Encrypt..."
    
    # Installer Certbot
    sudo apt update
    sudo apt install certbot -y
    
    # Obtenir le certificat SSL
    sudo certbot certonly --standalone -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN
    
    # Copier les certificats
    sudo cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem ssl/cert.pem
    sudo cp /etc/letsencrypt/live/$DOMAIN/privkey.pem ssl/key.pem
    sudo chown $USER:$USER ssl/cert.pem ssl/key.pem
    
    # Redémarrer les conteneurs
    docker-compose restart nginx
    
    print_status "SSL configuré: https://$DOMAIN"
fi 