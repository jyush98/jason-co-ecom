"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useAuth } from "@clerk/nextjs";
import {
  BarChart3,
  Users,
  Package,
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Truck,
  RefreshCcw
} from "lucide-react";
import AdminOrderList from "./AdminOrderList";
import AdminCustomOrderList from "./AdminCustomOrderList";
import { MetricCard, DataTable, FilterBar, MetricData } from "@/components/admin/Common";
import AdvancedAnalytics from "./Analytics/AdvancedAnalytics";

interface OrderStats {
  total_orders: number;
  status_counts: {
    pending: number;
    confirmed: number;
    processing: number;
    shipped: number;
    delivered: number;
    cancelled: number;
  };
  total_revenue: number;
  recent_orders: number;
  generated_at: string;
}

interface RecentActivity {
  id: number;
  type: 'order_created' | 'status_update' | 'payment_completed' | 'custom_order';
  message: string;
  timestamp: string;
  order_id?: number;
  order_number?: string;
  status?: string;
  amount?: number;
}

const tabs = [
  { key: "overview", label: "Overview", icon: BarChart3 },
  { key: "orders", label: "Orders", icon: Package },
  { key: "custom-orders", label: "Custom Orders", icon: ShoppingCart },
];

export default function AdminDashboard() {
  const { getToken } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [orderStats, setOrderStats] = useState<OrderStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [activityLoading, setActivityLoading] = useState(false);

  // 🔧 FIXED: Simple state management - no token storage
  const [filters, setFilters] = useState({
    timeRange: '7d',
    status: 'all'
  });

  // 🔍 DEBUG: Keep tracking for development
  const fetchCountRef = useRef(0);
  const renderCountRef = useRef(0);

  renderCountRef.current++;
  console.log(`🔍 AdminDashboard RENDER #${renderCountRef.current}`);

  const filterConfigs = useMemo(() => [
    {
      key: 'timeRange',
      label: 'Time Range',
      type: 'select' as const,
      options: [
        { label: 'Last 7 days', value: '7d' },
        { label: 'Last 30 days', value: '30d' },
        { label: 'Last 90 days', value: '90d' },
        { label: 'This year', value: '1y' }
      ]
    },
    {
      key: 'status',
      label: 'Status',
      type: 'select' as const,
      options: [
        { label: 'All Statuses', value: 'all' },
        { label: 'Pending', value: 'pending' },
        { label: 'Confirmed', value: 'confirmed' },
        { label: 'Processing', value: 'processing' },
        { label: 'Shipped', value: 'shipped' },
        { label: 'Delivered', value: 'delivered' }
      ]
    }
  ], []);

  // 🔧 FIXED: Direct API functions - no useCallback, no complex dependencies
  const fetchStatsWithToken = async (token: string) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/orders/stats/summary`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch stats: ${response.statusText}`);
    }

    return response.json();
  };

  const fetchActivityWithToken = async (token: string) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/orders/filtered?limit=10&offset=0`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch recent activity');
    }

    const data = await response.json();

    return data.orders.slice(0, 8).map((order: any, index: number) => {
      const minutesAgo = Math.floor(Math.random() * 300) + 1;
      const timestamp = new Date(Date.now() - minutesAgo * 60 * 1000);

      return {
        id: order.id,
        type: order.status === 'pending' ? 'order_created' : 'status_update',
        message: order.status === 'pending'
          ? `New order ${order.order_number} received`
          : `Order ${order.order_number} updated to ${order.status}`,
        timestamp: timestamp.toISOString(),
        order_id: order.id,
        order_number: order.order_number,
        status: order.status,
        amount: order.total_price
      };
    });
  };

  // 🔧 FIXED: Simple data loading function
  const loadDashboardData = async (reason: string = 'unknown') => {
    fetchCountRef.current++;
    console.log(`🚨 LOADING DATA #${fetchCountRef.current}: ${reason}`);

    try {
      setStatsLoading(true);
      setActivityLoading(true);
      setStatsError(null);

      // Get fresh token
      const token = await getToken();
      if (!token) {
        throw new Error('No authentication token available');
      }

      // Fetch both stats and activity with the same token
      const [stats, activities] = await Promise.all([
        fetchStatsWithToken(token),
        fetchActivityWithToken(token)
      ]);

      console.log('🚨 DATA LOADED SUCCESSFULLY');
      setOrderStats(stats);
      setRecentActivity(activities);

    } catch (error) {
      console.error("🚨 LOADING ERROR:", error);
      setStatsError(error instanceof Error ? error.message : "Failed to load data");
      setRecentActivity([]);
    } finally {
      setStatsLoading(false);
      setActivityLoading(false);
    }
  };

  // 🔧 FIXED: Main effect - only depends on primitives
  useEffect(() => {
    console.log('🔍 MAIN EFFECT: Tab changed to', activeTab);

    if (activeTab === "overview") {
      console.log('🔍 MAIN EFFECT: Loading overview data');
      loadDashboardData('tab-change-to-overview');
    }
  }, [activeTab]); // ✅ Only primitive dependency

  // 🔧 FIXED: Filter effect - debounced, but don't depend on orderStats
  useEffect(() => {
    console.log('🔍 FILTER EFFECT: Filters changed', filters);

    // Only refetch if we're on overview tab (removed orderStats dependency to prevent loop)
    if (activeTab === "overview") {
      console.log('🔍 FILTER EFFECT: Setting up debounced reload');

      const timeoutId = setTimeout(() => {
        console.log('🔍 FILTER EFFECT: Debounce triggered - reloading data');
        loadDashboardData('filter-change');
      }, 500);

      return () => {
        console.log('🔍 FILTER EFFECT: Cleaning up timeout');
        clearTimeout(timeoutId);
      };
    }
  }, [filters, activeTab]); // ✅ Removed orderStats dependency to prevent infinite loop

  // 🔧 FIXED: Manual refresh - simple callback
  const handleManualRefresh = () => {
    console.log('🔍 MANUAL REFRESH: Button clicked');
    loadDashboardData('manual-refresh');
  };

  // 🔧 FIXED: Metric refresh - simple callback
  const handleMetricRefresh = () => {
    console.log('🔍 METRIC REFRESH: Metric card refresh');
    loadDashboardData('metric-refresh');
  };

  // 🔧 Utility functions - stable, no dependencies
  const createMetricData = useCallback((
    id: string,
    title: string,
    value: string | number,
    icon: React.ElementType,
    variant: string,
    change?: number,
    changeType?: 'increase' | 'decrease' | 'neutral',
    description?: string
  ): MetricData => ({
    id,
    title,
    value,
    icon,
    change: change !== undefined ? {
      value: change,
      type: changeType || 'neutral',
      period: 'vs last period',
      isPercentage: true
    } : undefined,
    description,
    color: variant === 'revenue' ? '#10B981' :
      variant === 'orders' ? '#3B82F6' :
        variant === 'customers' ? '#8B5CF6' : '#F59E0B'
  }), []);

  const formatPrice = useCallback((price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  }, []);

  const getStatusColor = useCallback((status: string) => {
    const colors = {
      pending: 'text-yellow-400',
      confirmed: 'text-blue-400',
      processing: 'text-purple-400',
      shipped: 'text-green-400',
      delivered: 'text-green-500',
      cancelled: 'text-red-400',
    };
    return colors[status as keyof typeof colors] || 'text-gray-400';
  }, []);

  const getStatusIcon = useCallback((status: string) => {
    const icons = {
      pending: Clock,
      confirmed: CheckCircle,
      processing: Package,
      shipped: Truck,
      delivered: CheckCircle,
      cancelled: AlertCircle,
    };
    const Icon = icons[status as keyof typeof icons] || Clock;
    return <Icon size={20} />;
  }, []);

  const activityColumns = useMemo(() => [
    {
      key: 'type',
      title: 'Type',
      render: (value: string) => {
        const colors = {
          order_created: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
          status_update: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
          payment_completed: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
          custom_order: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
        };
        const labels = {
          order_created: 'Order Created',
          status_update: 'Status Update',
          payment_completed: 'Payment',
          custom_order: 'Custom Order'
        };
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[value as keyof typeof colors]}`}>
            {labels[value as keyof typeof labels]}
          </span>
        );
      }
    },
    {
      key: 'message',
      title: 'Activity',
      className: 'font-medium'
    },
    {
      key: 'order_number',
      title: 'Order',
      render: (value: string) => value ? (
        <code className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs">
          {value}
        </code>
      ) : '-'
    },
    {
      key: 'amount',
      title: 'Amount',
      render: (value: number) => value ? formatPrice(value) : '-',
      align: 'right' as const
    },
    {
      key: 'timestamp',
      title: 'Time',
      render: (value: string) => {
        const diff = Date.now() - new Date(value).getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(minutes / 60);
        if (hours > 0) return `${hours}h ago`;
        if (minutes > 0) return `${minutes}m ago`;
        return 'Just now';
      },
      align: 'right' as const
    }
  ], [formatPrice]);

  const handleFiltersChange = useCallback((newFilters: any) => {
    console.log('🔍 FILTERS CHANGED:', newFilters);
    setFilters(prevFilters => ({ ...prevFilters, ...newFilters }));
  }, []);

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-serif text-black dark:text-white mb-2">Admin Dashboard</h1>
              <p className="text-gray-600 dark:text-gray-400">Manage your Jason & Co. operations</p>
            </div>

            {/* Refresh Button */}
            <button
              onClick={handleManualRefresh}
              className="flex items-center gap-2 px-4 py-2 bg-gold hover:bg-gold/90 text-black rounded-lg transition-colors"
              disabled={statsLoading}
            >
              <RefreshCcw className={statsLoading ? 'animate-spin' : ''} size={16} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Tab Navigation */}
        <div className="flex gap-1 mb-8 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg w-fit">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                className={`flex items-center gap-2 px-6 py-3 rounded-md transition-all duration-200 font-medium ${activeTab === tab.key
                  ? "bg-gold text-black shadow-lg"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                  }`}
                onClick={() => {
                  console.log('🔍 TAB CLICK:', tab.key);
                  setActiveTab(tab.key);
                }}
              >
                <Icon size={20} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            <FilterBar
              configs={filterConfigs}
              onFiltersChange={handleFiltersChange}
              showExport={false}
              compactMode={true}
              maxVisibleFilters={2}
            />

            {/* Overview Stats */}
            {statsLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex items-center gap-3 text-gray-500">
                  <RefreshCcw className="animate-spin" size={20} />
                  <span>Loading statistics...</span>
                </div>
              </div>
            ) : statsError ? (
              <div className="text-center py-12">
                <AlertCircle className="mx-auto mb-4 text-red-500" size={48} />
                <p className="text-red-500 mb-4">{statsError}</p>
                <button
                  onClick={handleManualRefresh}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : orderStats ? (
              <>
                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <MetricCard
                    metric={createMetricData(
                      'total-revenue',
                      'Total Revenue',
                      formatPrice(orderStats.total_revenue),
                      DollarSign,
                      'revenue',
                      Math.floor(Math.random() * 30) - 10,
                      'increase',
                      'Total revenue across all orders'
                    )}
                    variant="detailed"
                    refreshable={true}
                    onRefresh={handleMetricRefresh}
                  />

                  <MetricCard
                    metric={createMetricData(
                      'total-orders',
                      'Total Orders',
                      orderStats.total_orders,
                      Package,
                      'orders',
                      Math.floor(Math.random() * 20) - 5,
                      'increase'
                    )}
                    variant="detailed"
                    clickable={true}
                    onClick={() => setActiveTab("orders")}
                  />

                  <MetricCard
                    metric={createMetricData(
                      'recent-orders',
                      'Recent Orders',
                      orderStats.recent_orders,
                      TrendingUp,
                      'customers',
                      12.5,
                      'increase',
                      'Last 7 days'
                    )}
                    variant="detailed"
                  />

                  <MetricCard
                    metric={createMetricData(
                      'delivered',
                      'Delivered',
                      orderStats.status_counts.delivered,
                      CheckCircle,
                      'inventory',
                      orderStats.total_orders > 0
                        ? Math.round((orderStats.status_counts.delivered / orderStats.total_orders) * 100)
                        : 0,
                      'increase'
                    )}
                    variant="detailed"
                    showTarget={true}
                  />
                </div>

                {/* Average Order Value */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <MetricCard
                    metric={createMetricData(
                      'average-order-value',
                      'Average Order Value',
                      orderStats.total_orders > 0
                        ? formatPrice(orderStats.total_revenue / orderStats.total_orders)
                        : formatPrice(0),
                      DollarSign,
                      'revenue',
                      Math.floor(Math.random() * 15) - 5,
                      'increase',
                      'Per order across all channels'
                    )}
                    size="lg"
                    variant="detailed"
                    exportable={true}
                    onExport={() => console.log("Export AOV data")}
                  />

                  {/* Order Status Breakdown */}
                  <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                    <h3 className="text-xl font-semibold text-black dark:text-white mb-6 flex items-center gap-2">
                      <BarChart3 className="text-gold" size={24} />
                      Order Status Breakdown
                    </h3>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {Object.entries(orderStats.status_counts).map(([status, count]) => (
                        <div key={status} className="text-center p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                          <div className={`mx-auto mb-2 p-3 rounded-full bg-gray-100 dark:bg-gray-800 w-fit ${getStatusColor(status)}`}>
                            {getStatusIcon(status)}
                          </div>
                          <p className="text-2xl font-bold text-black dark:text-white mb-1">{count}</p>
                          <p className="text-gray-600 dark:text-gray-400 text-sm capitalize">{status}</p>
                          {orderStats.total_orders > 0 && (
                            <p className="text-gray-500 dark:text-gray-500 text-xs">
                              {Math.round((count / orderStats.total_orders) * 100)}%
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-black dark:text-white flex items-center gap-2">
                      <Clock className="text-gold" size={24} />
                      Recent Activity
                    </h3>
                    <button
                      onClick={() => setActiveTab("orders")}
                      className="text-gold hover:text-gold/80 text-sm font-medium transition-colors"
                    >
                      View All Orders →
                    </button>
                  </div>

                  <DataTable
                    columns={activityColumns}
                    data={recentActivity}
                    isLoading={activityLoading}
                    pagination={{ enabled: false }}
                    className="border-0"
                    emptyMessage="No recent activity"
                  />
                </div>

                {/* Quick Actions */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                  <h3 className="text-xl font-semibold text-black dark:text-white mb-6">Quick Actions</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <button
                      onClick={() => setActiveTab("orders")}
                      className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-left group"
                    >
                      <div className="p-2 bg-blue-500/20 rounded group-hover:bg-blue-500/30 transition-colors">
                        <Package className="text-blue-500" size={20} />
                      </div>
                      <div>
                        <p className="text-black dark:text-white font-medium">Manage Orders</p>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">View and update order status</p>
                      </div>
                    </button>

                    <button
                      onClick={() => setActiveTab("custom-orders")}
                      className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-left group"
                    >
                      <div className="p-2 bg-purple-500/20 rounded group-hover:bg-purple-500/30 transition-colors">
                        <ShoppingCart className="text-purple-500" size={20} />
                      </div>
                      <div>
                        <p className="text-black dark:text-white font-medium">Custom Orders</p>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">Review custom requests</p>
                      </div>
                    </button>

                    <button
                      onClick={handleManualRefresh}
                      className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-left group"
                    >
                      <div className="p-2 bg-green-500/20 rounded group-hover:bg-green-500/30 transition-colors">
                        <RefreshCcw className="text-green-500" size={20} />
                      </div>
                      <div>
                        <p className="text-black dark:text-white font-medium">Refresh Data</p>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">Update dashboard stats</p>
                      </div>
                    </button>

                    <div className="flex items-center gap-3 p-4 bg-gold/10 rounded-lg">
                      <div className="p-2 bg-gold/20 rounded">
                        <TrendingUp className="text-gold" size={20} />
                      </div>
                      <div>
                        <p className="text-black dark:text-white font-medium">System Status</p>
                        <p className="text-green-600 font-medium text-sm">All Systems Operational</p>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : null}
          </div>
        )}

        {activeTab === "orders" && <AdminOrderList />}
        {activeTab === "custom-orders" && <AdminCustomOrderList />}
      </div>
    </main>
  );
}