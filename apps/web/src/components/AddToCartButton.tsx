"use client";

import { useAuth, useUser } from "@clerk/nextjs";
import { addToCart } from "@/utils/cart";
import { useCartStore } from "@/app/store/cartStore";
import { useGuestCartStore } from "@/app/store/guestCartStore";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Check, AlertCircle } from "lucide-react";
import { CART_CONFIG } from "@/config/cartConfig";
import { useGA4Ecommerce } from '@/lib/hooks/useGA4';

interface AddToCartButtonProps {
  productId: number;
  fullWidth?: boolean;
  productName: string;
  productPrice: number;
  productImageUrl?: string;
  quantity?: number;
  customOptions?: Record<string, string>;
  variant?: 'primary' | 'secondary' | 'outline' | 'minimal';
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  onSuccess?: () => void;
  onError?: (error: string) => void;
  disabled?: boolean;
  className?: string;
}

type AddToCartState = 'idle' | 'adding' | 'success' | 'error';

export default function AddToCartButton({
  productId,
  fullWidth = false,
  productName,
  productPrice,
  productImageUrl,
  quantity = 1,
  customOptions,
  variant = 'primary',
  size = 'md',
  showIcon = true,
  onSuccess,
  onError,
  disabled = false,
  className = ""
}: AddToCartButtonProps) {
  const { getToken } = useAuth();
  const { isSignedIn } = useUser();
  const fetchCartCount = useCartStore((state) => state.fetchCartCount);
  const addGuestItem = useGuestCartStore((state) => state.addItem);
  const setCartCount = useCartStore((state) => state.setCartCount);
  const { trackAddToCart } = useGA4Ecommerce();

  // Cart drawer state - assuming you'll add this to your cart store
  const openCartDrawer = useCartStore((state) => state.openDrawer);
  const setLastAddedItem = useCartStore((state) => state.setLastAddedItem);

  const [state, setState] = useState<AddToCartState>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

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

  const handleAddToCart = async () => {
    if (disabled || state === 'adding') return;

    setState('adding');
    setErrorMessage('');

    try {
      const cartItem = {
        product_id: productId,
        quantity,
        product: {
          id: productId,
          name: productName,
          price: productPrice,
          image_url: productImageUrl,
        },
        custom_options: customOptions,
        date_added: new Date().toISOString(),
      };

      if (isSignedIn) {
        const token = await getToken();
        if (!token) {
          throw new Error('Authentication failed');
        }

        await addToCart(productId, quantity, token);
        await fetchCartCount(token);
      } else {
        addGuestItem(cartItem);
        setCartCount(useGuestCartStore.getState().getCount());
      }

      // Set last added item for drawer display
      if (setLastAddedItem) {
        setLastAddedItem(cartItem);
      }

      // Track in GA4
      trackAddToCart(cartItem.product, quantity);

      setState('success');

      // Open cart drawer after successful add
      if (openCartDrawer) {
        setTimeout(() => {
          openCartDrawer();
        }, 500); // Small delay to show success animation
      }

      // Call success callback
      onSuccess?.();

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to add item to cart';
      setErrorMessage(errorMsg);
      setState('error');
      onError?.(errorMsg);
    }
  };

  // Variant styles
  const variantStyles = {
    primary: {
      base: "bg-gold hover:bg-gold/90 text-black border-gold",
      disabled: "bg-gray-300 text-gray-500 border-gray-300"
    },
    secondary: {
      base: "bg-black hover:bg-gray-800 text-white border-black dark:bg-white dark:hover:bg-gray-100 dark:text-black dark:border-white",
      disabled: "bg-gray-300 text-gray-500 border-gray-300"
    },
    outline: {
      base: "bg-transparent hover:bg-black hover:text-white text-black border-black dark:hover:bg-white dark:hover:text-black dark:text-white dark:border-white",
      disabled: "bg-transparent text-gray-400 border-gray-300"
    },
    minimal: {
      base: "bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-black dark:text-white border-transparent",
      disabled: "bg-transparent text-gray-400 border-transparent"
    }
  };

  // Size styles
  const sizeStyles = {
    sm: "px-4 py-2 text-xs",
    md: "px-6 py-3 text-sm",
    lg: "px-8 py-4 text-base"
  };

  const currentVariant = variantStyles[variant];
  const isDisabled = disabled || state === 'adding';
  const buttonStyles = isDisabled ? currentVariant.disabled : currentVariant.base;

  // Animation variants
  const buttonVariants = {
    idle: { scale: 1 },
    adding: { scale: 0.98 },
    success: { scale: 1.02 },
    error: { scale: 0.98 }
  };

  const iconVariants = {
    idle: { rotate: 0, scale: 1 },
    adding: { rotate: 180, scale: 0.8 },
    success: { rotate: 0, scale: 1.2 },
    error: { rotate: 0, scale: 1 }
  };

  const getButtonContent = () => {
    switch (state) {
      case 'adding':
        return (
          <>
            {showIcon && (
              <motion.div
                className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"
                variants={iconVariants}
              />
            )}
            <span>Adding...</span>
          </>
        );
      case 'success':
        return (
          <>
            {showIcon && (
              <motion.div variants={iconVariants}>
                <Check size={16} />
              </motion.div>
            )}
            <span>Added!</span>
          </>
        );
      case 'error':
        return (
          <>
            {showIcon && (
              <motion.div variants={iconVariants}>
                <AlertCircle size={16} />
              </motion.div>
            )}
            <span>Try Again</span>
          </>
        );
      default:
        return (
          <>
            {showIcon && (
              <motion.div variants={iconVariants}>
                <ShoppingBag size={16} />
              </motion.div>
            )}
            <span>Add to Cart</span>
          </>
        );
    }
  };

  return (
    <div className="relative">
      <motion.button
        onClick={handleAddToCart}
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
    border font-medium tracking-widest uppercase
    transition-all duration-300
    disabled:cursor-not-allowed
    focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2
    ${className}
  `}
        aria-label={`Add ${productName} to cart`}
      >
        {/* ✅ FIXED: Proper flex container for icon + text alignment */}
        <div className="flex items-center justify-center gap-2">
          {showIcon && (
            <motion.div
              className="flex items-center justify-center"
              variants={iconVariants}
            >
              {state === 'adding' && (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              )}
              {state === 'success' && <Check size={16} />}
              {state === 'error' && <AlertCircle size={16} />}
              {state === 'idle' && <ShoppingBag size={16} />}
            </motion.div>
          )}
          <span className="flex items-center">
            {state === 'adding' && 'Adding...'}
            {state === 'success' && 'Added!'}
            {state === 'error' && 'Try Again'}
            {state === 'idle' && 'Add to Cart'}
          </span>
        </div>
      </motion.button>

      {/* Error Tooltip */}
      <AnimatePresence>
        {state === 'error' && errorMessage && (
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

      {/* Success Toast - Alternative to cart drawer */}
      <AnimatePresence>
        {state === 'success' && !openCartDrawer && (
          <motion.div
            className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-4 py-3 bg-green-500 text-white text-sm rounded shadow-lg z-50 whitespace-nowrap"
            initial={{ opacity: 0, y: -10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.9 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center gap-2">
              <Check size={16} />
              <span>Added to cart!</span>
            </div>
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-b-green-500" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Quantity Selector Component (for product pages)
interface QuantitySelectorProps {
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
}

export function QuantitySelector({
  quantity,
  onQuantityChange,
  min = 1,
  max = CART_CONFIG.features.maxQuantityPerItem,
  disabled = false
}: QuantitySelectorProps) {
  const handleDecrease = () => {
    if (quantity > min) {
      onQuantityChange(quantity - 1);
    }
  };

  const handleIncrease = () => {
    if (quantity < max) {
      onQuantityChange(quantity + 1);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || min;
    const clampedValue = Math.max(min, Math.min(max, value));
    onQuantityChange(clampedValue);
  };

  return (
    <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded">
      <button
        onClick={handleDecrease}
        disabled={disabled || quantity <= min}
        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        aria-label="Decrease quantity"
      >
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          −
        </motion.div>
      </button>

      <input
        type="number"
        min={min}
        max={max}
        value={quantity}
        onChange={handleInputChange}
        disabled={disabled}
        className="w-16 py-2 text-center bg-transparent border-none focus:outline-none focus:ring-0 disabled:opacity-50"
        aria-label="Quantity"
      />

      <button
        onClick={handleIncrease}
        disabled={disabled || quantity >= max}
        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        aria-label="Increase quantity"
      >
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          +
        </motion.div>
      </button>
    </div>
  );
}

// AddToCart with Quantity Selector (for product detail pages)
interface AddToCartWithQuantityProps extends Omit<AddToCartButtonProps, 'quantity'> {
  initialQuantity?: number;
  showQuantitySelector?: boolean;
  quantityLabel?: string;
}

export function AddToCartWithQuantity({
  initialQuantity = 1,
  showQuantitySelector = true,
  quantityLabel = "Quantity",
  ...addToCartProps
}: AddToCartWithQuantityProps) {
  const [quantity, setQuantity] = useState(initialQuantity);

  return (
    <div className="space-y-4">
      {showQuantitySelector && (
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium">{quantityLabel}:</label>
          <QuantitySelector
            quantity={quantity}
            onQuantityChange={setQuantity}
            disabled={addToCartProps.disabled}
          />
        </div>
      )}

      <AddToCartButton
        {...addToCartProps}
        quantity={quantity}
      />
    </div>
  );
}