"use client";

import { Product } from "../types/product";
import { User } from "../types/user";
import { Order } from "../types/order";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const cache = new Map(); // Simple in-memory cache

export interface ContactInquiryData {
    name: string
    email: string
    phone?: string
    company?: string
    subject: string
    message: string
    budget_range?: string
    timeline?: string
    preferred_location?: string
    preferred_contact: string[]
}

export interface ConsultationBookingData {
    name: string
    email: string
    phone?: string
    consultation_type: string
    preferred_date?: string
    project_description?: string
    budget_range?: string
    timeline?: string
}

export interface LocationNotificationData {
    email: string
    location_id: string
}

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
        const url = `${API_BASE_URL}/products?${cacheKey}`;
        console.log('Fetching from URL:', url); // Debug log

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Raw API response:', data); // Debug log

        // Ensure consistent return format
        const normalizedData = {
            products: Array.isArray(data) ? data : (data.products || data.items || []),
            total: data.total || data.count || (Array.isArray(data) ? data.length : 0),
            page: data.page || 1,
            pageSize: data.pageSize || data.page_size || filters.pageSize || 10
        };

        console.log('Normalized data:', normalizedData); // Debug log

        cache.set(cacheKey, normalizedData); // ✅ Store response in cache
        return normalizedData;
    } catch (error) {
        console.error("Error fetching products:", error);
        // Return consistent format even on error
        return {
            products: [],
            total: 0,
            page: 1,
            pageSize: filters.pageSize || 10
        };
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

export async function submitContactInquiry(data: ContactInquiryData) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/contact/inquiry`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        })

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }

        return await response.json()
    } catch (error) {
        console.error('Contact inquiry submission failed:', error)
        throw error
    }
}

// Consultation booking
export async function bookConsultation(data: ConsultationBookingData) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/contact/consultation`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        })

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }

        return await response.json()
    } catch (error) {
        console.error('Consultation booking failed:', error)
        throw error
    }
}

// Location notification signup
export async function subscribeLocationNotification(data: LocationNotificationData) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/contact/location-notify`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        })

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }

        return await response.json()
    } catch (error) {
        console.error('Location notification signup failed:', error)
        throw error
    }
}

// Get business hours
export async function getBusinessHours() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/contact/hours`)

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }

        return await response.json()
    } catch (error) {
        console.error('Failed to fetch business hours:', error)
        throw error
    }
}
