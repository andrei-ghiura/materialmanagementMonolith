# CI/CD Pipeline Setup Guide

This guide will help you set up a complete CI/CD pipeline for the Material Management application using GitHub Actions with integrated credential generation and nginx proxy.

## Overview

The pipeline consists of:
- **Testing**: Runs tests for both frontend and backend
- **Building**: Creates Docker images for the application
- **Credential Generation**: Uses the existing `generate-credentials.sh` script for secure credentials
- **Nginx Proxy**: Serves the application through nginx with production optimizations
- **Deployment**: Deploys to your server using Docker Compose

## Key Features

✅ **Automated secure credential generation** using existing scripts  
✅ **Nginx reverse proxy** with rate limiting and security headers  
✅ **Health checks** via nginx proxy endpoints  
✅ **Production-optimized configuration**  
✅ **No manual secret management** required  

## Setup Options

### Option 1: Self-Hosted Runner (Recommended)

This runs the deployment directly on your server machine with automatic credential generation.

#### 1. Install GitHub Self-Hosted Runner

1. Go to your GitHub repository → Settings → Actions → Runners
2. Click "New self-hosted runner"
3. Choose "Linux" and follow the installation instructions
4. Run the runner as a service:
   ```bash
   sudo ./svc.sh install
   sudo ./svc.sh start
   ```

#### 2. No GitHub Secrets Required! 

🎉 **The new pipeline automatically generates secure credentials** using your existing `generate-credentials.sh` script. No manual secret configuration needed!

#### 3. Use the Self-Hosted Runner Workflow

The pipeline will use the workflow in `.github/workflows/deploy.yml`

### Option 2: SSH-Based Deployment

This connects to your server via SSH from GitHub's runners and uses credential generation.

#### 1. Generate SSH Key Pair

On your local machine:
```bash
ssh-keygen -t rsa -b 4096 -f ~/.ssh/github_actions_key
```

#### 2. Add Public Key to Server

Copy the public key to your server:
```bash
ssh-copy-id -i ~/.ssh/github_actions_key.pub username@your-server-ip
```

#### 3. Configure GitHub Secrets (Minimal)

Add only these SSH-related secrets to your repository:

- `HOST`: Your server IP address
- `USERNAME`: Your SSH username
- `SSH_PRIVATE_KEY`: Content of `~/.ssh/github_actions_key` (private key)

#### 4. Update Deployment Path

Edit `.github/workflows/deploy-ssh.yml` and replace `/path/to/your/app/directory` with the actual path to your application on the server.

#### 5. Use the SSH Workflow

Rename or delete `.github/workflows/deploy.yml` and use `.github/workflows/deploy-ssh.yml`

## Server Prerequisites

### 1. Install Required Software

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.21.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install Git (if not already installed)
sudo apt update && sudo apt install -y git curl

# Logout and login again for Docker group changes to take effect
```

### 2. Clone Repository

```bash
git clone https://github.com/yourusername/materialmanagementMonolith.git
cd materialmanagementMonolith
```

### 3. Generate Initial Credentials

```bash
chmod +x ./generate-credentials.sh
./generate-credentials.sh
```

### 4. Test Manual Deployment

```bash
chmod +x ./deploy.sh
./deploy.sh
```

## Application Access Points

After successful deployment, your application will be available at:

- **🌐 Main Application**: `http://localhost/` (Frontend served via nginx)
- **🔧 Backend API**: `http://localhost/api/` (Proxied through nginx)
- **🏥 Health Check**: `http://localhost/api/health` 
- **📊 Database Admin**: `http://localhost/dbadmin/` (MongoDB Express)

## Workflow Features

### Testing Stage
- Installs dependencies for both frontend and backend
- Runs backend tests using Jest
- Builds frontend to check for compilation errors
- Runs ESLint on frontend code

### Deployment Stage
- Only runs on pushes to `main` branch
- **Automatically generates secure credentials** using `generate-credentials.sh`
- Updates MongoDB initialization with new user credentials
- Stops existing containers gracefully
- Builds and starts new containers with nginx proxy
- Performs health check via nginx proxy (`http://localhost/api/health`)
- Verifies all services are running
- Cleans up old Docker images to save space

## Nginx Proxy Features

The production nginx configuration includes:

- **🚀 Performance**: Gzip compression, static file caching
- **🔒 Security**: Security headers, rate limiting, blocked sensitive files
- **🏥 Health Checks**: Dedicated health endpoint without rate limiting
- **📊 Monitoring**: Access to MongoDB Express for database administration
- **🔧 API Routing**: Clean API routing with proper timeouts

## Monitoring and Troubleshooting

### View Application Logs
```bash
docker-compose logs -f
```

### Check Individual Service Logs
```bash
docker-compose logs app
docker-compose logs backend
docker-compose logs mongo
docker-compose logs nginx
```

### Check Service Status
```bash
docker-compose ps
```

### Manual Health Check
```bash
curl http://localhost/api/health
```

### Check Nginx Status
```bash
curl -I http://localhost/
```

## Security Considerations

1. **Automatic Credential Generation**: Secure random passwords generated on each deployment
2. **Nginx Security**: Rate limiting, security headers, blocked sensitive files
3. **Database Security**: MongoDB with authentication and dedicated app user
4. **Container Security**: Containers run with appropriate user permissions
5. **Environment Isolation**: Production environment variables managed automatically

## Credential Management

### Automatic Generation
- Credentials are automatically generated using timestamps and secure random passwords
- MongoDB initialization script is updated with new user credentials
- No manual secret management required

### Manual Credential Rotation
```bash
# Generate new credentials
./generate-credentials.sh

# Redeploy with new credentials
./deploy.sh
```

### Viewing Current Credentials
```bash
# View generated credentials (be careful with this in production)
cat .env
```

## Rollback Procedure

If deployment fails, you can quickly rollback:

```bash
git log --oneline -n 5  # Find the previous commit hash
git checkout <previous-commit-hash>
./deploy.sh
```

## Customization

### Adding More Environments

You can create additional compose files for staging:
- `compose.staging.yaml`
- Update the workflow to deploy to staging on different branches

### Adding Notifications

Add Slack or Discord notifications to the workflow:
```yaml
- name: Notify Slack
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

### Adding Database Migrations

If you need to run database migrations:
```yaml
- name: Run migrations
  run: |
    docker-compose exec -T backend npm run migrate
```
