// lib/stores/integrationStore.ts

import { create } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';
import { apiClient } from '../api/client';
import { ApiError, ErrorHandler } from '../api/errors';

// Import API types for the store
import { UserResponse, Cart as ApiCart, OrderResponse } from '../api/types';

// Import adapters for type compatibility
import {
    adaptUserToUserResponse,
    safeAdaptToUser,
    safeAdaptToCart,
    adaptCartToApi,
    adaptOrderArrayToOrderResponseArray
} from '../api/adapters';

// Sync status tracking
interface SyncStatus {
    status: 'idle' | 'syncing' | 'success' | 'error';
    lastSync?: string;
    error?: string;
    retryCount?: number;
}

// Background operation tracking
interface PendingOperation {
    id: string;
    type: 'user_sync' | 'cart_sync' | 'order_sync' | 'payment_sync' | 'custom_order_sync';
    data?: any;
    retryCount: number;
    maxRetries: number;
    nextRetryAt?: string;
    createdAt: string;
}

// Real-time connection status
type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error' | 'reconnecting';

interface IntegrationState {
    // Sync status tracking
    syncStatuses: Record<string, SyncStatus>;

    // Background operations
    pendingOperations: PendingOperation[];

    // Real-time connection
    isConnected: boolean;
    connectionStatus: ConnectionStatus;
    connectionError?: string;
    lastConnectionCheck?: string;

    // Cached data - using API types for consistency
    cachedUserData?: UserResponse;
    cachedCartData?: ApiCart;
    cachedOrderData?: OrderResponse[];

    // Configuration
    config: {
        syncIntervalMs: number;
        retryDelayMs: number;
        maxRetries: number;
        enableBackgroundSync: boolean;
        enableRealTime: boolean;
    };

    // Actions
    setSyncStatus: (key: string, status: SyncStatus) => void;
    addPendingOperation: (operation: Omit<PendingOperation, 'id' | 'createdAt' | 'retryCount'>) => void;
    removePendingOperation: (operationId: string) => void;
    setConnectionStatus: (status: ConnectionStatus, error?: string) => void;

    // Sync operations
    syncUserData: (userId: string) => Promise<UserResponse | null>;
    syncCartData: () => Promise<ApiCart | null>;
    syncOrderData: (userId: string) => Promise<OrderResponse[]>;
    retryFailedOperations: () => Promise<void>;

    // Real-time operations
    initializeRealTimeConnection: () => void;
    disconnectRealTime: () => void;

    // Cache management
    invalidateCache: (type?: 'user' | 'cart' | 'orders') => void;
    getCacheStatus: () => { user: boolean; cart: boolean; orders: boolean };

    // Configuration
    updateConfig: (config: Partial<IntegrationState['config']>) => void;
    resetIntegrationState: () => void;
}

export const useIntegrationStore = create<IntegrationState>()(
    subscribeWithSelector(
        persist(
            (set, get) => ({
                // Initial state
                syncStatuses: {},
                pendingOperations: [],
                isConnected: false,
                connectionStatus: 'disconnected',
                config: {
                    syncIntervalMs: 300000, // 5 minutes
                    retryDelayMs: 5000, // 5 seconds
                    maxRetries: 3,
                    enableBackgroundSync: true,
                    enableRealTime: false, // Disabled by default until WebSocket implemented
                },

                // Sync status management
                setSyncStatus: (key: string, status: SyncStatus) => {
                    set(state => ({
                        syncStatuses: {
                            ...state.syncStatuses,
                            [key]: {
                                ...status,
                                lastSync: status.status === 'success' ? new Date().toISOString() : status.lastSync,
                            },
                        },
                    }));
                },

                // Pending operations management
                addPendingOperation: (operation) => {
                    const newOperation: PendingOperation = {
                        ...operation,
                        id: `${operation.type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                        retryCount: 0,
                        createdAt: new Date().toISOString(),
                    };

                    set(state => ({
                        pendingOperations: [...state.pendingOperations, newOperation],
                    }));

                    // Auto-process operation if background sync is enabled
                    if (get().config.enableBackgroundSync) {
                        setTimeout(() => get().retryFailedOperations(), 1000);
                    }
                },

                removePendingOperation: (operationId: string) => {
                    set(state => ({
                        pendingOperations: state.pendingOperations.filter(op => op.id !== operationId),
                    }));
                },

                // Connection status management
                setConnectionStatus: (status: ConnectionStatus, error?: string) => {
                    set({
                        connectionStatus: status,
                        isConnected: status === 'connected',
                        connectionError: error,
                        lastConnectionCheck: new Date().toISOString(),
                    });
                },

                // User data synchronization with adapter
                syncUserData: async (userId: string): Promise<UserResponse | null> => {
                    const syncKey = `user_${userId}`;

                    get().setSyncStatus(syncKey, { status: 'syncing' });

                    try {
                        console.log(`Syncing user data for: ${userId}`);

                        // Get current user from API
                        const rawUserData = await apiClient.getUser(userId);

                        if (rawUserData) {
                            // ✅ Use safe adapter to ensure compatibility
                            const userData = safeAdaptToUser(rawUserData);

                            if (userData) {
                                // Convert to UserResponse for API consistency
                                const userResponse = adaptUserToUserResponse(userData);

                                set({ cachedUserData: userResponse });
                                get().setSyncStatus(syncKey, { status: 'success' });
                                console.log('User data sync successful');
                                return userResponse;
                            } else {
                                throw new ApiError(400, 'Invalid user data format', 'INVALID_USER_DATA');
                            }
                        } else {
                            throw new ApiError(404, 'User not found', 'USER_NOT_FOUND');
                        }
                    } catch (error) {
                        const apiError = ErrorHandler.handleApiErrorSync(error);
                        console.error('User sync failed:', apiError);

                        get().setSyncStatus(syncKey, {
                            status: 'error',
                            error: apiError.message,
                            retryCount: (get().syncStatuses[syncKey]?.retryCount || 0) + 1,
                        });

                        // Add to pending operations for retry if retryable
                        if (apiError.isRetryable) {
                            get().addPendingOperation({
                                type: 'user_sync',
                                data: { userId },
                                maxRetries: get().config.maxRetries,
                            });
                        }

                        return null;
                    }
                },

                // Cart data synchronization with adapter
                syncCartData: async (): Promise<ApiCart | null> => {
                    const syncKey = 'cart';

                    get().setSyncStatus(syncKey, { status: 'syncing' });

                    try {
                        console.log('Syncing cart data');

                        const rawCartData = await apiClient.getCart();

                        // ✅ Use safe adapter to handle different cart formats
                        const cartData = safeAdaptToCart(rawCartData);

                        if (cartData) {
                            // Convert to API format for storage consistency
                            const apiCartData = adaptCartToApi(cartData);

                            set({ cachedCartData: apiCartData });
                            get().setSyncStatus(syncKey, { status: 'success' });
                            console.log('Cart data sync successful');
                            return apiCartData;
                        } else {
                            throw new ApiError(400, 'Invalid cart data format', 'INVALID_CART_DATA');
                        }
                    } catch (error) {
                        const apiError = ErrorHandler.handleApiErrorSync(error);
                        console.error('Cart sync failed:', apiError);

                        get().setSyncStatus(syncKey, {
                            status: 'error',
                            error: apiError.message,
                            retryCount: (get().syncStatuses[syncKey]?.retryCount || 0) + 1,
                        });

                        // Add to pending operations for retry if retryable
                        if (apiError.isRetryable) {
                            get().addPendingOperation({
                                type: 'cart_sync',
                                data: {},
                                maxRetries: get().config.maxRetries,
                            });
                        }

                        return null;
                    }
                },

                // Order data synchronization with adapter
                syncOrderData: async (userId: string): Promise<OrderResponse[]> => {
                    const syncKey = `orders_${userId}`;

                    get().setSyncStatus(syncKey, { status: 'syncing' });

                    try {
                        console.log(`Syncing order data for: ${userId}`);

                        const rawOrderData = await apiClient.getOrders(userId);

                        // ✅ Use adapter to convert Order[] to OrderResponse[]
                        // Note: rawOrderData should be Order[] from your API
                        const orderData = adaptOrderArrayToOrderResponseArray(rawOrderData as any[], userId);

                        set({ cachedOrderData: orderData });
                        get().setSyncStatus(syncKey, { status: 'success' });
                        console.log('Order data sync successful');
                        return orderData;
                    } catch (error) {
                        const apiError = ErrorHandler.handleApiErrorSync(error);
                        console.error('Order sync failed:', apiError);

                        get().setSyncStatus(syncKey, {
                            status: 'error',
                            error: apiError.message,
                            retryCount: (get().syncStatuses[syncKey]?.retryCount || 0) + 1,
                        });

                        // Add to pending operations for retry if retryable
                        if (apiError.isRetryable) {
                            get().addPendingOperation({
                                type: 'order_sync',
                                data: { userId },
                                maxRetries: get().config.maxRetries,
                            });
                        }

                        return [];
                    }
                },

                // Retry failed operations
                retryFailedOperations: async (): Promise<void> => {
                    const state = get();
                    const now = new Date();
                    const operationsToRetry = state.pendingOperations.filter(op => {
                        // Check if operation is ready for retry
                        if (!op.nextRetryAt) return true;
                        return new Date(op.nextRetryAt) <= now;
                    });

                    for (const operation of operationsToRetry) {
                        if (operation.retryCount >= operation.maxRetries) {
                            console.warn(`Max retries exceeded for operation: ${operation.id}`);
                            get().removePendingOperation(operation.id);
                            continue;
                        }

                        // Calculate next retry time with exponential backoff
                        const retryDelay = state.config.retryDelayMs * Math.pow(2, operation.retryCount);
                        const nextRetryAt = new Date(Date.now() + retryDelay).toISOString();

                        // Update retry count and next retry time
                        set(currentState => ({
                            pendingOperations: currentState.pendingOperations.map(op =>
                                op.id === operation.id
                                    ? { ...op, retryCount: op.retryCount + 1, nextRetryAt }
                                    : op
                            ),
                        }));

                        // Execute operation based on type
                        try {
                            switch (operation.type) {
                                case 'user_sync':
                                    await get().syncUserData(operation.data.userId);
                                    get().removePendingOperation(operation.id);
                                    break;
                                case 'cart_sync':
                                    await get().syncCartData();
                                    get().removePendingOperation(operation.id);
                                    break;
                                case 'order_sync':
                                    await get().syncOrderData(operation.data.userId);
                                    get().removePendingOperation(operation.id);
                                    break;
                                default:
                                    console.warn(`Unknown operation type: ${operation.type}`);
                                    get().removePendingOperation(operation.id);
                                    break;
                            }
                        } catch (error) {
                            console.error(`Retry failed for operation ${operation.id}:`, error);
                            // Operation will be retried again on next cycle if within retry limits
                        }
                    }
                },

                // Real-time connection management
                initializeRealTimeConnection: () => {
                    if (!get().config.enableRealTime) {
                        console.log('Real-time connection disabled');
                        return;
                    }

                    get().setConnectionStatus('connecting');

                    // TODO: Implement WebSocket connection
                    // For now, we'll simulate connection status
                    setTimeout(() => {
                        get().setConnectionStatus('connected');
                        console.log('Real-time connection established (simulated)');
                    }, 1000);
                },

                disconnectRealTime: () => {
                    get().setConnectionStatus('disconnected');
                    console.log('Real-time connection disconnected');
                },

                // Cache management
                invalidateCache: (type?: 'user' | 'cart' | 'orders') => {
                    set(state => {
                        const updates: Partial<IntegrationState> = {};

                        if (!type || type === 'user') {
                            updates.cachedUserData = undefined;
                        }
                        if (!type || type === 'cart') {
                            updates.cachedCartData = undefined;
                        }
                        if (!type || type === 'orders') {
                            updates.cachedOrderData = undefined;
                        }

                        return { ...state, ...updates };
                    });

                    console.log(`Cache invalidated: ${type || 'all'}`);
                },

                getCacheStatus: () => {
                    const state = get();
                    return {
                        user: !!state.cachedUserData,
                        cart: !!state.cachedCartData,
                        orders: !!state.cachedOrderData,
                    };
                },

                // Configuration management
                updateConfig: (newConfig: Partial<IntegrationState['config']>) => {
                    set(state => ({
                        config: { ...state.config, ...newConfig },
                    }));
                    console.log('Integration config updated:', newConfig);
                },

                resetIntegrationState: () => {
                    set({
                        syncStatuses: {},
                        pendingOperations: [],
                        isConnected: false,
                        connectionStatus: 'disconnected',
                        connectionError: undefined,
                        cachedUserData: undefined,
                        cachedCartData: undefined,
                        cachedOrderData: undefined,
                    });
                    console.log('Integration state reset');
                },
            }),
            {
                name: 'integration-store',
                partialize: (state) => ({
                    // Persist sync statuses and pending operations
                    syncStatuses: state.syncStatuses,
                    pendingOperations: state.pendingOperations,
                    config: state.config,
                }),
            }
        )
    )
);

// Hook for accessing sync status
export const useSyncStatus = (key: string) => {
    return useIntegrationStore(state => state.syncStatuses[key] || { status: 'idle' });
};

// Hook for pending operations count
export const usePendingOperationsCount = () => {
    return useIntegrationStore(state => state.pendingOperations.length);
};

// Hook for connection status
export const useConnectionStatus = () => {
    return useIntegrationStore(state => ({
        isConnected: state.isConnected,
        status: state.connectionStatus,
        error: state.connectionError,
        lastCheck: state.lastConnectionCheck,
    }));
};

// Background sync manager
export class BackgroundSyncManager {
    private static intervalId: NodeJS.Timeout | null = null;
    private static isRunning = false;

    static start() {
        if (this.isRunning) return;

        const store = useIntegrationStore.getState();
        if (!store.config.enableBackgroundSync) {
            console.log('Background sync is disabled');
            return;
        }

        this.intervalId = setInterval(async () => {
            try {
                await store.retryFailedOperations();
            } catch (error) {
                console.error('Background sync error:', error);
            }
        }, store.config.syncIntervalMs);

        this.isRunning = true;
        console.log('Background sync manager started');
    }

    static stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        this.isRunning = false;
        console.log('Background sync manager stopped');
    }

    static restart() {
        this.stop();
        this.start();
    }

    static get isActive() {
        return this.isRunning;
    }
}

// Auto-start background sync when store is created
if (typeof window !== 'undefined') {
    // Start background sync after a short delay
    setTimeout(() => {
        BackgroundSyncManager.start();
    }, 2000);
}