"use client";

import { useEffect, useState } from "react";
import { Dialog } from "@headlessui/react";

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
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/custom-orders`)
      .then((res) => res.json())
      .then((data) => {
        setCustomOrders(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching custom orders", err);
        setLoading(false);
      });
  }, []);

  const filtered = customOrders.filter((order) =>
    [order.name, order.email, order.phone]
      .join(" ")
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  return (
    <>
      {/* Search bar */}
      <div className="flex justify-end mb-4">
        <input
          type="text"
          placeholder="Search name, email, or phone"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="p-2 rounded bg-neutral-800 border border-white/20 text-white w-80"
        />
      </div>

      {/* Loading state */}
      {loading && <p className="text-white/70">Loading...</p>}

      {/* Empty state */}
      {!loading && filtered.length === 0 && (
        <p className="text-white/50 italic">No custom orders found.</p>
      )}

      {/* Orders list */}
      <div className="space-y-6">
        {filtered.map((order) => (
          <div
            key={order.id}
            className="border border-white/20 p-4 rounded space-y-2"
          >
            <div className="text-lg font-semibold">{order.name}</div>
            <div className="text-sm text-white/70">
              {order.email} • {order.phone}
            </div>
            <div className="whitespace-pre-line">{order.message}</div>
            {order.image_url && order.image_url !== "No image uploaded" && (
              <img
                src={order.image_url}
                alt="Inspiration"
                onClick={() => setSelectedImage(order.image_url)}
                className="w-32 mt-2 border rounded cursor-pointer hover:opacity-80"
              />
            )}
            <div className="text-xs text-white/50">
              {new Date(order.created_at).toLocaleString()}
            </div>
          </div>
        ))}
      </div>

      {/* Full image modal */}
      {selectedImage && (
        <Dialog open={true} onClose={() => setSelectedImage(null)}>
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
            <img
              src={selectedImage}
              alt="Full Inspiration"
              className="max-w-full max-h-full rounded shadow-lg"
              onClick={() => setSelectedImage(null)}
            />
          </div>
        </Dialog>
      )}
    </>
  );
}
