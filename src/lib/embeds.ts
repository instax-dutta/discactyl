import { EmbedBuilder, ColorResolvable } from 'discord.js';

const STATUS_COLORS: Record<string, ColorResolvable> = {
  running: 0x22c55e,
  starting: 0xfacc15,
  stopping: 0xf97316,
  offline: 0xef4444,
};

export function statusColor(state: string): ColorResolvable {
  return STATUS_COLORS[state] || 0x6b7280;
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export function formatUptime(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours % 24 > 0) parts.push(`${hours % 24}h`);
  if (minutes % 60 > 0) parts.push(`${minutes % 60}m`);
  if (seconds % 60 > 0 && parts.length === 0) parts.push(`${seconds % 60}s`);

  return parts.join(' ') || '0s';
}

export function successEmbed(title: string, description?: string): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(0x22c55e)
    .setTitle(title)
    .setDescription(description ?? null)
    .setTimestamp();
}

export function errorEmbed(title: string, description?: string): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(0xef4444)
    .setTitle(title)
    .setDescription(description ?? null)
    .setTimestamp();
}

export function infoEmbed(title: string, description?: string): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(0x3b82f6)
    .setTitle(title)
    .setDescription(description ?? null)
    .setTimestamp();
}
