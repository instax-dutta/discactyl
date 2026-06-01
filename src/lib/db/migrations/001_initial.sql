CREATE TABLE IF NOT EXISTS guild_config (
  guild_id        TEXT PRIMARY KEY,
  panel_url       TEXT,
  admin_role_id   TEXT,
  operator_role_id TEXT,
  viewer_role_id  TEXT,
  created_at      INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at      INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS user_links (
  discord_user_id   TEXT PRIMARY KEY,
  pterodactyl_user_id INTEGER NOT NULL,
  encrypted_api_key  TEXT NOT NULL,
  iv                TEXT NOT NULL,
  auth_tag          TEXT NOT NULL,
  linked_at         INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at        INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS server_permissions (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  discord_user_id   TEXT NOT NULL,
  pterodactyl_server_id TEXT NOT NULL,
  permission_level  TEXT NOT NULL CHECK (permission_level IN ('view', 'operate', 'admin')),
  granted_by        TEXT NOT NULL,
  granted_at        INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_server_perm_user_server
  ON server_permissions(discord_user_id, pterodactyl_server_id);

CREATE TABLE IF NOT EXISTS audit_log (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  guild_id        TEXT NOT NULL,
  discord_user_id TEXT NOT NULL,
  action          TEXT NOT NULL,
  target_id       TEXT,
  target_name     TEXT,
  result          TEXT NOT NULL CHECK (result IN ('success', 'failure')),
  error_message   TEXT,
  created_at      INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_audit_guild ON audit_log(guild_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_user  ON audit_log(discord_user_id, created_at DESC);
