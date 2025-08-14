// lib/api/client.ts - Updated for /api/v1 standardization
import { auth } from '@clerk/nextjs/server';

// API Configuration with versioning
const API_VERSION = 'v1';
const API_PREFIX = `/api/${API_VERSION}`;

// Centralized endpoint configuration
export const ENDPOINTS = {
    // Health endpoints
    HEALTH: {
        ROOT: '/',
        BASIC: '/health',
        V1: `${API_PREFIX}/health`,
    },

    // User endpoints
    USERS: {
        BASE: `${API_PREFIX}/users`,
        PROFILE: (userId: string) => `${API_PREFIX}/users/${userId}`,
        BY_CLERK_ID: (clerkId: string) => `${API_PREFIX}/users/${clerkId}`,
        SYNC: `${API_PREFIX}/users/sync`,
    },

    // Product endpoints
    PRODUCTS: {
        BASE: `${API_PREFIX}/products`,
        BY_ID: (productId: number) => `${API_PREFIX}/products/${productId}`,
        SEARCH: `${API_PREFIX}/products/search`,
        CATEGORIES: `${API_PREFIX}/products/categories`,
    },

    // Cart endpoints
    CART: {
        BASE: `${API_PREFIX}/cart`,
        ADD: `${API_PREFIX}/cart/add`,
        REMOVE: (productId: number) => `${API_PREFIX}/cart/remove/${productId}`,
        UPDATE: (itemId: string) => `${API_PREFIX}/cart/items/${itemId}`,
        CLEAR: `${API_PREFIX}/cart/clear`,
    },

    // Checkout endpoints
    CHECKOUT: {
        BASE: `${API_PREFIX}/checkout`,
        CREATE_SESSION: `${API_PREFIX}/checkout/session`,
        PROCESS: `${API_PREFIX}/checkout/process`,
        CONFIRM: `${API_PREFIX}/checkout/confirm`,
    },

    // Order endpoints
    ORDERS: {
        BASE: `${API_PREFIX}/orders`,
        BY_ID: (orderId: number) => `${API_PREFIX}/orders/${orderId}`,
        BY_USER: (clerkId: string) => `${API_PREFIX}/orders/${clerkId}`,
        STATUS: (orderId: number) => `${API_PREFIX}/orders/${orderId}/status`,
    },

    // Custom order endpoints
    CUSTOM_ORDERS: {
        BASE: `${API_PREFIX}/custom-orders`,
        CREATE: `${API_PREFIX}/custom-orders`,
        BY_ID: (orderId: string) => `${API_PREFIX}/custom-orders/${orderId}`,
        SUBMIT: (orderId: string) => `${API_PREFIX}/custom-orders/${orderId}/submit`,
    },

    // Account endpoints
    ACCOUNT: {
        BASE: `${API_PREFIX}/account`,
        PROFILE: `${API_PREFIX}/account/profile`,
        SETTINGS: `${API_PREFIX}/account/settings`,
        PASSWORD: `${API_PREFIX}/account/password`,
    },

    // Wishlist endpoints
    WISHLIST: {
        BASE: `${API_PREFIX}/wishlist`,
        ADD_ITEM: `${API_PREFIX}/wishlist/add`,
        REMOVE_ITEM: (productId: number) => `${API_PREFIX}/wishlist/remove/${productId}`,
        UPDATE_ITEM: (itemId: number) => `${API_PREFIX}/wishlist/items/${itemId}`,
        CHECK: (productId: number) => `${API_PREFIX}/wishlist/check/${productId}`,
        COLLECTIONS: `${API_PREFIX}/wishlist/collections`,
        STATS: `${API_PREFIX}/wishlist/stats`,
        BULK_ADD_TO_CART: `${API_PREFIX}/wishlist/bulk/add-to-cart`,
        BULK_REMOVE: `${API_PREFIX}/wishlist/bulk/remove`,
    },

    // Payment endpoints
    PAYMENT: {
        BASE: `${API_PREFIX}/payment`,
        CREATE_INTENT: `${API_PREFIX}/payment/create-intent`,
        CONFIRM: `${API_PREFIX}/payment/confirm`,
        SUBMIT_ORDER: `${API_PREFIX}/payment/submit-order`,
    },

    // Contact endpoints
    CONTACT: {
        BASE: `${API_PREFIX}/contact`,
        INQUIRY: `${API_PREFIX}/contact/inquiry`,
        SUBMIT: `${API_PREFIX}/contact/submit`,
    },

    // Notification endpoints
    NOTIFICATIONS: {
        BASE: `${API_PREFIX}/notifications`,
        PREFERENCES: `${API_PREFIX}/notifications/preferences`,
    },

    // Admin endpoints
    ADMIN: {
        BASE: `${API_PREFIX}/admin`,
        DASHBOARD: `${API_PREFIX}/admin/dashboard`,
        ANALYTICS: {
            BASE: `${API_PREFIX}/admin/analytics`,
            REVENUE: `${API_PREFIX}/admin/analytics/revenue`,
            CUSTOMERS: `${API_PREFIX}/admin/analytics/customers`,
            PRODUCTS: `${API_PREFIX}/admin/analytics/products`,
            GEOGRAPHIC: `${API_PREFIX}/admin/analytics/geographic`,
        },
    },

    // Legacy endpoints (for backward compatibility during transition)
    LEGACY: {
        CART: '/cart',
        CART_ADD: '/cart/add',
        CART_REMOVE: (productId: number) => `/cart/remove/${productId}`,
        CHECKOUT: '/checkout',
        PRODUCTS: '/products',
        PRODUCTS_BY_ID: (productId: number) => `/products/${productId}`,
        USER_BY_ID: (clerkId: string) => `/api/user/${clerkId}`,
        USER_SYNC: '/api/user/sync',
        ORDERS_BY_USER: (clerkId: string) => `/api/orders/${clerkId}`,
        ORDERS_BY_ID: (orderId: number) => `/api/orders/${orderId}`,
        ORDERS_CREATE: '/api/orders',
        CONTACT_INQUIRY: '/api/contact/inquiry',
    }
};

// Client-side token provider interface
interface TokenProvider {
    getToken(): Promise<string | null>;
}

// Base configuration interface
interface ApiClientConfig {
    baseURL: string;
    timeout: number;
    retryAttempts: number;
    retryDelay: number;
    enableCache: boolean;
    cacheTimeout: number;
    tokenProvider?: TokenProvider;
    useLegacyEndpoints?: boolean; // For transition period
}

// Request context interface
interface RequestContext {
    endpoint: string;
    method: string;
    data?: any;
    headers?: Record<string, string>;
    retryCount?: number;
}

// Main API client class
export class ApiClient {
    private config: ApiClientConfig;
    private defaultHeaders: Record<string, string>;
    private requestCache: Map<string, { data: any; timestamp: number; expiresAt: number }>;
    private tokenProvider?: TokenProvider;

    constructor(config?: Partial<ApiClientConfig>) {
        this.config = {
            baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || '',
            timeout: 10000,
            retryAttempts: 3,
            retryDelay: 1000,
            enableCache: true,
            cacheTimeout: 300000, // 5 minutes
            useLegacyEndpoints: process.env.NEXT_PUBLIC_USE_LEGACY_API === 'true',
            ...config,
        };

        this.defaultHeaders = {
            'Content-Type': 'application/json',
        };

        this.requestCache = new Map();
        this.tokenProvider = config?.tokenProvider;

        console.log('🚀 Jason & Co. API Client initialized');
        console.log(`📡 Base URL: ${this.config.baseURL}`);
        console.log(`📋 API Version: ${API_VERSION}`);
        console.log(`🔄 Legacy Mode: ${this.config.useLegacyEndpoints ? 'ON' : 'OFF'}`);
    }

    // ✅ NEW: Utility method to choose between v1 and legacy endpoints
    private getEndpoint(v1Endpoint: string, legacyEndpoint?: string): string {
        if (this.config.useLegacyEndpoints && legacyEndpoint) {
            console.log(`📍 Using legacy endpoint: ${legacyEndpoint}`);
            return legacyEndpoint;
        }
        console.log(`📍 Using v1 endpoint: ${v1Endpoint}`);
        return v1Endpoint;
    }

    /**
     * Core request method with auth, retry, and error handling
     */
    private async request<T>(context: RequestContext): Promise<T> {
        const { endpoint, method, data, headers = {}, retryCount = 0 } = context;

        try {
            // Get authentication token
            const token = await this.getAuthToken();

            // Build request headers
            const requestHeaders = {
                ...this.defaultHeaders,
                ...headers,
                ...(token && { 'Authorization': `Bearer ${token}` }),
            };

            // Check cache for GET requests
            if (method === 'GET' && this.config.enableCache) {
                const cached = this.getCachedResponse(endpoint);
                if (cached) {
                    console.log(`💾 Cache hit for ${endpoint}`);
                    return cached;
                }
            }

            // Build request URL with query params for GET requests
            const url = method === 'GET' && data
                ? `${this.config.baseURL}${endpoint}?${new URLSearchParams(data).toString()}`
                : `${this.config.baseURL}${endpoint}`;

            console.log(`🔍 API Request: ${method} ${url}`);

            // Create abort controller for timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

            // Make the request
            const response = await fetch(url, {
                method,
                headers: requestHeaders,
                body: method !== 'GET' && data ? JSON.stringify(data) : undefined,
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            // Handle non-200 responses
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
                throw new ApiError(
                    response.status,
                    errorData.message || `HTTP ${response.status}: ${response.statusText}`,
                    errorData.code,
                    errorData
                );
            }

            // Parse response
            const responseData = await response.json();

            // Cache successful GET responses
            if (method === 'GET' && this.config.enableCache) {
                this.setCachedResponse(endpoint, responseData);
            }

            console.log(`✅ API Response: Success for ${endpoint}`);
            return responseData;

        } catch (error) {
            console.error(`❌ API Request Failed: ${method} ${endpoint}`, error);

            // Handle network/timeout errors with retry
            if (retryCount < this.config.retryAttempts && this.shouldRetry(error)) {
                console.log(`🔄 Retrying request (attempt ${retryCount + 1}/${this.config.retryAttempts})`);
                await this.delay(this.config.retryDelay * Math.pow(2, retryCount)); // Exponential backoff

                return this.request({
                    ...context,
                    retryCount: retryCount + 1,
                });
            }

            // Re-throw the error if no more retries
            throw error;
        }
    }

    /**
     * HTTP Methods
     */
    async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
        return this.request<T>({
            endpoint,
            method: 'GET',
            data: params,
        });
    }

    async post<T>(endpoint: string, data?: any): Promise<T> {
        return this.request<T>({
            endpoint,
            method: 'POST',
            data,
        });
    }

    async put<T>(endpoint: string, data?: any): Promise<T> {
        return this.request<T>({
            endpoint,
            method: 'PUT',
            data,
        });
    }

    async delete<T>(endpoint: string): Promise<T> {
        return this.request<T>({
            endpoint,
            method: 'DELETE',
        });
    }

    async patch<T>(endpoint: string, data?: any): Promise<T> {
        return this.request<T>({
            endpoint,
            method: 'PATCH',
            data,
        });
    }

    /**
     * ✅ UPDATED: Domain-specific API methods using standardized endpoints
     */

    // Product API methods
    async getProducts(filters: ProductFilters): Promise<ProductListResponse> {
        try {
            // ✅ Use standardized endpoint with legacy fallback
            const endpoint = this.getEndpoint(ENDPOINTS.PRODUCTS.BASE, ENDPOINTS.LEGACY.PRODUCTS);
            const response = await this.get<any>(endpoint, filters);

            // Normalize response to consistent format
            const result = {
                products: Array.isArray(response) ? response : (response.products || response.items || []),
                total: response.total || response.count || (Array.isArray(response) ? response.length : 0),
                page: response.page || filters.page || 1,
                page_size: response.page_size || response.pageSize || filters.pageSize || 10,
                total_pages: Math.ceil((response.total || 0) / (filters.pageSize || 10)),
                has_next: response.has_next || false,
                has_prev: response.has_prev || false,
                filters_applied: filters,
            };

            console.log('📦 Products loaded:', result.products.length, 'of', result.total);
            return result;
        } catch (error) {
            console.error('❌ Error fetching products:', error);
            return {
                products: [],
                total: 0,
                page: 1,
                page_size: 10,
                total_pages: 0,
                has_next: false,
                has_prev: false,
                filters_applied: filters,
            };
        }
    }

    async getProduct(id: number): Promise<Product | null> {
        try {
            // ✅ Use standardized endpoint with legacy fallback
            const endpoint = this.getEndpoint(
                ENDPOINTS.PRODUCTS.BY_ID(id),
                ENDPOINTS.LEGACY.PRODUCTS_BY_ID(id)
            );
            const product = await this.get<Product>(endpoint);
            console.log('📦 Product loaded:', product.name);
            return product;
        } catch (error) {
            console.error(`❌ Error fetching product ${id}:`, error);
            return null;
        }
    }

    // Order API methods
    async getOrders(userId?: string): Promise<Order[]> {
        try {
            // ✅ Use standardized endpoint with legacy fallback
            const endpoint = userId
                ? this.getEndpoint(ENDPOINTS.ORDERS.BY_USER(userId), ENDPOINTS.LEGACY.ORDERS_BY_USER(userId))
                : this.getEndpoint(ENDPOINTS.ORDERS.BASE, ENDPOINTS.LEGACY.ORDERS_BY_USER(''));

            const orders = await this.get<Order[]>(endpoint);
            console.log('📄 Orders loaded:', orders.length, 'orders');
            return orders;
        } catch (error) {
            console.error('❌ Error fetching orders:', error);
            return [];
        }
    }

    async createOrder(data: OrderCreateRequest): Promise<Order> {
        // ✅ Use standardized endpoint with legacy fallback
        const endpoint = this.getEndpoint(ENDPOINTS.ORDERS.BASE, ENDPOINTS.LEGACY.ORDERS_CREATE);
        const order = await this.post<Order>(endpoint, data);
        console.log('📄 Order created:', order.id);
        return order;
    }

    async getOrder(orderId: number): Promise<Order | null> {
        try {
            // ✅ Use standardized endpoint with legacy fallback
            const endpoint = this.getEndpoint(
                ENDPOINTS.ORDERS.BY_ID(orderId),
                ENDPOINTS.LEGACY.ORDERS_BY_ID(orderId)
            );
            const order = await this.get<Order>(endpoint);
            console.log('📄 Order loaded:', order.id, order.status);
            return order;
        } catch (error) {
            console.error(`❌ Error fetching order ${orderId}:`, error);
            return null;
        }
    }

    // Cart API methods
    async getCart(): Promise<Cart> {
        try {
            // ✅ Use standardized endpoint with legacy fallback
            const endpoint = this.getEndpoint(ENDPOINTS.CART.BASE, ENDPOINTS.LEGACY.CART);
            const cartData = await this.get<CartItem[]>(endpoint);

            // Transform array response to Cart object
            const subtotal = cartData.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
            const cart: Cart = {
                items: cartData,
                subtotal,
                tax: subtotal * 0.08, // 8% tax - should come from backend
                shipping: 0, // Calculate based on shipping method
                total: subtotal + (subtotal * 0.08),
                item_count: cartData.reduce((sum, item) => sum + item.quantity, 0),
                currency: 'USD',
                last_updated: new Date().toISOString(),
            };

            console.log('🛒 Cart loaded:', cart.item_count, 'items');
            return cart;
        } catch (error) {
            console.error('❌ Error fetching cart:', error);
            return {
                items: [],
                subtotal: 0,
                tax: 0,
                shipping: 0,
                total: 0,
                item_count: 0,
                currency: 'USD',
                last_updated: new Date().toISOString(),
            };
        }
    }

    async addToCart(productId: number, quantity: number): Promise<CartActionResult> {
        try {
            // ✅ Use standardized endpoint with legacy fallback
            const endpoint = this.getEndpoint(ENDPOINTS.CART.ADD, ENDPOINTS.LEGACY.CART_ADD);

            // Fixed: Check if response contains updated cart to avoid second API call
            const addResponse = await this.post<any>(endpoint, {
                product_id: productId,
                quantity,
            });

            // If backend returns updated cart in response, use it
            if (addResponse.cart) {
                console.log('🛒 Item added to cart:', productId, 'x', quantity);
                return {
                    success: true,
                    cart: addResponse.cart,
                    message: addResponse.message || 'Item added to cart successfully',
                };
            }

            // Fallback: fetch cart if not included in add response
            const cart = await this.getCart();

            console.log('🛒 Item added to cart:', productId, 'x', quantity);
            return {
                success: true,
                cart,
                message: 'Item added to cart successfully',
            };
        } catch (error) {
            console.error('❌ Error adding to cart:', error);
            return {
                success: false,
                error: error instanceof ApiError ? error.message : 'Failed to add item to cart',
            };
        }
    }

    async removeFromCart(productId: number): Promise<CartActionResult> {
        try {
            // ✅ Use standardized endpoint with legacy fallback
            const endpoint = this.getEndpoint(
                ENDPOINTS.CART.REMOVE(productId),
                ENDPOINTS.LEGACY.CART_REMOVE(productId)
            );

            await this.delete(endpoint);
            const cart = await this.getCart(); // Get updated cart

            console.log('🛒 Item removed from cart:', productId);
            return {
                success: true,
                cart,
                message: 'Item removed from cart',
            };
        } catch (error) {
            console.error('❌ Error removing from cart:', error);
            return {
                success: false,
                error: error instanceof ApiError ? error.message : 'Failed to remove item from cart',
            };
        }
    }

    // ✅ NEW: Additional cart methods for v1 API
    async updateCartItem(itemId: string, quantity: number): Promise<CartActionResult> {
        try {
            const endpoint = ENDPOINTS.CART.UPDATE(itemId);
            await this.put(endpoint, { quantity });
            const cart = await this.getCart();

            console.log('🛒 Cart item updated:', itemId, 'quantity:', quantity);
            return {
                success: true,
                cart,
                message: 'Cart item updated successfully',
            };
        } catch (error) {
            console.error('❌ Error updating cart item:', error);
            return {
                success: false,
                error: error instanceof ApiError ? error.message : 'Failed to update cart item',
            };
        }
    }

    async clearCart(): Promise<CartActionResult> {
        try {
            const endpoint = ENDPOINTS.CART.CLEAR;
            await this.delete(endpoint);

            console.log('🛒 Cart cleared');
            return {
                success: true,
                cart: {
                    items: [],
                    subtotal: 0,
                    tax: 0,
                    shipping: 0,
                    total: 0,
                    item_count: 0,
                    currency: 'USD',
                    last_updated: new Date().toISOString(),
                },
                message: 'Cart cleared successfully',
            };
        } catch (error) {
            console.error('❌ Error clearing cart:', error);
            return {
                success: false,
                error: error instanceof ApiError ? error.message : 'Failed to clear cart',
            };
        }
    }

    // User API methods
    async syncUserWithClerk(clerkData: any): Promise<User | null> {
        try {
            // ✅ Use standardized endpoint with legacy fallback
            const endpoint = this.getEndpoint(ENDPOINTS.USERS.SYNC, ENDPOINTS.LEGACY.USER_SYNC);

            const user = await this.post<User>(endpoint, {
                clerk_id: clerkData.id,
                email: clerkData.emailAddresses?.[0]?.emailAddress || clerkData.email,
                first_name: clerkData.firstName,
                last_name: clerkData.lastName,
                image_url: clerkData.imageUrl,
            });

            console.log('👤 User synced with Clerk:', user.email);
            return user;
        } catch (error) {
            console.error('❌ Error syncing user with Clerk:', error);
            return null;
        }
    }

    async getUser(clerkId: string): Promise<User | null> {
        try {
            // ✅ Use standardized endpoint with legacy fallback
            const endpoint = this.getEndpoint(
                ENDPOINTS.USERS.BY_CLERK_ID(clerkId),
                ENDPOINTS.LEGACY.USER_BY_ID(clerkId)
            );

            const user = await this.get<User>(endpoint);
            console.log('👤 User loaded:', user.email);
            return user;
        } catch (error) {
            console.error(`❌ Error fetching user ${clerkId}:`, error);
            return null;
        }
    }

    // ✅ NEW: Admin Analytics methods
    async getAdminAnalytics(type: 'revenue' | 'customers' | 'products' | 'geographic'): Promise<any> {
        try {
            let endpoint: string;
            switch (type) {
                case 'revenue':
                    endpoint = ENDPOINTS.ADMIN.ANALYTICS.REVENUE;
                    break;
                case 'customers':
                    endpoint = ENDPOINTS.ADMIN.ANALYTICS.CUSTOMERS;
                    break;
                case 'products':
                    endpoint = ENDPOINTS.ADMIN.ANALYTICS.PRODUCTS;
                    break;
                case 'geographic':
                    endpoint = ENDPOINTS.ADMIN.ANALYTICS.GEOGRAPHIC;
                    break;
                default:
                    throw new Error(`Unknown analytics type: ${type}`);
            }

            const analytics = await this.get(endpoint);
            console.log(`📊 ${type} analytics loaded`);
            return analytics;
        } catch (error) {
            console.error(`❌ Error fetching ${type} analytics:`, error);
            throw error;
        }
    }

    // ✅ NEW: Contact methods
    async submitContactInquiry(data: any): Promise<any> {
        try {
            const endpoint = this.getEndpoint(ENDPOINTS.CONTACT.INQUIRY, ENDPOINTS.LEGACY.CONTACT_INQUIRY);
            const response = await this.post(endpoint, data);
            console.log('📧 Contact inquiry submitted');
            return response;
        } catch (error) {
            console.error('❌ Error submitting contact inquiry:', error);
            throw error;
        }
    }

    // ✅ NEW: Health check method
    async checkHealth(): Promise<{ status: string;[key: string]: any }> {
        try {
            const endpoint = ENDPOINTS.HEALTH.V1;
            const health = await this.get<{ status: string;[key: string]: any }>(endpoint);
            console.log('💚 API health check:', health.status);
            return health;
        } catch (error) {
            console.error('❌ API health check failed:', error);
            throw error;
        }
    }

    /**
     * Utility methods
     */
    /**
     * Get authentication token for requests
     */
    private async getAuthToken(): Promise<string | null> {
        try {
            // Use provided token provider if available
            if (this.tokenProvider) {
                return await this.tokenProvider.getToken();
            }

            // For server-side usage (App Router)
            if (typeof window === 'undefined') {
                const authResult = await auth();
                if (authResult.getToken) {
                    return await authResult.getToken();
                }
                return null;
            }

            // For client-side usage, check if we're in a Clerk context
            if (typeof window !== 'undefined' && (window as any).__clerk) {
                const clerk = (window as any).__clerk;
                if (clerk.session) {
                    return await clerk.session.getToken();
                }
            }

            return null;
        } catch (error) {
            console.error('❌ Error getting auth token:', error);
            return null;
        }
    }

    /**
     * Set a custom token provider for client-side usage
     */
    setTokenProvider(provider: TokenProvider): void {
        this.tokenProvider = provider;
    }

    /**
     * Enable or disable legacy endpoint usage
     */
    setLegacyMode(enabled: boolean): void {
        this.config.useLegacyEndpoints = enabled;
        console.log(`🔄 Legacy mode ${enabled ? 'enabled' : 'disabled'}`);
    }

    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    private shouldRetry(error: any): boolean {
        // Retry on network errors, timeouts, and 5xx server errors
        if (error instanceof ApiError) {
            return error.status >= 500 || error.status === 408; // Server error or timeout
        }

        // Retry on network/connection errors
        return error.name === 'AbortError' ||
            error.name === 'NetworkError' ||
            error.message.includes('fetch');
    }

    private getCachedResponse(endpoint: string): any | null {
        if (!this.config.enableCache) return null;

        const cached = this.requestCache.get(endpoint);
        if (cached && Date.now() < cached.expiresAt) {
            return cached.data;
        }

        // Remove expired cache entry
        if (cached) {
            this.requestCache.delete(endpoint);
        }

        return null;
    }

    private setCachedResponse(endpoint: string, data: any): void {
        if (!this.config.enableCache) return;

        this.requestCache.set(endpoint, {
            data,
            timestamp: Date.now(),
            expiresAt: Date.now() + this.config.cacheTimeout,
        });
    }

    /**
     * Cache management
     */
    clearCache(pattern?: string): void {
        if (pattern) {
            // Clear cache entries matching pattern
            for (const [key] of this.requestCache) {
                if (key.includes(pattern)) {
                    this.requestCache.delete(key);
                }
            }
        } else {
            // Clear all cache
            this.requestCache.clear();
        }
    }

    getCacheStats(): { size: number; keys: string[] } {
        return {
            size: this.requestCache.size,
            keys: Array.from(this.requestCache.keys()),
        };
    }
}

// Custom API Error class
export class ApiError extends Error {
    constructor(
        public status: number,
        message: string,
        public code?: string,
        public details?: any
    ) {
        super(message);
        this.name = 'ApiError';
    }

    static fromResponse(status: number, body: any): ApiError {
        return new ApiError(
            status,
            body?.message || `HTTP ${status} Error`,
            body?.code,
            body
        );
    }
}

// Type definitions for the API client
interface Product {
    id: number;
    name: string;
    price: number;
    image_url?: string;
    category?: string;
    description?: string;
}

interface ProductFilters {
    name?: string;
    minPrice?: number;
    maxPrice?: number;
    category?: string;
    page?: number;
    pageSize?: number;
    sortBy?: string;
    sortOrder?: string;
}

interface ProductListResponse {
    products: Product[];
    total: number;
    page: number;
    page_size: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
    filters_applied: ProductFilters;
}

interface CartItem {
    product_id: number;
    quantity: number;
    product: Product;
}

interface Cart {
    items: CartItem[];
    subtotal: number;
    tax: number;
    shipping: number;
    total: number;
    item_count: number;
    currency: string;
    last_updated: string;
}

interface CartActionResult {
    success: boolean;
    message?: string;
    cart?: Cart;
    error?: string;
}

interface Order {
    id: number;
    total: number;
    status: string;
    created_at: string;
}

interface OrderCreateRequest {
    items: CartItem[];
    shipping_address: any;
    payment_method: string;
}

interface User {
    id: number;
    clerk_id: string;
    email: string;
    first_name?: string;
    last_name?: string;
}

// Export singleton instance
export const apiClient = new ApiClient();

// Create a client-side API client with Clerk integration
export const createClientApiClient = (tokenProvider?: TokenProvider) => {
    return new ApiClient({
        tokenProvider,
    });
};

// Hook for using API client in React components
export const useApiClient = () => {
    // This would be used with Clerk's useAuth hook
    // Example: const { getToken } = useAuth();
    // return createClientApiClient({ getToken });
    return apiClient;
};

console.log('🎯 Updated Jason & Co. API Client with /api/v1 standardization and legacy fallback');