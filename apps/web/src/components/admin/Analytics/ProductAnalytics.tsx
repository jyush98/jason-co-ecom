// components/admin/Analytics/ProductAnalytics.tsx
'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Package,
    TrendingUp,
    Star,
    Download,
    RefreshCw,
    ShoppingBag,
    DollarSign,
    Trophy,
    AlertTriangle,
    ChevronLeft,
    Filter,
    Calendar,
    Grid3X3,
    BarChart3,
    PieChart as PieChartIcon,
    Activity
} from 'lucide-react';
import Link from 'next/link';
import ProductPerformanceChart from './charts/ProductPerformanceChart';
import { useProductAnalytics } from '@/lib/hooks/useAnalytics';
import { MetricCard } from '../Common';
import { FilterBar, DateRangePicker, ExportButton } from '../Common';

export default function ProductAnalytics() {
    const [timeRange, setTimeRange] = useState('30d');
    const [chartType, setChartType] = useState('performance');
    const [sortBy, setSortBy] = useState('revenue');
    const [showFilters, setShowFilters] = useState(false);

    const { data: productData, isLoading, error, refetch } = useProductAnalytics(timeRange, sortBy);

    // Chart type options
    const chartTypes = [
        { id: 'performance', label: 'Performance', icon: BarChart3 },
        { id: 'categories', label: 'Categories', icon: PieChartIcon },
        { id: 'trends', label: 'Trends', icon: Activity },
    ];

    // Time range options
    const timeRanges = [
        { id: '7d', label: 'Last 7 days' },
        { id: '30d', label: 'Last 30 days' },
        { id: '90d', label: 'Last 90 days' },
        { id: '365d', label: 'Last year' },
    ];

    // Sort options
    const sortOptions = [
        { id: 'revenue', label: 'Revenue' },
        { id: 'units', label: 'Units Sold' },
        { id: 'rating', label: 'Rating' },
        { id: 'profit', label: 'Profit' },
    ];

    // Get metrics with proper MetricData interface
    const metrics = productData ? [
        {
            id: 'total-revenue',
            title: 'Total Revenue',
            value: `$${(productData.metrics.totalRevenue / 1000).toFixed(0)}K`,
            change: {
                value: productData.metrics.periodComparison.revenue,
                type: productData.metrics.periodComparison.revenue >= 0 ? 'increase' as const : 'decrease' as const,
                period: timeRange === '7d' ? 'vs last 7 days' : timeRange === '30d' ? 'vs last 30 days' : 'vs previous period',
                isPercentage: true
            },
            icon: DollarSign,
            status: productData.metrics.periodComparison.revenue >= 10 ? 'success' as const :
                productData.metrics.periodComparison.revenue >= 0 ? 'warning' as const : 'danger' as const,
            target: {
                value: productData.metrics.totalRevenue * 1.15, // 15% growth target
                label: 'Monthly Target',
                progress: (productData.metrics.totalRevenue / (productData.metrics.totalRevenue * 1.15)) * 100
            }
        },
        {
            id: 'units-sold',
            title: 'Units Sold',
            value: productData.metrics.totalUnits.toLocaleString(),
            change: {
                value: productData.metrics.periodComparison.units,
                type: productData.metrics.periodComparison.units >= 0 ? 'increase' as const : 'decrease' as const,
                period: timeRange === '7d' ? 'vs last 7 days' : timeRange === '30d' ? 'vs last 30 days' : 'vs previous period',
                isPercentage: true
            },
            icon: ShoppingBag,
            status: productData.metrics.periodComparison.units >= 5 ? 'success' as const :
                productData.metrics.periodComparison.units >= 0 ? 'warning' as const : 'danger' as const
        },
        {
            id: 'active-products',
            title: 'Active Products',
            value: productData.metrics.activeProducts.toString(),
            change: {
                value: productData.metrics.periodComparison.newProducts || 6.3,
                type: 'increase' as const,
                period: 'new this period',
                isPercentage: true
            },
            icon: Package,
            status: 'success' as const,
            description: `of ${productData.metrics.totalProducts} total products`
        },
        {
            id: 'avg-rating',
            title: 'Avg Rating',
            value: Number(productData.metrics.averageRating).toFixed(1),
            change: {
                value: productData.metrics.conversionRate,
                type: 'increase' as const,
                period: 'conversion rate',
                isPercentage: true
            },
            icon: Star,
            status: Number(productData.metrics.averageRating) >= 4.5 ? 'success' as const :
                Number(productData.metrics.averageRating) >= 4.0 ? 'warning' as const : 'danger' as const,
            description: `${productData.metrics.conversionRate}% conversion rate`
        }
    ] : [];

    return (
        <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Sticky Header */}
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-6 py-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                        {/* Header Left */}
                        <div className="flex items-center space-x-4 mb-4 lg:mb-0">
                            <Link
                                href="/admin/analytics"
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            >
                                <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                            </Link>

                            <div className="flex items-center space-x-3">
                                <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl shadow-lg">
                                    <Package className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                        Product Analytics
                                    </h1>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Comprehensive product performance insights
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Header Right */}
                        <div className="flex flex-wrap items-center gap-3">
                            {/* Time Range Selector */}
                            <div className="flex items-center space-x-2">
                                <Calendar className="w-4 h-4 text-gray-500" />
                                <select
                                    value={timeRange}
                                    onChange={(e) => setTimeRange(e.target.value)}
                                    className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                >
                                    {timeRanges.map(range => (
                                        <option key={range.id} value={range.id}>
                                            {range.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Chart Type Selector */}
                            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                                {chartTypes.map(type => {
                                    const Icon = type.icon;
                                    return (
                                        <button
                                            key={type.id}
                                            onClick={() => setChartType(type.id)}
                                            className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${chartType === type.id
                                                ? 'bg-white dark:bg-gray-800 text-amber-600 shadow-sm'
                                                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                                }`}
                                        >
                                            <Icon className="w-4 h-4" />
                                            <span className="hidden sm:inline">{type.label}</span>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Actions */}
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => setShowFilters(!showFilters)}
                                    className={`p-2 rounded-lg border transition-colors ${showFilters
                                        ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-600'
                                        : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                        }`}
                                >
                                    <Filter className="w-4 h-4" />
                                </button>

                                <button
                                    onClick={refetch}
                                    disabled={isLoading}
                                    className="p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors disabled:opacity-50"
                                >
                                    <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                                </button>

                                <ExportButton
                                    onExport={async (options) => {
                                        // Export product analytics data
                                        const csvData = [
                                            'Product,Category,Revenue,Units,Rating,Stock,Growth',
                                            ...(productData?.topProducts || []).map((p: any) =>
                                                `${p.name},${p.category},${p.revenue},${p.unitsSold},${p.rating},${p.inventory},${p.growthRate}%`
                                            )
                                        ].join('\n');

                                        const blob = new Blob([csvData], { type: 'text/csv' });
                                        const url = URL.createObjectURL(blob);
                                        const a = document.createElement('a');
                                        a.href = url;
                                        a.download = `product-analytics-${timeRange}.csv`;
                                        a.click();
                                        URL.revokeObjectURL(url);
                                    }}
                                    data={productData?.topProducts || []}
                                    className="px-4 py-2"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Filters Bar */}
                    {showFilters && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
                        >
                            <div className="flex flex-wrap items-center gap-4">
                                <div className="flex items-center space-x-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Sort by:
                                    </label>
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                        className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm"
                                    >
                                        {sortOptions.map(option => (
                                            <option key={option.id} value={option.id}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Category:
                                    </label>
                                    <select className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm">
                                        <option value="">All Categories</option>
                                        <option value="rings">Rings</option>
                                        <option value="necklaces">Necklaces</option>
                                        <option value="earrings">Earrings</option>
                                        <option value="bracelets">Bracelets</option>
                                        <option value="watches">Watches</option>
                                    </select>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
                    >
                        <div className="flex items-center space-x-2">
                            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                            <p className="text-red-800 dark:text-red-200">
                                Failed to load product analytics data. Please try again.
                            </p>
                        </div>
                    </motion.div>
                )}

                {/* Metrics Grid */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
                >
                    {metrics.map((metric, index) => (
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
                                clickable={true}
                                onRefresh={refetch}
                                onExport={() => {
                                    // Export individual metric data
                                    const csvData = `Metric,Value,Change\n${metric.title},${metric.value},${metric.change?.value}%`;
                                    const blob = new Blob([csvData], { type: 'text/csv' });
                                    const url = URL.createObjectURL(blob);
                                    const a = document.createElement('a');
                                    a.href = url;
                                    a.download = `${metric.title.toLowerCase().replace(/\s+/g, '-')}-${timeRange}.csv`;
                                    a.click();
                                    URL.revokeObjectURL(url);
                                }}
                                onClick={() => {
                                    // Navigate to detailed view for this metric
                                    console.log(`Drill down into ${metric.title}`);
                                }}
                            />
                        </motion.div>
                    ))}
                </motion.div>

                {/* Main Chart Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                    className="mb-8"
                >
                    <ProductPerformanceChart
                        timeRange={timeRange}
                        chartType={chartType}
                        sortBy={sortBy}
                        onTimeRangeChange={setTimeRange}
                        onChartTypeChange={setChartType}
                        onSortChange={setSortBy}
                    />
                </motion.div>

                {/* Product Performance Table */}
                {productData?.topProducts && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.6 }}
                        className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
                    >
                        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <Trophy className="w-5 h-5 text-amber-500" />
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                        Top Performing Products
                                    </h3>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                        Showing {productData.topProducts.length} of {productData.metrics.activeProducts} products
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Product
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Revenue
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Units
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Rating
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Stock
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Growth
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {productData.topProducts.slice(0, 10).map((product: any, index: number) => (
                                        <motion.tr
                                            key={product.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.05, duration: 0.3 }}
                                            className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                                                        {product.name.charAt(0)}
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                            {product.name}
                                                        </div>
                                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                                            {product.category} • ${product.price}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                    ${product.revenue.toLocaleString()}
                                                </div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                                    ${product.profit.toLocaleString()} profit
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900 dark:text-white">
                                                    {product.unitsSold.toLocaleString()}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <Star className="w-4 h-4 text-yellow-400 mr-1" />
                                                    <span className="text-sm text-gray-900 dark:text-white">
                                                        {product.rating.toFixed(1)}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${product.inventory < 20
                                                    ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                                                    : product.inventory < 50
                                                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                                                        : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                                    }`}>
                                                    {product.inventory} left
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                                                    <span className="text-sm font-medium text-green-600">
                                                        +{product.growthRate}%
                                                    </span>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                )}

                {/* Additional Insights Section */}
                {productData?.categories && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.6 }}
                        className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6"
                    >
                        {/* Category Performance */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                            <div className="flex items-center space-x-3 mb-4">
                                <Grid3X3 className="w-5 h-5 text-purple-500" />
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    Category Performance
                                </h3>
                            </div>

                            <div className="space-y-4">
                                {productData.categories.slice(0, 5).map((category: any, index: number) => (
                                    <motion.div
                                        key={category.category}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1, duration: 0.3 }}
                                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                                    >
                                        <div className="flex items-center space-x-3">
                                            <div
                                                className="w-4 h-4 rounded-full"
                                                style={{ backgroundColor: category.color }}
                                            />
                                            <div>
                                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {category.category}
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    {category.productCount} products
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                                ${(category.revenue / 1000).toFixed(0)}K
                                            </p>
                                            <div className="flex items-center">
                                                <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
                                                <span className="text-xs text-green-600">+{category.growthRate}%</span>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                            <div className="flex items-center space-x-3 mb-4">
                                <Activity className="w-5 h-5 text-blue-500" />
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    Quick Actions
                                </h3>
                            </div>

                            <div className="space-y-3">
                                <button className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                                    <div className="flex items-center space-x-3">
                                        <Package className="w-4 h-4 text-blue-500" />
                                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                                            Manage Inventory
                                        </span>
                                    </div>
                                    <ChevronLeft className="w-4 h-4 text-gray-400 rotate-180" />
                                </button>

                                <button className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                                    <div className="flex items-center space-x-3">
                                        <TrendingUp className="w-4 h-4 text-green-500" />
                                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                                            View Forecasts
                                        </span>
                                    </div>
                                    <ChevronLeft className="w-4 h-4 text-gray-400 rotate-180" />
                                </button>

                                <button className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                                    <div className="flex items-center space-x-3">
                                        <Star className="w-4 h-4 text-yellow-500" />
                                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                                            Review Analysis
                                        </span>
                                    </div>
                                    <ChevronLeft className="w-4 h-4 text-gray-400 rotate-180" />
                                </button>

                                <Link
                                    href="/admin/products"
                                    className="w-full flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors"
                                >
                                    <div className="flex items-center space-x-3">
                                        <Package className="w-4 h-4 text-amber-600" />
                                        <span className="text-sm font-medium text-amber-900 dark:text-amber-400">
                                            Manage Products
                                        </span>
                                    </div>
                                    <ChevronLeft className="w-4 h-4 text-amber-600 rotate-180" />
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Loading State */}
                {isLoading && !productData && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center justify-center py-12"
                    >
                        <div className="flex items-center space-x-3 text-gray-500 dark:text-gray-400">
                            <RefreshCw className="w-6 h-6 animate-spin" />
                            <span>Loading product analytics...</span>
                        </div>
                    </motion.div>
                )}
            </div>
        </main>
    );
}