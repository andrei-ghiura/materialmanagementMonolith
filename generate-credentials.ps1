# generate-credentials.ps1
# PowerShell script to generate secure random credentials for the Material Manager application

Write-Host "Generating secure credentials for Material Manager..." -ForegroundColor Green

# Function to generate random password
function Generate-Password {
    $chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
    $password = ""
    for ($i = 0; $i -lt 24; $i++) {
        $password += $chars[(Get-Random -Maximum $chars.Length)]
    }
    return $password
}

# Generate usernames with timestamp
$timestamp = Get-Date -Format "yyyyMM"

# Generate secure credentials
$mongoRootUsername = "admin_user_$timestamp"
$mongoRootPassword = Generate-Password
$mongoDbUser = "app_user_mm_$timestamp"
$mongoDbPassword = Generate-Password
$mongoExpressUsername = "admin_express_$timestamp"
$mongoExpressPassword = Generate-Password

# Create .env file content
$envContent = @"
# MongoDB Configuration
MONGO_ROOT_USERNAME=$mongoRootUsername
MONGO_ROOT_PASSWORD=$mongoRootPassword
MONGO_INITDB_DATABASE=materialmanager_db

# Application Database User
MONGODB_USER=$mongoDbUser
MONGODB_PASSWORD=$mongoDbPassword

# MongoDB Express Configuration
MONGO_EXPRESS_USERNAME=$mongoExpressUsername
MONGO_EXPRESS_PASSWORD=$mongoExpressPassword

# Application Environment
NODE_ENV=production
PORT=3000


# Database Connection
MONGODB_URL=mongodb://$mongoDbUser`:$mongoDbPassword@mongo:27017/materialmanager_db?authSource=materialmanager_db

# Generated on: $(Get-Date)
# Security Note: Keep this file secure and never commit it to version control
"@

# Write .env file
$envContent | Out-File -FilePath ".env" -Encoding UTF8

Write-Host "Secure credentials generated and saved to .env" -ForegroundColor Green
Write-Host "MongoDB Root User: $mongoRootUsername" -ForegroundColor White
Write-Host "Application User: $mongoDbUser" -ForegroundColor White
Write-Host "MongoDB Express User: $mongoExpressUsername" -ForegroundColor White
Write-Host ""
Write-Host "IMPORTANT: Keep the .env file secure and never commit it to version control" -ForegroundColor Red
Write-Host "To start: docker-compose down && docker-compose up --build" -ForegroundColor Cyan
