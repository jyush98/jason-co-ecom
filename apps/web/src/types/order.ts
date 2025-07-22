// types/order.ts - SIMPLIFIED to match your actual API response

export interface OrderItem {
    id: number;
    product_id: number;
    product_name: string;
    unit_price: number;
    quantity: number;
    // From your enhanced model
    product_image_url?: string;
    product_category?: string;
    custom_options?: Record<string, string>;
}

export type OrderStatus =
    | "pending"
    | "processing"
    | "confirmed"
    | "shipped"
    | "delivered"
    | "completed"
    | "cancelled"
    | "failed";

// Main Order interface - matches your Python model exactly
export interface Order {
    id: number;
    order_number: string;
    user_id?: string;
    total_price: number;
    status: OrderStatus;
    created_at: string;

    // Enhanced fields from your Python model
    customer_first_name?: string;
    customer_last_name?: string;
    customer_email?: string;
    customer_phone?: string;

    // Financial breakdown
    subtotal?: number;
    tax_amount?: number;
    shipping_amount?: number;
    discount_amount?: number;

    // Addresses (JSON fields from your model)
    shipping_address?: {
        first_name: string;
        last_name: string;
        address_line_1: string;
        address_line_2?: string;
        city: string;
        state: string;
        postal_code: string;
        country: string;
        email?: string;
        phone?: string;
    };
    billing_address?: any;

    // Shipping info
    shipping_method_name?: string;
    shipping_tracking_number?: string;
    estimated_delivery_date?: string;

    // Payment info
    payment_method_last4?: string;
    payment_method_brand?: string;

    // Items
    items: OrderItem[];

    // Optional fields
    order_notes?: string;
    is_gift?: boolean;
    gift_message?: string;
}

// Simple derived type for order lists
export interface OrderSummary {
    id: number;
    order_number: string;
    total_price: number;
    status: OrderStatus;
    created_at: string;
    customer_name?: string;
    item_count: number;
}

// API Response types
export interface OrderResponse {
    success: boolean;
    order?: Order;
    error?: string;
}

export interface OrdersListResponse {
    success: boolean;
    orders?: OrderSummary[];
    total?: number;
    error?: string;
}