// components/admin/Analytics/RevenueAnalytics.tsx
'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    DollarSign,
    TrendingUp,
    TrendingDown,
    ShoppingCart,
    Target,
    Calendar,
    ChevronLeft,
    Filter,
    RefreshCw,
    AlertTriangle,
    BarChart3,
    PieChart as PieChartIcon,
    Activity,
    CreditCard
} from 'lucide-react';
import Link from 'next/link';
import { RevenueChart } from './charts/RevenueChart';
import { useRevenueAnalytics } from '@/lib/hooks/useAnalytics';
import { MetricCard } from '../Common';
import { ExportButton } from '../Common';

export default function RevenueAnalytics() {
    const [timeRange, setTimeRange] = useState('30d');
    const [includeComparison, setIncludeComparison] = useState(true);
    const [showFilters, setShowFilters] = useState(false);
    const [groupBy, setGroupBy] = useState('day');

    const { data: revenueData, isLoading, error, refetch } = useRevenueAnalytics(
        timeRange,
    );

    // Time range options
    const timeRanges = [
        { id: '7d', label: 'Last 7 days' },
        { id: '30d', label: 'Last 30 days' },
        { id: '90d', label: 'Last 90 days' },
        { id: '1y', label: 'Last year' },
        { id: 'custom', label: 'Custom range' },
    ];

    // Group by options
    const groupByOptions = [
        { id: 'day', label: 'Daily' },
        { id: 'week', label: 'Weekly' },
        { id: 'month', label: 'Monthly' },
    ];

    // Get metrics with proper MetricData interface
    const metrics = revenueData ? [
        {
            id: 'total-revenue',
            title: 'Total Revenue',
            value: `$${revenueData.metrics.totalRevenue.toLocaleString()}`,
            change: {
                value: revenueData.metrics.growth,
                type: revenueData.metrics.growth >= 0 ? 'increase' as const : 'decrease' as const,
                period: `vs previous ${timeRange}`,
                isPercentage: true
            },
            icon: DollarSign,
            status: revenueData.metrics.growth >= 15 ? 'success' as const :
                revenueData.metrics.growth >= 5 ? 'warning' as const : 'danger' as const,
            target: {
                value: revenueData.metrics.totalRevenue * 1.20, // 20% growth target
                label: 'Revenue Target',
                progress: Math.min((revenueData.metrics.totalRevenue / (revenueData.metrics.totalRevenue * 1.20)) * 100, 100)
            },
            color: '#D4A574'
        },
        {
            id: 'total-orders',
            title: 'Total Orders',
            value: revenueData.metrics.totalOrders.toLocaleString(),
            change: {
                value: 8.3, // Placeholder - could calculate from data
                type: 'increase' as const,
                period: `vs previous ${timeRange}`,
                isPercentage: true
            },
            icon: ShoppingCart,
            status: 'success' as const,
            description: `${Math.round(revenueData.metrics.totalOrders / parseInt(timeRange.replace('d', '')))} orders/day avg`
        },
        {
            id: 'avg-order-value',
            title: 'Avg Order Value',
            value: `$${Math.round(revenueData.metrics.averageOrderValue).toLocaleString()}`,
            change: {
                value: 4.2, // Placeholder - could calculate from data
                type: 'increase' as const,
                period: `vs previous ${timeRange}`,
                isPercentage: true
            },
            icon: CreditCard,
            status: revenueData.metrics.averageOrderValue >= 500 ? 'success' as const : 'warning' as const,
            target: {
                value: 600, // $600 AOV target
                label: 'AOV Target',
                progress: (revenueData.metrics.averageOrderValue / 600) * 100
            }
        },
        {
            id: 'top-category',
            title: 'Top Category',
            value: revenueData.metrics.topCategory,
            change: {
                value: revenueData.categories[0]?.value || 0,
                type: 'neutral' as const,
                period: 'of total revenue',
                isPercentage: true
            },
            icon: Target,
            status: 'success' as const,
            description: `$${revenueData.categories[0]?.revenue.toLocaleString() || '0'} revenue`,
            color: revenueData.categories[0]?.color || '#D4A574'
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
                                <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg">
                                    <DollarSign className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                        Revenue Analytics
                                    </h1>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Comprehensive revenue insights and trends
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
                                    className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                >
                                    {timeRanges.map(range => (
                                        <option key={range.id} value={range.id}>
                                            {range.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Group By Selector */}
                            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                                {groupByOptions.map(option => (
                                    <button
                                        key={option.id}
                                        onClick={() => setGroupBy(option.id)}
                                        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${groupBy === option.id
                                                ? 'bg-white dark:bg-gray-800 text-green-600 shadow-sm'
                                                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                            }`}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>

                            {/* Actions */}
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => setShowFilters(!showFilters)}
                                    className={`p-2 rounded-lg border transition-colors ${showFilters
                                            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-600'
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
                                        // Export revenue analytics data
                                        const csvData = [
                                            'Date,Revenue,Orders,Average Order Value',
                                            ...(revenueData?.data || []).map((item: any) =>
                                                `${item.date},${item.revenue},${item.orders},${item.averageOrderValue}`
                                            )
                                        ].join('\n');

                                        const blob = new Blob([csvData], { type: 'text/csv' });
                                        const url = URL.createObjectURL(blob);
                                        const a = document.createElement('a');
                                        a.href = url;
                                        a.download = `revenue-analytics-${timeRange}.csv`;
                                        a.click();
                                        URL.revokeObjectURL(url);
                                    }}
                                    data={revenueData?.data || []}
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
                                        Include comparison:
                                    </label>
                                    <input
                                        type="checkbox"
                                        checked={includeComparison}
                                        onChange={(e) => setIncludeComparison(e.target.checked)}
                                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                                    />
                                </div>

                                <div className="flex items-center space-x-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Status:
                                    </label>
                                    <select className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm">
                                        <option value="">All Orders</option>
                                        <option value="completed">Completed</option>
                                        <option value="pending">Pending</option>
                                        <option value="processing">Processing</option>
                                    </select>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Region:
                                    </label>
                                    <select className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm">
                                        <option value="">All Regions</option>
                                        <option value="US">United States</option>
                                        <option value="CA">Canada</option>
                                        <option value="EU">Europe</option>
                                        <option value="UK">United Kingdom</option>
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
                                Failed to load revenue analytics data. Please try again.
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
                                showTarget={metric.target ? true : false}
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

                {/* Main Revenue Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                    className="mb-8"
                >
                    <RevenueChart
                        data={revenueData?.data}
                        metrics={revenueData?.metrics}
                        isLoading={isLoading}
                        error={error}
                        onRefresh={refetch}
                        onExport={() => {
                            // Export chart data
                            const csvData = [
                                'Date,Revenue,Orders,Average Order Value',
                                ...(revenueData?.data || []).map((item: any) =>
                                    `${item.date},${item.revenue},${item.orders},${item.averageOrderValue}`
                                )
                            ].join('\n');

                            const blob = new Blob([csvData], { type: 'text/csv' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `revenue-chart-${timeRange}.csv`;
                            a.click();
                            URL.revokeObjectURL(url);
                        }}
                        className="shadow-lg"
                    />
                </motion.div>

                {/* Revenue Insights Grid */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                    className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"
                >
                    {/* Category Breakdown */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                        <div className="flex items-center space-x-3 mb-4">
                            <PieChartIcon className="w-5 h-5 text-blue-500" />
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Revenue by Category
                            </h3>
                        </div>

                        {revenueData?.categories && (
                            <div className="space-y-3">
                                {revenueData.categories.map((category: any, index: number) => (
                                    <motion.div
                                        key={category.name}
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
                                                    {category.name}
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    {category.value}% of total
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                                ${(category.revenue / 1000).toFixed(0)}K
                                            </p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Performance Insights */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                        <div className="flex items-center space-x-3 mb-4">
                            <Activity className="w-5 h-5 text-purple-500" />
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Performance Insights
                            </h3>
                        </div>

                        <div className="space-y-4">
                            {revenueData?.metrics && (
                                <>
                                    <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                                        <div className="flex items-center space-x-2">
                                            <TrendingUp className="w-4 h-4 text-green-600" />
                                            <span className="text-sm font-medium text-green-800 dark:text-green-400">
                                                Revenue Growth
                                            </span>
                                        </div>
                                        <p className="text-green-900 dark:text-green-300 text-sm mt-1">
                                            Revenue has grown by {revenueData.metrics.growth.toFixed(1)}% compared to the previous period.
                                        </p>
                                    </div>

                                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                        <div className="flex items-center space-x-2">
                                            <Target className="w-4 h-4 text-blue-600" />
                                            <span className="text-sm font-medium text-blue-800 dark:text-blue-400">
                                                Order Volume
                                            </span>
                                        </div>
                                        <p className="text-blue-900 dark:text-blue-300 text-sm mt-1">
                                            Processing {Math.round(revenueData.metrics.totalOrders / parseInt(timeRange.replace('d', '')))} orders per day on average.
                                        </p>
                                    </div>

                                    <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                                        <div className="flex items-center space-x-2">
                                            <CreditCard className="w-4 h-4 text-amber-600" />
                                            <span className="text-sm font-medium text-amber-800 dark:text-amber-400">
                                                Average Order Value
                                            </span>
                                        </div>
                                        <p className="text-amber-900 dark:text-amber-300 text-sm mt-1">
                                            ${revenueData.metrics.averageOrderValue.toFixed(0)} AOV with {revenueData.metrics.topCategory} leading sales.
                                        </p>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* Revenue Trends Table */}
                {revenueData?.data && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.6 }}
                        className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
                    >
                        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <BarChart3 className="w-5 h-5 text-green-500" />
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                        Daily Revenue Breakdown
                                    </h3>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                        Last {revenueData.data.length} days
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Date
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Revenue
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Orders
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            AOV
                                        </th>
                                        {includeComparison && (
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                vs Previous
                                            </th>
                                        )}
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {revenueData.data.slice(-10).reverse().map((item: any, index: number) => {
                                        const dailyGrowth = item.previousPeriodRevenue ?
                                            ((item.revenue - item.previousPeriodRevenue) / item.previousPeriodRevenue * 100) : 0;

                                        return (
                                            <motion.tr
                                                key={item.date}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.05, duration: 0.3 }}
                                                className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                        {new Date(item.date).toLocaleDateString('en-US', {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            weekday: 'short'
                                                        })}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                        ${item.revenue.toLocaleString()}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900 dark:text-white">
                                                        {item.orders}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900 dark:text-white">
                                                        ${Math.round(item.averageOrderValue)}
                                                    </div>
                                                </td>
                                                {includeComparison && (
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            {dailyGrowth >= 0 ? (
                                                                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                                                            ) : (
                                                                <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                                                            )}
                                                            <span className={`text-sm font-medium ${dailyGrowth >= 0 ? 'text-green-600' : 'text-red-600'
                                                                }`}>
                                                                {dailyGrowth >= 0 ? '+' : ''}{dailyGrowth.toFixed(1)}%
                                                            </span>
                                                        </div>
                                                    </td>
                                                )}
                                            </motion.tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                )}

                {/* Loading State */}
                {isLoading && !revenueData && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center justify-center py-12"
                    >
                        <div className="flex items-center space-x-3 text-gray-500 dark:text-gray-400">
                            <RefreshCw className="w-6 h-6 animate-spin" />
                            <span>Loading revenue analytics...</span>
                        </div>
                    </motion.div>
                )}
            </div>
        </main>
    );
}