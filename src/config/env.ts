import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

function required(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

function optional(key: string, defaultValue: string): string {
  return process.env[key] || defaultValue;
}

function int(key: string, defaultValue: number): number {
  const val = process.env[key];
  return val ? parseInt(val, 10) : defaultValue;
}

export const env = {
  DISCORD_TOKEN: required('DISCORD_TOKEN'),
  DISCORD_CLIENT_ID: required('DISCORD_CLIENT_ID'),
  DISCORD_GUILD_ID: optional('DISCORD_GUILD_ID', ''),

  PTERODACTYL_URL: required('PTERODACTYL_URL').replace(/\/+$/, ''),
  PTERODACTYL_APPLICATION_KEY: required('PTERODACTYL_APPLICATION_KEY'),
  PTERODACTYL_CLIENT_KEY: required('PTERODACTYL_CLIENT_KEY'),

  API_KEY_ENCRYPTION_SECRET: required('API_KEY_ENCRYPTION_SECRET'),

  DATABASE_PATH: path.resolve(optional('DATABASE_PATH', './data/discactyl.db')),

  LOG_LEVEL: optional('LOG_LEVEL', 'info'),
  NODE_ENV: optional('NODE_ENV', 'production'),

  CACHE_TTL_SERVERS: int('CACHE_TTL_SERVERS', 30),
  CACHE_TTL_NODES: int('CACHE_TTL_NODES', 60),
  CACHE_TTL_GUILD_CONFIG: int('CACHE_TTL_GUILD_CONFIG', 60),
} as const;
