// types/cart.ts

import { Product } from './product';
import { Order, OrderItem, OrderStatus } from './order'; // Using your existing types

// Enhanced CartItem that works with your existing structure
export interface CartItem {
    product_id: number;
    quantity: number;
    product: {
        id: number;
        name: string;
        price: number;
        image_url?: string;
        category?: string;
        description?: string;
        display_theme?: string;
    };
    // Enhanced fields for premium cart experience
    saved_for_later?: boolean;
    date_added?: string;
    custom_options?: Record<string, string>; // For engravings, sizes, etc.
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

// Type guards
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