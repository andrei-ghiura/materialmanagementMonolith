# PowerShell script to clean up old .env files
# Run this script from the project root

$ErrorActionPreference = 'Stop'

function Remove-EnvFiles($path) {
    $files = @(".env", ".env.local")
    foreach ($file in $files) {
        $full = Join-Path $path $file
        if (Test-Path $full) {
            Remove-Item $full -Force
            Write-Host "Removed $full"
        }
    }
}

Remove-EnvFiles "app"
Remove-EnvFiles "backend"

Write-Host "Old .env files cleaned up."
