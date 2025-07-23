"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useUser, useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Package,
  Heart,
  MapPin,
  CreditCard,
  TrendingUp,
  Clock,
  ShoppingBag,
  Star,
  ArrowRight,
  Calendar
} from "lucide-react";
import AccountLayout from "@/components/account/AccountLayout";

interface OrderSummary {
  total_orders: number;
  total_spent: number;
  recent_orders: Array<{
    order_number: string;
    status: string;
    total_price: number;
    created_at: string;
    item_count: number;
  }>;
}

interface DashboardStats {
  orders: OrderSummary;
  wishlist_count: number;
  addresses_count: number;
}

export default function AccountDashboard() {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const router = useRouter();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Redirect if not signed in
  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/sign-in?redirect_url=/account');
    }
  }, [isLoaded, user, router]);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const token = await getToken();

        // Fetch recent orders from your existing API
        const ordersResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/payment/orders?limit=3`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!ordersResponse.ok) {
          throw new Error('Failed to fetch orders');
        }

        const wishlistResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/wishlist/stats`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        const ordersData = await ordersResponse.json();
        const wishlistData = wishlistResponse.ok ? await wishlistResponse.json() : { total_items: 0 };


        // Calculate stats from orders
        const totalSpent = ordersData.orders?.reduce((sum: number, order: any) => sum + order.total_price, 0) || 0;

        const dashboardStats: DashboardStats = {
          orders: {
            total_orders: ordersData.orders?.length || 0,
            total_spent: totalSpent,
            recent_orders: ordersData.orders || []
          },
          wishlist_count: wishlistData.total_items || 0, // TODO: Implement wishlist API
          addresses_count: 0, // TODO: Implement addresses API
        };

        setStats(dashboardStats);
      } catch (err) {
        console.error('Dashboard data fetch error:', err);
        setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    if (isLoaded && user) {
      fetchDashboardData();
    }
  }, [isLoaded, user, getToken]);

  // Show loading skeleton while Clerk loads
  if (!isLoaded || !user) {
    return (
      <AccountLayout>
        <DashboardSkeleton />
      </AccountLayout>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  return (
    <AccountLayout>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-8"
      >
        {/* Welcome Section */}
        <motion.div variants={itemVariants}>
          <h2 className="text-2xl font-serif text-black dark:text-white mb-2">
            Welcome back, {user.firstName}!
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Here's an overview of your account activity and saved items.
          </p>
        </motion.div>

        {/* Error State */}
        {error && (
          <motion.div
            variants={itemVariants}
            className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
          >
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </motion.div>
        )}

        {/* Stats Grid */}
        {loading ? (
          <DashboardSkeleton />
        ) : (
          <>
            {/* Quick Stats Cards */}
            <motion.div
              variants={itemVariants}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              <StatCard
                icon={<Package className="text-gold" size={24} />}
                title="Total Orders"
                value={stats?.orders.total_orders.toString() || "0"}
                description="Lifetime purchases"
                href="/account/orders"
              />

              <StatCard
                icon={<TrendingUp className="text-green-600" size={24} />}
                title="Total Spent"
                value={`$${stats?.orders.total_spent.toFixed(2) || "0.00"}`}
                description="All-time spending"
                href="/account/orders"
              />

              <StatCard
                icon={<Heart className="text-red-500" size={24} />}
                title="Wishlist Items"
                value={stats?.wishlist_count.toString() || "0"}
                description="Saved for later"
                href="/account/wishlist"
              />

              <StatCard
                icon={<MapPin className="text-blue-600" size={24} />}
                title="Saved Addresses"
                value={stats?.addresses_count.toString() || "0"}
                description="Shipping locations"
                href="/account/addresses"
              />
            </motion.div>

            {/* Recent Orders Section */}
            <motion.div variants={itemVariants}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-serif text-black dark:text-white">
                  Recent Orders
                </h3>
                <Link
                  href="/account/orders"
                  className="text-gold hover:text-gold/80 font-medium text-sm flex items-center gap-1 transition-colors"
                >
                  View All
                  <ArrowRight size={16} />
                </Link>
              </div>

              {stats?.orders.recent_orders.length ? (
                <div className="space-y-4">
                  {stats.orders.recent_orders.map((order, index) => (
                    <RecentOrderCard key={order.order_number} order={order} index={index} />
                  ))}
                </div>
              ) : (
                <EmptyOrdersState />
              )}
            </motion.div>

            {/* Quick Actions */}
            <motion.div variants={itemVariants}>
              <h3 className="text-xl font-serif text-black dark:text-white mb-6">
                Quick Actions
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <QuickActionCard
                  icon={<ShoppingBag className="text-gold" size={24} />}
                  title="Continue Shopping"
                  description="Explore our latest collections"
                  href="/shop"
                />

                <QuickActionCard
                  icon={<Star className="text-purple-600" size={24} />}
                  title="Custom Order"
                  description="Create your perfect piece"
                  href="/custom"
                />

                <QuickActionCard
                  icon={<CreditCard className="text-blue-600" size={24} />}
                  title="Payment Methods"
                  description="Manage your payment options"
                  href="/account/settings"
                />
              </div>
            </motion.div>
          </>
        )}
      </motion.div>
    </AccountLayout>
  );
}

// Stat Card Component
function StatCard({
  icon,
  title,
  value,
  description,
  href
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  description: string;
  href: string;
}) {
  return (
    <Link href={href} className="group">
      <div className="p-6 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gold dark:hover:border-gold transition-all duration-300 hover:shadow-lg">
        <div className="flex items-center gap-4 mb-3">
          {icon}
          <div className="text-2xl font-bold text-black dark:text-white group-hover:text-gold transition-colors">
            {value}
          </div>
        </div>
        <h4 className="font-medium text-black dark:text-white mb-1">
          {title}
        </h4>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {description}
        </p>
      </div>
    </Link>
  );
}

// Recent Order Card Component
function RecentOrderCard({ order, index }: { order: any; index: number }) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'delivered':
        return 'text-green-600 bg-green-50 dark:bg-green-900/20';
      case 'processing':
      case 'confirmed':
        return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20';
      case 'shipped':
        return 'text-purple-600 bg-purple-50 dark:bg-purple-900/20';
      default:
        return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <Link href={`/account/orders/${order.order_number}`}>
        <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-gold dark:hover:border-gold transition-all duration-300 hover:shadow-md">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h4 className="font-medium text-black dark:text-white">
                Order {order.order_number}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                <Calendar size={14} />
                {formatDate(order.created_at)}
              </p>
            </div>
            <div className="text-right">
              <div className="text-lg font-semibold text-gold">
                ${order.total_price.toFixed(2)}
              </div>
              <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </span>
            </div>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {order.item_count} item{order.item_count !== 1 ? 's' : ''}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

// Quick Action Card Component
function QuickActionCard({
  icon,
  title,
  description,
  href
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
}) {
  return (
    <Link href={href} className="group">
      <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-gold dark:hover:border-gold transition-all duration-300 hover:shadow-md">
        <div className="flex items-center gap-3 mb-2">
          {icon}
          <h4 className="font-medium text-black dark:text-white group-hover:text-gold transition-colors">
            {title}
          </h4>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {description}
        </p>
      </div>
    </Link>
  );
}

// Empty Orders State
function EmptyOrdersState() {
  return (
    <div className="text-center py-12 bg-gray-50 dark:bg-gray-900 rounded-lg text-black dark:text-white">
      <Package size={48} className="mx-auto text-gray-400 mb-4" />
      <h4 className="text-lg font-medium mb-2">
        No orders yet
      </h4>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Start exploring our collection to make your first purchase
      </p>
      <Link
        href="/shop"
        className="inline-block bg-gold hover:bg-gold/90 text-black font-medium px-6 py-3 rounded-lg transition-all duration-300 hover:scale-105"
      >
        Start Shopping
      </Link>
    </div>
  );
}

// Loading Skeleton
function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="p-6 bg-gray-50 dark:bg-gray-900 rounded-lg animate-pulse">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-3" />
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
          </div>
        ))}
      </div>

      {/* Recent Orders Skeleton */}
      <div>
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-6" />
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg animate-pulse">
              <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}