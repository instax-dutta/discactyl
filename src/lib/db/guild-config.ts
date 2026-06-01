import Database from 'better-sqlite3';
import { getDb } from './index';

export interface GuildConfig {
  guild_id: string;
  panel_url: string | null;
  admin_role_id: string | null;
  operator_role_id: string | null;
  viewer_role_id: string | null;
  created_at: number;
  updated_at: number;
}

export function getGuildConfig(guildId: string | null): GuildConfig | undefined {
  if (!guildId) return undefined;
  const db = getDb();
  return db.prepare('SELECT * FROM guild_config WHERE guild_id = ?').get(guildId) as GuildConfig | undefined;
}

export function upsertGuildConfig(guildId: string, config: Partial<Omit<GuildConfig, 'guild_id' | 'created_at' | 'updated_at'>>): void {
  const db = getDb();
  const existing = getGuildConfig(guildId);
  if (existing) {
    const updates: string[] = [];
    const values: any[] = [];
    for (const [key, value] of Object.entries(config)) {
      if (value !== undefined) {
        updates.push(`${key} = ?`);
        values.push(value);
      }
    }
    updates.push('updated_at = unixepoch()');
    values.push(guildId);
    db.prepare(`UPDATE guild_config SET ${updates.join(', ')} WHERE guild_id = ?`).run(...values);
  } else {
    db.prepare(`
      INSERT INTO guild_config (guild_id, panel_url, admin_role_id, operator_role_id, viewer_role_id)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      guildId,
      config.panel_url ?? null,
      config.admin_role_id ?? null,
      config.operator_role_id ?? null,
      config.viewer_role_id ?? null,
    );
  }
}
