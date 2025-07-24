// components/account/AccountDashboard.tsx - Fixed with Correct API Types
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useUser, useAuth } from "@clerk/nextjs";
import {
    Package,
    Heart,
    ShoppingBag,
    TrendingUp,
    Clock,
    Star,
    ArrowRight,
    Calendar,
    DollarSign,
    User,
    MapPin
} from "lucide-react";
import Link from "next/link";

// Correct API response interfaces based on your backend
interface OrderItem {
    order_number: string;
    status: string;
    total_price: number; // Your API uses total_price, not total
    created_at: string;
    item_count: number;
}

interface OrdersApiResponse {
    orders: OrderItem[];
    // Note: Your API doesn't return total_spent, so we'll calculate it
}

interface WishlistApiResponse {
    total_items: number;
    total_value: number;
}

interface DashboardStats {
    totalOrders: number;
    totalSpent: number;
    wishlistItems: number;
    recentOrders: Array<{
        id: string;
        order_number: string;
        total: number; // This will come from total_price
        status: string;
        created_at: string;
        items_count: number;
    }>;
    wishlistValue: number;
    memberSince: string;
}

interface AccountDashboardProps {
    onTabChange?: (tab: string) => void;
}

export default function AccountDashboard({ onTabChange }: AccountDashboardProps) {
    const { user, isLoaded } = useUser();
    const { getToken } = useAuth();
    const [stats, setStats] = useState<DashboardStats>({
        totalOrders: 0,
        totalSpent: 0,
        wishlistItems: 0,
        recentOrders: [],
        wishlistValue: 0,
        memberSince: ''
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string>('');

    // Fetch dashboard data
    useEffect(() => {
        const fetchDashboardData = async () => {
            if (!user || !isLoaded) return;

            try {
                const token = await getToken();

                // Parallel API calls for better performance
                const [ordersResponse, wishlistResponse] = await Promise.all([
                    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/payment/orders`, {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json',
                        },
                    }),
                    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/wishlist/stats`, {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json',
                        },
                    })
                ]);

                let ordersData: OrdersApiResponse = { orders: [] };
                let wishlistData: WishlistApiResponse = { total_items: 0, total_value: 0 };

                // Handle orders response
                if (ordersResponse.ok) {
                    ordersData = await ordersResponse.json();
                } else {
                    console.warn('Orders API unavailable:', ordersResponse.status);
                }

                // Handle wishlist response
                if (wishlistResponse.ok) {
                    wishlistData = await wishlistResponse.json();
                } else {
                    console.warn('Wishlist API unavailable');
                }

                // Calculate total spent from orders (since API doesn't provide it)
                const totalSpent = ordersData.orders.reduce((sum, order) => sum + (order.total_price || 0), 0);

                setStats({
                    totalOrders: ordersData.orders.length,
                    totalSpent: totalSpent,
                    wishlistItems: wishlistData.total_items,
                    recentOrders: ordersData.orders.slice(0, 3).map(order => ({
                        id: order.order_number, // Use order_number as id
                        order_number: order.order_number,
                        total: order.total_price, // Map total_price to total for display
                        status: order.status,
                        created_at: order.created_at,
                        items_count: order.item_count
                    })),
                    wishlistValue: wishlistData.total_value,
                    memberSince: user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long'
                    }) : ''
                });

            } catch (error) {
                console.error('Failed to fetch dashboard data:', error);
                setError('Failed to load dashboard data');
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, [user, isLoaded, getToken]);

    const formatPrice = (amount: number) => {
        // Add safety check for invalid numbers
        if (isNaN(amount) || amount === null || amount === undefined) {
            return '$0';
        }

        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'confirmed':
            case 'completed':
                return 'text-green-600 bg-green-50 dark:bg-green-900/20';
            case 'pending':
                return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20';
            case 'shipped':
                return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20';
            default:
                return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20';
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5, ease: "easeOut" },
        },
    };

    if (isLoading) {
        return <DashboardSkeleton />;
    }

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8"
        >
            {/* Welcome Section */}
            <motion.div variants={itemVariants} className="mb-8">
                <h2 className="text-2xl font-serif text-black dark:text-white mb-2">
                    Welcome back, {user?.firstName || 'Valued Customer'}
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                    Member since {stats.memberSince} • Here's your account overview
                </p>
            </motion.div>

            {/* Error Display */}
            {error && (
                <motion.div
                    variants={itemVariants}
                    className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
                >
                    <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
                </motion.div>
            )}

            {/* Stats Grid */}
            <motion.div
                variants={itemVariants}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
                {/* Total Orders */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-6 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 bg-blue-600 rounded-lg">
                            <Package size={20} className="text-white" />
                        </div>
                        <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                            {stats.totalOrders}
                        </span>
                    </div>
                    <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-1">
                        Total Orders
                    </h3>
                    <p className="text-xs text-blue-600 dark:text-blue-400">
                        Lifetime purchases
                    </p>
                </div>

                {/* Total Spent */}
                <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-6 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 bg-green-600 rounded-lg">
                            <DollarSign size={20} className="text-white" />
                        </div>
                        <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                            {formatPrice(stats.totalSpent)}
                        </span>
                    </div>
                    <h3 className="text-sm font-medium text-green-800 dark:text-green-300 mb-1">
                        Total Spent
                    </h3>
                    <p className="text-xs text-green-600 dark:text-green-400">
                        Lifetime value
                    </p>
                </div>

                {/* Wishlist Items */}
                <div
                    className="bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-800/20 p-6 rounded-lg border border-pink-200 dark:border-pink-800 cursor-pointer hover:scale-105 transition-transform duration-300"
                    onClick={() => onTabChange?.('wishlist')}
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 bg-pink-600 rounded-lg">
                            <Heart size={20} className="text-white" />
                        </div>
                        <span className="text-2xl font-bold text-pink-600 dark:text-pink-400">
                            {stats.wishlistItems}
                        </span>
                    </div>
                    <h3 className="text-sm font-medium text-pink-800 dark:text-pink-300 mb-1">
                        Wishlist Items
                    </h3>
                    <p className="text-xs text-pink-600 dark:text-pink-400">
                        {formatPrice(stats.wishlistValue)} saved
                    </p>
                </div>

                {/* Account Status */}
                <div className="bg-gradient-to-br from-gold/20 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 p-6 rounded-lg border border-gold/40 dark:border-yellow-800">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 bg-gold rounded-lg">
                            <Star size={20} className="text-black" />
                        </div>
                        <span className="text-sm font-medium text-gold">
                            VIP
                        </span>
                    </div>
                    <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-300 mb-1">
                        Account Status
                    </h3>
                    <p className="text-xs text-yellow-600 dark:text-yellow-400">
                        Premium member
                    </p>
                </div>
            </motion.div>

            {/* Recent Orders Section */}
            <motion.div variants={itemVariants} className="space-y-6">
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-serif text-black dark:text-white">Recent Orders</h3>
                    {stats.recentOrders && stats.recentOrders.length > 0 && (
                        <button
                            onClick={() => onTabChange?.('orders')}
                            className="flex items-center gap-2 text-gold hover:text-gold/80 transition-colors"
                        >
                            <span className="text-sm">View All</span>
                            <ArrowRight size={16} />
                        </button>
                    )}
                </div>

                {stats.recentOrders && stats.recentOrders.length > 0 ? (
                    <div className="space-y-4">
                        {stats.recentOrders.map((order) => (
                            <div
                                key={order.id}
                                className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-700 hover:border-gold/40 transition-colors cursor-pointer"
                                onClick={() => onTabChange?.('orders')}
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h4 className="font-medium text-black dark:text-white">
                                            Order {order.order_number}
                                        </h4>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            {new Date(order.created_at).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold text-black dark:text-white">
                                            {formatPrice(order.total)}
                                        </p>
                                        <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getStatusColor(order.status)}`}>
                                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                                    <span>{order.items_count} item{order.items_count !== 1 ? 's' : ''}</span>
                                    <div className="flex items-center gap-1">
                                        <span>View Details</span>
                                        <ArrowRight size={14} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                        <Package size={48} className="mx-auto mb-4 text-gray-400" />
                        <h4 className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-2">
                            No orders yet
                        </h4>
                        <p className="text-gray-500 dark:text-gray-500 mb-6">
                            Start shopping to see your orders here
                        </p>
                        <Link
                            href="/shop"
                            className="inline-flex items-center gap-2 bg-gold hover:bg-gold/90 text-black px-6 py-3 rounded-lg font-medium transition-colors"
                        >
                            <ShoppingBag size={18} />
                            Browse Collection
                        </Link>
                    </div>
                )}
            </motion.div>

            {/* Quick Actions */}
            <motion.div variants={itemVariants} className="space-y-6">
                <h3 className="text-xl font-serif text-black dark:text-white">Quick Actions</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Profile Quick Action */}
                    <button
                        onClick={() => onTabChange?.('profile')}
                        className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gold/40 transition-all duration-300 hover:scale-[1.02] text-left"
                    >
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <User size={20} className="text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <h4 className="font-medium text-black dark:text-white">Update Profile</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Manage your personal information
                            </p>
                        </div>
                        <ArrowRight size={16} className="ml-auto text-gray-400" />
                    </button>

                    {/* Addresses Quick Action */}
                    <button
                        onClick={() => onTabChange?.('addresses')}
                        className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gold/40 transition-all duration-300 hover:scale-[1.02] text-left"
                    >
                        <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                            <MapPin size={20} className="text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                            <h4 className="font-medium text-black dark:text-white">Manage Addresses</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Add or edit shipping addresses
                            </p>
                        </div>
                        <ArrowRight size={16} className="ml-auto text-gray-400" />
                    </button>
                </div>
            </motion.div>

            {/* Brand Footer */}
            <motion.div
                variants={itemVariants}
                className="text-center py-8 border-t border-gray-200 dark:border-gray-700"
            >
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">
                    Jason & Co.
                </p>
                <p className="text-gold font-medium text-sm tracking-wider">
                    WHERE AMBITION MEETS ARTISTRY
                </p>
            </motion.div>
        </motion.div>
    );
}

// Loading Skeleton Component
function DashboardSkeleton() {
    return (
        <div className="space-y-8 animate-pulse">
            {/* Welcome Section Skeleton */}
            <div className="space-y-3">
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-48" />
            </div>

            {/* Stats Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                ))}
            </div>

            {/* Recent Orders Skeleton */}
            <div className="space-y-4">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32" />
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                ))}
            </div>

            {/* Quick Actions Skeleton */}
            <div className="space-y-4">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Array.from({ length: 2 }).map((_, i) => (
                        <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                    ))}
                </div>
            </div>
        </div>
    );
}