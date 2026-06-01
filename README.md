# Discactyl

Stop switching tabs. Control your entire Pterodactyl panel directly from Discord.

Power your server, manage users, monitor nodes, and run backups — all through slash commands and interactive components. It feels like a first-party Discord feature because it should.

## Your Servers, In Discord

| Before (Panel Tabs) | After (Discord) |
|---------------------|-----------------|
| Open panel, log in, navigate menus | `/server status abc123` |
| Tab between 10 server pages | Paginated embeds with buttons |
| Context-switch cost every time | All actions in your chat sidebar |
| Share screenshots to show status | Live resource embeds anyone can see |

**The panel is still there. You just won't need it as much.**

## What You Gain

- **Server Control** — Start, stop, restart, or force-kill any server with a single command or button press. No panel login required.
- **Console Access** — Send commands directly from Discord. No SSH, no terminal, no context switch.
- **Backup Management** — List and create backups on the spot. Because forgetting costs you everything.
- **User & Node Oversight** — Create and delete Pterodactyl users, inspect node resources, all while staying in your conversation flow.
- **Account Linking** — Link your own Pterodactyl API key for personalized access. Your key, your permissions, your servers.
- **Role-Based Access** — Map Discord roles to permission levels. Decide who can view, operate, or admin. Everyone else stays out.

## Commands

| Command | What It Does | Who Can Use It |
|---------|-------------|---------------|
| `/server list` | Browse all servers, paginated | Viewer+ |
| `/server status <server>` | Live CPU, RAM, disk, uptime | Viewer+ |
| `/server start\|stop\|restart <server>` | One-command power control | Operator+ |
| `/server kill <server>` | Force-kill frozen servers | Admin |
| `/server create` | Provision a new server via modal | Admin |
| `/server delete <server>` | Destroy a server (confirmation required) | Admin |
| `/server console <server> [command]` | Execute commands remotely | Operator+ |
| `/server backup <server> list\|create` | Protect your data | Operator+ |
| `/user list\|create\|delete` | Full user lifecycle management | Admin |
| `/node list\|status <id>` | Infrastructure monitoring | Admin |
| `/account link\|unlink\|view` | Connect your Pterodactyl identity | Anyone |
| `/config view\|set-*-role <role>` | Wire up Discord roles to permissions | ManageGuild |

## Start In Under a Minute

```bash
git clone https://github.com/youruser/discactyl
cd discactyl
npm install
cp .env.example .env
npm run deploy:dev
npm run dev
```

That's it. Your panel, now in your Discord.

### Production in Two Commands

```bash
npm run build && npm start
```

Or with Docker:
```bash
docker compose up -d
```

## Built to Last

| Concern | How It's Handled |
|---------|-----------------|
| **Rate limits** | Exponential backoff with 3 retries |
| **API failures** | Graceful degradation, user-facing error messages |
| **Secrets** | AES-256-GCM encrypted at rest |
| **Destructive actions** | Modal confirmation required every time |
| **Permission leaks** | Four-tier role system with per-server overrides |
| **State** | TTL-based cache + SQLite persistence |
| **Logging** | Structured pino logs (trace → error) |
| **Observability** | Full audit trail of every sensitive action |

## Environment

| Variable | Why You Need It |
|----------|-----------------|
| `DISCORD_TOKEN` | Bot token from Discord Developer Portal |
| `DISCORD_CLIENT_ID` | Your application's client ID |
| `DISCORD_GUILD_ID` | Dev guild for instant command registration |
| `PTERODACTYL_URL` | Your panel base URL |
| `PTERODACTYL_APPLICATION_KEY` | For admin-level server and user operations |
| `PTERODACTYL_CLIENT_KEY` | Fallback for client-level actions |
| `API_KEY_ENCRYPTION_SECRET` | 32-byte hex key — generate with `crypto.randomBytes(32).toString('hex')` |

## What's Under the Hood

**Node.js 20+** · **discord.js v14** (Component V2) · **axios** with retry/backoff · **SQLite** (better-sqlite3) · **AES-256-GCM** (Node crypto) · **node-cache** · **pino** · **TypeScript** · **Jest** · **Docker** · **PM2**

---

**Stop leaving Discord to manage your servers.** [Get started](#start-in-under-a-minute) — you're one `npm install` away from never opening your panel again.
