"use client";

import { useAuth } from "@clerk/nextjs";
import { addToCart } from "@/utils/cart";

interface AddToCartButtonProps {
    productId: number;
}

export default function AddToCartButton({ productId }: AddToCartButtonProps) {
    const { getToken } = useAuth();

    const handleAddToCart = async (id: number) => {
        const token = await getToken({ template: "default" });
        if (!token) return;
        await addToCart(id, 1, token);
    };

    return (
        <button
            onClick={(e) => {
                e.preventDefault(); // prevents page navigation
                handleAddToCart(productId);
            }}
            className="mt-6 inline-block bg-black text-white px-4 py-2 text-sm rounded hover:bg-gray-800 transition"
        >
            Add to Cart
        </button>
    );
}
