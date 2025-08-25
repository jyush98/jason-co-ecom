"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { useUser, useAuth } from "@clerk/nextjs";
import type { UserResource } from "@clerk/types";
import Link from "next/link";
import Image from "next/image";
import {
  LayoutDashboard,
  Package,
  Heart,
  MapPin,
  User,
  Settings,
  Bell,
  Menu,
  X,
  LogOut,
  ChevronRight
} from "lucide-react";
import { backdropAnimation, createSidebarAnimation } from "@/lib/animations";

interface AccountLayoutProps {
  children: React.ReactNode;
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ReactNode;
  description?: string;
  badge?: number;
}

export default function AccountLayout({ children }: AccountLayoutProps) {
  const { user } = useUser();
  const { signOut } = useAuth();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [wishlistCount, setWishlistCount] = useState(0);

  // Fetch wishlist count for badge
  useEffect(() => {
    const fetchWishlistCount = async () => {
      // This would be integrated with your wishlist store
      // For now, using placeholder
      setWishlistCount(0);
    };
    fetchWishlistCount();
  }, []);

  const navigationItems: NavItem[] = [
    {
      name: "Dashboard",
      href: "/account",
      icon: <LayoutDashboard size={20} />,
      description: "Account overview"
    },
    {
      name: "Orders",
      href: "/account/orders",
      icon: <Package size={20} />,
      description: "Order history & tracking"
    },
    {
      name: "Wishlist",
      href: "/account/wishlist",
      icon: <Heart size={20} />,
      description: "Saved items",
      badge: wishlistCount
    },
    {
      name: "Addresses",
      href: "/account/addresses",
      icon: <MapPin size={20} />,
      description: "Shipping addresses"
    },
    {
      name: "Profile",
      href: "/account/profile",
      icon: <User size={20} />,
      description: "Personal information"
    },
    {
      name: "Settings",
      href: "/account/settings",
      icon: <Settings size={20} />,
      description: "Account preferences"
    },
    {
      name: "Notifications",
      href: "/account/notifications",
      icon: <Bell size={20} />,
      description: "Email & SMS preferences"
    }
  ];

  const isActive = (href: string) => {
    if (href === "/account") {
      return pathname === "/account";
    }
    return pathname.startsWith(href);
  };

  const sidebarVariants = createSidebarAnimation();
  const backdropVariants = backdropAnimation;


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
              <SidebarContent
                user={user}
                navigationItems={navigationItems}
                isActive={isActive}
                onSignOut={signOut}
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
                  variants={backdropVariants}
                  initial="closed"
                  animate="open"
                  exit="closed"
                  onClick={() => setIsSidebarOpen(false)}
                />

                {/* Sidebar */}
                <motion.aside
                  className="fixed top-0 left-0 h-full w-80 bg-white dark:bg-black z-50 lg:hidden shadow-2xl"
                  variants={sidebarVariants}
                  initial="closed"
                  animate="open"
                  exit="closed"
                >
                  <div className="h-full overflow-y-auto">
                    <SidebarContent
                      user={user}
                      navigationItems={navigationItems}
                      isActive={isActive}
                      onSignOut={signOut}
                      onClose={() => setIsSidebarOpen(false)}
                      showCloseButton={true}
                    />
                  </div>
                </motion.aside>
              </>
            )}
          </AnimatePresence>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

// Sidebar Content Component
function SidebarContent({
  user,
  navigationItems,
  isActive,
  onSignOut,
  onClose,
  showCloseButton = false
}: {
  user: UserResource | null | undefined;
  navigationItems: NavItem[];
  isActive: (href: string) => boolean;
  onSignOut: () => void;
  onClose: () => void;
  showCloseButton?: boolean;
}) {
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
          <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 relative">
            {user?.imageUrl ? (
              <Image
                src={user.imageUrl}
                alt="Profile"
                fill
                className="object-cover"
                sizes="48px"
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

        <div className="h-px bg-gray-200 dark:border-gray-700"></div>
      </div>

      {/* Navigation Menu */}
      <nav className="space-y-2">
        {navigationItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={onClose}
            className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-300 group ${isActive(item.href)
              ? "bg-gold text-black shadow-md"
              : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
              }`}
          >
            <span className={`${isActive(item.href) ? "text-black" : "text-gold"
              }`}>
              {item.icon}
            </span>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-medium">{item.name}</span>
                {item.badge && item.badge > 0 && (
                  <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full min-w-[20px] text-center">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>
              {item.description && (
                <p className={`text-xs mt-1 ${isActive(item.href)
                  ? "text-black/70"
                  : "text-gray-500 dark:text-gray-400"
                  }`}>
                  {item.description}
                </p>
              )}
            </div>

            <ChevronRight
              size={16}
              className={`transition-transform ${isActive(item.href) ? "rotate-90" : "group-hover:translate-x-1"
                }`}
            />
          </Link>
        ))}
      </nav>

      {/* Sign Out Button */}
      <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={() => {
            onSignOut();
            onClose();
          }}
          className="flex items-center gap-3 p-3 w-full text-left rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors group"
        >
          <LogOut size={20} />
          <span className="font-medium">Sign Out</span>
          <ChevronRight size={16} className="ml-auto group-hover:translate-x-1 transition-transform" />
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