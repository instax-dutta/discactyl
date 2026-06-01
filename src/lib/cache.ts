import NodeCache from 'node-cache';

class Cache {
  private store: NodeCache;

  constructor() {
    this.store = new NodeCache({
      stdTTL: 30,
      checkperiod: 60,
    });
  }

  get<T>(key: string): T | undefined {
    return this.store.get<T>(key);
  }

  set<T>(key: string, value: T, ttl?: number): boolean {
    return this.store.set(key, value, ttl ?? 30);
  }

  del(key: string): number {
    return this.store.del(key);
  }

  delByPrefix(prefix: string): void {
    const keys = this.store.keys().filter(k => k.startsWith(prefix));
    if (keys.length > 0) {
      this.store.del(keys);
    }
  }

  flush(): void {
    this.store.flushAll();
  }
}

export const cache = new Cache();
