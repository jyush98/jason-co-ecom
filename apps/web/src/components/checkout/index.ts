// apps/web/src/components/checkout/index.ts
// Clean exports for all checkout components

// Main Checkout Components
export { default as CheckoutFlow } from './CheckoutFlow';
export { default as ShippingForm } from './ShippingForm';
export { default as PaymentForm } from './PaymentForm';
export { default as OrderReview } from './OrderReview';
export { default as OrderConfirmation } from './OrderConfirmation';

// Checkout Steps Components (TODO: Create if needed)
// export { default as CheckoutSteps } from './CheckoutSteps';

// Order Summary Component (TODO: Create if needed)
// export { default as OrderSummary } from './OrderSummary';

// Re-export commonly used checkout types from types/cart
export type {
    CheckoutStep,
    CheckoutState,
    CheckoutFormData,
    ShippingAddress,
    ShippingMethod,
    PaymentMethod,
    CheckoutOrderPreview
} from '@/types/cart';

// Re-export checkout utilities for convenience
export {
    calculateShippingCost,
    validateCart,
    validateCartItem,
    calculateCartSubtotal,
    calculateCartTotal
} from '@/utils/cartUtils';

// Re-export checkout configuration
export { CART_CONFIG } from '@/config/cartConfig';

// Component prop interfaces
interface CheckoutFlowProps {
    onOrderComplete?: (orderNumber: string) => void;
    onError?: (error: string) => void;
    className?: string;
}

interface ShippingFormProps {
    formData: Partial<import('@/types/cart').CheckoutFormData>;
    shippingMethods: import('@/types/cart').ShippingMethod[];
    selectedMethod?: import('@/types/cart').ShippingMethod;
    isGuestCheckout: boolean;
    isLoading: boolean;
    validationErrors: Record<string, string>;
    onUpdateAddress: (updates: Partial<import('@/types/cart').ShippingAddress>) => void;
    onSelectShippingMethod: (method: import('@/types/cart').ShippingMethod) => void;
    onNext: () => void;
}

interface PaymentFormProps {
    formData: Partial<import('@/types/cart').CheckoutFormData>;
    validationErrors: Record<string, string>;
    onSelectPaymentMethod: (method: import('@/types/cart').PaymentMethod) => void;
    onUpdateBillingAddress?: (address: import('@/types/cart').ShippingAddress) => void;
    onPrevious: () => void;
    onNext: () => void;
    isLoading?: boolean;
    orderTotal: number;
}

interface OrderReviewProps {
    cart: import('@/types/cart').Cart;
    formData: Partial<import('@/types/cart').CheckoutFormData>;
    shippingMethod: import('@/types/cart').ShippingMethod;
    total: number;
    onPrevious: () => void;
    onPlaceOrder: () => void;
}

interface OrderConfirmationProps {
    orderNumber: string;
    orderTotal: number;
    customerEmail?: string;
    estimatedDelivery?: string;
    trackingUrl?: string;
}

// Export prop type interfaces
export type {
    CheckoutFlowProps,
    ShippingFormProps,
    PaymentFormProps,
    OrderReviewProps,
    OrderConfirmationProps
};