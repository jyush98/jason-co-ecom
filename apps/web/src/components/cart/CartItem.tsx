"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Minus, Heart, Trash2, Eye, AlertTriangle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { CART_CONFIG } from "@/config/cartConfig";
import { CartItem as CartItemType } from "@/types/cart";
import { formatCartPrice } from "@/config/cartConfig";

interface CartItemProps {
    item: CartItemType;
    onUpdateQuantity: (product_id: number, quantity: number, token: string) => Promise<any>;
    onRemoveItem: (product_id: number, token: string) => Promise<any>;
    onSaveForLater?: (product_id: number, token: string) => Promise<any>;
    getToken: () => Promise<string | null>;
    variant?: 'drawer' | 'page' | 'compact';
    showImage?: boolean;
    showActions?: boolean;
    className?: string;
    index?: number;
}

export default function CartItem({
    item,
    onUpdateQuantity,
    onRemoveItem,
    onSaveForLater,
    getToken,
    variant = 'page',
    showImage = true,
    showActions = true,
    className = "",
    index = 0
}: CartItemProps) {
    const [isUpdating, setIsUpdating] = useState(false);
    const [isRemoving, setIsRemoving] = useState(false);
    const [showConfirmDelete, setShowConfirmDelete] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleQuantityChange = async (change: number) => {
        const newQuantity = item.quantity + change;

        if (newQuantity < 1 || newQuantity > CART_CONFIG.features.maxQuantityPerItem) {
            return;
        }

        setIsUpdating(true);
        setError(null);

        try {
            const token = await getToken();
            if (!token) {
                throw new Error('Authentication required');
            }

            const result = await onUpdateQuantity(item.product_id, newQuantity, token);
            if (!result.success) {
                setError(result.error || 'Failed to update quantity');
            }
        } catch (error) {
            setError('Failed to update quantity');
            console.error('Failed to update quantity:', error);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleRemoveItem = async () => {
        if (showConfirmDelete) {
            setIsRemoving(true);
            setError(null);

            try {
                const token = await getToken();
                if (!token) {
                    throw new Error('Authentication required');
                }

                const result = await onRemoveItem(item.product_id, token);
                if (!result.success) {
                    setError(result.error || 'Failed to remove item');
                    setIsRemoving(false);
                }
                // If successful, component will unmount
            } catch (error) {
                setError('Failed to remove item');
                setIsRemoving(false);
                console.error('Failed to remove item:', error);
            }
        } else {
            setShowConfirmDelete(true);
            // Auto-hide confirmation after 3 seconds
            setTimeout(() => setShowConfirmDelete(false), 3000);
        }
    };

    const handleSaveForLater = async () => {
        if (onSaveForLater) {
            try {
                const token = await getToken();
                if (!token) {
                    throw new Error('Authentication required');
                }

                const result = await onSaveForLater(item.product_id, token);
                if (!result.success) {
                    setError(result.error || 'Failed to save for later');
                }
            } catch (error) {
                setError('Failed to save for later');
                console.error('Failed to save for later:', error);
            }
        }
    };

    // Variant-specific styles
    const variantStyles = {
        drawer: {
            container: "flex gap-3 pb-4 border-b border-gray-100 dark:border-gray-800 last:border-b-0",
            image: "w-16 h-16",
            content: "flex-1 min-w-0",
            title: "text-sm font-medium leading-5 mb-1 truncate",
            price: "text-sm font-medium text-gold mb-2",
            controls: "flex items-center justify-between"
        },
        page: {
            container: "flex flex-col md:flex-row gap-6 p-6 bg-gray-50 dark:bg-gray-900 rounded-lg",
            image: "w-full md:w-32 h-48 md:h-32",
            content: "flex-1",
            title: "text-lg font-serif mb-2 text-black dark:text-white",
            price: "text-xl font-serif text-gold",
            controls: "flex flex-col md:flex-row md:items-center md:justify-between gap-4"
        },
        compact: {
            container: "flex gap-4 py-4 border-b border-gray-100 dark:border-gray-800",
            image: "w-12 h-12",
            content: "flex-1 min-w-0",
            title: "text-sm font-medium mb-1 truncate",
            price: "text-sm text-gold",
            controls: "flex items-center gap-2"
        }
    };

    const styles = variantStyles[variant];

    return (
        <motion.div
            className={`${styles.container} ${className} relative`}
            initial={{ opacity: 0, x: variant === 'drawer' ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: variant === 'drawer' ? -20 : 20 }}
            transition={{
                duration: CART_CONFIG.animations.itemAdd / 1000,
                delay: index * 0.1
            }}
            layout
        >
            {/* Loading Overlay */}
            {(isUpdating || isRemoving) && (
                <motion.div
                    className="absolute inset-0 bg-white/50 dark:bg-black/50 flex items-center justify-center rounded z-10"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <div className="w-6 h-6 border-2 border-gold border-t-transparent rounded-full animate-spin" />
                </motion.div>
            )}

            {/* Product Image */}
            {showImage && (
                <Link href={`/product/${item.product.id}`} className="flex-shrink-0">
                    <div className={`relative ${styles.image} ${item.product.display_theme === "dark" ? "bg-black" : "bg-white"} rounded overflow-hidden group`}>
                        <Image
                            src={item.product.image_url || '/placeholder-product.jpg'}
                            alt={item.product.name}
                            fill
                            className="object-contain p-2 group-hover:scale-110 transition-transform duration-300"
                        />

                        {/* Quick View Overlay */}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                            <Eye size={16} className="text-white" />
                        </div>
                    </div>
                </Link>
            )}

            {/* Product Details */}
            <div className={styles.content}>
                <div className={variant === 'page' ? 'flex flex-col md:flex-row md:justify-between mb-4' : 'mb-3'}>
                    <div className={variant === 'page' ? 'mb-4 md:mb-0' : ''}>
                        {/* Product Name */}
                        <Link
                            href={`/product/${item.product.id}`}
                            className="block hover:text-gold transition-colors"
                        >
                            <h3 className={styles.title}>
                                {item.product.name}
                            </h3>
                        </Link>

                        {/* Custom Options */}
                        {item.custom_options && Object.keys(item.custom_options).length > 0 && (
                            <div className={`text-xs text-gray-500 dark:text-gray-400 ${variant === 'page' ? 'mb-3' : 'mb-2'}`}>
                                {Object.entries(item.custom_options).map(([key, value]) => (
                                    <div key={key} className={variant === 'page' ? 'flex gap-2' : 'block'}>
                                        <span className={variant === 'page' ? 'font-medium' : ''}>{key}:</span>
                                        <span>{value}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Category */}
                        {item.product.category && variant !== 'compact' && (
                            <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                                {item.product.category}
                            </div>
                        )}

                        {/* Unit Price for Page Variant */}
                        {variant === 'page' && (
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {formatCartPrice(item.product.price)} each
                            </p>
                        )}
                    </div>

                    {/* Total Price */}
                    <div className={variant === 'page' ? 'text-right' : ''}>
                        <p className={styles.price}>
                            {formatCartPrice(item.product.price * item.quantity)}
                            {variant !== 'page' && item.quantity > 1 && (
                                <span className="text-xs text-gray-500 ml-2">
                                    ({formatCartPrice(item.product.price)} each)
                                </span>
                            )}
                        </p>
                    </div>
                </div>

                {/* Controls */}
                {showActions && (
                    <div className={styles.controls}>
                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2 text-black dark:text-white">
                            {variant === 'page' && <span className="text-sm font-medium">Quantity:</span>}
                            <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded">
                                <button
                                    onClick={() => handleQuantityChange(-1)}
                                    disabled={item.quantity <= 1 || isUpdating || isRemoving}
                                    className="p-1.5 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    aria-label="Decrease quantity"
                                >
                                    <Minus size={variant === 'compact' ? 12 : 14} />
                                </button>

                                <span className={`px-3 py-1.5 text-sm font-medium min-w-[${variant === 'compact' ? '32' : '40'}px] text-center`}>
                                    {isUpdating ? '...' : item.quantity}
                                </span>

                                <button
                                    onClick={() => handleQuantityChange(1)}
                                    disabled={item.quantity >= CART_CONFIG.features.maxQuantityPerItem || isUpdating || isRemoving}
                                    className="p-1.5 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    aria-label="Increase quantity"
                                >
                                    <Plus size={variant === 'compact' ? 12 : 14} />
                                </button>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className={`flex items-center ${variant === 'page' ? 'gap-4' : 'gap-2'}`}>
                            {/* Save for Later */}
                            {CART_CONFIG.features.enableSaveForLater && onSaveForLater && variant !== 'compact' && (
                                <button
                                    onClick={handleSaveForLater}
                                    disabled={isUpdating || isRemoving}
                                    className={`flex items-center gap-2 text-gray-400 hover:text-gold transition-colors disabled:opacity-50 ${variant === 'page' ? 'text-sm' : 'p-1.5'
                                        }`}
                                    aria-label="Save for later"
                                >
                                    <Heart size={16} />
                                    {variant === 'page' && 'Save for Later'}
                                </button>
                            )}

                            {/* Remove Item */}
                            <button
                                onClick={handleRemoveItem}
                                disabled={isUpdating || isRemoving}
                                className={`flex items-center gap-2 transition-colors disabled:opacity-50 ${showConfirmDelete
                                        ? 'text-red-500 hover:text-red-600'
                                        : 'text-gray-400 hover:text-red-500'
                                    } ${variant === 'page' ? 'text-sm' : 'p-1.5'}`}
                                aria-label={showConfirmDelete ? 'Confirm removal' : 'Remove item'}
                            >
                                <Trash2 size={16} />
                                {variant === 'page' && (showConfirmDelete ? 'Confirm Remove' : 'Remove')}
                            </button>
                        </div>
                    </div>
                )}

                {/* Error Display */}
                {error && (
                    <motion.div
                        className="mt-3 flex items-center gap-2 text-red-500 text-xs"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <AlertTriangle size={14} />
                        <span>{error}</span>
                    </motion.div>
                )}

                {/* Quantity Limit Warning */}
                {item.quantity >= CART_CONFIG.features.maxQuantityPerItem && (
                    <motion.p
                        className="text-xs text-amber-600 dark:text-amber-400 mt-2"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        transition={{ duration: 0.3 }}
                    >
                        Maximum quantity reached ({CART_CONFIG.features.maxQuantityPerItem} per item)
                    </motion.p>
                )}
            </div>

            {/* Delete Confirmation Timeout Bar */}
            {showConfirmDelete && (
                <motion.div
                    className="absolute bottom-0 left-0 h-1 bg-red-500 z-20"
                    initial={{ width: '100%' }}
                    animate={{ width: '0%' }}
                    transition={{ duration: 3, ease: 'linear' }}
                />
            )}
        </motion.div>
    );
}

// Cart Item Skeleton for loading states
export function CartItemSkeleton({
    variant = 'page'
}: {
    variant?: 'drawer' | 'page' | 'compact'
}) {
    const skeletonStyles = {
        drawer: "flex gap-3 pb-4 border-b border-gray-100 dark:border-gray-800",
        page: "flex flex-col md:flex-row gap-6 p-6 bg-gray-50 dark:bg-gray-900 rounded-lg",
        compact: "flex gap-4 py-4 border-b border-gray-100 dark:border-gray-800"
    };

    const imageSizes = {
        drawer: "w-16 h-16",
        page: "w-full md:w-32 h-48 md:h-32",
        compact: "w-12 h-12"
    };

    return (
        <div className={skeletonStyles[variant]}>
            {/* Image Skeleton */}
            <div className={`${imageSizes[variant]} bg-gray-200 dark:bg-gray-700 rounded animate-pulse flex-shrink-0`} />

            {/* Content Skeleton */}
            <div className="flex-1 space-y-3">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse" />
                {variant === 'page' && (
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3 animate-pulse" />
                )}
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse" />
            </div>
        </div>
    );
}