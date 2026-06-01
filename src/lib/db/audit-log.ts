import { getDb } from './index';

export type ActionResult = 'success' | 'failure';

export function addAuditLog(
  guildId: string | null,
  discordUserId: string,
  action: string,
  result: ActionResult,
  targetId?: string,
  targetName?: string,
  errorMessage?: string,
): void {
  const db = getDb();
  db.prepare(`
    INSERT INTO audit_log (guild_id, discord_user_id, action, target_id, target_name, result, error_message)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(guildId ?? 'dm', discordUserId, action, targetId ?? null, targetName ?? null, result, errorMessage ?? null);
}
