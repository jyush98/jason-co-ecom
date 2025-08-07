// lib/stores/apiStore.ts

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

// Cache entry structure
interface ApiCacheEntry<T> {
    data: T;
    timestamp: number;
    expiresAt: number;
    etag?: string;
    lastModified?: string;
    hitCount: number;
}

// Request tracking
interface PendingRequest {
    promise: Promise<any>;
    abortController: AbortController;
    timestamp: number;
}

// Cache statistics
interface CacheStats {
    totalEntries: number;
    totalHits: number;
    totalMisses: number;
    hitRate: number;
    memoryUsage: number;
    oldestEntry?: number;
    newestEntry?: number;
}

// Request statistics interface
interface RequestStats {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    cacheHits: number;
    cacheMisses: number;
    averageResponseTime: number;
}

interface ApiState {
    // Cache management
    cache: Map<string, ApiCacheEntry<any>>;

    // Request tracking
    pendingRequests: Map<string, PendingRequest>;
    requestErrors: Map<string, string>;

    // Configuration
    config: {
        defaultTTL: number; // Default time to live in milliseconds
        maxCacheSize: number; // Maximum number of cache entries
        maxRequestTimeout: number; // Maximum request timeout
        enableEtagCaching: boolean; // Enable ETag-based caching
        enableCompression: boolean; // Enable response compression
        enableDeduplication: boolean; // Enable request deduplication
    };

    // Statistics
    stats: RequestStats;

    // Cache operations
    getCached: <T>(key: string, maxAge?: number) => T | null;
    setCached: <T>(key: string, data: T, ttl?: number, metadata?: Partial<Pick<ApiCacheEntry<T>, 'etag' | 'lastModified'>>) => void;
    invalidateCache: (pattern?: string | RegExp) => number;
    isCacheValid: (key: string, maxAge?: number) => boolean;

    // Request state management
    setRequestPending: (key: string, promise: Promise<any>, abortController: AbortController) => void;
    setRequestComplete: (key: string, success: boolean, responseTime?: number) => void;
    setRequestError: (key: string, error: string) => void;
    cancelRequest: (key: string) => boolean;
    isPendingRequest: (key: string) => boolean;
    getPendingRequest: (key: string) => Promise<any> | null;

    // Cache management
    clearExpired: () => number;
    clearAll: () => void;
    pruneLRU: (targetSize?: number) => number;

    // Statistics and monitoring
    getCacheStats: () => CacheStats;
    getRequestStats: () => RequestStats;
    resetStats: () => void;

    // Configuration
    updateConfig: (config: Partial<ApiState['config']>) => void;

    // Utilities
    generateCacheKey: (endpoint: string, params?: Record<string, any>) => string;
    warmCache: (keys: string[]) => Promise<void>;
}

export const useApiStore = create<ApiState>()(
    subscribeWithSelector(
        (set, get) => ({
            // Initial state
            cache: new Map(),
            pendingRequests: new Map(),
            requestErrors: new Map(),

            config: {
                defaultTTL: 300000, // 5 minutes
                maxCacheSize: 500, // Maximum cache entries
                maxRequestTimeout: 30000, // 30 seconds
                enableEtagCaching: true,
                enableCompression: false, // Not implemented yet
                enableDeduplication: true,
            },

            stats: {
                totalRequests: 0,
                successfulRequests: 0,
                failedRequests: 0,
                cacheHits: 0,
                cacheMisses: 0,
                averageResponseTime: 0,
            },

            // Cache operations
            getCached: <T>(key: string, maxAge?: number): T | null => {
                const state = get();
                const entry = state.cache.get(key);

                if (!entry) {
                    // Record cache miss
                    set(s => ({
                        stats: { ...s.stats, cacheMisses: s.stats.cacheMisses + 1 }
                    }));
                    return null;
                }

                // Check if cache entry is expired
                const now = Date.now();
                const isExpired = now > entry.expiresAt;
                const isStale = maxAge && (now - entry.timestamp) > maxAge;

                if (isExpired || isStale) {
                    // Remove expired entry
                    const newCache = new Map(state.cache);
                    newCache.delete(key);
                    set({ cache: newCache });

                    // Record cache miss
                    set(s => ({
                        stats: { ...s.stats, cacheMisses: s.stats.cacheMisses + 1 }
                    }));
                    return null;
                }

                // Update hit count and record cache hit
                const updatedEntry = { ...entry, hitCount: entry.hitCount + 1 };
                const newCache = new Map(state.cache);
                newCache.set(key, updatedEntry);

                set({
                    cache: newCache,
                    stats: { ...state.stats, cacheHits: state.stats.cacheHits + 1 }
                });

                console.log(`Cache hit: ${key}`);
                return entry.data;
            },

            setCached: <T>(key: string, data: T, ttl?: number, metadata?: Partial<Pick<ApiCacheEntry<T>, 'etag' | 'lastModified'>>) => {
                const state = get();
                const now = Date.now();
                const timeToLive = ttl || state.config.defaultTTL;

                const entry: ApiCacheEntry<T> = {
                    data,
                    timestamp: now,
                    expiresAt: now + timeToLive,
                    hitCount: 0,
                    ...metadata,
                };

                const newCache = new Map(state.cache);
                newCache.set(key, entry);

                // Check if we need to prune cache
                if (newCache.size > state.config.maxCacheSize) {
                    // Remove oldest entries first (LRU)
                    const sortedEntries = Array.from(newCache.entries())
                        .sort((a, b) => {
                            // Sort by hit count (ascending) then by timestamp (ascending)
                            const hitDiff = a[1].hitCount - b[1].hitCount;
                            return hitDiff !== 0 ? hitDiff : a[1].timestamp - b[1].timestamp;
                        });

                    const entriesToRemove = sortedEntries.slice(0, newCache.size - state.config.maxCacheSize);
                    entriesToRemove.forEach(([key]) => newCache.delete(key));

                    console.log(`Pruned ${entriesToRemove.length} cache entries`);
                }

                set({ cache: newCache });
                console.log(`Cached: ${key} (TTL: ${timeToLive}ms)`);
            },

            invalidateCache: (pattern?: string | RegExp): number => {
                const state = get();
                let removedCount = 0;

                if (!pattern) {
                    // Clear all cache
                    removedCount = state.cache.size;
                    set({ cache: new Map() });
                } else {
                    // Clear matching entries
                    const newCache = new Map(state.cache);

                    for (const [key] of newCache) {
                        const matches = pattern instanceof RegExp
                            ? pattern.test(key)
                            : key.includes(pattern);

                        if (matches) {
                            newCache.delete(key);
                            removedCount++;
                        }
                    }

                    set({ cache: newCache });
                }

                console.log(`Invalidated ${removedCount} cache entries`);
                return removedCount;
            },

            isCacheValid: (key: string, maxAge?: number): boolean => {
                const entry = get().cache.get(key);
                if (!entry) return false;

                const now = Date.now();
                const isExpired = now > entry.expiresAt;
                const isStale = maxAge && (now - entry.timestamp) > maxAge;

                return !isExpired && !isStale;
            },

            // Request state management
            setRequestPending: (key: string, promise: Promise<any>, abortController: AbortController) => {
                const state = get();

                // Check if deduplication is enabled and request is already pending
                if (state.config.enableDeduplication && state.pendingRequests.has(key)) {
                    console.log(`Request deduplication: ${key}`);
                    return;
                }

                const pendingRequest: PendingRequest = {
                    promise,
                    abortController,
                    timestamp: Date.now(),
                };

                const newPendingRequests = new Map(state.pendingRequests);
                newPendingRequests.set(key, pendingRequest);

                set({
                    pendingRequests: newPendingRequests,
                    stats: { ...state.stats, totalRequests: state.stats.totalRequests + 1 }
                });

                // Set timeout for automatic cleanup
                setTimeout(() => {
                    if (get().pendingRequests.has(key)) {
                        abortController.abort();
                        get().setRequestComplete(key, false);
                        console.warn(`Request timeout: ${key}`);
                    }
                }, state.config.maxRequestTimeout);
            },

            setRequestComplete: (key: string, success: boolean, responseTime?: number) => {
                const state = get();

                // Remove from pending requests
                const newPendingRequests = new Map(state.pendingRequests);
                newPendingRequests.delete(key);

                // Remove from request errors
                const newRequestErrors = new Map(state.requestErrors);
                newRequestErrors.delete(key);

                // Update statistics
                const newStats = { ...state.stats };
                if (success) {
                    newStats.successfulRequests++;
                } else {
                    newStats.failedRequests++;
                }

                // Update average response time if provided
                if (responseTime && success) {
                    const totalSuccessful = newStats.successfulRequests;
                    newStats.averageResponseTime =
                        ((state.stats.averageResponseTime * (totalSuccessful - 1)) + responseTime) / totalSuccessful;
                }

                set({
                    pendingRequests: newPendingRequests,
                    requestErrors: newRequestErrors,
                    stats: newStats
                });
            },

            setRequestError: (key: string, error: string) => {
                const state = get();

                const newRequestErrors = new Map(state.requestErrors);
                newRequestErrors.set(key, error);

                set({ requestErrors: newRequestErrors });
                get().setRequestComplete(key, false);
            },

            cancelRequest: (key: string): boolean => {
                const pendingRequest = get().pendingRequests.get(key);
                if (pendingRequest) {
                    pendingRequest.abortController.abort();
                    get().setRequestComplete(key, false);
                    return true;
                }
                return false;
            },

            isPendingRequest: (key: string): boolean => {
                return get().pendingRequests.has(key);
            },

            getPendingRequest: (key: string): Promise<any> | null => {
                const pendingRequest = get().pendingRequests.get(key);
                return pendingRequest ? pendingRequest.promise : null;
            },

            // Cache management utilities
            clearExpired: (): number => {
                const state = get();
                const now = Date.now();
                let removedCount = 0;

                const newCache = new Map(state.cache);

                for (const [key, entry] of newCache) {
                    if (now > entry.expiresAt) {
                        newCache.delete(key);
                        removedCount++;
                    }
                }

                if (removedCount > 0) {
                    set({ cache: newCache });
                    console.log(`Cleared ${removedCount} expired cache entries`);
                }

                return removedCount;
            },

            clearAll: () => {
                set({
                    cache: new Map(),
                    pendingRequests: new Map(),
                    requestErrors: new Map()
                });
                console.log('Cleared all API cache and requests');
            },

            pruneLRU: (targetSize?: number): number => {
                const state = get();
                const target = targetSize || Math.floor(state.config.maxCacheSize * 0.8);

                if (state.cache.size <= target) {
                    return 0;
                }

                // Sort entries by hit count (ascending) then by timestamp (ascending)
                const sortedEntries = Array.from(state.cache.entries())
                    .sort((a, b) => {
                        const hitDiff = a[1].hitCount - b[1].hitCount;
                        return hitDiff !== 0 ? hitDiff : a[1].timestamp - b[1].timestamp;
                    });

                const entriesToRemove = sortedEntries.slice(0, state.cache.size - target);

                const newCache = new Map(state.cache);
                entriesToRemove.forEach(([key]) => newCache.delete(key));

                set({ cache: newCache });
                console.log(`Pruned ${entriesToRemove.length} cache entries via LRU`);

                return entriesToRemove.length;
            },

            // Statistics and monitoring
            getCacheStats: (): CacheStats => {
                const state = get();
                const entries = Array.from(state.cache.values());

                const totalHits = entries.reduce((sum, entry) => sum + entry.hitCount, 0);
                const totalMisses = state.stats.cacheMisses;
                const hitRate = totalHits + totalMisses > 0 ? totalHits / (totalHits + totalMisses) : 0;

                // Estimate memory usage (rough calculation)
                const memoryUsage = entries.reduce((sum, entry) => {
                    return sum + JSON.stringify(entry.data).length * 2; // Rough byte estimation
                }, 0);

                const timestamps = entries.map(entry => entry.timestamp);

                return {
                    totalEntries: state.cache.size,
                    totalHits,
                    totalMisses,
                    hitRate,
                    memoryUsage,
                    oldestEntry: timestamps.length > 0 ? Math.min(...timestamps) : undefined,
                    newestEntry: timestamps.length > 0 ? Math.max(...timestamps) : undefined,
                };
            },

            getRequestStats: (): RequestStats => {
                return get().stats;
            },

            resetStats: () => {
                set({
                    stats: {
                        totalRequests: 0,
                        successfulRequests: 0,
                        failedRequests: 0,
                        cacheHits: 0,
                        cacheMisses: 0,
                        averageResponseTime: 0,
                    }
                });
            },

            // Configuration
            updateConfig: (newConfig: Partial<ApiState['config']>) => {
                set(state => ({
                    config: { ...state.config, ...newConfig }
                }));
                console.log('API store config updated:', newConfig);
            },

            // Utilities
            generateCacheKey: (endpoint: string, params?: Record<string, any>): string => {
                const baseKey = endpoint.replace(/^\/+/, '').replace(/\/+/g, '_');

                if (!params || Object.keys(params).length === 0) {
                    return baseKey;
                }

                // Sort params for consistent cache keys
                const sortedParams = Object.keys(params)
                    .sort()
                    .map(key => `${key}=${encodeURIComponent(String(params[key]))}`)
                    .join('&');

                return `${baseKey}?${sortedParams}`;
            },

            warmCache: async (keys: string[]): Promise<void> => {
                console.log(`Warming cache for ${keys.length} keys`);

                // This would typically trigger API calls to populate cache
                // Implementation depends on how it's integrated with the API client

                const promises = keys.map(async (key) => {
                    // Placeholder - in real implementation, this would make API calls
                    await new Promise(resolve => setTimeout(resolve, 100));
                    console.log(`Cache warmed: ${key}`);
                });

                await Promise.all(promises);
                console.log('Cache warming completed');
            },
        })
    )
);

// Hooks for common API store operations
export const useApiCache = <T>(key: string, maxAge?: number) => {
    return useApiStore(state => ({
        data: state.getCached<T>(key, maxAge),
        isValid: state.isCacheValid(key, maxAge),
        invalidate: () => state.invalidateCache(key),
    }));
};

export const useRequestState = (key: string) => {
    return useApiStore(state => ({
        isPending: state.isPendingRequest(key),
        error: state.requestErrors.get(key) || null,
        cancel: () => state.cancelRequest(key),
    }));
};

export const useCacheStats = () => {
    return useApiStore(state => state.getCacheStats());
};

export const useRequestStats = () => {
    return useApiStore(state => state.getRequestStats());
};

// Auto-cleanup expired cache entries
if (typeof window !== 'undefined') {
    setInterval(() => {
        useApiStore.getState().clearExpired();
    }, 60000); // Clean up every minute
}