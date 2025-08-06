"use client";

import { Product, ProductListResponse, Category, Collection } from "../types/product";
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
    category_id?: number;
    category?: string; // Legacy support
    collection_id?: number;
    minPrice?: number; // Will be converted to cents
    maxPrice?: number; // Will be converted to cents
    featured?: boolean;
    status?: string;
    page?: number;
    pageSize?: number;
    sortBy?: string;
    sortOrder?: string;
}): Promise<ProductListResponse> => {
    const queryParams = new URLSearchParams();

    // Add filters to query params
    if (filters.name) queryParams.append("name", filters.name);
    if (filters.category_id) queryParams.append("category_id", filters.category_id.toString());
    if (filters.category && filters.category !== "All" && filters.category !== "") {
        queryParams.append("category", filters.category);
    }
    if (filters.collection_id) queryParams.append("collection_id", filters.collection_id.toString());

    // Convert dollar prices to cents for backend
    if (filters.minPrice) queryParams.append("min_price", (filters.minPrice * 100).toString());
    if (filters.maxPrice) queryParams.append("max_price", (filters.maxPrice * 100).toString());

    if (filters.featured !== undefined) queryParams.append("featured", filters.featured.toString());
    if (filters.status) queryParams.append("status", filters.status);
    if (filters.page) queryParams.append("page", filters.page.toString());
    if (filters.pageSize) queryParams.append("page_size", filters.pageSize.toString());
    if (filters.sortBy) queryParams.append("sort_by", filters.sortBy);
    if (filters.sortOrder) queryParams.append("sort_order", filters.sortOrder);

    try {
        const url = `${API_BASE_URL}/api/products?${queryParams.toString()}`;
        console.log('Fetching products from:', url);

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data: ProductListResponse = await response.json();
        console.log('Products response:', data);

        return data;
    } catch (error) {
        console.error("Error fetching products:", error);
        return {
            products: [],
            total: 0,
            page: 1,
            page_size: filters.pageSize || 20,
            total_pages: 0,
            has_next: false,
            has_prev: false
        };
    }
};

export const fetchProduct = async (productId: number): Promise<Product | null> => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/products/${productId}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch product: ${response.statusText}`);
        }

        const product: Product = await response.json();
        return product;
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

// ==========================================
// CATEGORY API FUNCTIONS - FIXED
// ==========================================

export const fetchCategories = async (options: {
    includeInactive?: boolean;
    featuredOnly?: boolean;
    parentId?: number;
} = {}): Promise<Category[]> => {
    const queryParams = new URLSearchParams();

    if (options.includeInactive) queryParams.append("include_inactive", "true");
    if (options.featuredOnly) queryParams.append("featured_only", "true");
    if (options.parentId !== undefined) queryParams.append("parent_id", options.parentId.toString());

    try {
        const url = `${API_BASE_URL}/categories?${queryParams.toString()}`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Failed to fetch categories: ${response.statusText}`);
        }

        // FIXED: Backend returns array directly, not nested object
        const data = await response.json();
        return data; // Changed from data.categories || []
    } catch (error) {
        console.error("Error fetching categories:", error);
        return [];
    }
};

export const fetchCategory = async (categoryId: number): Promise<Category | null> => {
    try {
        const response = await fetch(`${API_BASE_URL}/categories/${categoryId}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch category: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error fetching category:", error);
        return null;
    }
};

// ==========================================
// COLLECTION API FUNCTIONS - FIXED
// ==========================================

export const fetchCollections = async (options: {
    featuredOnly?: boolean;
    collectionType?: string;
    includeInactive?: boolean;
} = {}): Promise<Collection[]> => {
    const queryParams = new URLSearchParams();

    if (options.featuredOnly) queryParams.append("featured_only", "true");
    if (options.collectionType) queryParams.append("collection_type", options.collectionType);
    if (options.includeInactive) queryParams.append("include_inactive", "true");

    try {
        const url = `${API_BASE_URL}/collections?${queryParams.toString()}`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Failed to fetch collections: ${response.statusText}`);
        }

        // FIXED: Backend returns array directly, not nested object
        const data = await response.json();
        return data; // Changed from data.collections || []
    } catch (error) {
        console.error("Error fetching collections:", error);
        return [];
    }
};

export const fetchCollectionProducts = async (
    collectionId: number,
    page: number = 1,
    pageSize: number = 20
): Promise<ProductListResponse> => {
    try {
        const url = `${API_BASE_URL}/api/collections/${collectionId}/products?page=${page}&page_size=${pageSize}`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Failed to fetch collection products: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error fetching collection products:", error);
        return {
            products: [],
            total: 0,
            page: 1,
            page_size: pageSize,
            total_pages: 0,
            has_next: false,
            has_prev: false
        };
    }
};