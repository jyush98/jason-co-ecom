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

export const useCart = () => {
  const auth = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCart = useCallback(async () => {
    // Wait for auth to be loaded and check if user is signed in
    if (!auth.isLoaded) {
      return; // Don't do anything while auth is loading
    }

    if (!auth.isSignedIn) {
      // User is not signed in, set empty cart and stop loading
      setCart([]);
      setLoading(false);
      return;
    }

    try {
      setError(null);
      const token = await auth.getToken();

      if (!token) {
        console.warn("No auth token available");
        setCart([]);
        setLoading(false);
        return;
      }

      const cartData = await getCart(token);

      if (Array.isArray(cartData)) {
        setCart(cartData);
      } else {
        setCart([]);
      }
    } catch (err) {
      console.error("Failed to fetch cart:", err);
      setError(err instanceof Error ? err.message : "Failed to load cart.");
      setCart([]);
    } finally {
      setLoading(false);
    }
  }, [auth.isLoaded, auth.isSignedIn, auth.getToken]);

  // Only fetch when auth is loaded
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // Calculate cart totals
  const cartTotal = cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  const itemCount = cart.reduce((count, item) => count + item.quantity, 0);

  return {
    cart,
    loading,
    error,
    refetch: fetchCart,
    cartTotal,
    itemCount,
    isSignedIn: auth.isSignedIn && auth.isLoaded
  };
};