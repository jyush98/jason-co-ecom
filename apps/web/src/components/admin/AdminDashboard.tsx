"use client";

import { useState, useEffect } from "react";
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
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [activityLoading, setActivityLoading] = useState(false);

  useEffect(() => {
    if (activeTab === "overview") {
      fetchOrderStats();
      fetchRecentActivity();
    }
  }, [activeTab]);

  const fetchOrderStats = async () => {
    try {
      setStatsLoading(true);
      setStatsError(null);

      const token = await getToken();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/orders/stats/summary`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch stats: ${response.statusText}`);
      }

      const stats = await response.json();
      setOrderStats(stats);
    } catch (err) {
      console.error("Error fetching order stats:", err);
      setStatsError(err instanceof Error ? err.message : "Failed to load statistics");
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchRecentActivity = async () => {
    try {
      setActivityLoading(true);
      const token = await getToken();

      // Fetch recent orders to create activity feed
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

      // Transform orders into activity items
      const activities: RecentActivity[] = data.orders.slice(0, 5).map((order: any, index: number) => {
        const minutesAgo = Math.floor(Math.random() * 300) + 1; // Random 1-300 minutes ago
        const timestamp = new Date(Date.now() - minutesAgo * 60 * 1000);

        return {
          id: order.id,
          type: order.status === 'pending' ? 'order_created' : 'status_update',
          message: order.status === 'pending'
            ? `New order ${order.order_number} received`
            : `Order ${order.order_number} updated to ${order.status}`,
          timestamp: timestamp.toISOString(),
          order_id: order.id,
          order_number: order.order_number
        };
      });

      setRecentActivity(activities);
    } catch (error) {
      console.error('Failed to fetch recent activity:', error);
      // Keep empty array on error
      setRecentActivity([]);
    } finally {
      setActivityLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'text-yellow-400',
      confirmed: 'text-blue-400',
      processing: 'text-purple-400',
      shipped: 'text-green-400',
      delivered: 'text-green-500',
      cancelled: 'text-red-400',
    };
    return colors[status as keyof typeof colors] || 'text-gray-400';
  };

  const getStatusIcon = (status: string) => {
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
  };

  return (
    <main className="min-h-screen bg-black text-white pt-[var(--navbar-height)]">
      {/* Header */}
      <div className="border-b border-white/10 bg-neutral-900/50 backdrop-blur-sm sticky top-[var(--navbar-height)] z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-serif text-white mb-2">Admin Dashboard</h1>
              <p className="text-white/70">Manage your Jason & Co. operations</p>
            </div>

            {/* Last Updated */}
            {orderStats && (
              <div className="text-right">
                <p className="text-white/50 text-sm">Last updated</p>
                <p className="text-white/70 text-sm">
                  {new Date(orderStats.generated_at).toLocaleTimeString()}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Tab Navigation */}
        <div className="flex gap-1 mb-8 bg-neutral-800 p-1 rounded-lg w-fit">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                className={`flex items-center gap-2 px-6 py-3 rounded-md transition-all duration-200 font-medium ${activeTab === tab.key
                  ? "bg-gold text-black shadow-lg"
                  : "text-white/70 hover:text-white hover:bg-white/5"
                  }`}
                onClick={() => setActiveTab(tab.key)}
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
            {/* Overview Stats */}
            {statsLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex items-center gap-3 text-white/70">
                  <RefreshCcw className="animate-spin" size={20} />
                  <span>Loading statistics...</span>
                </div>
              </div>
            ) : statsError ? (
              <div className="text-center py-12">
                <AlertCircle className="mx-auto mb-4 text-red-400" size={48} />
                <p className="text-red-400 mb-4">{statsError}</p>
                <button
                  onClick={fetchOrderStats}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : orderStats ? (
              <>
                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-gradient-to-br from-neutral-800 to-neutral-900 p-6 rounded-lg border border-white/10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-gold/20 rounded-lg">
                        <DollarSign className="text-gold" size={24} />
                      </div>
                      <span className="text-green-400 text-sm font-medium">Total</span>
                    </div>
                    <div>
                      <p className="text-white/70 text-sm mb-1">Total Revenue</p>
                      <p className="text-white text-2xl font-bold">
                        {formatPrice(orderStats.total_revenue)}
                      </p>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-neutral-800 to-neutral-900 p-6 rounded-lg border border-white/10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-blue-500/20 rounded-lg">
                        <Package className="text-blue-400" size={24} />
                      </div>
                      <span className="text-blue-400 text-sm font-medium">Total</span>
                    </div>
                    <div>
                      <p className="text-white/70 text-sm mb-1">Total Orders</p>
                      <p className="text-white text-2xl font-bold">{orderStats.total_orders}</p>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-neutral-800 to-neutral-900 p-6 rounded-lg border border-white/10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-purple-500/20 rounded-lg">
                        <TrendingUp className="text-purple-400" size={24} />
                      </div>
                      <span className="text-green-400 text-sm font-medium">+12.5%</span>
                    </div>
                    <div>
                      <p className="text-white/70 text-sm mb-1">Recent Orders</p>
                      <p className="text-white text-2xl font-bold">{orderStats.recent_orders}</p>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-neutral-800 to-neutral-900 p-6 rounded-lg border border-white/10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-green-500/20 rounded-lg">
                        <CheckCircle className="text-green-400" size={24} />
                      </div>
                      <span className="text-green-400 text-sm font-medium">
                        {orderStats.total_orders > 0
                          ? Math.round((orderStats.status_counts.delivered / orderStats.total_orders) * 100)
                          : 0}%
                      </span>
                    </div>
                    <div>
                      <p className="text-white/70 text-sm mb-1">Delivered</p>
                      <p className="text-white text-2xl font-bold">{orderStats.status_counts.delivered}</p>
                    </div>
                  </div>
                </div>

                {/* Order Status Breakdown */}
                <div className="bg-gradient-to-br from-neutral-800 to-neutral-900 p-6 rounded-lg border border-white/10">
                  <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                    <BarChart3 className="text-gold" size={24} />
                    Order Status Breakdown
                  </h3>

                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {Object.entries(orderStats.status_counts).map(([status, count]) => (
                      <div key={status} className="text-center">
                        <div className={`mx-auto mb-2 p-3 rounded-full bg-white/5 w-fit ${getStatusColor(status)}`}>
                          {getStatusIcon(status)}
                        </div>
                        <p className="text-2xl font-bold text-white mb-1">{count}</p>
                        <p className="text-white/70 text-sm capitalize">{status}</p>
                        {orderStats.total_orders > 0 && (
                          <p className="text-white/50 text-xs">
                            {Math.round((count / orderStats.total_orders) * 100)}%
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-gradient-to-br from-neutral-800 to-neutral-900 p-6 rounded-lg border border-white/10">
                  <h3 className="text-xl font-semibold text-white mb-6">Quick Actions</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <button
                      onClick={() => setActiveTab("orders")}
                      className="flex items-center gap-3 p-4 bg-white/5 hover:bg-white/10 rounded-lg transition-colors text-left group"
                    >
                      <div className="p-2 bg-blue-500/20 rounded group-hover:bg-blue-500/30 transition-colors">
                        <Package className="text-blue-400" size={20} />
                      </div>
                      <div>
                        <p className="text-white font-medium">Manage Orders</p>
                        <p className="text-white/60 text-sm">View and update order status</p>
                      </div>
                    </button>

                    <button
                      onClick={() => setActiveTab("custom-orders")}
                      className="flex items-center gap-3 p-4 bg-white/5 hover:bg-white/10 rounded-lg transition-colors text-left group"
                    >
                      <div className="p-2 bg-purple-500/20 rounded group-hover:bg-purple-500/30 transition-colors">
                        <ShoppingCart className="text-purple-400" size={20} />
                      </div>
                      <div>
                        <p className="text-white font-medium">Custom Orders</p>
                        <p className="text-white/60 text-sm">Review custom requests</p>
                      </div>
                    </button>

                    <button
                      onClick={fetchOrderStats}
                      className="flex items-center gap-3 p-4 bg-white/5 hover:bg-white/10 rounded-lg transition-colors text-left group"
                    >
                      <div className="p-2 bg-green-500/20 rounded group-hover:bg-green-500/30 transition-colors">
                        <RefreshCcw className="text-green-400" size={20} />
                      </div>
                      <div>
                        <p className="text-white font-medium">Refresh Data</p>
                        <p className="text-white/60 text-sm">Update dashboard stats</p>
                      </div>
                    </button>

                    <div className="flex items-center gap-3 p-4 bg-gold/10 rounded-lg">
                      <div className="p-2 bg-gold/20 rounded">
                        <TrendingUp className="text-gold" size={20} />
                      </div>
                      <div>
                        <p className="text-white font-medium">Average Order</p>
                        <p className="text-gold font-bold">
                          {orderStats.total_orders > 0
                            ? formatPrice(orderStats.total_revenue / orderStats.total_orders)
                            : formatPrice(0)
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Activity Preview */}
                <div className="bg-gradient-to-br from-neutral-800 to-neutral-900 p-6 rounded-lg border border-white/10">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-white flex items-center gap-2">
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

                  <div className="space-y-3">
                    {activityLoading ? (
                      <div className="flex items-center justify-center py-4">
                        <RefreshCcw className="animate-spin text-white/50" size={16} />
                        <span className="ml-2 text-white/50 text-sm">Loading activity...</span>
                      </div>
                    ) : recentActivity.length > 0 ? (
                      recentActivity.map((activity) => {
                        const getActivityColor = (type: string) => {
                          switch (type) {
                            case 'order_created': return 'bg-blue-400';
                            case 'status_update': return 'bg-green-400';
                            case 'payment_completed': return 'bg-gold';
                            case 'custom_order': return 'bg-purple-400';
                            default: return 'bg-gray-400';
                          }
                        };

                        const timeAgo = (timestamp: string) => {
                          const diff = Date.now() - new Date(timestamp).getTime();
                          const minutes = Math.floor(diff / 60000);
                          const hours = Math.floor(minutes / 60);

                          if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
                          if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
                          return 'Just now';
                        };

                        return (
                          <div key={activity.id} className="flex items-center justify-between p-3 bg-white/5 rounded">
                            <div className="flex items-center gap-3">
                              <div className={`w-2 h-2 rounded-full ${getActivityColor(activity.type)}`}></div>
                              <span className="text-white/90">{activity.message}</span>
                            </div>
                            <span className="text-white/60 text-sm">{timeAgo(activity.timestamp)}</span>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-white/50 text-sm">No recent activity</p>
                      </div>
                    )}
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