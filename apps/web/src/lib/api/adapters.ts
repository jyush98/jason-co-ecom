// lib/api/adapters.ts
// Type adapters that match your EXACT type definitions

// Import your actual domain types
import { User } from '@/types/user';
import { Cart, CartItem } from '@/types/cart';
import { Order, OrderStatus } from '@/types/order';

// Import API types
import { UserResponse, Cart as ApiCart, CartItem as ApiCartItem, OrderResponse, UserStatus, UserRole, OrderStatus as ApiOrderStatus, PaymentStatus } from './types';

// =============================================================================
// USER ADAPTERS
// =============================================================================

/**
 * Convert User to UserResponse for API compatibility
 */
export const adaptUserToUserResponse = (user: User): UserResponse => ({
    id: user.id,
    email: user.email,
    first_name: user.first_name,
    last_name: user.last_name,
    // Use proper enum values
    status: UserStatus.ACTIVE,
    role: UserRole.CUSTOMER,
    created_at: user.created_at || new Date().toISOString(),
    updated_at: user.created_at || new Date().toISOString(),
    email_verified: true,
    clerk_id: user.clerk_id || '', // Add clerk_id property
});

/**
 * Convert UserResponse to User for domain use
 */
export const adaptUserResponseToUser = (userResponse: UserResponse): User => ({
    id: userResponse.id,
    clerk_id: '', // Will be filled by actual Clerk data
    email: userResponse.email,
    first_name: userResponse.first_name,
    last_name: userResponse.last_name,
    created_at: userResponse.created_at,
});

// =============================================================================
// CART ADAPTERS
// =============================================================================

/**
 * Convert CartItem to ApiCartItem for API compatibility
 */
export const adaptCartItemToApi = (item: CartItem): ApiCartItem => ({
    product_id: item.product_id,
    quantity: item.quantity,
    product: item.product,
    // Add required API fields
    unit_price: item.product.price,
    total_price: item.product.price * item.quantity,
    // Optional fields
    saved_for_later: item.saved_for_later,
    custom_options: item.custom_options,
});

/**
 * Convert ApiCartItem to CartItem for domain use
 */
export const adaptApiCartItemToCart = (apiItem: ApiCartItem): CartItem => ({
    product_id: apiItem.product_id,
    quantity: apiItem.quantity,
    product: apiItem.product,
    // Optional fields
    saved_for_later: apiItem.saved_for_later,
    custom_options: apiItem.custom_options,
});

/**
 * Convert Cart to ApiCart for API compatibility
 */
export const adaptCartToApi = (cart: Cart): ApiCart => ({
    id: cart.id,
    items: cart.items.map(adaptCartItemToApi),
    subtotal: cart.subtotal,
    tax: cart.tax,
    shipping: cart.shipping,
    total: cart.total,
    item_count: cart.item_count,
    promo_code: cart.promo_code,
    promo_discount: cart.promo_discount,
    currency: cart.currency,
    last_updated: cart.last_updated,
});

/**
 * Convert ApiCart to Cart for domain use
 */
export const adaptApiCartToCart = (apiCart: ApiCart): Cart => ({
    id: apiCart.id,
    items: apiCart.items.map(adaptApiCartItemToCart),
    subtotal: apiCart.subtotal,
    tax: apiCart.tax,
    shipping: apiCart.shipping,
    total: apiCart.total,
    item_count: apiCart.item_count,
    promo_code: apiCart.promo_code,
    promo_discount: apiCart.promo_discount,
    currency: apiCart.currency,
    last_updated: apiCart.last_updated,
});

/**
 * Convert array of CartItems (from your current API) to Cart object
 */
export const adaptCartArrayToCart = (cartItems: CartItem[], userId?: string): Cart => {
    const subtotal = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    const tax = Math.round(subtotal * 0.08); // 8% tax in cents
    const shipping = subtotal > 10000 ? 0 : 1000; // Free shipping over $100 (10000 cents)

    return {
        id: userId ? `cart_${userId}` : undefined,
        items: cartItems,
        subtotal,
        tax,
        shipping,
        total: subtotal + tax + shipping,
        item_count: cartItems.reduce((count, item) => count + item.quantity, 0),
        currency: 'USD',
        last_updated: new Date().toISOString(),
    };
};

// =============================================================================
// ORDER ADAPTERS
// =============================================================================

/**
 * Map OrderStatus between domain and API
 */
const mapOrderStatusToApi = (status: OrderStatus): ApiOrderStatus => {
    const statusMap: Record<OrderStatus, ApiOrderStatus> = {
        'pending': 'PENDING' as ApiOrderStatus,
        'processing': 'PROCESSING' as ApiOrderStatus,
        'confirmed': 'CONFIRMED' as ApiOrderStatus,
        'shipped': 'SHIPPED' as ApiOrderStatus,
        'delivered': 'DELIVERED' as ApiOrderStatus,
        'completed': 'COMPLETED' as ApiOrderStatus,
        'cancelled': 'CANCELLED' as ApiOrderStatus,
        'failed': 'FAILED' as ApiOrderStatus,
    };
    return statusMap[status] || 'PENDING' as ApiOrderStatus;
};

/**
 * Map OrderStatus from API to domain
 */
const mapOrderStatusFromApi = (status: ApiOrderStatus): OrderStatus => {
    const statusMap: Record<string, OrderStatus> = {
        'PENDING': 'pending',
        'PROCESSING': 'processing',
        'CONFIRMED': 'confirmed',
        'SHIPPED': 'shipped',
        'DELIVERED': 'delivered',
        'COMPLETED': 'completed',
        'CANCELLED': 'cancelled',
        'FAILED': 'failed',
    };
    return statusMap[status as string] || 'pending';
};

/**
 * Convert Order to OrderResponse for API compatibility
 */
export const adaptOrderToOrderResponse = (order: Order): OrderResponse => {
    return {
        id: order.id,
        order_number: order.order_number,
        status: mapOrderStatusToApi(order.status),
        payment_status: 'COMPLETED' as PaymentStatus,
        total: order.total_price,
        subtotal: order.subtotal || order.total_price,
        tax: order.tax_amount || 0,
        created_at: order.created_at,
        updated_at: order.created_at,

        // Map items
        items: order.items.map(item => ({
            id: item.id,
            product_id: item.product_id,
            product: {
                id: item.product_id,
                name: item.product_name,
                price: item.unit_price,
                image_url: item.product_image_url || '',
                category: item.product_category || '',
                description: '',
            },
            quantity: item.quantity,
            unit_price: item.unit_price,
            total_price: item.unit_price * item.quantity,
        })),

        // Map shipping address (without email/phone if API doesn't support them)
        shipping_address: order.shipping_address ? {
            first_name: order.shipping_address.first_name,
            last_name: order.shipping_address.last_name,
            address_line_1: order.shipping_address.address_line_1,
            address_line_2: order.shipping_address.address_line_2,
            city: order.shipping_address.city,
            state: order.shipping_address.state,
            postal_code: order.shipping_address.postal_code,
            country: order.shipping_address.country,
        } : {
            first_name: '',
            last_name: '',
            address_line_1: '',
            city: '',
            state: '',
            postal_code: '',
            country: 'US',
        },

        // Optional fields
        billing_address: order.billing_address,
        tracking_number: order.shipping_tracking_number,
        notes: order.order_notes,
        shipping_cost: 0,
        discount: 0,
    };
};

/**
 * Convert OrderResponse to Order for domain use
 */
export const adaptOrderResponseToOrder = (orderResponse: OrderResponse): Order => ({
    id: orderResponse.id,
    order_number: orderResponse.order_number,
    total_price: orderResponse.total,
    status: mapOrderStatusFromApi(orderResponse.status),
    created_at: orderResponse.created_at,

    // Map additional fields
    subtotal: orderResponse.subtotal,
    tax_amount: orderResponse.tax,

    // Map items
    items: orderResponse.items.map(item => ({
        id: item.id,
        product_id: item.product_id,
        product_name: item.product.name,
        unit_price: item.unit_price,
        quantity: item.quantity,
        product_image_url: item.product.image_url,
        product_category: item.product.category,
        custom_options: item.custom_options,
    })),

    // Map addresses
    shipping_address: orderResponse.shipping_address,
    billing_address: orderResponse.billing_address,

    // Map shipping info
    // shipping_method_name: orderResponse.shipping_method?.name,
    shipping_tracking_number: orderResponse.tracking_number,

    // Optional fields
    order_notes: orderResponse.notes,
});

/**
 * Convert array of Orders to OrderResponse array
 */
export const adaptOrderArrayToOrderResponseArray = (orders: Order[]): OrderResponse[] => {
    return orders.map(order => adaptOrderToOrderResponse(order));
};

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Type guard to check if object is UserResponse
 */
export const isUserResponse = (user: any): user is UserResponse => {
    return user &&
        typeof user.status === 'string' &&
        typeof user.role === 'string' &&
        typeof user.created_at === 'string';
};

/**
 * Type guard to check if object is ApiCart
 */
export const isApiCart = (cart: any): cart is ApiCart => {
    return cart &&
        typeof cart.total === 'number' &&
        typeof cart.subtotal === 'number' &&
        Array.isArray(cart.items);
};

/**
 * Type guard to check if object is OrderResponse
 */
export const isOrderResponse = (order: any): order is OrderResponse => {
    return order &&
        typeof order.order_number === 'string' &&
        typeof order.payment_status === 'string' &&
        Array.isArray(order.items);
};

// =============================================================================
// SAFE ADAPTER HELPERS FOR COMMON USE CASES
// =============================================================================

/**
 * Smart adapter that handles multiple cart formats
 */
export const adaptToCart = (data: Cart | ApiCart | CartItem[], userId?: string): Cart => {
    if (Array.isArray(data)) {
        // Your API returns CartItem[] - convert to Cart
        return adaptCartArrayToCart(data, userId);
    } else if (isApiCart(data)) {
        // API returned full Cart object - convert from API format
        return adaptApiCartToCart(data);
    } else {
        // Already a domain Cart object
        return data;
    }
};

/**
 * Smart adapter that handles multiple user formats
 */
export const adaptToUser = (data: User | UserResponse): User => {
    if (isUserResponse(data)) {
        return adaptUserResponseToUser(data);
    } else {
        return data; // Already a User
    }
};

/**
 * Smart adapter that handles multiple order formats
 */
export const adaptToOrderResponse = (data: Order | OrderResponse): OrderResponse => {
    if (isOrderResponse(data)) {
        return data; // Already OrderResponse
    } else {
        return adaptOrderToOrderResponse(data);
    }
};

// =============================================================================
// SAFE ERROR HANDLING HELPERS
// =============================================================================

/**
 * Safe adapter that won't throw on invalid data
 */
export const safeAdaptToCart = (data: unknown, userId?: string): Cart | null => {
    try {
        if (Array.isArray(data)) {
            // Validate array items are CartItems
            const validItems = data.filter(item =>
                item &&
                typeof item.product_id === 'number' &&
                typeof item.quantity === 'number' &&
                item.product &&
                typeof item.product.price === 'number'
            ) as CartItem[];

            return adaptCartArrayToCart(validItems, userId);
        }

        if (data && typeof data === 'object' && 'items' in data) {
            return adaptToCart(data as Cart | ApiCart, userId);
        }

        return null;
    } catch (error) {
        console.error('Failed to adapt cart data:', error);
        return null;
    }
};

/**
 * Safe user adapter
 */
export const safeAdaptToUser = (data: unknown): User | null => {
    try {
        if (data && typeof data === 'object' && 'id' in data && 'email' in data) {
            return adaptToUser(data as User | UserResponse);
        }
        return null;
    } catch (error) {
        console.error('Failed to adapt user data:', error);
        return null;
    }
};