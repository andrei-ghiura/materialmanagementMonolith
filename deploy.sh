#!/bin/bash

# Material Management Deployment Script
set -e

echo "🚀 Starting deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Generate secure credentials
echo -e "${YELLOW}🔐 Generating secure credentials...${NC}"
chmod +x ./generate-credentials.sh
./generate-credentials.sh

# Check if .env was created
if [ ! -f .env ]; then
    echo -e "${RED}❌ .env file not found after credential generation!${NC}"
    exit 1
fi

# Pull latest changes
echo -e "${YELLOW}📥 Pulling latest changes...${NC}"
git pull origin main

# Stop existing containers
echo -e "${YELLOW}🛑 Stopping existing containers...${NC}"
docker compose down || true

# Build and start services with nginx proxy
echo -e "${YELLOW}🔨 Building and starting services with nginx proxy...${NC}"
docker compose -f compose.yaml -f compose.prod.yaml up -d --build

# Wait for services to be ready
echo -e "${YELLOW}⏳ Waiting for services to start...${NC}"
sleep 45

# Health check via nginx proxy
echo -e "${YELLOW}🏥 Performing health check via nginx proxy...${NC}"
if curl -f http://localhost/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Application is healthy and running behind nginx!${NC}"
else
    echo -e "${RED}❌ Health check failed!${NC}"
    echo -e "${YELLOW}📋 Container logs:${NC}"
    docker compose logs --tail=50
    exit 1
fi

# Verify all services
echo -e "${YELLOW}🔍 Verifying service status...${NC}"
docker compose ps

# Clean up old images
echo -e "${YELLOW}🧹 Cleaning up old Docker images...${NC}"
docker image prune -f

echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
echo -e "${GREEN}🌐 Application URL: http://localhost/${NC}"
echo -e "${GREEN}🔧 Backend API: http://localhost/api/${NC}"
echo -e "${GREEN}📊 MongoDB Express: http://localhost/dbadmin/${NC}"
echo ""
echo -e "${YELLOW}🔐 Credentials have been generated and saved to .env${NC}"
echo -e "${YELLOW}⚠️  Remember to keep the .env file secure!${NC}"
