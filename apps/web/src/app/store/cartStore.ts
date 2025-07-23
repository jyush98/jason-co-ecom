// app/store/cartStore.ts - Enhanced Cart Store

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Cart, CartItem, CartDrawerState, CartActionResult } from '@/types/cart';
import { CART_CONFIG } from '@/config/cartConfig';
import { getCart, addToCart as apiAddToCart, removeFromCart as apiRemoveFromCart } from '@/utils/cart';

interface CartStoreState {
  // Existing cart data
  cart: Cart | null;
  cartCount: number;
  isLoading: boolean;
  error: string | null;

  // Cart drawer state
  drawer: CartDrawerState;

  // Last added item for success messaging
  lastAddedItem: CartItem | null;

  // Actions - existing
  setCartCount: (count: number) => void;
  fetchCartCount: (token: string) => Promise<void>;
  clearCart: () => void;

  // Actions - enhanced drawer functionality
  openDrawer: () => void;
  closeDrawer: () => void;
  setLastAddedItem: (item: CartItem) => void;
  clearLastAddedItem: () => void;

  // Actions - full cart management
  fetchCart: (token: string) => Promise<void>;
  addToCart: (productId: number, quantity: number, token: string, customOptions?: Record<string, string>) => Promise<CartActionResult>;
  updateCartItem: (productId: number, quantity: number, token: string) => Promise<CartActionResult>;
  removeFromCart: (productId: number, token: string) => Promise<CartActionResult>;
  applyPromoCode: (code: string, token: string) => Promise<CartActionResult>;
  removePromoCode: (token: string) => Promise<CartActionResult>;

  // Actions - utility
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
  resetDrawerState: () => void;
}

// Default cart state
const defaultCart: Cart = {
  items: [],
  subtotal: 0,
  tax: 0,
  shipping: 0,
  total: 0,
  item_count: 0,
  currency: CART_CONFIG.currency.code,
  last_updated: new Date().toISOString(),
};

// Default drawer state
const defaultDrawerState: CartDrawerState = {
  isOpen: false,
  isLoading: false,
  error: null,
  lastAddedItem: undefined,
};

export const useCartStore = create<CartStoreState>()(
  persist(
    (set, get) => ({
      // Initial state
      cart: null,
      cartCount: 0,
      isLoading: false,
      error: null,
      drawer: defaultDrawerState,
      lastAddedItem: null,

      // Existing actions
      setCartCount: (count) => {
        set({ cartCount: count });
      },

      fetchCartCount: async (token) => {
        try {
          const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
          const response = await fetch(`${API_BASE_URL}/cart/count`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });

          if (response.ok) {
            const data = await response.json();
            set({ cartCount: data.count || 0 });
          }
        } catch (error) {
          console.error('Failed to fetch cart count:', error);
        }
      },

      clearCart: () => {
        set({
          cart: defaultCart,
          cartCount: 0,
          lastAddedItem: null,
          error: null,
        });
      },

      // Enhanced drawer actions
      openDrawer: () => {
        set((state) => ({
          drawer: {
            ...state.drawer,
            isOpen: true,
            error: null,
          }
        }));
      },

      closeDrawer: () => {
        set((state) => ({
          drawer: {
            ...state.drawer,
            isOpen: false,
          }
        }));
        // Clear last added item after a delay to allow for animations
        setTimeout(() => {
          get().clearLastAddedItem();
        }, 300);
      },

      setLastAddedItem: (item) => {
        set({
          lastAddedItem: item,
          drawer: {
            ...get().drawer,
            lastAddedItem: item,
          }
        });
      },

      clearLastAddedItem: () => {
        set({
          lastAddedItem: null,
          drawer: {
            ...get().drawer,
            lastAddedItem: undefined,
          }
        });
      },

      // Full cart management using existing API
      fetchCart: async (token) => {
        set({ isLoading: true, error: null });

        try {
          const cartData = await getCart(token);

          // Transform array response to Cart object structure
          const cart: Cart = {
            items: cartData, // The API returns items directly as an array
            subtotal: cartData.reduce((sum: number, item: CartItem) => sum + (item.product.price * item.quantity), 0),
            tax: 0,
            shipping: 0,
            total: cartData.reduce((sum: number, item: CartItem) => sum + (item.product.price * item.quantity), 0),
            item_count: cartData.length,
            currency: CART_CONFIG.currency.code,
            last_updated: new Date().toISOString(),
          };

          set({
            cart,
            cartCount: cart.items.reduce((total, item) => total + item.quantity, 0), // Total quantity
            isLoading: false,
            error: null,
          });
        } catch (error) {
          // ... error handling stays the same
        }
      },

      addToCart: async (productId, quantity, token, customOptions) => {
        set((state) => ({
          drawer: { ...state.drawer, isLoading: true, error: null }
        }));

        try {
          const result = await apiAddToCart(productId, quantity, token);

          if (result.error || !result.success) {
            throw new Error(result.error || result.message || 'Failed to add item to cart');
          }

          // Fetch updated cart
          const cart = await getCart(token);

          // Find the added item for success messaging
          const addedItem = cart.items.find((item: CartItem) => item.product_id === productId);

          set({
            cart: cart,
            cartCount: cart.items.reduce((total: number, item: CartItem) => total + item.quantity, 0), // Total quantity
            lastAddedItem: addedItem || null,
            drawer: {
              ...get().drawer,
              isLoading: false,
              error: null,
              lastAddedItem: addedItem,
            }
          });

          return {
            success: true,
            message: 'Item added to cart',
            cart: cart,
          };

        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : CART_CONFIG.messaging.errors.addToCartFailed;

          set((state) => ({
            drawer: {
              ...state.drawer,
              isLoading: false,
              error: errorMessage,
            }
          }));

          return {
            success: false,
            error: errorMessage,
          };
        }
      },

      // Fixed updateCartItem function for your cart store
      // Replace the existing updateCartItem function in your cartStore.ts

      updateCartItem: async (productId, quantity, token) => {
        const currentCart = get().cart;
        if (!currentCart) return { success: false, error: 'No cart loaded' };

        // Optimistic update
        const optimisticItems = currentCart.items.map(item =>
          item.product_id === productId ? { ...item, quantity } : item
        );

        const optimisticCart = {
          ...currentCart,
          items: optimisticItems,
          subtotal: optimisticItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0),
        };

        set({ cart: optimisticCart });

        try {
          const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
          const response = await fetch(`${API_BASE_URL}/cart/update`, {
            method: 'PATCH', // ✅ Changed from PUT to PATCH to match your backend
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              product_id: productId, // ✅ Match your backend's expected format
              quantity: quantity,
            }),
          });

          if (!response.ok) {
            // Revert optimistic update
            set({ cart: currentCart });
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.detail || errorData.message || 'Failed to update cart item');
          }

          // Fetch updated cart to ensure consistency
          const updatedCartData = await getCart(token);

          // Transform array response to Cart object structure (same as in fetchCart)
          const updatedCart: Cart = {
            items: updatedCartData,
            subtotal: updatedCartData.reduce((sum: number, item: CartItem) => sum + (item.product.price * item.quantity), 0),
            tax: 0,
            shipping: 0,
            total: updatedCartData.reduce((sum: number, item: CartItem) => sum + (item.product.price * item.quantity), 0),
            item_count: updatedCartData.reduce((total: number, item: CartItem) => total + item.quantity, 0),
            currency: CART_CONFIG.currency.code,
            last_updated: new Date().toISOString(),
          };

          set({
            cart: updatedCart,
            cartCount: updatedCart.items.reduce((total, item) => total + item.quantity, 0),
          });

          return {
            success: true,
            message: 'Cart updated',
            cart: updatedCart,
          };

        } catch (error) {
          // Revert optimistic update
          set({ cart: currentCart });
          const errorMessage = error instanceof Error ? error.message : CART_CONFIG.messaging.errors.updateQuantityFailed;

          return {
            success: false,
            error: errorMessage,
          };
        }
      },

      removeFromCart: async (productId, token) => {
        const currentCart = get().cart;
        if (!currentCart) return { success: false, error: 'No cart loaded' };

        // Optimistic update
        const optimisticItems = currentCart.items.filter(item => item.product_id !== productId);
        const optimisticCart = {
          ...currentCart,
          items: optimisticItems,
          item_count: optimisticItems.length,
          subtotal: optimisticItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0),
        };

        set({ cart: optimisticCart });

        try {
          const result = await apiRemoveFromCart(productId, token);

          // ✅ FIXED: Your backend returns {"message": "Item removed from cart"}
          // Check for actual error conditions instead of non-existent success property
          if (result.error) {
            // Revert optimistic update
            set({ cart: currentCart });
            throw new Error(result.error);
          }

          // ✅ FIXED: Fetch updated cart to ensure consistency
          const updatedCartData = await getCart(token);

          // Transform array response to Cart object structure (same as in fetchCart)
          const updatedCart: Cart = {
            items: updatedCartData,
            subtotal: updatedCartData.reduce((sum: number, item: CartItem) => sum + (item.product.price * item.quantity), 0),
            tax: 0,
            shipping: 0,
            total: updatedCartData.reduce((sum: number, item: CartItem) => sum + (item.product.price * item.quantity), 0),
            item_count: updatedCartData.reduce((total: number, item: CartItem) => total + item.quantity, 0),
            currency: CART_CONFIG.currency.code,
            last_updated: new Date().toISOString(),
          };

          set({
            cart: updatedCart,
            cartCount: updatedCart.items.reduce((total, item) => total + item.quantity, 0), // ✅ Update cart count too
          });

          return {
            success: true,
            message: 'Item removed from cart',
            cart: updatedCart,
          };

        } catch (error) {
          // Revert optimistic update
          set({ cart: currentCart });
          const errorMessage = error instanceof Error ? error.message : CART_CONFIG.messaging.errors.removeFromCartFailed;

          return {
            success: false,
            error: errorMessage,
          };
        }
      },

      applyPromoCode: async (code, token) => {
        const currentCart = get().cart;
        if (!currentCart) return { success: false, error: 'No cart loaded' };

        set({ isLoading: true });

        try {
          const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
          const response = await fetch(`${API_BASE_URL}/cart/promo`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ code }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Invalid promo code');
          }

          const updatedCart: Cart = await response.json();

          set({
            cart: updatedCart,
            isLoading: false,
          });

          return {
            success: true,
            message: `Promo code "${code}" applied successfully!`,
            cart: updatedCart,
          };

        } catch (error) {
          set({ isLoading: false });
          const errorMessage = error instanceof Error ? error.message : CART_CONFIG.messaging.errors.invalidPromoCode;

          return {
            success: false,
            error: errorMessage,
          };
        }
      },

      removePromoCode: async (token) => {
        const currentCart = get().cart;
        if (!currentCart) return { success: false, error: 'No cart loaded' };

        try {
          const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
          const response = await fetch(`${API_BASE_URL}/cart/promo`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });

          if (!response.ok) {
            throw new Error('Failed to remove promo code');
          }

          const updatedCart: Cart = await response.json();

          set({ cart: updatedCart });

          return {
            success: true,
            message: 'Promo code removed',
            cart: updatedCart,
          };

        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to remove promo code';

          return {
            success: false,
            error: errorMessage,
          };
        }
      },

      // Utility actions
      setError: (error) => {
        set({ error });
      },

      setLoading: (loading) => {
        set({ isLoading: loading });
      },

      resetDrawerState: () => {
        set({ drawer: defaultDrawerState });
      },
    }),
    {
      name: 'cart-store',
      storage: createJSONStorage(() => localStorage),
      // Only persist essential data, not loading states
      partialize: (state) => ({
        cartCount: state.cartCount,
        lastAddedItem: state.lastAddedItem,
      }),
    }
  )
);

// Individual selector hooks for better performance and SSR stability
export const useCartCount = () => useCartStore((state) => state.cartCount);

export const useCartDrawer = () => ({
  isOpen: useCartStore((state) => state.drawer.isOpen),
  isLoading: useCartStore((state) => state.drawer.isLoading),
  error: useCartStore((state) => state.drawer.error),
  lastAddedItem: useCartStore((state) => state.drawer.lastAddedItem),
  openDrawer: useCartStore((state) => state.openDrawer),
  closeDrawer: useCartStore((state) => state.closeDrawer),
});

export const useCartActions = () => ({
  addToCart: useCartStore((state) => state.addToCart),
  updateCartItem: useCartStore((state) => state.updateCartItem),
  removeFromCart: useCartStore((state) => state.removeFromCart),
  applyPromoCode: useCartStore((state) => state.applyPromoCode),
  removePromoCode: useCartStore((state) => state.removePromoCode),
});

export const useCartData = () => ({
  cart: useCartStore((state) => state.cart),
  isLoading: useCartStore((state) => state.isLoading),
  error: useCartStore((state) => state.error),
  fetchCart: useCartStore((state) => state.fetchCart),
});