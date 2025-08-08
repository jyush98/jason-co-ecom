// apps/web/src/utils/index.ts
// Export all utility functions

// Import functions for categorized exports
import {
    calculateCartSubtotal,
    calculateCartItemCount,
    calculateCartTax,
    calculateCartTotal,
    validateCartItem,
    validateCart,
    addItemToCart,
    removeItemFromCart,
    updateCartItemQuantity,
    formatCartSummary
} from './cartUtils';

import {
    validateShippingAddress,
    validatePaymentMethod,
    validateCheckoutStep,
    calculateOrderSummary,
    formatAddressForDisplay,
    calculateCheckoutProgress
} from './checkoutUtils';

import {
    generateOrderNumber,
    getOrderStatusColor,
    getOrderStatusLabel,
    isOrderCancellable,
    formatOrderSummary as formatOrderSummaryUtil,
    calculateOrderMetrics,
    searchOrders
} from './orderUtils';

// API utilities
export {
    fetchProducts,
    fetchProduct,
    fetchUser,
    fetchOrders
} from './api';

// Cart utilities - from existing cartUtils.ts
export {
    calculateCartSubtotal,
    calculateCartItemCount,
    calculateCartTax,
    calculateShippingCost,
    calculateCartTotal,
    validateCartItem,
    validateCart,
    findCartItem,
    getCartItemIndex,
    addItemToCart,
    removeItemFromCart,
    updateCartItemQuantity,
    formatCartSummary,
    formatCartItemPrice,
    formatCartItemUnitPrice,
    sortCartItems,
    filterCartItems,
    serializeCart,
    deserializeCart,
    compareCartItems,
    getCartChanges,
    validatePromoCode,
    calculatePromoDiscount
} from './cartUtils';

// Cart API utilities
export {
    addToCart,
    getCart,
    removeFromCart
} from './cart';

// Checkout utilities - from new checkoutUtils.ts
export {
    validateShippingAddress,
    validatePaymentMethod,
    validateCheckoutStep,
    calculateShippingCost as calculateCheckoutShipping,
    calculateTaxByState,
    calculateOrderSummary,
    formatAddressForDisplay,
    formatAddressOneLine,
    calculateCheckoutProgress,
    calculateEstimatedDelivery,
    serializeCheckoutData,
    deserializeCheckoutData
} from './checkoutUtils';

// Order utilities - from new orderUtils.ts
export {
    generateOrderNumber,
    getOrderStatusColor,
    getOrderStatusLabel,
    getOrderStatusIcon,
    getOrderStatusProgress,
    getNextOrderStatus,
    isOrderCancellable,
    isOrderReturnable,
    filterOrdersByStatus,
    filterOrdersByDateRange,
    sortOrdersByDate,
    sortOrdersByTotal,
    formatOrderDate,
    formatOrderTime,
    formatOrderDateTime,
    formatOrderSummary,
    convertCartToOrderItems,
    searchOrders,
    calculateOrderMetrics,
    // calculateDeliveryDate,
    validateOrderData,
    exportOrdersToCSV
} from './orderUtils';

// Export utility types
// export type {
//     OrderStatus,
//     OrderSummary,
//     OrderDetails,
//     OrderItemDetails,
//     OrderStatusUpdate
// } from './orderUtils';

// Re-export commonly used types for convenience
export type {
    Cart,
    CartItem,
    ShippingAddress,
    ShippingMethod,
    PaymentMethod,
    CheckoutFormData,
    CheckoutStep
} from '@/types/cart';

export type {
    Product
} from '@/types/product';

// Utility function categories for organized imports
export const CartUtils = {
    calculateCartSubtotal,
    calculateCartItemCount,
    calculateCartTax,
    calculateCartTotal,
    validateCartItem,
    validateCart,
    addItemToCart,
    removeItemFromCart,
    updateCartItemQuantity,
    formatCartSummary
};

export const CheckoutUtils = {
    validateShippingAddress,
    validatePaymentMethod,
    validateCheckoutStep,
    calculateOrderSummary,
    formatAddressForDisplay,
    calculateCheckoutProgress
};

export const OrderUtils = {
    generateOrderNumber,
    getOrderStatusColor,
    getOrderStatusLabel,
    isOrderCancellable,
    formatOrderSummary: formatOrderSummaryUtil,
    calculateOrderMetrics,
    searchOrders
};