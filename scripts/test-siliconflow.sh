#!/bin/bash

# Configuration
PORT=3000
TOKEN="123456"

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "=========================================="
echo "   One API SiliconFlow Integration Test   "
echo "=========================================="

# 1. Check Service Status
echo -e "\n[1/4] Checking One API status at http://localhost:$PORT..."
if curl -s -I "http://localhost:$PORT/api/status" > /dev/null; then
    echo -e "${GREEN}Service is running!${NC}"
else
    echo -e "${RED}Service not reachable at port $PORT.${NC}"
    echo "Please ensure One API is running."
    exit 1
fi

# 2. Get User Input
echo -e "\n[2/4] Configuration"
echo "Please enter your SiliconFlow API Key (sk-...):"
read -r KEY

if [ -z "$KEY" ]; then
    echo -e "${RED}Error: API Key cannot be empty.${NC}"
    exit 1
fi

# 3. Add Channel
echo -e "\n[3/4] Adding SiliconFlow Channel..."
CHANNEL_RESPONSE=$(curl -s -X POST "http://localhost:$PORT/api/channel" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "硅基流动 (SiliconFlow)",
    "type": 1,
    "key": "'"$KEY"'",
    "base_url": "https://api.siliconflow.cn",
    "models": "deepseek-ai/DeepSeek-V3",
    "groups": ["default"]
  }')

echo "Response: $CHANNEL_RESPONSE"

if [[ $CHANNEL_RESPONSE == *"success\":true"* ]]; then
    echo -e "${GREEN}Channel added successfully!${NC}"
else
    echo -e "${RED}Failed to add channel.${NC}"
    # Continue anyway to try testing if it already exists?
    # No, usually we stop here, but let's try test anyway in case user added it before.
fi

# 4. Test Chat Completion
echo -e "\n[4/4] Testing Chat Completion (DeepSeek-V3)..."
echo "Sending '你好' to model..."

CHAT_RESPONSE=$(curl -s -X POST "http://localhost:$PORT/v1/chat/completions" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "deepseek-ai/DeepSeek-V3",
    "messages": [{"role": "user", "content": "你好"}],
    "stream": false
  }')

echo -e "\nResponse:"
echo "$CHAT_RESPONSE"

if [[ $CHAT_RESPONSE == *"choices"* ]]; then
    echo -e "\n${GREEN}Test Successful! Integration Verified.${NC}"
else
    echo -e "\n${RED}Test Failed.${NC}"
fi
