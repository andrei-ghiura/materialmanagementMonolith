#!/bin/bash
# Bash script to clean up old .env files for all services
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

echo "Old .env files cleaned up."
