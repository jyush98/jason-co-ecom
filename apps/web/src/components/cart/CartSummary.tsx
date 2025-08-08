"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Gift, Tag, Check, X, Truck, Shield } from "lucide-react";
import Link from "next/link";
import { CART_CONFIG } from "@/config/cartConfig";
import { formatCartPrice } from "@/config/cartConfig";

interface CartSummaryProps {
    subtotal: number;
    tax?: number;
    shipping?: number;
    discount?: number;
    total: number;
    promoCode?: string;
    onPromoCodeChange?: (code: string) => void;
    onApplyPromoCode?: (e: React.FormEvent) => void;
    promoCodeError?: string;
    promoCodeSuccess?: string;
    showGiftOptions?: boolean;
    onToggleGiftOptions?: (show: boolean) => void;
    variant?: 'page' | 'checkout' | 'drawer';
    showCheckoutButton?: boolean;
    checkoutButtonText?: string;
    checkoutButtonLink?: string;
    isLoading?: boolean;
    className?: string;
}

interface GiftOptions {
    wrapping: boolean;
    message: boolean;
    messageText: string;
}

export default function CartSummary({
    subtotal,
    tax = 0,
    shipping = 0,
    discount = 0,
    total,
    promoCode = "",
    onPromoCodeChange,
    onApplyPromoCode,
    promoCodeError,
    promoCodeSuccess,
    showGiftOptions = false,
    onToggleGiftOptions,
    variant = 'page',
    showCheckoutButton = true,
    checkoutButtonText,
    checkoutButtonLink = '/checkout',
    isLoading = false,
    className = ""
}: CartSummaryProps) {
    const [giftOptions, setGiftOptions] = useState<GiftOptions>({
        wrapping: false,
        message: false,
        messageText: ""
    });
    const [isPromoCodeExpanded, setIsPromoCodeExpanded] = useState(false);

    const handleGiftOptionChange = (option: keyof GiftOptions, value: boolean | string) => {
        setGiftOptions(prev => ({ ...prev, [option]: value }));
    };

    const freeShippingThreshold = 500;
    const isEligibleForFreeShipping = subtotal >= freeShippingThreshold;
    const amountForFreeShipping = freeShippingThreshold - subtotal;

    const giftWrappingCost = giftOptions.wrapping ? 15 : 0;
    const adjustedTotal = total + giftWrappingCost;

    // Variant-specific styles
    const containerStyles = {
        page: "bg-gray-50 dark:bg-gray-900 rounded-lg p-6",
        checkout: "bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg p-6",
        drawer: "bg-transparent"
    };

    const buttonText = checkoutButtonText ||
        (variant === 'checkout' ? 'Continue to Payment' : CART_CONFIG.messaging.cart.checkoutCTA);

    return (
        <motion.div
            className={`${containerStyles[variant]} ${className}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
        >
            {/* Title */}
            <h3 className="text-xl font-serif mb-6 text-black dark:text-white">
                Order Summary
            </h3>

            {/* Pricing Breakdown */}
            <div className="space-y-4 mb-6">
                {/* Subtotal */}
                <div className="flex justify-between text-base">
                    <span>{CART_CONFIG.messaging.cart.subtotalLabel}</span>
                    <span>{formatCartPrice(subtotal)}</span>
                </div>

                {/* Discount */}
                <AnimatePresence>
                    {discount > 0 && (
                        <motion.div
                            className="flex justify-between text-green-600 dark:text-green-400"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <span className="flex items-center gap-2">
                                <Check size={16} />
                                Discount Applied
                            </span>
                            <span>-{formatCartPrice(discount)}</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Gift Wrapping */}
                <AnimatePresence>
                    {giftOptions.wrapping && (
                        <motion.div
                            className="flex justify-between"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <span className="flex items-center gap-2">
                                <Gift size={16} />
                                Gift Wrapping
                            </span>
                            <span>{formatCartPrice(giftWrappingCost)}</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Shipping */}
                <div className="flex justify-between">
                    <span className="flex items-center gap-2">
                        <Truck size={16} />
                        {CART_CONFIG.messaging.cart.shippingLabel}
                    </span>
                    <span className={isEligibleForFreeShipping ? 'text-green-600 dark:text-green-400' : ''}>
                        {shipping > 0 ? formatCartPrice(shipping) : 'Free'}
                    </span>
                </div>

                {/* Tax */}
                <div className="flex justify-between">
                    <span>{CART_CONFIG.messaging.cart.taxLabel}</span>
                    <span>{formatCartPrice(tax)}</span>
                </div>

                {/* Total */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <div className="flex justify-between text-lg font-semibold">
                        <span>{CART_CONFIG.messaging.cart.totalLabel}</span>
                        <span className="text-gold">{formatCartPrice(adjustedTotal)}</span>
                    </div>
                </div>
            </div>

            {/* Free Shipping Progress */}
            {!isEligibleForFreeShipping && amountForFreeShipping > 0 && (
                <motion.div
                    className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4 }}
                >
                    <div className="flex items-center gap-2 mb-2">
                        <Truck size={16} className="text-blue-600 dark:text-blue-400" />
                        <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                            Free Shipping Available
                        </span>
                    </div>
                    <p className="text-sm text-blue-600 dark:text-blue-400 mb-3">
                        Add {formatCartPrice(amountForFreeShipping)} more for free shipping
                    </p>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <motion.div
                            className="bg-blue-600 h-2 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min((subtotal / freeShippingThreshold) * 100, 100)}%` }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                        />
                    </div>
                </motion.div>
            )}

            {/* Free Shipping Success */}
            {isEligibleForFreeShipping && (
                <motion.div
                    className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4 }}
                >
                    <div className="flex items-center gap-2">
                        <Check size={16} className="text-green-600 dark:text-green-400" />
                        <span className="text-sm font-medium text-green-600 dark:text-green-400">
                            🎉 You qualify for free shipping!
                        </span>
                    </div>
                </motion.div>
            )}

            {/* Promo Code Section */}
            {CART_CONFIG.features.enablePromoCodes && onPromoCodeChange && onApplyPromoCode && (
                <div className="mb-6">
                    <button
                        onClick={() => setIsPromoCodeExpanded(!isPromoCodeExpanded)}
                        className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gold transition-colors mb-3"
                    >
                        <Tag size={16} />
                        {isPromoCodeExpanded ? 'Hide' : 'Have a'} promo code?
                    </button>

                    <AnimatePresence>
                        {isPromoCodeExpanded && (
                            <motion.form
                                onSubmit={onApplyPromoCode}
                                className="space-y-3"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={promoCode}
                                        onChange={(e) => onPromoCodeChange(e.target.value)}
                                        placeholder={CART_CONFIG.messaging.cart.promoCodePlaceholder}
                                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-black rounded focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent text-sm"
                                        disabled={isLoading}
                                    />
                                    <button
                                        type="submit"
                                        disabled={!promoCode.trim() || isLoading}
                                        className="px-4 py-2 bg-gold hover:bg-gold/90 text-black font-medium rounded transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isLoading ? '...' : 'Apply'}
                                    </button>
                                </div>

                                <AnimatePresence>
                                    {promoCodeError && (
                                        <motion.div
                                            className="flex items-center gap-2 text-red-500 text-sm"
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                        >
                                            <X size={16} />
                                            {promoCodeError}
                                        </motion.div>
                                    )}

                                    {promoCodeSuccess && (
                                        <motion.div
                                            className="flex items-center gap-2 text-green-600 text-sm"
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                        >
                                            <Check size={16} />
                                            {promoCodeSuccess}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.form>
                        )}
                    </AnimatePresence>
                </div>
            )}

            {/* Gift Options */}
            {CART_CONFIG.features.enableGiftOptions && onToggleGiftOptions && (
                <div className="mb-6">
                    <button
                        onClick={() => onToggleGiftOptions(!showGiftOptions)}
                        className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gold transition-colors mb-3"
                    >
                        <Gift size={16} />
                        Gift options
                    </button>

                    <AnimatePresence>
                        {showGiftOptions && (
                            <motion.div
                                className="space-y-3 pl-6 border-l-2 border-gold/20"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={giftOptions.wrapping}
                                        onChange={(e) => handleGiftOptionChange('wrapping', e.target.checked)}
                                        className="w-4 h-4 text-gold focus:ring-gold border-gray-300 rounded"
                                    />
                                    <span className="text-sm">
                                        Premium gift wrapping (+{formatCartPrice(15)})
                                    </span>
                                </label>

                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={giftOptions.message}
                                        onChange={(e) => handleGiftOptionChange('message', e.target.checked)}
                                        className="w-4 h-4 text-gold focus:ring-gold border-gray-300 rounded"
                                    />
                                    <span className="text-sm">Include personalized message</span>
                                </label>

                                <AnimatePresence>
                                    {giftOptions.message && (
                                        <motion.textarea
                                            value={giftOptions.messageText}
                                            onChange={(e) => handleGiftOptionChange('messageText', e.target.value)}
                                            placeholder="Enter your gift message..."
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-black rounded focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent text-sm resize-none"
                                            rows={3}
                                            maxLength={200}
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            transition={{ duration: 0.3 }}
                                        />
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            )}

            {/* Checkout Button */}
            {showCheckoutButton && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                >
                    <Link
                        href={checkoutButtonLink}
                        className="w-full bg-gold hover:bg-gold/90 text-black font-medium py-4 px-6 transition-all duration-300 hover:scale-[1.02] tracking-widest uppercase text-sm text-center block mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {buttonText}
                    </Link>
                </motion.div>
            )}

            {/* Continue Shopping */}
            {variant !== 'drawer' && (
                <Link
                    href="/shop"
                    className="w-full text-center py-3 px-6 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm tracking-wide block mb-4"
                >
                    {CART_CONFIG.messaging.cart.continueShoppingCTA}
                </Link>
            )}

            {/* Security & Trust Indicators */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                        <Shield size={14} />
                        <span>Secure Checkout</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Truck size={14} />
                        <span>Free Returns</span>
                    </div>
                </div>

                <p className="text-center text-xs text-gray-400 mt-2">
                    🔒 Your payment information is encrypted and secure
                </p>
            </div>
        </motion.div>
    );
}