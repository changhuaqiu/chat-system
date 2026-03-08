#!/bin/bash
set -e

# Directory for One API
ONE_API_DIR="./one-api"
mkdir -p "$ONE_API_DIR"

# Check OS and Arch
OS="$(uname -s)"
ARCH="$(uname -m)"

if [ "$OS" = "Darwin" ]; then
    if [ "$ARCH" = "arm64" ]; then
        ASSET_NAME="one-api-darwin-arm64"
    else
        ASSET_NAME="one-api-darwin-amd64"
    fi
elif [ "$OS" = "Linux" ]; then
     if [ "$ARCH" = "aarch64" ]; then
        ASSET_NAME="one-api-linux-arm64"
    else
        ASSET_NAME="one-api-linux-amd64"
    fi
else
    echo "Unsupported OS: $OS"
    exit 1
fi

VERSION="v0.6.9" # Fallback version
DOWNLOAD_URL="https://github.com/songquanpeng/one-api/releases/download/$VERSION/$ASSET_NAME"

echo "Detected OS: $OS, Arch: $ARCH"
echo "Target Asset: $ASSET_NAME"
echo "Download URL: $DOWNLOAD_URL"

if [ -f "$ONE_API_DIR/one-api" ]; then
    echo "One API binary already exists."
else
    echo "Downloading One API..."
    # Try curl
    if command -v curl >/dev/null 2>&1; then
        curl -L -o "$ONE_API_DIR/one-api" "$DOWNLOAD_URL"
    elif command -v wget >/dev/null 2>&1; then
        wget -O "$ONE_API_DIR/one-api" "$DOWNLOAD_URL"
    else
        echo "Error: curl or wget not found."
        exit 1
    fi
    chmod +x "$ONE_API_DIR/one-api"
    echo "Download complete."
fi

echo "One API setup finished. You can run it with ./scripts/start-all.sh"
