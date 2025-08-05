// lib/hooks/useCart.ts
import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { getCart } from "@/utils/cart";

export interface CartItem {
  id: number;
  user_id: string;
  product_id: number;
  quantity: number;
  product: {
    id: number;
    name: string;
    price: number;
    description?: string;
    image_url?: string;
    category?: string;
  };
}

interface UseCartOptions {
  enabled?: boolean;
  refetchOnMount?: boolean;
}

export const useCart = (options: UseCartOptions = { enabled: true, refetchOnMount: true }) => {
  const { getToken, isSignedIn, isLoaded } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCart = useCallback(async () => {
    // Don't fetch if auth isn't loaded yet or user isn't signed in
    if (!isLoaded || !isSignedIn || !options.enabled) {
      setLoading(false);
      return;
    }

    try {
      setError(null);
      const token = await getToken();

      if (!token) {
        console.warn("No auth token available");
        setCart([]);
        setLoading(false);
        return;
      }

      const cartData = await getCart(token);

      if (Array.isArray(cartData)) {
        setCart(cartData);
      } else if (cartData === null || cartData === undefined) {
        setCart([]);
      } else {
        console.warn("Unexpected cart data format:", cartData);
        setCart([]);
      }
    } catch (err) {
      console.error("Failed to fetch cart:", err);
      setError(err instanceof Error ? err.message : "Failed to load cart.");
      setCart([]);
    } finally {
      setLoading(false);
    }
  }, [getToken, isLoaded, isSignedIn, options.enabled]);

  // Refetch function for manual refresh
  const refetch = useCallback(() => {
    setLoading(true);
    fetchCart();
  }, [fetchCart]);

  useEffect(() => {
    if (options.refetchOnMount) {
      fetchCart();
    }
  }, [fetchCart, options.refetchOnMount]);

  // Calculate cart totals
  const cartTotal = cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  const itemCount = cart.reduce((count, item) => count + item.quantity, 0);

  return {
    cart,
    loading,
    error,
    refetch,
    cartTotal,
    itemCount,
    isSignedIn: isSignedIn && isLoaded
  };
};