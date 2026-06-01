import { ChatInputCommandInteraction, GuildMember } from 'discord.js';
import { getGuildConfig } from './db/guild-config';
import { getServerPermission } from './db/server-perms';
import { cache } from './cache';
import { env } from '../config/env';
import type { BotRole } from '../types/pterodactyl';
import type { PermissionLevel } from './db/server-perms';

function memberHasRole(member: GuildMember, roleId: string | null): boolean {
  if (!roleId) return false;
  return member.roles.cache.has(roleId);
}

function getCachedGuildConfig(guildId: string) {
  const cacheKey = `guild:${guildId}:config`;
  const cached = cache.get<ReturnType<typeof getGuildConfig>>(cacheKey);
  if (cached) return cached;

  const config = getGuildConfig(guildId);
  if (config) cache.set(cacheKey, config, env.CACHE_TTL_GUILD_CONFIG);
  return config;
}

export function getEffectiveRole(member: GuildMember): BotRole {
  const config = getCachedGuildConfig(member.guild.id);

  if (member.permissions.has('Administrator') || member.permissions.has('ManageGuild')) {
    return 'admin';
  }
  if (config && memberHasRole(member, config.admin_role_id)) return 'admin';
  if (config && memberHasRole(member, config.operator_role_id)) return 'operator';
  if (config && memberHasRole(member, config.viewer_role_id)) return 'viewer';

  return 'none';
}

export function requireRole(required: BotRole): (member: GuildMember) => { allowed: boolean; role: BotRole } {
  return (member: GuildMember) => {
    const role = getEffectiveRole(member);
    const hierarchy: BotRole[] = ['admin', 'operator', 'viewer', 'none'];
    const requiredIndex = hierarchy.indexOf(required);
    const userIndex = hierarchy.indexOf(role);

    return {
      allowed: userIndex <= requiredIndex && role !== 'none',
      role,
    };
  };
}

export function checkServerPermission(
  member: GuildMember,
  serverId: string,
  requiredLevel: PermissionLevel,
): boolean {
  const effectiveRole = getEffectiveRole(member);
  if (effectiveRole === 'admin') return true;

  const perm = getServerPermission(member.id, serverId);
  if (!perm) return effectiveRole === 'operator';

  const levelHierarchy: PermissionLevel[] = ['view', 'operate', 'admin'];
  const requiredIdx = levelHierarchy.indexOf(requiredLevel);
  const userIdx = levelHierarchy.indexOf(perm.permission_level);

  return userIdx >= requiredIdx;
}
