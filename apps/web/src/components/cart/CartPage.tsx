// Fixed CartPage.tsx - Working with your existing CartItem component
"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ShoppingBag, Truck, AlertCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { CART_CONFIG } from "@/config/cartConfig";
import { Cart } from "@/types/cart";
import { Product } from "@/types/product";
import { formatCartPrice } from "@/config/cartConfig";
import { useCartData, useCartActions } from "@/app/store/cartStore";
import CartItem from "./CartItem";

interface CartPageProps {
    recentlyViewed?: Product[];
    className?: string;
}

export default function CartPage({
    recentlyViewed = [],
    className = ""
}: CartPageProps) {
    const { getToken } = useAuth();
    const { cart, isLoading, error, fetchCart } = useCartData();
    const { updateCartItem, removeFromCart, applyPromoCode } = useCartActions();
    const sectionRef = useRef<HTMLDivElement>(null);
    const [isInView, setIsInView] = useState(false);

    useEffect(() => {
        // Trigger animations after component mounts
        const timer = setTimeout(() => setIsInView(true), 100);
        return () => clearTimeout(timer);
    }, []);

    // Fetch cart on component mount
    useEffect(() => {
        const loadCart = async () => {
            const token = await getToken();
            if (token) {
                await fetchCart(token);
            }
        };
        loadCart();
    }, [getToken, fetchCart]);

    // These handlers match your CartItem component's expected interface
    const handleUpdateQuantity = async (productId: number, quantity: number, token: string) => {
        try {
            const result = await updateCartItem(productId, quantity, token);
            return result; // Return the result for your CartItem component
        } catch (error) {
            console.error('Failed to update quantity:', error);
            return { success: false, error: 'Failed to update quantity' };
        }
    };

    const handleRemoveItem = async (productId: number, token: string) => {
        try {
            const result = await removeFromCart(productId, token);
            return result; // Return the result for your CartItem component
        } catch (error) {
            console.error('Failed to remove item:', error);
            return { success: false, error: 'Failed to remove item' };
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
        return <CartPageSkeleton />;
    }

    if (!cart || !cart.items || cart.items.length === 0) {
        return <EmptyCartPage />;
    }

    return (
        <div className={`min-h-screen bg-white dark:bg-black pt-[var(--navbar-height)] ${className}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Header */}
                <motion.div
                    ref={sectionRef}
                    className="mb-12"
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                    transition={{ duration: 0.6 }}
                >
                    <Link
                        href="/shop"
                        className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gold transition-colors mb-6"
                    >
                        <ArrowLeft size={20} />
                        <span className="tracking-wide">Continue Shopping</span>
                    </Link>

                    <div className="flex items-center gap-4 mb-2">
                        <ShoppingBag size={32} className="text-gold" />
                        <h1 className="text-3xl md:text-4xl font-serif text-black dark:text-white">
                            {CART_CONFIG.messaging.cart.title}
                        </h1>
                    </div>

                    <p className="text-gray-600 dark:text-gray-400 text-lg">
                        {cart.item_count} {cart.item_count === 1 ? 'item' : 'items'} in your collection
                    </p>
                </motion.div>

                {/* Error Display */}
                {error && (
                    <motion.div
                        className="mb-8 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                            <AlertCircle size={16} />
                            <span>{error}</span>
                        </div>
                    </motion.div>
                )}

                {/* Main Content Grid */}
                <motion.div
                    className="grid grid-cols-1 lg:grid-cols-12 gap-12"
                    variants={containerVariants}
                    initial="hidden"
                    animate={isInView ? "visible" : "hidden"}
                >
                    {/* Cart Items - Left Side */}
                    <div className="lg:col-span-8">
                        <motion.div
                            className="space-y-6"
                            variants={itemVariants}
                        >
                            {cart.items.map((item, index) => (
                                <CartItem
                                    key={item.product_id}
                                    item={item}
                                    onUpdateQuantity={handleUpdateQuantity}
                                    onRemoveItem={handleRemoveItem}
                                    getToken={getToken}
                                    variant="page"
                                    index={index}
                                />
                            ))}
                        </motion.div>

                        {/* Recently Viewed Section */}
                        {recentlyViewed.length > 0 && (
                            <motion.div
                                className="mt-16 pt-12 border-t border-gray-200 dark:border-gray-800"
                                variants={itemVariants}
                            >
                                <h3 className="text-xl font-serif mb-8 text-black dark:text-white">
                                    You Might Also Like
                                </h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                    {recentlyViewed.slice(0, 4).map((product) => (
                                        <RecentlyViewedItem key={product.id} product={product} />
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* Cart Summary - Right Side */}
                    <div className="lg:col-span-4">
                        <motion.div
                            className="sticky top-[calc(var(--navbar-height)+2rem)]"
                            variants={itemVariants}
                        >
                            <CartPageSummary
                                cart={cart}
                                onApplyPromoCode={applyPromoCode}
                            />
                        </motion.div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

// Cart Page Summary Component
function CartPageSummary({
    cart,
    onApplyPromoCode
}: {
    cart: Cart;
    onApplyPromoCode: (code: string, token: string) => Promise<any>;
}) {
    const { getToken } = useAuth();
    const [promoCode, setPromoCode] = useState("");
    const [promoLoading, setPromoLoading] = useState(false);
    const [promoError, setPromoError] = useState("");
    const [promoSuccess, setPromoSuccess] = useState("");

    const handleApplyPromo = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!promoCode.trim()) return;

        setPromoLoading(true);
        setPromoError("");
        setPromoSuccess("");

        try {
            const token = await getToken();
            if (token) {
                const result = await onApplyPromoCode(promoCode.trim(), token);
                if (result.success) {
                    setPromoSuccess(result.message || "Promo code applied!");
                    setPromoCode("");
                } else {
                    setPromoError(result.error || "Invalid promo code");
                }
            }
        } catch {
            setPromoError("Failed to apply promo code");
        } finally {
            setPromoLoading(false);
        }
    };

    const freeShippingThreshold = 500;
    const isEligibleForFreeShipping = cart.subtotal >= freeShippingThreshold;

    return (
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 text-black dark:text-white">
            <h3 className="text-xl font-serif mb-6">
                Order Summary
            </h3>

            {/* Pricing Breakdown */}
            <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                    <span>{CART_CONFIG.messaging.cart.subtotalLabel}</span>
                    <span>{formatCartPrice(cart.subtotal)}</span>
                </div>

                {cart.promo_discount && cart.promo_discount > 0 && (
                    <div className="flex justify-between text-green-600">
                        <span>Discount ({cart.promo_code})</span>
                        <span>-{formatCartPrice(cart.promo_discount)}</span>
                    </div>
                )}

                <div className="flex justify-between">
                    <span>{CART_CONFIG.messaging.cart.shippingLabel}</span>
                    <span>{cart.shipping > 0 ? formatCartPrice(cart.shipping) : 'Free'}</span>
                </div>

                <div className="flex justify-between">
                    <span>{CART_CONFIG.messaging.cart.taxLabel}</span>
                    <span>{formatCartPrice(cart.tax)}</span>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <div className="flex justify-between text-lg font-semibold">
                        <span>{CART_CONFIG.messaging.cart.totalLabel}</span>
                        <span className="text-gold">{formatCartPrice(cart.total)}</span>
                    </div>
                </div>
            </div>

            {/* Promo Code Section */}
            {CART_CONFIG.features.enablePromoCodes && (
                <div className="mb-6">
                    <form onSubmit={handleApplyPromo} className="space-y-3">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={promoCode}
                                onChange={(e) => setPromoCode(e.target.value)}
                                placeholder={CART_CONFIG.messaging.cart.promoCodePlaceholder}
                                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-black rounded focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
                                disabled={promoLoading}
                            />
                            <button
                                type="submit"
                                disabled={!promoCode.trim() || promoLoading}
                                className="px-4 py-2 bg-gold hover:bg-gold/90 text-black font-medium rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {promoLoading ? '...' : 'Apply'}
                            </button>
                        </div>

                        {promoError && (
                            <p className="text-red-500 text-sm">{promoError}</p>
                        )}

                        {promoSuccess && (
                            <p className="text-green-600 text-sm">{promoSuccess}</p>
                        )}
                    </form>
                </div>
            )}

            {/* Free Shipping Progress */}
            {!isEligibleForFreeShipping && (
                <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                        <Truck size={16} className="text-blue-600" />
                        <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                            Free Shipping Available
                        </span>
                    </div>
                    <p className="text-sm text-blue-600 dark:text-blue-400 mb-2">
                        Add {formatCartPrice(freeShippingThreshold - cart.subtotal)} more for free shipping
                    </p>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${Math.min((cart.subtotal / freeShippingThreshold) * 100, 100)}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Checkout Button */}
            <Link
                href="/checkout"
                className="w-full bg-gold hover:bg-gold/90 text-black font-medium py-4 px-6 transition-all duration-300 hover:scale-[1.02] tracking-widest uppercase text-sm text-center block mb-4"
            >
                {CART_CONFIG.messaging.cart.checkoutCTA}
            </Link>

            {/* Continue Shopping */}
            <Link
                href="/shop"
                className="w-full text-center py-3 px-6 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm tracking-wide block"
            >
                {CART_CONFIG.messaging.cart.continueShoppingCTA}
            </Link>

            {/* Security Badge */}
            <div className="mt-6 text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                    🔒 Secure checkout with SSL encryption
                </p>
            </div>
        </div>
    );
}

// Recently Viewed Item Component
function RecentlyViewedItem({ product }: { product: Product }) {
    return (
        <Link href={`/product/${product.id}`} className="group">
            <div className="relative aspect-square bg-gray-100 dark:bg-gray-800 rounded overflow-hidden mb-3">
                <Image
                    src={product.image_url? product.image_url : ''}
                    alt={product.name}
                    fill
                    className="object-contain p-3 group-hover:scale-110 transition-transform duration-300"
                />
            </div>
            <h4 className="text-sm font-medium truncate group-hover:text-gold transition-colors">
                {product.name}
            </h4>
            <p className="text-sm text-gold">
                {formatCartPrice(product.price)}
            </p>
        </Link>
    );
}

// Empty Cart Page
function EmptyCartPage() {
    return (
        <div className="min-h-screen bg-white dark:bg-black pt-[var(--navbar-height)]">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="max-w-md"
                    >
                        <div className="w-32 h-32 mx-auto mb-8 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                            <ShoppingBag size={48} className="text-gray-400" />
                        </div>

                        <h1 className="text-3xl md:text-4xl font-serif mb-6 text-black dark:text-white">
                            {CART_CONFIG.messaging.cart.emptyTitle}
                        </h1>

                        <p className="text-gray-600 dark:text-gray-400 text-lg mb-8 leading-relaxed">
                            {CART_CONFIG.messaging.cart.emptyDescription}
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                href="/shop"
                                className="bg-gold hover:bg-gold/90 text-black font-medium px-8 py-4 transition-all duration-300 hover:scale-105 tracking-widest uppercase text-sm"
                            >
                                Shop Collection
                            </Link>

                            <Link
                                href="/custom-orders"
                                className="border border-gold text-gold hover:bg-gold hover:text-black font-medium px-8 py-4 transition-all duration-300 hover:scale-105 tracking-widest uppercase text-sm"
                            >
                                Custom Orders
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}

// Loading Skeleton
function CartPageSkeleton() {
    return (
        <div className="min-h-screen bg-white dark:bg-black pt-[var(--navbar-height)]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Header Skeleton */}
                <div className="mb-12">
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-40 mb-6 animate-pulse" />
                    <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-60 mb-2 animate-pulse" />
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse" />
                </div>

                {/* Content Grid Skeleton */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Cart Items Skeleton */}
                    <div className="lg:col-span-8 space-y-6">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="flex gap-6 p-6 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                <div className="w-32 h-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                                <div className="flex-1 space-y-4">
                                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse" />
                                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse" />
                                    <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-40 animate-pulse" />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Summary Skeleton */}
                    <div className="lg:col-span-4">
                        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
                            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-6 animate-pulse" />
                            <div className="space-y-4 mb-6">
                                {Array.from({ length: 4 }).map((_, i) => (
                                    <div key={i} className="flex justify-between">
                                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 animate-pulse" />
                                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse" />
                                    </div>
                                ))}
                            </div>
                            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}