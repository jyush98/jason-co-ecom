"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import {
    Package,
    Calendar,
    Eye,
    Filter,
    Search,
    ChevronDown,
    Truck,
    CheckCircle,
    Clock,
    XCircle,
    RefreshCw
} from "lucide-react";

interface Order {
    order_number: string;
    status: string;
    total_price: number;
    created_at: string;
    item_count: number;
}

interface OrderHistoryProps {
    limit?: number;
    showPagination?: boolean;
    className?: string;
}

type SortOption = 'date-desc' | 'date-asc' | 'total-desc' | 'total-asc' | 'status';
type FilterOption = 'all' | 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export default function OrderHistory({
    limit = 50,
    showPagination = true,
    className = ""
}: OrderHistoryProps) {
    const { getToken } = useAuth();

    // State management
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState<SortOption>('date-desc');
    const [filterBy, setFilterBy] = useState<FilterOption>('all');
    const [showFilters, setShowFilters] = useState(false);

    // Fetch orders from API
    const fetchOrders = async () => {
        try {
            setLoading(true);
            setError(null);

            const token = await getToken();
            if (!token) {
                throw new Error('Authentication required');
            }

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/payment/orders?limit=${limit}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (!response.ok) {
                throw new Error(`Failed to fetch orders: ${response.statusText}`);
            }

            const data = await response.json();
            setOrders(data.orders || []);
        } catch (err) {
            console.error('Orders fetch error:', err);
            setError(err instanceof Error ? err.message : 'Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [limit]);

    // Filter and sort orders
    const processedOrders = orders
        .filter((order) => {
            // Search filter
            if (searchTerm) {
                const searchLower = searchTerm.toLowerCase();
                return (
                    order.order_number.toLowerCase().includes(searchLower) ||
                    order.status.toLowerCase().includes(searchLower)
                );
            }
            return true;
        })
        .filter((order) => {
            // Status filter
            if (filterBy === 'all') return true;
            return order.status.toLowerCase() === filterBy;
        })
        .sort((a, b) => {
            switch (sortBy) {
                case 'date-desc':
                    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                case 'date-asc':
                    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
                case 'total-desc':
                    return b.total_price - a.total_price;
                case 'total-asc':
                    return a.total_price - b.total_price;
                case 'status':
                    return a.status.localeCompare(b.status);
                default:
                    return 0;
            }
        });

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05,
                delayChildren: 0.1,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.4, ease: "easeOut" },
        },
    };

    return (
        <motion.div
            className={`space-y-6 ${className}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
        >
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-serif text-black dark:text-white">
                        Order History
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Track your purchases and view order details
                    </p>
                </div>

                <button
                    onClick={fetchOrders}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:border-gold transition-colors disabled:opacity-50"
                >
                    <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                    Refresh
                </button>
            </div>

            {/* Search and Filters */}
            <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                    {/* Search */}
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search by order number or status..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-black rounded-lg focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
                        />
                    </div>

                    {/* Filter Toggle */}
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center gap-2 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:border-gold transition-colors"
                    >
                        <Filter size={16} />
                        Filters
                        <ChevronDown size={16} className={`transform transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                    </button>
                </div>

                {/* Expanded Filters */}
                <AnimatePresence>
                    {showFilters && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                        >
                            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {/* Sort Options */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Sort by
                                        </label>
                                        <select
                                            value={sortBy}
                                            onChange={(e) => setSortBy(e.target.value as SortOption)}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-black rounded-lg focus:outline-none focus:ring-2 focus:ring-gold"
                                        >
                                            <option value="date-desc">Newest First</option>
                                            <option value="date-asc">Oldest First</option>
                                            <option value="total-desc">Highest Amount</option>
                                            <option value="total-asc">Lowest Amount</option>
                                            <option value="status">Status</option>
                                        </select>
                                    </div>

                                    {/* Status Filter */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Filter by Status
                                        </label>
                                        <select
                                            value={filterBy}
                                            onChange={(e) => setFilterBy(e.target.value as FilterOption)}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-black rounded-lg focus:outline-none focus:ring-2 focus:ring-gold"
                                        >
                                            <option value="all">All Orders</option>
                                            <option value="pending">Pending</option>
                                            <option value="confirmed">Confirmed</option>
                                            <option value="processing">Processing</option>
                                            <option value="shipped">Shipped</option>
                                            <option value="delivered">Delivered</option>
                                            <option value="cancelled">Cancelled</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Results Summary */}
            <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>
                    {loading ? 'Loading...' : `${processedOrders.length} order${processedOrders.length !== 1 ? 's' : ''} found`}
                </span>
                {(searchTerm || filterBy !== 'all') && (
                    <button
                        onClick={() => {
                            setSearchTerm('');
                            setFilterBy('all');
                            setSortBy('date-desc');
                        }}
                        className="text-gold hover:text-gold/80 transition-colors"
                    >
                        Clear filters
                    </button>
                )}
            </div>

            {/* Error State */}
            {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                        <XCircle size={16} />
                        <span>{error}</span>
                    </div>
                </div>
            )}

            {/* Orders List */}
            {loading ? (
                <OrderHistorySkeleton />
            ) : processedOrders.length > 0 ? (
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="space-y-4"
                >
                    {processedOrders.map((order) => (
                        <OrderCard key={order.order_number} order={order} variants={itemVariants} />
                    ))}
                </motion.div>
            ) : (
                <EmptyOrdersState
                    hasFilters={searchTerm !== '' || filterBy !== 'all'}
                    onClearFilters={() => {
                        setSearchTerm('');
                        setFilterBy('all');
                    }}
                />
            )}
        </motion.div>
    );
}

// Order Card Component
function OrderCard({ order, variants }: { order: Order; variants: any }) {
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusIcon = (status: string) => {
        switch (status.toLowerCase()) {
            case 'delivered':
                return <CheckCircle className="text-green-600" size={20} />;
            case 'shipped':
                return <Truck className="text-blue-600" size={20} />;
            case 'processing':
            case 'confirmed':
                return <Clock className="text-yellow-600" size={20} />;
            case 'cancelled':
                return <XCircle className="text-red-600" size={20} />;
            default:
                return <Package className="text-gray-600" size={20} />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'delivered':
                return 'text-green-600 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
            case 'shipped':
                return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
            case 'processing':
            case 'confirmed':
                return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
            case 'cancelled':
                return 'text-red-600 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
            default:
                return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800';
        }
    };

    return (
        <motion.div variants={variants}>
            <div className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-gold dark:hover:border-gold transition-all duration-300 hover:shadow-lg">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    {/* Order Info */}
                    <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                            <Package className="text-gold" size={24} />
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-lg font-semibold text-black dark:text-white">
                                    {order.order_number}
                                </h3>
                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                                    {getStatusIcon(order.status)}
                                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                </span>
                            </div>

                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-600 dark:text-gray-400">
                                <div className="flex items-center gap-1">
                                    <Calendar size={14} />
                                    {formatDate(order.created_at)}
                                </div>
                                <div className="flex items-center gap-1">
                                    <Package size={14} />
                                    {order.item_count} item{order.item_count !== 1 ? 's' : ''}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Order Total and Actions */}
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <div className="text-2xl font-bold text-gold">
                                ${order.total_price.toFixed(2)}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                Total Amount
                            </div>
                        </div>

                        <Link
                            href={`/account/orders/${order.order_number}`}
                            className="flex items-center gap-2 px-4 py-2 bg-gold hover:bg-gold/90 text-black font-medium rounded-lg transition-all duration-300 hover:scale-105"
                        >
                            <Eye size={16} />
                            View Details
                        </Link>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

// Empty State Component
function EmptyOrdersState({
    hasFilters,
    onClearFilters
}: {
    hasFilters: boolean;
    onClearFilters: () => void;
}) {
    return (
        <div className="text-center py-16">
            <Package size={64} className="mx-auto text-gray-400 mb-6" />
            <h3 className="text-xl font-serif text-black dark:text-white mb-2">
                {hasFilters ? 'No orders match your filters' : 'No orders yet'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
                {hasFilters
                    ? 'Try adjusting your search terms or filters to find what you\'re looking for.'
                    : 'When you make your first purchase, your order history will appear here.'
                }
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {hasFilters && (
                    <button
                        onClick={onClearFilters}
                        className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:border-gold transition-colors"
                    >
                        Clear Filters
                    </button>
                )}

                <Link
                    href="/shop"
                    className="px-6 py-3 bg-gold hover:bg-gold/90 text-black font-medium rounded-lg transition-all duration-300 hover:scale-105"
                >
                    Start Shopping
                </Link>
            </div>
        </div>
    );
}

// Loading Skeleton
function OrderHistorySkeleton() {
    return (
        <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg animate-pulse">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                            <div className="space-y-2">
                                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-32" />
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-48" />
                            </div>
                        </div>
                        <div className="text-right space-y-2">
                            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20" />
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}