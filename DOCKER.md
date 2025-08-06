# Material Manager - Docker Setup

This project includes Docker configuration for easy deployment and development.

## Quick Start

### Production Deployment

Run the entire application stack:

```bash
docker-compose up -d
```

This will start:
- **Frontend (Ionic/React)**: http://localhost:3001
- **Backend (Express API)**: http://localhost:3000
- **MongoDB**: localhost:27017
- **MongoDB Express**: http://localhost:8081

### Development Mode

For development with hot reloading:

```bash
docker-compose -f compose.dev.yaml up
```

This provides:
- Hot reloading for both frontend and backend
- Volume mounts for live code changes
- Development-optimized containers

## Services Overview

### Frontend (app)
- **Technology**: React/Ionic with Vite
- **Production Port**: 3001 (nginx)
- **Development Port**: 5173 (vite dev server)
- **Features**: 
  - Multi-stage Docker build
  - Nginx with SPA routing
  - API proxy configuration

### Backend (backend)
- **Technology**: Node.js/Express
- **Port**: 3000
- **Features**:
  - Health check endpoint (/health)
  - Non-root user for security
  - Environment-based configuration

### Database (mongo)
- **Technology**: MongoDB
- **Port**: 27017
- **Features**:
  - Persistent data volume
  - Admin user configuration
  - Initialization scripts

### Database Admin (mongo-express)
- **Port**: 8081
- **Credentials**: No authentication required
- **Purpose**: MongoDB web interface

## Environment Variables

### Backend
- `NODE_ENV`: production/development
- `MONGODB_URL`: MongoDB connection string
- `MONGODB_USER`: Database username
- `MONGODB_PASSWORD`: Database password

### Frontend
- `NODE_ENV`: production/development

## Docker Commands

### Build specific services
```bash
# Build only the app
docker-compose build app

# Build only the backend
docker-compose build backend
```

### View logs
```bash
# All services
docker-compose logs

# Specific service
docker-compose logs backend
```

### Stop services
```bash
# Stop all
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

### Access containers
```bash
# Backend shell
docker-compose exec backend sh

# App shell
docker-compose exec app sh
```

## Health Checks

The backend includes a health check endpoint:
- **URL**: http://localhost:3000/health
- **Response**: JSON with status, timestamp, and database connection

## Development Tips

1. **Code Changes**: In development mode, changes to source code will automatically trigger rebuilds
2. **Database Data**: Use `docker-compose down -v` to reset database data
3. **Logs**: Use `docker-compose logs -f [service]` to follow logs in real-time
4. **Debugging**: Services are accessible on localhost with their respective ports

## Troubleshooting

### Common Issues

1. **Port Conflicts**: If ports are in use, modify the port mappings in compose.yaml
2. **Database Connection**: Ensure MongoDB is running before starting backend
3. **Build Failures**: Clear Docker cache with `docker system prune`

### Reset Everything
```bash
docker-compose down -v
docker system prune -f
docker-compose up --build
```
