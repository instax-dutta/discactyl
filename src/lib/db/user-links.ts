import Database from 'better-sqlite3';
import { getDb } from './index';

export interface UserLink {
  discord_user_id: string;
  pterodactyl_user_id: number;
  encrypted_api_key: string;
  iv: string;
  auth_tag: string;
  linked_at: number;
  updated_at: number;
}

export function getUserLink(discordUserId: string): UserLink | undefined {
  const db = getDb();
  return db.prepare('SELECT * FROM user_links WHERE discord_user_id = ?').get(discordUserId) as UserLink | undefined;
}

export function upsertUserLink(
  discordUserId: string,
  pterodactylUserId: number,
  encryptedApiKey: string,
  iv: string,
  authTag: string,
): void {
  const db = getDb();
  const existing = getUserLink(discordUserId);
  if (existing) {
    db.prepare(`
      UPDATE user_links SET pterodactyl_user_id = ?, encrypted_api_key = ?, iv = ?, auth_tag = ?, updated_at = unixepoch()
      WHERE discord_user_id = ?
    `).run(pterodactylUserId, encryptedApiKey, iv, authTag, discordUserId);
  } else {
    db.prepare(`
      INSERT INTO user_links (discord_user_id, pterodactyl_user_id, encrypted_api_key, iv, auth_tag)
      VALUES (?, ?, ?, ?, ?)
    `).run(discordUserId, pterodactylUserId, encryptedApiKey, iv, authTag);
  }
}

export function deleteUserLink(discordUserId: string): void {
  const db = getDb();
  db.prepare('DELETE FROM user_links WHERE discord_user_id = ?').run(discordUserId);
}
