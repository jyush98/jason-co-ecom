"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import {
    LayoutDashboard,
    ShoppingCart,
    Users,
    Package,
    TrendingUp,
    MessageSquare,
    Settings,
    Bell,
    Search,
    Menu,
    X,
    ChevronDown,
    Home,
    BarChart3,
    UserCog,
    Archive,
    Megaphone,
    FileText,
    LogOut,
    Crown,
    SearchX,
    Globe,
    Target,
    LineChart
} from "lucide-react";

interface AdminLayoutProps {
    children: React.ReactNode;
}

interface NavigationItem {
    name: string;
    href: string;
    icon: React.ElementType;
    badge?: number;
    subItems?: {
        name: string;
        href: string;
        description?: string;
    }[];
}

interface NavigationSection {
    title: string;
    items: NavigationItem[];
}

export default function AdminLayout({ children }: AdminLayoutProps) {
    const { user } = useUser();
    const pathname = usePathname();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [expandedSections, setExpandedSections] = useState<string[]>(['main']);
    const [notifications, setNotifications] = useState(3); // Mock notification count

    // Enhanced Navigation configuration with SEO & Analytics from Epic 9 Phase 3
    const navigationSections: NavigationSection[] = [
        {
            title: "Main",
            items: [
                {
                    name: "Dashboard",
                    href: "/admin",
                    icon: LayoutDashboard,
                },
                {
                    name: "Orders",
                    href: "/admin/orders",
                    icon: ShoppingCart,
                    badge: 5, // Mock pending orders count
                }
            ]
        },
        {
            title: "Analytics & Growth",
            items: [
                {
                    name: "Analytics",
                    href: "/admin/analytics",
                    icon: TrendingUp,
                    subItems: [
                        { name: "Overview", href: "/admin/analytics", description: "Key metrics and trends" },
                        { name: "Revenue", href: "/admin/analytics/revenue", description: "Revenue deep-dive" },
                        { name: "Customers", href: "/admin/analytics/customers", description: "Customer insights" },
                        { name: "Products", href: "/admin/analytics/products", description: "Product performance" },
                        { name: "Geographic", href: "/admin/analytics/geographic", description: "Geographic analysis" }
                    ]
                },
                {
                    name: "SEO Dashboard",
                    href: "/admin/seo",
                    icon: SearchX,
                    subItems: [
                        { name: "SEO Overview", href: "/admin/seo", description: "SEO performance dashboard" },
                        { name: "Keywords", href: "/admin/seo/keywords", description: "Keyword tracking & optimization" },
                        { name: "Pages", href: "/admin/seo/pages", description: "Page performance analysis" },
                        { name: "Opportunities", href: "/admin/seo/opportunities", description: "SEO improvement opportunities" }
                    ]
                },
                {
                    name: "Performance",
                    href: "/admin/performance",
                    icon: LineChart,
                    subItems: [
                        { name: "Core Web Vitals", href: "/admin/performance", description: "Site speed & performance" },
                        { name: "Image Optimization", href: "/admin/performance/images", description: "Image performance tracking" },
                        { name: "Monitoring", href: "/admin/performance/monitoring", description: "Real-time performance data" }
                    ]
                },
                {
                    name: "Reports",
                    href: "/admin/reports",
                    icon: FileText,
                    subItems: [
                        { name: "Report Center", href: "/admin/reports", description: "All reports" },
                        { name: "Custom Builder", href: "/admin/reports/builder", description: "Build custom reports" },
                        { name: "Scheduled", href: "/admin/reports/scheduled", description: "Automated reports" }
                    ]
                }
            ]
        },
        {
            title: "Operations",
            items: [
                {
                    name: "Customers",
                    href: "/admin/customers",
                    icon: Users,
                    subItems: [
                        { name: "All Customers", href: "/admin/customers", description: "Customer database" },
                        { name: "Segments", href: "/admin/customers/segments", description: "Customer grouping" },
                        { name: "Communication", href: "/admin/customers/communication", description: "Email & messaging" }
                    ]
                },
                {
                    name: "Inventory",
                    href: "/admin/inventory",
                    icon: Package,
                    badge: 2, // Mock low stock alerts
                    subItems: [
                        { name: "Stock Levels", href: "/admin/inventory", description: "Current inventory" },
                        { name: "Adjustments", href: "/admin/inventory/adjustments", description: "Stock changes" },
                        { name: "Alerts", href: "/admin/inventory/alerts", description: "Low stock warnings" }
                    ]
                },
                {
                    name: "Marketing",
                    href: "/admin/marketing",
                    icon: Megaphone,
                    subItems: [
                        { name: "Campaigns", href: "/admin/marketing/campaigns", description: "Email campaigns" },
                        { name: "Promo Codes", href: "/admin/marketing/promos", description: "Discount management" },
                        { name: "A/B Testing", href: "/admin/marketing/testing", description: "Campaign testing" }
                    ]
                }
            ]
        },
        {
            title: "System",
            items: [
                {
                    name: "Settings",
                    href: "/admin/settings",
                    icon: Settings,
                    subItems: [
                        { name: "General", href: "/admin/settings", description: "General settings" },
                        { name: "Users", href: "/admin/settings/users", description: "Admin user management" },
                        { name: "Permissions", href: "/admin/settings/permissions", description: "Role management" },
                        { name: "API Keys", href: "/admin/settings/api", description: "Analytics & SEO API configuration" }
                    ]
                }
            ]
        }
    ];

    // Handle sidebar toggle
    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    // Handle mobile menu toggle
    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    // Handle section expansion
    const toggleSection = (sectionTitle: string) => {
        setExpandedSections(prev =>
            prev.includes(sectionTitle)
                ? prev.filter(title => title !== sectionTitle)
                : [...prev, sectionTitle]
        );
    };

    // Check if path is active
    const isActiveItem = (href: string) => {
        if (href === "/admin") {
            return pathname === "/admin";
        }
        return pathname.startsWith(href);
    };

    // Close mobile menu when route changes
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [pathname]);

    const sidebarVariants = {
        expanded: { width: "280px" },
        collapsed: { width: "80px" }
    };

    const contentVariants = {
        expanded: { marginLeft: "280px" },
        collapsed: { marginLeft: "80px" }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        className="fixed inset-0 z-50 lg:hidden"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <div className="absolute inset-0 bg-black/50" onClick={toggleMobileMenu} />
                        <motion.div
                            className="absolute left-0 top-0 h-full w-80 bg-white dark:bg-gray-800 shadow-xl"
                            initial={{ x: "-100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "-100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        >
                            <AdminSidebar
                                navigationSections={navigationSections}
                                pathname={pathname}
                                expandedSections={expandedSections}
                                toggleSection={toggleSection}
                                isActiveItem={isActiveItem}
                                isMobile={true}
                                onClose={toggleMobileMenu}
                            />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Desktop Sidebar */}
            <motion.div
                className="fixed left-0 top-0 z-40 h-full hidden lg:block"
                variants={sidebarVariants}
                animate={isSidebarOpen ? "expanded" : "collapsed"}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
            >
                <AdminSidebar
                    navigationSections={navigationSections}
                    pathname={pathname}
                    expandedSections={expandedSections}
                    toggleSection={toggleSection}
                    isActiveItem={isActiveItem}
                    isCollapsed={!isSidebarOpen}
                    isMobile={false}
                />
            </motion.div>

            {/* Main Content */}
            <motion.div
                className="lg:transition-all lg:duration-300"
                variants={contentVariants}
                animate={isSidebarOpen ? "expanded" : "collapsed"}
                style={{ marginLeft: 0 }} // Reset for mobile
            >
                {/* Top Header */}
                <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30">
                    <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
                        {/* Left side - Menu controls */}
                        <div className="flex items-center gap-4">
                            {/* Mobile menu button */}
                            <button
                                onClick={toggleMobileMenu}
                                className="lg:hidden p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            >
                                <Menu size={24} />
                            </button>

                            {/* Desktop sidebar toggle */}
                            <button
                                onClick={toggleSidebar}
                                className="hidden lg:block p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            >
                                <Menu size={20} />
                            </button>

                            {/* Enhanced Breadcrumbs with SEO/Analytics context */}
                            <nav className="hidden sm:flex items-center space-x-2 text-sm">
                                <Link
                                    href="/admin"
                                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                >
                                    Admin
                                </Link>
                                {pathname !== "/admin" && (
                                    <>
                                        <span className="text-gray-300 dark:text-gray-600">/</span>
                                        <span className="text-gray-900 dark:text-white font-medium capitalize">
                                            {pathname.includes('/seo') ? 'SEO Dashboard' :
                                                pathname.includes('/analytics') ? 'Analytics' :
                                                    pathname.includes('/performance') ? 'Performance' :
                                                        pathname.split("/").pop()?.replace('-', ' ')}
                                        </span>
                                    </>
                                )}
                            </nav>
                        </div>

                        {/* Right side - Search and user menu */}
                        <div className="flex items-center gap-4">
                            {/* Enhanced Search bar for SEO/Analytics */}
                            <div className="hidden md:block relative">
                                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder={
                                        pathname.includes('/seo') ? "Search keywords, pages..." :
                                            pathname.includes('/analytics') ? "Search metrics, customers..." :
                                                "Search orders, customers..."
                                    }
                                    className="pl-10 pr-4 py-2 w-64 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
                                />
                            </div>

                            {/* Notifications */}
                            <button className="relative p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                                <Bell size={20} />
                                {notifications > 0 && (
                                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                                        {notifications}
                                    </span>
                                )}
                            </button>

                            {/* User menu */}
                            <div className="flex items-center gap-3">
                                <div className="hidden sm:block text-right">
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                        {user?.firstName} {user?.lastName}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        Admin
                                    </p>
                                </div>

                                <div className="w-8 h-8 rounded-full overflow-hidden bg-gold">
                                    {user?.imageUrl ? (
                                        <img
                                            src={user.imageUrl}
                                            alt="Profile"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gold text-black">
                                            <Crown size={16} />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="p-4 sm:p-6 lg:p-8">
                    {children}
                </main>
            </motion.div>
        </div>
    );
}

// Enhanced Sidebar Component with SEO & Analytics
interface AdminSidebarProps {
    navigationSections: NavigationSection[];
    pathname: string;
    expandedSections: string[];
    toggleSection: (section: string) => void;
    isActiveItem: (href: string) => boolean;
    isCollapsed?: boolean;
    isMobile?: boolean;
    onClose?: () => void;
}

function AdminSidebar({
    navigationSections,
    pathname,
    expandedSections,
    toggleSection,
    isActiveItem,
    isCollapsed = false,
    isMobile = false,
    onClose
}: AdminSidebarProps) {
    const [hoveredItem, setHoveredItem] = useState<string | null>(null);

    return (
        <div className="h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
            {/* Sidebar Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                    {(!isCollapsed || isMobile) && (
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gold rounded-lg flex items-center justify-center">
                                <Crown size={20} className="text-black" />
                            </div>
                            <div>
                                <h2 className="text-lg font-serif font-semibold text-gray-900 dark:text-white">
                                    Jason & Co.
                                </h2>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Admin Dashboard
                                </p>
                            </div>
                        </div>
                    )}

                    {isMobile && onClose && (
                        <button
                            onClick={onClose}
                            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                            <X size={20} />
                        </button>
                    )}

                    {isCollapsed && !isMobile && (
                        <div className="w-8 h-8 bg-gold rounded-lg flex items-center justify-center mx-auto">
                            <Crown size={20} className="text-black" />
                        </div>
                    )}
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto p-4 space-y-6">
                {navigationSections.map((section) => (
                    <div key={section.title}>
                        {/* Section Title */}
                        {(!isCollapsed || isMobile) && (
                            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                                {section.title}
                            </h3>
                        )}

                        {/* Section Items */}
                        <div className="space-y-1">
                            {section.items.map((item) => (
                                <div key={item.name}>
                                    {/* Main Item */}
                                    <div className="relative">
                                        {item.subItems ? (
                                            // Expandable item
                                            <button
                                                onClick={() => toggleSection(item.name)}
                                                onMouseEnter={() => setHoveredItem(item.name)}
                                                onMouseLeave={() => setHoveredItem(null)}
                                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${isActiveItem(item.href)
                                                    ? 'bg-gold text-black'
                                                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                                    }`}
                                            >
                                                <item.icon size={20} className="flex-shrink-0" />

                                                {(!isCollapsed || isMobile) && (
                                                    <>
                                                        <span className="flex-1 text-left">{item.name}</span>

                                                        {item.badge && (
                                                            <span className="px-2 py-0.5 text-xs bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 rounded-full">
                                                                {item.badge}
                                                            </span>
                                                        )}

                                                        <ChevronDown
                                                            size={16}
                                                            className={`transition-transform duration-200 ${expandedSections.includes(item.name) ? 'rotate-180' : ''
                                                                }`}
                                                        />
                                                    </>
                                                )}
                                            </button>
                                        ) : (
                                            // Direct link item
                                            <Link
                                                href={item.href}
                                                onMouseEnter={() => setHoveredItem(item.name)}
                                                onMouseLeave={() => setHoveredItem(null)}
                                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${isActiveItem(item.href)
                                                    ? 'bg-gold text-black'
                                                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                                    }`}
                                            >
                                                <item.icon size={20} className="flex-shrink-0" />

                                                {(!isCollapsed || isMobile) && (
                                                    <>
                                                        <span className="flex-1">{item.name}</span>

                                                        {item.badge && (
                                                            <span className="px-2 py-0.5 text-xs bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 rounded-full">
                                                                {item.badge}
                                                            </span>
                                                        )}
                                                    </>
                                                )}
                                            </Link>
                                        )}

                                        {/* Tooltip for collapsed sidebar */}
                                        {isCollapsed && !isMobile && hoveredItem === item.name && (
                                            <div className="absolute left-full top-0 ml-2 z-50">
                                                <div className="bg-gray-900 text-white text-sm rounded-lg px-3 py-2 whitespace-nowrap shadow-lg">
                                                    {item.name}
                                                    {item.badge && (
                                                        <span className="ml-2 px-1.5 py-0.5 text-xs bg-red-500 text-white rounded-full">
                                                            {item.badge}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Sub Items */}
                                    {item.subItems && (!isCollapsed || isMobile) && (
                                        <AnimatePresence>
                                            {expandedSections.includes(item.name) && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: "auto", opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.2 }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="ml-6 mt-1 space-y-1">
                                                        {item.subItems.map((subItem) => (
                                                            <Link
                                                                key={subItem.href}
                                                                href={subItem.href}
                                                                className={`block px-3 py-2 rounded-lg text-sm transition-colors ${pathname === subItem.href
                                                                    ? 'bg-gold/10 text-gold border-l-2 border-gold'
                                                                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
                                                                    }`}
                                                            >
                                                                <div className="font-medium">{subItem.name}</div>
                                                                {subItem.description && (
                                                                    <div className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">
                                                                        {subItem.description}
                                                                    </div>
                                                                )}
                                                            </Link>
                                                        ))}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </nav>

            {/* Sidebar Footer */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                {(!isCollapsed || isMobile) && (
                    <div className="space-y-2">
                        {/* Quick Actions */}
                        <div className="flex gap-2">
                            <Link
                                href="/"
                                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            >
                                <Home size={16} />
                                <span>View Site</span>
                            </Link>

                            <button className="flex items-center justify-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                                <LogOut size={16} />
                                <span>Logout</span>
                            </button>
                        </div>

                        {/* Admin Status */}
                        <div className="flex items-center gap-2 px-3 py-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-xs text-green-700 dark:text-green-400 font-medium">
                                Epic 9 Phase 3 Ready
                            </span>
                        </div>
                    </div>
                )}

                {isCollapsed && !isMobile && (
                    <div className="flex flex-col items-center gap-2">
                        <Link
                            href="/"
                            className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            title="View Site"
                        >
                            <Home size={16} />
                        </Link>

                        <button
                            className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            title="Logout"
                        >
                            <LogOut size={16} />
                        </button>

                        <div className="w-2 h-2 bg-green-500 rounded-full" title="Epic 9 Phase 3 Ready"></div>
                    </div>
                )}
            </div>
        </div>
    );
}