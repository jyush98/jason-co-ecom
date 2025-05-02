"use client";

import { useAuth } from "@clerk/nextjs";
import { addToCart } from "@/utils/cart";
import { useCartStore } from "@/app/store/cartStore"; // ✅ Zustand store for cart count

interface AddToCartButtonProps {
  productId: number;
  fullWidth?: boolean;
}

export default function AddToCartButton({ productId, fullWidth = false }: AddToCartButtonProps) {
  const { getToken } = useAuth();
  const fetchCartCount = useCartStore((state) => state.fetchCartCount);

  const handleAddToCart = async () => {
    const token = await getToken();
    if (!token) return;

    await addToCart(productId, 1, token);
    await fetchCartCount(token); // ✅ accurate count update
  };

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        handleAddToCart();
      }}
      className={`bg-black text-white px-6 py-3 text-sm rounded hover:bg-gray-800 transition ${
        fullWidth ? "w-full" : "inline-block"
      }`}
    >
      Add to Cart
    </button>
  );
}
