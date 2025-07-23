// app/store/wishlistStore.ts - Wishlist State Management for Jason & Co.

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

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

                    const response = await fetch(`${API_BASE_URL}/wishlist?${params}`, {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json',
                        },
                    });

                    if (!response.ok) {
                        throw new Error(`Failed to fetch wishlist: ${response.statusText}`);
                    }

                    const items: WishlistItem[] = await response.json();
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
                    const response = await fetch(`${API_BASE_URL}/wishlist/collections`, {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json',
                        },
                    });

                    if (!response.ok) {
                        throw new Error(`Failed to fetch collections: ${response.statusText}`);
                    }

                    const collections: WishlistCollection[] = await response.json();
                    set({ collections });

                } catch (error) {
                    console.error('Collections fetch error:', error);
                    // Don't set error state for collections - it's not critical
                }
            },

            // Fetch stats
            fetchStats: async (token: string) => {
                try {
                    const response = await fetch(`${API_BASE_URL}/wishlist/stats`, {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json',
                        },
                    });

                    if (!response.ok) {
                        throw new Error(`Failed to fetch wishlist stats: ${response.statusText}`);
                    }

                    const stats: WishlistStats = await response.json();
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
                    const response = await fetch(`${API_BASE_URL}/wishlist/add`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            product_id: productId,
                            notes: options.notes,
                            collection_name: options.collection_name,
                            priority: options.priority || 3,
                        }),
                    });

                    const result = await response.json();

                    if (!response.ok) {
                        throw new Error(result.detail || 'Failed to add to wishlist');
                    }

                    // Refresh wishlist to get accurate data
                    await get().fetchWishlist(token);

                    // Update stats
                    await get().fetchStats(token);

                    return {
                        success: true,
                        message: result.message || 'Added to wishlist!'
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
                    const response = await fetch(`${API_BASE_URL}/wishlist/remove/${productId}`, {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                        },
                    });

                    const result = await response.json();

                    if (!response.ok) {
                        throw new Error(result.detail || 'Failed to remove from wishlist');
                    }

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
                    const response = await fetch(`${API_BASE_URL}/wishlist/items/${itemId}`, {
                        method: 'PUT',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(updates),
                    });

                    const result = await response.json();

                    if (!response.ok) {
                        throw new Error(result.detail || 'Failed to update wishlist item');
                    }

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
                    const response = await fetch(`${API_BASE_URL}/wishlist/check/${productId}`, {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json',
                        },
                    });

                    if (!response.ok) {
                        // Handle different error cases gracefully
                        if (response.status === 401) {
                            console.warn('User not authenticated for wishlist check');
                            return { in_wishlist: false };
                        }
                        if (response.status === 404) {
                            // Either user or product not found - treat as not in wishlist
                            return { in_wishlist: false };
                        }
                        // For other errors, log but don't throw
                        console.warn(`Wishlist check failed with status ${response.status}`);
                        return { in_wishlist: false };
                    }

                    return await response.json();

                } catch (error) {
                    // Network errors, CORS, etc. - fail silently
                    console.warn('Check wishlist error (network/CORS):', error);
                    return { in_wishlist: false };
                }
            },

            // Create collection
            createCollection: async (token: string, data) => {
                try {
                    const response = await fetch(`${API_BASE_URL}/wishlist/collections`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(data),
                    });

                    const result = await response.json();

                    if (!response.ok) {
                        throw new Error(result.detail || 'Failed to create collection');
                    }

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
                    const response = await fetch(`${API_BASE_URL}/wishlist/collections/${collectionId}`, {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                        },
                    });

                    const result = await response.json();

                    if (!response.ok) {
                        throw new Error(result.detail || 'Failed to delete collection');
                    }

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
                    const response = await fetch(`${API_BASE_URL}/wishlist/bulk/add-to-cart`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(productIds),
                    });

                    const result = await response.json();

                    if (!response.ok) {
                        throw new Error(result.detail || 'Failed to add items to cart');
                    }

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
                    const response = await fetch(`${API_BASE_URL}/wishlist/bulk/remove`, {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(productIds),
                    });

                    const result = await response.json();

                    if (!response.ok) {
                        throw new Error(result.detail || 'Failed to remove items from wishlist');
                    }

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