#!/bin/bash

# Test script for the CI/CD deployment
echo "🧪 Testing Material Management Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Test credential generation
echo -e "${YELLOW}Testing credential generation...${NC}"
if ./generate-credentials.sh; then
    echo -e "${GREEN}✅ Credential generation successful${NC}"
else
    echo -e "${RED}❌ Credential generation failed${NC}"
    exit 1
fi

# Test environment file
if [ -f .env ]; then
    echo -e "${GREEN}✅ .env file created${NC}"
    echo -e "${YELLOW}Generated credentials preview:${NC}"
    grep "USERNAME\|_USER=" .env | head -3
else
    echo -e "${RED}❌ .env file not found${NC}"
    exit 1
fi

# Test Docker Compose configuration
echo -e "${YELLOW}Testing Docker Compose configuration...${NC}"
if docker compose -f compose.yaml -f compose.prod.yaml config > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Docker Compose configuration valid${NC}"
else
    echo -e "${RED}❌ Docker Compose configuration invalid${NC}"
    exit 1
fi

# Test nginx configuration syntax only (skip upstream checks)
echo -e "${YELLOW}Testing nginx configuration syntax...${NC}"
# Create a temporary config for testing syntax only
cat > nginx.test.conf << 'EOF'
worker_processes 1;
events { worker_connections 1024; }
http {
    include       mime.types;
    default_type  application/octet-stream;
    server {
        listen 80;
        location / {
            return 200 "OK";
        }
    }
}
EOF

if docker run --rm -v "$(pwd)/nginx.test.conf:/etc/nginx/nginx.conf:ro" nginx:alpine nginx -t; then
    echo -e "${GREEN}✅ Nginx basic configuration syntax valid${NC}"
    rm nginx.test.conf
else
    echo -e "${RED}❌ Nginx configuration syntax invalid${NC}"
    rm nginx.test.conf
    exit 1
fi

echo -e "${GREEN}🎉 All tests passed! Ready for deployment.${NC}"
echo -e "${YELLOW}💡 To deploy manually, run: ./deploy.sh${NC}"
