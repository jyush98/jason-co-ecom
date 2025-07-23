"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useUser, useClerk } from "@clerk/nextjs";
import { 
  User, 
  Package, 
  Heart, 
  MapPin, 
  Settings, 
  LogOut,
  Menu,
  X,
  ChevronRight
} from "lucide-react";

interface AccountLayoutProps {
  children: React.ReactNode;
}

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  description: string;
}

export default function AccountLayout({ children }: AccountLayoutProps) {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Navigation items
  const navItems: NavItem[] = [
    {
      href: "/account",
      label: "Dashboard",
      icon: <User size={20} />,
      description: "Account overview and stats"
    },
    {
      href: "/account/orders",
      label: "Order History",
      icon: <Package size={20} />,
      description: "View your past orders"
    },
    {
      href: "/account/wishlist",
      label: "Wishlist",
      icon: <Heart size={20} />,
      description: "Saved items for later"
    },
    {
      href: "/account/addresses",
      label: "Addresses",
      icon: <MapPin size={20} />,
      description: "Manage shipping addresses"
    },
    {
      href: "/account/settings",
      label: "Settings",
      icon: <Settings size={20} />,
      description: "Account preferences"
    }
  ];

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Handle sign out
  const handleSignOut = () => {
    signOut();
  };

  // Loading state
  if (!isLoaded) {
    return <AccountLayoutSkeleton />;
  }

  // Not signed in - redirect handled by page components
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black pt-[var(--navbar-height)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-serif text-black dark:text-white">
                My Account
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                WHERE AMBITION MEETS ARTISTRY
              </p>
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* User Welcome */}
          <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <div className="w-12 h-12 bg-gold rounded-full flex items-center justify-center">
              <User size={24} className="text-black" />
            </div>
            <div>
              <p className="text-lg font-medium text-black dark:text-white">
                Welcome back, {user.firstName || 'Valued Customer'}!
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {user.primaryEmailAddress?.emailAddress}
              </p>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Desktop Sidebar Navigation */}
          <div className="hidden lg:block lg:col-span-3">
            <AccountSidebar 
              navItems={navItems}
              currentPath={pathname}
              onSignOut={handleSignOut}
            />
          </div>

          {/* Mobile Navigation Menu */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div
                className="lg:hidden fixed inset-0 z-50 bg-black/50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <motion.div
                  className="absolute top-0 left-0 w-80 h-full bg-white dark:bg-black shadow-xl"
                  initial={{ x: -320 }}
                  animate={{ x: 0 }}
                  exit={{ x: -320 }}
                  transition={{ type: "spring", damping: 25, stiffness: 200 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-serif">Account Menu</h2>
                      <button
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                      >
                        <X size={20} />
                      </button>
                    </div>
                  </div>

                  <div className="p-6">
                    <AccountSidebar 
                      navItems={navItems}
                      currentPath={pathname}
                      onSignOut={handleSignOut}
                      mobile={true}
                    />
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main Content Area */}
          <div className="lg:col-span-9">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {children}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Sidebar Component
function AccountSidebar({ 
  navItems, 
  currentPath, 
  onSignOut, 
  mobile = false 
}: {
  navItems: NavItem[];
  currentPath: string;
  onSignOut: () => void;
  mobile?: boolean;
}) {
  return (
    <div className="space-y-2">
      {navItems.map((item) => {
        const isActive = currentPath === item.href || 
          (item.href !== "/account" && currentPath.startsWith(item.href));

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`
              group flex items-center gap-3 p-4 rounded-lg transition-all duration-300
              ${isActive
                ? 'bg-gold text-black'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }
            `}
          >
            <div className={`
              flex items-center justify-center
              ${isActive ? 'text-black' : 'text-gray-500 group-hover:text-current'}
            `}>
              {item.icon}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className={`font-medium ${isActive ? 'text-black' : ''}`}>
                {item.label}
              </div>
              {!mobile && (
                <div className={`text-xs mt-1 ${
                  isActive 
                    ? 'text-black/70' 
                    : 'text-gray-500 dark:text-gray-400'
                }`}>
                  {item.description}
                </div>
              )}
            </div>

            {!isActive && (
              <ChevronRight 
                size={16} 
                className="text-gray-400 group-hover:text-current opacity-0 group-hover:opacity-100 transition-opacity" 
              />
            )}
          </Link>
        );
      })}

      {/* Sign Out Button */}
      <div className="pt-4 mt-6 border-t border-gray-200 dark:border-gray-800">
        <button
          onClick={onSignOut}
          className="w-full flex items-center gap-3 p-4 text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 rounded-lg transition-all duration-300"
        >
          <LogOut size={20} />
          <span className="font-medium">Sign Out</span>
        </button>
      </div>
    </div>
  );
}

// Loading Skeleton
function AccountLayoutSkeleton() {
  return (
    <div className="min-h-screen bg-white dark:bg-black pt-[var(--navbar-height)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          {/* Header Skeleton */}
          <div className="mb-8">
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-64 mb-4" />
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-96 mb-6" />
            <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>

          {/* Content Grid Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="hidden lg:block lg:col-span-3">
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded" />
                ))}
              </div>
            </div>
            <div className="lg:col-span-9">
              <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}