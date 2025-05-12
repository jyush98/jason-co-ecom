"use client";

import { useEffect, useState } from "react";

interface CustomOrder {
  id: number;
  name: string;
  email: string;
  phone: string;
  message: string;
  image_url: string;
  created_at: string;
}

export default function AdminCustomOrderList() {
  const [customOrders, setCustomOrders] = useState<CustomOrder[]>([]);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/custom-orders`)
      .then((res) => res.json())
      .then(setCustomOrders)
      .catch((err) => console.error("Error fetching custom orders", err));
  }, []);

  return (
    <div className="space-y-6">
      {customOrders.map((order) => (
        <div
          key={order.id}
          className="border border-white/20 p-4 rounded space-y-2"
        >
          <div className="text-lg font-semibold">{order.name}</div>
          <div className="text-sm text-white/70">{order.email} • {order.phone}</div>
          <div>{order.message}</div>
          {order.image_url && order.image_url !== "No image uploaded" && (
            <img
              src={order.image_url}
              alt="Inspiration"
              className="w-32 mt-2 border rounded"
            />
          )}
          <div className="text-xs text-white/50">{new Date(order.created_at).toLocaleString()}</div>
        </div>
      ))}
    </div>
  );
}
