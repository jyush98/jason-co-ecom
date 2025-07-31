"use client";

import { useEffect, useState } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { getCart, removeFromCart, addToCart } from "../utils/cart";
import { useCartStore } from "@/app/store/cartStore";
import { useGuestCartStore } from "@/app/store/guestCartStore";
import { motion, AnimatePresence } from "framer-motion";
import { JewelryImage } from "./ui/OptimizedImage";

interface CartItem {
    product_id: number;
    quantity: number;
    product: {
        id: number;
        name: string;
        price: number;
        image_url?: string;
    };
}

export default function Cart() {
    const { getToken } = useAuth();
    const { isSignedIn } = useUser();

    const [cart, setCart] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [totalPrice, setTotalPrice] = useState<number>(0);
    // const [guestName, setGuestName] = useState("");
    const [guestEmail, setGuestEmail] = useState("");
    const [checkingOut, setCheckingOut] = useState(false);

    const setCartCount = useCartStore((state) => state.setCartCount);
    const guestCart = useGuestCartStore((state) => state.cart);
    const updateGuestQty = useGuestCartStore((state) => state.updateQuantity);
    const removeGuestItem = useGuestCartStore((state) => state.removeItem);
    const clearGuestCart = useGuestCartStore((state) => state.clearCart);

    useEffect(() => {
        const fetchCart = async () => {
            if (!isSignedIn) {
                setCart(guestCart);
                calculateTotal(guestCart);
                setCartCount(guestCart.reduce((sum, i) => sum + i.quantity, 0));
                setLoading(false);
                return;
            }

            try {
                const token = await getToken();
                if (token) {
                    const cartData = await getCart(token);
                    if (Array.isArray(cartData)) {
                        setCart(cartData);
                        calculateTotal(cartData);
                        setCartCount(cartData.reduce((sum, i) => sum + i.quantity, 0));
                    } else {
                        setCart([]);
                        setCartCount(0);
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
    }, [guestCart, isSignedIn]);

    const calculateTotal = (items: CartItem[]) => {
        const total = items.reduce(
            (sum, item) => sum + item.product.price * item.quantity,
            0
        );
        setTotalPrice(total);
    };

    const updateQuantity = async (productId: number, delta: number) => {
        if (!isSignedIn) {
            updateGuestQty(productId, delta);
            return;
        }

        const token = await getToken();
        if (token) {
            await addToCart(productId, delta, token);
            const updatedCart = cart.map((item) =>
                item.product_id === productId
                    ? { ...item, quantity: item.quantity + delta }
                    : item
            );
            setCart(updatedCart);
            calculateTotal(updatedCart);
            setCartCount(updatedCart.reduce((sum, i) => sum + i.quantity, 0));
        }
    };

    const handleRemove = async (productId: number) => {
        if (!isSignedIn) {
            removeGuestItem(productId);
            return;
        }

        const token = await getToken();
        if (token) {
            await removeFromCart(productId, token);
            const updatedCart = cart.filter((item) => item.product_id !== productId);
            setCart(updatedCart);
            calculateTotal(updatedCart);
            setCartCount(updatedCart.reduce((sum, i) => sum + i.quantity, 0));
        }
    };

    const handleCheckout = async () => {
        if (!isSignedIn && !guestEmail.trim()) {
            alert("Please enter your email to checkout as a guest.");
            return;
        }

        setCheckingOut(true);
        try {
            const token = await getToken();

            const requestBody = {
                items: cart,
                guest_email: isSignedIn ? undefined : guestEmail,
            };

            const headers: HeadersInit = {
                "Content-Type": "application/json",
            };
            if (token) {
                headers["Authorization"] = `Bearer ${token}`;
            }

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/checkout/session`,
                {
                    method: "POST",
                    headers,
                    body: JSON.stringify(requestBody),
                }
            );

            const data = await response.json();
            if (data.url) {
                if (!isSignedIn && guestEmail) {
                    localStorage.setItem("guest_email", guestEmail);
                }
                if (!isSignedIn) clearGuestCart();
                window.location.href = data.url;
            } else {
                alert("Failed to start checkout. Please try again.");
            }
        } catch (err) {
            console.error("Checkout error:", err);
            alert("An error occurred during checkout.");
        } finally {
            setCheckingOut(false);
        }
    };

    if (loading) return <p>Loading cart...</p>;
    if (error) return <p className="text-red-500">{error}</p>;

    return (
        <div className="max-w-4xl mx-auto p-4">
            <h2 className="text-3xl font-bold mb-6 text-center mt-10">Your Cart</h2>
            {cart.length === 0 ? (
                <p className="px-4 py-12 text-center">Your cart is empty.</p>
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
                                    className="flex flex-col md:flex-row items-center justify-between gap-4 border border-black bg-slate-50 dark:border-white/10 rounded-lg p-4 dark:bg-white/5"
                                >
                                    <div className="flex items-center gap-4 w-full md:w-1/2">
                                        <JewelryImage.Product
                                            src={item.product.image_url || "/placeholder.jpg"}
                                            alt={item.product.name}
                                            className="w-24 h-24 object-cover rounded-md"
                                        />
                                        <div>
                                            <h3 className="text-lg font-semibold">
                                                {item.product.name}
                                            </h3>
                                            <p className="text-sm dark:text-white/60">
                                                ${item.product.price.toFixed(2)}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between gap-4 w-full md:w-1/2 md:justify-end">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => updateQuantity(item.product_id, -1)}
                                                disabled={item.quantity <= 1}
                                                className="w-8 h-8 rounded-full border border-black dark:border-white disabled:opacity-50"
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
                                                className="w-8 h-8 rounded-full border border-black dark:border-white"
                                            >
                                                +
                                            </button>
                                        </div>
                                        <button
                                            onClick={() => handleRemove(item.product_id)}
                                            className="text-xs underline dark:text-white/60 hover:text-red-400"
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

                    {!isSignedIn && (
                        <div className="mb-6 space-y-2">
                            <input
                                type="email"
                                placeholder="Email"
                                value={guestEmail}
                                onChange={(e) => setGuestEmail(e.target.value)}
                                className="w-full p-2 border border-black dark:border-white/30 rounded dark:bg-black dark:placeholder-white/50 text-black dark:text-white"
                                required
                            />
                        </div>
                    )}

                    <div className="text-center mt-6">
                        <button
                            onClick={handleCheckout}
                            disabled={checkingOut}
                            className="w-full md:w-auto px-6 py-3 rounded-full border border-black bg-white text-black font-medium hover:bg-gray-200 transition disabled:opacity-50"
                        >
                            {checkingOut ? "Redirecting..." : "Checkout with Stripe"}
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
