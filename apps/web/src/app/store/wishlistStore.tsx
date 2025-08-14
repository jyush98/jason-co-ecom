// app/store/wishlistStore.ts - Updated to use standardized API client

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { apiClient, ENDPOINTS } from '@/lib/api/client';

// Types
export interface WishlistItem {
    id: number;
    product_id: number;
    notes?: string;
    collection_name?: string;
    priority: 1 | 2 | 3; // 1=High, 2=Medium, 3=Low
    created_at: string;
    price_when_added?: number;
    product: {
        id: number;
        name: string;
        description?: string;
        price: number;
        image_url?: string;
        image_urls?: string[];
        category?: string;
        featured: boolean;
    };
}

export interface WishlistCollection {
    id: number;
    name: string;
    description?: string;
    color: string;
    created_at: string;
    item_count: number;
}

export interface WishlistStats {
    total_items: number;
    collections: number;
    total_value: number;
    high_priority_items: number;
}

interface WishlistState {
    // Data
    items: WishlistItem[];
    collections: WishlistCollection[];
    stats: WishlistStats | null;

    // UI State
    isLoading: boolean;
    error: string | null;

    // Actions
    fetchWishlist: (token: string, collection?: string) => Promise<void>;
    fetchCollections: (token: string) => Promise<void>;
    fetchStats: (token: string) => Promise<void>;
    addToWishlist: (token: string, productId: number, options?: {
        notes?: string;
        collection_name?: string;
        priority?: 1 | 2 | 3;
    }) => Promise<{ success: boolean; message?: string; error?: string }>;
    removeFromWishlist: (token: string, productId: number) => Promise<{ success: boolean; error?: string }>;
    updateWishlistItem: (token: string, itemId: number, updates: {
        notes?: string;
        collection_name?: string;
        priority?: 1 | 2 | 3;
    }) => Promise<{ success: boolean; error?: string }>;
    checkProductInWishlist: (token: string, productId: number) => Promise<{
        in_wishlist: boolean;
        wishlist_item?: Partial<WishlistItem>;
    }>;
    createCollection: (token: string, data: {
        name: string;
        description?: string;
        color?: string;
    }) => Promise<{ success: boolean; error?: string }>;
    deleteCollection: (token: string, collectionId: number) => Promise<{ success: boolean; error?: string }>;
    bulkAddToCart: (token: string, productIds: number[]) => Promise<{ success: boolean; error?: string }>;
    bulkRemoveFromWishlist: (token: string, productIds: number[]) => Promise<{ success: boolean; error?: string }>;

    // Utility functions
    isProductInWishlist: (productId: number) => boolean;
    getWishlistItem: (productId: number) => WishlistItem | undefined;
    getCollectionItems: (collectionName: string) => WishlistItem[];
    clearError: () => void;
    reset: () => void;
}

// Helper function to get authenticated API client
const getAuthenticatedClient = (token: string) => {
    const client = apiClient;
    client.setTokenProvider({ getToken: async () => token });
    return client;
};

export const useWishlistStore = create<WishlistState>()(
    devtools(
        (set, get) => ({
            // Initial state
            items: [],
            collections: [],
            stats: null,
            isLoading: false,
            error: null,

            // Fetch wishlist items
            fetchWishlist: async (token: string, collection?: string) => {
                set({ isLoading: true, error: null });

                try {
                    const params = new URLSearchParams();
                    if (collection) params.append('collection', collection);
                    params.append('limit', '100'); // Get more items for better UX

                    // ✅ UPDATED: Use standardized API client
                    const endpoint = params.toString() 
                        ? `${ENDPOINTS.WISHLIST.BASE}?${params.toString()}`
                        : ENDPOINTS.WISHLIST.BASE;
                    
                    const items: WishlistItem[] = await getAuthenticatedClient(token).get(endpoint);
                    set({ items, isLoading: false });

                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Failed to load wishlist';
                    set({ error: errorMessage, isLoading: false });
                    console.error('Wishlist fetch error:', error);
                }
            },

            // Fetch collections
            fetchCollections: async (token: string) => {
                try {
                    // ✅ UPDATED: Use standardized API client
                    const collections: WishlistCollection[] = await getAuthenticatedClient(token).get(
                        `${ENDPOINTS.WISHLIST.BASE}/collections`
                    );
                    set({ collections });

                } catch (error) {
                    console.error('Collections fetch error:', error);
                    // Don't set error state for collections - it's not critical
                }
            },

            // Fetch stats
            fetchStats: async (token: string) => {
                try {
                    // ✅ UPDATED: Use standardized API client
                    const stats: WishlistStats = await getAuthenticatedClient(token).get(
                        `${ENDPOINTS.WISHLIST.BASE}/stats`
                    );
                    set({ stats });

                } catch (error) {
                    console.error('Wishlist stats fetch error:', error);
                    // Don't set error state for stats - it's not critical
                }
            },

            // Add to wishlist
            addToWishlist: async (token: string, productId: number, options = {}) => {
                const { items } = get();

                // Optimistic update
                const tempItem: WishlistItem = {
                    id: -1, // Temporary ID
                    product_id: productId,
                    notes: options.notes,
                    collection_name: options.collection_name,
                    priority: options.priority || 3,
                    created_at: new Date().toISOString(),
                    product: {
                        id: productId,
                        name: 'Loading...',
                        price: 0,
                        featured: false,
                    }
                };

                set({ items: [tempItem, ...items] });

                try {
                    // ✅ UPDATED: Use standardized API client
                    const result = await getAuthenticatedClient(token).post(
                        ENDPOINTS.WISHLIST.ADD_ITEM,
                        {
                            product_id: productId,
                            notes: options.notes,
                            collection_name: options.collection_name,
                            priority: options.priority || 3,
                        }
                    );

                    // Refresh wishlist to get accurate data
                    await get().fetchWishlist(token);

                    // Update stats
                    await get().fetchStats(token);

                    return {
                        success: true,
                        message: (result as { message?: string }) || 'Added to wishlist!'
                    };

                } catch (error) {
                    // Revert optimistic update
                    set({ items: items.filter(item => item.id !== -1) });

                    const errorMessage = error instanceof Error ? error.message : 'Failed to add to wishlist';
                    set({ error: errorMessage });

                    return {
                        success: false,
                        error: errorMessage
                    };
                }
            },

            // Remove from wishlist
            removeFromWishlist: async (token: string, productId: number) => {
                const { items } = get();
                const originalItems = [...items];

                // Optimistic update
                set({ items: items.filter(item => item.product_id !== productId) });

                try {
                    // ✅ UPDATED: Use standardized API client
                    await getAuthenticatedClient(token).delete(
                        ENDPOINTS.WISHLIST.REMOVE_ITEM(productId)
                    );

                    // Update stats
                    await get().fetchStats(token);

                    return { success: true };

                } catch (error) {
                    // Revert optimistic update
                    set({ items: originalItems });

                    const errorMessage = error instanceof Error ? error.message : 'Failed to remove from wishlist';
                    set({ error: errorMessage });

                    return {
                        success: false,
                        error: errorMessage
                    };
                }
            },

            // Update wishlist item
            updateWishlistItem: async (token: string, itemId: number, updates) => {
                const { items } = get();
                const originalItems = [...items];

                // Optimistic update
                const updatedItems = items.map(item =>
                    item.id === itemId
                        ? { ...item, ...updates }
                        : item
                );
                set({ items: updatedItems });

                try {
                    // ✅ UPDATED: Use standardized API client
                    await getAuthenticatedClient(token).put(
                        `${ENDPOINTS.WISHLIST.BASE}/items/${itemId}`,
                        updates
                    );

                    return { success: true };

                } catch (error) {
                    // Revert optimistic update
                    set({ items: originalItems });

                    const errorMessage = error instanceof Error ? error.message : 'Failed to update wishlist item';
                    set({ error: errorMessage });

                    return {
                        success: false,
                        error: errorMessage
                    };
                }
            },

            // Check if product is in wishlist
            checkProductInWishlist: async (token: string, productId: number) => {
                try {
                    // ✅ UPDATED: Use standardized API client
                    const result = await getAuthenticatedClient(token).get(
                        `${ENDPOINTS.WISHLIST.BASE}/check/${productId}`
                    );
                    return result;

                } catch (error) {
                    // Network errors, CORS, etc. - fail silently
                    console.warn('Check wishlist error (network/CORS):', error);
                    return { in_wishlist: false };
                }
            },

            // Create collection
            createCollection: async (token: string, data) => {
                try {
                    // ✅ UPDATED: Use standardized API client
                    await getAuthenticatedClient(token).post(
                        `${ENDPOINTS.WISHLIST.BASE}/collections`,
                        data
                    );

                    // Refresh collections
                    await get().fetchCollections(token);

                    return { success: true };

                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Failed to create collection';
                    return {
                        success: false,
                        error: errorMessage
                    };
                }
            },

            // Delete collection
            deleteCollection: async (token: string, collectionId: number) => {
                try {
                    // ✅ UPDATED: Use standardized API client
                    await getAuthenticatedClient(token).delete(
                        `${ENDPOINTS.WISHLIST.BASE}/collections/${collectionId}`
                    );

                    // Refresh collections and wishlist
                    await Promise.all([
                        get().fetchCollections(token),
                        get().fetchWishlist(token)
                    ]);

                    return { success: true };

                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Failed to delete collection';
                    return {
                        success: false,
                        error: errorMessage
                    };
                }
            },

            // Bulk add to cart
            bulkAddToCart: async (token: string, productIds: number[]) => {
                try {
                    // ✅ UPDATED: Use standardized API client
                    await getAuthenticatedClient(token).post(
                        `${ENDPOINTS.WISHLIST.BASE}/bulk/add-to-cart`,
                        productIds
                    );

                    return { success: true };

                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Failed to add items to cart';
                    return {
                        success: false,
                        error: errorMessage
                    };
                }
            },

            // Bulk remove from wishlist
            bulkRemoveFromWishlist: async (token: string, productIds: number[]) => {
                const { items } = get();
                const originalItems = [...items];

                // Optimistic update
                set({
                    items: items.filter(item => !productIds.includes(item.product_id))
                });

                try {
                    // ✅ UPDATED: Use standardized API client
                    await getAuthenticatedClient(token).post(
                        `${ENDPOINTS.WISHLIST.BASE}/bulk/remove`,
                        productIds
                    );
                    

                    // Update stats
                    await get().fetchStats(token);

                    return { success: true };

                } catch (error) {
                    // Revert optimistic update
                    set({ items: originalItems });

                    const errorMessage = error instanceof Error ? error.message : 'Failed to remove items from wishlist';
                    return {
                        success: false,
                        error: errorMessage
                    };
                }
            },

            // Utility functions
            isProductInWishlist: (productId: number) => {
                const { items } = get();
                return items.some(item => item.product_id === productId);
            },

            getWishlistItem: (productId: number) => {
                const { items } = get();
                return items.find(item => item.product_id === productId);
            },

            getCollectionItems: (collectionName: string) => {
                const { items } = get();
                return items.filter(item => item.collection_name === collectionName);
            },

            clearError: () => {
                set({ error: null });
            },

            reset: () => {
                set({
                    items: [],
                    collections: [],
                    stats: null,
                    isLoading: false,
                    error: null,
                });
            },
        }),
        { name: 'wishlist-store' }
    )
);

// Individual selectors to prevent unnecessary re-renders
export const useWishlistItems = () => useWishlistStore((state) => state.items);
export const useWishlistCollections = () => useWishlistStore((state) => state.collections);
export const useWishlistStats = () => useWishlistStore((state) => state.stats);
export const useWishlistLoading = () => useWishlistStore((state) => state.isLoading);
export const useWishlistError = () => useWishlistStore((state) => state.error);

// Action selectors - Fixed to avoid circular reference
export const useWishlistActions = () => {
    const fetchWishlist = useWishlistStore((state) => state.fetchWishlist);
    const fetchCollections = useWishlistStore((state) => state.fetchCollections);
    const fetchStats = useWishlistStore((state) => state.fetchStats);
    const addToWishlist = useWishlistStore((state) => state.addToWishlist);
    const removeFromWishlist = useWishlistStore((state) => state.removeFromWishlist);
    const updateWishlistItem = useWishlistStore((state) => state.updateWishlistItem);
    const checkProductInWishlist = useWishlistStore((state) => state.checkProductInWishlist);
    const createCollection = useWishlistStore((state) => state.createCollection);
    const deleteCollection = useWishlistStore((state) => state.deleteCollection);
    const bulkAddToCart = useWishlistStore((state) => state.bulkAddToCart);
    const bulkRemoveFromWishlist = useWishlistStore((state) => state.bulkRemoveFromWishlist);
    const clearError = useWishlistStore((state) => state.clearError);
    const reset = useWishlistStore((state) => state.reset);

    return {
        fetchWishlist,
        fetchCollections,
        fetchStats,
        addToWishlist,
        removeFromWishlist,
        updateWishlistItem,
        checkProductInWishlist,
        createCollection,
        deleteCollection,
        bulkAddToCart,
        bulkRemoveFromWishlist,
        clearError,
        reset,
    };
};

// Utility selectors - Fixed to avoid circular reference
export const useWishlistUtils = () => {
    const isProductInWishlist = useWishlistStore((state) => state.isProductInWishlist);
    const getWishlistItem = useWishlistStore((state) => state.getWishlistItem);
    const getCollectionItems = useWishlistStore((state) => state.getCollectionItems);

    return {
        isProductInWishlist,
        getWishlistItem,
        getCollectionItems,
    };
};

// Hook for wishlist count (for navigation badge)
export const useWishlistCount = () => {
    return useWishlistStore((state) => state.items.length);
};