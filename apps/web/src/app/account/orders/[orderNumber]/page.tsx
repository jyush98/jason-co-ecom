"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth, useUser } from "@clerk/nextjs";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
    ArrowLeft,
    Package,
    Calendar,
    MapPin,
    // CreditCard,
    Truck,
    CheckCircle,
    Clock,
    XCircle,
    Copy,
    Download,
    RefreshCw,
    Phone,
    Mail,
    Gift,
    // FileText,
    // Star
} from "lucide-react";
import AccountLayout from "@/components/account/AccountLayout";

interface OrderItem {
    product_name: string;
    quantity: number;
    unit_price: number;
    line_total: number;
    product_image_url?: string;
}

interface ShippingAddress {
    address_line_1: string;
    address_line_2?: string;
    city: string;
    state: string;
    postal_code: string;
    phone?: string;
}

interface OrderDetails {
    order: {
        order_number: string;
        status: string;
        total_price: number;
        created_at: string;
        customer_name: string;
        shipping_address: ShippingAddress;
        is_gift: boolean;
        gift_message?: string;
        tracking_number?: string;
    };
    items: OrderItem[];
}

export default function OrderDetailsPage() {
    const { user, isLoaded } = useUser();
    const { getToken } = useAuth();
    const router = useRouter();
    const params = useParams();
    const orderNumber = params?.orderNumber as string;

    const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    // Redirect if not signed in
    useEffect(() => {
        if (isLoaded && !user) {
            router.push('/sign-in?redirect_url=/account/orders');
        }
    }, [isLoaded, user, router]);

    // Fetch order details
    useEffect(() => {
        const fetchOrderDetails = async () => {
            if (!orderNumber || !user) return;

            try {
                setLoading(true);
                setError(null);

                const token = await getToken();
                if (!token) {
                    throw new Error('Authentication required');
                }

                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_API_BASE_URL}/payment/orders/${orderNumber}`,
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json',
                        },
                    }
                );

                if (!response.ok) {
                    if (response.status === 404) {
                        throw new Error('Order not found');
                    } else if (response.status === 403) {
                        throw new Error('Access denied');
                    }
                    throw new Error(`Failed to fetch order: ${response.statusText}`);
                }

                const data = await response.json();
                setOrderDetails(data);
            } catch (err) {
                console.error('Order details fetch error:', err);
                setError(err instanceof Error ? err.message : 'Failed to load order details');
            } finally {
                setLoading(false);
            }
        };

        if (isLoaded && user && orderNumber) {
            fetchOrderDetails();
        }
    }, [isLoaded, user, orderNumber, getToken]);

    // Copy order number to clipboard
    const copyOrderNumber = async () => {
        if (orderDetails?.order.order_number) {
            try {
                await navigator.clipboard.writeText(orderDetails.order.order_number);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            } catch (err) {
                console.error('Failed to copy:', err);
            }
        }
    };

    // Format date
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Get status display info
    const getStatusInfo = (status: string) => {
        switch (status.toLowerCase()) {
            case 'delivered':
                return {
                    icon: <CheckCircle className="text-green-600" size={24} />,
                    color: 'text-green-600 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
                    message: 'Your order has been delivered successfully!'
                };
            case 'shipped':
                return {
                    icon: <Truck className="text-blue-600" size={24} />,
                    color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
                    message: 'Your order is on its way to you!'
                };
            case 'processing':
            case 'confirmed':
                return {
                    icon: <Clock className="text-yellow-600" size={24} />,
                    color: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
                    message: 'Your order is being prepared for shipment.'
                };
            case 'cancelled':
                return {
                    icon: <XCircle className="text-red-600" size={24} />,
                    color: 'text-red-600 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
                    message: 'This order has been cancelled.'
                };
            default:
                return {
                    icon: <Package className="text-gray-600" size={24} />,
                    color: 'text-gray-600 bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800',
                    message: 'Your order is being processed.'
                };
        }
    };

    // Show loading skeleton while Clerk loads
    if (!isLoaded || !user) {
        return (
            <AccountLayout>
                <OrderDetailsSkeleton />
            </AccountLayout>
        );
    }

    return (
        <AccountLayout>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="space-y-8"
            >
                {/* Breadcrumb Navigation */}
                <div className="flex items-center gap-2 text-sm">
                    <Link
                        href="/account"
                        className="text-gray-500 hover:text-gold transition-colors"
                    >
                        Account
                    </Link>
                    <span className="text-gray-400">/</span>
                    <Link
                        href="/account/orders"
                        className="text-gray-500 hover:text-gold transition-colors"
                    >
                        Order History
                    </Link>
                    <span className="text-gray-400">/</span>
                    <span className="text-black dark:text-white font-medium">
                        {orderNumber}
                    </span>
                </div>

                {/* Back Button */}
                <Link
                    href="/account/orders"
                    className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gold transition-colors"
                >
                    <ArrowLeft size={20} />
                    <span>Back to Order History</span>
                </Link>

                {/* Error State */}
                {error && (
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                            <XCircle size={16} />
                            <span>{error}</span>
                        </div>
                    </div>
                )}

                {/* Loading State */}
                {loading && <OrderDetailsSkeleton />}

                {/* Order Details */}
                {orderDetails && !loading && (
                    <>
                        {/* Order Header */}
                        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <h1 className="text-2xl font-serif text-black dark:text-white">
                                            Order {orderDetails.order.order_number}
                                        </h1>
                                        <button
                                            onClick={copyOrderNumber}
                                            className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                                            title="Copy order number"
                                        >
                                            <Copy size={16} className={copied ? 'text-green-600' : 'text-gray-400'} />
                                        </button>
                                    </div>

                                    <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400 mb-4">
                                        <Calendar size={16} />
                                        <span>Placed on {formatDate(orderDetails.order.created_at)}</span>
                                    </div>

                                    {/* Status Badge */}
                                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border ${getStatusInfo(orderDetails.order.status).color}`}>
                                        {getStatusInfo(orderDetails.order.status).icon}
                                        <span className="font-medium">
                                            {orderDetails.order.status.charAt(0).toUpperCase() + orderDetails.order.status.slice(1)}
                                        </span>
                                    </div>
                                </div>

                                <div className="text-right">
                                    <div className="text-3xl font-bold text-gold mb-2">
                                        ${orderDetails.order.total_price.toFixed(2)}
                                    </div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                        {orderDetails.items.length} item{orderDetails.items.length !== 1 ? 's' : ''}
                                    </div>
                                </div>
                            </div>

                            {/* Status Message */}
                            <div className="mt-6 p-4 bg-white dark:bg-black rounded-lg border border-gray-200 dark:border-gray-700">
                                <p className="text-gray-700 dark:text-gray-300">
                                    {getStatusInfo(orderDetails.order.status).message}
                                </p>
                                {orderDetails.order.tracking_number && (
                                    <div className="mt-3 flex items-center gap-2">
                                        <Truck size={16} className="text-blue-600" />
                                        <span className="text-sm font-medium">
                                            Tracking: {orderDetails.order.tracking_number}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                            {/* Order Items - Left Column */}
                            <div className="lg:col-span-8 space-y-6">
                                <div>
                                    <h2 className="text-xl font-serif text-black dark:text-white mb-4">
                                        Order Items
                                    </h2>

                                    <div className="space-y-4">
                                        {orderDetails.items.map((item, index) => (
                                            <OrderItemCard key={index} item={item} index={index} />
                                        ))}
                                    </div>
                                </div>

                                {/* Gift Message */}
                                {orderDetails.order.is_gift && orderDetails.order.gift_message && (
                                    <div className="p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Gift className="text-purple-600" size={20} />
                                            <h3 className="font-medium text-purple-800 dark:text-purple-200">
                                                Gift Message
                                            </h3>
                                        </div>
                                        <p className="text-purple-700 dark:text-purple-300 italic">
                                            &ldquo;{orderDetails.order.gift_message}&rdquo;
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Order Details - Right Column */}
                            <div className="lg:col-span-4 space-y-6">
                                {/* Shipping Address */}
                                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                                    <h3 className="text-lg font-medium text-black dark:text-white mb-3 flex items-center gap-2">
                                        <MapPin className="text-gold" size={20} />
                                        Shipping Address
                                    </h3>
                                    <div className="text-gray-700 dark:text-gray-300 space-y-1">
                                        <div className="font-medium">{orderDetails.order.customer_name}</div>
                                        <div>{orderDetails.order.shipping_address?.address_line_1}</div>
                                        {orderDetails.order.shipping_address?.address_line_2 && (
                                            <div>{orderDetails.order.shipping_address.address_line_2}</div>
                                        )}
                                        <div>
                                            {orderDetails.order.shipping_address?.city}, {orderDetails.order.shipping_address?.state} {orderDetails.order.shipping_address?.postal_code}
                                        </div>
                                        {orderDetails.order.shipping_address?.phone && (
                                            <div className="flex items-center gap-1 mt-2 text-sm">
                                                <Phone size={14} />
                                                {orderDetails.order.shipping_address.phone}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Quick Actions */}
                                <div className="space-y-3">
                                    <button className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:border-gold transition-colors">
                                        <RefreshCw size={16} />
                                        Track Order
                                    </button>

                                    <button className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:border-gold transition-colors">
                                        <Download size={16} />
                                        Download Invoice
                                    </button>

                                    <Link
                                        href="/contact"
                                        className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:border-gold transition-colors"
                                    >
                                        <Mail size={16} />
                                        Contact Support
                                    </Link>
                                </div>

                                {/* Reorder Section */}
                                <div className="p-4 bg-gold/10 border border-gold/20 rounded-lg">
                                    <h3 className="font-medium text-black dark:text-white mb-2">
                                        Love this order?
                                    </h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                        Easily reorder the same items or explore similar pieces.
                                    </p>
                                    <div className="space-y-2">
                                        <button className="w-full bg-gold hover:bg-gold/90 text-black font-medium py-2 px-4 rounded-lg transition-all duration-300">
                                            Reorder Items
                                        </button>
                                        <Link
                                            href="/shop"
                                            className="w-full block text-center border border-gold text-gold hover:bg-gold hover:text-black py-2 px-4 rounded-lg transition-all duration-300"
                                        >
                                            Shop Similar
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </motion.div>
        </AccountLayout>
    );
}

// Order Item Card Component
function OrderItemCard({ item, index }: { item: OrderItem; index: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className="flex gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-gold/50 transition-colors"
        >
            {/* Product Image */}
            <div className="flex-shrink-0 w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                {item.product_image_url ? (
                    <Image
                        src={item.product_image_url}
                        alt={item.product_name}
                        width={80}
                        height={80}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <Package size={24} className="text-gray-400" />
                    </div>
                )}
            </div>

            {/* Product Details */}
            <div className="flex-1 min-w-0">
                <h4 className="font-medium text-black dark:text-white mb-1 truncate">
                    {item.product_name}
                </h4>
                <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <div>Quantity: {item.quantity}</div>
                    <div>Unit Price: ${item.unit_price.toFixed(2)}</div>
                </div>
            </div>

            {/* Item Total */}
            <div className="text-right">
                <div className="text-lg font-semibold text-gold">
                    ${item.line_total.toFixed(2)}
                </div>
                {item.quantity > 1 && (
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                        ${item.unit_price.toFixed(2)} each
                    </div>
                )}
            </div>
        </motion.div>
    );
}

// Loading Skeleton
function OrderDetailsSkeleton() {
    return (
        <div className="space-y-8">
            {/* Header Skeleton */}
            <div className="animate-pulse">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-4" />
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-6" />
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64 mb-4" />
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-4" />
                    <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-32" />
                </div>
            </div>

            {/* Content Grid Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="flex gap-4 p-4 border rounded-lg animate-pulse">
                            <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                            <div className="flex-1 space-y-2">
                                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                            </div>
                        </div>
                    ))}
                </div>
                <div className="lg:col-span-4 space-y-6">
                    <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                    <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                </div>
            </div>
        </div>
    );
}