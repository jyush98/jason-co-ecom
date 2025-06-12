"use client";

import { useEffect, useState } from "react";
import { useCartStore } from "@/app/store/cartStore";
import { useAuth } from "@clerk/nextjs";
import React from "react";

interface OrderItem {
  product_id: number;
  product_name: string;
  unit_price: number;
  quantity: number;
}

interface Order {
  id: number;
  total_price: number;
  status: string;
  created_at: string;
  items: OrderItem[];
}

export default function SuccessPage() {
  const setCartCount = useCartStore((state) => state.setCartCount);
  const { getToken } = useAuth();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      const token = await getToken();
      let endpoint = "";
      let headers: Record<string, string> = {};

      if (token) {
        // Logged-in user
        endpoint = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/orders/recent`;
        headers["Authorization"] = `Bearer ${token}`;
      } else {
        // Guest user
        const guestEmail = localStorage.getItem("guest_email");
        if (!guestEmail) {
          console.log(!guestEmail ? "No Email" : guestEmail);
          return;
        }

        endpoint = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/orders/guest/${guestEmail}`;
      }

      const res = await fetch(endpoint, { headers });
      if (res.ok) {
        const data = await res.json();
        setOrder(data);
      }

      setLoading(false);
      setCartCount(0);
    };


    fetchOrder();
  }, [getToken, setCartCount]);

  return (
    <main className="pt-[var(--navbar-height)] min-h-screen flex flex-col items-center text-center px-6">
      <h1 className="text-4xl font-snas-serif mb-4">Thank you for your purchase!</h1>
      <p className="text-gray-500 mb-8">Your order was successful.</p>

      {loading && <p className="text-gray-400">Loading order details...</p>}

      {order && (
        <div className="text-left w-full max-w-xl bg-white p-6 rounded shadow border text-black">
          <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
          <div className="grid grid-cols-2 text-sm gap-y-2 mb-4">
            {order.items.map((item) => (
              <React.Fragment key={item.product_id}>
                <span>{item.quantity} x {item.product_name}</span>
                <span className="text-right">${(item.unit_price * item.quantity).toFixed(2)}</span>
              </React.Fragment>
            ))}
          </div>
          <div className="flex justify-between border-t pt-4 mt-4 font-semibold text-base">
            <span>Total:</span>
            <span>${order.total_price.toFixed(2)}</span>
          </div>
        </div>
      )}

      {!loading && !order && (
        <p className="text-red-500 mt-4">Could not load your order. Please contact support.</p>
      )}
    </main>
  );
}
