// apps/web/src/utils/orderUtils.ts
// Simplified order utilities - uses types from types/order.ts

import type { Order, OrderItem, OrderStatus, OrderSummary } from '@/types/order';
import type { Cart } from '@/types/cart';
import { formatCartPrice } from '@/config/cartConfig';

// ✅ Import types instead of defining them
// No more duplicate OrderDetails, OrderStatusUpdate, etc.

// Order number generation
export const generateOrderNumber = (): string => {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `JC-${timestamp.toUpperCase()}-${random.toUpperCase()}`;
};

// Order status utilities
export const getOrderStatusColor = (status: OrderStatus): string => {
    switch (status) {
        case 'pending':
            return 'text-yellow-600 bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800';
        case 'confirmed':
            return 'text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800';
        case 'processing':
            return 'text-purple-600 bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:border-purple-800';
        case 'shipped':
            return 'text-indigo-600 bg-indigo-50 border-indigo-200 dark:bg-indigo-900/20 dark:border-indigo-800';
        case 'delivered':
            return 'text-green-600 bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800';
        case 'completed':
            return 'text-green-600 bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800';
        case 'cancelled':
            return 'text-red-600 bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800';
        case 'failed':
            return 'text-red-600 bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800';
        default:
            return 'text-gray-600 bg-gray-50 border-gray-200 dark:bg-gray-900/20 dark:border-gray-800';
    }
};

export const getOrderStatusLabel = (status: OrderStatus): string => {
    switch (status) {
        case 'pending':
            return 'Payment Pending';
        case 'confirmed':
            return 'Order Confirmed';
        case 'processing':
            return 'Processing';
        case 'shipped':
            return 'Shipped';
        case 'delivered':
            return 'Delivered';
        case 'completed':
            return 'Completed';
        case 'cancelled':
            return 'Cancelled';
        case 'failed':
            return 'Failed';
        default:
            return (status as string).charAt(0).toUpperCase() + (status as string).slice(1);
    }
};

export const getOrderStatusIcon = (status: OrderStatus): string => {
    switch (status) {
        case 'pending':
            return '⏳';
        case 'confirmed':
            return '✅';
        case 'processing':
            return '⚙️';
        case 'shipped':
            return '🚚';
        case 'delivered':
            return '📦';
        case 'completed':
            return '🎉';
        case 'cancelled':
            return '❌';
        case 'failed':
            return '⚠️';
        default:
            return '📋';
    }
};

// Order status progression
export const getOrderStatusProgress = (status: OrderStatus): number => {
    const statusOrder: OrderStatus[] = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
    const currentIndex = statusOrder.indexOf(status);

    if (currentIndex === -1) return 0; // Cancelled, failed, or completed

    return ((currentIndex + 1) / statusOrder.length) * 100;
};

export const getNextOrderStatus = (currentStatus: OrderStatus): OrderStatus | null => {
    const statusFlow: Record<OrderStatus, OrderStatus | null> = {
        'pending': 'confirmed',
        'confirmed': 'processing',
        'processing': 'shipped',
        'shipped': 'delivered',
        'delivered': 'completed',
        'completed': null,
        'cancelled': null,
        'failed': null
    };

    return statusFlow[currentStatus];
};

// Order business logic
export const isOrderCancellable = (order: Order | OrderSummary): boolean => {
    return ['pending', 'confirmed'].includes(order.status);
};

export const isOrderReturnable = (order: Order): boolean => {
    if (order.status !== 'delivered' && order.status !== 'completed') return false;

    // Check if within return window (30 days)
    const orderDate = new Date(order.created_at);
    const returnDeadline = new Date(orderDate.getTime() + (30 * 24 * 60 * 60 * 1000));

    return new Date() <= returnDeadline;
};

// Order filtering and sorting
export const filterOrdersByStatus = (orders: OrderSummary[], statuses: OrderStatus[]): OrderSummary[] => {
    return orders.filter(order => statuses.includes(order.status));
};

export const filterOrdersByDateRange = (
    orders: OrderSummary[],
    startDate: Date,
    endDate: Date
): OrderSummary[] => {
    return orders.filter(order => {
        const orderDate = new Date(order.created_at);
        return orderDate >= startDate && orderDate <= endDate;
    });
};

export const sortOrdersByDate = (orders: OrderSummary[], ascending: boolean = false): OrderSummary[] => {
    return [...orders].sort((a, b) => {
        const dateA = new Date(a.created_at).getTime();
        const dateB = new Date(b.created_at).getTime();
        return ascending ? dateA - dateB : dateB - dateA;
    });
};

export const sortOrdersByTotal = (orders: OrderSummary[], ascending: boolean = false): OrderSummary[] => {
    return [...orders].sort((a, b) => {
        return ascending ? a.total_price - b.total_price : b.total_price - a.total_price;
    });
};

// Order formatting utilities
export const formatOrderDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

export const formatOrderTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
    });
};

export const formatOrderDateTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

// ✅ Simplified order summary formatting - works with your Order type
export const formatOrderSummary = (order: Order) => {
    const itemCount = order.items.length;
    const customerName = order.customer_first_name && order.customer_last_name
        ? `${order.customer_first_name} ${order.customer_last_name}`
        : 'Customer';

    return {
        orderNumber: order.order_number,
        date: formatOrderDate(order.created_at),
        status: getOrderStatusLabel(order.status),
        customerName,
        itemCount: `${itemCount} item${itemCount !== 1 ? 's' : ''}`,
        subtotal: order.subtotal ? formatCartPrice(order.subtotal) : null,
        shipping: order.shipping_amount ? formatCartPrice(order.shipping_amount) : null,
        tax: order.tax_amount ? formatCartPrice(order.tax_amount) : null,
        discount: order.discount_amount ? formatCartPrice(order.discount_amount) : null,
        total: formatCartPrice(order.total_price)
    };
};

// Cart to order conversion (for checkout)
export const convertCartToOrderItems = (cart: Cart): Omit<OrderItem, 'id'>[] => {
    return cart.items.map(item => ({
        product_id: item.product_id,
        product_name: item.product.name,
        unit_price: item.product.price,
        quantity: item.quantity,
        product_image_url: item.product.image_url,
        product_category: item.product.category,
        custom_options: item.custom_options
    }));
};

// Order search utilities
export const searchOrders = (orders: OrderSummary[], query: string): OrderSummary[] => {
    if (!query.trim()) return orders;

    const lowercaseQuery = query.toLowerCase();

    return orders.filter(order =>
        order.order_number.toLowerCase().includes(lowercaseQuery) ||
        order.status.toLowerCase().includes(lowercaseQuery) ||
        (order.customer_name && order.customer_name.toLowerCase().includes(lowercaseQuery))
    );
};

// Order analytics utilities
export const calculateOrderMetrics = (orders: OrderSummary[]) => {
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + order.total_price, 0);
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    const statusCounts = orders.reduce((counts, order) => {
        counts[order.status] = (counts[order.status] || 0) + 1;
        return counts;
    }, {} as Record<OrderStatus, number>);

    const completedOrders = orders.filter(order =>
        order.status === 'delivered' || order.status === 'completed'
    ).length;
    const completionRate = totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0;

    return {
        totalOrders,
        totalRevenue,
        averageOrderValue,
        completionRate,
        statusCounts,
        formatted: {
            totalRevenue: formatCartPrice(totalRevenue),
            averageOrderValue: formatCartPrice(averageOrderValue),
            completionRate: `${completionRate.toFixed(1)}%`
        }
    };
};

// Estimated delivery utilities (simplified)
export const calculateEstimatedDelivery = (
    orderDate: string,
    shippingMethod?: string
): { estimated: Date; formatted: string } => {
    const order = new Date(orderDate);
    let businessDays = 5; // Default standard shipping

    if (shippingMethod) {
        const method = shippingMethod.toLowerCase();
        if (method.includes('express')) {
            businessDays = 2;
        } else if (method.includes('overnight') || method.includes('next day')) {
            businessDays = 1;
        }
    }

    // Add business days (skip weekends)
    const deliveryDate = new Date(order);
    let addedDays = 0;

    while (addedDays < businessDays) {
        deliveryDate.setDate(deliveryDate.getDate() + 1);
        // Skip weekends
        if (deliveryDate.getDay() !== 0 && deliveryDate.getDay() !== 6) {
            addedDays++;
        }
    }

    return {
        estimated: deliveryDate,
        formatted: deliveryDate.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric'
        })
    };
};

// ✅ FIXED: Order validation with proper typing
export interface OrderValidationData {
    items?: unknown[];
    shipping_address?: unknown;
    total_price?: number;
    [key: string]: unknown; // Allow additional properties for flexibility
}

export const validateOrderData = (orderData: OrderValidationData): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!orderData.items || !Array.isArray(orderData.items) || orderData.items.length === 0) {
        errors.push('Order must contain at least one item');
    }

    if (!orderData.shipping_address) {
        errors.push('Shipping address is required');
    }

    if (!orderData.total_price || orderData.total_price <= 0) {
        errors.push('Order total must be greater than zero');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

// Convert Order to OrderSummary (for lists)
export const orderToSummary = (order: Order): OrderSummary => {
    const customerName = order.customer_first_name && order.customer_last_name
        ? `${order.customer_first_name} ${order.customer_last_name}`
        : undefined;

    return {
        id: order.id,
        order_number: order.order_number,
        total_price: order.total_price,
        status: order.status,
        created_at: order.created_at,
        customer_name: customerName,
        item_count: order.items.length
    };
};

// Order export utilities (for admin/reporting)
export const exportOrdersToCSV = (orders: OrderSummary[]): string => {
    const headers = ['Order Number', 'Date', 'Status', 'Customer', 'Items', 'Total'];
    const rows = orders.map(order => [
        order.order_number,
        formatOrderDate(order.created_at),
        getOrderStatusLabel(order.status),
        order.customer_name || 'Guest',
        order.item_count,
        formatCartPrice(order.total_price)
    ]);

    const csvContent = [headers, ...rows]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n');

    return csvContent;
};