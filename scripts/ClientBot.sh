#!/data/data/com.termux/files/usr/bin/bash

S7_ROOT="$HOME/.config/SABIR7718/WsServer"
S7_URL="https://sabir7718.is-a.dev/js/WsServer_ENC.js"

S7_RESET="\033[0m"
S7_RED="\033[31m"
S7_GREEN="\033[32m"
S7_YELLOW="\033[33m"
S7_BLUE="\033[34m"
S7_CYAN="\033[36m"
S7_BOLD="\033[1m"

if ! command -v node >/dev/null 2>&1; then
    printf "${S7_YELLOW}[!] Node.js not found${S7_RESET}\n"
    printf "${S7_BLUE}[*] Installing Node.js...${S7_RESET}\n"
    
    pkg update -y
    pkg install nodejs npm git -y

    if ! command -v node >/dev/null 2>&1; then
        printf "${S7_RED}[✗] Node.js installation failed${S7_RESET}\n"
        exit 1
    fi

    printf "${S7_GREEN}[✓] Node.js installed${S7_RESET}\n"
else
    printf "${S7_GREEN}[✓] Node.js detected${S7_RESET}\n"
fi

if ! command -v yarn >/dev/null 2>&1; then
    printf "${S7_YELLOW}[!] Yarn not found${S7_RESET}\n"
    printf "${S7_BLUE}[*] Installing Yarn...${S7_RESET}\n"

    npm install -g yarn

    if ! command -v yarn >/dev/null 2>&1; then
        printf "${S7_RED}[✗] Yarn installation failed${S7_RESET}\n"
        exit 1
    fi

    printf "${S7_GREEN}[✓] Yarn installed${S7_RESET}\n"
else
    printf "${S7_GREEN}[✓] Yarn detected${S7_RESET}\n"
fi

mkdir -p "$S7_ROOT/auth"

cd "$S7_ROOT" || exit 1

if [ ! -d "$S7_ROOT/node_modules" ]; then
    printf "${S7_YELLOW}[!] Dependencies not found${S7_RESET}\n"
    printf "${S7_BLUE}[*] Installing dependencies...${S7_RESET}\n"

    [ -f package.json ] || printf '%s\n' \
'{
  "name": "s7-whatsapp-relay",
  "version": "1.0.0",
  "description": "WhatsApp multi-device relay server and client using Baileys",
  "main": "index.js",
  "scripts": {
    "start": "node index.js"
  },
  "author": "SABIR7718",
  "license": "MIT",
  "dependencies": {
    "@sabir7718/log": "latest",
    "@whiskeysockets/baileys": "7.0.0-rc.9",
    "dotenv": "^16.4.5",
    "node-cache": "^5.1.2",
    "ws": "^8.18.0"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
' \
> package.json

    yarn

    if [ $? -ne 0 ]; then
        printf "${S7_RED}[✗] Dependency installation failed${S7_RESET}\n"
        exit 1
    fi

    printf "${S7_GREEN}[✓] Dependencies installed${S7_RESET}\n"
else
    printf "${S7_GREEN}[✓] Dependencies already installed${S7_RESET}\n"
fi

printf "\n${S7_CYAN}${S7_BOLD}[*] Starting Client Server...${S7_RESET}\n"

curl -fsSL "$S7_URL" | SABIR7718_KEY="$1" node

S7_EXIT_CODE=$?

printf "\n"

if [ "$S7_EXIT_CODE" -eq 0 ]; then
    printf "${S7_GREEN}${S7_BOLD}[✓] WS Server stopped${S7_RESET}\n"
else
    printf "${S7_RED}${S7_BOLD}[✗] WS Server exited with code: $S7_EXIT_CODE${S7_RESET}\n"
fi

yarn install v1.22.22
info No lockfile found.
[1/5] Validating package.json...
[2/5] Resolving packages...
warning @whiskeysockets/baileys@7.0.0-rc.9: This version is affected by a zero-day vulnerability that allows spoofing of messages, please update to
  the latest versions (6.7.22^ or 7.0.0-rc12^)! For more information, check out the public advisory at
  https://github.com/WhiskeySockets/Baileys/security/advisories/GHSA-qvv5-jq5g-4cgg
error Couldn't find the binary git
info Visit https://yarnpkg.com/en/docs/cli/install for documentation about this command.
[✗] Dependency installation failed
~ $