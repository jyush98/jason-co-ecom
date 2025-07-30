"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    Users,
    BarChart3,
    Settings,
    FileText,
    TrendingUp,
    Megaphone,
    UserCog,
    Menu,
    X,
    Search,
    Bell,
    LogOut,
    User,
    ChevronDown,
    ChevronRight
} from "lucide-react";
import { UserButton, useUser } from "@clerk/nextjs";
import { NotificationBell } from "../admin/Common";

interface AdminLayoutProps {
    children: React.ReactNode;
}

// Navigation structure matching Epic 8 Phase 2 requirements
const navigationSections = [
    {
        title: "Analytics",
        icon: BarChart3,
        items: [
            { name: "Overview", href: "/admin/analytics", icon: TrendingUp },
            { name: "Revenue", href: "/admin/analytics/revenue", icon: BarChart3 },
            { name: "Customers", href: "/admin/analytics/customers", icon: Users },
            { name: "Products", href: "/admin/analytics/products", icon: Package },
        ]
    },
    {
        title: "Operations",
        icon: Package,
        items: [
            { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
            { name: "Customers", href: "/admin/customers", icon: Users },
            { name: "Inventory", href: "/admin/inventory", icon: Package },
            { name: "Marketing", href: "/admin/marketing", icon: Megaphone },
        ]
    },
    {
        title: "Reports",
        icon: FileText,
        items: [
            { name: "Report Center", href: "/admin/reports", icon: FileText },
            { name: "Custom Reports", href: "/admin/reports/builder", icon: BarChart3 },
            { name: "Scheduled", href: "/admin/reports/scheduled", icon: Settings },
        ]
    },
    {
        title: "System",
        icon: Settings,
        items: [
            { name: "Admin Users", href: "/admin/system/users", icon: UserCog },
            { name: "Settings", href: "/admin/system/settings", icon: Settings },
        ]
    }
];

export default function AdminLayout({ children }: AdminLayoutProps) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [expandedSections, setExpandedSections] = useState<string[]>(["Operations"]); // Default expand Operations
    const [searchQuery, setSearchQuery] = useState("");
    const pathname = usePathname();
    const { user } = useUser();

    // Close sidebar on route change (mobile)
    useEffect(() => {
        setIsSidebarOpen(false);
    }, [pathname]);

    // Determine which sections should be expanded based on current path
    useEffect(() => {
        const currentSection = navigationSections.find(section =>
            section.items.some(item => pathname.startsWith(item.href))
        );

        if (currentSection && !expandedSections.includes(currentSection.title)) {
            setExpandedSections(prev => [...prev, currentSection.title]);
        }
    }, [pathname]);

    const toggleSection = (sectionTitle: string) => {
        setExpandedSections(prev =>
            prev.includes(sectionTitle)
                ? prev.filter(title => title !== sectionTitle)
                : [...prev, sectionTitle]
        );
    };

    const isActiveRoute = (href: string) => {
        if (href === "/admin" && pathname === "/admin") return true;
        if (href !== "/admin" && pathname.startsWith(href)) return true;
        return false;
    };

    const sidebarVariants = {
        hidden: { x: -300, opacity: 0 },
        visible: {
            x: 0,
            opacity: 1,
            transition: { duration: 0.3, ease: "easeOut" }
        }
    };

    const overlayVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1 }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <motion.div
                        className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                        variants={overlayVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        onClick={() => setIsSidebarOpen(false)}
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <aside className={`
        fixed top-0 left-0 z-50 h-full w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 ease-in-out lg:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
                <div className="flex flex-col h-full">
                    {/* Sidebar Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                        <Link href="/admin" className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gold rounded-lg flex items-center justify-center">
                                <span className="text-black font-serif font-bold text-sm">J</span>
                            </div>
                            <div>
                                <h2 className="text-lg font-serif text-black dark:text-white">Jason & Co.</h2>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Admin Panel</p>
                            </div>
                        </Link>

                        {/* Mobile Close Button */}
                        <button
                            onClick={() => setIsSidebarOpen(false)}
                            className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Search Bar */}
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                        <div className="relative">
                            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search admin..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent text-sm transition-colors"
                            />
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 overflow-y-auto p-4">
                        {/* Dashboard Link */}
                        <Link
                            href="/admin"
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-6 transition-all duration-200 ${pathname === "/admin"
                                    ? "bg-gold text-black font-medium shadow-sm"
                                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                }`}
                        >
                            <LayoutDashboard size={20} />
                            <span>Dashboard</span>
                        </Link>

                        {/* Navigation Sections */}
                        <div className="space-y-2">
                            {navigationSections.map((section) => (
                                <div key={section.title}>
                                    {/* Section Header */}
                                    <button
                                        onClick={() => toggleSection(section.title)}
                                        className="w-full flex items-center justify-between px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
                                    >
                                        <div className="flex items-center gap-2">
                                            <section.icon size={16} />
                                            <span>{section.title}</span>
                                        </div>
                                        <motion.div
                                            animate={{ rotate: expandedSections.includes(section.title) ? 90 : 0 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <ChevronRight size={16} />
                                        </motion.div>
                                    </button>

                                    {/* Section Items */}
                                    <AnimatePresence>
                                        {expandedSections.includes(section.title) && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.2 }}
                                                className="overflow-hidden ml-2 border-l-2 border-gray-200 dark:border-gray-700"
                                            >
                                                {section.items.map((item) => (
                                                    <Link
                                                        key={item.href}
                                                        href={item.href}
                                                        className={`flex items-center gap-3 px-6 py-2 text-sm transition-all duration-200 ${isActiveRoute(item.href)
                                                                ? "text-gold font-medium bg-gold/10 border-r-2 border-gold"
                                                                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                                                            }`}
                                                    >
                                                        <item.icon size={16} />
                                                        <span>{item.name}</span>
                                                    </Link>
                                                ))}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ))}
                        </div>
                    </nav>

                    {/* Sidebar Footer */}
                    <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-3 px-4 py-2">
                            <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                {user?.imageUrl ? (
                                    <img src={user.imageUrl} alt="Admin" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <User size={16} className="text-gray-400" />
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                    {user?.firstName} {user?.lastName}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                    Admin
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="lg:ml-64">
                {/* Top Header */}
                <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
                    <div className="flex items-center justify-between">
                        {/* Left Side - Mobile Menu + Breadcrumbs */}
                        <div className="flex items-center gap-4">
                            {/* Mobile Menu Button */}
                            <button
                                onClick={() => setIsSidebarOpen(true)}
                                className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            >
                                <Menu size={20} />
                            </button>

                            {/* Breadcrumbs - Enhanced for Phase 2 */}
                            <nav className="hidden md:block">
                                <ol className="flex items-center space-x-2 text-sm">
                                    <li>
                                        <Link href="/admin" className="text-gray-500 dark:text-gray-400 hover:text-gold transition-colors">
                                            Admin
                                        </Link>
                                    </li>
                                    {pathname !== "/admin" && (
                                        <>
                                            <ChevronRight size={16} className="text-gray-400" />
                                            <li className="text-gray-900 dark:text-gray-100 font-medium capitalize">
                                                {pathname.split("/").pop()?.replace("-", " ")}
                                            </li>
                                        </>
                                    )}
                                </ol>
                            </nav>
                        </div>

                        {/* Right Side - Notifications + User */}
                        <div className="flex items-center gap-4">
                            {/* Notification Bell - NEW INTEGRATION */}
                            <NotificationBell
                                className="hidden sm:block"
                                maxVisible={5}
                                enableSound={true}
                                enableRealtime={true}
                            />

                            {/* User Menu */}
                            <div className="flex items-center gap-3">
                                <UserButton
                                    appearance={{
                                        elements: {
                                            avatarBox: "w-8 h-8",
                                            userButtonPopoverCard: "bg-white dark:bg-gray-800",
                                            userButtonPopoverActionButton: "text-gray-700 dark:text-gray-300 hover:text-gold"
                                        }
                                    }}
                                    afterSignOutUrl="/sign-in"
                                />
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="p-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        {children}
                    </motion.div>
                </main>
            </div>
        </div>
    );
}