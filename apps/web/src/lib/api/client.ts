// lib/api/client.ts
import { auth } from '@clerk/nextjs/server';

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
            ...config,
        };

        this.defaultHeaders = {
            'Content-Type': 'application/json',
        };

        this.requestCache = new Map();
        this.tokenProvider = config?.tokenProvider;
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
                    console.log(`Cache hit for ${endpoint}`);
                    return cached;
                }
            }

            // Build request URL with query params for GET requests
            const url = method === 'GET' && data
                ? `${this.config.baseURL}${endpoint}?${new URLSearchParams(data).toString()}`
                : `${this.config.baseURL}${endpoint}`;

            console.log(`API Request: ${method} ${url}`);

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

            console.log(`API Response: Success for ${endpoint}`);
            return responseData;

        } catch (error) {
            console.error(`API Request Failed: ${method} ${endpoint}`, error);

            // Handle network/timeout errors with retry
            if (retryCount < this.config.retryAttempts && this.shouldRetry(error)) {
                console.log(`Retrying request (attempt ${retryCount + 1}/${this.config.retryAttempts})`);
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
     * Domain-specific API methods
     */

    // Product API methods
    async getProducts(filters: ProductFilters): Promise<ProductListResponse> {
        try {
            const response = await this.get<any>('/products', filters);

            // Normalize response to consistent format
            return {
                products: Array.isArray(response) ? response : (response.products || response.items || []),
                total: response.total || response.count || (Array.isArray(response) ? response.length : 0),
                page: response.page || filters.page || 1,
                page_size: response.page_size || response.pageSize || filters.pageSize || 10,
                total_pages: Math.ceil((response.total || 0) / (filters.pageSize || 10)),
                filters_applied: filters,
            };
        } catch (error) {
            console.error('Error fetching products:', error);
            return {
                products: [],
                total: 0,
                page: 1,
                page_size: 10,
                total_pages: 0,
                filters_applied: filters,
            };
        }
    }

    async getProduct(id: number): Promise<Product | null> {
        try {
            return await this.get<Product>(`/products/${id}`);
        } catch (error) {
            console.error(`Error fetching product ${id}:`, error);
            return null;
        }
    }

    // Order API methods
    async getOrders(userId?: string): Promise<Order[]> {
        try {
            const endpoint = userId ? `/api/orders/${userId}` : '/api/orders';
            return await this.get<Order[]>(endpoint);
        } catch (error) {
            console.error('Error fetching orders:', error);
            return [];
        }
    }

    async createOrder(data: OrderCreateRequest): Promise<Order> {
        return this.post<Order>('/api/orders', data);
    }

    async getOrder(orderId: number): Promise<Order | null> {
        try {
            return await this.get<Order>(`/api/orders/${orderId}`);
        } catch (error) {
            console.error(`Error fetching order ${orderId}:`, error);
            return null;
        }
    }

    // Cart API methods
    async getCart(): Promise<Cart> {
        try {
            const cartData = await this.get<CartItem[]>('/cart');

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

            return cart;
        } catch (error) {
            console.error('Error fetching cart:', error);
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
            // Fixed: Check if response contains updated cart to avoid second API call
            const addResponse = await this.post<any>('/cart/add', {
                product_id: productId,
                quantity,
            });

            // If backend returns updated cart in response, use it
            if (addResponse.cart) {
                return {
                    success: true,
                    cart: addResponse.cart,
                    message: addResponse.message || 'Item added to cart successfully',
                };
            }

            // Fallback: fetch cart if not included in add response
            const cart = await this.getCart();

            return {
                success: true,
                cart,
                message: 'Item added to cart successfully',
            };
        } catch (error) {
            console.error('Error adding to cart:', error);
            return {
                success: false,
                error: error instanceof ApiError ? error.message : 'Failed to add item to cart',
            };
        }
    }

    async removeFromCart(productId: number): Promise<CartActionResult> {
        try {
            await this.delete(`/cart/remove/${productId}`);
            const cart = await this.getCart(); // Get updated cart

            return {
                success: true,
                cart,
                message: 'Item removed from cart',
            };
        } catch (error) {
            console.error('Error removing from cart:', error);
            return {
                success: false,
                error: error instanceof ApiError ? error.message : 'Failed to remove item from cart',
            };
        }
    }

    // User API methods
    async syncUserWithClerk(clerkData: any): Promise<User | null> {
        try {
            return await this.post<User>('/api/user/sync', {
                clerk_id: clerkData.id,
                email: clerkData.emailAddresses?.[0]?.emailAddress || clerkData.email,
                first_name: clerkData.firstName,
                last_name: clerkData.lastName,
                image_url: clerkData.imageUrl,
            });
        } catch (error) {
            console.error('Error syncing user with Clerk:', error);
            return null;
        }
    }

    async getUser(clerkId: string): Promise<User | null> {
        try {
            return await this.get<User>(`/api/user/${clerkId}`);
        } catch (error) {
            console.error(`Error fetching user ${clerkId}:`, error);
            return null;
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
            console.error('Error getting auth token:', error);
            return null;
        }
    }

    /**
     * Set a custom token provider for client-side usage
     */
    setTokenProvider(provider: TokenProvider): void {
        this.tokenProvider = provider;
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