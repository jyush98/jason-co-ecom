"use client";

import { useState, useEffect } from "react";
import { useUser, useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Dialog } from "@headlessui/react";
import { Order, OrderItem, OrderStatus } from "@/types/order";
import toast from "react-hot-toast";

const ADMIN_EMAILS = ["jonathan@jasonjewels.com", "jason@jasonjewels.com", "jyushuvayev98@gmail.com"];
const STATUSES = ["all", "pending", "processing", "shipped", "delivered", "completed"];

export default function AdminPage() {
    const { user, isLoaded } = useUser();
    const { getToken } = useAuth();
    const router = useRouter();

    const [authorized, setAuthorized] = useState(false);
    const [orders, setOrders] = useState<Order[]>([]);
    const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
    const [statusFilter, setStatusFilter] = useState("all");
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [page, setPage] = useState(1);
    const perPage = 5;

    useEffect(() => {
        if (isLoaded) {
            const email = user?.emailAddresses[0]?.emailAddress;
            if (email && ADMIN_EMAILS.includes(email)) {
                setAuthorized(true);
            } else {
                router.replace("/");
            }
        }
    }, [isLoaded, user, router]);

    useEffect(() => {
        const fetchOrders = async () => {
            const token = await getToken();
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/orders`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                setOrders(data);
            }
        };
        if (authorized) fetchOrders();
    }, [authorized]);

    useEffect(() => {
        let data = [...orders];
        if (statusFilter !== "all") {
            data = data.filter((o) => o.status === statusFilter);
        }
        setFilteredOrders(data);
        setPage(1); // reset to first page on filter change
    }, [statusFilter, orders]);

    const paginated = filteredOrders.slice((page - 1) * perPage, page * perPage);

    if (!authorized) return null;

    return (
        <main className="min-h-screen p-6 text-white bg-black pt-[var(--navbar-height)]">
            <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

            {/* Status Filter */}
            <div className="flex gap-4 mb-6">
                {STATUSES.map((status) => (
                    <button
                        key={status}
                        className={`px-4 py-2 rounded border ${statusFilter === status ? "bg-white text-black" : "border-white"
                            }`}
                        onClick={() => setStatusFilter(status)}
                    >
                        {status[0].toUpperCase() + status.slice(1)}
                    </button>
                ))}
            </div>

            {/* Orders */}
            <div className="space-y-6">
                {paginated.map((order: Order) => (
                    <div
                        key={order.id}
                        className="border border-white/20 p-4 rounded cursor-pointer hover:bg-white/10"
                        onClick={() => setSelectedOrder(order)}
                    >
                        <p className="text-sm text-gray-400">Order #{order.id}</p>
                        <p className="text-sm">Total: ${order.total_price.toFixed(2)}</p>
                        <p className="text-sm">Status: {order.status}</p>
                        <p className="text-sm text-gray-500">{new Date(order.created_at).toLocaleString()}</p>
                    </div>
                ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-between mt-10">
                <button
                    disabled={page === 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="px-4 py-2 border rounded disabled:opacity-50"
                >
                    Previous
                </button>
                <button
                    disabled={page * perPage >= filteredOrders.length}
                    onClick={() => setPage((p) => p + 1)}
                    className="px-4 py-2 border rounded disabled:opacity-50"
                >
                    Next
                </button>
            </div>

            {/* Order Detail Modal */}
            {selectedOrder && (
                <Dialog open={true} onClose={() => setSelectedOrder(null)}>
                    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
                        <div className="bg-neutral-900 p-6 rounded max-w-lg w-full text-white">
                            <Dialog.Description>
                                <h2 className="text-xl font-bold mb-4">Order #{selectedOrder.id}</h2>
                            </Dialog.Description>
                            <p><strong>Status:</strong> {selectedOrder.status}</p>
                            <select
                                value={selectedOrder.status}
                                onChange={async (e) => {
                                    const newStatus = e.target.value;
                                    const token = await getToken();
                                    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/orders/${selectedOrder.id}`, {
                                        method: "PATCH",
                                        headers: {
                                            "Authorization": `Bearer ${token}`,
                                            "Content-Type": "application/json",
                                        },
                                        body: JSON.stringify(newStatus),
                                    });

                                    if (res.ok) {
                                        setSelectedOrder({ ...selectedOrder, status: newStatus as OrderStatus });
                                        setOrders((prev) =>
                                            prev.map((o) => (o.id === selectedOrder.id ? { ...o, status: newStatus as OrderStatus } : o))
                                        );
                                        toast.success("Order status updated");
                                    } else {
                                        toast.error("Failed to update order status");
                                    }
                                }}
                                className="mt-2 bg-neutral-800 text-white p-2 rounded w-full"
                            >
                                {STATUSES.filter((s) => s !== "all").map((status) => (
                                    <option key={status} value={status}>
                                        {status[0].toUpperCase() + status.slice(1)}
                                    </option>
                                ))}
                            </select>

                            <p><strong>Total:</strong> ${selectedOrder.total_price.toFixed(2)}</p>
                            <p><strong>Placed:</strong> {new Date(selectedOrder.created_at).toLocaleString()}</p>
                            <ul className="mt-4 space-y-2">
                                {selectedOrder.items.map((item: OrderItem) => (
                                    <li key={item.id} className="text-sm border-t pt-2">
                                        {item.quantity} × {item.product_name} — ${item.unit_price}
                                    </li>
                                ))}
                            </ul>
                            <div className="mt-6 text-right">
                                <button onClick={() => setSelectedOrder(null)} className="px-4 py-2 bg-white text-black rounded">Close</button>
                            </div>
                        </div>
                    </div>
                </Dialog>
            )}
        </main>
    );
}
