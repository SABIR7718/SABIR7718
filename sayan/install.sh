#!/bin/bash

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
CYAN='\033[0;36m'; BOLD='\033[1m'; RESET='\033[0m'
BLUE='\033[0;34m'; MAGENTA='\033[0;35m'

info()    { echo -e "${CYAN}[INFO]${RESET}  $1"; }
success() { echo -e "${GREEN}[OK]${RESET}    $1"; }
error()   { echo -e "${RED}[FAIL]${RESET} $1"; exit 1; }
warn()    { echo -e "${YELLOW}[!]${RESET}    $1"; }
ask()     { echo -ne "${YELLOW}[?]${RESET}    $1 "; }
section() { echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}\n    ${BOLD}$1${RESET}\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"; }

clear
echo -e "${CYAN}"
echo " ███████╗ █████╗ ██╗   ██╗██████╗  █████╗ ███╗   ██╗███████╗██╗     "
echo " ██╔════╝██╔══██╗╚██╗ ██╔╝██╔══██╗██╔══██╗████╗  ██║██╔════╝██║     "
echo " ███████╗███████║ ╚████╔╝ ██████╔╝███████║██╔██╗ ██║█████╗  ██║     "
echo " ╚════██║██╔══██║  ╚██╔╝  ██╔═══╝ ██╔══██║██║╚██╗██║██╔══╝  ██║     "
echo " ███████║██║  ██║   ██║   ██║     ██║  ██║██║ ╚████║███████╗███████╗"
echo " ╚══════╝╚═╝  ╚═╝   ╚═╝   ╚═╝     ╚═╝  ╚═╝╚═╝  ╚═══╝╚══════╝╚══════╝"
echo -e "${RESET}"
echo -e "  ${BOLD}Self-hosted Server Panel v3.0 PREMIUM — by dark_x_sayan${RESET}"
echo -e "  ${CYAN}Multi-Role: Super Admin • Sub-Admin • User${RESET}"
echo ""

[ "$EUID" -ne 0 ] && error "Root required! Run: sudo bash install.sh"

DIR="/opt/saypanel/agent"
WEB_DIR="/opt/saypanel/web"
BACKUP_DIR="/opt/saypanel/backups"
CFG_FILE="$DIR/config.json"
USERS_FILE="$DIR/users.json"
mkdir -p "$DIR/logs" /opt/saypanel/servers "$WEB_DIR" "$BACKUP_DIR"

section "Step 1: System Install"

info "Updating system..."
apt-get update -qq > /dev/null 2>&1

info "Installing Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash - > /dev/null 2>&1
apt-get install -y nodejs > /dev/null 2>&1
success "Node.js $(node -v) ready"

info "Installing PM2..."
npm i -g pm2 > /dev/null 2>&1
success "PM2 ready"

info "Installing Caddy..."
apt-get install -y debian-keyring debian-archive-keyring apt-transport-https curl > /dev/null 2>&1
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg 2>/dev/null
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list > /dev/null
apt-get update -qq > /dev/null 2>&1
apt-get install -y caddy > /dev/null 2>&1
success "Caddy ready"

info "Installing rclone..."
curl -s https://rclone.org/install.sh | bash > /dev/null 2>&1
success "rclone ready"

section "Step 2: Super Admin Setup"

echo ""
echo -e "  ${BOLD}Super Admin Account${RESET}"
echo -e "  ${CYAN}(Full access — sab kuch dekh aur control kar sakta hai)${RESET}"
echo ""

ask "Super Admin email:"
read -r SA_EMAIL
[ -z "$SA_EMAIL" ] && SA_EMAIL="admin@saypanel.local"

ask "Super Admin password:"
read -rs SA_PASS; echo ""
[ -z "$SA_PASS" ] && SA_PASS="SayPanel@2024"

ask "Super Admin username:"
read -r SA_USER
[ -z "$SA_USER" ] && SA_USER="SuperAdmin"

echo ""
echo -e "  ${BOLD}Secret Key & Ports${RESET}"
echo ""

ask "Secret key (default: sabana):"
read -r SECRET; SECRET=${SECRET:-sabana}

ask "Web panel port (default: 3000):"
read -r WP; WP=${WP:-3000}

echo ""
echo -e "  ${BOLD}Domain Setup${RESET}"
echo ""
echo -e "  ${YELLOW}[1]${RESET} Apna domain (SSL automatic)"
echo -e "  ${YELLOW}[2]${RESET} IP:Port (no SSL)"
echo ""

ask "Domain use karna hai? (y/n):"
read -r USE_DOMAIN

DOMAIN=""
USE_SSL="false"

if [[ "$USE_DOMAIN" =~ ^[Yy]$ ]]; then
  ask "Domain/subdomain (e.g. panel.mysite.com):"
  read -r DOMAIN
  if [ -n "$DOMAIN" ]; then
    USE_SSL="true"
    warn "DNS → VPS IP point karo! Caddy SSL auto-issue karega."
  fi
fi

echo ""
echo -e "  ${BOLD}Supabase (Cloud Sync)${RESET}"
echo ""

ask "Supabase URL (Enter to skip):"
read -r SUPA_URL; SUPA_URL=${SUPA_URL:-}

SUPA_KEY=""
if [ -n "$SUPA_URL" ]; then
  ask "Supabase Anon Key:"
  read -r SUPA_KEY
fi

section "Step 3: Backup Setup"

ask "Backup setup karna chahte ho? (y/n):"
read -r DO_BACKUP

BACKUP_TYPE="none"
BACKUP_REMOTE=""
TG_TOKEN=""
TG_CHAT=""
BACKUP_INTERVAL=6

if [[ "$DO_BACKUP" =~ ^[Yy]$ ]]; then
  echo ""
  echo -e "  ${YELLOW}[1]${RESET} Google Drive"
  echo -e "  ${YELLOW}[2]${RESET} Telegram"
  echo -e "  ${YELLOW}[3]${RESET} Local only"
  echo ""
  ask "Option [1/2/3]:"
  read -r BACKUP_CHOICE

  case "$BACKUP_CHOICE" in
    1)
      BACKUP_TYPE="gdrive"
      ask "rclone config chalein? (y/n):"
      read -r RUN_RCLONE
      [[ "$RUN_RCLONE" =~ ^[Yy]$ ]] && rclone config
      BACKUP_REMOTE="saypanel-gdrive:SayPanel-Backups"
      success "Google Drive configured"
      ;;
    2)
      BACKUP_TYPE="telegram"
      ask "Telegram Bot Token:"
      read -r TG_TOKEN
      ask "Telegram Chat ID:"
      read -r TG_CHAT
      success "Telegram configured"
      ;;
    3)
      BACKUP_TYPE="local"
      success "Local backup configured"
      ;;
  esac

  ask "Auto backup interval (hours, default: 6):"
  read -r BACKUP_INTERVAL; BACKUP_INTERVAL=${BACKUP_INTERVAL:-6}
fi

section "Step 4: Writing Files"

info "Writing config..."
cat > "$CFG_FILE" << CFGEOF
{
  "secret":           "$SECRET",
  "web_port":         $WP,
  "agent_port":       4521,
  "supabase_url":     "$SUPA_URL",
  "supabase_key":     "$SUPA_KEY",
  "domain":           "$DOMAIN",
  "use_ssl":          $USE_SSL,
  "backup_type":      "$BACKUP_TYPE",
  "backup_remote":    "$BACKUP_REMOTE",
  "backup_interval":  $BACKUP_INTERVAL,
  "tg_token":         "${TG_TOKEN:-}",
  "tg_chat":          "${TG_CHAT:-}"
}
CFGEOF
success "Config written"

info "Writing users database..."
SA_PASS_HASH=$(node -e "const crypto=require('crypto'); console.log(crypto.createHash('sha256').update('$SA_PASS').digest('hex'));")
SA_ID=$(node -e "const crypto=require('crypto'); console.log(crypto.randomBytes(8).toString('hex'));")

cat > "$USERS_FILE" << USERSEOF
[
  {
    "id": "$SA_ID",
    "email": "$SA_EMAIL",
    "password": "$SA_PASS_HASH",
    "username": "$SA_USER",
    "role": "superadmin",
    "assigned_servers": [],
    "created_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
  }
]
USERSEOF
success "Users database written"

info "Writing agent (index.js)..."
cat > "$DIR/index.js" << 'INDEXEOF'
const { exec }   = require('child_process');
const fs         = require('fs');
const path       = require('path');
const http       = require('http');
const crypto     = require('crypto');

const CFG_FILE     = path.join(__dirname, 'config.json');
const USERS_FILE   = path.join(__dirname, 'users.json');
const SERVERS_FILE = path.join(__dirname, 'servers.json');
const LOGS_DIR     = path.join(__dirname, 'logs');

if (!fs.existsSync(LOGS_DIR)) fs.mkdirSync(LOGS_DIR, { recursive: true });

function loadConfig()  { return JSON.parse(fs.readFileSync(CFG_FILE, 'utf8')); }
function loadUsers()   { return fs.existsSync(USERS_FILE)   ? JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'))   : []; }
function saveUsers(d)  { fs.writeFileSync(USERS_FILE, JSON.stringify(d, null, 2)); }
function loadServers() { return fs.existsSync(SERVERS_FILE) ? JSON.parse(fs.readFileSync(SERVERS_FILE, 'utf8')) : []; }
function saveServers(d){ fs.writeFileSync(SERVERS_FILE, JSON.stringify(d, null, 2)); }

const config   = loadConfig();
const SECRET   = config.secret    || 'sabana';
const WEB_PORT = config.web_port  || 3000;
const SUPA_URL = config.supabase_url;
const SUPA_KEY = config.supabase_key;

const sessions = new Map();
const processes = {};

function genToken() { return crypto.randomBytes(32).toString('hex'); }
function hashPass(p){ return crypto.createHash('sha256').update(p).digest('hex'); }

function log(level, tag, msg) {
  process.stdout.write(`[${new Date().toISOString()}] [${level.toUpperCase()}] [${tag}] ${msg}\n`);
}

function getSessionUser(req) {
  const ah = req.headers['authorization'] || '';
  const token = ah.startsWith('Bearer ') ? ah.slice(7) : null;
  if (!token) return null;
  if (token === SECRET) return { role: 'superadmin', id: '__secret__', username: 'Admin' };
  if (sessions.has(token)) {
    const s = sessions.get(token);
    if (Date.now() < s.exp) return s.user;
    sessions.delete(token);
  }
  return null;
}

function canAccessServer(user, serverId) {
  if (user.role === 'superadmin') return true;
  if (user.role === 'subadmin') {
    return user.assigned_servers.includes(serverId) || user.assigned_servers.length === 0;
  }
  if (user.role === 'user') {
    return user.assigned_servers.includes(serverId);
  }
  return false;
}

function getVisibleServers(user) {
  const all = loadServers();
  if (user.role === 'superadmin') return all;
  return all.filter(s => user.assigned_servers.includes(s.id));
}

function getLogs(id, lines) {
  const f = path.join(LOGS_DIR, `${id}.log`);
  if (!fs.existsSync(f)) return '(no logs yet)';
  const content = fs.readFileSync(f, 'utf8');
  const arr = content.split('\n');
  return arr.slice(-lines).join('\n');
}

function appendLog(id, text) {
  const f = path.join(LOGS_DIR, `${id}.log`);
  fs.appendFileSync(f, text);
}

async function supaFetch(endpoint, opts = {}) {
  if (!SUPA_URL || !SUPA_KEY) return null;
  const r = await fetch(SUPA_URL + endpoint, {
    ...opts,
    headers: {
      'apikey': SUPA_KEY,
      'Authorization': `Bearer ${SUPA_KEY}`,
      'Content-Type': 'application/json',
      ...(opts.headers || {})
    }
  });
  return r;
}

function sysInfo(cb) {
  exec("free -m | awk '/^Mem:/{print $2,$3}'", (e1, mem) => {
    exec("df -h / | awk 'NR==2{print $2,$3,$5}'", (e2, disk) => {
      exec("uptime -p", (e3, up) => {
        exec("nproc", (e4, cpus) => {
          const [total, used] = (mem || '0 0').trim().split(' ');
          const [dTotal, dUsed, dPct] = (disk || '0 0 0%').trim().split(' ');
          cb({
            memory: { total: parseInt(total) || 0, used: parseInt(used) || 0 },
            disk:   { total: dTotal || '?', used: dUsed || '?', percent: parseInt(dPct) || 0 },
            uptime: (up || '').trim(),
            cpus:   parseInt(cpus) || 1
          });
        });
      });
    });
  });
}

function startServer(srv) {
  if (processes[srv.id]) return;
  const opts = { cwd: srv.directory || '/opt/saypanel/servers', env: { ...process.env, ...(srv.env || {}) } };
  const child = require('child_process').spawn('bash', ['-c', srv.startup], { ...opts, stdio: ['ignore','pipe','pipe'] });
  processes[srv.id] = child;
  const ts = () => new Date().toISOString();
  child.stdout.on('data', d => appendLog(srv.id, `[${ts()}] ${d}`));
  child.stderr.on('data', d => appendLog(srv.id, `[${ts()}] [ERR] ${d}`));
  child.on('exit', (code) => {
    appendLog(srv.id, `[${ts()}] [EXIT] code=${code}\n`);
    delete processes[srv.id];
    const servers = loadServers();
    const idx = servers.findIndex(s => s.id === srv.id);
    if (idx !== -1) { servers[idx].status = 'stopped'; saveServers(servers); }
    log('info', 'PROC', `${srv.name} exited code=${code}`);
  });
  const servers = loadServers();
  const idx = servers.findIndex(s => s.id === srv.id);
  if (idx !== -1) { servers[idx].status = 'running'; servers[idx].pid = child.pid; saveServers(servers); }
  log('info', 'PROC', `Started: ${srv.name} pid=${child.pid}`);
}

function stopServer(id) {
  const child = processes[id];
  if (!child) return false;
  child.kill('SIGTERM');
  setTimeout(() => { if (processes[id]) { processes[id].kill('SIGKILL'); } }, 5000);
  delete processes[id];
  const servers = loadServers();
  const idx = servers.findIndex(s => s.id === id);
  if (idx !== -1) { servers[idx].status = 'stopped'; delete servers[idx].pid; saveServers(servers); }
  return true;
}

function runBackup(cb) {
  const cfg = loadConfig();
  const ts  = new Date().toISOString().replace(/[:.]/g, '-');
  const tar = `/opt/saypanel/backups/saypanel-backup-${ts}.tar.gz`;
  exec(`tar -czf ${tar} -C /opt/saypanel agent/config.json agent/users.json agent/servers.json 2>/dev/null`, (err) => {
    if (err) { if (cb) cb(err.message); return; }
    if (cfg.backup_type === 'gdrive' && cfg.backup_remote) {
      exec(`rclone copy ${tar} "${cfg.backup_remote}/"`, (e2) => {
        if (cb) cb(e2 ? 'Upload failed' : null, e2 ? null : `GDrive: ${tar}`);
      });
    } else if (cfg.backup_type === 'telegram' && cfg.tg_token && cfg.tg_chat) {
      exec(`curl -s -F "chat_id=${cfg.tg_chat}" -F "document=@${tar}" -F "caption=SayPanel Backup ${ts}" "https://api.telegram.org/bot${cfg.tg_token}/sendDocument"`, (e2) => {
        if (cb) cb(e2 ? 'Telegram failed' : null, e2 ? null : 'Sent to Telegram');
      });
    } else {
      if (cb) cb(null, `Local: ${tar}`);
    }
  });
}

const server = http.createServer((req, res) => {
  const url      = new URL(req.url, `http://localhost`);
  const pathname = url.pathname;

  const send = (code, data) => {
    res.writeHead(code, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Authorization,Content-Type', 'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS' });
    res.end(JSON.stringify(data));
  };

  if (req.method === 'OPTIONS') { send(204, {}); return; }

  if (pathname === '/' || pathname === '/index.html') {
    const htmlPath = path.join(__dirname, '..', 'web', 'index.html');
    if (fs.existsSync(htmlPath)) {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(fs.readFileSync(htmlPath));
    } else {
      res.writeHead(404); res.end('Panel not found');
    }
    return;
  }

  if (!pathname.startsWith('/api/')) { res.writeHead(404); res.end('Not found'); return; }

  if (pathname === '/api/auth/login' && req.method === 'POST') {
    let body = '';
    req.on('data', d => body += d);
    req.on('end', () => {
      try {
        const { email, password } = JSON.parse(body);
        const users = loadUsers();
        const user  = users.find(u => u.email === email && u.password === hashPass(password));
        if (!user) { send(401, { error: 'Wrong email or password' }); return; }
        const token = genToken();
        sessions.set(token, { user, exp: Date.now() + 86400000 });
        send(200, { ok: true, token, username: user.username, role: user.role, id: user.id });
        log('info', 'AUTH', `Login: ${email} role=${user.role}`);
      } catch(e) { send(400, { error: 'Bad request' }); }
    });
    return;
  }

  const sessionUser = getSessionUser(req);
  if (!sessionUser) { send(401, { error: 'Unauthorized' }); return; }

  if (pathname === '/api/ping' && req.method === 'GET') {
    send(200, { ok: true, uptime: process.uptime(), user: sessionUser.username, role: sessionUser.role, version: '3.0.0' });
    return;
  }

  if (pathname === '/api/system' && req.method === 'GET') {
    sysInfo(info => send(200, info));
    return;
  }

  if (pathname === '/api/servers' && req.method === 'GET') {
    send(200, getVisibleServers(sessionUser));
    return;
  }

  if (pathname === '/api/servers' && req.method === 'POST') {
    if (sessionUser.role !== 'superadmin') { send(403, { error: 'Permission denied' }); return; }
    let body = '';
    req.on('data', d => body += d);
    req.on('end', () => {
      try {
        const { name, directory, startup, env, autostart, assigned_to } = JSON.parse(body);
        if (!name || !startup) { send(400, { error: 'name and startup required' }); return; }
        const id = crypto.randomBytes(8).toString('hex');
        const srv = { id, name, directory: directory || `/opt/saypanel/servers/${id}`, startup, env: env || {}, autostart: !!autostart, status: 'stopped', created_at: new Date().toISOString() };
        if (!fs.existsSync(srv.directory)) fs.mkdirSync(srv.directory, { recursive: true });
        const servers = loadServers(); servers.push(srv); saveServers(servers);
        if (assigned_to && Array.isArray(assigned_to)) {
          const users = loadUsers();
          assigned_to.forEach(uid => {
            const idx = users.findIndex(u => u.id === uid);
            if (idx !== -1 && !users[idx].assigned_servers.includes(id)) {
              users[idx].assigned_servers.push(id);
            }
          });
          saveUsers(users);
        }
        if (autostart) startServer(srv);
        send(200, { ok: true, id });
        log('info', 'API', `Server created: ${name} id=${id}`);
      } catch(e) { send(400, { error: e.message }); }
    });
    return;
  }

  const srvMatch = pathname.match(/^\/api\/servers\/([^/]+)(\/.*)?$/);
  if (srvMatch) {
    const serverId = srvMatch[1];
    const action   = srvMatch[2] || '';

    if (!canAccessServer(sessionUser, serverId)) { send(403, { error: 'Permission denied' }); return; }

    const servers = loadServers();
    const srvIdx  = servers.findIndex(s => s.id === serverId);

    if (action === '/start' && req.method === 'POST') {
      if (srvIdx === -1) { send(404, { error: 'Server not found' }); return; }
      if (sessionUser.role === 'user') { send(403, { error: 'Permission denied' }); return; }
      startServer(servers[srvIdx]);
      send(200, { ok: true });
      return;
    }

    if (action === '/stop' && req.method === 'POST') {
      if (srvIdx === -1) { send(404, { error: 'Server not found' }); return; }
      if (sessionUser.role === 'user') { send(403, { error: 'Permission denied' }); return; }
      stopServer(serverId);
      send(200, { ok: true });
      return;
    }

    if (action === '/logs' && req.method === 'GET') {
      const lines = parseInt(url.searchParams.get('lines') || '200');
      send(200, { logs: getLogs(serverId, lines) });
      return;
    }

    if (action === '' && req.method === 'DELETE') {
      if (sessionUser.role !== 'superadmin') { send(403, { error: 'Permission denied' }); return; }
      stopServer(serverId);
      const updated = servers.filter(s => s.id !== serverId);
      saveServers(updated);
      send(200, { ok: true });
      return;
    }

    if (action === '' && req.method === 'PUT') {
      if (sessionUser.role !== 'superadmin') { send(403, { error: 'Permission denied' }); return; }
      let body = '';
      req.on('data', d => body += d);
      req.on('end', () => {
        try {
          const updates = JSON.parse(body);
          if (srvIdx !== -1) {
            servers[srvIdx] = { ...servers[srvIdx], ...updates };
            saveServers(servers);
          }
          send(200, { ok: true });
        } catch(e) { send(400, { error: e.message }); }
      });
      return;
    }

    send(404, { error: 'Not found' });
    return;
  }

  if (pathname === '/api/users' && req.method === 'GET') {
    if (sessionUser.role !== 'superadmin') { send(403, { error: 'Permission denied' }); return; }
    const users = loadUsers().map(u => ({ id: u.id, email: u.email, username: u.username, role: u.role, assigned_servers: u.assigned_servers, created_at: u.created_at }));
    send(200, users);
    return;
  }

  if (pathname === '/api/users' && req.method === 'POST') {
    if (sessionUser.role !== 'superadmin') { send(403, { error: 'Permission denied' }); return; }
    let body = '';
    req.on('data', d => body += d);
    req.on('end', () => {
      try {
        const { email, password, username, role, assigned_servers } = JSON.parse(body);
        if (!email || !password || !username) { send(400, { error: 'email, password, username required' }); return; }
        const allowed = ['subadmin', 'user'];
        if (!allowed.includes(role)) { send(400, { error: 'role must be subadmin or user' }); return; }
        const users = loadUsers();
        if (users.find(u => u.email === email)) { send(409, { error: 'Email already exists' }); return; }
        const id = crypto.randomBytes(8).toString('hex');
        const newUser = { id, email, password: hashPass(password), username, role, assigned_servers: assigned_servers || [], created_at: new Date().toISOString() };
        users.push(newUser);
        saveUsers(users);
        send(200, { ok: true, id });
        log('info', 'API', `User created: ${email} role=${role}`);
      } catch(e) { send(400, { error: e.message }); }
    });
    return;
  }

  const userMatch = pathname.match(/^\/api\/users\/([^/]+)(\/.*)?$/);
  if (userMatch) {
    const uid    = userMatch[1];
    const action = userMatch[2] || '';

    if (sessionUser.role !== 'superadmin') { send(403, { error: 'Permission denied' }); return; }

    const users = loadUsers();
    const uIdx  = users.findIndex(u => u.id === uid);

    if (action === '' && req.method === 'PUT') {
      let body = '';
      req.on('data', d => body += d);
      req.on('end', () => {
        try {
          const updates = JSON.parse(body);
          if (uIdx === -1) { send(404, { error: 'User not found' }); return; }
          if (users[uIdx].role === 'superadmin') { send(403, { error: 'Cannot modify superadmin' }); return; }
          if (updates.password) updates.password = hashPass(updates.password);
          users[uIdx] = { ...users[uIdx], ...updates };
          saveUsers(users);
          send(200, { ok: true });
        } catch(e) { send(400, { error: e.message }); }
      });
      return;
    }

    if (action === '' && req.method === 'DELETE') {
      if (uIdx === -1) { send(404, { error: 'User not found' }); return; }
      if (users[uIdx].role === 'superadmin') { send(403, { error: 'Cannot delete superadmin' }); return; }
      users.splice(uIdx, 1);
      saveUsers(users);
      send(200, { ok: true });
      return;
    }

    if (action === '/assign' && req.method === 'POST') {
      let body = '';
      req.on('data', d => body += d);
      req.on('end', () => {
        try {
          const { server_ids } = JSON.parse(body);
          if (uIdx === -1) { send(404, { error: 'User not found' }); return; }
          users[uIdx].assigned_servers = Array.isArray(server_ids) ? server_ids : [];
          saveUsers(users);
          send(200, { ok: true });
        } catch(e) { send(400, { error: e.message }); }
      });
      return;
    }

    send(404, { error: 'Not found' });
    return;
  }

  if (pathname === '/api/backup' && req.method === 'POST') {
    if (sessionUser.role !== 'superadmin') { send(403, { error: 'Permission denied' }); return; }
    runBackup((err, msg) => {
      if (err) send(500, { error: err });
      else send(200, { ok: true, message: msg });
    });
    return;
  }

  if (pathname === '/api/config' && req.method === 'GET') {
    if (sessionUser.role !== 'superadmin') { send(403, { error: 'Permission denied' }); return; }
    const cfg = loadConfig();
    send(200, { domain: cfg.domain || '', use_ssl: cfg.use_ssl || false, backup_type: cfg.backup_type || 'none', web_port: cfg.web_port, version: '3.0.0' });
    return;
  }

  send(404, { error: 'Not found' });
});

server.listen(WEB_PORT, () => {
  log('info', 'HTTP', `Panel running on port ${WEB_PORT}`);
});

const servers = loadServers();
servers.filter(s => s.autostart).forEach(s => {
  log('info', 'BOOT', `Auto-starting: ${s.name}`);
  setTimeout(() => startServer(s), 2000);
});

if (config.backup_type !== 'none' && config.backup_interval > 0) {
  setInterval(() => { runBackup((err, msg) => { if (msg) log('info', 'BACKUP', msg); if (err) log('error', 'BACKUP', err); }); }, config.backup_interval * 3600 * 1000);
}

async function syncFromSupabase() {
  try {
    const r = await supaFetch('/rest/v1/servers?select=*');
    if (!r) return;
    const rows = await r.json();
    if (!Array.isArray(rows)) return;
    saveServers(rows);
    log('info', 'SYNC', `Pulled ${rows.length} servers from Supabase`);
  } catch(e) { log('error', 'SYNC', e.message); }
}

if (SUPA_URL && SUPA_KEY) {
  syncFromSupabase();
  setInterval(syncFromSupabase, 300000);
}
INDEXEOF
success "Agent written"

section "Step 5: Writing Premium Panel UI"

info "Writing index.html..."
cat > "$WEB_DIR/index.html" << 'HTMLEOF'
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>SayPanel v3</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#0d0d0f;--surface:#141416;--surface2:#1a1a1d;--surface3:#212124;
  --border:#2a2a2e;--border2:#333337;
  --text:#e8e8ec;--muted:#6b6b72;--muted2:#4a4a52;
  --accent:#6366f1;--accent2:#818cf8;--accent-dim:#6366f120;
  --green:#22c55e;--red:#ef4444;--yellow:#f59e0b;--blue:#3b82f6;
  --green-dim:#22c55e18;--red-dim:#ef444418;--yellow-dim:#f59e0b18;
  --mono:'JetBrains Mono','Fira Mono','Courier New',monospace;
  --radius:8px;--radius2:12px;
}
html,body{height:100%;background:var(--bg);color:var(--text);font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:14px;line-height:1.5}
a{color:inherit;text-decoration:none}
button{cursor:pointer;font-family:inherit;font-size:13px;border:none;outline:none}
input,textarea,select{font-family:inherit;font-size:13px;outline:none;border:none}

.hidden{display:none!important}

.login-wrap{display:flex;align-items:center;justify-content:center;min-height:100vh;padding:20px;background:radial-gradient(ellipse at 50% 0%,#1a1040 0%,var(--bg) 70%)}
.login-card{width:100%;max-width:400px;background:var(--surface);border:1px solid var(--border);border-radius:var(--radius2);padding:36px 32px}
.login-logo{display:flex;align-items:center;gap:10px;margin-bottom:28px}
.login-logo-icon{width:36px;height:36px;background:var(--accent);border-radius:8px;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:15px;color:#fff}
.login-logo-text{font-size:18px;font-weight:700;letter-spacing:-.3px}
.login-sub{font-size:12px;color:var(--muted);margin-top:2px}
.login-title{font-size:22px;font-weight:700;margin-bottom:4px}
.login-desc{font-size:13px;color:var(--muted);margin-bottom:24px}
.form-group{margin-bottom:16px}
.form-label{display:block;font-size:12px;font-weight:500;color:var(--muted);margin-bottom:6px;letter-spacing:.3px;text-transform:uppercase}
.form-input{width:100%;background:var(--surface2);border:1px solid var(--border);border-radius:var(--radius);padding:10px 12px;color:var(--text);transition:border-color .15s}
.form-input:focus{border-color:var(--accent)}
.form-textarea{width:100%;background:var(--surface2);border:1px solid var(--border);border-radius:var(--radius);padding:10px 12px;color:var(--text);resize:vertical;min-height:80px;transition:border-color .15s}
.form-textarea:focus{border-color:var(--accent)}
.form-select{background:var(--surface2);border:1px solid var(--border);border-radius:var(--radius);padding:8px 10px;color:var(--text);cursor:pointer}
.form-select:focus{border-color:var(--accent)}
.login-err{background:var(--red-dim);border:1px solid #ef444430;border-radius:var(--radius);padding:10px 12px;font-size:12px;color:var(--red);margin-bottom:16px;display:none}
.btn{display:inline-flex;align-items:center;gap:6px;padding:9px 16px;border-radius:var(--radius);font-weight:500;transition:all .15s}
.btn-primary{background:var(--accent);color:#fff}
.btn-primary:hover{background:var(--accent2)}
.btn-ghost{background:var(--surface2);color:var(--text);border:1px solid var(--border)}
.btn-ghost:hover{background:var(--surface3);border-color:var(--border2)}
.btn-danger{background:var(--red-dim);color:var(--red);border:1px solid #ef444430}
.btn-danger:hover{background:#ef444425}
.btn-full{width:100%;justify-content:center}
.btn-sm{padding:6px 12px;font-size:12px}

.layout{display:flex;height:100vh;overflow:hidden}
.sidebar{width:220px;min-width:220px;background:var(--surface);border-right:1px solid var(--border);display:flex;flex-direction:column;height:100vh}
.sidebar-logo{padding:18px 16px 16px;display:flex;align-items:center;gap:10px;border-bottom:1px solid var(--border)}
.sidebar-logo-icon{width:30px;height:30px;background:var(--accent);border-radius:6px;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px;color:#fff;flex-shrink:0}
.sidebar-logo-text{font-size:15px;font-weight:700;letter-spacing:-.3px}
.sidebar-nav{flex:1;padding:12px 8px;overflow-y:auto}
.nav-section{font-size:10px;font-weight:600;color:var(--muted2);letter-spacing:.8px;text-transform:uppercase;padding:8px 8px 4px}
.nav-item{display:flex;align-items:center;gap:10px;padding:8px 10px;border-radius:var(--radius);cursor:pointer;color:var(--muted);font-size:13px;font-weight:500;transition:all .15s;margin-bottom:2px}
.nav-item:hover{background:var(--surface2);color:var(--text)}
.nav-item.active{background:var(--accent-dim);color:var(--accent2)}
.nav-item svg{flex-shrink:0}
.sidebar-footer{padding:12px;border-top:1px solid var(--border)}
.user-card{background:var(--surface2);border-radius:var(--radius);padding:10px 12px;display:flex;align-items:center;gap:10px}
.user-avatar{width:28px;height:28px;border-radius:50%;background:var(--accent-dim);border:1px solid var(--accent);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:600;color:var(--accent2);flex-shrink:0}
.user-info{flex:1;min-width:0}
.user-name{font-size:12px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.user-role{font-size:10px;color:var(--muted);letter-spacing:.3px}
.icon-btn-sm{background:none;color:var(--muted);border-radius:4px;padding:3px;transition:color .15s}
.icon-btn-sm:hover{color:var(--text)}

.main{flex:1;display:flex;flex-direction:column;overflow:hidden;min-width:0}
.topbar{height:52px;border-bottom:1px solid var(--border);padding:0 24px;display:flex;align-items:center;justify-content:space-between;flex-shrink:0;background:var(--surface)}
.page-title{font-size:16px;font-weight:700}
.page-sub{font-size:12px;color:var(--muted);margin-top:1px}
.topbar-right{display:flex;align-items:center;gap:10px}
.conn-pill{display:flex;align-items:center;gap:6px;background:var(--surface2);border:1px solid var(--border);border-radius:20px;padding:5px 12px;font-size:11px;color:var(--muted)}
.dot{width:7px;height:7px;border-radius:50%;flex-shrink:0}
.dot.green{background:var(--green)}
.dot.red{background:var(--red)}
.dot.yellow{background:var(--yellow)}

.content{flex:1;overflow-y:auto;padding:24px}
.page{display:none}
.page.active{display:block}

.grid-2{display:grid;grid-template-columns:1fr 1fr;gap:16px}
.grid-3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px}
.grid-4{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}
@media(max-width:900px){.grid-4{grid-template-columns:repeat(2,1fr)}.grid-3{grid-template-columns:1fr 1fr}.grid-2{grid-template-columns:1fr}}
@media(max-width:600px){.grid-4,.grid-3,.grid-2{grid-template-columns:1fr}}

.card{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius2);overflow:hidden}
.card-head{padding:14px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;gap:10px}
.card-head-title{font-size:13px;font-weight:600;display:flex;align-items:center;gap:8px}
.card-body{padding:16px}

.stat-card{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius2);padding:18px}
.stat-label{font-size:11px;color:var(--muted);font-weight:500;letter-spacing:.3px;text-transform:uppercase;margin-bottom:8px}
.stat-val{font-size:28px;font-weight:700;letter-spacing:-1px}
.stat-val.green{color:var(--green)}
.stat-val.red{color:var(--red)}
.stat-val.yellow{color:var(--yellow)}
.stat-val.accent{color:var(--accent2)}

.server-row{display:flex;align-items:center;gap:12px;padding:12px 0;border-bottom:1px solid var(--border)}
.server-row:last-child{border-bottom:none}
.srv-ico{width:32px;height:32px;background:var(--surface2);border-radius:8px;display:flex;align-items:center;justify-content:center;flex-shrink:0;color:var(--muted)}
.srv-info{flex:1;min-width:0}
.srv-name{font-size:13px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.srv-meta{font-size:11px;color:var(--muted);font-family:var(--mono);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-top:1px}
.srv-actions{display:flex;align-items:center;gap:6px;flex-shrink:0}
.icon-btn{background:var(--surface2);border:1px solid var(--border);border-radius:6px;padding:6px;color:var(--muted);transition:all .15s;display:flex;align-items:center}
.icon-btn:hover{background:var(--surface3);color:var(--text);border-color:var(--border2)}
.icon-btn.start:hover{background:var(--green-dim);color:var(--green);border-color:#22c55e30}
.icon-btn.stop-btn:hover{background:var(--red-dim);color:var(--red);border-color:#ef444430}
.icon-btn.log-btn:hover{background:var(--yellow-dim);color:var(--yellow);border-color:#f59e0b30}
.icon-btn.del:hover{background:var(--red-dim);color:var(--red);border-color:#ef444430}

.badge{display:inline-flex;align-items:center;gap:4px;padding:3px 8px;border-radius:20px;font-size:11px;font-weight:500;flex-shrink:0}
.badge-green{background:var(--green-dim);color:var(--green)}
.badge-red{background:var(--red-dim);color:var(--red)}
.badge-yellow{background:var(--yellow-dim);color:var(--yellow)}
.badge-blue{background:#3b82f618;color:var(--blue)}
.badge-purple{background:var(--accent-dim);color:var(--accent2)}

.bar-wrap{flex:1;height:5px;background:var(--surface2);border-radius:10px;overflow:hidden}
.bar-fill{height:100%;border-radius:10px;transition:width .3s}
.bar-blue{background:var(--blue)}
.bar-green{background:var(--green)}
.bar-red{background:var(--red)}
.sys-row{display:flex;align-items:center;gap:10px;margin-bottom:10px}
.sys-label{font-size:11px;color:var(--muted);width:36px;flex-shrink:0}
.sys-val{font-size:11px;color:var(--text);width:36px;text-align:right;flex-shrink:0}
.mini-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-top:12px}
.mini-stat{background:var(--surface2);border-radius:6px;padding:8px 10px;text-align:center}
.mini-val{font-size:16px;font-weight:700}
.mini-lbl{font-size:10px;color:var(--muted);margin-top:1px}

.console-wrap{background:#0a0a0c;border-radius:var(--radius);padding:14px;font-family:var(--mono);font-size:12px;line-height:1.6;color:#c0c0c8;overflow-y:auto;white-space:pre-wrap;word-break:break-all}

.search-bar{display:flex;align-items:center;gap:10px;margin-bottom:16px;flex-wrap:wrap}
.search-input-wrap{position:relative;flex:1;min-width:160px}
.search-ico{position:absolute;left:10px;top:50%;transform:translateY(-50%);color:var(--muted);pointer-events:none}
.search-input-wrap .form-input{padding-left:32px}

.empty-state{text-align:center;padding:40px 20px}
.e-ico{color:var(--muted2);margin-bottom:12px}
.e-title{font-size:14px;font-weight:600;color:var(--muted);margin-bottom:4px}
.e-sub{font-size:12px;color:var(--muted2)}

.table{width:100%;border-collapse:collapse}
.table th{font-size:11px;font-weight:600;color:var(--muted);text-transform:uppercase;letter-spacing:.5px;padding:10px 12px;text-align:left;border-bottom:1px solid var(--border)}
.table td{padding:11px 12px;border-bottom:1px solid var(--border);font-size:13px}
.table tr:last-child td{border-bottom:none}
.table tr:hover td{background:var(--surface2)}

.modal-overlay{position:fixed;inset:0;background:#00000080;display:none;align-items:center;justify-content:center;z-index:1000;padding:20px}
.modal-overlay.open{display:flex}
.modal{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius2);padding:24px;width:100%;max-width:500px;max-height:90vh;overflow-y:auto}
.modal-wide{max-width:680px}
.modal-title{font-size:16px;font-weight:700;display:flex;align-items:center;gap:8px;margin-bottom:20px}
.modal-actions{display:flex;gap:10px;justify-content:flex-end;margin-top:20px}
.env-row{display:flex;gap:8px;margin-bottom:8px}
.env-add{display:flex;align-items:center;gap:6px;font-size:12px;color:var(--accent2);cursor:pointer;padding:4px 0;width:fit-content}
.env-add:hover{color:var(--accent)}
.settings-title{font-size:14px;font-weight:700;margin-bottom:16px}
.setting-row{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:12px 0;border-bottom:1px solid var(--border)}
.setting-row:last-child{border-bottom:none}
.setting-info{flex:1}
.setting-name{font-size:13px;font-weight:500}
.setting-desc{font-size:12px;color:var(--muted);margin-top:2px}
.code-block{background:#0a0a0c;border:1px solid var(--border);border-radius:var(--radius);padding:14px;font-family:var(--mono);font-size:12px;line-height:1.8;color:#c0c0c8}
.cm{color:var(--muted2)}
.cv{color:var(--green)}

.assign-list{display:flex;flex-wrap:wrap;gap:6px;padding:8px 0}
.assign-chip{display:flex;align-items:center;gap:6px;background:var(--surface2);border:1px solid var(--border);border-radius:20px;padding:4px 10px;font-size:12px;cursor:pointer;transition:all .15s}
.assign-chip.selected{background:var(--accent-dim);border-color:var(--accent);color:var(--accent2)}
.assign-chip:hover{border-color:var(--border2)}

#toast-container{position:fixed;bottom:24px;right:24px;z-index:9999;display:flex;flex-direction:column;gap:8px}
.toast{display:flex;align-items:center;gap:10px;background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:12px 16px;font-size:13px;min-width:260px;animation:tIn .25s ease;box-shadow:0 8px 24px #00000060}
.toast.success{border-color:#22c55e40;background:#22c55e08}
.toast.error{border-color:#ef444440;background:#ef444408}
.toast.info{border-color:#3b82f640;background:#3b82f608}
.t-ico{flex-shrink:0}
.t-ico.success{color:var(--green)}.t-ico.error{color:var(--red)}.t-ico.info{color:var(--blue)}
@keyframes tIn{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:translateX(0)}}
@keyframes tOut{from{opacity:1}to{opacity:0}}

.log-modal-wrap{background:#0a0a0c;border-radius:var(--radius);padding:14px;font-family:var(--mono);font-size:12px;line-height:1.6;color:#c0c0c8;height:400px;overflow-y:auto;white-space:pre-wrap;word-break:break-all}

::-webkit-scrollbar{width:5px;height:5px}
::-webkit-scrollbar-track{background:transparent}
::-webkit-scrollbar-thumb{background:var(--border2);border-radius:10px}
::-webkit-scrollbar-thumb:hover{background:var(--muted2)}
</style>
</head>
<body>

<div id="login-screen" class="login-wrap">
  <div class="login-card">
    <div class="login-logo">
      <div class="login-logo-icon">S</div>
      <div>
        <div class="login-logo-text">SayPanel</div>
        <div class="login-sub">v3.0 PREMIUM</div>
      </div>
    </div>
    <div class="login-title">Welcome back</div>
    <div class="login-desc">Sign in to your panel</div>
    <div id="login-err" class="login-err"></div>
    <div class="form-group">
      <label class="form-label">Email</label>
      <input class="form-input" id="login-email" type="email" placeholder="admin@example.com" autocomplete="email">
    </div>
    <div class="form-group">
      <label class="form-label">Password</label>
      <input class="form-input" id="login-pass" type="password" placeholder="••••••••" autocomplete="current-password">
    </div>
    <button class="btn btn-primary btn-full" onclick="doLogin()">Sign In</button>
  </div>
</div>

<div id="main-layout" class="layout" style="display:none">
  <aside class="sidebar">
    <div class="sidebar-logo">
      <div class="sidebar-logo-icon">S</div>
      <div class="sidebar-logo-text">SayPanel</div>
    </div>
    <nav class="sidebar-nav">
      <div class="nav-section">Panel</div>
      <div class="nav-item active" onclick="showPage('dashboard')">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
        Dashboard
      </div>
      <div class="nav-item" onclick="showPage('servers')">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/></svg>
        Servers
      </div>
      <div class="nav-item" onclick="showPage('console')">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>
        Console
      </div>
      <div class="nav-section" id="nav-admin-section" style="display:none">Admin</div>
      <div class="nav-item" id="nav-users" style="display:none" onclick="showPage('users')">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
        Users
      </div>
      <div class="nav-section">System</div>
      <div class="nav-item" onclick="showPage('settings')">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
        Settings
      </div>
    </nav>
    <div class="sidebar-footer">
      <div class="user-card">
        <div class="user-avatar" id="sidebar-avatar">A</div>
        <div class="user-info">
          <div class="user-name" id="sidebar-name">Loading...</div>
          <div class="user-role" id="sidebar-role">—</div>
        </div>
        <button class="icon-btn-sm" onclick="doLogout()" title="Logout">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
        </button>
      </div>
    </div>
  </aside>

  <main class="main">
    <div class="topbar">
      <div>
        <div class="page-title" id="page-title">Dashboard</div>
        <div class="page-sub" id="page-sub">Overview</div>
      </div>
      <div class="topbar-right">
        <div class="conn-pill">
          <span class="dot yellow" id="conn-dot"></span>
          <span id="conn-label">Connecting...</span>
        </div>
        <button class="btn btn-ghost btn-sm" onclick="refreshAll()">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg>
          Refresh
        </button>
      </div>
    </div>

    <div class="content">

      <div id="page-dashboard" class="page active">
        <div class="grid-4" style="margin-bottom:16px">
          <div class="stat-card"><div class="stat-label">Total Servers</div><div class="stat-val accent" id="s-total">—</div></div>
          <div class="stat-card"><div class="stat-label">Running</div><div class="stat-val green" id="s-run">—</div></div>
          <div class="stat-card"><div class="stat-label">Stopped</div><div class="stat-val red" id="s-stop">—</div></div>
          <div class="stat-card"><div class="stat-label">Uptime</div><div class="stat-val" id="s-uptime" style="font-size:18px">—</div></div>
        </div>
        <div class="grid-2">
          <div class="card">
            <div class="card-head">
              <div class="card-head-title">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/></svg>
                My Servers
              </div>
              <button class="btn btn-ghost btn-sm" id="btn-new-server" onclick="openAddServer()">+ New</button>
            </div>
            <div class="card-body" id="dash-servers"></div>
          </div>
          <div class="card">
            <div class="card-head">
              <div class="card-head-title">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                System
              </div>
              <span style="font-size:11px;color:var(--muted)" id="sys-uptime-lbl"></span>
            </div>
            <div class="card-body" id="sys-panel"></div>
          </div>
        </div>
      </div>

      <div id="page-servers" class="page">
        <div class="search-bar">
          <div class="search-input-wrap">
            <span class="search-ico"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></span>
            <input class="form-input" placeholder="Search servers..." oninput="filterServers(this.value)">
          </div>
          <button class="btn btn-primary" id="btn-new-server2" onclick="openAddServer()">+ New Server</button>
        </div>
        <div class="card"><div class="card-body" id="servers-list"></div></div>
      </div>

      <div id="page-console" class="page">
        <div style="display:flex;gap:10px;align-items:center;margin-bottom:16px;flex-wrap:wrap">
          <select class="form-select" style="width:220px" id="console-sel" onchange="fetchLogsPage()"><option value="">Select server...</option></select>
          <button class="btn btn-primary" onclick="fetchLogsPage()">Fetch Logs</button>
          <button class="btn btn-ghost" onclick="toggleAutoRefresh()" id="btn-auto">▶ Auto Refresh</button>
          <button class="btn btn-ghost" onclick="document.getElementById('console-out').textContent=''">Clear</button>
          <span style="font-size:11px;color:var(--muted)" id="console-status">Idle</span>
        </div>
        <div class="card">
          <div class="card-head"><div class="card-head-title">Console Output</div></div>
          <div class="card-body"><div class="console-wrap" style="height:calc(100vh - 260px)" id="console-out">Select a server and click Fetch Logs.</div></div>
        </div>
      </div>

      <div id="page-users" class="page">
        <div class="search-bar">
          <div class="search-input-wrap">
            <span class="search-ico"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></span>
            <input class="form-input" placeholder="Search users..." oninput="filterUsers(this.value)">
          </div>
          <button class="btn btn-primary" onclick="openAddUser()">+ New User</button>
        </div>
        <div class="card">
          <table class="table" id="users-table">
            <thead><tr><th>User</th><th>Email</th><th>Role</th><th>Assigned Servers</th><th>Actions</th></tr></thead>
            <tbody id="users-tbody"></tbody>
          </table>
        </div>
      </div>

      <div id="page-settings" class="page">
        <div class="grid-2">
          <div class="card">
            <div class="card-head"><div class="card-head-title">Panel Config</div></div>
            <div class="card-body">
              <div class="setting-row">
                <div class="setting-info"><div class="setting-name">Version</div></div>
                <span class="badge badge-purple">v3.0 PREMIUM</span>
              </div>
              <div class="setting-row">
                <div class="setting-info"><div class="setting-name">Connection</div></div>
                <span id="cfg-conn-status" class="badge badge-green">Connected</span>
              </div>
              <div style="margin-top:16px;display:flex;gap:10px">
                <button class="btn btn-ghost" onclick="ping()">Test Connection</button>
                <button class="btn btn-ghost" id="btn-backup" onclick="doBackupNow()">Run Backup</button>
              </div>
            </div>
          </div>
          <div class="card">
            <div class="card-head"><div class="card-head-title">Quick Install</div></div>
            <div class="card-body">
              <div class="code-block">
                <div class="cm"># New VPS pe install karo</div>
                <div class="cv">curl -fsSL https://YOUR-URL/install.sh | bash</div>
                <br>
                <div class="cm"># PM2 commands</div>
                <div>pm2 logs saypanel-agent</div>
                <div>pm2 restart saypanel-agent</div>
                <div>pm2 stop saypanel-agent</div>
                <br>
                <div class="cm"># Restore on new VPS</div>
                <div class="cv">sudo bash /opt/saypanel/restore.sh</div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  </main>
</div>

<div class="modal-overlay" id="modal-server">
  <div class="modal">
    <div class="modal-title">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/></svg>
      <span id="modal-server-title">New Server</span>
    </div>
    <div class="form-group"><label class="form-label">Server Name</label><input class="form-input" id="srv-name" placeholder="My Telegram Bot"></div>
    <div class="form-group"><label class="form-label">Working Directory</label><input class="form-input" id="srv-dir" placeholder="/opt/saypanel/servers/my-bot"></div>
    <div class="form-group"><label class="form-label">Startup Command</label><textarea class="form-textarea" id="srv-cmd" placeholder="node index.js"></textarea></div>
    <div class="form-group">
      <label class="form-label" style="margin-bottom:8px">Environment Variables</label>
      <div id="env-rows"></div>
      <div class="env-add" onclick="addEnvRow()">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Add Variable
      </div>
    </div>
    <div class="form-group"><label style="display:flex;align-items:center;gap:8px;font-size:13px;cursor:pointer"><input type="checkbox" id="srv-auto"> Auto-start on boot</label></div>
    <div class="form-group" id="assign-to-group" style="display:none">
      <label class="form-label">Assign To Users</label>
      <div class="assign-list" id="assign-to-list"></div>
    </div>
    <div class="modal-actions">
      <button class="btn btn-ghost" onclick="closeModal('modal-server')">Cancel</button>
      <button class="btn btn-primary" onclick="createServer()">Create Server</button>
    </div>
  </div>
</div>

<div class="modal-overlay" id="modal-user">
  <div class="modal">
    <div class="modal-title">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
      <span id="modal-user-title">New User</span>
    </div>
    <div class="form-group"><label class="form-label">Username</label><input class="form-input" id="u-username" placeholder="John Doe"></div>
    <div class="form-group"><label class="form-label">Email</label><input class="form-input" id="u-email" type="email" placeholder="john@example.com"></div>
    <div class="form-group"><label class="form-label">Password</label><input class="form-input" id="u-pass" type="password" placeholder="Min 6 characters"></div>
    <div class="form-group">
      <label class="form-label">Role</label>
      <select class="form-select" id="u-role" style="width:100%">
        <option value="user">User — sirf apne assigned servers</option>
        <option value="subadmin">Sub-Admin — assigned servers manage kar sakta hai</option>
      </select>
    </div>
    <div class="form-group">
      <label class="form-label">Assign Servers</label>
      <div class="assign-list" id="user-assign-list"></div>
    </div>
    <div class="modal-actions">
      <button class="btn btn-ghost" onclick="closeModal('modal-user')">Cancel</button>
      <button class="btn btn-primary" onclick="saveUser()">Save User</button>
    </div>
  </div>
</div>

<div class="modal-overlay" id="modal-assign">
  <div class="modal">
    <div class="modal-title">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
      Assign Servers
    </div>
    <div style="font-size:13px;color:var(--muted);margin-bottom:14px" id="assign-modal-user-name"></div>
    <div class="assign-list" id="assign-modal-list"></div>
    <div class="modal-actions">
      <button class="btn btn-ghost" onclick="closeModal('modal-assign')">Cancel</button>
      <button class="btn btn-primary" onclick="saveAssign()">Save</button>
    </div>
  </div>
</div>

<div class="modal-overlay" id="modal-logs">
  <div class="modal modal-wide">
    <div class="modal-title" id="log-modal-title">Logs</div>
    <div class="log-modal-wrap" id="log-content">Loading...</div>
    <div class="modal-actions">
      <button class="btn btn-ghost" onclick="closeModal('modal-logs')">Close</button>
      <button class="btn btn-primary" onclick="refreshLogs()">Refresh</button>
    </div>
  </div>
</div>

<div id="toast-container"></div>

<script>
const TOK_KEY = 'saypanel_token_v3';
let TOKEN = localStorage.getItem(TOK_KEY) || '';
let SESSION_ROLE = '';
let SESSION_ID   = '';
let allServers = [];
let allUsers   = [];
let currentLogId = null;
let autoTimer    = null;
let editingUserId = null;
let assigningUserId = null;

async function doLogin() {
  const email = document.getElementById('login-email').value.trim();
  const pass  = document.getElementById('login-pass').value;
  const errEl = document.getElementById('login-err');
  errEl.style.display = 'none';
  if (!email || !pass) { errEl.textContent = 'Email aur password daalo!'; errEl.style.display = 'block'; return; }
  try {
    const r = await fetch('/api/auth/login', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({email, password:pass}) });
    const d = await r.json();
    if (d.ok && d.token) {
      TOKEN = d.token;
      localStorage.setItem(TOK_KEY, TOKEN);
      SESSION_ROLE = d.role;
      SESSION_ID   = d.id;
      applyRoleUI(d.role);
      document.getElementById('sidebar-name').textContent    = d.username || email;
      document.getElementById('sidebar-role').textContent    = roleLabel(d.role);
      document.getElementById('sidebar-avatar').textContent  = (d.username || email)[0].toUpperCase();
      document.getElementById('login-screen').classList.add('hidden');
      document.getElementById('main-layout').style.display = 'flex';
      initPanel();
    } else {
      errEl.textContent = d.error || 'Login failed';
      errEl.style.display = 'block';
    }
  } catch(e) {
    errEl.textContent = 'Connection failed: ' + e.message;
    errEl.style.display = 'block';
  }
}

function roleLabel(role) {
  return { superadmin: 'Super Admin', subadmin: 'Sub-Admin', user: 'User' }[role] || role;
}

function applyRoleUI(role) {
  const isSA = role === 'superadmin';
  document.getElementById('nav-admin-section').style.display = isSA ? '' : 'none';
  document.getElementById('nav-users').style.display         = isSA ? '' : 'none';
  document.getElementById('btn-new-server').style.display    = isSA ? '' : 'none';
  document.getElementById('btn-new-server2').style.display   = isSA ? '' : 'none';
  const backupBtn = document.getElementById('btn-backup');
  if (backupBtn) backupBtn.style.display = isSA ? '' : 'none';
}

function doLogout() {
  localStorage.removeItem(TOK_KEY);
  TOKEN = ''; SESSION_ROLE = '';
  document.getElementById('login-screen').classList.remove('hidden');
  document.getElementById('main-layout').style.display = 'none';
}

document.getElementById('login-pass').addEventListener('keydown', e => { if (e.key === 'Enter') doLogin(); });

function api(endpoint, method='GET', body=null) {
  const opts = { method, headers: { 'Authorization': `Bearer ${TOKEN}`, 'Content-Type': 'application/json' } };
  if (body) opts.body = JSON.stringify(body);
  return fetch('/api' + endpoint, opts).then(r => r.json());
}

function showPage(name) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const pg = document.getElementById('page-' + name);
  if (pg) pg.classList.add('active');
  document.querySelectorAll('.nav-item').forEach(n => { if (n.getAttribute('onclick')?.includes(`'${name}'`)) n.classList.add('active'); });
  const map = {
    dashboard: ['Dashboard','Overview & stats'],
    servers:   ['Servers','Manage servers'],
    console:   ['Console','Live output'],
    users:     ['Users','Manage accounts & permissions'],
    settings:  ['Settings','Panel configuration']
  };
  const [t, s] = map[name] || ['Panel', ''];
  document.getElementById('page-title').textContent = t;
  document.getElementById('page-sub').textContent   = s;
  if (name === 'dashboard') loadDashboard();
  if (name === 'servers')   loadServersPage();
  if (name === 'console')   populateConsoleSel();
  if (name === 'users')     loadUsersPage();
  if (autoTimer && name !== 'console') { clearInterval(autoTimer); autoTimer = null; document.getElementById('btn-auto').textContent = '▶ Auto Refresh'; }
}

function openModal(id)  { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }

function openAddServer() {
  editingUserId = null;
  document.getElementById('modal-server-title').textContent = 'New Server';
  ['srv-name','srv-dir','srv-cmd'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('srv-auto').checked = false;
  document.getElementById('env-rows').innerHTML = '';
  const ag = document.getElementById('assign-to-group');
  if (SESSION_ROLE === 'superadmin') {
    ag.style.display = '';
    const list = document.getElementById('assign-to-list');
    list.innerHTML = '';
    allUsers.forEach(u => {
      if (u.role === 'superadmin') return;
      const chip = document.createElement('div');
      chip.className = 'assign-chip';
      chip.dataset.uid = u.id;
      chip.textContent = u.username + ' (' + roleLabel(u.role) + ')';
      chip.onclick = () => chip.classList.toggle('selected');
      list.appendChild(chip);
    });
  } else {
    ag.style.display = 'none';
  }
  openModal('modal-server');
}

function addEnvRow(k='', v='') {
  const d = document.createElement('div'); d.className = 'env-row';
  d.innerHTML = `<input class="form-input" placeholder="KEY" value="${k}"><input class="form-input" placeholder="value" value="${v}" style="flex:2"><button class="icon-btn del" onclick="this.parentElement.remove()"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg></button>`;
  document.getElementById('env-rows').appendChild(d);
}

async function loadDashboard() {
  try {
    const [servers, sys, pong] = await Promise.all([api('/servers'), api('/system'), api('/ping')]);
    allServers = Array.isArray(servers) ? servers : [];
    const running = allServers.filter(s => s.status === 'running').length;
    document.getElementById('s-total').textContent = allServers.length;
    document.getElementById('s-run').textContent   = running;
    document.getElementById('s-stop').textContent  = allServers.length - running;
    if (pong.uptime) {
      const u = Math.floor(pong.uptime), h = Math.floor(u/3600), m = Math.floor((u%3600)/60);
      document.getElementById('s-uptime').textContent = h + 'h ' + m + 'm';
    }
    renderSysPanel(sys);
    renderDashServers();
    const dot = document.getElementById('conn-dot');
    dot.className = 'dot green';
    document.getElementById('conn-label').textContent = 'Connected';
  } catch(e) {
    document.getElementById('conn-dot').className = 'dot red';
    document.getElementById('conn-label').textContent = 'Offline';
    toast('Agent offline!', 'error');
  }
}

function renderSysPanel(sys) {
  if (!sys || sys.error) {
    document.getElementById('sys-panel').innerHTML = '<div style="color:var(--muted);text-align:center;padding:20px 0;font-size:12px">Could not load</div>';
    return;
  }
  const memPct  = Math.round((sys.memory.used / (sys.memory.total || 1)) * 100);
  const diskPct = sys.disk.percent || 0;
  document.getElementById('sys-uptime-lbl').textContent = sys.uptime || '';
  document.getElementById('sys-panel').innerHTML = `
    <div class="sys-row"><div class="sys-label">RAM</div><div class="bar-wrap"><div class="bar-fill ${memPct>80?'bar-red':'bar-blue'}" style="width:${memPct}%"></div></div><div class="sys-val">${memPct}%</div></div>
    <div class="sys-row"><div class="sys-label">Disk</div><div class="bar-wrap"><div class="bar-fill ${diskPct>85?'bar-red':'bar-green'}" style="width:${diskPct}%"></div></div><div class="sys-val">${diskPct}%</div></div>
    <div class="mini-grid">
      <div class="mini-stat"><div class="mini-val">${sys.memory.used}MB</div><div class="mini-lbl">RAM Used</div></div>
      <div class="mini-stat"><div class="mini-val">${sys.disk.used}</div><div class="mini-lbl">Disk Used</div></div>
      <div class="mini-stat"><div class="mini-val">${sys.cpus}</div><div class="mini-lbl">CPU Cores</div></div>
      <div class="mini-stat"><div class="mini-val">${allServers.filter(s=>s.status==='running').length}</div><div class="mini-lbl">Running</div></div>
    </div>`;
}

function srvRow(s) {
  const icoType = (s.name.toLowerCase().includes('bot') || s.name.toLowerCase().includes('tg')) ? 'bot' : 'server';
  const ico = icoType === 'bot'
    ? `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/><line x1="12" y1="3" x2="12" y2="7"/><circle cx="8" cy="16" r="1" fill="currentColor" stroke="none"/><circle cx="16" cy="16" r="1" fill="currentColor" stroke="none"/></svg>`
    : `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/></svg>`;
  const canControl = SESSION_ROLE !== 'user';
  const startBtn  = `<button class="icon-btn start" title="Start" onclick="doStart('${s.id}')"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg></button>`;
  const stopBtn   = `<button class="icon-btn stop-btn" title="Stop" onclick="doStop('${s.id}')"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="6" width="12" height="12" rx="1"/></svg></button>`;
  const logBtn    = `<button class="icon-btn log-btn" title="Logs" onclick="openLogs('${s.id}','${s.name}')"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg></button>`;
  const delBtn    = SESSION_ROLE === 'superadmin' ? `<button class="icon-btn del" title="Delete" onclick="doDelete('${s.id}')"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg></button>` : '';
  const statusBadge = s.status === 'running'
    ? `<span class="badge badge-green"><span class="dot green" style="width:5px;height:5px;display:inline-block;margin-right:3px"></span>Running</span>`
    : `<span class="badge badge-red"><span class="dot red" style="width:5px;height:5px;display:inline-block;margin-right:3px"></span>Stopped</span>`;
  return `<div class="server-row">
    <div class="srv-ico">${ico}</div>
    <div class="srv-info"><div class="srv-name">${s.name}</div><div class="srv-meta">${(s.startup||'').slice(0,48)}</div></div>
    ${statusBadge}
    <div class="srv-actions">
      ${canControl ? (s.status === 'running' ? stopBtn : startBtn) : ''}
      ${logBtn}
      ${delBtn}
    </div>
  </div>`;
}

function renderDashServers() {
  const el = document.getElementById('dash-servers');
  if (!allServers.length) {
    el.innerHTML = `<div class="empty-state"><div class="e-ico"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/></svg></div><div class="e-title">No servers yet</div><div class="e-sub">${SESSION_ROLE==='superadmin'?'Create one above':'No servers assigned to you'}</div></div>`;
    return;
  }
  el.innerHTML = allServers.slice(0, 6).map(s => srvRow(s)).join('');
}

async function loadServersPage() {
  try {
    allServers = await api('/servers');
    renderServersList(allServers);
    populateConsoleSel();
    if (SESSION_ROLE === 'superadmin') {
      allUsers = await api('/users');
    }
  } catch(e) { toast(e.message, 'error'); }
}

function renderServersList(list) {
  const el = document.getElementById('servers-list');
  if (!list.length) {
    el.innerHTML = `<div class="empty-state"><div class="e-ico"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/></svg></div><div class="e-title">No servers found</div><div class="e-sub">Click "+ New Server" to add one</div></div>`;
    return;
  }
  el.innerHTML = list.map(s => srvRow(s)).join('');
}

function filterServers(q) {
  renderServersList(allServers.filter(s => s.name.toLowerCase().includes(q.toLowerCase())));
}

async function createServer() {
  const name = document.getElementById('srv-name').value.trim();
  const dir  = document.getElementById('srv-dir').value.trim();
  const cmd  = document.getElementById('srv-cmd').value.trim();
  const auto = document.getElementById('srv-auto').checked;
  if (!name || !cmd) { toast('Name aur startup command chahiye!', 'error'); return; }
  const env = {};
  document.querySelectorAll('#env-rows .env-row').forEach(row => {
    const inp = row.querySelectorAll('input');
    if (inp[0].value && inp[1].value) env[inp[0].value] = inp[1].value;
  });
  const assigned_to = SESSION_ROLE === 'superadmin'
    ? [...document.querySelectorAll('#assign-to-list .assign-chip.selected')].map(c => c.dataset.uid)
    : [];
  try {
    const r = await api('/servers', 'POST', { name, directory: dir, startup: cmd, env, autostart: auto, assigned_to });
    if (r.ok) { toast(`"${name}" created!`, 'success'); closeModal('modal-server'); loadDashboard(); loadServersPage(); }
    else toast(r.error || 'Failed', 'error');
  } catch(e) { toast(e.message, 'error'); }
}

async function doStart(id)  { try { await api(`/servers/${id}/start`, 'POST'); toast('Starting...', 'success'); setTimeout(() => { loadDashboard(); loadServersPage(); }, 1000); } catch(e) { toast(e.message, 'error'); } }
async function doStop(id)   { try { await api(`/servers/${id}/stop`, 'POST');  toast('Stopped', 'info');    setTimeout(() => { loadDashboard(); loadServersPage(); }, 500);  } catch(e) { toast(e.message, 'error'); } }
async function doDelete(id) {
  if (!confirm('Delete this server? This cannot be undone.')) return;
  try { await api(`/servers/${id}`, 'DELETE'); toast('Deleted', 'info'); loadDashboard(); loadServersPage(); }
  catch(e) { toast(e.message, 'error'); }
}

async function openLogs(id, name) {
  currentLogId = id;
  document.getElementById('log-modal-title').textContent = 'Logs — ' + name;
  document.getElementById('log-content').textContent = 'Loading...';
  openModal('modal-logs');
  await refreshLogs();
}

async function refreshLogs() {
  if (!currentLogId) return;
  try {
    const r = await api(`/servers/${currentLogId}/logs?lines=200`);
    const el = document.getElementById('log-content');
    el.textContent = r.logs || '(no logs yet)';
    el.scrollTop = 999999;
  } catch(e) { document.getElementById('log-content').textContent = 'Error: ' + e.message; }
}

function populateConsoleSel() {
  const sel = document.getElementById('console-sel'), prev = sel.value;
  sel.innerHTML = '<option value="">Select server...</option>';
  allServers.forEach(s => {
    const o = document.createElement('option'); o.value = s.id; o.textContent = s.name; sel.appendChild(o);
  });
  if (prev) sel.value = prev;
}

async function fetchLogsPage() {
  const id = document.getElementById('console-sel').value;
  if (!id) { toast('Server select karo!', 'error'); return; }
  document.getElementById('console-status').textContent = 'Fetching...';
  try {
    const r = await api(`/servers/${id}/logs?lines=250`);
    const out = document.getElementById('console-out');
    out.textContent = r.logs || '(no logs yet)';
    out.scrollTop = out.scrollHeight;
    document.getElementById('console-status').textContent = 'Updated ' + new Date().toLocaleTimeString();
  } catch(e) { toast(e.message, 'error'); document.getElementById('console-status').textContent = 'Error'; }
}

function toggleAutoRefresh() {
  const btn = document.getElementById('btn-auto');
  if (autoTimer) {
    clearInterval(autoTimer); autoTimer = null;
    btn.textContent = '▶ Auto Refresh';
  } else {
    fetchLogsPage();
    autoTimer = setInterval(fetchLogsPage, 4000);
    btn.textContent = '⏹ Stop Auto';
  }
}

async function loadUsersPage() {
  try {
    allUsers   = await api('/users');
    allServers = await api('/servers');
    renderUsersTable(allUsers);
  } catch(e) { toast(e.message, 'error'); }
}

function renderUsersTable(list) {
  const tbody = document.getElementById('users-tbody');
  if (!list.length) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--muted);padding:24px">No users</td></tr>';
    return;
  }
  tbody.innerHTML = list.map(u => {
    const roleBadge = { superadmin: '<span class="badge badge-purple">Super Admin</span>', subadmin: '<span class="badge badge-yellow">Sub-Admin</span>', user: '<span class="badge badge-blue">User</span>' }[u.role] || u.role;
    const srvCount = u.assigned_servers ? u.assigned_servers.length : 0;
    const isSA = u.role === 'superadmin';
    return `<tr>
      <td><div style="font-weight:600">${u.username}</div></td>
      <td style="color:var(--muted)">${u.email}</td>
      <td>${roleBadge}</td>
      <td><span class="badge badge-blue">${isSA ? 'All' : srvCount + ' server' + (srvCount !== 1 ? 's' : '')}</span></td>
      <td>
        ${!isSA ? `<button class="btn btn-ghost btn-sm" onclick="openAssignModal('${u.id}','${u.username}')">Assign</button>
        <button class="btn btn-ghost btn-sm" onclick="openEditUser('${u.id}')">Edit</button>
        <button class="btn btn-danger btn-sm" onclick="deleteUser('${u.id}','${u.username}')">Delete</button>` : '<span style="color:var(--muted);font-size:12px">Protected</span>'}
      </td>
    </tr>`;
  }).join('');
}

function filterUsers(q) {
  renderUsersTable(allUsers.filter(u => u.username.toLowerCase().includes(q.toLowerCase()) || u.email.toLowerCase().includes(q.toLowerCase())));
}

function openAddUser() {
  editingUserId = null;
  document.getElementById('modal-user-title').textContent = 'New User';
  document.getElementById('u-username').value = '';
  document.getElementById('u-email').value    = '';
  document.getElementById('u-pass').value     = '';
  document.getElementById('u-role').value     = 'user';
  const list = document.getElementById('user-assign-list');
  list.innerHTML = '';
  allServers.forEach(s => {
    const chip = document.createElement('div');
    chip.className = 'assign-chip'; chip.dataset.sid = s.id;
    chip.textContent = s.name;
    chip.onclick = () => chip.classList.toggle('selected');
    list.appendChild(chip);
  });
  openModal('modal-user');
}

function openEditUser(uid) {
  const u = allUsers.find(x => x.id === uid);
  if (!u) return;
  editingUserId = uid;
  document.getElementById('modal-user-title').textContent = 'Edit User';
  document.getElementById('u-username').value = u.username;
  document.getElementById('u-email').value    = u.email;
  document.getElementById('u-pass').value     = '';
  document.getElementById('u-role').value     = u.role;
  const list = document.getElementById('user-assign-list');
  list.innerHTML = '';
  allServers.forEach(s => {
    const chip = document.createElement('div');
    chip.className = 'assign-chip'; chip.dataset.sid = s.id;
    chip.textContent = s.name;
    if (u.assigned_servers && u.assigned_servers.includes(s.id)) chip.classList.add('selected');
    chip.onclick = () => chip.classList.toggle('selected');
    list.appendChild(chip);
  });
  openModal('modal-user');
}

async function saveUser() {
  const username = document.getElementById('u-username').value.trim();
  const email    = document.getElementById('u-email').value.trim();
  const password = document.getElementById('u-pass').value;
  const role     = document.getElementById('u-role').value;
  const assigned_servers = [...document.querySelectorAll('#user-assign-list .assign-chip.selected')].map(c => c.dataset.sid);
  if (!username || !email) { toast('Username aur email chahiye!', 'error'); return; }
  try {
    if (editingUserId) {
      const body = { username, email, role, assigned_servers };
      if (password) body.password = password;
      const r = await api(`/users/${editingUserId}`, 'PUT', body);
      if (r.ok) { toast('User updated!', 'success'); closeModal('modal-user'); loadUsersPage(); }
      else toast(r.error || 'Failed', 'error');
    } else {
      if (!password) { toast('Password chahiye!', 'error'); return; }
      const r = await api('/users', 'POST', { username, email, password, role, assigned_servers });
      if (r.ok) { toast('User created!', 'success'); closeModal('modal-user'); loadUsersPage(); }
      else toast(r.error || 'Failed', 'error');
    }
  } catch(e) { toast(e.message, 'error'); }
}

function openAssignModal(uid, uname) {
  assigningUserId = uid;
  document.getElementById('assign-modal-user-name').textContent = 'Assigning to: ' + uname;
  const u = allUsers.find(x => x.id === uid);
  const list = document.getElementById('assign-modal-list');
  list.innerHTML = '';
  allServers.forEach(s => {
    const chip = document.createElement('div');
    chip.className = 'assign-chip'; chip.dataset.sid = s.id;
    chip.textContent = s.name;
    if (u && u.assigned_servers && u.assigned_servers.includes(s.id)) chip.classList.add('selected');
    chip.onclick = () => chip.classList.toggle('selected');
    list.appendChild(chip);
  });
  openModal('modal-assign');
}

async function saveAssign() {
  if (!assigningUserId) return;
  const server_ids = [...document.querySelectorAll('#assign-modal-list .assign-chip.selected')].map(c => c.dataset.sid);
  try {
    const r = await api(`/users/${assigningUserId}/assign`, 'POST', { server_ids });
    if (r.ok) { toast('Servers assigned!', 'success'); closeModal('modal-assign'); loadUsersPage(); }
    else toast(r.error || 'Failed', 'error');
  } catch(e) { toast(e.message, 'error'); }
}

async function deleteUser(uid, uname) {
  if (!confirm(`Delete user "${uname}"?`)) return;
  try {
    const r = await api(`/users/${uid}`, 'DELETE');
    if (r.ok) { toast('User deleted', 'info'); loadUsersPage(); }
    else toast(r.error || 'Failed', 'error');
  } catch(e) { toast(e.message, 'error'); }
}

async function doBackupNow() {
  toast('Backup chal raha hai...', 'info');
  try { const r = await api('/backup', 'POST'); toast(r.message || 'Backup done!', 'success'); }
  catch(e) { toast('Backup failed: ' + e.message, 'error'); }
}

async function ping() {
  try { const r = await api('/ping'); toast(`Connected! Uptime: ${Math.floor(r.uptime)}s`, 'success'); }
  catch(e) { toast('Connection failed: ' + e.message, 'error'); }
}

function refreshAll() { loadDashboard(); toast('Refreshed', 'info'); }

function toast(msg, type='info') {
  const icons = { success: '✓', error: '✕', info: 'i' };
  const el = document.createElement('div'); el.className = 'toast ' + type;
  el.innerHTML = `<span class="t-ico ${type}" style="font-weight:700;font-size:12px">${icons[type]||'i'}</span><span>${msg}</span>`;
  document.getElementById('toast-container').appendChild(el);
  setTimeout(() => { el.style.animation = 'tOut .3s ease forwards'; setTimeout(() => el.remove(), 300); }, 3000);
}

async function initPanel() {
  try {
    const r = await api('/ping');
    SESSION_ROLE = r.role || SESSION_ROLE;
    SESSION_ID   = r.id   || SESSION_ID;
    document.getElementById('sidebar-name').textContent   = r.user  || 'User';
    document.getElementById('sidebar-role').textContent   = roleLabel(r.role);
    document.getElementById('sidebar-avatar').textContent = (r.user || 'U')[0].toUpperCase();
    document.getElementById('conn-dot').className   = 'dot green';
    document.getElementById('conn-label').textContent = 'Connected';
    applyRoleUI(r.role);
    if (r.role === 'superadmin') { allUsers = await api('/users'); }
    loadDashboard();
  } catch(e) {
    document.getElementById('conn-dot').className   = 'dot red';
    document.getElementById('conn-label').textContent = 'Offline';
    toast('Agent offline!', 'error');
  }
}

if (TOKEN) {
  document.getElementById('login-screen').classList.add('hidden');
  document.getElementById('main-layout').style.display = 'flex';
  initPanel();
}
</script>
</body>
</html>
HTMLEOF
success "Panel HTML written"

section "Step 6: Domain & SSL"

VPS_IP=$(curl -s ifconfig.me 2>/dev/null || hostname -I | awk '{print $1}')

if [ "$USE_SSL" = "true" ] && [ -n "$DOMAIN" ]; then
  info "Configuring Caddy for $DOMAIN..."
  cat > /etc/caddy/Caddyfile << CADDYEOF
$DOMAIN {
    reverse_proxy localhost:$WP
}
CADDYEOF
  systemctl enable caddy > /dev/null 2>&1
  systemctl restart caddy > /dev/null 2>&1
  sleep 2
  if systemctl is-active --quiet caddy; then
    success "Caddy running — SSL issuing for $DOMAIN"
    PANEL_URL="https://$DOMAIN"
  else
    warn "Caddy start failed — check: systemctl status caddy"
    PANEL_URL="http://$VPS_IP:$WP"
  fi
else
  systemctl stop caddy  > /dev/null 2>&1 || true
  systemctl disable caddy > /dev/null 2>&1 || true
  PANEL_URL="http://$VPS_IP:$WP"
fi
success "Web setup done"

section "Step 7: Starting Panel"

info "Installing npm packages..."
cd "$DIR" && npm init -y > /dev/null 2>&1
success "npm ready"

info "Starting via PM2..."
pm2 delete saypanel-agent > /dev/null 2>&1 || true
pm2 start "$DIR/index.js" --name saypanel-agent
pm2 save > /dev/null 2>&1
pm2 startup 2>/dev/null | grep "sudo" | bash > /dev/null 2>&1 || true
success "PM2 running"

section "Step 8: Restore Script"

cat > /opt/saypanel/restore.sh << 'RESTOREEOF'
#!/bin/bash
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; BOLD='\033[1m'; RESET='\033[0m'
info()    { echo -e "${CYAN}[INFO]${RESET}  $1"; }
success() { echo -e "${GREEN}[OK]${RESET}    $1"; }
error()   { echo -e "${RED}[FAIL]${RESET} $1"; exit 1; }
ask()     { echo -ne "${YELLOW}[?]${RESET}    $1 "; }
clear
echo -e "${CYAN} SayPanel v3.0 — Restore${RESET}"
echo ""
[ "$EUID" -ne 0 ] && error "Root required!"
info "Installing packages..."
apt-get update -qq > /dev/null 2>&1
curl -fsSL https://deb.nodesource.com/setup_20.x | bash - > /dev/null 2>&1
apt-get install -y nodejs > /dev/null 2>&1
npm i -g pm2 > /dev/null 2>&1
apt-get install -y debian-keyring debian-archive-keyring apt-transport-https > /dev/null 2>&1
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg 2>/dev/null
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list > /dev/null
apt-get update -qq > /dev/null 2>&1 && apt-get install -y caddy > /dev/null 2>&1
curl -s https://rclone.org/install.sh | bash > /dev/null 2>&1
success "Packages installed"
echo ""
echo -e "  ${YELLOW}[1]${RESET} Google Drive"
echo -e "  ${YELLOW}[2]${RESET} Local file"
echo ""
ask "Restore source [1/2]:"
read -r SRC
BACKUP_TAR=""
case "$SRC" in
  1)
    ask "rclone remote (default: saypanel-gdrive):"
    read -r RR; RR=${RR:-saypanel-gdrive}
    ask "rclone config chalein? (y/n):"
    read -r RC; [[ "$RC" =~ ^[Yy]$ ]] && rclone config
    LATEST=$(rclone ls "${RR}:SayPanel-Backups/" 2>/dev/null | sort | tail -1 | awk '{print $2}')
    [ -z "$LATEST" ] && error "Backup nahi mila!"
    rclone copy "${RR}:SayPanel-Backups/$LATEST" /tmp/
    BACKUP_TAR="/tmp/$LATEST"
    ;;
  2)
    ask "Backup .tar.gz file path:"
    read -r BACKUP_TAR
    ;;
esac
[ -z "$BACKUP_TAR" ] || [ ! -f "$BACKUP_TAR" ] && error "Backup file nahi mili!"
info "Restoring..."
mkdir -p /opt/saypanel/agent /opt/saypanel/web /opt/saypanel/servers /opt/saypanel/backups
tar -xzf "$BACKUP_TAR" -C /opt/saypanel/
success "Files restored"
CFG="/opt/saypanel/agent/config.json"
[ ! -f "$CFG" ] && error "config.json nahi mila!"
WP=$(node -e "const c=require('$CFG'); console.log(c.web_port||3000)")
DOMAIN=$(node -e "const c=require('$CFG'); console.log(c.domain||'')")
USE_SSL=$(node -e "const c=require('$CFG'); console.log(c.use_ssl||false)")
cd /opt/saypanel/agent && npm init -y > /dev/null 2>&1
if [ "$USE_SSL" = "true" ] && [ -n "$DOMAIN" ]; then
  cat > /etc/caddy/Caddyfile << CEOF
$DOMAIN {
    reverse_proxy localhost:$WP
}
CEOF
  systemctl enable caddy > /dev/null 2>&1
  systemctl restart caddy > /dev/null 2>&1
  PANEL_URL="https://$DOMAIN"
else
  PANEL_URL="http://$(curl -s ifconfig.me):$WP"
fi
pm2 delete saypanel-agent > /dev/null 2>&1 || true
pm2 start /opt/saypanel/agent/index.js --name saypanel-agent
pm2 save > /dev/null 2>&1
pm2 startup 2>/dev/null | grep "sudo" | bash > /dev/null 2>&1 || true
echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo -e "${GREEN}  SayPanel v3.0 Restore Complete!${RESET}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo ""
echo -e "  Panel:  ${CYAN}${PANEL_URL}${RESET}"
echo ""
RESTOREEOF
chmod +x /opt/saypanel/restore.sh
success "restore.sh written"

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo -e "${GREEN}        SayPanel v3.0 PREMIUM — Installed!${RESET}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo ""
echo -e "  ${BOLD}Panel URL:${RESET}     ${CYAN}${PANEL_URL}${RESET}"
echo -e "  ${BOLD}Login:${RESET}         ${SA_EMAIL}"
echo -e "  ${BOLD}Username:${RESET}      ${SA_USER}"
echo -e "  ${BOLD}Role:${RESET}          ${YELLOW}Super Admin${RESET}"
if [ -n "$DOMAIN" ]; then
echo -e "  ${BOLD}Domain:${RESET}        ${DOMAIN} (SSL auto)"
fi
echo ""
echo -e "  ${YELLOW}Roles:${RESET}"
echo -e "  ${CYAN}Super Admin${RESET}  — sab kuch, Users page, server create/delete"
echo -e "  ${CYAN}Sub-Admin${RESET}    — assigned servers start/stop/logs"
echo -e "  ${CYAN}User${RESET}         — sirf assigned servers logs dekh sakta hai"
echo ""
echo -e "  ${YELLOW}PM2 commands:${RESET}"
echo -e "  pm2 logs saypanel-agent"
echo -e "  pm2 restart saypanel-agent"
echo ""
echo -e "  ${BOLD}Browser mein kholo: ${CYAN}${PANEL_URL}${RESET}"
echo ""
