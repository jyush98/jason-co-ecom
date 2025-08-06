// types/cart.ts - UPDATED to fix TypeScript errors

import { Product } from './product';
import { Order, OrderItem, OrderStatus } from './order'; // Using your existing types

// Enhanced CartItem that works with GA4 tracking - FIXED
export interface CartItem {
    product_id: number;
    quantity: number;
    product: {
        // Core required fields
        id: number;
        name: string;
        price: number;

        // Optional fields from your current API
        image_url?: string;
        category?: string;
        description?: string;
        display_theme?: string;

        // ADDED: Required fields for GA4 compatibility
        image_urls?: string[]; // Default to [image_url] or []
        featured: boolean; // Default to false
        details?: Record<string, any>; // Default to {} or {display_theme}

        // ADDED: Additional fields that may be expected
        price_display?: string; // Formatted price like "$24.99"
        in_stock?: boolean; // Default to true
        inventory_count?: number; // Default to 1
        track_inventory?: boolean; // Default to false
        average_rating?: number; // Default to 0
        created_at?: string; // Default to current timestamp
    };

    // Enhanced fields for premium cart experience
    saved_for_later?: boolean;
    date_added?: string;
    custom_options?: Record<string, string>; // For engravings, sizes, etc.
}

// Alternative: CartProduct type that matches your API exactly
export interface CartProduct {
    id: number;
    name: string;
    price: number;
    image_url?: string;
    category?: string;
    description?: string;
    display_theme?: string;

    // Required for GA4 compatibility - with defaults
    image_urls: string[];
    featured: boolean;
    details: Record<string, any>;
    price_display: string;
    in_stock: boolean;
    inventory_count: number;
    track_inventory: boolean;
    average_rating: number;
    created_at: string;

    // Status fields
    status?: 'active' | 'draft' | 'archived';
    searchable?: boolean;
    available_online?: boolean;
    view_count?: number;
    review_count?: number;
}

// Cart state and operations
export interface Cart {
    id?: string;
    items: CartItem[];
    subtotal: number;
    tax: number;
    shipping: number;
    total: number;
    item_count: number;
    promo_code?: string;
    promo_discount?: number;
    currency: string;
    last_updated: string;
}

// Cart drawer state
export interface CartDrawerState {
    isOpen: boolean;
    isLoading: boolean;
    error: string | null;
    lastAddedItem?: CartItem;
}

// Checkout types
export type CheckoutStep = 'shipping' | 'payment' | 'review';

export interface ShippingAddress {
    first_name: string;
    last_name: string;
    email?: string; // For guest checkout
    phone?: string;
    address_line_1: string;
    address_line_2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
}

export interface ShippingMethod {
    id: string;
    name: string;
    description: string;
    price: number;
    estimated_days: string;
    is_express: boolean;
}

export interface PaymentMethod {
    id: string;
    type: 'card' | 'paypal' | 'apple_pay' | 'google_pay';
    last_four?: string;
    brand?: string;
    exp_month?: number;
    exp_year?: number;
    is_default?: boolean;
}

export interface CheckoutFormData {
    shipping_address: ShippingAddress;
    billing_address?: ShippingAddress;
    shipping_method?: ShippingMethod;
    payment_method?: PaymentMethod;
    order_notes?: string;
    gift_options?: {
        is_gift: boolean;
        gift_message?: string;
        gift_wrapping?: boolean;
    };
    marketing_consent?: boolean;
}

export interface CheckoutState {
    current_step: CheckoutStep;
    form_data: Partial<CheckoutFormData>;
    available_shipping_methods: ShippingMethod[];
    selected_shipping_method?: ShippingMethod;
    is_guest_checkout: boolean;
    validation_errors: Record<string, string>;
    is_loading: boolean;
    is_submitting: boolean;
    error: string | null;
}

// Promo code types
export interface PromoCode {
    code: string;
    type: 'percentage' | 'fixed_amount' | 'free_shipping';
    value: number;
    minimum_order?: number;
    expires_at?: string;
    description?: string;
}

// Enhanced order types that extend your existing Order interface
export interface CheckoutOrderPreview extends Omit<Order, 'id' | 'created_at' | 'status'> {
    estimated_delivery?: string;
    shipping_method: ShippingMethod;
    shipping_address: ShippingAddress;
    billing_address?: ShippingAddress;
    subtotal: number;
    tax: number;
    shipping_cost: number;
    promo_discount?: number;
    gift_options?: CheckoutFormData['gift_options'];
}

// Cart operation results
export interface CartActionResult {
    success: boolean;
    message?: string;
    cart?: Cart;
    error?: string;
}

export interface AddToCartParams {
    product_id: number;
    quantity: number;
    custom_options?: Record<string, string>;
}

export interface UpdateCartItemParams {
    product_id: number;
    quantity?: number;
    saved_for_later?: boolean;
    custom_options?: Record<string, string>;
}

// Cart analytics and tracking
export interface CartAnalytics {
    cart_abandonment_time?: number;
    source_page?: string;
    utm_campaign?: string;
    referrer?: string;
    device_type?: 'mobile' | 'tablet' | 'desktop';
}

// Saved items / Wishlist
export interface SavedItem {
    id: string;
    product_id: number;
    product: Product;
    date_saved: string;
    notes?: string;
}

// Recently viewed items
export interface RecentlyViewedItem {
    product_id: number;
    product: Product;
    viewed_at: string;
}

// Cart validation
export interface CartValidation {
    is_valid: boolean;
    errors: string[];
    warnings: string[];
    max_quantity_exceeded?: boolean;
    out_of_stock_items?: number[];
    price_changes?: Array<{
        product_id: number;
        old_price: number;
        new_price: number;
    }>;
}

// Express checkout types (for future Apple Pay, Google Pay)
export interface ExpressCheckoutSession {
    session_id: string;
    payment_method: 'apple_pay' | 'google_pay' | 'shop_pay';
    amount: number;
    currency: string;
    merchant_info: {
        name: string;
        domain: string;
    };
}

// Cart storage types for persistence
export interface CartStorage {
    cart_data: Cart;
    checkout_data?: Partial<CheckoutFormData>;
    last_sync: string;
    version: string;
}

// API response types
export interface CartApiResponse {
    success: boolean;
    data?: Cart;
    message?: string;
    errors?: string[];
}

export interface CheckoutApiResponse {
    success: boolean;
    data?: {
        order_id: number;
        payment_url?: string;
        order_number: string;
    };
    message?: string;
    errors?: string[];
}

// Event types for cart actions
export type CartEvent =
    | { type: 'ITEM_ADDED'; payload: { item: CartItem; cart: Cart } }
    | { type: 'ITEM_REMOVED'; payload: { product_id: number; cart: Cart } }
    | { type: 'QUANTITY_UPDATED'; payload: { product_id: number; quantity: number; cart: Cart } }
    | { type: 'CART_CLEARED'; payload: { cart: Cart } }
    | { type: 'PROMO_APPLIED'; payload: { code: string; discount: number; cart: Cart } }
    | { type: 'CHECKOUT_STARTED'; payload: { cart: Cart } }
    | { type: 'ORDER_COMPLETED'; payload: { order: Order } };

// Component prop types
export interface CartItemProps {
    item: CartItem;
    onUpdateQuantity: (product_id: number, quantity: number) => void;
    onRemove: (product_id: number) => void;
    onSaveForLater?: (product_id: number) => void;
    isLoading?: boolean;
    showSaveForLater?: boolean;
    showCustomOptions?: boolean;
}

export interface CartSummaryProps {
    cart: Cart;
    showPromoCode?: boolean;
    showShipping?: boolean;
    showTax?: boolean;
    onApplyPromoCode?: (code: string) => void;
    isCheckout?: boolean;
}

export interface CheckoutStepProps {
    step: CheckoutStep;
    isActive: boolean;
    isCompleted: boolean;
    onClick?: (step: CheckoutStep) => void;
}

export interface OrderDetails {
    id: number;
    order_number: string;
    total_price: number;
    status: string;
    created_at: string;
    item_count: number;
    tracking_number?: string;
    estimated_delivery?: string;

    // Detailed info
    items: OrderItemDetails[];
    shipping_address: ShippingAddress;
    billing_address?: ShippingAddress;
    payment_method: string;
    shipping_method: string;
    subtotal: number;
    tax: number;
    shipping_cost: number;
    discount?: number;
    notes?: string;
    status_history?: OrderStatusUpdate[];
}

export interface OrderItemDetails {
    id: number;
    product_id: number;
    product_name: string;
    unit_price: number;
    quantity: number;
    product_image?: string;
    product_category?: string;
    custom_options?: Record<string, string>;
}

export interface OrderStatusUpdate {
    status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    timestamp: string;
    note?: string;
    location?: string;
}

// Utility types
export type CartItemKey = keyof CartItem;
export type CheckoutFormKey = keyof CheckoutFormData;
export type ShippingAddressKey = keyof ShippingAddress;

// ==========================================
// TYPE GUARDS AND UTILITIES - UPDATED
// ==========================================

export const isValidCartItem = (item: any): item is CartItem => {
    return (
        typeof item === 'object' &&
        typeof item.product_id === 'number' &&
        typeof item.quantity === 'number' &&
        typeof item.product === 'object' &&
        typeof item.product.id === 'number' &&
        typeof item.product.name === 'string' &&
        typeof item.product.price === 'number'
    );
};

export const isValidShippingAddress = (address: any): address is ShippingAddress => {
    return (
        typeof address === 'object' &&
        typeof address.first_name === 'string' &&
        typeof address.last_name === 'string' &&
        typeof address.address_line_1 === 'string' &&
        typeof address.city === 'string' &&
        typeof address.state === 'string' &&
        typeof address.postal_code === 'string' &&
        typeof address.country === 'string'
    );
};

// ==========================================
// CART ITEM ENHANCEMENT UTILITIES - NEW
// ==========================================

/**
 * Enhance a cart item with required fields for GA4 compatibility
 * This ensures your cart items have all the fields needed for analytics
 */
export const enhanceCartItem = (item: CartItem): CartItem => {
    const enhanced: CartItem = {
        ...item,
        product: {
            ...item.product,
            // Ensure required fields exist with sensible defaults
            image_urls: item.product.image_urls || (item.product.image_url ? [item.product.image_url] : []),
            featured: item.product.featured ?? false,
            details: item.product.details || (item.product.display_theme ? { display_theme: item.product.display_theme } : {}),
            price_display: item.product.price_display || `$${(item.product.price / 100).toFixed(2)}`,
            in_stock: item.product.in_stock ?? true,
            inventory_count: item.product.inventory_count ?? 1,
            track_inventory: item.product.track_inventory ?? false,
            average_rating: item.product.average_rating ?? 0,
            created_at: item.product.created_at || new Date().toISOString()
        }
    };

    return enhanced;
};

/**
 * Enhance an array of cart items
 */
export const enhanceCartItems = (items: CartItem[]): CartItem[] => {
    return items.map(enhanceCartItem);
};

/**
 * Convert CartItem to Product format for GA4 tracking
 * This creates a Product-compatible object from your cart item
 */
export const cartItemToProduct = (item: CartItem): Product => {
    const enhanced = enhanceCartItem(item);

    return {
        id: enhanced.product.id,
        name: enhanced.product.name,
        price: enhanced.product.price,
        price_display: enhanced.product.price_display!,
        image_url: enhanced.product.image_url,
        image_urls: enhanced.product.image_urls!,
        featured: enhanced.product.featured!,
        details: enhanced.product.details!,
        in_stock: enhanced.product.in_stock!,
        inventory_count: enhanced.product.inventory_count!,
        track_inventory: enhanced.product.track_inventory!,
        average_rating: enhanced.product.average_rating!,
        created_at: enhanced.product.created_at!,
        description: enhanced.product.description,
        category_name: enhanced.product.category,
        display_theme: enhanced.product.display_theme,

        // Additional required Product fields with defaults
        inventory_policy: 'continue',
        status: 'active',
        searchable: true,
        available_online: true,
        view_count: 0,
        review_count: 0
    } as Product;
};