#!/bin/bash
# Bash script to enforce use of central .env for all services
# Run this script from the project root

set -e

function remove_env_files() {
    local path=$1
    local files=(".env" ".env.local")
    
    for file in "${files[@]}"; do
        local full="$path/$file"
        if [[ -f "$full" || -L "$full" ]]; then
            rm -f "$full"
            echo "Removed $full"
        fi
    done
}

remove_env_files "app"
remove_env_files "backend"
remove_env_files "db"

# Create symlinks to central .env
function create_symlink() {
    local target=$1
    local link=$2
    
    if [[ ! -e "$link" && ! -L "$link" ]]; then
        ln -s "$target" "$link"
        echo "Created symlink: $link -> $target"
    else
        echo "Symlink or file already exists: $link"
    fi
}

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
central_env="$SCRIPT_DIR/.env"
app_env="$SCRIPT_DIR/app/.env"
backend_env="$SCRIPT_DIR/backend/.env"
db_env="$SCRIPT_DIR/db/.env"

create_symlink "$central_env" "$app_env"
create_symlink "$central_env" "$backend_env"
create_symlink "$central_env" "$db_env"

echo "Central .env symlinks set up for app and backend."
