"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { getCart, removeFromCart, addToCart } from "../utils/cart";

// Define the type for a cart item
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

    useEffect(() => {
        const fetchCart = async () => {
            try {
                const token = await getToken();
                if (token) {
                    const cartData = await getCart(token);
                    if (Array.isArray(cartData)) {
                        setCart(cartData);
                        calculateTotal(cartData);
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

    const calculateTotal = (cartItems: CartItem[]) => {
        const total = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
        setTotalPrice(total);
    };

    const updateQuantity = async (productId: number, newQuantity: number) => {
        const token = await getToken();
        if (token) {
            await addToCart(productId, newQuantity, token);
            const updatedCart = cart.map((item) =>
                item.product_id === productId ? { ...item, quantity: newQuantity } : item
            );
            setCart(updatedCart);
            calculateTotal(updatedCart);
        }
    };

    const handleRemove = async (productId: number) => {
        const token = await getToken();
        if (token) {
            await removeFromCart(productId, token);
            const updatedCart = cart.filter((item) => item.product_id !== productId);
            setCart(updatedCart);
            calculateTotal(updatedCart);
        }
    };

    const handleCheckout = async () => {
        const token = await getToken();
    
        const requestBody = JSON.stringify({
            items: cart,  // Pass the cart data to your backend
            // totalPrice: totalPrice,
        });
    
        console.log("Request Body:", requestBody);  // Log the request body for debugging
    
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
            window.location.href = data.url;  // Redirect to Stripe Checkout
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
                <>
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
                    <div className="text-right mt-4 text-lg font-bold">
                        Total: ${totalPrice.toFixed(2)}
                    </div>
                </>
            )}
            <button
                onClick={handleCheckout}
                className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
                Checkout with Stripe
            </button>
        </div>
    );
}