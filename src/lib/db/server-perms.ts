import Database from 'better-sqlite3';
import { getDb } from './index';

export type PermissionLevel = 'view' | 'operate' | 'admin';

export interface ServerPermission {
  id: number;
  discord_user_id: string;
  pterodactyl_server_id: string;
  permission_level: PermissionLevel;
  granted_by: string;
  granted_at: number;
}

export function getServerPermission(discordUserId: string, serverId: string): ServerPermission | undefined {
  const db = getDb();
  return db.prepare(
    'SELECT * FROM server_permissions WHERE discord_user_id = ? AND pterodactyl_server_id = ?',
  ).get(discordUserId, serverId) as ServerPermission | undefined;
}

export function setServerPermission(
  discordUserId: string,
  serverId: string,
  level: PermissionLevel,
  grantedBy: string,
): void {
  const db = getDb();
  const existing = getServerPermission(discordUserId, serverId);
  if (existing) {
    db.prepare(
      'UPDATE server_permissions SET permission_level = ?, granted_by = ? WHERE id = ?',
    ).run(level, grantedBy, existing.id);
  } else {
    db.prepare(
      'INSERT INTO server_permissions (discord_user_id, pterodactyl_server_id, permission_level, granted_by) VALUES (?, ?, ?, ?)',
    ).run(discordUserId, serverId, level, grantedBy);
  }
}

export function removeServerPermission(discordUserId: string, serverId: string): void {
  const db = getDb();
  db.prepare(
    'DELETE FROM server_permissions WHERE discord_user_id = ? AND pterodactyl_server_id = ?',
  ).run(discordUserId, serverId);
}

export function getUserServerPermissions(discordUserId: string): ServerPermission[] {
  const db = getDb();
  return db.prepare(
    'SELECT * FROM server_permissions WHERE discord_user_id = ?',
  ).all(discordUserId) as ServerPermission[];
}
