"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Calendar,
    Download,
    RefreshCw,
    TrendingUp,
    Users,
    ShoppingCart,
    DollarSign,
    Package,
    Target,
    Globe,
    Filter,
    ChevronDown,
    ArrowUpRight,
    ArrowDownRight,
    BarChart3,
    PieChart,
    Activity
} from "lucide-react";
import {
    LineChart,
    Line,
    AreaChart,
    Area,
    BarChart,
    Bar,
    PieChart as RechartsPieChart,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    ComposedChart
} from 'recharts';
import DataTable, { DataTableColumn, DataTableAction } from '../Common/DataTable';
import { MetricCardGrid, createRevenueMetric, createOrdersMetric, createCustomersMetric, createInventoryMetric } from '../Common/MetricCard';
import { RevenueChart } from '../Analytics/charts/RevenueChart';
import { formatCurrency, formatGrowth, formatGrowthNumber } from "@/utils/analyticsUtils";

// Types for Analytics
interface AnalyticsData {
    revenue: {
        total: number;
        change: number;
        trend: number[];
        byPeriod: Array<{ date: string; amount: number; orders: number }>;
    };
    orders: {
        total: number;
        change: number;
        target: number;
        conversion: number;
        byStatus: Array<{ status: string; count: number; value: number }>;
    };
    customers: {
        total: number;
        new: number;
        returning: number;
        change: number;
        segments: Array<{ segment: string; count: number; value: number; growth: number }>;
    };
    products: {
        total: number;
        lowStock: number;
        topSelling: Array<{
            id: number;
            name: string;
            sales: number;
            revenue: number;
            growth: number;
            category: string;
        }>;
    };
    geographic: Array<{
        region: string;
        sales: number;
        revenue: number;
        customers: number;
        growth: number;
    }>;
}

interface DateRange {
    start: Date;
    end: Date;
    label: string;
}

interface AnalyticsFilters {
    dateRange: DateRange;
    compareWith?: DateRange;
    segment?: string;
    category?: string;
    region?: string;
}

// Revenue API types
interface RevenueDataPoint {
    date: string;
    revenue: number;
    orders: number;
    averageOrderValue: number;
    previousPeriodRevenue?: number;
}

interface RevenueMetrics {
    totalRevenue: number;
    growth: number;
    totalOrders: number;
    averageOrderValue: number;
    topCategory: string;
}

export default function AdvancedAnalytics() {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filters, setFilters] = useState<AnalyticsFilters>({
        dateRange: {
            start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
            end: new Date(),
            label: "Last 30 Days"
        }
    });
    const [activeTab, setActiveTab] = useState<'overview' | 'revenue' | 'customers' | 'products'>('overview');

    // Revenue chart state
    const [revenueData, setRevenueData] = useState<RevenueDataPoint[] | null>(null);
    const [revenueMetrics, setRevenueMetrics] = useState<RevenueMetrics | null>(null);
    const [revenueLoading, setRevenueLoading] = useState(true);
    const [revenueError, setRevenueError] = useState<string | null>(null);

    // Mock analytics data - replace with real API calls
    const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
        revenue: {
            total: 125480,
            change: 15.3,
            trend: [95000, 102000, 98000, 115000, 125480, 118000, 135000],
            byPeriod: [
                { date: '2024-01-01', amount: 25000, orders: 45 },
                { date: '2024-01-02', amount: 28000, orders: 52 },
                { date: '2024-01-03', amount: 22000, orders: 38 },
                { date: '2024-01-04', amount: 35000, orders: 63 },
                { date: '2024-01-05', amount: 31000, orders: 58 },
                { date: '2024-01-06', amount: 29000, orders: 49 },
                { date: '2024-01-07', amount: 33000, orders: 61 }
            ]
        },
        orders: {
            total: 342,
            change: 8.2,
            target: 400,
            conversion: 3.4,
            byStatus: [
                { status: 'Completed', count: 285, value: 98500 },
                { status: 'Processing', count: 34, value: 15200 },
                { status: 'Shipped', count: 18, value: 8900 },
                { status: 'Cancelled', count: 5, value: 2880 }
            ]
        },
        customers: {
            total: 1247,
            new: 89,
            returning: 158,
            change: 12.3,
            segments: [
                { segment: 'VIP Customers', count: 23, value: 45600, growth: 18.5 },
                { segment: 'Frequent Buyers', count: 156, value: 52300, growth: 8.2 },
                { segment: 'New Customers', count: 89, value: 15400, growth: 25.1 },
                { segment: 'At Risk', count: 34, value: 8900, growth: -12.3 }
            ]
        },
        products: {
            total: 156,
            lowStock: 8,
            topSelling: [
                { id: 1, name: 'Diamond Tennis Bracelet', sales: 45, revenue: 67500, growth: 23.1, category: 'Bracelets' },
                { id: 2, name: 'Gold Chain Necklace', sales: 38, revenue: 45600, growth: 15.8, category: 'Necklaces' },
                { id: 3, name: 'Sapphire Ring', sales: 29, revenue: 58000, growth: 8.9, category: 'Rings' },
                { id: 4, name: 'Pearl Earrings', sales: 34, revenue: 25500, growth: 18.2, category: 'Earrings' },
                { id: 5, name: 'Platinum Watch', sales: 12, revenue: 84000, growth: 45.6, category: 'Watches' }
            ]
        },
        geographic: [
            { region: 'North America', sales: 185, revenue: 78500, customers: 456, growth: 12.5 },
            { region: 'Europe', sales: 98, revenue: 35200, customers: 234, growth: 8.9 },
            { region: 'Asia Pacific', sales: 45, revenue: 18900, customers: 123, growth: 23.4 },
            { region: 'Other', sales: 14, revenue: 6800, customers: 45, growth: 5.2 }
        ]
    });

    // Fetch revenue data from API
    const fetchRevenueData = async () => {
        setRevenueLoading(true);
        setRevenueError(null);
        try {
            const periodParam = getPeriodParam(filters.dateRange.label);
            const response = await fetch(`/api/admin/analytics/revenue?period=${periodParam}&comparison=true`);

            if (!response.ok) {
                throw new Error(`Failed to fetch revenue data: ${response.statusText}`);
            }

            const data = await response.json();
            setRevenueData(data.data);
            setRevenueMetrics(data.metrics);
        } catch (err) {
            console.error('Revenue data fetch error:', err);
            setRevenueError(err instanceof Error ? err.message : 'Failed to load revenue data');
        } finally {
            setRevenueLoading(false);
        }
    };

    // Convert date range label to API period parameter
    const getPeriodParam = (label: string): string => {
        switch (label) {
            case 'Last 7 Days': return '7d';
            case 'Last 30 Days': return '30d';
            case 'Last 90 Days': return '90d';
            case 'This Year': return '1y';
            default: return '30d';
        }
    };

    // Load analytics data
    useEffect(() => {
        const loadAnalytics = async () => {
            setIsLoading(true);
            try {
                // Simulate API call for main analytics
                await new Promise(resolve => setTimeout(resolve, 1500));
                // In real app: const data = await fetchAnalytics(filters);
                setIsLoading(false);
            } catch (err) {
                setError('Failed to load analytics data');
                setIsLoading(false);
            }
        };

        loadAnalytics();
        fetchRevenueData();
    }, [filters]);

    // Key metrics for overview
    const keyMetrics = useMemo(() => [
        createRevenueMetric(
            revenueMetrics?.totalRevenue || analyticsData.revenue.total,
            revenueMetrics?.growth || analyticsData.revenue.change
        ),
        createOrdersMetric(
            revenueMetrics?.totalOrders || analyticsData.orders.total,
            analyticsData.orders.change,
            formatGrowthNumber(analyticsData.orders.target)
        ),
        createCustomersMetric(analyticsData.customers.total, analyticsData.customers.change),
        createInventoryMetric(analyticsData.products.lowStock, 3),
        {
            id: 'conversion',
            title: 'Conversion Rate',
            value: analyticsData.orders.conversion,
            formattedValue: `${formatGrowth(analyticsData.orders.conversion)}`,
            change: {
                value: 0.8,
                type: 'increase' as const,
                period: 'vs last month',
                isPercentage: true
            },
            icon: Target,
            color: 'blue',
            status: 'success' as const
        },
        {
            id: 'aov',
            title: 'Avg Order Value',
            value: revenueMetrics?.averageOrderValue || Math.round(analyticsData.revenue.total / analyticsData.orders.total),
            formattedValue: `${formatCurrency(revenueMetrics?.averageOrderValue || Math.round(analyticsData.revenue.total / analyticsData.orders.total))}`,
            change: {
                value: 12.5,
                type: 'increase' as const,
                period: 'vs last month',
                isPercentage: true
            },
            icon: ArrowUpRight,
            color: 'green',
            status: 'success' as const
        }
    ], [analyticsData, revenueMetrics]);

    // Chart colors
    const chartColors = {
        primary: '#D4AF37', // Gold
        secondary: '#3B82F6', // Blue
        success: '#10B981', // Green
        warning: '#F59E0B', // Amber
        danger: '#EF4444', // Red
        purple: '#8B5CF6'
    };

    // Date range presets
    const dateRangePresets = [
        { label: 'Last 7 Days', days: 7 },
        { label: 'Last 30 Days', days: 30 },
        { label: 'Last 90 Days', days: 90 },
        { label: 'This Year', days: 365 }
    ];

    const handleDateRangeChange = (preset: { label: string; days: number }) => {
        setFilters(prev => ({
            ...prev,
            dateRange: {
                start: new Date(Date.now() - preset.days * 24 * 60 * 60 * 1000),
                end: new Date(),
                label: preset.label
            }
        }));
    };

    const handleRefresh = async () => {
        setIsLoading(true);
        // Simulate refresh
        await new Promise(resolve => setTimeout(resolve, 1000));
        await fetchRevenueData();
        setIsLoading(false);
    };

    const handleRevenueRefresh = () => {
        fetchRevenueData();
    };

    const handleExport = () => {
        // Implement export functionality
        console.log('Exporting analytics data...');
    };

    const handleRevenueExport = () => {
        // Implement revenue data export
        console.log('Exporting revenue data...');
    };

    // Product columns for DataTable
    const productColumns: DataTableColumn[] = [
        {
            key: 'name',
            title: 'Product Name',
            sortable: true,
            render: (value, row) => (
                <div>
                    <div className="font-medium text-gray-900 dark:text-white">{value}</div>
                    <div className="text-sm text-gray-500">{row.category}</div>
                </div>
            )
        },
        {
            key: 'sales',
            title: 'Sales',
            sortable: true,
            align: 'center',
            render: (value) => (
                <span className="font-medium">{value}</span>
            )
        },
        {
            key: 'revenue',
            title: 'Revenue',
            sortable: true,
            align: 'right',
            render: (value) => (
                <span className="font-medium text-green-600">${(value / 1000).toFixed(1)}K</span>
            )
        },
        {
            key: 'growth',
            title: 'Growth',
            sortable: true,
            align: 'center',
            render: (value) => (
                <div className={`flex items-center gap-1 ${value >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {value >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                    <span className="font-medium">{Math.abs(value)}%</span>
                </div>
            )
        }
    ];

    const productActions: DataTableAction[] = [
        {
            label: 'View Details',
            icon: BarChart3,
            onClick: (row) => console.log('View product details:', row),
            variant: 'primary'
        }
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <motion.div
            className="space-y-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {/* Header */}
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-gray-900 dark:text-white">
                        Analytics Dashboard
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Business intelligence and performance insights
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {/* Date Range Selector */}
                    <div className="relative">
                        <select
                            value={filters.dateRange.label}
                            onChange={(e) => {
                                const preset = dateRangePresets.find(p => p.label === e.target.value);
                                if (preset) handleDateRangeChange(preset);
                            }}
                            className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold appearance-none pr-10"
                        >
                            {dateRangePresets.map(preset => (
                                <option key={preset.label} value={preset.label}>
                                    {preset.label}
                                </option>
                            ))}
                        </select>
                        <Calendar size={16} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>

                    <button
                        onClick={handleRefresh}
                        disabled={isLoading}
                        className="p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                    >
                        <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
                    </button>

                    <button
                        onClick={handleExport}
                        className="px-4 py-2 bg-gold hover:bg-gold/90 text-black font-medium rounded-lg transition-colors flex items-center gap-2"
                    >
                        <Download size={16} />
                        Export
                    </button>
                </div>
            </motion.div>

            {/* Key Metrics Grid */}
            <motion.div variants={itemVariants}>
                <MetricCardGrid
                    metrics={keyMetrics}
                    loading={isLoading}
                    columns={6}
                    size="md"
                    variant="default"
                    onMetricClick={(metric) => console.log('Navigate to:', metric.id)}
                    onRefresh={(metricId) => console.log('Refresh metric:', metricId)}
                />
            </motion.div>

            {/* Tab Navigation */}
            <motion.div variants={itemVariants} className="border-b border-gray-200 dark:border-gray-700">
                <nav className="flex space-x-8">
                    {[
                        { id: 'overview', label: 'Overview', icon: Activity },
                        { id: 'revenue', label: 'Revenue', icon: DollarSign },
                        { id: 'customers', label: 'Customers', icon: Users },
                        { id: 'products', label: 'Products', icon: Package }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.id
                                ? 'border-gold text-gold'
                                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                                }`}
                        >
                            <tab.icon size={16} />
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </motion.div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                >
                    {activeTab === 'overview' && (
                        <div className="space-y-8">
                            {/* Revenue Chart - Full Width */}
                            <motion.div variants={itemVariants}>
                                <RevenueChart
                                    data={revenueData || undefined}
                                    metrics={revenueMetrics || undefined}
                                    isLoading={revenueLoading}
                                    error={revenueError}
                                    onRefresh={handleRevenueRefresh}
                                    onExport={handleRevenueExport}
                                />
                            </motion.div>

                            {/* Other Analytics Charts */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Order Status Distribution */}
                                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Order Status</h3>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <RechartsPieChart>
                                            <Tooltip formatter={(value: any) => [value, 'Orders']} />
                                            <RechartsPieChart data={analyticsData.orders.byStatus}>
                                                {analyticsData.orders.byStatus.map((entry, index) => (
                                                    <Cell
                                                        key={`cell-${index}`}
                                                        fill={[chartColors.success, chartColors.warning, chartColors.secondary, chartColors.danger][index]}
                                                    />
                                                ))}
                                            </RechartsPieChart>
                                            <Legend />
                                        </RechartsPieChart>
                                    </ResponsiveContainer>
                                </div>

                                {/* Customer Segments */}
                                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Customer Segments</h3>
                                    <div className="space-y-4">
                                        {analyticsData.customers.segments.map((segment, index) => (
                                            <div key={segment.segment} className="flex items-center justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                            {segment.segment}
                                                        </span>
                                                        <span className="text-sm text-gray-500">
                                                            {segment.count} customers
                                                        </span>
                                                    </div>
                                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                                        <div
                                                            className={`h-2 rounded-full bg-${['green', 'blue', 'purple', 'red'][index]}-500`}
                                                            style={{ width: `${(segment.value / 52300) * 100}%` }}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="ml-4 text-right">
                                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                        ${(segment.value / 1000).toFixed(1)}K
                                                    </div>
                                                    <div className={`text-xs ${segment.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                        {segment.growth >= 0 ? '+' : ''}{segment.growth}%
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Geographic Distribution */}
                                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 lg:col-span-2">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Sales by Region</h3>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={analyticsData.geographic} layout="horizontal">
                                            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                                            <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                                            <YAxis
                                                type="category"
                                                dataKey="region"
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fontSize: 12 }}
                                                width={100}
                                            />
                                            <Tooltip formatter={(value: any) => [value, 'Sales']} />
                                            <Bar dataKey="sales" fill={chartColors.secondary} radius={[0, 4, 4, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'revenue' && (
                        <div className="space-y-8">
                            {/* Full Revenue Analytics */}
                            <motion.div variants={itemVariants}>
                                <RevenueChart
                                    data={revenueData || undefined}
                                    metrics={revenueMetrics || undefined}
                                    isLoading={revenueLoading}
                                    error={revenueError}
                                    onRefresh={handleRevenueRefresh}
                                    onExport={handleRevenueExport}
                                />
                            </motion.div>

                            {/* Revenue vs Orders Combined Chart */}
                            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Revenue vs Orders</h3>
                                <ResponsiveContainer width="100%" height={400}>
                                    <ComposedChart data={analyticsData.revenue.byPeriod}>
                                        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                                        <XAxis
                                            dataKey="date"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fontSize: 12 }}
                                            tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                        />
                                        <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                                        <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                                        <Tooltip />
                                        <Bar yAxisId="left" dataKey="amount" fill={chartColors.primary} name="Revenue" />
                                        <Line yAxisId="right" type="monotone" dataKey="orders" stroke={chartColors.secondary} strokeWidth={3} name="Orders" />
                                    </ComposedChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    )}

                    {activeTab === 'products' && (
                        <div className="space-y-8">
                            {/* Top Selling Products */}
                            <DataTable
                                columns={productColumns}
                                data={analyticsData.products.topSelling}
                                actions={productActions}
                                isLoading={isLoading}
                                searchable={true}
                                exportable={true}
                                pagination={{ enabled: false }}
                                className="bg-white dark:bg-gray-800"
                            />
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
        </motion.div>
    );
}