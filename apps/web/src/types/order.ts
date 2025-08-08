// types/order.ts - SIMPLIFIED to match your actual API response

export interface OrderItem {
    id: number;
    product_id: number;
    product_name: string;
    unit_price: number;
    quantity: number;
    display_theme?: string; // Added for display theme
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

// ✅ FIXED: Proper address interface instead of any
export interface Address {
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
}

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

    // ✅ FIXED: Addresses with proper typing (JSON fields from your model)
    shipping_address?: Address;
    billing_address?: Address;

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

// ==========================================
// UTILITY TYPES
// ==========================================

export type OrderItemKey = keyof OrderItem;
export type OrderKey = keyof Order;

// ==========================================
// TYPE GUARDS
// ==========================================

export const isValidOrderStatus = (status: string): status is OrderStatus => {
    const validStatuses: OrderStatus[] = [
        "pending", "processing", "confirmed", "shipped",
        "delivered", "completed", "cancelled", "failed"
    ];
    return validStatuses.includes(status as OrderStatus);
};

export const isValidAddress = (address: unknown): address is Address => {
    return Boolean(
        address &&
        typeof address === 'object' &&
        'first_name' in address &&
        'last_name' in address &&
        'address_line_1' in address &&
        'city' in address &&
        'state' in address &&
        'postal_code' in address &&
        'country' in address &&
        typeof (address as Address).first_name === 'string' &&
        typeof (address as Address).last_name === 'string' &&
        typeof (address as Address).address_line_1 === 'string' &&
        typeof (address as Address).city === 'string' &&
        typeof (address as Address).state === 'string' &&
        typeof (address as Address).postal_code === 'string' &&
        typeof (address as Address).country === 'string'
    );
};

export const isValidOrder = (order: unknown): order is Order => {
    return Boolean(
        order &&
        typeof order === 'object' &&
        'id' in order &&
        'order_number' in order &&
        'total_price' in order &&
        'status' in order &&
        'created_at' in order &&
        'items' in order &&
        typeof (order as Order).id === 'number' &&
        typeof (order as Order).order_number === 'string' &&
        typeof (order as Order).total_price === 'number' &&
        isValidOrderStatus((order as Order).status) &&
        typeof (order as Order).created_at === 'string' &&
        Array.isArray((order as Order).items)
    );
};

// ==========================================
// CONSTANTS
// ==========================================

export const ORDER_STATUSES: OrderStatus[] = [
    "pending",
    "processing",
    "confirmed",
    "shipped",
    "delivered",
    "completed",
    "cancelled",
    "failed"
] as const;

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
    pending: "Payment Pending",
    processing: "Processing",
    confirmed: "Order Confirmed",
    shipped: "Shipped",
    delivered: "Delivered",
    completed: "Completed",
    cancelled: "Cancelled",
    failed: "Failed"
} as const;