"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { getCart, removeFromCart, addToCart } from "../utils/cart";
import { useCartStore } from "@/app/store/cartStore";
import { motion, AnimatePresence } from "framer-motion";

interface CartItem {
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

export default function Cart() {
    const { getToken } = useAuth();
    const [cart, setCart] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [totalPrice, setTotalPrice] = useState<number>(0);

    const setCartCount = useCartStore((state) => state.setCartCount);

    useEffect(() => {
        const fetchCart = async () => {
            try {
                const token = await getToken();
                if (token) {
                    const cartData = await getCart(token);
                    if (Array.isArray(cartData)) {
                        setCart(cartData);
                        calculateTotal(cartData);
                        updateCartCount(cartData);
                    } else {
                        setCart([]);
                        updateCartCount([]);
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

    const updateCartCount = (items: CartItem[]) => {
        const total = items.reduce((acc, item) => acc + item.quantity, 0);
        setCartCount(total);
    };

    const calculateTotal = (cartItems: CartItem[]) => {
        const total = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
        setTotalPrice(total);
    };

    const updateQuantity = async (productId: number, newQuantity: number) => {
        const token = await getToken();
        if (token) {
            await addToCart(productId, newQuantity, token);
            const updatedCart = cart.map((item) =>
                item.product_id === productId ? { ...item, quantity: item.quantity + newQuantity } : item
            );
            setCart(updatedCart);
            calculateTotal(updatedCart);
            updateCartCount(updatedCart);
        }
    };

    const handleRemove = async (productId: number) => {
        const token = await getToken();
        if (token) {
            await removeFromCart(productId, token);
            const updatedCart = cart.filter((item) => item.product_id !== productId);
            setCart(updatedCart);
            calculateTotal(updatedCart);
            updateCartCount(updatedCart);
        }
    };

    const handleCheckout = async () => {
        const token = await getToken();
        const requestBody = JSON.stringify({ items: cart });

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/checkout/session`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: requestBody,
        });

        const data = await response.json();
        if (data.url) {
            window.location.href = data.url;
        } else {
            alert("Failed to start checkout. Please try again.");
        }
    };

    if (loading) return <p>Loading cart...</p>;
    if (error) return <p className="text-red-500">{error}</p>;

    return (
        <div className="max-w-4xl mx-auto p-4 text-white">
            <h2 className="text-3xl font-bold mb-6 text-center">Your Cart</h2>
            {cart.length === 0 ? (
                <p className="text-center">Your cart is empty.</p>
            ) : (
                <>
                    <ul className="space-y-6">
                        <AnimatePresence>
                            {cart.map((item) => (
                                <motion.li
                                    key={item.product_id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.25 }}
                                    className="flex flex-col md:flex-row items-center justify-between gap-4 border border-white/10 rounded-lg p-4 bg-white/5"
                                >
                                    <div className="flex items-center gap-4 w-full md:w-1/2">
                                        <img
                                            src={item.product.image_url || "/placeholder.jpg"}
                                            alt={item.product.name}
                                            className="w-24 h-24 object-cover rounded-md"
                                        />
                                        <div>
                                            <h3 className="text-lg font-semibold">{item.product.name}</h3>
                                            <p className="text-sm text-white/60">${item.product.price.toFixed(2)}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between gap-4 w-full md:w-1/2 md:justify-end">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => updateQuantity(item.product_id, -1)}
                                                disabled={item.quantity <= 1}
                                                className="w-8 h-8 rounded-full border border-white disabled:opacity-50"
                                            >
                                                -
                                            </button>
                                            <motion.span
                                                key={item.quantity}
                                                initial={{ scale: 0.8, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                transition={{ duration: 0.15 }}
                                                className="inline-block text-center w-6"
                                            >
                                                {item.quantity}
                                            </motion.span>


                                            <button
                                                onClick={() => updateQuantity(item.product_id, 1)}
                                                className="w-8 h-8 rounded-full border border-white"
                                            >
                                                +
                                            </button>
                                        </div>
                                        <button
                                            onClick={() => handleRemove(item.product_id)}
                                            className="text-xs underline text-white/60 hover:text-red-400"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </motion.li>
                            ))}
                        </AnimatePresence>
                    </ul>

                    <div className="text-right mt-8 text-xl font-bold">
                        Total: ${totalPrice.toFixed(2)}
                    </div>

                    <div className="text-center mt-6">
                        <button
                            onClick={handleCheckout}
                            className="w-full md:w-auto px-6 py-3 rounded-full bg-white text-black font-medium hover:bg-gray-200 transition"
                        >
                            Checkout with Stripe
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
