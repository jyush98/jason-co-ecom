// components/wishlist/WishlistPage.tsx - Complete Wishlist Management
"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Heart,
    ShoppingCart,
    Search,
    Filter,
    Grid,
    List,
    Plus,
    Trash2,
    ArrowLeft,
    Package,
    Star,
    Calendar,
    DollarSign,
    Settings,
    X
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import {
    useWishlistItems,
    useWishlistCollections,
    useWishlistStats,
    useWishlistLoading,
    useWishlistError,
    useWishlistActions,
    useWishlistUtils,
    WishlistItem,
    WishlistCollection
} from "@/app/store/wishlistStore";
import { formatCartPrice } from "@/config/cartConfig";
import WishlistCard from "./WishlistCard";
import WishlistEmpty from "./WishlistEmpty";

interface WishlistPageProps {
    className?: string;
}

type ViewMode = 'grid' | 'list';
type SortOption = 'newest' | 'oldest' | 'price-high' | 'price-low' | 'name' | 'priority';
type FilterOption = 'all' | 'high-priority' | 'medium-priority' | 'low-priority';

export default function WishlistPage({ className = "" }: WishlistPageProps) {
    const { getToken } = useAuth();
    const items = useWishlistItems();
    const collections = useWishlistCollections();
    const stats = useWishlistStats();
    const isLoading = useWishlistLoading();
    const error = useWishlistError();

    const {
        fetchWishlist,
        fetchCollections,
        fetchStats,
        bulkAddToCart,
        bulkRemoveFromWishlist,
        createCollection,
        clearError
    } = useWishlistActions();

    // UI State
    const [viewMode, setViewMode] = useState<ViewMode>('grid');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCollection, setSelectedCollection] = useState<string>('all');
    const [sortBy, setSortBy] = useState<SortOption>('newest');
    const [filterBy, setFilterBy] = useState<FilterOption>('all');
    const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
    const [showFilters, setShowFilters] = useState(false);
    const [showNewCollectionModal, setShowNewCollectionModal] = useState(false);
    const [bulkLoading, setBulkLoading] = useState(false);

    const sectionRef = useRef<HTMLDivElement>(null);

    // Load wishlist data on mount
    useEffect(() => {
        const loadWishlistData = async () => {
            const token = await getToken();
            if (token) {
                await Promise.all([
                    fetchWishlist(token),
                    fetchCollections(token),
                    fetchStats(token)
                ]);
            }
        };

        loadWishlistData();
    }, [getToken, fetchWishlist, fetchCollections, fetchStats]);

    // Filter and sort items
    const filteredAndSortedItems = items
        .filter(item => {
            // Search filter
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                const matchesName = item.product.name.toLowerCase().includes(query);
                const matchesCategory = item.product.category?.toLowerCase().includes(query);
                const matchesNotes = item.notes?.toLowerCase().includes(query);
                if (!matchesName && !matchesCategory && !matchesNotes) return false;
            }

            // Collection filter
            if (selectedCollection !== 'all') {
                if (selectedCollection === 'uncategorized') {
                    if (item.collection_name) return false;
                } else {
                    if (item.collection_name !== selectedCollection) return false;
                }
            }

            // Priority filter
            if (filterBy !== 'all') {
                const priorityMap = { 'high-priority': 1, 'medium-priority': 2, 'low-priority': 3 };
                if (item.priority !== priorityMap[filterBy]) return false;
            }

            return true;
        })
        .sort((a, b) => {
            switch (sortBy) {
                case 'newest':
                    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                case 'oldest':
                    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
                case 'price-high':
                    return b.product.price - a.product.price;
                case 'price-low':
                    return a.product.price - b.product.price;
                case 'name':
                    return a.product.name.localeCompare(b.product.name);
                case 'priority':
                    return a.priority - b.priority;
                default:
                    return 0;
            }
        });

    // Bulk actions
    const handleSelectAll = () => {
        if (selectedItems.size === filteredAndSortedItems.length) {
            setSelectedItems(new Set());
        } else {
            setSelectedItems(new Set(filteredAndSortedItems.map(item => item.product_id)));
        }
    };

    const handleSelectItem = (productId: number) => {
        const newSelected = new Set(selectedItems);
        if (newSelected.has(productId)) {
            newSelected.delete(productId);
        } else {
            newSelected.add(productId);
        }
        setSelectedItems(newSelected);
    };

    const handleBulkAddToCart = async () => {
        if (selectedItems.size === 0) return;

        setBulkLoading(true);
        try {
            const token = await getToken();
            if (token) {
                const result = await bulkAddToCart(token, Array.from(selectedItems));
                if (result.success) {
                    setSelectedItems(new Set());
                    // Show success message or toast
                }
            }
        } catch (error) {
            console.error('Bulk add to cart failed:', error);
        } finally {
            setBulkLoading(false);
        }
    };

    const handleBulkRemove = async () => {
        if (selectedItems.size === 0) return;

        setBulkLoading(true);
        try {
            const token = await getToken();
            if (token) {
                const result = await bulkRemoveFromWishlist(token, Array.from(selectedItems));
                if (result.success) {
                    setSelectedItems(new Set());
                }
            }
        } catch (error) {
            console.error('Bulk remove failed:', error);
        } finally {
            setBulkLoading(false);
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

    if (isLoading && items.length === 0) {
        return <WishlistSkeleton />;
    }

    if (items.length === 0 && !isLoading) {
        return <WishlistEmpty />;
    }

    return (
        <div className={`min-h-screen bg-white dark:bg-black pt-[var(--navbar-height)] ${className}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Header */}
                <motion.div
                    ref={sectionRef}
                    className="mb-12"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <Link
                        href="/account"
                        className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gold transition-colors mb-6"
                    >
                        <ArrowLeft size={20} />
                        <span className="tracking-wide">Back to Account</span>
                    </Link>

                    <div className="flex items-center gap-4 mb-6">
                        <Heart size={32} className="text-gold" />
                        <h1 className="text-3xl md:text-4xl font-serif text-black dark:text-white">
                            Your Wishlist
                        </h1>
                    </div>

                    {/* Stats Cards */}
                    {stats && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <Package size={16} className="text-gold" />
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Total Items</span>
                                </div>
                                <p className="text-2xl font-semibold">{stats.total_items}</p>
                            </div>

                            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <DollarSign size={16} className="text-gold" />
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Total Value</span>
                                </div>
                                <p className="text-2xl font-semibold">{formatCartPrice(stats.total_value)}</p>
                            </div>

                            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <Star size={16} className="text-gold" />
                                    <span className="text-sm text-gray-600 dark:text-gray-400">High Priority</span>
                                </div>
                                <p className="text-2xl font-semibold">{stats.high_priority_items}</p>
                            </div>

                            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <Calendar size={16} className="text-gold" />
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Collections</span>
                                </div>
                                <p className="text-2xl font-semibold">{stats.collections}</p>
                            </div>
                        </div>
                    )}
                </motion.div>

                {/* Error Display */}
                {error && (
                    <motion.div
                        className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-red-600 dark:text-red-400">{error}</span>
                            <button
                                onClick={clearError}
                                className="text-red-400 hover:text-red-600 transition-colors"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* Controls */}
                <div className="mb-8 space-y-4">
                    {/* Search and View Controls */}
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                        {/* Search */}
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search your wishlist..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-black rounded-lg focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
                            />
                        </div>

                        {/* View Controls */}
                        <div className="flex items-center gap-4">
                            {/* Filters Button */}
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 hover:border-gold hover:text-gold transition-colors text-sm"
                            >
                                <Filter size={16} />
                                <span>Filters</span>
                            </button>

                            {/* View Mode Toggle */}
                            <div className="flex border border-gray-300 dark:border-gray-600 rounded overflow-hidden">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-2 transition-colors ${viewMode === 'grid'
                                            ? 'bg-gold text-black'
                                            : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                                        }`}
                                >
                                    <Grid size={16} />
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`p-2 transition-colors ${viewMode === 'list'
                                            ? 'bg-gold text-black'
                                            : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                                        }`}
                                >
                                    <List size={16} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Filters Panel */}
                    <AnimatePresence>
                        {showFilters && (
                            <motion.div
                                className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {/* Collection Filter */}
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Collection</label>
                                        <select
                                            value={selectedCollection}
                                            onChange={(e) => setSelectedCollection(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-black rounded focus:outline-none focus:ring-2 focus:ring-gold"
                                        >
                                            <option value="all">All Collections</option>
                                            <option value="uncategorized">Uncategorized</option>
                                            {collections.map((collection) => (
                                                <option key={collection.id} value={collection.name}>
                                                    {collection.name} ({collection.item_count})
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Priority Filter */}
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Priority</label>
                                        <select
                                            value={filterBy}
                                            onChange={(e) => setFilterBy(e.target.value as FilterOption)}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-black rounded focus:outline-none focus:ring-2 focus:ring-gold"
                                        >
                                            <option value="all">All Priorities</option>
                                            <option value="high-priority">High Priority</option>
                                            <option value="medium-priority">Medium Priority</option>
                                            <option value="low-priority">Low Priority</option>
                                        </select>
                                    </div>

                                    {/* Sort Options */}
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Sort By</label>
                                        <select
                                            value={sortBy}
                                            onChange={(e) => setSortBy(e.target.value as SortOption)}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-black rounded focus:outline-none focus:ring-2 focus:ring-gold"
                                        >
                                            <option value="newest">Newest First</option>
                                            <option value="oldest">Oldest First</option>
                                            <option value="price-high">Price: High to Low</option>
                                            <option value="price-low">Price: Low to High</option>
                                            <option value="name">Name A-Z</option>
                                            <option value="priority">Priority</option>
                                        </select>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Bulk Actions */}
                    {selectedItems.size > 0 && (
                        <motion.div
                            className="flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4"
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <span className="text-blue-700 dark:text-blue-300">
                                {selectedItems.size} item{selectedItems.size !== 1 ? 's' : ''} selected
                            </span>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={handleBulkAddToCart}
                                    disabled={bulkLoading}
                                    className="flex items-center gap-2 px-4 py-2 bg-gold hover:bg-gold/90 text-black rounded transition-colors disabled:opacity-50"
                                >
                                    <ShoppingCart size={16} />
                                    <span>Add to Cart</span>
                                </button>
                                <button
                                    onClick={handleBulkRemove}
                                    disabled={bulkLoading}
                                    className="flex items-center gap-2 px-4 py-2 border border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors disabled:opacity-50"
                                >
                                    <Trash2 size={16} />
                                    <span>Remove</span>
                                </button>
                            </div>
                        </motion.div>
                    )}
                </div>

                {/* Results Summary */}
                <div className="flex items-center justify-between mb-6">
                    <p className="text-gray-600 dark:text-gray-400">
                        Showing {filteredAndSortedItems.length} of {items.length} items
                    </p>
                    <button
                        onClick={handleSelectAll}
                        className="text-sm text-gold hover:text-gold/80 transition-colors"
                    >
                        {selectedItems.size === filteredAndSortedItems.length ? 'Deselect All' : 'Select All'}
                    </button>
                </div>

                {/* Items Grid/List */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className={
                        viewMode === 'grid'
                            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                            : "space-y-4"
                    }
                >
                    {filteredAndSortedItems.map((item, index) => (
                        <WishlistCard
                            key={item.id}
                            item={item}
                            viewMode={viewMode}
                            isSelected={selectedItems.has(item.product_id)}
                            onSelect={handleSelectItem}
                            onRemove={() => {
                                // Remove from selection if it was selected
                                const newSelected = new Set(selectedItems);
                                newSelected.delete(item.product_id);
                                setSelectedItems(newSelected);
                            }}
                            variants={itemVariants}
                            index={index}
                        />
                    ))}
                </motion.div>

                {/* No Results */}
                {filteredAndSortedItems.length === 0 && (searchQuery || selectedCollection !== 'all' || filterBy !== 'all') && (
                    <motion.div
                        className="text-center py-12"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.6 }}
                    >
                        <Heart size={48} className="mx-auto mb-4 text-gray-300" />
                        <h3 className="text-xl font-serif mb-2">No items found</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            Try adjusting your filters or search terms
                        </p>
                        <button
                            onClick={() => {
                                setSearchQuery('');
                                setSelectedCollection('all');
                                setFilterBy('all');
                            }}
                            className="px-6 py-3 border border-gold text-gold hover:bg-gold hover:text-black transition-all duration-300 tracking-wide uppercase text-sm"
                        >
                            Clear Filters
                        </button>
                    </motion.div>
                )}
            </div>
        </div>
    );
}

// Loading Skeleton
function WishlistSkeleton() {
    return (
        <div className="min-h-screen bg-white dark:bg-black pt-[var(--navbar-height)]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="animate-pulse">
                    {/* Header Skeleton */}
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64 mb-8" />

                    {/* Stats Skeleton */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded" />
                        ))}
                    </div>

                    {/* Controls Skeleton */}
                    <div className="flex gap-4 mb-8">
                        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded flex-1 max-w-md" />
                        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-24" />
                    </div>

                    {/* Grid Skeleton */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="h-80 bg-gray-200 dark:bg-gray-700 rounded" />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}