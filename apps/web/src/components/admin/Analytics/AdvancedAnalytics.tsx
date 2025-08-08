// components/admin/Analytics/AdvancedAnalytics.tsx
'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BarChart3,
    Users,
    ShoppingBag,
    TrendingUp,
    UserPlus,
    Repeat,
    DollarSign,
    Target,
    Award,
    Globe,
    RefreshCw,
    AlertTriangle,
    Package
} from 'lucide-react';

// Import your existing components
import { RevenueChart } from './charts/RevenueChart';
import GeographicChart from './charts/GeographicChart';
import ProductPerformaceChart from './charts/ProductPerformanceChart';
import { MetricCard } from '../Common';
import { ExportButton } from '../Common';

// Import your existing hooks
import { useCustomerAnalytics, useRevenueAnalytics, useProductAnalytics, useGeographicAnalytics } from '@/lib/hooks/useAnalytics';

const AdvancedAnalytics: React.FC = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [timeRange, setTimeRange] = useState('30d');

    // Data hooks - fixed to use singular API routes
    const customerData = useCustomerAnalytics(timeRange);
    const revenueData = useRevenueAnalytics(timeRange);
    const productData = useProductAnalytics(timeRange, 'revenue');
    const geographicData = useGeographicAnalytics(timeRange);

    // Tab configuration
    const tabs = [
        {
            id: 'overview',
            label: 'Dashboard Overview',
            icon: BarChart3,
            description: 'Key metrics and performance summary'
        },
        {
            id: 'revenue',
            label: 'Revenue Intelligence',
            icon: DollarSign,
            description: 'Revenue trends, forecasting, and financial insights'
        },
        {
            id: 'customers',
            label: 'Customer Intelligence',
            icon: Users,
            description: 'Customer behavior, retention, and lifetime value'
        },
        {
            id: 'products',
            label: 'Product Analytics',
            icon: ShoppingBag,
            description: 'Product performance and inventory insights'
        },
        {
            id: 'geographic',
            label: 'Geographic Analysis',
            icon: Globe,
            description: 'Regional performance and market analysis'
        }
    ];

    const timeRangeOptions = [
        { value: '7d', label: 'Last 7 days' },
        { value: '30d', label: 'Last 30 days' },
        { value: '90d', label: 'Last 90 days' },
        { value: '365d', label: 'Last year' }
    ];

    const refreshAll = () => {
        customerData.refetch();
        revenueData.refetch();
        productData.refetch();
        geographicData.refetch();
    };

    return (
        <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Sticky Header */}
            <div className="pt-[var(--navbar-height)] bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-6 py-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                Business Intelligence Dashboard
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400 mt-1">
                                Comprehensive analytics and insights for your luxury jewelry business
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            {/* Time Range Selector */}
                            <select
                                value={timeRange}
                                onChange={(e) => setTimeRange(e.target.value)}
                                className="px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                {timeRangeOptions.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>

                            {/* Refresh All Button */}
                            <button
                                onClick={refreshAll}
                                className="p-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                            >
                                <RefreshCw className="h-4 w-4" />
                            </button>

                            {/* Export Button */}
                            <ExportButton
                                onExport={async () => {
                                    // Export overview data
                                    const data = {
                                        timeRange,
                                        customers: customerData.data,
                                        revenue: revenueData.data,
                                        products: productData.data,
                                        geographic: geographicData.data
                                    };

                                    const csvData = `Export Type,Data,Timestamp\nAnalytics Dashboard,${JSON.stringify(data)},${new Date().toISOString()}`;
                                    const blob = new Blob([csvData], { type: 'text/csv' });
                                    const url = URL.createObjectURL(blob);
                                    const a = document.createElement('a');
                                    a.href = url;
                                    a.download = `dashboard-export-${timeRange}.csv`;
                                    a.click();
                                    URL.revokeObjectURL(url);
                                }}
                                data={[]}
                                className="px-4 py-2 text-white"
                            />
                        </div>
                    </div>

                    {/* Tab Navigation */}
                    <div className="mt-6">
                        <div className="border-b border-gray-200 dark:border-gray-700">
                            <nav className="flex space-x-8 overflow-x-auto">
                                {tabs.map((tab) => {
                                    const Icon = tab.icon;
                                    const isActive = activeTab === tab.id;

                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`group relative min-w-0 overflow-hidden py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-all ${isActive
                                                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                                                }`}
                                        >
                                            <div className="flex items-center gap-2">
                                                <Icon className="h-5 w-5" />
                                                <span>{tab.label}</span>
                                            </div>

                                            {/* Tooltip on hover */}
                                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-normal w-48 text-center z-50">
                                                {tab.description}
                                            </div>
                                        </button>
                                    );
                                })}
                            </nav>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        {activeTab === 'overview' && (
                            <OverviewTab
                                timeRange={timeRange}
                                customerData={customerData}
                                revenueData={revenueData}
                                productData={productData}
                                geographicData={geographicData}
                            />
                        )}
                        {activeTab === 'revenue' && (
                            <RevenueIntelligenceTab
                                data={revenueData.data}
                                isLoading={revenueData.isLoading}
                                error={revenueData.error}
                                timeRange={timeRange}
                                onRefresh={revenueData.refetch}
                            />
                        )}
                        {activeTab === 'customers' && (
                            <CustomerIntelligenceTab
                                data={customerData.data}
                                isLoading={customerData.isLoading}
                                error={customerData.error}
                                timeRange={timeRange}
                                onRefresh={customerData.refetch}
                            />
                        )}
                        {activeTab === 'products' && (
                            <ProductAnalyticsTab
                                data={productData.data}
                                isLoading={productData.isLoading}
                                error={productData.error}
                                timeRange={timeRange}
                                onRefresh={productData.refetch}
                            />
                        )}
                        {activeTab === 'geographic' && (
                            <GeographicAnalysisTab
                                data={geographicData.data}
                                isLoading={geographicData.isLoading}
                                error={geographicData.error}
                                timeRange={timeRange}
                                onRefresh={geographicData.refetch}
                            />
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </main>
    );
};

// Overview Tab - Real data integration (REMOVED DEEP-DIVE LINKS)
const OverviewTab: React.FC<{
    timeRange: string;
    customerData: any;
    revenueData: any;
    productData: any;
    geographicData: any;
}> = ({ timeRange, customerData, revenueData, productData, geographicData }) => {

    // Create overview metrics from real data
    const overviewMetrics = [
        {
            id: 'total-revenue',
            title: 'Total Revenue',
            value: revenueData.data?.metrics?.totalRevenue
                ? `$${(revenueData.data.metrics.totalRevenue / 1000).toFixed(0)}K`
                : '$125K',
            change: {
                value: revenueData.data?.metrics?.growth || 12.5,
                type: (revenueData.data?.metrics?.growth || 12.5) >= 0 ? 'increase' as const : 'decrease' as const,
                period: `vs previous ${timeRange}`,
                isPercentage: true
            },
            icon: DollarSign,
            status: 'success' as const,
            description: 'Total business revenue'
        },
        {
            id: 'total-customers',
            title: 'Total Customers',
            value: customerData.data?.metrics?.totalCustomers?.toLocaleString() || '1,247',
            change: {
                value: customerData.data?.metrics?.growthRate || 8.2,
                type: (customerData.data?.metrics?.growthRate || 8.2) >= 0 ? 'increase' as const : 'decrease' as const,
                period: `vs previous ${timeRange}`,
                isPercentage: true
            },
            icon: Users,
            status: 'success' as const,
            description: 'Active customer base'
        },
        {
            id: 'active-products',
            title: 'Active Products',
            value: productData.data?.metrics?.activeProducts?.toString() || '156',
            change: {
                value: productData.data?.metrics?.periodComparison?.newProducts || 6.3,
                type: 'increase' as const,
                period: 'new this period',
                isPercentage: true
            },
            icon: ShoppingBag,
            status: 'success' as const,
            description: 'Products generating revenue'
        },
        {
            id: 'avg-order-value',
            title: 'Avg Order Value',
            value: revenueData.data?.metrics?.averageOrderValue
                ? `$${Math.round(revenueData.data.metrics.averageOrderValue)}`
                : '$346',
            change: {
                value: 15.3, // Could calculate from data
                type: 'increase' as const,
                period: `vs previous ${timeRange}`,
                isPercentage: true
            },
            icon: TrendingUp,
            status: 'success' as const,
            description: 'Average transaction value'
        }
    ];

    return (
        <div className="space-y-8">
            {/* Overview Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {overviewMetrics.map((metric, index) => (
                    <motion.div
                        key={metric.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1, duration: 0.5 }}
                    >
                        <MetricCard
                            metric={metric}
                            loading={customerData.isLoading || revenueData.isLoading || productData.isLoading}
                            refreshable={true}
                            clickable={false}
                            showTrend={true}
                            onRefresh={() => {
                                customerData.refetch();
                                revenueData.refetch();
                                productData.refetch();
                            }}
                        />
                    </motion.div>
                ))}
            </div>

            {/* Quick Insights Cards - REMOVED NAVIGATION LINKS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                    className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
                >
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Customer Retention
                        </h3>
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                            <Repeat className="w-5 h-5 text-blue-600" />
                        </div>
                    </div>
                    <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                        {customerData.data?.metrics?.customerRetentionRate
                            ? `${customerData.data.metrics.customerRetentionRate.toFixed(1)}%`
                            : '67%'
                        }
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                        Customer retention rate for {timeRange}
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                    className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
                >
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Top Product Category
                        </h3>
                        <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                            <Award className="w-5 h-5 text-green-600" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">
                        {productData.data?.metrics?.topSellingProduct || 'Fine Jewelry'}
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                        Best performing category this {timeRange}
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                    className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
                >
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Global Reach
                        </h3>
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                            <Globe className="w-5 h-5 text-purple-600" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                        {geographicData.data?.length || 6} Regions
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                        Active markets worldwide
                    </p>
                </motion.div>
            </div>
        </div>
    );
};

// Revenue Intelligence Tab - Integration with RevenueChart (REMOVED DEEP-DIVE LINK)
const RevenueIntelligenceTab: React.FC<{
    data: any;
    isLoading: boolean;
    error: string | null;
    timeRange: string;
    onRefresh: () => void;
}> = ({ data, isLoading, error, timeRange, onRefresh }) => {

    // Create revenue metrics from real data
    const revenueMetrics = data ? [
        {
            id: 'total-revenue',
            title: 'Total Revenue',
            value: `$${data.metrics.totalRevenue.toLocaleString()}`,
            change: {
                value: data.metrics.growth,
                type: data.metrics.growth >= 0 ? 'increase' as const : 'decrease' as const,
                period: `vs previous ${timeRange}`,
                isPercentage: true
            },
            icon: DollarSign,
            status: data.metrics.growth >= 10 ? 'success' as const : 'warning' as const,
            description: 'Total business revenue'
        },
        {
            id: 'total-orders',
            title: 'Total Orders',
            value: data.metrics.totalOrders.toLocaleString(),
            change: {
                value: 8.7, // Could calculate from data
                type: 'increase' as const,
                period: `vs previous ${timeRange}`,
                isPercentage: true
            },
            icon: ShoppingBag,
            status: 'success' as const,
            description: 'Orders completed'
        },
        {
            id: 'avg-order-value',
            title: 'Average Order Value',
            value: `$${Math.round(data.metrics.averageOrderValue)}`,
            change: {
                value: 15.3, // Could calculate from data
                type: 'increase' as const,
                period: `vs previous ${timeRange}`,
                isPercentage: true
            },
            icon: TrendingUp,
            status: 'success' as const,
            description: 'Average transaction value'
        },
        {
            id: 'top-category',
            title: 'Top Category',
            value: data.metrics.topCategory,
            change: {
                value: 0,
                type: 'neutral' as const,
                period: 'leading sales',
                isPercentage: false
            },
            icon: Award,
            status: 'success' as const,
            description: 'Best performing category'
        }
    ] : [];

    return (
        <div className="space-y-8">
            {error && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
                >
                    <div className="flex items-center space-x-2">
                        <AlertTriangle className="w-5 h-5 text-red-600" />
                        <p className="text-red-800 dark:text-red-200">{error}</p>
                    </div>
                </motion.div>
            )}

            {/* Revenue Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {revenueMetrics.map((metric, index) => (
                    <motion.div
                        key={metric.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1, duration: 0.5 }}
                    >
                        <MetricCard
                            metric={metric}
                            loading={isLoading}
                            refreshable={true}
                            exportable={true}
                            clickable={false}
                            onRefresh={onRefresh}
                        />
                    </motion.div>
                ))}
            </div>

            {/* Revenue Chart Integration */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
            >
                <RevenueChart
                    data={data?.data}
                    metrics={data?.metrics}
                    isLoading={isLoading}
                    error={error}
                    onRefresh={onRefresh}
                    className="shadow-lg"
                />
            </motion.div>
        </div>
    );
};

// Customer Intelligence Tab - Real data integration (REMOVED DEEP-DIVE LINK)
const CustomerIntelligenceTab: React.FC<{
    data: any;
    isLoading: boolean;
    error: string | null;
    timeRange: string;
    onRefresh: () => void;
}> = ({ data, isLoading, error, timeRange, onRefresh }) => {

    // Create customer metrics from real data
    const customerMetrics = data ? [
        {
            id: 'total-customers',
            title: 'Total Customers',
            value: data.metrics.totalCustomers.toLocaleString(),
            change: {
                value: data.metrics.growthRate,
                type: data.metrics.growthRate >= 0 ? 'increase' as const : 'decrease' as const,
                period: `vs previous ${timeRange}`,
                isPercentage: true
            },
            icon: Users,
            status: 'success' as const,
            description: 'Active customers'
        },
        {
            id: 'new-customers',
            title: 'New Customers',
            value: data.metrics.newCustomers.toLocaleString(),
            change: {
                value: data.metrics.periodComparison.newCustomers,
                type: data.metrics.periodComparison.newCustomers >= 0 ? 'increase' as const : 'decrease' as const,
                period: `vs previous ${timeRange}`,
                isPercentage: true
            },
            icon: UserPlus,
            status: 'success' as const,
            description: 'First-time customers'
        },
        {
            id: 'customer-ltv',
            title: 'Customer LTV',
            value: `$${Math.round(data.metrics.customerLifetimeValue)}`,
            change: {
                value: data.metrics.periodComparison.ltv,
                type: data.metrics.periodComparison.ltv >= 0 ? 'increase' as const : 'decrease' as const,
                period: `vs previous ${timeRange}`,
                isPercentage: true
            },
            icon: DollarSign,
            status: 'success' as const,
            description: 'Average lifetime value'
        },
        {
            id: 'retention-rate',
            title: 'Retention Rate',
            value: `${data.metrics.customerRetentionRate.toFixed(1)}%`,
            change: {
                value: 5.2, // Could calculate from data
                type: 'increase' as const,
                period: `vs previous ${timeRange}`,
                isPercentage: true
            },
            icon: Repeat,
            status: data.metrics.customerRetentionRate >= 60 ? 'success' as const : 'warning' as const,
            description: 'Customer retention rate'
        }
    ] : [];

    return (
        <div className="space-y-8">
            {error && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
                >
                    <div className="flex items-center space-x-2">
                        <AlertTriangle className="w-5 h-5 text-red-600" />
                        <p className="text-red-800 dark:text-red-200">{error}</p>
                    </div>
                </motion.div>
            )}

            {/* Customer Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {customerMetrics.map((metric, index) => (
                    <motion.div
                        key={metric.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1, duration: 0.5 }}
                    >
                        <MetricCard
                            metric={metric}
                            loading={isLoading}
                            refreshable={true}
                            exportable={true}
                            clickable={false}
                            onRefresh={onRefresh}
                        />
                    </motion.div>
                ))}
            </div>

            {/* Customer Segments */}
            {data?.segments && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                    className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
                >
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Customer Segments
                        </h3>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                            {data.segments.length} segments identified
                        </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {data.segments.map((segment: any, index: number) => (
                            <motion.div
                                key={segment.segment}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1, duration: 0.3 }}
                                className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                            >
                                <div className="flex items-center space-x-3 mb-3">
                                    <div
                                        className="w-4 h-4 rounded-full"
                                        style={{ backgroundColor: segment.color }}
                                    />
                                    <h4 className="font-medium text-gray-900 dark:text-white">
                                        {segment.segment}
                                    </h4>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500 dark:text-gray-400">Customers:</span>
                                        <span className="text-gray-900 dark:text-white font-medium">
                                            {segment.count.toLocaleString()} ({segment.percentage}%)
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500 dark:text-gray-400">Avg LTV:</span>
                                        <span className="text-gray-900 dark:text-white font-medium">
                                            ${segment.avgLTV.toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            )}
        </div>
    );
};

// Product Analytics Tab - Integration with IntegratedProductChart (REMOVED DEEP-DIVE LINK)
const ProductAnalyticsTab: React.FC<{
    data: any;
    isLoading: boolean;
    error: string | null;
    timeRange: string;
    onRefresh: () => void;
}> = ({ data, isLoading, error, timeRange, onRefresh }) => {

    // Create product metrics from real data
    const productMetrics = data ? [
        {
            id: 'total-revenue',
            title: 'Product Revenue',
            value: `${(data.metrics.totalRevenue / 1000).toFixed(0)}K`,
            change: {
                value: data.metrics.periodComparison.revenue,
                type: data.metrics.periodComparison.revenue >= 0 ? 'increase' as const : 'decrease' as const,
                period: `vs previous ${timeRange}`,
                isPercentage: true
            },
            icon: DollarSign,
            status: 'success' as const,
            description: 'Revenue from products'
        },
        {
            id: 'active-products',
            title: 'Active Products',
            value: data.metrics.activeProducts.toString(),
            change: {
                value: data.metrics.periodComparison.newProducts || 6.3,
                type: 'increase' as const,
                period: 'new this period',
                isPercentage: true
            },
            icon: Package,
            status: 'success' as const,
            description: `of ${data.metrics.totalProducts} total`
        },
        {
            id: 'top-product',
            title: 'Top Product',
            value: data.metrics.topSellingProduct || 'N/A',
            change: {
                value: 0,
                type: 'neutral' as const,
                period: 'best seller',
                isPercentage: false
            },
            icon: Award,
            status: 'success' as const,
            description: 'Best performing product'
        },
        {
            id: 'avg-rating',
            title: 'Avg Rating',
            value: Number(data.metrics.averageRating).toFixed(1),
            change: {
                value: data.metrics.conversionRate,
                type: 'increase' as const,
                period: 'conversion rate',
                isPercentage: true
            },
            icon: TrendingUp,
            status: Number(data.metrics.averageRating) >= 4.5 ? 'success' as const : 'warning' as const,
            description: `${data.metrics.conversionRate}% conversion`
        }
    ] : [];

    return (
        <div className="space-y-8">
            {error && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
                >
                    <div className="flex items-center space-x-2">
                        <AlertTriangle className="w-5 h-5 text-red-600" />
                        <p className="text-red-800 dark:text-red-200">{error}</p>
                    </div>
                </motion.div>
            )}

            {/* Product Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {productMetrics.map((metric, index) => (
                    <motion.div
                        key={metric.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1, duration: 0.5 }}
                    >
                        <MetricCard
                            metric={metric}
                            loading={isLoading}
                            refreshable={true}
                            exportable={true}
                            clickable={false}
                            onRefresh={onRefresh}
                        />
                    </motion.div>
                ))}
            </div>

            {/* Product Chart Integration */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
            >
                <ProductPerformaceChart
                    timeRange={timeRange}
                    chartType="performance"
                    sortBy="revenue"
                    onTimeRangeChange={() => { }}
                    onChartTypeChange={() => { }}
                    onSortChange={() => { }}
                />
            </motion.div>
        </div>
    );
};

// Geographic Analysis Tab - Integration with GeographicChart (REMOVED DEEP-DIVE LINK)
const GeographicAnalysisTab: React.FC<{
    data: any;
    isLoading: boolean;
    error: string | null;
    timeRange: string;
    onRefresh: () => void;
}> = ({ data, isLoading, error, timeRange, onRefresh }) => {

    // Calculate metrics from geographic data
    const totalRevenue = data?.reduce((sum: number, region: any) => sum + region.revenue, 0) || 0;
    const totalCustomers = data?.reduce((sum: number, region: any) => sum + region.customers, 0) || 0;
    const topRegion = data?.[0] || null;
    const activeRegions = data?.length || 0;

    const geographicMetrics = [
        {
            id: 'global-revenue',
            title: 'Global Revenue',
            value: `${(totalRevenue / 1000).toFixed(0)}K`,
            change: {
                value: 18.2, // Placeholder
                type: 'increase' as const,
                period: `vs previous ${timeRange}`,
                isPercentage: true
            },
            icon: DollarSign,
            status: 'success' as const,
            description: 'Total global revenue'
        },
        {
            id: 'active-regions',
            title: 'Active Regions',
            value: activeRegions.toString(),
            change: {
                value: 0,
                type: 'neutral' as const,
                period: 'markets served',
                isPercentage: false
            },
            icon: Globe,
            status: activeRegions >= 5 ? 'success' as const : 'warning' as const,
            description: 'Regions with customers'
        },
        {
            id: 'top-market',
            title: 'Top Market',
            value: topRegion?.region || 'No Data',
            change: {
                value: topRegion?.percentage || 0,
                type: 'neutral' as const,
                period: 'market share',
                isPercentage: true
            },
            icon: Target,
            status: 'success' as const,
            description: `${topRegion?.customers.toLocaleString() || '0'} customers`
        },
        {
            id: 'global-customers',
            title: 'Global Customers',
            value: totalCustomers.toLocaleString(),
            change: {
                value: 12.4, // Placeholder
                type: 'increase' as const,
                period: `vs previous ${timeRange}`,
                isPercentage: true
            },
            icon: Users,
            status: 'success' as const,
            description: 'Worldwide customer base'
        }
    ];

    return (
        <div className="space-y-8">
            {error && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
                >
                    <div className="flex items-center space-x-2">
                        <AlertTriangle className="w-5 h-5 text-red-600" />
                        <p className="text-red-800 dark:text-red-200">{error}</p>
                    </div>
                </motion.div>
            )}

            {/* Geographic Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {geographicMetrics.map((metric, index) => (
                    <motion.div
                        key={metric.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1, duration: 0.5 }}
                    >
                        <MetricCard
                            metric={metric}
                            loading={isLoading}
                            refreshable={true}
                            exportable={true}
                            clickable={false}
                            onRefresh={onRefresh}
                        />
                    </motion.div>
                ))}
            </div>

            {/* Geographic Chart Integration */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
            >
                <GeographicChart />
            </motion.div>

            {/* Top Markets Summary */}
            {data && data.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                    className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
                >
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Top Markets Summary
                        </h3>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                            Top {Math.min(data.length, 5)} regions
                        </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        {data.slice(0, 5).map((region: any, index: number) => (
                            <motion.div
                                key={region.region}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1, duration: 0.3 }}
                                className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                            >
                                <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg text-white font-bold text-sm mx-auto mb-3">
                                    #{index + 1}
                                </div>
                                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                                    {region.region}
                                </h4>
                                <div className="space-y-1">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        ${(region.revenue / 1000).toFixed(0)}K revenue
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {region.customers.toLocaleString()} customers
                                    </p>
                                    <p className="text-sm font-medium text-blue-600">
                                        {region.percentage}% share
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            )}
        </div>
    );
};

export default AdvancedAnalytics;