"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import {
  Package,
  User,
  DollarSign,
  Calendar,
  Eye,
  CheckCircle,
  Clock,
  Truck,
  AlertCircle,
  RefreshCcw,
  Edit
} from "lucide-react";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import {
  DataTable,
  LoadingSpinner,
  type DataTableColumn,
  type DataTableAction
} from '@/components/admin/Common';

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
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState<number | null>(null);

  // ✅ DataTable columns configuration with theme-aware styling
  const columns: DataTableColumn<Order>[] = [
    {
      key: 'order_number',
      title: 'Order',
      sortable: true,
      render: (value, order) => (
        <div>
          <p className="text-black dark:text-white font-medium">{order.order_number}</p>
          <p className="text-gray-600 dark:text-gray-400 text-sm">{order.items?.length || 0} items</p>
        </div>
      )
    },
    {
      key: 'customer_email',
      title: 'Customer',
      sortable: true,
      filterable: true,
      filterType: 'text',
      render: (value, order) => (
        <div>
          <p className="text-black dark:text-white">{order.customer_first_name} {order.customer_last_name}</p>
          <p className="text-gray-600 dark:text-gray-400 text-sm">{order.customer_email}</p>
        </div>
      )
    },
    {
      key: 'total_price',
      title: 'Total',
      sortable: true,
      filterable: true,
      filterType: 'number',
      render: (value, order) => (
        <div>
          <p className="text-black dark:text-white font-medium">{formatPrice(order.total_price)}</p>
          <p className="text-gray-600 dark:text-gray-400 text-sm">{order.payment_status}</p>
        </div>
      )
    },
    {
      key: 'status',
      title: 'Status',
      sortable: true,
      filterable: true,
      filterType: 'select',
      filterOptions: ORDER_STATUSES.map(status => ({
        label: status.label,
        value: status.value
      })),
      render: (value, order) => {
        const statusInfo = getStatusInfo(order.status);
        const StatusIcon = statusInfo.icon;
        return (
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${statusInfo.color}`} />
            <StatusIcon size={16} className="text-gray-600 dark:text-gray-400" />
            <span className="text-black dark:text-white text-sm">{statusInfo.label}</span>
          </div>
        );
      }
    },
    {
      key: 'payment_status',
      title: 'Payment',
      sortable: true,
      filterable: true,
      filterType: 'select',
      filterOptions: [
        { label: 'Pending', value: 'pending' },
        { label: 'Completed', value: 'completed' },
        { label: 'Failed', value: 'failed' },
        { label: 'Refunded', value: 'refunded' }
      ],
      render: (value, order) => (
        <span className={`text-sm ${order.payment_status === 'completed' ? 'text-green-600 dark:text-green-400' :
            order.payment_status === 'failed' ? 'text-red-600 dark:text-red-400' :
              order.payment_status === 'refunded' ? 'text-yellow-600 dark:text-yellow-400' :
                'text-gray-600 dark:text-gray-400'
          }`}>
          {order.payment_status}
        </span>
      )
    },
    {
      key: 'created_at',
      title: 'Date',
      sortable: true,
      filterable: true,
      filterType: 'daterange',
      render: (value, order) => (
        <p className="text-black dark:text-white text-sm">{formatDate(order.created_at)}</p>
      )
    }
  ];

  // ✅ DataTable actions configuration
  const actions: DataTableAction<Order>[] = [
    {
      label: 'View Details',
      icon: Eye,
      onClick: (order) => openOrderModal(order),
      variant: 'default'
    },
    {
      label: 'Edit Status',
      icon: Edit,
      onClick: (order) => {
        // You could open a status edit modal here
        console.log('Edit status for order:', order.order_number);
      },
      variant: 'primary'
    }
  ];

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
    }).format(price / 100);
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

  const openOrderModal = (order: Order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const closeOrderModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  // ✅ Handle export with custom data transformation
  const handleExport = useCallback((filteredData: Order[]) => {
    return filteredData.map(order => ({
      'Order Number': order.order_number,
      'Customer Name': `${order.customer_first_name} ${order.customer_last_name}`,
      'Customer Email': order.customer_email,
      'Total Amount': order.total_price,
      'Status': order.status,
      'Payment Status': order.payment_status,
      'Items Count': order.items?.length || 0,
      'Order Date': formatDate(order.created_at),
      'Shipping Address': order.shipping_address ?
        `${order.shipping_address.address_line_1}, ${order.shipping_address.city}, ${order.shipping_address.state}` :
        'N/A'
    }));
  }, []);

  if (loading) {
    return <LoadingSpinner message="Loading orders..." />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <AlertCircle className="mx-auto mb-4 text-red-500 dark:text-red-400" size={48} />
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <button
            onClick={fetchOrders}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 text-white rounded transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* ✅ Theme-aware header */}
      <div className="mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-black dark:text-white mb-2">Order Management</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage and track all customer orders</p>
          </div>
        </div>
      </div>

      {/* ✅ Theme-aware stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <Package className="text-[#D4AF37]" size={24} />
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Total Orders</p>
              <p className="text-black dark:text-white text-xl font-semibold">{orders.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <DollarSign className="text-green-500 dark:text-green-400" size={24} />
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Total Revenue</p>
              <p className="text-black dark:text-white text-xl font-semibold">
                {formatPrice(orders.reduce((sum, order) => sum + order.total_price, 0))}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <CheckCircle className="text-blue-500 dark:text-blue-400" size={24} />
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Confirmed</p>
              <p className="text-black dark:text-white text-xl font-semibold">
                {orders.filter(order => order.status === 'confirmed').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <Clock className="text-yellow-500 dark:text-yellow-400" size={24} />
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Pending</p>
              <p className="text-black dark:text-white text-xl font-semibold">
                {orders.filter(order => order.status === 'pending').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ Enhanced DataTable with built-in FilterBar and all features */}
      <DataTable
        columns={columns}
        data={orders}
        actions={actions}
        isLoading={loading}
        error={error}

        // ✅ Enable advanced filtering (your DataTable's built-in FilterBar)
        enableAdvancedFiltering={true}

        // ✅ Search configuration
        searchable={true}
        searchKeys={['order_number', 'customer_first_name', 'customer_last_name', 'customer_email']}
        searchPlaceholder="Search orders, customers..."

        // ✅ Export functionality
        exportable={true}
        onExport={handleExport}

        // ✅ Refresh functionality
        refreshable={true}
        onRefresh={fetchOrders}

        // ✅ Selection (disabled for now)
        selectable={false}

        // ✅ Pagination
        pagination={{
          enabled: true,
          pageSize: 25,
          showSizeSelector: true
        }}

        // ✅ Quick filters for common use cases
        quickFilters={[
          {
            label: 'Pending Orders',
            filters: { status: 'pending' },
            icon: <Clock size={16} />
          },
          {
            label: 'Confirmed Orders',
            filters: { status: 'confirmed' },
            icon: <CheckCircle size={16} />
          },
          {
            label: 'Today\'s Orders',
            filters: { created_at: new Date().toISOString().split('T')[0] },
            icon: <Calendar size={16} />
          }
        ]}

        // ✅ Customization
        emptyMessage="No orders found. Orders will appear here once customers place them."
        loadingMessage="Loading orders..."
        persistFilters={true}
        storageKey="admin-orders-filters"
        className="mb-6"
      />

      {/* ✅ Theme-aware Order Detail Modal */}
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
                <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-6 text-left align-middle shadow-xl transition-all">
                  {selectedOrder && (
                    <>
                      <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-black dark:text-white mb-6 flex items-center justify-between">
                        <span>Order Details: {selectedOrder.order_number}</span>
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${getStatusInfo(selectedOrder.status).color}`} />
                          <span className="text-sm text-gray-600 dark:text-gray-400">{getStatusInfo(selectedOrder.status).label}</span>
                        </div>
                      </Dialog.Title>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Customer Information */}
                        <div className="space-y-4">
                          <h4 className="text-black dark:text-white font-medium flex items-center gap-2">
                            <User size={20} className="text-[#D4AF37]" />
                            Customer Information
                          </h4>
                          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded border border-gray-200 dark:border-gray-700">
                            <p className="text-black dark:text-white font-medium">{selectedOrder.customer_first_name} {selectedOrder.customer_last_name}</p>
                            <p className="text-gray-600 dark:text-gray-400">{selectedOrder.customer_email}</p>
                          </div>

                          {/* Shipping Address */}
                          {selectedOrder.shipping_address && (
                            <div>
                              <h5 className="text-black dark:text-white font-medium mb-2">Shipping Address</h5>
                              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded border border-gray-200 dark:border-gray-700 text-sm">
                                <p className="text-black dark:text-white">{selectedOrder.shipping_address.first_name} {selectedOrder.shipping_address.last_name}</p>
                                <p className="text-gray-600 dark:text-gray-400">{selectedOrder.shipping_address.address_line_1}</p>
                                {selectedOrder.shipping_address.address_line_2 && (
                                  <p className="text-gray-600 dark:text-gray-400">{selectedOrder.shipping_address.address_line_2}</p>
                                )}
                                <p className="text-gray-600 dark:text-gray-400">
                                  {selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.state} {selectedOrder.shipping_address.postal_code}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Order Information */}
                        <div className="space-y-4">
                          <h4 className="text-black dark:text-white font-medium flex items-center gap-2">
                            <Package size={20} className="text-[#D4AF37]" />
                            Order Information
                          </h4>
                          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded border border-gray-200 dark:border-gray-700">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="text-gray-600 dark:text-gray-400">Status</p>
                                <p className="text-black dark:text-white font-medium">{getStatusInfo(selectedOrder.status).label}</p>
                              </div>
                              <div>
                                <p className="text-gray-600 dark:text-gray-400">Payment</p>
                                <p className="text-black dark:text-white font-medium">{selectedOrder.payment_status}</p>
                              </div>
                              <div>
                                <p className="text-gray-600 dark:text-gray-400">Total</p>
                                <p className="text-black dark:text-white font-medium">{formatPrice(selectedOrder.total_price)}</p>
                              </div>
                              <div>
                                <p className="text-gray-600 dark:text-gray-400">Date</p>
                                <p className="text-black dark:text-white font-medium">{formatDate(selectedOrder.created_at)}</p>
                              </div>
                            </div>
                          </div>

                          {/* Order Items */}
                          <div>
                            <h5 className="text-black dark:text-white font-medium mb-2">Order Items</h5>
                            <div className="space-y-2 max-h-60 overflow-y-auto">
                              {selectedOrder.items?.map((item) => (
                                <div key={item.id} className="bg-gray-50 dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-700 flex justify-between items-center">
                                  <div>
                                    <p className="text-black dark:text-white font-medium">{item.product_name}</p>
                                    <p className="text-gray-600 dark:text-gray-400 text-sm">Quantity: {item.quantity}</p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-black dark:text-white font-medium">{formatPrice(item.unit_price * item.quantity)}</p>
                                    <p className="text-gray-600 dark:text-gray-400 text-sm">{formatPrice(item.unit_price)} each</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Status Update within Modal */}
                          <div>
                            <h5 className="text-black dark:text-white font-medium mb-2">Update Status</h5>
                            <div className="flex items-center gap-3">
                              <select
                                value={selectedOrder.status}
                                onChange={(e) => updateOrderStatus(selectedOrder.id, e.target.value)}
                                disabled={updatingStatus === selectedOrder.id}
                                className="px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-black dark:text-white rounded focus:outline-none focus:border-[#D4AF37]"
                              >
                                {ORDER_STATUSES.map(status => (
                                  <option key={status.value} value={status.value}>
                                    {status.label}
                                  </option>
                                ))}
                              </select>

                              {updatingStatus === selectedOrder.id && (
                                <RefreshCcw className="animate-spin text-[#D4AF37]" size={16} />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 flex justify-end gap-3">
                        <button
                          type="button"
                          className="px-4 py-2 bg-gray-500 hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-700 text-white rounded transition-colors"
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