# test-setup.ps1
# Script to test the Material Manager application setup

Write-Host "Testing Material Manager Setup..." -ForegroundColor Green
Write-Host ""

# Check if Docker is running
try {
    docker version | Out-Null
    Write-Host "✅ Docker is running" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker is not running or not installed" -ForegroundColor Red
    exit 1
}

# Check if .env file exists
if (Test-Path ".env") {
    Write-Host "✅ .env file exists" -ForegroundColor Green
} else {
    Write-Host "❌ .env file not found. Run .\generate-credentials.ps1 first" -ForegroundColor Red
    exit 1
}

# Check if compose.yaml exists
if (Test-Path "compose.yaml") {
    Write-Host "✅ compose.yaml exists" -ForegroundColor Green
} else {
    Write-Host "❌ compose.yaml not found" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🚀 Starting application with Docker Compose..." -ForegroundColor Cyan

# Start the application
docker-compose up -d --build

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Application started successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🌐 Access Points:" -ForegroundColor Yellow
    Write-Host "   Frontend UI: http://localhost:3001" -ForegroundColor White
    Write-Host "   Backend API: http://localhost:3000" -ForegroundColor White
    Write-Host "   API Docs: http://localhost:3000/api-docs" -ForegroundColor White
    Write-Host "   MongoDB Express: http://localhost:8081" -ForegroundColor White
    Write-Host ""
    Write-Host "📊 To view logs: docker-compose logs -f" -ForegroundColor Cyan
    Write-Host "🛑 To stop: docker-compose down" -ForegroundColor Cyan
} else {
    Write-Host "❌ Failed to start application" -ForegroundColor Red
    Write-Host "📋 Check logs with: docker-compose logs" -ForegroundColor Yellow
}
