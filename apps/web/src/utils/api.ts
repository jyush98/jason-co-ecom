"use-client";

import { useAuth } from "@clerk/nextjs";
import { Product } from "../types/product";
import { User } from "../types/user";
import { Order } from "../types/order";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const cache = new Map(); // Simple in-memory cache

export const fetchProducts = async (filters: {
    name?: string;
    minPrice?: number;
    maxPrice?: number;
    category?: string;
    page?: number;
    pageSize?: number;
    sortBy?: string;
    sortOrder?: string;
}) => {
    const queryParams = new URLSearchParams();
    if (filters.name) queryParams.append("name", filters.name);
    if (filters.minPrice) queryParams.append("min_price", filters.minPrice.toString());
    if (filters.maxPrice) queryParams.append("max_price", filters.maxPrice.toString());
    if (filters.category && filters.category != "All" && filters.category != "") queryParams.append("category", filters.category);
    if (filters.page) queryParams.append("page", filters.page.toString());
    if (filters.pageSize) queryParams.append("page_size", filters.pageSize.toString());
    if (filters.sortBy) queryParams.append("sort_by", filters.sortBy);
    if (filters.sortOrder) queryParams.append("sort_order", filters.sortOrder);

    const cacheKey = queryParams.toString();
    if (cache.has(cacheKey)) {
        return cache.get(cacheKey); // ✅ Return cached response
    }

    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/products?${cacheKey}`);
        if (!response.ok) throw new Error("Failed to fetch products");
        const data = await response.json();
        cache.set(cacheKey, data); // ✅ Store response in cache
        return data;
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






