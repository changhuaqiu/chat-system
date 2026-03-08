#!/bin/bash
set -e

# Directory for One API
ONE_API_DIR="./one-api"

# Check if docker is available and running
USE_DOCKER=false
if command -v docker >/dev/null 2>&1; then
    if docker info >/dev/null 2>&1; then
        USE_DOCKER=true
    else
        echo "Docker is installed but not running (or socket error). Falling back to local binary."
    fi
fi

if [ "$USE_DOCKER" = "true" ]; then
    echo "Using Docker Compose..."
    if command -v docker-compose >/dev/null 2>&1; then
        docker-compose up -d
    else
        docker compose up -d
    fi
else
    if [ -f "$ONE_API_DIR/one-api" ]; then
        echo "Starting One API (local binary)..."
        cd "$ONE_API_DIR"
        ./one-api --port 3002 --log-dir ./logs &
        ONE_API_PID=$!
        cd ..
        
        echo "One API started at http://localhost:3002 (PID: $ONE_API_PID)"
        echo "Please run Backend and Frontend separately (npm run dev)."
        
        # Wait for Ctrl+C
        trap "kill $ONE_API_PID; exit" INT
        wait
    else
        echo "Error: Neither docker-compose nor One API binary found."
        echo "Please run ./scripts/setup-one-api.sh first to download One API binary."
        exit 1
    fi
fi
