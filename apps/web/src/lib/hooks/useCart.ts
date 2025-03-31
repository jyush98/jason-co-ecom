// lib/hooks/useCart.ts
import { useEffect, useState } from "react";
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
  const { getToken } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const token = await getToken();
        if (token) {
          const cartData = await getCart(token);
          if (Array.isArray(cartData)) {
            setCart(cartData);
          } else {
            setCart([]);
          }
        }
      } catch (err) {
        console.error("Failed to fetch cart:", err);
        setError("Failed to load cart.");
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [getToken]);

  return { cart, loading, error };
};
