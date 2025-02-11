"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { getCart, removeFromCart, addToCart } from "../utils/cart";

// Define the type for a cart item
interface CartItem {
    product_id: number;
    product: {
        name: string;
    };
    quantity: number;
}

export default function Cart() {
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
                    console.log("Cart Data:", cartData); // Log the data
                    if (Array.isArray(cartData)) {
                        setCart(cartData);
                    } else {
                        setCart([]); // Set to empty array if cartData is not an array
                    }
                }
            } catch (err) {
                console.error("Failed to fetch cart:", err);
                setError("Failed to load cart. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchCart();
    }, []);

    const updateQuantity = async (productId: number, newQuantity: number) => {
        const token = await getToken();
        if (token) {
            try {
                await addToCart(productId, newQuantity, token); // Reuse addToCart API for updates
                const updatedCart = cart.map((item) =>
                    item.product_id === productId ? { ...item, quantity: newQuantity } : item
                );
                setCart(updatedCart);
            } catch (err) {
                console.error("Failed to update quantity:", err);
            }
        }
    };

    const handleRemove = async (productId: number) => {
        const token = await getToken();
        if (token) {
            try {
                await removeFromCart(productId, token);
                setCart(cart.filter((item) => item.product_id !== productId));
            } catch (err) {
                console.error("Failed to remove item:", err);
            }
        }
    };

    if (loading) {
        return <p>Loading cart...</p>;
    }

    if (error) {
        return <p className="text-red-500">{error}</p>;
    }

    return (
        <div className="max-w-2xl mx-auto p-4">
            <h2 className="text-2xl font-bold mb-4">Your Cart</h2>
            {cart.length === 0 ? (
                <p>Your cart is empty.</p>
            ) : (
                <ul className="space-y-4">
                    {cart.map((item) => (
                        <li key={item.product_id} className="flex items-center justify-between border-b pb-2">
                            <span>{item.product.name} - {item.quantity}</span>
                            <div className="flex items-center space-x-2">
                                <button 
                                    onClick={() => updateQuantity(item.product_id, item.quantity + 1)} 
                                    className="px-2 py-1 bg-green-500 text-white rounded"
                                >
                                    +
                                </button>
                                <button 
                                    onClick={() => updateQuantity(item.product_id, item.quantity - 1)} 
                                    className="px-2 py-1 bg-yellow-500 text-white rounded"
                                    disabled={item.quantity <= 1}
                                >
                                    -
                                </button>
                                <button 
                                    onClick={() => handleRemove(item.product_id)} 
                                    className="px-2 py-1 bg-red-500 text-white rounded"
                                >
                                    Remove
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}