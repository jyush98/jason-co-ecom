// utils/cartUtils.ts

import { Cart, CartItem, ShippingAddress } from '@/types/cart';
import { CART_CONFIG, formatCartPrice } from '@/config';

// Cart calculation utilities
export const calculateCartSubtotal = (items: CartItem[]): number => {
    return items.reduce((total, item) => {
        return total + (item.product.price * item.quantity);
    }, 0);
};

export const calculateCartItemCount = (items: CartItem[]): number => {
    return items.reduce((count, item) => count + item.quantity, 0);
};

export const calculateCartTax = (subtotal: number, taxRate: number = 0.08): number => {
    return subtotal * taxRate;
};

export const calculateShippingCost = (
    subtotal: number,
    items: CartItem[],
    address?: ShippingAddress
): number => {
    // Free shipping threshold (configurable)
    const freeShippingThreshold = 500;

    if (subtotal >= freeShippingThreshold) {
        return 0;
    }

    // Basic shipping calculation - can be enhanced with real shipping APIs
    const baseShipping = 15;
    const itemWeight = items.length * 0.5; // Approximate weight per item
    const weightSurcharge = itemWeight > 2 ? (itemWeight - 2) * 2 : 0;

    return baseShipping + weightSurcharge;
};

export const calculateCartTotal = (
    subtotal: number,
    tax: number = 0,
    shipping: number = 0,
    discount: number = 0
): number => {
    return Math.max(0, subtotal + tax + shipping - discount);
};

// Cart validation utilities
export const validateCartItem = (item: CartItem): string[] => {
    const errors: string[] = [];

    if (!item.product_id || item.product_id <= 0) {
        errors.push('Invalid product ID');
    }

    if (!item.quantity || item.quantity <= 0) {
        errors.push('Quantity must be greater than 0');
    }

    if (item.quantity > CART_CONFIG.features.maxQuantityPerItem) {
        errors.push(`Quantity cannot exceed ${CART_CONFIG.features.maxQuantityPerItem}`);
    }

    if (!item.product || !item.product.name || !item.product.price) {
        errors.push('Invalid product information');
    }

    if (item.product.price <= 0) {
        errors.push('Product price must be greater than 0');
    }

    return errors;
};

export const validateCart = (cart: Cart): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!cart.items || cart.items.length === 0) {
        return { isValid: false, errors: ['Cart is empty'] };
    }

    if (cart.items.length > CART_CONFIG.features.maxItemsInCart) {
        errors.push(`Cart cannot contain more than ${CART_CONFIG.features.maxItemsInCart} items`);
    }

    cart.items.forEach((item, index) => {
        const itemErrors = validateCartItem(item);
        if (itemErrors.length > 0) {
            errors.push(`Item ${index + 1}: ${itemErrors.join(', ')}`);
        }
    });

    if (cart.total < 0) {
        errors.push('Cart total cannot be negative');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

// Cart item utilities
export const findCartItem = (items: CartItem[], productId: number): CartItem | undefined => {
    return items.find(item => item.product_id === productId);
};

export const getCartItemIndex = (items: CartItem[], productId: number): number => {
    return items.findIndex(item => item.product_id === productId);
};

export const addItemToCart = (
    items: CartItem[],
    newItem: CartItem
): CartItem[] => {
    const existingItemIndex = getCartItemIndex(items, newItem.product_id);

    if (existingItemIndex >= 0) {
        // Update quantity of existing item
        const updatedItems = [...items];
        const newQuantity = updatedItems[existingItemIndex].quantity + newItem.quantity;

        // Validate quantity limit
        if (newQuantity > CART_CONFIG.features.maxQuantityPerItem) {
            updatedItems[existingItemIndex].quantity = CART_CONFIG.features.maxQuantityPerItem;
        } else {
            updatedItems[existingItemIndex].quantity = newQuantity;
        }

        return updatedItems;
    } else {
        // Add new item
        if (items.length >= CART_CONFIG.features.maxItemsInCart) {
            throw new Error(`Cannot add more than ${CART_CONFIG.features.maxItemsInCart} items to cart`);
        }

        return [...items, newItem];
    }
};

export const removeItemFromCart = (items: CartItem[], productId: number): CartItem[] => {
    return items.filter(item => item.product_id !== productId);
};

export const updateCartItemQuantity = (
    items: CartItem[],
    productId: number,
    quantity: number
): CartItem[] => {
    return items.map(item => {
        if (item.product_id === productId) {
            const newQuantity = Math.max(0, Math.min(quantity, CART_CONFIG.features.maxQuantityPerItem));
            return { ...item, quantity: newQuantity };
        }
        return item;
    }).filter(item => item.quantity > 0); // Remove items with 0 quantity
};

// Cart formatting utilities
export const formatCartSummary = (cart: Cart) => {
    return {
        subtotal: formatCartPrice(cart.subtotal),
        tax: formatCartPrice(cart.tax),
        shipping: formatCartPrice(cart.shipping),
        total: formatCartPrice(cart.total),
        itemCount: cart.item_count,
        discount: cart.promo_discount ? formatCartPrice(cart.promo_discount) : null,
    };
};

export const formatCartItemPrice = (item: CartItem): string => {
    const totalPrice = item.product.price * item.quantity;
    return formatCartPrice(totalPrice);
};

export const formatCartItemUnitPrice = (item: CartItem): string => {
    return formatCartPrice(item.product.price);
};

// Cart sorting and filtering
export const sortCartItems = (
    items: CartItem[],
    sortBy: 'name' | 'price' | 'date_added' | 'quantity' = 'date_added'
): CartItem[] => {
    return [...items].sort((a, b) => {
        switch (sortBy) {
            case 'name':
                return a.product.name.localeCompare(b.product.name);
            case 'price':
                return b.product.price - a.product.price; // High to low
            case 'quantity':
                return b.quantity - a.quantity; // High to low
            case 'date_added':
                if (a.date_added && b.date_added) {
                    return new Date(b.date_added).getTime() - new Date(a.date_added).getTime();
                }
                return 0;
            default:
                return 0;
        }
    });
};

export const filterCartItems = (
    items: CartItem[],
    filters: {
        category?: string;
        priceRange?: { min: number; max: number };
        savedForLater?: boolean;
    }
): CartItem[] => {
    return items.filter(item => {
        if (filters.category && item.product.category !== filters.category) {
            return false;
        }

        if (filters.priceRange) {
            const { min, max } = filters.priceRange;
            if (item.product.price < min || item.product.price > max) {
                return false;
            }
        }

        if (filters.savedForLater !== undefined && item.saved_for_later !== filters.savedForLater) {
            return false;
        }

        return true;
    });
};

// Cart persistence utilities
export const serializeCart = (cart: Cart): string => {
    try {
        return JSON.stringify({
            ...cart,
            last_updated: new Date().toISOString(),
            version: '1.0'
        });
    } catch (error) {
        console.error('Failed to serialize cart:', error);
        return '{}';
    }
};

export const deserializeCart = (cartData: string): Cart | null => {
    try {
        const parsed = JSON.parse(cartData);

        // Validate the parsed data structure
        if (!parsed.items || !Array.isArray(parsed.items)) {
            return null;
        }

        return {
            items: parsed.items,
            subtotal: parsed.subtotal || 0,
            tax: parsed.tax || 0,
            shipping: parsed.shipping || 0,
            total: parsed.total || 0,
            item_count: parsed.item_count || 0,
            promo_code: parsed.promo_code,
            promo_discount: parsed.promo_discount,
            currency: parsed.currency || CART_CONFIG.currency.code,
            last_updated: parsed.last_updated || new Date().toISOString(),
        };
    } catch (error) {
        console.error('Failed to deserialize cart:', error);
        return null;
    }
};

// Cart comparison utilities (for detecting changes)
export const compareCartItems = (items1: CartItem[], items2: CartItem[]): boolean => {
    if (items1.length !== items2.length) {
        return false;
    }

    return items1.every(item1 => {
        const item2 = findCartItem(items2, item1.product_id);
        return item2 &&
            item1.quantity === item2.quantity &&
            item1.product.price === item2.product.price;
    });
};

export const getCartChanges = (
    oldCart: Cart,
    newCart: Cart
): {
    added: CartItem[];
    removed: CartItem[];
    updated: CartItem[];
} => {
    const added: CartItem[] = [];
    const removed: CartItem[] = [];
    const updated: CartItem[] = [];

    // Find added and updated items
    newCart.items.forEach(newItem => {
        const oldItem = findCartItem(oldCart.items, newItem.product_id);
        if (!oldItem) {
            added.push(newItem);
        } else if (oldItem.quantity !== newItem.quantity) {
            updated.push(newItem);
        }
    });

    // Find removed items
    oldCart.items.forEach(oldItem => {
        const newItem = findCartItem(newCart.items, oldItem.product_id);
        if (!newItem) {
            removed.push(oldItem);
        }
    });

    return { added, removed, updated };
};

// Promo code utilities
export const validatePromoCode = (code: string): boolean => {
    // Basic validation - enhance with real API
    return code.length >= 3 && code.length <= 20 && /^[A-Z0-9]+$/.test(code);
};

export const calculatePromoDiscount = (
    subtotal: number,
    promoCode: string
): { isValid: boolean; discount: number; message?: string } => {
    // Mock promo code logic - replace with real API
    const promoCodes: Record<string, { type: 'percentage' | 'fixed'; value: number; minOrder?: number }> = {
        'SAVE10': { type: 'percentage', value: 10, minOrder: 100 },
        'FIRST20': { type: 'percentage', value: 20, minOrder: 200 },
        'FREESHIP': { type: 'fixed', value: 15 },
    };

    const promo = promoCodes[promoCode.toUpperCase()];

    if (!promo) {
        return { isValid: false, discount: 0, message: 'Invalid promo code' };
    }

    if (promo.minOrder && subtotal < promo.minOrder) {
        return {
            isValid: false,
            discount: 0,
            message: `Minimum order of ${formatCartPrice(promo.minOrder)} required`
        };
    }

    const discount = promo.type === 'percentage'
        ? (subtotal * promo.value) / 100
        : promo.value;

    return {
        isValid: true,
        discount: Math.min(discount, subtotal), // Don't exceed subtotal
        message: `${promo.value}${promo.type === 'percentage' ? '%' : ''} discount applied!`
    };
};

// Tax calculation utilities

export const getTaxRateForState = (state: string): number => {
    if (!CART_CONFIG.tax.enabled) return 0;

    const stateCode = state.toUpperCase();

    // Check if state is exempt
    if (CART_CONFIG.tax.exemptStates.includes(stateCode)) {
        return 0;
    }

    // Get state-specific rate or default
    return CART_CONFIG.tax.stateRates[stateCode] || CART_CONFIG.tax.defaultRate;
};

export const calculateTaxForAddress = (
    subtotal: number,
    shippingCost: number = 0,
    state?: string
): number => {
    if (!CART_CONFIG.tax.enabled || !state) return 0;

    const taxRate = getTaxRateForState(state);
    if (taxRate === 0) return 0;

    const taxableAmount = CART_CONFIG.tax.calculation === 'subtotal_plus_shipping'
        ? subtotal + shippingCost
        : subtotal;

    return Math.round(taxableAmount * taxRate * 100) / 100; // Round to 2 decimal places
};

export const formatTaxRate = (state: string): string => {
    const rate = getTaxRateForState(state);
    return `${(rate * 100).toFixed(2)}%`;
};