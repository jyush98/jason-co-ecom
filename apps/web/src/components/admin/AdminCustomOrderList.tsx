"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import {
  Mail,
  Phone,
  MessageSquare,
  Image as ImageIcon,
  Calendar,
  Eye,
  CheckCircle,
  Clock,
  Star,
  AlertCircle,
  Edit,
  Trash2
} from "lucide-react";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import {
  DataTable,
  LoadingSpinner,
  type DataTableColumn,
  type DataTableAction
} from '@/components/admin/Common';

interface CustomOrder {
  id: number;
  name: string;
  email: string;
  phone: string;
  message: string;
  image_url: string;
  created_at: string;
  status?: string; // For future status management
  priority?: 'low' | 'medium' | 'high'; // For future priority system
}

const CUSTOM_ORDER_STATUSES = [
  { value: 'new', label: 'New Inquiry', color: 'bg-blue-500', icon: Clock },
  { value: 'contacted', label: 'Contacted', color: 'bg-yellow-500', icon: Mail },
  { value: 'quoted', label: 'Quoted', color: 'bg-purple-500', icon: MessageSquare },
  { value: 'in_progress', label: 'In Progress', color: 'bg-orange-500', icon: Star },
  { value: 'completed', label: 'Completed', color: 'bg-green-500', icon: CheckCircle },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-500', icon: AlertCircle },
];

export default function AdminCustomOrderList() {
  const { getToken } = useAuth();
  const [customOrders, setCustomOrders] = useState<CustomOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<CustomOrder | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  // ✅ DataTable columns configuration
  const columns: DataTableColumn<CustomOrder>[] = [
    {
      key: 'name',
      title: 'Customer',
      sortable: true,
      filterable: true,
      filterType: 'text',
      render: (value, order) => (
        <div>
          <p className="text-white font-medium">{order.name}</p>
          <p className="text-white/50 text-sm">{order.email}</p>
        </div>
      )
    },
    {
      key: 'phone',
      title: 'Contact',
      sortable: true,
      filterable: true,
      filterType: 'text',
      render: (value, order) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm">
            <Phone size={14} className="text-white/50" />
            <span className="text-white/90">{order.phone || 'N/A'}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Mail size={14} className="text-white/50" />
            <span className="text-white/70 truncate max-w-[200px]">{order.email}</span>
          </div>
        </div>
      )
    },
    {
      key: 'message',
      title: 'Request Details',
      sortable: false,
      filterable: true,
      filterType: 'text',
      render: (value, order) => (
        <div className="space-y-2">
          <p className="text-white/90 text-sm line-clamp-2 max-w-[300px]">
            {order.message.length > 100
              ? `${order.message.substring(0, 100)}...`
              : order.message
            }
          </p>
          {order.image_url && order.image_url !== "No image uploaded" && (
            <div className="flex items-center gap-1 text-xs text-blue-400">
              <ImageIcon size={12} />
              <span>Has image</span>
            </div>
          )}
        </div>
      )
    },
    {
      key: 'status',
      title: 'Status',
      sortable: true,
      filterable: true,
      filterType: 'select',
      filterOptions: CUSTOM_ORDER_STATUSES.map(status => ({
        label: status.label,
        value: status.value
      })),
      render: (value, order) => {
        const status = order.status || 'new';
        const statusInfo = CUSTOM_ORDER_STATUSES.find(s => s.value === status) || CUSTOM_ORDER_STATUSES[0];
        const StatusIcon = statusInfo.icon;
        return (
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${statusInfo.color}`} />
            <StatusIcon size={16} className="text-white/70" />
            <span className="text-white/90 text-sm">{statusInfo.label}</span>
          </div>
        );
      }
    },
    {
      key: 'created_at',
      title: 'Received',
      sortable: true,
      filterable: true,
      filterType: 'daterange',
      render: (value, order) => (
        <div className="text-white/90 text-sm">
          <p>{formatDate(order.created_at)}</p>
          <p className="text-white/50 text-xs">{formatTimeAgo(order.created_at)}</p>
        </div>
      )
    }
  ];

  // ✅ DataTable actions configuration
  const actions: DataTableAction<CustomOrder>[] = [
    {
      label: 'View Details',
      icon: Eye,
      onClick: (order) => openOrderModal(order),
      variant: 'default'
    },
    {
      label: 'View Image',
      icon: ImageIcon,
      onClick: (order) => {
        if (order.image_url && order.image_url !== "No image uploaded") {
          openImageModal(order.image_url);
        }
      },
      variant: 'primary',
      hidden: (order) => !order.image_url || order.image_url === "No image uploaded"
    },
    {
      label: 'Contact Customer',
      icon: Mail,
      onClick: (order) => {
        window.open(`mailto:${order.email}?subject=Regarding your custom jewelry inquiry`, '_blank');
      },
      variant: 'default'
    }
  ];

  useEffect(() => {
    fetchCustomOrders();
  }, []);

  const fetchCustomOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      // Try with auth first, fall back to no auth if needed
      let headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      try {
        const token = await getToken?.();
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
      } catch (authError) {
        console.log('No auth token available, proceeding without authentication');
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/custom-orders`, {
        headers,
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch custom orders: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("📝 Custom orders fetched:", data.length);

      // Add default status to orders that don't have one
      const ordersWithStatus = data.map((order: CustomOrder) => ({
        ...order,
        status: order.status || 'new'
      }));

      setCustomOrders(ordersWithStatus);
    } catch (err) {
      console.error("Error fetching custom orders:", err);
      setError(err instanceof Error ? err.message : "Failed to load custom orders");
    } finally {
      setLoading(false);
    }
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

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else if (diffInHours < 168) { // 7 days
      return `${Math.floor(diffInHours / 24)}d ago`;
    } else {
      return `${Math.floor(diffInHours / 168)}w ago`;
    }
  };

  const openOrderModal = (order: CustomOrder) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const closeOrderModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  const openImageModal = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setIsImageModalOpen(true);
  };

  const closeImageModal = () => {
    setIsImageModalOpen(false);
    setSelectedImage(null);
  };

  // ✅ Handle export with custom data transformation
  const handleExport = useCallback((filteredData: CustomOrder[]) => {
    return filteredData.map(order => ({
      'Customer Name': order.name,
      'Email': order.email,
      'Phone': order.phone || 'N/A',
      'Request Details': order.message,
      'Has Image': order.image_url && order.image_url !== "No image uploaded" ? 'Yes' : 'No',
      'Status': order.status || 'new',
      'Received Date': formatDate(order.created_at),
      'Days Since Inquiry': Math.floor((new Date().getTime() - new Date(order.created_at).getTime()) / (1000 * 60 * 60 * 24))
    }));
  }, []);

  if (loading) {
    return <LoadingSpinner message="Loading custom orders..." />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <AlertCircle className="mx-auto mb-4 text-red-400" size={48} />
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={fetchCustomOrders}
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
      {/* ✅ Header */}
      <div className="mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">Custom Orders</h1>
            <p className="text-white/70">Manage custom jewelry inquiries and requests</p>
          </div>
        </div>
      </div>

      {/* ✅ Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-neutral-800 p-4 rounded-lg border border-white/10">
          <div className="flex items-center gap-3">
            <MessageSquare className="text-gold" size={24} />
            <div>
              <p className="text-white/70 text-sm">Total Inquiries</p>
              <p className="text-white text-xl font-semibold">{customOrders.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-neutral-800 p-4 rounded-lg border border-white/10">
          <div className="flex items-center gap-3">
            <Clock className="text-blue-400" size={24} />
            <div>
              <p className="text-white/70 text-sm">New Inquiries</p>
              <p className="text-white text-xl font-semibold">
                {customOrders.filter(order => (order.status || 'new') === 'new').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-neutral-800 p-4 rounded-lg border border-white/10">
          <div className="flex items-center gap-3">
            <ImageIcon className="text-purple-400" size={24} />
            <div>
              <p className="text-white/70 text-sm">With Images</p>
              <p className="text-white text-xl font-semibold">
                {customOrders.filter(order => order.image_url && order.image_url !== "No image uploaded").length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-neutral-800 p-4 rounded-lg border border-white/10">
          <div className="flex items-center gap-3">
            <CheckCircle className="text-green-400" size={24} />
            <div>
              <p className="text-white/70 text-sm">Completed</p>
              <p className="text-white text-xl font-semibold">
                {customOrders.filter(order => order.status === 'completed').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ Enhanced DataTable */}
      <DataTable
        columns={columns}
        data={customOrders}
        actions={actions}
        isLoading={loading}
        error={error}

        // ✅ Enable advanced filtering
        enableAdvancedFiltering={true}

        // ✅ Search configuration
        searchable={true}
        searchKeys={['name', 'email', 'phone', 'message']}
        searchPlaceholder="Search customers, email, phone, or message..."

        // ✅ Export functionality
        exportable={true}
        onExport={handleExport}

        // ✅ Refresh functionality
        refreshable={true}
        onRefresh={fetchCustomOrders}

        // ✅ Selection (disabled for now)
        selectable={false}

        // ✅ Pagination
        pagination={{
          enabled: true,
          pageSize: 20,
          showSizeSelector: true
        }}

        // ✅ Quick filters for common use cases
        quickFilters={[
          {
            label: 'New Inquiries',
            filters: { status: 'new' },
            icon: <Clock size={16} />
          },
          {
            label: 'With Images',
            filters: {
              message: {
                custom: (order: CustomOrder) =>
                  order.image_url && order.image_url !== "No image uploaded"
              }
            },
            icon: <ImageIcon size={16} />
          },
          {
            label: 'Recent (7 days)',
            filters: {
              created_at: {
                custom: (order: CustomOrder) => {
                  const weekAgo = new Date();
                  weekAgo.setDate(weekAgo.getDate() - 7);
                  return new Date(order.created_at) >= weekAgo;
                }
              }
            },
            icon: <Calendar size={16} />
          }
        ]}

        // ✅ Customization
        emptyMessage="No custom orders found. Customer inquiries will appear here."
        loadingMessage="Loading custom orders..."
        persistFilters={true}
        storageKey="admin-custom-orders-filters"
        className="mb-6"
      />

      {/* ✅ Order Detail Modal */}
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
                <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-lg bg-neutral-900 border border-white/20 p-6 text-left align-middle shadow-xl transition-all">
                  {selectedOrder && (
                    <>
                      <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-white mb-6">
                        Custom Order Inquiry from {selectedOrder.name}
                      </Dialog.Title>

                      <div className="space-y-6">
                        {/* Customer Information */}
                        <div className="bg-neutral-800 p-4 rounded border border-white/10">
                          <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                            <Mail size={20} className="text-gold" />
                            Customer Information
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-white/70">Name</p>
                              <p className="text-white font-medium">{selectedOrder.name}</p>
                            </div>
                            <div>
                              <p className="text-white/70">Email</p>
                              <p className="text-white font-medium">{selectedOrder.email}</p>
                            </div>
                            <div>
                              <p className="text-white/70">Phone</p>
                              <p className="text-white font-medium">{selectedOrder.phone || 'Not provided'}</p>
                            </div>
                            <div>
                              <p className="text-white/70">Received</p>
                              <p className="text-white font-medium">{formatDate(selectedOrder.created_at)}</p>
                            </div>
                          </div>
                        </div>

                        {/* Request Details */}
                        <div className="bg-neutral-800 p-4 rounded border border-white/10">
                          <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                            <MessageSquare size={20} className="text-gold" />
                            Request Details
                          </h4>
                          <div className="text-white/90 whitespace-pre-line leading-relaxed">
                            {selectedOrder.message}
                          </div>
                        </div>

                        {/* Image */}
                        {selectedOrder.image_url && selectedOrder.image_url !== "No image uploaded" && (
                          <div className="bg-neutral-800 p-4 rounded border border-white/10">
                            <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                              <ImageIcon size={20} className="text-gold" />
                              Inspiration Image
                            </h4>
                            <img
                              src={selectedOrder.image_url}
                              alt="Customer inspiration"
                              onClick={() => openImageModal(selectedOrder.image_url)}
                              className="max-w-xs rounded border border-white/20 cursor-pointer hover:opacity-80 transition-opacity"
                            />
                            <p className="text-white/50 text-xs mt-2">Click to view full size</p>
                          </div>
                        )}
                      </div>

                      <div className="mt-6 flex justify-between">
                        <a
                          href={`mailto:${selectedOrder.email}?subject=Regarding your custom jewelry inquiry`}
                          className="px-4 py-2 bg-gold hover:bg-gold/90 text-black font-medium rounded transition-colors"
                        >
                          Contact Customer
                        </a>
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

      {/* ✅ Image Modal */}
      <Transition appear show={isImageModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={closeImageModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/90" />
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
                <Dialog.Panel className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-lg">
                  {selectedImage && (
                    <img
                      src={selectedImage}
                      alt="Full size inspiration"
                      className="w-full h-full object-contain rounded-lg shadow-2xl cursor-pointer"
                      onClick={closeImageModal}
                    />
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