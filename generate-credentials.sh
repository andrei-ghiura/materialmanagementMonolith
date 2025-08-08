#!/bin/bash
# generate-credentials.sh
# Script to generate secure random credentials for the Material Manager application

echo "Generating secure credentials for Material Manager..."

# Function to generate random password
generate_password() {
    openssl rand -base64 32 | tr -d "=+/" | cut -c1-24
}

# Generate usernames with timestamp
TIMESTAMP=$(date +%Y%m)

# Generate secure credentials
MONGO_ROOT_USERNAME="admin_user_${TIMESTAMP}"
MONGO_ROOT_PASSWORD=$(generate_password)
MONGODB_USER="app_user_mm_${TIMESTAMP}"
MONGODB_PASSWORD=$(generate_password)
MONGO_EXPRESS_USERNAME="admin_express_${TIMESTAMP}"
MONGO_EXPRESS_PASSWORD=$(generate_password)

# Create .env file
cat > .env << EOF
# MongoDB Configuration
MONGO_ROOT_USERNAME=${MONGO_ROOT_USERNAME}
MONGO_ROOT_PASSWORD=${MONGO_ROOT_PASSWORD}
MONGO_INITDB_DATABASE=materialmanager_db

# Application Database User
MONGO_APP_USER=${MONGODB_USER}
MONGO_APP_PASSWORD=${MONGODB_PASSWORD}
MONGODB_USER=${MONGODB_USER}
MONGODB_PASSWORD=${MONGODB_PASSWORD}

# MongoDB Express Configuration
MONGO_EXPRESS_USERNAME=${MONGO_EXPRESS_USERNAME}
MONGO_EXPRESS_PASSWORD=${MONGO_EXPRESS_PASSWORD}

# Application Environment
NODE_ENV=production
PORT=3000

# Database Connection
MONGODB_URL=mongodb://${MONGODB_USER}:${MONGODB_PASSWORD}@mongo:27017/materialmanager_db?authSource=materialmanager_db

# Generated on: $(date)
# Security Note: Keep this file secure and never commit it to version control
EOF

# Update mongo-init.js with new credentials
sed -i "s/const appUser = '[^']*'/const appUser = '${MONGODB_USER}'/" db/docker-entrypoint-initdb.d/mongo-init.js
sed -i "s/const appPassword = '[^']*'/const appPassword = '${MONGODB_PASSWORD}'/" db/docker-entrypoint-initdb.d/mongo-init.js

echo "✅ Secure credentials generated and saved to .env"
echo "✅ mongo-init.js updated with new application user credentials"
echo ""
echo "🔐 Generated Credentials:"
echo "   MongoDB Root User: ${MONGO_ROOT_USERNAME}"
echo "   Application User: ${MONGODB_USER}"
echo "   MongoDB Express User: ${MONGO_EXPRESS_USERNAME}"
echo ""
echo "⚠️  IMPORTANT SECURITY NOTES:"
echo "   - Keep the .env file secure"
echo "   - Never commit .env to version control"
echo "   - Rotate credentials regularly in production"
echo "   - Use HTTPS in production environments"
echo ""
echo "🚀 To start the application:"
echo "   docker-compose down"
echo "   docker-compose up --build"
