"use-client";

import { useAuth } from "@clerk/nextjs";
import { Product } from "../types/product";
import { User } from "../types/user";
import { Order } from "../types/order";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const fetchProducts = async (filters: { name?: string; minPrice?: number; maxPrice?: number; category?: string }) => {
    const queryParams = new URLSearchParams();
    if (filters.name) queryParams.append("name", filters.name);
    if (filters.minPrice) queryParams.append("min_price", filters.minPrice.toString());
    if (filters.maxPrice) queryParams.append("max_price", filters.maxPrice.toString());
    if (filters.category) queryParams.append("category", filters.category);

    try {
        const response = await fetch(`${API_BASE_URL}/products?${queryParams.toString()}`);
        if (!response.ok) {
            throw new Error("Failed to fetch products");
        }
        return await response.json();
    } catch (error) {
        console.error("Error fetching products:", error);
        return [];
    }
};

export const fetchProduct = async (productId: number): Promise<Product | null> => {
    try {
        const response = await fetch(`${API_BASE_URL}/products/${productId}`);

        if (!response.ok) {
            throw new Error(`Failed to fetch product: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error fetching product:", error);
        return null;
    }
};

export const fetchUser = async (clerkId: string, token: string): Promise<User | null> => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/user/${clerkId}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`, // ✅ Pass the Clerk JWT
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch user: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error fetching user:", error);
        return null;
    }
};


export const fetchOrders = async (clerkId: string): Promise<Order[]> => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/orders/${clerkId}`);
        if (!response.ok) throw new Error("Failed to fetch orders");
        return await response.json();
    } catch (error) {
        console.error("Error fetching orders:", error);
        return [];
    }
};






