# PowerShell script to enforce use of central .env for all services
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

# Create symlinks to central .env
function Create-Symlink($target, $link) {
    if (-not (Test-Path $link)) {
        New-Item -ItemType SymbolicLink -Path $link -Target $target | Out-Null
        Write-Host "Created symlink: $link -> $target"
    } else {
        Write-Host "Symlink or file already exists: $link"
    }
}

$centralEnv = Join-Path $PSScriptRoot ".env"
$appEnv = Join-Path $PSScriptRoot "app\.env"
$backendEnv = Join-Path $PSScriptRoot "backend\.env"
$dbEnv = Join-Path $PSScriptRoot "db\.env"

Create-Symlink $centralEnv $appEnv
Create-Symlink $centralEnv $backendEnv
Create-Symlink $centralEnv $dbEnv

Write-Host "Central .env symlinks set up for app and backend."
