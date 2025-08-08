// components/wishlist/AddToWishlistButton.tsx - Wishlist Toggle Component
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Loader2, Check, AlertCircle } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { useWishlistActions, useWishlistUtils } from "@/app/store/wishlistStore";
import { Product } from "@/types/product";

interface AddToWishlistButtonProps {
    product: Product;
    variant?: 'default' | 'minimal' | 'icon-only';
    size?: 'sm' | 'md' | 'lg';
    showIcon?: boolean;
    showText?: boolean;
    fullWidth?: boolean;
    className?: string;
    onSuccess?: (isInWishlist: boolean) => void;
    onError?: (error: string) => void;
}

type WishlistState = 'idle' | 'loading' | 'success' | 'error';

export default function AddToWishlistButton({
    product,
    variant = 'default',
    size = 'md',
    showIcon = true,
    showText = true,
    fullWidth = false,
    className = "",
    onSuccess,
    onError
}: AddToWishlistButtonProps) {
    const { getToken } = useAuth();
    const { addToWishlist, removeFromWishlist, checkProductInWishlist } = useWishlistActions();
    const { isProductInWishlist } = useWishlistUtils();

    const [state, setState] = useState<WishlistState>('idle');
    const [isInWishlist, setIsInWishlist] = useState(false);
    const [isChecking, setIsChecking] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string>('');

    // Check initial wishlist status
    useEffect(() => {
        const checkInitialStatus = async () => {
            try {
                const token = await getToken();
                if (!token) {
                    setIsChecking(false);
                    return;
                }

                // First check local store
                const localStatus = isProductInWishlist(product.id);
                setIsInWishlist(localStatus);

                // Then verify with API for accuracy (but don't fail if API isn't ready)
                try {
                    const apiStatus = await checkProductInWishlist(token, product.id);
                    setIsInWishlist(apiStatus.in_wishlist);
                } catch (apiError) {
                    // API check failed, but don't block the component
                    console.warn('API wishlist check failed, using local state:', apiError);
                }

            } catch (error) {
                console.warn('Failed to check wishlist status:', error);
            } finally {
                setIsChecking(false);
            }
        };

        checkInitialStatus();
    }, [product.id, getToken, checkProductInWishlist, isProductInWishlist]);

    // Auto-reset success/error states
    useEffect(() => {
        if (state === 'success' || state === 'error') {
            const timer = setTimeout(() => {
                setState('idle');
                setErrorMessage('');
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [state]);

    const handleToggleWishlist = async () => {
        if (state === 'loading' || isChecking) return;

        setState('loading');
        setErrorMessage('');

        try {
            const token = await getToken();
            if (!token) {
                throw new Error('Please sign in to use wishlist');
            }

            let result;

            if (isInWishlist) {
                // Remove from wishlist
                result = await removeFromWishlist(token, product.id);
            } else {
                // Add to wishlist
                result = await addToWishlist(token, product.id, {
                    priority: 3, // Default to low priority
                });
            }

            if (result.success) {
                const newWishlistStatus = !isInWishlist;
                setIsInWishlist(newWishlistStatus);
                setState('success');
                onSuccess?.(newWishlistStatus);
            } else {
                throw new Error(result.error || 'Failed to update wishlist');
            }

        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : 'Failed to update wishlist';
            setErrorMessage(errorMsg);
            setState('error');
            onError?.(errorMsg);
        }
    };

    // Variant styles
    const variantStyles = {
        default: {
            base: `border transition-all duration-300 ${isInWishlist
                    ? 'border-gold text-gold bg-gold/10'
                    : 'border-gray-300 dark:border-gray-600 hover:border-gold hover:text-gold'
                }`,
            disabled: "border-gray-200 text-gray-400 cursor-not-allowed"
        },
        minimal: {
            base: `transition-all duration-300 ${isInWishlist
                    ? 'text-gold'
                    : 'text-gray-400 hover:text-gold'
                }`,
            disabled: "text-gray-300 cursor-not-allowed"
        },
        'icon-only': {
            base: `p-2 rounded-full transition-all duration-300 ${isInWishlist
                    ? 'text-gold bg-gold/10'
                    : 'text-gray-400 hover:text-gold hover:bg-gray-50 dark:hover:bg-gray-800'
                }`,
            disabled: "text-gray-300 cursor-not-allowed"
        }
    };

    // Size styles
    const sizeStyles = {
        sm: variant === 'icon-only' ? "p-1.5" : "px-3 py-1.5 text-xs",
        md: variant === 'icon-only' ? "p-2" : "px-4 py-2 text-sm",
        lg: variant === 'icon-only' ? "p-3" : "px-6 py-3 text-base"
    };

    const iconSizes = {
        sm: 14,
        md: 16,
        lg: 18
    };

    const currentVariant = variantStyles[variant];
    const isDisabled = state === 'loading' || isChecking;
    const buttonStyles = isDisabled ? currentVariant.disabled : currentVariant.base;

    // Animation variants
    const buttonVariants = {
        idle: { scale: 1 },
        loading: { scale: 0.98 },
        success: { scale: 1.05 },
        error: { scale: 0.98 }
    };

    const iconVariants = {
        idle: { scale: 1, rotate: 0 },
        loading: { scale: 0.8, rotate: 0 },
        success: { scale: 1.2, rotate: 0 },
        error: { scale: 1, rotate: 0 }
    };

    const getButtonContent = () => {
        if (isChecking) {
            return (
                <>
                    {showIcon && (
                        <Loader2 size={iconSizes[size]} className="animate-spin" />
                    )}
                    {showText && variant !== 'icon-only' && <span>Loading...</span>}
                </>
            );
        }

        switch (state) {
            case 'loading':
                return (
                    <>
                        {showIcon && (
                            <motion.div variants={iconVariants}>
                                <Loader2 size={iconSizes[size]} className="animate-spin" />
                            </motion.div>
                        )}
                        {showText && variant !== 'icon-only' && (
                            <span>{isInWishlist ? 'Removing...' : 'Adding...'}</span>
                        )}
                    </>
                );
            case 'success':
                return (
                    <>
                        {showIcon && (
                            <motion.div variants={iconVariants}>
                                <Check size={iconSizes[size]} />
                            </motion.div>
                        )}
                        {showText && variant !== 'icon-only' && (
                            <span>{isInWishlist ? 'Added!' : 'Removed!'}</span>
                        )}
                    </>
                );
            case 'error':
                return (
                    <>
                        {showIcon && (
                            <motion.div variants={iconVariants}>
                                <AlertCircle size={iconSizes[size]} />
                            </motion.div>
                        )}
                        {showText && variant !== 'icon-only' && (
                            <span>Try Again</span>
                        )}
                    </>
                );
            default:
                return (
                    <>
                        {showIcon && (
                            <motion.div variants={iconVariants}>
                                <Heart
                                    size={iconSizes[size]}
                                    className={isInWishlist ? 'fill-current' : ''}
                                />
                            </motion.div>
                        )}
                        {showText && variant !== 'icon-only' && (
                            <span>{isInWishlist ? 'Wishlisted' : 'Wishlist'}</span>
                        )}
                    </>
                );
        }
    };

    return (
        <div className="relative">
            <motion.button
                onClick={handleToggleWishlist}
                disabled={isDisabled}
                variants={buttonVariants}
                animate={state}
                whileHover={!isDisabled ? { scale: 1.02 } : {}}
                whileTap={!isDisabled ? { scale: 0.98 } : {}}
                className={`
          ${buttonStyles}
          ${sizeStyles[size]}
          ${fullWidth ? "w-full" : "inline-flex"}
          items-center justify-center gap-2
          tracking-wide
          focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2
          ${className}
        `}
                aria-label={
                    isInWishlist
                        ? `Remove ${product.name} from wishlist`
                        : `Add ${product.name} to wishlist`
                }
                title={
                    isInWishlist
                        ? `Remove ${product.name} from wishlist`
                        : `Add ${product.name} to wishlist`
                }
            >
                {getButtonContent()}
            </motion.button>

            {/* Error Tooltip */}
            <AnimatePresence>
                {state === 'error' && errorMessage && variant !== 'minimal' && (
                    <motion.div
                        className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-2 bg-red-500 text-white text-xs rounded shadow-lg z-50 whitespace-nowrap"
                        initial={{ opacity: 0, y: -10, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.9 }}
                        transition={{ duration: 0.2 }}
                    >
                        {errorMessage}
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-b-red-500" />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Success Toast */}
            <AnimatePresence>
                {state === 'success' && variant !== 'minimal' && (
                    <motion.div
                        className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-4 py-3 bg-green-500 text-white text-sm rounded shadow-lg z-50 whitespace-nowrap"
                        initial={{ opacity: 0, y: -10, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.9 }}
                        transition={{ duration: 0.2 }}
                    >
                        <div className="flex items-center gap-2">
                            <Heart size={16} className={isInWishlist ? 'fill-current' : ''} />
                            <span>
                                {isInWishlist
                                    ? `Added to wishlist!`
                                    : `Removed from wishlist`
                                }
                            </span>
                        </div>
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-b-green-500" />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// Hook for wishlist status (can be used elsewhere)
export function useWishlistStatus(productId: number) {
    const { getToken } = useAuth();
    const { checkProductInWishlist } = useWishlistActions();
    const { isProductInWishlist, getWishlistItem } = useWishlistUtils();

    const [isInWishlist, setIsInWishlist] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkStatus = async () => {
            try {
                const token = await getToken();
                if (!token) {
                    setIsLoading(false);
                    return;
                }

                // Check local store first
                const localStatus = isProductInWishlist(productId);
                setIsInWishlist(localStatus);

                // Verify with API
                const apiStatus = await checkProductInWishlist(token, productId);
                setIsInWishlist(apiStatus.in_wishlist);

            } catch (error) {
                console.error('Failed to check wishlist status:', error);
            } finally {
                setIsLoading(false);
            }
        };

        checkStatus();
    }, [productId, getToken, checkProductInWishlist, isProductInWishlist]);

    return {
        isInWishlist,
        isLoading,
        wishlistItem: getWishlistItem(productId)
    };
}