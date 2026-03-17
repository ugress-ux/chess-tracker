// ─────────────────────────────────────────────
// In-memory cache with TTL
// Architecture note: The interface here is designed to be
// drop-in replaceable with a Redis adapter in Phase 2.
// ─────────────────────────────────────────────

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
  cachedAt: number;
}

interface CacheStore {
  get<T>(key: string): CacheEntry<T> | null;
  set<T>(key: string, value: T, ttlSeconds: number): void;
  delete(key: string): void;
  clear(): void;
}

// Global singleton for Next.js (survives hot reloads in dev via globalThis)
const globalForCache = globalThis as unknown as {
  __chessTrackerCache?: Map<string, CacheEntry<unknown>>;
};

if (!globalForCache.__chessTrackerCache) {
  globalForCache.__chessTrackerCache = new Map();
}

const store = globalForCache.__chessTrackerCache;

export const cache: CacheStore = {
  get<T>(key: string): CacheEntry<T> | null {
    const entry = store.get(key) as CacheEntry<T> | undefined;
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      store.delete(key);
      return null;
    }
    return entry;
  },

  set<T>(key: string, value: T, ttlSeconds: number): void {
    const now = Date.now();
    store.set(key, {
      value,
      expiresAt: now + ttlSeconds * 1000,
      cachedAt: now,
    });
  },

  delete(key: string): void {
    store.delete(key);
  },

  clear(): void {
    store.clear();
  },
};

// ─────────────────────────────────────────────
// TTL constants (seconds)
// Conservative to respect Chess.com API limits.
// ─────────────────────────────────────────────

export const CACHE_TTL = {
  TOURNAMENT: 60,       // 1 minute for overview
  ROUND: 45,            // 45 seconds for round data
  GROUP: 30,            // 30 seconds for active group data
} as const;

// ─────────────────────────────────────────────
// Cache key builders
// ─────────────────────────────────────────────

export function tournamentCacheKey(slug: string): string {
  return `tournament:${slug}`;
}

export function roundCacheKey(slug: string, round: number): string {
  return `round:${slug}:${round}`;
}

export function groupCacheKey(slug: string, round: number, group: number): string {
  return `group:${slug}:${round}:${group}`;
}
