// File: web/src/lib/api/api.ts (create new file)
import { apiClient } from './client';

// Product API functions
export const fetchProducts = async (filters: any = {}) => {
    try {
        return await apiClient.getProducts(filters);
    } catch (error) {
        console.error('❌ Error fetching products:', error);
        return {
            products: [],
            total: 0,
            page: 1,
            page_size: 20,
            total_pages: 0,
            has_next: false,
            has_prev: false
        };
    }
};

export const fetchProduct = async (productId: number) => {
    try {
        return await apiClient.getProduct(productId);
    } catch (error) {
        console.error('❌ Error fetching product:', error);
        return null;
    }
};

// User API functions
export const fetchUser = async (clerkId: string, token: string) => {
    try {
        const clientWithAuth = apiClient;
        clientWithAuth.setTokenProvider({ getToken: async () => token });

        return await clientWithAuth.getUser(clerkId);
    } catch (error) {
        console.error('❌ Error fetching user:', error);
        return null;
    }
};

// Order API functions
export const fetchOrders = async (clerkId: string, token?: string) => {
    try {
        if (token) {
            const clientWithAuth = apiClient;
            clientWithAuth.setTokenProvider({ getToken: async () => token });
        }

        return await apiClient.getOrders(clerkId);
    } catch (error) {
        console.error('❌ Error fetching orders:', error);
        return [];
    }
};

// Contact API function
export const submitContactInquiry = async (data: any) => {
    try {
        return await apiClient.submitContactInquiry(data);
    } catch (error) {
        console.error('❌ Error submitting contact inquiry:', error);
        throw error;
    }
};