/**
 * Simple in-memory TTL (Time To Live) cache
 * Perfect for caching expensive API results like web searches and research data
 */

interface CacheEntry<T> {
  data: T;
  expires: number;
}

export class TTLCache<T> {
  private cache = new Map<string, CacheEntry<T>>();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(cleanupIntervalMs: number = 60000) {
    // Run cleanup every minute to remove expired entries
    this.cleanupInterval = setInterval(() => this.cleanup(), cleanupIntervalMs);
  }

  /**
   * Store a value in the cache with a TTL
   * @param key Cache key
   * @param value Data to cache
   * @param ttlMs Time to live in milliseconds
   */
  set(key: string, value: T, ttlMs: number): void {
    this.cache.set(key, {
      data: value,
      expires: Date.now() + ttlMs,
    });
  }

  /**
   * Retrieve a value from the cache
   * @param key Cache key
   * @returns The cached value or null if expired/not found
   */
  get(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check if expired
    if (Date.now() > entry.expires) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  /**
   * Check if a key exists and is not expired
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Delete a specific key
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Clear all cached data
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get current cache size
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Remove expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expires) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Destroy the cache and stop cleanup interval
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.clear();
  }
}

// Predefined cache instances for different use cases
export const paintLocationCache = new TTLCache<{
  locations: string[];
  sources: string[];
  researched: boolean;
}>();

export const eraContentCache = new TTLCache<{
  article?: { title: string; url: string; snippet: string };
  video?: { title: string; videoId: string; url: string; thumbnail: string };
  researched: boolean;
}>();

export const webSearchCache = new TTLCache<Array<{
  title: string;
  snippet: string;
  url: string;
}>>();

/**
 * Generate cache keys for consistent lookups
 */
export const cacheKeys = {
  paintLocation: (brand: string, model: string, year: number) =>
    `loc:${brand}:${model}:${year}`.toLowerCase().replace(/\s+/g, '-'),

  eraContent: (brand: string, model: string, repairType: string) =>
    `era:${brand}:${model}:${repairType}`.toLowerCase().replace(/\s+/g, '-'),

  webSearch: (query: string) =>
    `search:${query}`.toLowerCase(),
};
