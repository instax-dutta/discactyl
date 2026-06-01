import { AxiosInstance } from 'axios';
import { env } from '../../config/env';
import { createClient, withRetry, parseError } from './retry';
import type {
  ApiListResponse,
  ServerAttributes,
  UserAttributes,
  NodeAttributes,
  AllocationAttributes,
} from './types';
import { logger } from '../logger';
import { cache } from '../cache';

export class ApplicationClient {
  private client: AxiosInstance;

  constructor() {
    this.client = createClient(
      `${env.PTERODACTYL_URL}/api/application`,
      env.PTERODACTYL_APPLICATION_KEY,
    );
  }

  async listServers(page = 1): Promise<{ servers: ServerAttributes[]; meta: { pagination: any } }> {
    const cacheKey = `servers:all:page:${page}`;
    const cached = cache.get<{ servers: ServerAttributes[]; meta: { pagination: any } }>(cacheKey);
    if (cached) return cached;

    const res = await withRetry(() =>
      this.client.get<ApiListResponse<ServerAttributes>>(`/servers?page=${page}&per_page=50`),
    );
    const result = {
      servers: res.data.data.map(d => d.attributes),
      meta: res.data.meta,
    };
    cache.set(cacheKey, result, env.CACHE_TTL_SERVERS);
    return result;
  }

  async getServer(id: number): Promise<ServerAttributes> {
    const cacheKey = `server:${id}`;
    const cached = cache.get<ServerAttributes>(cacheKey);
    if (cached) return cached;

    const res = await withRetry(() =>
      this.client.get<{ attributes: ServerAttributes }>(`/servers/${id}`),
    );
    cache.set(res.data.attributes.uuid, res.data.attributes, env.CACHE_TTL_SERVERS);
    return res.data.attributes;
  }

  async createServer(data: {
    name: string;
    user: number;
    egg: number;
    docker_image: string;
    startup: string;
    environment: Record<string, string>;
    limits: { memory: number; swap: number; disk: number; io: number; cpu: number };
    feature_limits: { databases: number; allocations: number; backups: number };
    allocation: { default: number };
  }): Promise<ServerAttributes> {
    const res = await withRetry(() =>
      this.client.post<{ attributes: ServerAttributes }>('/servers', data),
    );
    cache.delByPrefix('servers:all');
    return res.data.attributes;
  }

  async deleteServer(id: number, force = false): Promise<void> {
    const path = force ? `/servers/${id}/force` : `/servers/${id}`;
    await withRetry(() => this.client.delete(path));
    cache.delByPrefix('servers:all');
    cache.del(`server:${id}`);
  }

  async listUsers(page = 1): Promise<{ users: UserAttributes[]; meta: { pagination: any } }> {
    const cacheKey = `users:all:page:${page}`;
    const cached = cache.get<{ users: UserAttributes[]; meta: { pagination: any } }>(cacheKey);
    if (cached) return cached;

    const res = await withRetry(() =>
      this.client.get<ApiListResponse<UserAttributes>>(`/users?page=${page}&per_page=50`),
    );
    const result = {
      users: res.data.data.map(d => d.attributes),
      meta: res.data.meta,
    };
    cache.set(cacheKey, result, env.CACHE_TTL_SERVERS);
    return result;
  }

  async getUser(id: number): Promise<UserAttributes> {
    const res = await withRetry(() =>
      this.client.get<{ attributes: UserAttributes }>(`/users/${id}`),
    );
    return res.data.attributes;
  }

  async createUser(data: {
    email: string;
    username: string;
    first_name: string;
    last_name: string;
    password: string;
  }): Promise<UserAttributes> {
    const res = await withRetry(() =>
      this.client.post<{ attributes: UserAttributes }>('/users', data),
    );
    cache.delByPrefix('users:all');
    return res.data.attributes;
  }

  async deleteUser(id: number): Promise<void> {
    await withRetry(() => this.client.delete(`/users/${id}`));
    cache.delByPrefix('users:all');
  }

  async listNodes(page = 1): Promise<{ nodes: NodeAttributes[]; meta: { pagination: any } }> {
    const cacheKey = `nodes:all:page:${page}`;
    const cached = cache.get<{ nodes: NodeAttributes[]; meta: { pagination: any } }>(cacheKey);
    if (cached) return cached;

    const res = await withRetry(() =>
      this.client.get<ApiListResponse<NodeAttributes>>(`/nodes?page=${page}&per_page=50`),
    );
    const result = {
      nodes: res.data.data.map(d => d.attributes),
      meta: res.data.meta,
    };
    cache.set(cacheKey, result, env.CACHE_TTL_NODES);
    return result;
  }

  async getNode(id: number): Promise<NodeAttributes> {
    const cacheKey = `node:${id}`;
    const cached = cache.get<NodeAttributes>(cacheKey);
    if (cached) return cached;

    const res = await withRetry(() =>
      this.client.get<{ attributes: NodeAttributes }>(`/nodes/${id}`),
    );
    cache.set(cacheKey, res.data.attributes, env.CACHE_TTL_NODES);
    return res.data.attributes;
  }

  async listAllocations(nodeId: number, page = 1): Promise<{ allocations: AllocationAttributes[]; meta: { pagination: any } }> {
    const cacheKey = `allocations:${nodeId}:${page}`;
    const cached = cache.get<{ allocations: AllocationAttributes[]; meta: { pagination: any } }>(cacheKey);
    if (cached) return cached;

    const res = await withRetry(() =>
      this.client.get<ApiListResponse<AllocationAttributes>>(`/nodes/${nodeId}/allocations?page=${page}&per_page=50`),
    );
    const result = {
      allocations: res.data.data.map(d => d.attributes),
      meta: res.data.meta,
    };
    cache.set(cacheKey, result, env.CACHE_TTL_NODES);
    return result;
  }
}

export const applicationClient = new ApplicationClient();
