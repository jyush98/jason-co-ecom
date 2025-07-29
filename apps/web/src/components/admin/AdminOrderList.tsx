"use client";

import { useEffect, useState, useMemo, Fragment } from "react";
import { useAuth } from "@clerk/nextjs";
import {
  Package,
  User,
  DollarSign,
  Calendar,
  Eye,
  Search,
  Filter,
  Download,
  RefreshCcw,
  AlertCircle,
  CheckCircle,
  Clock,
  Truck
} from "lucide-react";
import { Dialog, Transition } from "@headlessui/react";

interface OrderItem {
  id: number;
  product_id: number;
  product_name: string;
  unit_price: number;
  quantity: number;
}

interface Order {
  id: number;
  order_number: string;
  customer_first_name: string;
  customer_last_name: string;
  customer_email: string;
  total_price: number;
  status: string;
  payment_status: string;
  created_at: string;
  shipping_address: any;
  billing_address: any;
  items: OrderItem[];
  notes?: string;
}

const ORDER_STATUSES = [
  { value: 'pending', label: 'Pending', color: 'bg-yellow-500', icon: Clock },
  { value: 'confirmed', label: 'Confirmed', color: 'bg-blue-500', icon: CheckCircle },
  { value: 'processing', label: 'Processing', color: 'bg-purple-500', icon: Package },
  { value: 'shipped', label: 'Shipped', color: 'bg-green-500', icon: Truck },
  { value: 'delivered', label: 'Delivered', color: 'bg-green-600', icon: CheckCircle },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-500', icon: AlertCircle },
];

export default function AdminOrderList() {
  const { getToken } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState<number | null>(null);

  // ✅ FIXED: Use useMemo to prevent infinite re-calculations
  const filteredOrders = useMemo(() => {
    console.log("🔍 FILTERING - Orders:", orders.length, "Search:", searchTerm, "Status:", statusFilter);

    const result = orders.filter(order => {
      // Status filter
      const matchesStatus = statusFilter === "all" || order.status === statusFilter;

      // Search filter
      if (!searchTerm?.trim()) {
        return matchesStatus; // No search term, just use status filter
      }

      const searched = searchTerm.toLowerCase().trim();
      const searchString = [
        order.order_number,
        order.customer_first_name,
        order.customer_last_name,
        order.customer_email,
        `${order.customer_first_name || ""} ${order.customer_last_name || ""}`
      ]
        .filter(Boolean) // Remove null/undefined
        .join(" ")
        .toLowerCase();

      const matchesSearch = searchString.includes(searched);
      console.log(`🔎 Order ${order.id} - Matches Status: ${matchesStatus}, Matches Search: ${matchesSearch}`);
      console.log(order);

      return matchesStatus && matchesSearch;
    });

    console.log("📊 FILTERING COMPLETE - Found:", result.length, "orders");
    return result;
  }, [orders, searchTerm, statusFilter]); // Only re-run when these change

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = await getToken();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/orders`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch orders: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("📦 Orders fetched:", data.length);
      setOrders(data);
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError(err instanceof Error ? err.message : "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: number, newStatus: string) => {
    try {
      setUpdatingStatus(orderId);
      const token = await getToken();

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update order status');
      }

      // Update the order in the local state
      setOrders(prev => prev.map(order =>
        order.id === orderId
          ? { ...order, status: newStatus }
          : order
      ));

      // Update selected order if it's the one being updated
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null);
      }

    } catch (err) {
      console.error("Error updating order status:", err);
      alert("Failed to update order status. Please try again.");
    } finally {
      setUpdatingStatus(null);
    }
  };

  const getStatusInfo = (status: string) => {
    return ORDER_STATUSES.find(s => s.value === status) || ORDER_STATUSES[0];
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const exportToCSV = () => {
    const csvData = filteredOrders.map(order => ({
      'Order Number': order.order_number,
      'Customer': order.customer_first_name + ' ' + order.customer_last_name,
      'Email': order.customer_email,
      'Total': order.total_price,
      'Status': order.status,
      'Payment Status': order.payment_status,
      'Date': formatDate(order.created_at),
    }));

    const csv = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const openOrderModal = (order: Order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const closeOrderModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  // Clean event handlers
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-3 text-white/70">
          <RefreshCcw className="animate-spin" size={20} />
          <span>Loading orders...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <AlertCircle className="mx-auto mb-4 text-red-400" size={48} />
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={fetchOrders}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50" size={20} />
          <input
            type="text"
            placeholder="Search by order number, customer name, or email..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-4 py-2 bg-neutral-800 border border-white/20 text-white rounded-lg focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold"
          />
        </div>

        {/* Status Filter */}
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50" size={20} />
          <select
            value={statusFilter}
            onChange={handleStatusFilterChange}
            className="pl-10 pr-8 py-2 bg-neutral-800 border border-white/20 text-white rounded-lg focus:outline-none focus:border-gold appearance-none cursor-pointer"
          >
            <option value="all">All Statuses</option>
            {ORDER_STATUSES.map(status => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>

        {/* Export Button */}
        <button
          onClick={exportToCSV}
          className="flex items-center gap-2 px-4 py-2 bg-gold hover:bg-gold/90 text-black rounded-lg transition-colors font-medium"
        >
          <Download size={20} />
          Export CSV
        </button>

        {/* Refresh Button */}
        <button
          onClick={fetchOrders}
          className="flex items-center gap-2 px-4 py-2 bg-neutral-700 hover:bg-neutral-600 text-white rounded-lg transition-colors"
        >
          <RefreshCcw size={20} />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-neutral-800 p-4 rounded-lg border border-white/10">
          <div className="flex items-center gap-3">
            <Package className="text-gold" size={24} />
            <div>
              <p className="text-white/70 text-sm">Total Orders</p>
              <p className="text-white text-xl font-semibold">{filteredOrders.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-neutral-800 p-4 rounded-lg border border-white/10">
          <div className="flex items-center gap-3">
            <DollarSign className="text-green-400" size={24} />
            <div>
              <p className="text-white/70 text-sm">Total Revenue</p>
              <p className="text-white text-xl font-semibold">
                {formatPrice(filteredOrders.reduce((sum, order) => sum + order.total_price, 0))}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-neutral-800 p-4 rounded-lg border border-white/10">
          <div className="flex items-center gap-3">
            <CheckCircle className="text-blue-400" size={24} />
            <div>
              <p className="text-white/70 text-sm">Confirmed</p>
              <p className="text-white text-xl font-semibold">
                {filteredOrders.filter(order => order.status === 'confirmed').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-neutral-800 p-4 rounded-lg border border-white/10">
          <div className="flex items-center gap-3">
            <Clock className="text-yellow-400" size={24} />
            <div>
              <p className="text-white/70 text-sm">Pending</p>
              <p className="text-white text-xl font-semibold">
                {filteredOrders.filter(order => order.status === 'pending').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-12">
          <Package className="mx-auto mb-4 text-white/30" size={48} />
          <p className="text-white/50">
            {searchTerm || statusFilter !== "all"
              ? "No orders found matching your criteria."
              : "No orders found."
            }
          </p>
        </div>
      ) : (
        <div className="bg-neutral-800 rounded-lg border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10 bg-neutral-900">
                  <th className="text-left p-4 text-white/70 font-medium">Order</th>
                  <th className="text-left p-4 text-white/70 font-medium">Customer</th>
                  <th className="text-left p-4 text-white/70 font-medium">Total</th>
                  <th className="text-left p-4 text-white/70 font-medium">Status</th>
                  <th className="text-left p-4 text-white/70 font-medium">Date</th>
                  <th className="text-left p-4 text-white/70 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => {
                  const statusInfo = getStatusInfo(order.status);
                  const StatusIcon = statusInfo.icon;

                  return (
                    <tr key={order.id} className="border-b border-white/5 hover:bg-neutral-700/50 transition-colors">
                      <td className="p-4">
                        <div>
                          <p className="text-white font-medium">{order.order_number}</p>
                          <p className="text-white/50 text-sm">{order.items?.length || 0} items</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <div>
                          <p className="text-white">{order.customer_first_name} {order.customer_last_name}</p>
                          <p className="text-white/50 text-sm">{order.customer_email}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="text-white font-medium">{formatPrice(order.total_price)}</p>
                        <p className="text-white/50 text-sm">{order.payment_status}</p>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${statusInfo.color}`} />
                          <StatusIcon size={16} className="text-white/70" />
                          <span className="text-white/90 text-sm">{statusInfo.label}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="text-white/90 text-sm">{formatDate(order.created_at)}</p>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openOrderModal(order)}
                            className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded transition-colors"
                            title="View Details"
                          >
                            <Eye size={16} />
                          </button>

                          <select
                            value={order.status}
                            onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                            disabled={updatingStatus === order.id}
                            className="text-xs bg-neutral-700 border border-white/20 text-white rounded px-2 py-1 focus:outline-none focus:border-gold"
                          >
                            {ORDER_STATUSES.map(status => (
                              <option key={status.value} value={status.value}>
                                {status.label}
                              </option>
                            ))}
                          </select>

                          {updatingStatus === order.id && (
                            <RefreshCcw className="animate-spin text-gold" size={16} />
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Order Detail Modal */}
      <Transition appear show={isModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={closeOrderModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/75" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-lg bg-neutral-900 border border-white/20 p-6 text-left align-middle shadow-xl transition-all">
                  {selectedOrder && (
                    <>
                      <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-white mb-6">
                        Order Details: {selectedOrder.order_number}
                      </Dialog.Title>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Customer Information */}
                        <div className="space-y-4">
                          <h4 className="text-white font-medium flex items-center gap-2">
                            <User size={20} className="text-gold" />
                            Customer Information
                          </h4>
                          <div className="bg-neutral-800 p-4 rounded border border-white/10">
                            <p className="text-white font-medium">{selectedOrder.customer_first_name} {selectedOrder.customer_last_name}</p>
                            <p className="text-white/70">{selectedOrder.customer_email}</p>
                          </div>

                          {/* Shipping Address */}
                          {selectedOrder.shipping_address && (
                            <div>
                              <h5 className="text-white/90 font-medium mb-2">Shipping Address</h5>
                              <div className="bg-neutral-800 p-4 rounded border border-white/10 text-sm">
                                <p className="text-white">{selectedOrder.shipping_address.first_name} {selectedOrder.shipping_address.last_name}</p>
                                <p className="text-white/70">{selectedOrder.shipping_address.address_line_1}</p>
                                {selectedOrder.shipping_address.address_line_2 && (
                                  <p className="text-white/70">{selectedOrder.shipping_address.address_line_2}</p>
                                )}
                                <p className="text-white/70">
                                  {selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.state} {selectedOrder.shipping_address.postal_code}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Order Information */}
                        <div className="space-y-4">
                          <h4 className="text-white font-medium flex items-center gap-2">
                            <Package size={20} className="text-gold" />
                            Order Information
                          </h4>
                          <div className="bg-neutral-800 p-4 rounded border border-white/10">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="text-white/70">Status</p>
                                <p className="text-white font-medium">{getStatusInfo(selectedOrder.status).label}</p>
                              </div>
                              <div>
                                <p className="text-white/70">Payment</p>
                                <p className="text-white font-medium">{selectedOrder.payment_status}</p>
                              </div>
                              <div>
                                <p className="text-white/70">Total</p>
                                <p className="text-white font-medium">{formatPrice(selectedOrder.total_price)}</p>
                              </div>
                              <div>
                                <p className="text-white/70">Date</p>
                                <p className="text-white font-medium">{formatDate(selectedOrder.created_at)}</p>
                              </div>
                            </div>
                          </div>

                          {/* Order Items */}
                          <div>
                            <h5 className="text-white/90 font-medium mb-2">Order Items</h5>
                            <div className="space-y-2">
                              {selectedOrder.items?.map((item) => (
                                <div key={item.id} className="bg-neutral-800 p-3 rounded border border-white/10 flex justify-between items-center">
                                  <div>
                                    <p className="text-white font-medium">{item.product_name}</p>
                                    <p className="text-white/70 text-sm">Quantity: {item.quantity}</p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-white font-medium">{formatPrice(item.unit_price * item.quantity)}</p>
                                    <p className="text-white/70 text-sm">{formatPrice(item.unit_price)} each</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 flex justify-end">
                        <button
                          type="button"
                          className="px-4 py-2 bg-neutral-700 hover:bg-neutral-600 text-white rounded transition-colors"
                          onClick={closeOrderModal}
                        >
                          Close
                        </button>
                      </div>
                    </>
                  )}
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}