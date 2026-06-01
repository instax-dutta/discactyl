import { AxiosInstance } from 'axios';
import { env } from '../../config/env';
import { createClient, withRetry } from './retry';
import { decrypt, EncryptedData } from '../encrypt';
import { getUserLink } from '../db/user-links';
import type {
  ClientServerAttributes,
  ServerResources,
  BackupAttributes,
  AccountAttributes,
  ApiListResponse,
} from './types';
import { logger } from '../logger';
import { cache } from '../cache';

export class ClientApi {
  async getClientForUser(discordUserId: string): Promise<AxiosInstance> {
    const link = getUserLink(discordUserId);
    let apiKey: string;
    if (link) {
      apiKey = decrypt({
        encrypted: link.encrypted_api_key,
        iv: link.iv,
        authTag: link.auth_tag,
      } as EncryptedData);
    } else {
      apiKey = env.PTERODACTYL_CLIENT_KEY;
    }
    return createClient(`${env.PTERODACTYL_URL}/api/client`, apiKey);
  }

  async getAccount(discordUserId: string): Promise<AccountAttributes> {
    const client = await this.getClientForUser(discordUserId);
    const res = await withRetry(() =>
      client.get<{ attributes: AccountAttributes }>('/account'),
    );
    return res.data.attributes;
  }

  async validateApiKey(apiKey: string): Promise<AccountAttributes> {
    const client = createClient(`${env.PTERODACTYL_URL}/api/client`, apiKey);
    const res = await withRetry(() =>
      client.get<{ attributes: AccountAttributes }>('/account'),
    );
    return res.data.attributes;
  }

  async listServers(discordUserId: string, page = 1): Promise<{ servers: ClientServerAttributes[]; meta: { pagination: any } }> {
    const cacheKey = `client:servers:${discordUserId}:${page}`;
    const cached = cache.get<{ servers: ClientServerAttributes[]; meta: { pagination: any } }>(cacheKey);
    if (cached) return cached;

    const client = await this.getClientForUser(discordUserId);
    const res = await withRetry(() =>
      client.get<ApiListResponse<ClientServerAttributes>>(`?page=${page}`),
    );
    const result = {
      servers: res.data.data.map(d => d.attributes),
      meta: res.data.meta,
    };
    cache.set(cacheKey, result, env.CACHE_TTL_SERVERS);
    return result;
  }

  async getServerResources(discordUserId: string, identifier: string): Promise<ServerResources> {
    const cacheKey = `client:server:${identifier}:resources`;
    const cached = cache.get<ServerResources>(cacheKey);
    if (cached) return cached;

    const client = await this.getClientForUser(discordUserId);
    const res = await withRetry(() =>
      client.get<{ attributes: ServerResources }>(`/servers/${identifier}/resources`),
    );
    cache.set(cacheKey, res.data.attributes, 15);
    return res.data.attributes;
  }

  async sendPowerAction(discordUserId: string, identifier: string, signal: 'start' | 'stop' | 'restart' | 'kill'): Promise<void> {
    const client = await this.getClientForUser(discordUserId);
    await withRetry(() =>
      client.post(`/servers/${identifier}/power`, { signal }),
    );
    cache.del(`client:server:${identifier}:resources`);
  }

  async sendConsoleCommand(discordUserId: string, identifier: string, command: string): Promise<void> {
    const client = await this.getClientForUser(discordUserId);
    await withRetry(() =>
      client.post(`/servers/${identifier}/command`, { command }),
    );
  }

  async listBackups(discordUserId: string, identifier: string): Promise<BackupAttributes[]> {
    const client = await this.getClientForUser(discordUserId);
    const res = await withRetry(() =>
      client.get<ApiListResponse<BackupAttributes>>(`/servers/${identifier}/backups`),
    );
    return res.data.data.map(d => d.attributes);
  }

  async createBackup(discordUserId: string, identifier: string, name?: string): Promise<BackupAttributes> {
    const client = await this.getClientForUser(discordUserId);
    const body = name ? { name } : {};
    const res = await withRetry(() =>
      client.post<{ attributes: BackupAttributes }>(`/servers/${identifier}/backups`, body),
    );
    return res.data.attributes;
  }
}

export const clientApi = new ClientApi();
