// app/account/page.tsx - Unified Account Page
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams, useRouter } from "next/navigation";
import { useUser, useAuth } from "@clerk/nextjs";
import {
  LayoutDashboard,
  Package,
  Heart,
  MapPin,
  User,
  Settings,
  Bell,
  Menu,
  X
} from "lucide-react";

// Import all account components
import AccountDashboard from "@/components/account/AccountDashboard";
import OrderHistory from "@/components/account/OrderHistory";
import ProfileSettings from "@/components/account/ProfileSettings";
import WishlistPage from "@/components/wishlist/WishlistPage";
import AddressBook from "@/components/account/AddressBook";
import NotificationSettings from "@/components/account/NotificationSettings";
// import NotificationSettings from "@/components/account/NotificationSettings";

interface TabConfig {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  component: React.ComponentType;
  badge?: number;
}

export default function UnifiedAccountPage() {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Get current tab from URL params
  const currentTab = searchParams?.get('tab') || 'dashboard';

  // Redirect if not signed in
  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/sign-in?redirect_url=/account');
    }
  }, [isLoaded, user, router]);

  // Fetch account data (wishlist count, etc.)
  useEffect(() => {
    const fetchAccountData = async () => {
      if (!user) return;

      try {
        const token = await getToken();

        // Fetch wishlist count
        const wishlistResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/wishlist/stats`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (wishlistResponse.ok) {
          const wishlistData = await wishlistResponse.json();
          setWishlistCount(wishlistData.total_items || 0);
        }
      } catch (error) {
        console.error('Failed to fetch account data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isLoaded && user) {
      fetchAccountData();
    }
  }, [isLoaded, user, getToken]);

  // Tab configuration
  const tabs: TabConfig[] = [
    {
      id: 'dashboard',
      name: 'Dashboard',
      icon: <LayoutDashboard size={20} />,
      description: 'Account overview',
      component: AccountDashboard
    },
    {
      id: 'orders',
      name: 'Orders',
      icon: <Package size={20} />,
      description: 'Order history & tracking',
      component: OrderHistory
    },
    {
      id: 'wishlist',
      name: 'Wishlist',
      icon: <Heart size={20} />,
      description: 'Saved items',
      component: () => <WishlistPage />,
      badge: wishlistCount
    },
    {
      id: 'addresses',
      name: 'Addresses',
      icon: <MapPin size={20} />,
      description: 'Shipping addresses',
      component: () => <AddressBook/>
    },
    {
      id: 'profile',
      name: 'Profile',
      icon: <User size={20} />,
      description: 'Personal information',
      component: ProfileSettings
    },
    {
      id: 'settings',
      name: 'Settings',
      icon: <Settings size={20} />,
      description: 'Account preferences',
      component: () => <div className="p-8 text-center">Settings Component (Coming Soon)</div> // Placeholder
    },
    {
      id: 'notifications',
      name: 'Notifications',
      icon: <Bell size={20} />,
      description: 'Email & SMS preferences',
      component: () => <NotificationSettings />
    }
  ];

  // Handle tab change
  const handleTabChange = (tabId: string) => {
    const params = new URLSearchParams(searchParams?.toString());
    if (tabId === 'dashboard') {
      params.delete('tab'); // Default tab doesn't need param
    } else {
      params.set('tab', tabId);
    }

    const newUrl = params.toString() ? `/account?${params.toString()}` : '/account';
    router.push(newUrl, { scroll: false });
    setIsSidebarOpen(false); // Close mobile sidebar
  };

  // Get current tab config
  const activeTab = tabs.find(tab => tab.id === currentTab) || tabs[0];

  // Show loading while Clerk loads
  if (!isLoaded || isLoading) {
    return <AccountPageSkeleton />;
  }

  // Redirect if no user
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black pt-[var(--navbar-height)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Mobile Menu Button */}
          <div className="lg:hidden">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="flex items-center gap-2 p-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:border-gold transition-colors"
            >
              <Menu size={20} />
              <span className="font-medium">Account Menu</span>
            </button>
          </div>

          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-80 flex-shrink-0">
            <div className="sticky top-[calc(var(--navbar-height)+2rem)]">
              <AccountSidebar
                user={user}
                tabs={tabs}
                activeTab={activeTab.id}
                onTabChange={handleTabChange}
                onClose={() => setIsSidebarOpen(false)}
              />
            </div>
          </aside>

          {/* Mobile Sidebar */}
          <AnimatePresence>
            {isSidebarOpen && (
              <>
                {/* Backdrop */}
                <motion.div
                  className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsSidebarOpen(false)}
                />

                {/* Sidebar */}
                <motion.aside
                  className="fixed top-0 left-0 h-full w-80 bg-white dark:bg-black z-50 lg:hidden shadow-2xl"
                  initial={{ x: "-100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "-100%" }}
                  transition={{ type: "spring", stiffness: 300, damping: 40 }}
                >
                  <div className="h-full overflow-y-auto">
                    <AccountSidebar
                      user={user}
                      tabs={tabs}
                      activeTab={activeTab.id}
                      onTabChange={handleTabChange}
                      onClose={() => setIsSidebarOpen(false)}
                      showCloseButton={true}
                    />
                  </div>
                </motion.aside>
              </>
            )}
          </AnimatePresence>

          {/* Main Content Area */}
          <main className="flex-1 min-w-0">
            {/* Page Header */}
            <motion.div
              className="mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-gold">{activeTab.icon}</span>
                <h1 className="text-3xl font-serif text-black dark:text-white">
                  {activeTab.name}
                </h1>
                {activeTab.badge && activeTab.badge > 0 && (
                  <span className="bg-red-500 text-white text-sm font-bold px-2 py-1 rounded-full">
                    {activeTab.badge}
                  </span>
                )}
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                {activeTab.description}
              </p>
            </motion.div>

            {/* Dynamic Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                <activeTab.component />
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  );
}

// Account Sidebar Component
function AccountSidebar({
  user,
  tabs,
  activeTab,
  onTabChange,
  onClose,
  showCloseButton = false
}: {
  user: any;
  tabs: TabConfig[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  onClose: () => void;
  showCloseButton?: boolean;
}) {
  const { signOut } = useAuth();

  return (
    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      {/* Mobile Close Button */}
      {showCloseButton && (
        <div className="flex justify-end mb-4 lg:hidden">
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>
      )}

      {/* User Profile Section */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
            {user?.imageUrl ? (
              <img
                src={user.imageUrl}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <User size={24} className="text-gray-400" />
              </div>
            )}
          </div>
          <div>
            <h3 className="font-serif text-lg text-black dark:text-white">
              {user?.firstName || "User"}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {user?.primaryEmailAddress?.emailAddress}
            </p>
          </div>
        </div>
        <div className="h-px bg-gray-200 dark:bg-gray-700"></div>
      </div>

      {/* Navigation Tabs */}
      <nav className="space-y-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-300 text-left ${activeTab === tab.id
                ? "bg-gold text-black shadow-md"
                : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
              }`}
          >
            <span className={`${activeTab === tab.id ? "text-black" : "text-gold"
              }`}>
              {tab.icon}
            </span>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-medium">{tab.name}</span>
                {tab.badge && tab.badge > 0 && (
                  <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full min-w-[20px] text-center">
                    {tab.badge > 99 ? '99+' : tab.badge}
                  </span>
                )}
              </div>
              <p className={`text-xs mt-1 ${activeTab === tab.id
                  ? "text-black/70"
                  : "text-gray-500 dark:text-gray-400"
                }`}>
                {tab.description}
              </p>
            </div>
          </button>
        ))}
      </nav>

      {/* Sign Out Button */}
      <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={() => {
            signOut();
            onClose();
          }}
          className="flex items-center gap-3 p-3 w-full text-left rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors"
        >
          <Settings size={20} />
          <span className="font-medium">Sign Out</span>
        </button>
      </div>

      {/* Brand Footer */}
      <div className="mt-6 pt-4 text-center">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Jason & Co.
        </p>
        <p className="text-xs text-gold font-medium">
          WHERE AMBITION MEETS ARTISTRY
        </p>
      </div>
    </div>
  );
}

// Loading Skeleton
function AccountPageSkeleton() {
  return (
    <div className="min-h-screen bg-white dark:bg-black pt-[var(--navbar-height)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Skeleton */}
          <aside className="w-80 flex-shrink-0">
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 animate-pulse">
              <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded mb-6" />
              <div className="space-y-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 rounded" />
                ))}
              </div>
            </div>
          </aside>

          {/* Content Skeleton */}
          <main className="flex-1 min-w-0">
            <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded mb-8 animate-pulse" />
            <div className="space-y-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              ))}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}