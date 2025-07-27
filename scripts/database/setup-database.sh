#!/bin/bash

echo "🚀 Setting up PostgreSQL database for Video-IA.net"

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "📦 Installing PostgreSQL..."
    
    # Update package list
    sudo apt update
    
    # Install PostgreSQL
    sudo apt install -y postgresql postgresql-contrib
    
    echo "✅ PostgreSQL installed successfully"
else
    echo "✅ PostgreSQL is already installed"
fi

# Start PostgreSQL service
echo "🔄 Starting PostgreSQL service..."
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
echo "🗄️  Creating database and user..."

# Switch to postgres user to create database
sudo -u postgres psql << EOF
-- Create database
CREATE DATABASE video_ia_db;

-- Create user
CREATE USER video_ia_user WITH PASSWORD 'video_ia_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE video_ia_db TO video_ia_user;

-- Connect to the database
\c video_ia_db;

-- Grant schema privileges
GRANT ALL ON SCHEMA public TO video_ia_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO video_ia_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO video_ia_user;

-- Exit
\q
EOF

echo "✅ Database and user created successfully"

# Update .env file with correct database URL
echo "📝 Updating .env file..."
cat > .env << EOF
# Database
DATABASE_URL="postgresql://video_ia_user:video_ia_password@localhost:5432/video_ia_db"

# Next.js
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_SITE_NAME="Video-IA.net"
EOF

echo "✅ .env file updated"

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npm run db:generate

# Push schema to database
echo "📊 Pushing schema to database..."
npm run db:push

echo "🎉 Database setup completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Run 'npm run db:seed' to migrate CSV data to database"
echo "2. Run 'npm run dev' to start the development server"
echo "3. Run 'npm run db:studio' to open Prisma Studio"
echo ""
echo "🔗 Database connection:"
echo "   Host: localhost"
echo "   Port: 5432"
echo "   Database: video_ia_db"
echo "   User: video_ia_user"
echo "   Password: video_ia_password" 