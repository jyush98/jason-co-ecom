// app/checkout/confirmation/page.tsx
"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { Check, Package, Truck, CreditCard, Calendar, ArrowRight } from "lucide-react";
import Link from "next/link";
import { formatCartPrice } from "@/config/cartConfig";

export default function OrderConfirmationPage() {
    const searchParams = useSearchParams();
    const orderNumber = searchParams?.get('order_number') || 'ORD-UNKNOWN';
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Simulate loading order details
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 1000);

        return () => clearTimeout(timer);
    }, []);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                duration: 0.8,
                staggerChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6, ease: "easeOut" }
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-white dark:bg-black pt-[var(--navbar-height)] flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">Processing your order...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white pt-[var(--navbar-height)]">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="text-center"
                >
                    {/* Success Icon */}
                    <motion.div
                        variants={itemVariants}
                        className="mb-8"
                    >
                        <div className="w-24 h-24 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Check size={48} className="text-green-600 dark:text-green-400" />
                        </div>
                        <h1 className="text-3xl md:text-4xl font-serif mb-4">
                            Order Confirmed!
                        </h1>
                        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                            Thank you for your purchase. Your order has been confirmed and is being prepared with the utmost care.
                        </p>
                    </motion.div>

                    {/* Order Number */}
                    <motion.div
                        variants={itemVariants}
                        className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 mb-8"
                    >
                        <h2 className="text-lg font-medium mb-2">Order Number</h2>
                        <p className="text-2xl font-serif text-gold tracking-wider">{orderNumber}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                            A confirmation email has been sent to your email address
                        </p>
                    </motion.div>

                    {/* Order Status Cards */}
                    <motion.div
                        variants={itemVariants}
                        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
                    >
                        {/* Payment Confirmed */}
                        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
                            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CreditCard size={24} className="text-green-600 dark:text-green-400" />
                            </div>
                            <h3 className="font-medium mb-2">Payment Confirmed</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Your payment has been processed successfully
                            </p>
                        </div>

                        {/* Order Processing */}
                        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
                            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Package size={24} className="text-blue-600 dark:text-blue-400" />
                            </div>
                            <h3 className="font-medium mb-2">Order Processing</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Your order is being carefully prepared
                            </p>
                        </div>

                        {/* Shipping Soon */}
                        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
                            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Truck size={24} className="text-orange-600 dark:text-orange-400" />
                            </div>
                            <h3 className="font-medium mb-2">Shipping Soon</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                You'll receive tracking info within 24 hours
                            </p>
                        </div>
                    </motion.div>

                    {/* Estimated Delivery */}
                    <motion.div
                        variants={itemVariants}
                        className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-8"
                    >
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <Calendar size={20} className="text-blue-600 dark:text-blue-400" />
                            <h3 className="font-medium text-blue-900 dark:text-blue-100">Estimated Delivery</h3>
                        </div>
                        <p className="text-blue-700 dark:text-blue-300">
                            <strong>3-5 business days</strong> for standard shipping
                        </p>
                        <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                            You'll receive tracking information via email once your order ships
                        </p>
                    </motion.div>

                    {/* Action Buttons */}
                    <motion.div
                        variants={itemVariants}
                        className="flex flex-col sm:flex-row gap-4 justify-center mb-8"
                    >
                        <Link
                            href="/orders"
                            className="inline-flex items-center justify-center gap-2 bg-gold hover:bg-gold/90 text-black font-medium px-8 py-4 rounded-lg transition-all duration-300 hover:scale-[1.02] tracking-widest uppercase text-sm"
                        >
                            Track Your Order
                            <ArrowRight size={16} />
                        </Link>

                        <Link
                            href="/shop"
                            className="inline-flex items-center justify-center gap-2 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 font-medium px-8 py-4 rounded-lg transition-all duration-300 tracking-widest uppercase text-sm"
                        >
                            Continue Shopping
                        </Link>
                    </motion.div>

                    {/* Customer Support */}
                    <motion.div
                        variants={itemVariants}
                        className="border-t border-gray-200 dark:border-gray-700 pt-8"
                    >
                        <h3 className="font-medium mb-4">Need Help?</h3>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center text-sm">
                            <Link
                                href="/contact"
                                className="text-gold hover:text-gold/80 transition-colors"
                            >
                                Contact Customer Support
                            </Link>
                            <span className="hidden sm:inline text-gray-400">•</span>
                            <Link
                                href="/returns"
                                className="text-gold hover:text-gold/80 transition-colors"
                            >
                                Return Policy
                            </Link>
                            <span className="hidden sm:inline text-gray-400">•</span>
                            <Link
                                href="/shipping"
                                className="text-gold hover:text-gold/80 transition-colors"
                            >
                                Shipping Information
                            </Link>
                        </div>
                    </motion.div>

                    {/* Newsletter Signup */}
                    <motion.div
                        variants={itemVariants}
                        className="mt-12 bg-gray-50 dark:bg-gray-900 rounded-lg p-8"
                    >
                        <h3 className="text-lg font-medium mb-4">Stay Updated</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            Be the first to know about new collections and exclusive offers
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-black rounded-lg focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
                            />
                            <button className="bg-gold hover:bg-gold/90 text-black font-medium px-6 py-3 rounded-lg transition-all duration-300 whitespace-nowrap">
                                Subscribe
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
}