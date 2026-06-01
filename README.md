# Discactyl

Discord bot for full Pterodactyl Panel control via slash commands and interactive components.

## Features

- **Server Management** — List, status, power control (start/stop/restart/kill), create, delete, console commands, backups
- **User Management** — List, create, delete Pterodactyl users
- **Node Monitoring** — List nodes, view resource allocation
- **Account Linking** — Link Discord ↔ Pterodactyl accounts for personalized API access
- **Role-Based Permissions** — Admin/Operator/Viewer role mapping via Discord roles
- **Interactive UX** — Buttons, modals, ephemeral responses, pagination

## Commands

| Command | Description | Required Role |
|---------|-------------|---------------|
| `/server list` | List all servers | Viewer+ |
| `/server status <server>` | View detailed server status | Viewer+ |
| `/server start\|stop\|restart <server>` | Power control | Operator+ |
| `/server kill <server>` | Force kill | Admin |
| `/server create` | Create new server (modal) | Admin |
| `/server delete <server>` | Delete server (modal confirmation) | Admin |
| `/server console <server> [command] [lines]` | Send commands / view logs | Operator+ |
| `/server backup <server> <action> [name]` | List/create backups | Operator+ |
| `/user list` | List all users | Admin |
| `/user create` | Create user (modal) | Admin |
| `/user delete <user>` | Delete user | Admin |
| `/node list` | List all nodes | Admin |
| `/node status <node_id>` | View node details | Admin |
| `/account link <api_key>` | Link your Pterodactyl account | Anyone |
| `/account unlink` | Unlink account | Anyone |
| `/account view` | View linked account | Anyone |
| `/config view` | View guild config | ManageGuild |
| `/config set-*-role <role>` | Set permission roles | ManageGuild |

## Setup

```bash
# Clone and install
git clone https://github.com/youruser/discactyl
cd discactyl
npm install

# Configure
cp .env.example .env
# Edit .env with your Discord bot token and Pterodactyl credentials

# Generate encryption secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Register commands (dev guild for instant updates)
npm run deploy:dev

# Start
npm run dev          # Development with auto-reload
npm run build && npm start  # Production
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DISCORD_TOKEN` | Bot token from Discord Developer Portal |
| `DISCORD_CLIENT_ID` | Application ID |
| `DISCORD_GUILD_ID` | Guild ID for dev command registration |
| `PTERODACTYL_URL` | Panel base URL (no trailing slash) |
| `PTERODACTYL_APPLICATION_KEY` | Application API key (admin) |
| `PTERODACTYL_CLIENT_KEY` | Global Client API key (fallback) |
| `API_KEY_ENCRYPTION_SECRET` | 32-byte hex for AES-256-GCM |

## Deployment

### Docker

```bash
npm run build
docker compose up -d
```

### PM2

```bash
npm run build
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## Tech Stack

- **Runtime:** Node.js 20+
- **Discord:** discord.js v14 (Component V2)
- **HTTP:** axios with retry/backoff
- **Database:** SQLite (better-sqlite3)
- **Cache:** node-cache with TTLs
- **Encryption:** AES-256-GCM (Node.js crypto)
- **Logging:** pino
