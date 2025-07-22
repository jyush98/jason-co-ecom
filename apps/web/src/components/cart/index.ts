// apps/web/src/components/cart/index.ts
// Clean exports for all cart components

// Main Cart Components
export { default as CartDrawer } from './CartDrawer';
export { default as CartPage } from './CartPage';
export { default as CartItem, CartItemSkeleton } from './CartItem';
export { default as CartSummary } from './CartSummary';

// Cart Empty State - TODO: Create if needed
// export { default as CartEmpty } from './CartEmpty';

// Type exports for external use (TODO: Create types.ts file if needed)
// export type {
//     CartDrawerProps,
//     CartPageProps,
//     CartItemProps,
//     CartSummaryProps
// } from './types';

// Re-export commonly used cart types from types/cart
export type {
    Cart,
    CartItem as CartItemType,
    CartDrawerState,
    CartActionResult
} from '@/types/cart';

// Re-export cart utilities for convenience
export {
    calculateCartSubtotal,
    calculateCartItemCount,
    calculateCartTotal,
    validateCartItem,
    validateCart,
    formatCartSummary,
    formatCartItemPrice
} from '@/utils/cartUtils';

// Re-export cart configuration
export { CART_CONFIG, formatCartPrice } from '@/config/cartConfig';

// Component prop interfaces
interface CartDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    cart: import('@/types/cart').Cart;
    onUpdateQuantity: (product_id: number, quantity: number) => Promise<void>;
    onRemoveItem: (product_id: number) => Promise<void>;
    onSaveForLater?: (product_id: number) => Promise<void>;
    isLoading?: boolean;
    error?: string | null;
}

interface CartPageProps {
    recentlyViewed?: any[];
    className?: string;
}

interface CartItemProps {
    item: import('@/types/cart').CartItem;
    onUpdateQuantity: (product_id: number, quantity: number, token: string) => Promise<any>;
    onRemoveItem: (product_id: number, token: string) => Promise<any>;
    onSaveForLater?: (product_id: number, token: string) => Promise<any>;
    getToken: () => Promise<string | null>;
    variant?: 'drawer' | 'page' | 'compact';
    showImage?: boolean;
    showActions?: boolean;
    className?: string;
    index?: number;
}

interface CartSummaryProps {
    subtotal: number;
    tax?: number;
    shipping?: number;
    discount?: number;
    total: number;
    promoCode?: string;
    onPromoCodeChange?: (code: string) => void;
    onApplyPromoCode?: (e: React.FormEvent) => void;
    promoCodeError?: string;
    promoCodeSuccess?: string;
    showGiftOptions?: boolean;
    onToggleGiftOptions?: (show: boolean) => void;
    variant?: 'page' | 'checkout' | 'drawer';
    showCheckoutButton?: boolean;
    checkoutButtonText?: string;
    checkoutButtonLink?: string;
    isLoading?: boolean;
    className?: string;
}

// Export prop type interfaces
export type {
    CartDrawerProps,
    CartPageProps,
    CartItemProps,
    CartSummaryProps
};