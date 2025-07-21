"use client";

import { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingBag, Plus, Minus, Heart, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { CART_CONFIG } from "@/config/cartConfig";
import { CartItem, Cart } from "@/types/cart";
import { formatCartPrice } from "@/config/cartConfig";

interface CartDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    cart: Cart;
    onUpdateQuantity: (product_id: number, quantity: number) => Promise<void>;
    onRemoveItem: (product_id: number) => Promise<void>;
    onSaveForLater?: (product_id: number) => Promise<void>;
    isLoading?: boolean;
    error?: string | null;
}

export default function CartDrawer({
    isOpen,
    onClose,
    cart,
    onUpdateQuantity,
    onRemoveItem,
    onSaveForLater,
    isLoading = false,
    error = null
}: CartDrawerProps) {
    const drawerRef = useRef<HTMLDivElement>(null);

    // Handle ESC key press
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    // Prevent body scroll when drawer is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }

        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    // Handle backdrop click
    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget && CART_CONFIG.drawer.closeOnBackdropClick) {
            onClose();
        }
    };

    // Animation variants
    const drawerVariants = {
        hidden: {
            x: '100%',
            transition: {
                duration: CART_CONFIG.animations.drawerSlide / 1000,
                ease: "easeInOut"
            }
        },
        visible: {
            x: 0,
            transition: {
                duration: CART_CONFIG.animations.drawerSlide / 1000,
                ease: "easeInOut"
            }
        }
    };

    const backdropVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { duration: 0.2 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, x: 20 },
        visible: {
            opacity: 1,
            x: 0,
            transition: { duration: 0.3 }
        },
        exit: {
            opacity: 0,
            x: -20,
            transition: { duration: 0.2 }
        }
    };

    const isEmpty = cart.items.length === 0;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        className="fixed inset-0 z-40 bg-black/50"
                        style={{
                            backdropFilter: CART_CONFIG.drawer.backdropBlur ? 'blur(4px)' : 'none'
                        }}
                        variants={backdropVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        onClick={handleBackdropClick}
                    />

                    {/* Drawer */}
                    <motion.div
                        ref={drawerRef}
                        className="fixed top-0 right-0 h-full z-50 bg-white dark:bg-black border-l border-gray-200 dark:border-gray-800 shadow-2xl flex flex-col"
                        style={{
                            width: window.innerWidth < CART_CONFIG.breakpoints.mobile
                                ? CART_CONFIG.drawer.mobileWidth
                                : CART_CONFIG.drawer.width
                        }}
                        variants={drawerVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                    >
                        {/* Header */}
                        <div className="sticky top-0 bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800 p-6 flex items-center justify-between z-10">
                            <div className="flex items-center gap-3">
                                <ShoppingBag size={24} className="text-gold" />
                                <h2 className="text-xl font-serif text-black dark:text-white">
                                    {CART_CONFIG.messaging.drawer.title}
                                </h2>
                                {cart.item_count > 0 && (
                                    <span className="bg-gold text-black text-sm px-2 py-1 rounded-full font-medium">
                                        {cart.item_count}
                                    </span>
                                )}
                            </div>

                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                                aria-label="Close cart"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="mx-6 mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-red-600 dark:text-red-400 text-sm">
                                {error}
                            </div>
                        )}

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto">
                            {isLoading ? (
                                <CartDrawerSkeleton />
                            ) : isEmpty ? (
                                <EmptyCartState onClose={onClose} />
                            ) : (
                                <div className="p-6 space-y-6">
                                    <AnimatePresence mode="popLayout">
                                        {cart.items.map((item, index) => (
                                            <CartDrawerItem
                                                key={item.product_id}
                                                item={item}
                                                onUpdateQuantity={onUpdateQuantity}
                                                onRemoveItem={onRemoveItem}
                                                onSaveForLater={onSaveForLater}
                                                variants={itemVariants}
                                                index={index}
                                            />
                                        ))}
                                    </AnimatePresence>
                                </div>
                            )}
                        </div>

                        {/* Footer - Sticky Checkout Section */}
                        {!isEmpty && !isLoading && (
                            <div className="sticky bottom-0 bg-white dark:bg-black border-t border-gray-200 dark:border-gray-800 p-6">
                                {/* Subtotal */}
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-lg font-medium">
                                        {CART_CONFIG.messaging.cart.subtotalLabel}
                                    </span>
                                    <span className="text-xl font-serif text-gold">
                                        {formatCartPrice(cart.subtotal)}
                                    </span>
                                </div>

                                {/* Promo Discount */}
                                {cart.promo_discount && cart.promo_discount > 0 && (
                                    <div className="flex justify-between items-center mb-4 text-green-600 dark:text-green-400">
                                        <span className="text-sm">
                                            Discount ({cart.promo_code})
                                        </span>
                                        <span className="text-sm font-medium">
                                            -{formatCartPrice(cart.promo_discount)}
                                        </span>
                                    </div>
                                )}

                                {/* Free Shipping Progress */}
                                {cart.subtotal < 500 && (
                                    <div className="mb-4 text-center">
                                        <p className="text-xs text-blue-600 dark:text-blue-400 mb-2">
                                            Add {formatCartPrice(500 - cart.subtotal)} for free shipping
                                        </p>
                                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
                                            <div
                                                className="bg-blue-600 h-1 rounded-full transition-all duration-300"
                                                style={{ width: `${Math.min((cart.subtotal / 500) * 100, 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="space-y-3">
                                    <Link
                                        href="/checkout"
                                        onClick={onClose}
                                        className="w-full bg-gold hover:bg-gold/90 text-black font-medium py-4 px-6 transition-all duration-300 hover:scale-[1.02] tracking-widest uppercase text-sm text-center block"
                                    >
                                        {CART_CONFIG.messaging.drawer.checkoutCTA}
                                    </Link>

                                    <div className="flex gap-3">
                                        <Link
                                            href="/cart"
                                            onClick={onClose}
                                            className="flex-1 border border-gray-300 dark:border-gray-600 text-center py-3 px-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm tracking-wide"
                                        >
                                            {CART_CONFIG.messaging.drawer.viewCartCTA}
                                        </Link>

                                        <button
                                            onClick={onClose}
                                            className="flex-1 border border-gray-300 dark:border-gray-600 text-center py-3 px-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm tracking-wide"
                                        >
                                            {CART_CONFIG.messaging.drawer.continueShoppingCTA}
                                        </button>
                                    </div>
                                </div>

                                {/* Security Badge */}
                                <div className="mt-4 text-center">
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        🔒 Secure checkout with SSL encryption
                                    </p>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

// Individual Cart Item Component
function CartDrawerItem({
    item,
    onUpdateQuantity,
    onRemoveItem,
    onSaveForLater,
    variants,
    index
}: {
    item: CartItem;
    onUpdateQuantity: (product_id: number, quantity: number) => Promise<void>;
    onRemoveItem: (product_id: number) => Promise<void>;
    onSaveForLater?: (product_id: number) => Promise<void>;
    variants: any;
    index: number;
}) {
    const [isUpdating, setIsUpdating] = useState(false);

    const handleQuantityChange = async (change: number) => {
        const newQuantity = item.quantity + change;
        if (newQuantity < 1 || newQuantity > CART_CONFIG.features.maxQuantityPerItem) {
            return;
        }

        setIsUpdating(true);
        try {
            await onUpdateQuantity(item.product_id, newQuantity);
        } catch (error) {
            console.error('Failed to update quantity:', error);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleRemove = async () => {
        try {
            await onRemoveItem(item.product_id);
        } catch (error) {
            console.error('Failed to remove item:', error);
        }
    };

    const handleSaveForLater = async () => {
        if (onSaveForLater) {
            try {
                await onSaveForLater(item.product_id);
            } catch (error) {
                console.error('Failed to save for later:', error);
            }
        }
    };

    return (
        <motion.div
            layout
            variants={variants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="flex gap-4 pb-6 border-b border-gray-100 dark:border-gray-800 last:border-b-0 relative"
        >
            {/* Loading Overlay */}
            {isUpdating && (
                <div className="absolute inset-0 bg-white/50 dark:bg-black/50 flex items-center justify-center rounded z-10">
                    <div className="w-5 h-5 border-2 border-gold border-t-transparent rounded-full animate-spin" />
                </div>
            )}

            {/* Product Image */}
            <Link href={`/product/${item.product.id}`} className="flex-shrink-0">
                <div className="relative w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded overflow-hidden group">
                    <Image
                        src={item.product.image_url || '/placeholder-product.jpg'}
                        alt={item.product.name}
                        fill
                        className="object-contain p-2 group-hover:scale-110 transition-transform duration-300"
                    />
                </div>
            </Link>

            {/* Product Details */}
            <div className="flex-1 min-w-0">
                <Link
                    href={`/product/${item.product.id}`}
                    className="block hover:text-gold transition-colors"
                >
                    <h4 className="font-medium text-sm leading-5 mb-1 truncate">
                        {item.product.name}
                    </h4>
                </Link>

                {/* Custom Options */}
                {item.custom_options && Object.keys(item.custom_options).length > 0 && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                        {Object.entries(item.custom_options).map(([key, value]) => (
                            <span key={key} className="block">
                                {key}: {value}
                            </span>
                        ))}
                    </div>
                )}

                {/* Category */}
                {item.product.category && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                        {item.product.category}
                    </div>
                )}

                {/* Price */}
                <div className="text-sm font-medium text-gold mb-3">
                    {formatCartPrice(item.product.price * item.quantity)}
                    {item.quantity > 1 && (
                        <span className="text-xs text-gray-500 ml-2">
                            ({formatCartPrice(item.product.price)} each)
                        </span>
                    )}
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded">
                        <button
                            onClick={() => handleQuantityChange(-1)}
                            disabled={item.quantity <= 1 || isUpdating}
                            className="p-1.5 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            aria-label="Decrease quantity"
                        >
                            <Minus size={14} />
                        </button>

                        <span className="px-3 py-1.5 text-sm font-medium min-w-[40px] text-center">
                            {item.quantity}
                        </span>

                        <button
                            onClick={() => handleQuantityChange(1)}
                            disabled={item.quantity >= CART_CONFIG.features.maxQuantityPerItem || isUpdating}
                            className="p-1.5 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            aria-label="Increase quantity"
                        >
                            <Plus size={14} />
                        </button>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                        {CART_CONFIG.features.enableSaveForLater && onSaveForLater && (
                            <button
                                onClick={handleSaveForLater}
                                className="p-1.5 text-gray-400 hover:text-gold transition-colors"
                                aria-label="Save for later"
                            >
                                <Heart size={16} />
                            </button>
                        )}

                        <button
                            onClick={handleRemove}
                            className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                            aria-label="Remove item"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

// Empty Cart State
function EmptyCartState({ onClose }: { onClose: () => void }) {
    return (
        <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-sm"
            >
                <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                    <ShoppingBag size={32} className="text-gray-400" />
                </div>

                <h3 className="text-xl font-serif mb-4 text-black dark:text-white">
                    {CART_CONFIG.messaging.drawer.emptyTitle}
                </h3>

                <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                    {CART_CONFIG.messaging.drawer.emptyDescription}
                </p>

                <button
                    onClick={onClose}
                    className="w-full bg-gold hover:bg-gold/90 text-black font-medium py-3 px-6 transition-all duration-300 tracking-widest uppercase text-sm"
                >
                    {CART_CONFIG.messaging.drawer.continueShoppingCTA}
                </button>
            </motion.div>
        </div>
    );
}

// Loading Skeleton
function CartDrawerSkeleton() {
    return (
        <div className="p-6 space-y-6">
            {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex gap-4 pb-6 border-b border-gray-100 dark:border-gray-800">
                    <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                    <div className="flex-1 space-y-3">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse" />
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse" />
                        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 animate-pulse" />
                    </div>
                </div>
            ))}
        </div>
    );
}