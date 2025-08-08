// types/cart.ts - Complete cart types that match your actual API

import { Order } from './order'; // ✅ FIXED: Only import what we actually use

// ✅ SIMPLE: CartItem matches what your API actually returns
export interface CartItem {
    product_id: number;
    quantity: number;
    product: {
        id: number;
        name: string;
        price: number;           // Price in cents from your API
        image_url?: string;
        category?: string;       // Simple string from your database
        description?: string;
        display_theme?: string;
    };
    // Optional enhanced fields
    saved_for_later?: boolean;
    date_added?: string;
    custom_options?: Record<string, string>;
}

// ✅ SIMPLE: Cart matches what your API actually returns
export interface Cart {
    id?: string;
    items: CartItem[];
    subtotal: number;           // Price in cents
    tax: number;               // Price in cents
    shipping: number;          // Price in cents
    total: number;             // Price in cents
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
    product: CartItem['product']; // Use the same product structure as cart
    date_saved: string;
    notes?: string;
}

// Recently viewed items
export interface RecentlyViewedItem {
    product_id: number;
    product: CartItem['product']; // Use the same product structure as cart
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

// Order details for confirmation pages
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

// ✅ FIXED: Type guards with proper typing instead of any
export const isValidCartItem = (item: unknown): item is CartItem => {
    return Boolean(
        item &&
        typeof item === 'object' &&
        'product_id' in item &&
        'quantity' in item &&
        'product' in item &&
        typeof (item as CartItem).product_id === 'number' &&
        typeof (item as CartItem).quantity === 'number' &&
        (item as CartItem).product &&
        typeof (item as CartItem).product.id === 'number' &&
        typeof (item as CartItem).product.name === 'string' &&
        typeof (item as CartItem).product.price === 'number'
    );
};

export const isValidShippingAddress = (address: unknown): address is ShippingAddress => {
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
        typeof (address as ShippingAddress).first_name === 'string' &&
        typeof (address as ShippingAddress).last_name === 'string' &&
        typeof (address as ShippingAddress).address_line_1 === 'string' &&
        typeof (address as ShippingAddress).city === 'string' &&
        typeof (address as ShippingAddress).state === 'string' &&
        typeof (address as ShippingAddress).postal_code === 'string' &&
        typeof (address as ShippingAddress).country === 'string'
    );
};

// ==========================================
// ADDITIONAL TYPE GUARDS
// ==========================================

export const isValidCart = (cart: unknown): cart is Cart => {
    return Boolean(
        cart &&
        typeof cart === 'object' &&
        'items' in cart &&
        'subtotal' in cart &&
        'total' in cart &&
        'currency' in cart &&
        Array.isArray((cart as Cart).items) &&
        typeof (cart as Cart).subtotal === 'number' &&
        typeof (cart as Cart).total === 'number' &&
        typeof (cart as Cart).currency === 'string'
    );
};

export const isValidPaymentMethod = (method: unknown): method is PaymentMethod => {
    return Boolean(
        method &&
        typeof method === 'object' &&
        'id' in method &&
        'type' in method &&
        typeof (method as PaymentMethod).id === 'string' &&
        ['card', 'paypal', 'apple_pay', 'google_pay'].includes((method as PaymentMethod).type)
    );
};

export const isValidShippingMethod = (method: unknown): method is ShippingMethod => {
    return Boolean(
        method &&
        typeof method === 'object' &&
        'id' in method &&
        'name' in method &&
        'price' in method &&
        typeof (method as ShippingMethod).id === 'string' &&
        typeof (method as ShippingMethod).name === 'string' &&
        typeof (method as ShippingMethod).price === 'number'
    );
};

// Cart utility functions
export const getCartItemTotal = (item: CartItem): number => {
    return item.product.price * item.quantity;
};

export const getCartSubtotal = (items: CartItem[]): number => {
    return items.reduce((total, item) => total + getCartItemTotal(item), 0);
};

export const getCartItemCount = (items: CartItem[]): number => {
    return items.reduce((count, item) => count + item.quantity, 0);
};

export const findCartItem = (items: CartItem[], productId: number): CartItem | undefined => {
    return items.find(item => item.product_id === productId);
};