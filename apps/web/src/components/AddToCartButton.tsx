"use client";

import { useAuth, useUser } from "@clerk/nextjs";
import { addToCart } from "@/utils/cart";
import { useCartStore } from "@/app/store/cartStore";
import { useGuestCartStore } from "@/app/store/guestCartStore"; // ✅ new guest cart store
import { useState } from "react";

interface AddToCartButtonProps {
  productId: number;
  fullWidth?: boolean;
  productName: string;
  productPrice: number;
  productImageUrl?: string;
}

export default function AddToCartButton({
  productId,
  fullWidth = false,
  productName,
  productPrice,
  productImageUrl,
}: AddToCartButtonProps) {
  const { getToken } = useAuth();
  const { isSignedIn } = useUser();
  const fetchCartCount = useCartStore((state) => state.fetchCartCount);
  const addGuestItem = useGuestCartStore((state) => state.addItem);
  const [adding, setAdding] = useState(false);
  const setCartCount = useCartStore((state) => state.setCartCount)

  const handleAddToCart = async () => {
    setAdding(true);
    if (isSignedIn) {
      const token = await getToken();
      if (!token) return;
  
      await addToCart(productId, 1, token);
      await fetchCartCount(token);
    } else {
      addGuestItem({
        product_id: productId,
        quantity: 1,
        product: {
          id: productId,
          name: productName,
          price: productPrice,
          image_url: productImageUrl,
        },
      });
      setCartCount(useGuestCartStore.getState().getCount());
    }
    setAdding(false);
  };
  

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        handleAddToCart();
      }}
      disabled={adding}
      className={`bg-black text-white px-6 py-3 text-sm rounded hover:bg-gray-800 transition disabled:opacity-50 ${
        fullWidth ? "w-full" : "inline-block"
      }`}
    >
      {adding ? "Adding..." : "Add to Cart"}
    </button>
  );
}
