"use client";

import { useState } from "react";
import { useUser, SignOutButton } from "@clerk/nextjs";
import {
    Menu,
    X,
    Home,
    Package,
    ShoppingCart,
    Users,
    BarChart3,
    Settings,
    LogOut,
    Crown,
    Bell
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

interface AdminLayoutProps {
    children: React.ReactNode;
    currentPage?: string;
}

const navigationItems = [
    {
        key: "overview",
        label: "Overview",
        icon: BarChart3,
        href: "/admin",
        description: "Dashboard and analytics"
    },
    {
        key: "orders",
        label: "Orders",
        icon: Package,
        href: "/admin/orders",
        description: "Manage customer orders"
    },
    {
        key: "custom-orders",
        label: "Custom Orders",
        icon: ShoppingCart,
        href: "/admin/custom-orders",
        description: "Custom jewelry requests"
    },
    {
        key: "customers",
        label: "Customers",
        icon: Users,
        href: "/admin/customers",
        description: "Customer management"
    },
    {
        key: "analytics",
        label: "Analytics",
        icon: BarChart3,
        href: "/admin/analytics",
        description: "Business insights"
    },
];

export default function AdminLayout({ children, currentPage = "overview" }: AdminLayoutProps) {
    const { user } = useUser();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [notifications] = useState([
        { id: 1, text: "New order pending review", time: "2 min ago", unread: true },
        { id: 2, text: "Custom order submitted", time: "1 hour ago", unread: true },
        { id: 3, text: "Payment processed", time: "3 hours ago", unread: false },
    ]);

    const unreadCount = notifications.filter(n => n.unread).length;

    return (
        <div className="min-h-screen bg-black text-white">
            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {sidebarOpen && (
                    <>
                        <motion.div
                            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSidebarOpen(false)}
                        />

                        <motion.div
                            className="fixed inset-y-0 left-0 w-64 bg-neutral-900 border-r border-white/10 z-50 lg:hidden"
                            initial={{ x: -256 }}
                            animate={{ x: 0 }}
                            exit={{ x: -256 }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        >
                            <AdminSidebar onNavigate={() => setSidebarOpen(false)} currentPage={currentPage} />
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Desktop Sidebar */}
            <div className="hidden lg:block fixed inset-y-0 left-0 w-64 bg-neutral-900 border-r border-white/10 z-30">
                <AdminSidebar currentPage={currentPage} />
            </div>

            {/* Main Content */}
            <div className="lg:ml-64">
                {/* Top Header */}
                <header className="sticky top-0 z-20 bg-black/80 backdrop-blur-sm border-b border-white/10">
                    <div className="flex items-center justify-between h-16 px-4 sm:px-6">
                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden p-2 text-white/70 hover:text-white hover:bg-white/10 rounded transition-colors"
                        >
                            <Menu size={24} />
                        </button>

                        {/* Page Title */}
                        <div className="flex-1 lg:flex-none">
                            <h1 className="text-lg font-semibold text-white lg:hidden">
                                Admin Dashboard
                            </h1>
                        </div>

                        {/* Right Side */}
                        <div className="flex items-center gap-4">
                            {/* Notifications */}
                            <div className="relative">
                                <button className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded transition-colors relative">
                                    <Bell size={20} />
                                    {unreadCount > 0 && (
                                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                                            {unreadCount}
                                        </span>
                                    )}
                                </button>
                            </div>

                            {/* User Menu */}
                            <div className="flex items-center gap-3">
                                <div className="hidden sm:block text-right">
                                    <p className="text-white font-medium">{user?.firstName} {user?.lastName}</p>
                                    <p className="text-white/60 text-xs">Administrator</p>
                                </div>

                                <div className="relative">
                                    {user?.imageUrl ? (
                                        <img
                                            src={user.imageUrl}
                                            alt="Profile"
                                            className="w-8 h-8 rounded-full border border-white/20"
                                        />
                                    ) : (
                                        <div className="w-8 h-8 bg-gold rounded-full flex items-center justify-center">
                                            <Crown size={16} className="text-black" />
                                        </div>
                                    )}
                                </div>

                                <SignOutButton>
                                    <button className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded transition-colors">
                                        <LogOut size={18} />
                                    </button>
                                </SignOutButton>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1">
                    {children}
                </main>
            </div>
        </div>
    );
}

function AdminSidebar({
    onNavigate,
    currentPage
}: {
    onNavigate?: () => void;
    currentPage: string;
}) {
    return (
        <div className="flex flex-col h-full">
            {/* Logo/Brand */}
            <div className="flex items-center gap-3 p-6 border-b border-white/10">
                <div className="w-8 h-8 bg-gold rounded flex items-center justify-center">
                    <Crown size={20} className="text-black" />
                </div>
                <div>
                    <h2 className="text-white font-serif text-lg">Jason & Co.</h2>
                    <p className="text-white/60 text-xs">Admin Dashboard</p>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4">
                <div className="space-y-2">
                    {navigationItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = currentPage === item.key;

                        return (
                            <Link
                                key={item.key}
                                href={item.href}
                                onClick={onNavigate}
                                className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group ${isActive
                                        ? "bg-gold text-black shadow-lg"
                                        : "text-white/70 hover:text-white hover:bg-white/5"
                                    }`}
                            >
                                <Icon size={20} className={isActive ? "text-black" : "text-white/70 group-hover:text-white"} />
                                <div className="flex-1">
                                    <p className={`font-medium ${isActive ? "text-black" : "text-white/90"}`}>
                                        {item.label}
                                    </p>
                                    <p className={`text-xs ${isActive ? "text-black/70" : "text-white/50"}`}>
                                        {item.description}
                                    </p>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-white/10">
                <Link
                    href="/admin/settings"
                    className="flex items-center gap-3 px-3 py-2 text-white/70 hover:text-white hover:bg-white/5 rounded transition-colors"
                >
                    <Settings size={18} />
                    <span className="text-sm">Settings</span>
                </Link>

                <div className="mt-4 p-3 bg-white/5 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span className="text-white/90 text-sm font-medium">System Status</span>
                    </div>
                    <p className="text-white/60 text-xs">All systems operational</p>
                </div>
            </div>
        </div>
    );
}