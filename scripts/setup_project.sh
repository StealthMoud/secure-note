#!/bin/bash

# setup_project.sh
# automates the setup for SecureNote
# 1. installs dependencies
# 2. copies .env files
# 3. generates secrets (jwt, rsa, mongo creds) and injects them

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}starting project setup...${NC}"

# 1. install dependencies
echo -e "${BLUE}installing npm dependencies...${NC}"
npm install

# 2. setup env files
echo -e "${BLUE}configuring environment variables...${NC}"

# helper function to generate random string
generate_secret() {
    openssl rand -base64 32 | tr -d '/+=' | cut -c1-32
}

# generate secrets
JWT_SECRET=$(generate_secret)
MONGO_USER="admin_$(openssl rand -hex 4)"
MONGO_PASSWORD=$(generate_secret)

# generate rsa keys using node (utilizing existing crypto module)
echo -e "${BLUE}generating rsa keys...${NC}"
RSA_KEYS=$(node -e "
const crypto = require('crypto');
const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
});
console.log(privateKey.replace(/\n/g, '\\\\n'));
console.log('---SPLIT---');
console.log(publicKey.replace(/\n/g, '\\\\n'));
")

# split keys
RSA_PRIVATE_KEY=$(echo "$RSA_KEYS" | awk -F'---SPLIT---' '{print $1}' | tr -d '\n')
RSA_PUBLIC_KEY=$(echo "$RSA_KEYS" | awk -F'---SPLIT---' '{print $2}' | tr -d '\n')

# function to update common env vars
update_env_file() {
    local file=$1
    if [ -f "$file" ]; then
        echo "updating $file..."
        # replace jwt secret
        sed -i '' "s|JWT_SECRET=your_jwt_secret_here|JWT_SECRET=$JWT_SECRET|g" "$file"
        
        # replace rsa keys (using | as delimiter to avoid conflict with / in base64, though we escaped newlines)
        # we need to be careful with escaping for sed.
        # simple approach: use awk or just careful sed.
        # since we replaced newlines with \\n, it should be a single line string safe for sed?
        # warning: & in replacement string means matched string in sed. escape &?
        
        ESCAPED_PRIV=$(echo "$RSA_PRIVATE_KEY" | sed 's/&/\\&/g')
        ESCAPED_PUB=$(echo "$RSA_PUBLIC_KEY" | sed 's/&/\\&/g')
        
        sed -i '' "s|RSA_PRIVATE_KEY=your_rsa_private_key_here|RSA_PRIVATE_KEY=$ESCAPED_PRIV|g" "$file"
        sed -i '' "s|RSA_PUBLIC_KEY=your_rsa_public_key_here|RSA_PUBLIC_KEY=$ESCAPED_PUB|g" "$file"
        
        # replace mongo credentials
        sed -i '' "s|<MONGO_USER>|$MONGO_USER|g" "$file"
        sed -i '' "s|<MONGO_PASSWORD>|$MONGO_PASSWORD|g" "$file"
        
        sed -i '' "s|MONGO_USER=your_mongo_username_here|MONGO_USER=$MONGO_USER|g" "$file"
        sed -i '' "s|MONGO_PASSWORD=your_mongo_password_here|MONGO_PASSWORD=$MONGO_PASSWORD|g" "$file"
    else
        echo "warning: $file not found"
    fi
}

# copy and update root env (for docker and local backend)
if [ ! -f ".env" ]; then
    cp .env.example .env
fi
update_env_file ".env"

# copy frontend env
if [ ! -f "frontend/.env.local" ]; then
    echo "creating frontend/.env.local..."
    cp frontend/.env.local.example frontend/.env.local
fi

echo -e "${GREEN}setup complete!${NC}"
echo -e "${BLUE}to run the project in docker:${NC}"
echo -e "docker compose up --build"
