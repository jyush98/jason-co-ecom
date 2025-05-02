import { CartItem } from "@/lib/hooks/useCart";
import { create } from "zustand";

interface CartState {
  cartCount: number;
  setCartCount: (count: number) => void;
  updateCartCount: (newCount: number) => void;
  fetchCartCount: (token: string) => Promise<void>;
}

export const useCartStore = create<CartState>((set) => ({
  cartCount: 0,
  setCartCount: (count) => set({ cartCount: count }),
  updateCartCount: (newCount) => set({ cartCount: newCount }),
  fetchCartCount: async (token) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/cart`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await res.json();
    const totalQuantity = data.reduce((sum: number, item: CartItem) => sum + item.quantity, 0);
    set({ cartCount: totalQuantity });
  },
}));
