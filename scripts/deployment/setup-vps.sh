#!/bin/bash

echo "🚀 Setting up Video-IA.net on VPS..."

# Variables
DB_NAME="video_ia_db"
DB_USER="video_ia_user"
DB_PASSWORD="video_ia_password_secure_2024"
DOMAIN="www.video-ia.net"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    print_error "Please run as root (use sudo)"
    exit 1
fi

print_status "Starting VPS setup for Video-IA.net..."

# Update system
print_status "Updating system packages..."
apt update && apt upgrade -y

# Install Node.js and npm
print_status "Installing Node.js and npm..."
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Install PostgreSQL
print_status "Installing PostgreSQL..."
apt install -y postgresql postgresql-contrib

# Start and enable PostgreSQL
print_status "Starting PostgreSQL service..."
systemctl start postgresql
systemctl enable postgresql

# Create database and user
print_status "Creating database and user..."
sudo -u postgres psql << EOF
CREATE DATABASE $DB_NAME;
CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;
\c $DB_NAME;
GRANT ALL ON SCHEMA public TO $DB_USER;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO $DB_USER;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO $DB_USER;
\q
EOF

# Configure PostgreSQL for remote connections
print_status "Configuring PostgreSQL for remote connections..."

# Update postgresql.conf
POSTGRES_CONF=$(find /etc/postgresql -name "postgresql.conf" | head -1)
if [ -n "$POSTGRES_CONF" ]; then
    sed -i "s/#listen_addresses = 'localhost'/listen_addresses = '*'/" "$POSTGRES_CONF"
fi

# Update pg_hba.conf
PG_HBA_CONF=$(find /etc/postgresql -name "pg_hba.conf" | head -1)
if [ -n "$PG_HBA_CONF" ]; then
    echo "host    $DB_NAME    $DB_USER    127.0.0.1/32            md5" >> "$PG_HBA_CONF"
    echo "host    $DB_NAME    $DB_USER    ::1/128                 md5" >> "$PG_HBA_CONF"
fi

# Restart PostgreSQL
systemctl restart postgresql

# Install PM2 for process management
print_status "Installing PM2..."
npm install -g pm2

# Install Nginx
print_status "Installing Nginx..."
apt install -y nginx

# Configure Nginx
print_status "Configuring Nginx..."
cat > /etc/nginx/sites-available/video-ia << EOF
server {
    listen 80;
    server_name $DOMAIN;
    
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
    }
}
EOF

# Enable the site
ln -sf /etc/nginx/sites-available/video-ia /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
nginx -t

# Start Nginx
systemctl start nginx
systemctl enable nginx

# Install Certbot for SSL
print_status "Installing Certbot for SSL..."
apt install -y certbot python3-certbot-nginx

# Create application directory
print_status "Setting up application directory..."
mkdir -p /var/www/video-ia
cd /var/www/video-ia

# Create .env file
print_status "Creating environment configuration..."
cat > .env << EOF
# Database
DATABASE_URL="postgresql://$DB_USER:$DB_PASSWORD@localhost:5432/$DB_NAME"

# Next.js
NEXTAUTH_SECRET="$(openssl rand -base64 32)"
NEXTAUTH_URL="https://$DOMAIN"

# App
NEXT_PUBLIC_APP_URL="https://$DOMAIN"
NEXT_PUBLIC_SITE_NAME="Video-IA.net"
EOF

print_status "VPS setup completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Upload your project files to /var/www/video-ia/"
echo "2. Run: cd /var/www/video-ia && npm install"
echo "3. Run: npm run db:generate && npm run db:push"
echo "4. Run: npm run db:seed (to migrate CSV data)"
echo "5. Run: pm2 start npm --name 'video-ia' -- start"
echo "6. Run: certbot --nginx -d $DOMAIN"
echo ""
echo "🔗 Database connection:"
echo "   Host: localhost"
echo "   Port: 5432"
echo "   Database: $DB_NAME"
echo "   User: $DB_USER"
echo "   Password: $DB_PASSWORD"
echo ""
echo "🌐 Domain: https://$DOMAIN" 