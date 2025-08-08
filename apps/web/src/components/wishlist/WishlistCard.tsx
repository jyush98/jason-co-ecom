// components/wishlist/WishlistCard.tsx - Individual Wishlist Item Component
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    ShoppingCart,
    Trash2,
    Edit3,
    Save,
    X,
    Calendar,
    Tag,
    Eye
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import {
    WishlistItem,
    useWishlistActions,
    useWishlistCollections
} from "@/app/store/wishlistStore";
import { formatCartPrice } from "@/config/cartConfig";
import { useCartActions } from "@/app/store/cartStore";

interface WishlistCardProps {
    item: WishlistItem;
    viewMode: 'grid' | 'list';
    isSelected: boolean;
    onSelect: (productId: number) => void;
    onRemove: () => void;
    variants?: any;
    index?: number;
}

interface EditState {
    notes: string;
    collection_name: string;
    priority: 1 | 2 | 3;
}

export default function WishlistCard({
    item,
    viewMode,
    isSelected,
    onSelect,
    onRemove,
    variants,
    index = 0
}: WishlistCardProps) {
    const { getToken } = useAuth();
    const collections = useWishlistCollections();
    const { updateWishlistItem, removeFromWishlist } = useWishlistActions();
    const { addToCart } = useCartActions();

    // UI State
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [error, setError] = useState<string>('');

    // Edit State
    const [editState, setEditState] = useState<EditState>({
        notes: item.notes || '',
        collection_name: item.collection_name || '',
        priority: item.priority
    });

    // Handle edit save
    const handleSaveEdit = async () => {
        setIsLoading(true);
        setError('');

        try {
            const token = await getToken();
            if (!token) throw new Error('Authentication required');

            const result = await updateWishlistItem(token, item.id, {
                notes: editState.notes || undefined,
                collection_name: editState.collection_name || undefined,
                priority: editState.priority
            });

            if (result.success) {
                setIsEditing(false);
            } else {
                throw new Error(result.error || 'Failed to update item');
            }
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Update failed');
        } finally {
            setIsLoading(false);
        }
    };

    // Handle cancel edit
    const handleCancelEdit = () => {
        setEditState({
            notes: item.notes || '',
            collection_name: item.collection_name || '',
            priority: item.priority
        });
        setIsEditing(false);
        setError('');
    };

    // Handle remove from wishlist
    const handleRemove = async () => {
        setIsLoading(true);
        try {
            const token = await getToken();
            if (!token) throw new Error('Authentication required');

            const result = await removeFromWishlist(token, item.product_id);
            if (result.success) {
                onRemove();
            } else {
                throw new Error(result.error || 'Failed to remove item');
            }
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Remove failed');
        } finally {
            setIsLoading(false);
        }
    };

    // Handle add to cart
    const handleAddToCart = async () => {
        setIsLoading(true);
        try {
            const token = await getToken();
            if (!token) throw new Error('Authentication required');

            // Use existing cart store action
            await addToCart(item.product_id, 1, token);
            // Show success feedback
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Add to cart failed');
        } finally {
            setIsLoading(false);
        }
    };

    // Priority display
    const getPriorityDisplay = (priority: number) => {
        switch (priority) {
            case 1:
                return { label: 'High', color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20' };
            case 2:
                return { label: 'Medium', color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-900/20' };
            case 3:
                return { label: 'Low', color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20' };
            default:
                return { label: 'Low', color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20' };
        }
    };

    const priorityDisplay = getPriorityDisplay(item.priority);
    const dateAdded = new Date(item.created_at).toLocaleDateString();

    if (viewMode === 'list') {
        return (
            <motion.div
                variants={variants}
                className="flex items-center gap-4 p-4 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg hover:shadow-lg transition-shadow"
            >
                {/* Selection Checkbox */}
                <div className="flex-shrink-0">
                    <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onSelect(item.product_id)}
                        className="w-4 h-4 text-gold focus:ring-gold border-gray-300 rounded"
                    />
                </div>

                {/* Product Image */}
                <Link href={`/product/${item.product.id}`} className="flex-shrink-0">
                    <div className="relative w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded overflow-hidden">
                        <Image
                            src={item.product.image_url || '/placeholder-product.jpg'}
                            alt={item.product.name}
                            fill
                            className="object-cover hover:scale-110 transition-transform duration-300"
                        />
                    </div>
                </Link>

                {/* Product Info */}
                <div className="flex-1 min-w-0">
                    <Link href={`/product/${item.product.id}`}>
                        <h3 className="font-medium truncate hover:text-gold transition-colors">
                            {item.product.name}
                        </h3>
                    </Link>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {item.product.category}
                    </p>
                    {item.notes && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                            "{item.notes}"
                        </p>
                    )}
                </div>

                {/* Collection */}
                <div className="hidden md:block text-sm text-gray-500">
                    {item.collection_name || 'Uncategorized'}
                </div>

                {/* Priority */}
                <div className="hidden md:block">
                    <span className={`px-2 py-1 text-xs rounded ${priorityDisplay.bg} ${priorityDisplay.color}`}>
                        {priorityDisplay.label}
                    </span>
                </div>

                {/* Price */}
                <div className="text-right">
                    <p className="font-medium text-gold">{formatCartPrice(item.product.price)}</p>
                    <p className="text-xs text-gray-500">Added {dateAdded}</p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleAddToCart}
                        disabled={isLoading}
                        className="p-2 text-gray-400 hover:text-gold transition-colors disabled:opacity-50"
                        title="Add to cart"
                    >
                        <ShoppingCart size={16} />
                    </button>
                    <button
                        onClick={() => setIsEditing(true)}
                        className="p-2 text-gray-400 hover:text-blue-500 transition-colors"
                        title="Edit"
                    >
                        <Edit3 size={16} />
                    </button>
                    <button
                        onClick={handleRemove}
                        disabled={isLoading}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
                        title="Remove"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </motion.div>
        );
    }

    // Grid View
    return (
        <motion.div
            variants={variants}
            className="group relative bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300"
            whileHover={{ y: -4 }}
        >
            {/* Loading Overlay */}
            {isLoading && (
                <div className="absolute inset-0 bg-white/50 dark:bg-black/50 flex items-center justify-center z-20">
                    <div className="w-6 h-6 border-2 border-gold border-t-transparent rounded-full animate-spin" />
                </div>
            )}

            {/* Selection Checkbox */}
            <div className="absolute top-3 left-3 z-10">
                <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onSelect(item.product_id)}
                    className="w-4 h-4 text-gold focus:ring-gold border-gray-300 rounded"
                />
            </div>

            {/* Priority Badge */}
            <div className="absolute top-3 right-3 z-10">
                <span className={`px-2 py-1 text-xs rounded ${priorityDisplay.bg} ${priorityDisplay.color} backdrop-blur-sm`}>
                    {priorityDisplay.label}
                </span>
            </div>

            {/* Product Image */}
            <Link href={`/product/${item.product.id}`} className="block">
                <div className="relative aspect-square bg-gray-100 dark:bg-gray-800 overflow-hidden">
                    <Image
                        src={item.product.image_url || '/placeholder-product.jpg'}
                        alt={item.product.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <div className="bg-white/90 dark:bg-black/90 rounded-full p-2">
                            <Eye size={20} className="text-gray-700 dark:text-gray-300" />
                        </div>
                    </div>
                </div>
            </Link>

            {/* Card Content */}
            <div className="p-4 space-y-3">
                {/* Product Info */}
                <div>
                    <Link href={`/product/${item.product.id}`}>
                        <h3 className="font-medium line-clamp-2 hover:text-gold transition-colors group-hover:text-gold">
                            {item.product.name}
                        </h3>
                    </Link>
                    {item.product.category && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {item.product.category}
                        </p>
                    )}
                </div>

                {/* Price */}
                <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold text-gold">
                        {formatCartPrice(item.product.price)}
                    </span>
                    {item.price_when_added && item.price_when_added !== item.product.price * 100 && (
                        <span className="text-xs text-gray-500 line-through">
                            {formatCartPrice(item.price_when_added / 100)}
                        </span>
                    )}
                </div>

                {/* Collection */}
                {item.collection_name && (
                    <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                        <Tag size={14} />
                        <span>{item.collection_name}</span>
                    </div>
                )}

                {/* Notes */}
                {!isEditing && item.notes && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        "{item.notes}"
                    </p>
                )}

                {/* Edit Form */}
                <AnimatePresence>
                    {isEditing && (
                        <motion.div
                            className="space-y-3 p-3 bg-gray-50 dark:bg-gray-900 rounded border"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            {/* Notes */}
                            <div>
                                <label className="block text-xs font-medium mb-1">Notes</label>
                                <textarea
                                    value={editState.notes}
                                    onChange={(e) => setEditState(prev => ({ ...prev, notes: e.target.value }))}
                                    placeholder="Add personal notes..."
                                    className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-black rounded focus:outline-none focus:ring-1 focus:ring-gold"
                                    rows={2}
                                />
                            </div>

                            {/* Collection */}
                            <div>
                                <label className="block text-xs font-medium mb-1">Collection</label>
                                <select
                                    value={editState.collection_name}
                                    onChange={(e) => setEditState(prev => ({ ...prev, collection_name: e.target.value }))}
                                    className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-black rounded focus:outline-none focus:ring-1 focus:ring-gold"
                                >
                                    <option value="">No Collection</option>
                                    {collections.map((collection) => (
                                        <option key={collection.id} value={collection.name}>
                                            {collection.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Priority */}
                            <div>
                                <label className="block text-xs font-medium mb-1">Priority</label>
                                <select
                                    value={editState.priority}
                                    onChange={(e) => setEditState(prev => ({ ...prev, priority: Number(e.target.value) as 1 | 2 | 3 }))}
                                    className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-black rounded focus:outline-none focus:ring-1 focus:ring-gold"
                                >
                                    <option value={1}>High Priority</option>
                                    <option value={2}>Medium Priority</option>
                                    <option value={3}>Low Priority</option>
                                </select>
                            </div>

                            {/* Edit Actions */}
                            <div className="flex gap-2">
                                <button
                                    onClick={handleSaveEdit}
                                    disabled={isLoading}
                                    className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-gold hover:bg-gold/90 text-black text-sm rounded transition-colors disabled:opacity-50"
                                >
                                    <Save size={14} />
                                    <span>Save</span>
                                </button>
                                <button
                                    onClick={handleCancelEdit}
                                    className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-sm rounded hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                >
                                    <X size={14} />
                                    <span>Cancel</span>
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Date Added */}
                <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Calendar size={12} />
                    <span>Added {dateAdded}</span>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                    <button
                        onClick={handleAddToCart}
                        disabled={isLoading}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gold hover:bg-gold/90 text-black rounded transition-colors disabled:opacity-50 text-sm"
                    >
                        <ShoppingCart size={14} />
                        <span>Add to Cart</span>
                    </button>

                    <div className="flex gap-1">
                        {!isEditing && (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                                title="Edit item"
                            >
                                <Edit3 size={16} />
                            </button>
                        )}

                        <button
                            onClick={handleRemove}
                            disabled={isLoading}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors disabled:opacity-50"
                            title="Remove from wishlist"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                </div>

                {/* Error Message */}
                <AnimatePresence>
                    {error && (
                        <motion.div
                            className="text-xs text-red-500 bg-red-50 dark:bg-red-900/20 p-2 rounded"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            {error}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}