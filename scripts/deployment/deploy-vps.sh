#!/bin/bash

echo "🚀 Deploying Video-IA.net to VPS..."

# Variables
VPS_IP="your-vps-ip"
VPS_USER="root"
DOMAIN="www.video-ia.net"
APP_DIR="/var/www/video-ia"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if VPS_IP is set
if [ "$VPS_IP" = "your-vps-ip" ]; then
    print_error "Please update VPS_IP in this script with your actual VPS IP"
    exit 1
fi

print_status "Starting deployment to VPS..."

# 1. Setup VPS (first time only)
print_status "Setting up VPS environment..."
ssh $VPS_USER@$VPS_IP "bash -s" < scripts/setup-vps.sh

# 2. Create deployment package
print_status "Creating deployment package..."
tar -czf video-ia-deploy.tar.gz \
    --exclude=node_modules \
    --exclude=.next \
    --exclude=.git \
    --exclude=*.log \
    .

# 3. Upload to VPS
print_status "Uploading files to VPS..."
scp video-ia-deploy.tar.gz $VPS_USER@$VPS_IP:/tmp/

# 4. Deploy on VPS
print_status "Deploying application on VPS..."
ssh $VPS_USER@$VPS_IP << EOF
    # Stop existing application
    pm2 stop video-ia || true
    pm2 delete video-ia || true
    
    # Backup existing data
    if [ -d "$APP_DIR" ]; then
        cp -r $APP_DIR $APP_DIR.backup.\$(date +%Y%m%d_%H%M%S)
    fi
    
    # Extract new version
    rm -rf $APP_DIR
    mkdir -p $APP_DIR
    cd $APP_DIR
    tar -xzf /tmp/video-ia-deploy.tar.gz
    
    # Install dependencies
    npm install --production
    
    # Generate Prisma client
    npm run db:generate
    
    # Push database schema
    npm run db:push
    
    # Migrate CSV data (only if not already done)
    if [ ! -f .data-migrated ]; then
        npm run db:seed
        touch .data-migrated
    fi
    
    # Build application
    npm run build
    
    # Start with PM2
    pm2 start npm --name "video-ia" -- start
    pm2 save
    pm2 startup
    
    # Cleanup
    rm /tmp/video-ia-deploy.tar.gz
EOF

# 5. Setup SSL certificate
print_status "Setting up SSL certificate..."
ssh $VPS_USER@$VPS_IP "certbot --nginx -d $DOMAIN --non-interactive --agree-tos --email your-email@example.com"

# 6. Test deployment
print_status "Testing deployment..."
sleep 10
curl -I "https://$DOMAIN"

print_status "Deployment completed successfully!"
echo ""
echo "🌐 Your site is now live at: https://$DOMAIN"
echo ""
echo "📊 Useful commands:"
echo "  - View logs: ssh $VPS_USER@$VPS_IP 'pm2 logs video-ia'"
echo "  - Restart app: ssh $VPS_USER@$VPS_IP 'pm2 restart video-ia'"
echo "  - Monitor: ssh $VPS_USER@$VPS_IP 'pm2 monit'"
echo "  - Database: ssh $VPS_USER@$VPS_IP 'psql -h localhost -U video_ia_user -d video_ia_db'"
echo ""
echo "🔧 Maintenance:"
echo "  - Update: ./scripts/deploy-vps.sh"
echo "  - Backup DB: ssh $VPS_USER@$VPS_IP 'pg_dump -h localhost -U video_ia_user video_ia_db > backup.sql'"
echo "  - Restore DB: ssh $VPS_USER@$VPS_IP 'psql -h localhost -U video_ia_user video_ia_db < backup.sql'"

# Cleanup local files
rm -f video-ia-deploy.tar.gz 