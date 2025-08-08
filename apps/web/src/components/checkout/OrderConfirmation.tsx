"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, Package, Truck, CreditCard, Calendar, MapPin, Mail, Download, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

// ✅ SIMPLIFIED - Use your actual types
import type { Order } from "@/types/order";
import { CART_CONFIG, formatCartPrice } from "@/config";
import { JewelryImage } from "../ui/OptimizedImage";

interface OrderConfirmationProps {
    orderNumber?: string;
    className?: string;
}

export default function OrderConfirmation({
    orderNumber,
    className = ""
}: OrderConfirmationProps) {
    // const router = useRouter();
    const searchParams = useSearchParams();
    const [isLoading, setIsLoading] = useState(true);
    const [order, setOrder] = useState<Order | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Get order number from URL if not provided
    const finalOrderNumber = orderNumber || searchParams?.get('order_number') || '';

    useEffect(() => {
        if (finalOrderNumber) {
            fetchOrderDetails(finalOrderNumber);
        }
    }, [finalOrderNumber]);

    // ✅ SIMPLE API call - matches your actual endpoint
    const fetchOrderDetails = async (orderNum: string) => {
        try {
            setIsLoading(true);
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/orders/${orderNum}`);
            
            if (!response.ok) {
                throw new Error('Order not found');
            }
            
            const orderData: Order = await response.json();
            setOrder(orderData);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load order');
        } finally {
            setIsLoading(false);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                duration: 0.6,
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5, ease: "easeOut" }
        }
    };

    if (isLoading) {
        return <OrderConfirmationSkeleton />;
    }

    if (error || !order) {
        return <OrderNotFound orderNumber={finalOrderNumber} error={error} />;
    }

    // ✅ SIMPLE calculations - no complex transformations
    // const customerName = order.customer_first_name && order.customer_last_name 
    //     ? `${order.customer_first_name} ${order.customer_last_name}`
    //     : 'Customer';

    return (
        <div className={`min-h-screen bg-white dark:bg-black pt-[var(--navbar-height)] ${className}`}>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="space-y-8"
                >
                    {/* Success Header */}
                    <motion.div variants={itemVariants} className="text-center">
                        <motion.div
                            className="mx-auto w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                        >
                            <CheckCircle size={40} className="text-green-600 dark:text-green-400" />
                        </motion.div>

                        <h1 className="text-3xl md:text-4xl font-serif text-black dark:text-white mb-4">
                            {CART_CONFIG.messaging.checkout.confirmation.title}
                        </h1>
                        <p className="text-lg text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto">
                            {CART_CONFIG.messaging.checkout.confirmation.subtitle}
                        </p>

                        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 max-w-md mx-auto">
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                Order Number
                            </p>
                            <p className="text-2xl font-mono font-bold text-gold">
                                {order.order_number}
                            </p>
                        </div>
                    </motion.div>

                    {/* Order Details Grid */}
                    <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Order Summary */}
                        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
                            <h2 className="text-xl font-serif mb-6 flex items-center gap-2">
                                <Package size={20} className="text-gold" />
                                Order Summary
                            </h2>

                            {/* Items */}
                            <div className="space-y-4 mb-6">
                                {order.items.map((item) => (
                                    <div key={item.id} className="flex gap-4">
                                        <div className={`w-16 h-16 ${item.display_theme === "dark" ? "bg-black" : "bg-white"} rounded overflow-hidden`}>
                                            {item.product_image_url && (
                                                <JewelryImage.Product
                                                    src={item.product_image_url}
                                                    alt={item.product_name}
                                                    className="w-full h-full object-cover"
                                                />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-medium">{item.product_name}</h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                Qty: {item.quantity}
                                            </p>
                                            <p className="font-medium text-gold">
                                                {formatCartPrice(item.unit_price * item.quantity)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Totals */}
                            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-2">
                                {order.subtotal && (
                                    <div className="flex justify-between">
                                        <span>Subtotal</span>
                                        <span>{formatCartPrice(order.subtotal)}</span>
                                    </div>
                                )}
                                {order.shipping_amount && (
                                    <div className="flex justify-between">
                                        <span>Shipping</span>
                                        <span>{formatCartPrice(order.shipping_amount)}</span>
                                    </div>
                                )}
                                {order.tax_amount && (
                                    <div className="flex justify-between">
                                        <span>Tax</span>
                                        <span>{formatCartPrice(order.tax_amount)}</span>
                                    </div>
                                )}
                                <div className="border-t border-gray-200 dark:border-gray-700 pt-2">
                                    <div className="flex justify-between text-lg font-semibold">
                                        <span>Total</span>
                                        <span className="text-gold">{formatCartPrice(order.total_price)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Delivery & Payment Info */}
                        <div className="space-y-6">
                            {/* Delivery */}
                            {order.shipping_address && (
                                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
                                    <h2 className="text-xl font-serif mb-4 flex items-center gap-2">
                                        <Truck size={20} className="text-gold" />
                                        Delivery Information
                                    </h2>

                                    <div className="space-y-3">
                                        <div className="flex items-start gap-3">
                                            <MapPin size={16} className="text-gray-400 mt-1" />
                                            <div>
                                                <p className="font-medium">Shipping Address</p>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    {order.shipping_address.first_name} {order.shipping_address.last_name}<br />
                                                    {order.shipping_address.address_line_1}<br />
                                                    {order.shipping_address.address_line_2 && (
                                                        <>{order.shipping_address.address_line_2}<br /></>
                                                    )}
                                                    {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.postal_code}
                                                </p>
                                            </div>
                                        </div>

                                        {order.estimated_delivery_date && (
                                            <div className="flex items-center gap-3">
                                                <Calendar size={16} className="text-gray-400" />
                                                <div>
                                                    <p className="font-medium">Estimated Delivery</p>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                                        {new Date(order.estimated_delivery_date).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Payment */}
                            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
                                <h2 className="text-xl font-serif mb-4 flex items-center gap-2">
                                    <CreditCard size={20} className="text-gold" />
                                    Payment Information
                                </h2>

                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
                                        <CreditCard size={16} className="text-gray-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium">
                                            {order.payment_method_brand && order.payment_method_brand.charAt(0).toUpperCase() + order.payment_method_brand.slice(1)} 
                                            {order.payment_method_last4 && ` ending in ${order.payment_method_last4}`}
                                        </p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Payment processed successfully
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Next Steps */}
                    <motion.div variants={itemVariants} className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
                        <h2 className="text-xl font-serif mb-4 flex items-center gap-2">
                            <Mail size={20} className="text-blue-600 dark:text-blue-400" />
                            What's Next?
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                                    Order Confirmation Email
                                </h3>
                                <p className="text-sm text-blue-700 dark:text-blue-300">
                                    You'll receive a confirmation email with your receipt and tracking information within 15 minutes.
                                </p>
                            </div>
                            <div>
                                <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                                    Order Processing
                                </h3>
                                <p className="text-sm text-blue-700 dark:text-blue-300">
                                    Your order will be processed within 1-2 business days. You'll receive tracking information once shipped.
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Action Buttons */}
                    <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="/shop"
                            className="bg-gold hover:bg-gold/90 text-black font-medium py-4 px-8 transition-all duration-300 hover:scale-[1.02] tracking-widest uppercase text-sm text-center"
                        >
                            {CART_CONFIG.messaging.checkout.confirmation.continueShoppingCTA}
                        </Link>

                        <Link
                            href={`/orders/${order.order_number}`}
                            className="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 font-medium py-4 px-8 transition-all duration-300 hover:scale-[1.02] tracking-widest uppercase text-sm text-center"
                        >
                            {CART_CONFIG.messaging.checkout.confirmation.trackOrderCTA}
                        </Link>

                        <button className="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 font-medium py-4 px-8 transition-all duration-300 hover:scale-[1.02] tracking-widest uppercase text-sm flex items-center justify-center gap-2">
                            <Download size={16} />
                            Download Receipt
                        </button>
                    </motion.div>

                    {/* Customer Support */}
                    <motion.div variants={itemVariants} className="text-center pt-8 border-t border-gray-200 dark:border-gray-700">
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                            Questions about your order?
                        </p>
                        <Link
                            href="/contact"
                            className="text-gold hover:text-gold/80 font-medium transition-colors inline-flex items-center gap-2"
                        >
                            Contact Customer Support
                            <ArrowRight size={16} />
                        </Link>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
}

// Error state component
function OrderNotFound({ orderNumber, error }: { orderNumber: string; error: string | null }) {
    return (
        <div className="min-h-screen bg-white dark:bg-black pt-[var(--navbar-height)] flex items-center justify-center">
            <div className="text-center max-w-md">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-2xl">❌</span>
                </div>
                <h1 className="text-2xl font-serif mb-4">Order Not Found</h1>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                    {error || `We couldn't find order ${orderNumber}. Please check your order number and try again.`}
                </p>
                <div className="flex gap-4 justify-center">
                    <Link href="/orders" className="text-gold hover:text-gold/80 font-medium">
                        View All Orders
                    </Link>
                    <Link href="/shop" className="bg-gold hover:bg-gold/90 text-black px-6 py-2 font-medium">
                        Continue Shopping
                    </Link>
                </div>
            </div>
        </div>
    );
}

// Loading skeleton
function OrderConfirmationSkeleton() {
    return (
        <div className="min-h-screen bg-white dark:bg-black pt-[var(--navbar-height)]">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="animate-pulse space-y-8">
                    <div className="text-center">
                        <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-6" />
                        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64 mx-auto mb-4" />
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-96 mx-auto mb-6" />
                        <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded w-64 mx-auto" />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded" />
                        <div className="space-y-6">
                            <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded" />
                            <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}