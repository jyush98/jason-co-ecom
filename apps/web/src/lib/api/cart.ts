// File: web/src/lib/api/cart.ts (create new file)
import { apiClient } from './client';

export const getCart = async (token: string) => {
    try {
        // Set token provider for this request
        const clientWithAuth = apiClient;
        clientWithAuth.setTokenProvider({ getToken: async () => token });

        return await clientWithAuth.getCart();
    } catch (error) {
        console.error('❌ Error in getCart:', error);
        throw error;
    }
};

export const addToCart = async (productId: number, quantity: number, token: string) => {
    try {
        const clientWithAuth = apiClient;
        clientWithAuth.setTokenProvider({ getToken: async () => token });

        return await clientWithAuth.addToCart(productId, quantity);
    } catch (error) {
        console.error('❌ Error in addToCart:', error);
        throw error;
    }
};

export const removeFromCart = async (productId: number, token: string) => {
    try {
        const clientWithAuth = apiClient;
        clientWithAuth.setTokenProvider({ getToken: async () => token });

        return await clientWithAuth.removeFromCart(productId);
    } catch (error) {
        console.error('❌ Error in removeFromCart:', error);
        throw error;
    }
};