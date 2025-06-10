import { create } from "zustand";
import { persist } from "zustand/middleware";

interface Product {
  id: number;
  name: string;
  price: number;
  image_url?: string;
}

interface CartItem {
  product_id: number;
  quantity: number;
  product: Product;
}

interface GuestCartState {
  cart: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (product_id: number) => void;
  updateQuantity: (product_id: number, amount: number) => void;
  clearCart: () => void;
  getCount: () => number;
}

export const useGuestCartStore = create<GuestCartState>()(
  persist(
    (set, get) => ({
      cart: [],
      addItem: (item) => {
        const existing = get().cart.find((i) => i.product_id === item.product_id);
        if (existing) {
          set({
            cart: get().cart.map((i) =>
              i.product_id === item.product_id
                ? { ...i, quantity: i.quantity + item.quantity }
                : i
            ),
          });
        } else {
          set({ cart: [...get().cart, item] });
        }
      },
      removeItem: (product_id) =>
        set({
          cart: get().cart.filter((item) => item.product_id !== product_id),
        }),
      updateQuantity: (product_id, amount) =>
        set({
          cart: get().cart.map((item) =>
            item.product_id === product_id
              ? { ...item, quantity: item.quantity + amount }
              : item
          ),
        }),
      clearCart: () => set({ cart: [] }),
      getCount: () =>
        get().cart.reduce((acc, item) => acc + item.quantity, 0),
    }),
    {
      name: "guest-cart-storage",
    }
  )
);
