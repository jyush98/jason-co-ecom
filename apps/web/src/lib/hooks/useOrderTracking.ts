// apps/web/src/lib/hooks/useOrderTracking.ts
// Order tracking and history management hook

import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';

// Order interfaces (extending your existing order types)
interface OrderSummary {
    id: number;
    order_number: string;
    total_price: number;
    status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    created_at: string;
    item_count: number;
    tracking_number?: string;
    estimated_delivery?: string;
}

interface OrderDetails extends OrderSummary {
    items: OrderItem[];
    shipping_address: any;
    billing_address?: any;
    payment_method: string;
    shipping_method: string;
    subtotal: number;
    tax: number;
    shipping_cost: number;
    discount?: number;
    notes?: string;
    status_history: OrderStatusUpdate[];
}

interface OrderItem {
    id: number;
    product_id: number;
    product_name: string;
    unit_price: number;
    quantity: number;
    product_image?: string;
}

interface OrderStatusUpdate {
    status: string;
    timestamp: string;
    note?: string;
    location?: string;
}

interface UseOrderTrackingReturn {
    // Order history
    orders: OrderSummary[];
    isLoadingOrders: boolean;
    ordersError: string | null;

    // Current order details
    currentOrder: OrderDetails | null;
    isLoadingOrder: boolean;
    orderError: string | null;

    // Actions
    fetchOrderHistory: () => Promise<void>;
    fetchOrderDetails: (orderNumber: string) => Promise<void>;
    trackOrder: (orderNumber: string) => Promise<void>;
    cancelOrder: (orderNumber: string) => Promise<void>;
    clearCurrentOrder: () => void;

    // Utilities
    getOrderStatusColor: (status: string) => string;
    getOrderStatusLabel: (status: string) => string;
    isOrderCancellable: (order: OrderSummary) => boolean;
}

// Export the interface for external use
export type { UseOrderTrackingReturn };

export function useOrderTracking(): UseOrderTrackingReturn {
    const { getToken } = useAuth();

    // State
    const [orders, setOrders] = useState<OrderSummary[]>([]);
    const [isLoadingOrders, setIsLoadingOrders] = useState(false);
    const [ordersError, setOrdersError] = useState<string | null>(null);

    const [currentOrder, setCurrentOrder] = useState<OrderDetails | null>(null);
    const [isLoadingOrder, setIsLoadingOrder] = useState(false);
    const [orderError, setOrderError] = useState<string | null>(null);

    // Fetch order history
    const fetchOrderHistory = useCallback(async () => {
        setIsLoadingOrders(true);
        setOrdersError(null);

        try {
            const token = await getToken();
            if (!token) {
                throw new Error('Authentication required');
            }

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/orders`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch orders: ${response.statusText}`);
            }

            const data = await response.json();
            setOrders(data.orders || []);

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch order history';
            setOrdersError(errorMessage);
            console.error('Error fetching order history:', error);
        } finally {
            setIsLoadingOrders(false);
        }
    }, [getToken]);

    // Fetch specific order details
    const fetchOrderDetails = useCallback(async (orderNumber: string) => {
        setIsLoadingOrder(true);
        setOrderError(null);

        try {
            const token = await getToken();
            if (!token) {
                throw new Error('Authentication required');
            }

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/orders/${orderNumber}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch order details: ${response.statusText}`);
            }

            const orderDetails = await response.json();
            setCurrentOrder(orderDetails);

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch order details';
            setOrderError(errorMessage);
            console.error('Error fetching order details:', error);
        } finally {
            setIsLoadingOrder(false);
        }
    }, [getToken]);

    // Track order (get latest status updates)
    const trackOrder = useCallback(async (orderNumber: string) => {
        setIsLoadingOrder(true);
        setOrderError(null);

        try {
            const token = await getToken();
            if (!token) {
                throw new Error('Authentication required');
            }

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/orders/${orderNumber}/track`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`Failed to track order: ${response.statusText}`);
            }

            const trackingData = await response.json();

            // Update current order if it matches
            if (currentOrder && currentOrder.order_number === orderNumber) {
                setCurrentOrder(prev => prev ? {
                    ...prev,
                    status: trackingData.status,
                    tracking_number: trackingData.tracking_number,
                    estimated_delivery: trackingData.estimated_delivery,
                    status_history: trackingData.status_history || prev.status_history
                } : null);
            }

            // Update orders list
            setOrders(prev => prev.map(order =>
                order.order_number === orderNumber
                    ? { ...order, status: trackingData.status, tracking_number: trackingData.tracking_number }
                    : order
            ));

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to track order';
            setOrderError(errorMessage);
            console.error('Error tracking order:', error);
        } finally {
            setIsLoadingOrder(false);
        }
    }, [getToken, currentOrder]);

    // Cancel order
    const cancelOrder = useCallback(async (orderNumber: string) => {
        try {
            const token = await getToken();
            if (!token) {
                throw new Error('Authentication required');
            }

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/orders/${orderNumber}/cancel`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`Failed to cancel order: ${response.statusText}`);
            }

            // Update local state
            setOrders(prev => prev.map(order =>
                order.order_number === orderNumber
                    ? { ...order, status: 'cancelled' as const }
                    : order
            ));

            if (currentOrder && currentOrder.order_number === orderNumber) {
                setCurrentOrder(prev => prev ? { ...prev, status: 'cancelled' } : null);
            }

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to cancel order';
            setOrderError(errorMessage);
            console.error('Error cancelling order:', error);
            throw error; // Re-throw for UI handling
        }
    }, [getToken, currentOrder]);

    const clearCurrentOrder = useCallback(() => {
        setCurrentOrder(null);
        setOrderError(null);
    }, []);

    // Utility functions
    const getOrderStatusColor = useCallback((status: string): string => {
        switch (status) {
            case 'pending':
                return 'text-yellow-600 bg-yellow-50 border-yellow-200';
            case 'confirmed':
                return 'text-blue-600 bg-blue-50 border-blue-200';
            case 'processing':
                return 'text-purple-600 bg-purple-50 border-purple-200';
            case 'shipped':
                return 'text-indigo-600 bg-indigo-50 border-indigo-200';
            case 'delivered':
                return 'text-green-600 bg-green-50 border-green-200';
            case 'cancelled':
                return 'text-red-600 bg-red-50 border-red-200';
            default:
                return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    }, []);

    const getOrderStatusLabel = useCallback((status: string): string => {
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
            case 'cancelled':
                return 'Cancelled';
            default:
                return status.charAt(0).toUpperCase() + status.slice(1);
        }
    }, []);

    const isOrderCancellable = useCallback((order: OrderSummary): boolean => {
        return ['pending', 'confirmed'].includes(order.status);
    }, []);

    // Auto-fetch orders on mount
    useEffect(() => {
        fetchOrderHistory();
    }, [fetchOrderHistory]);

    return {
        // Order history
        orders,
        isLoadingOrders,
        ordersError,

        // Current order details
        currentOrder,
        isLoadingOrder,
        orderError,

        // Actions
        fetchOrderHistory,
        fetchOrderDetails,
        trackOrder,
        cancelOrder,
        clearCurrentOrder,

        // Utilities
        getOrderStatusColor,
        getOrderStatusLabel,
        isOrderCancellable,
    };
}

export default useOrderTracking;