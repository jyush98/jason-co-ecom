// components/admin/Analytics/GeographicAnalytics.tsx
'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    MapPin,
    Globe,
    Users,
    TrendingUp,
    DollarSign,
    Target,
    ChevronLeft,
    Filter,
    Calendar,
    RefreshCw,
    AlertTriangle,
    BarChart3,
    Activity,
    Navigation
} from 'lucide-react';
import Link from 'next/link';
import GeographicChart from './charts/GeographicChart';
import { useGeographicAnalytics } from '@/lib/hooks/useAnalytics';
import { MetricCard } from '../Common';
import { ExportButton } from '../Common';

export default function GeographicAnalytics() {
    const [timeRange, setTimeRange] = useState('30d');
    const [showFilters, setShowFilters] = useState(false);
    const [selectedRegion, setSelectedRegion] = useState('all');

    const { data: geographicData, isLoading, error, refetch } = useGeographicAnalytics(timeRange);

    // Time range options
    const timeRanges = [
        { id: '7d', label: 'Last 7 days' },
        { id: '30d', label: 'Last 30 days' },
        { id: '90d', label: 'Last 90 days' },
        { id: '1y', label: 'Last year' },
    ];

    // Region filter options
    const regionOptions = [
        { id: 'all', label: 'All Regions' },
        { id: 'north-america', label: 'North America' },
        { id: 'europe', label: 'Europe' },
        { id: 'asia-pacific', label: 'Asia Pacific' },
        { id: 'latin-america', label: 'Latin America' },
        { id: 'middle-east', label: 'Middle East' },
    ];

    // Calculate metrics from geographic data
    interface RegionData {
        region: string;
        customers: number;
        revenue: number;
        percentage: number;
    }

    const totalRevenue: number = geographicData?.reduce((sum: number, region: RegionData) => sum + region.revenue, 0) || 0;
    const totalCustomers = geographicData?.reduce((sum: number, region: RegionData) => sum + region.customers, 0) || 0;
    const topRegion = geographicData?.[0] || null;
    const activeRegions = geographicData?.length || 0;

    // Get metrics with proper MetricData interface
    const metrics = geographicData ? [
        {
            id: 'global-revenue',
            title: 'Global Revenue',
            value: `$${(totalRevenue / 1000).toFixed(0)}K`,
            change: {
                value: 15.8, // Placeholder - could calculate from historical data
                type: 'increase' as const,
                period: `vs previous ${timeRange}`,
                isPercentage: true
            },
            icon: DollarSign,
            status: 'success' as const,
            target: {
                value: totalRevenue * 1.25, // 25% growth target
                label: 'Revenue Target',
                progress: Math.min((totalRevenue / (totalRevenue * 1.25)) * 100, 100)
            },
            color: '#D4A574'
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
            description: `across ${activeRegions} regions`
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
            description: `${topRegion?.customers.toLocaleString() || '0'} customers`,
            color: '#FFD700'
        },
        {
            id: 'market-reach',
            title: 'Market Reach',
            value: `${activeRegions} Regions`,
            change: {
                value: totalCustomers > 0 ? (totalRevenue / totalCustomers) : 0,
                type: 'increase' as const,
                period: 'avg revenue per customer',
                isPercentage: false
            },
            icon: Globe,
            status: activeRegions >= 5 ? 'success' as const : 'warning' as const,
            description: `$${totalCustomers > 0 ? Math.round(totalRevenue / totalCustomers) : 0} per customer`
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
                                <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                                    <Globe className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                        Geographic Analytics
                                    </h1>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Global customer distribution and regional performance
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
                                    className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    {timeRanges.map(range => (
                                        <option key={range.id} value={range.id}>
                                            {range.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => setShowFilters(!showFilters)}
                                    className={`p-2 rounded-lg border transition-colors ${
                                        showFilters
                                            ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-600'
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
                                        // Export geographic analytics data
                                        const csvData = [
                                            'Region,Customers,Revenue,Market Share',
                                            ...(geographicData || []).map((region: any) => 
                                                `${region.region},${region.customers},${region.revenue},${region.percentage}%`
                                            )
                                        ].join('\n');
                                        
                                        const blob = new Blob([csvData], { type: 'text/csv' });
                                        const url = URL.createObjectURL(blob);
                                        const a = document.createElement('a');
                                        a.href = url;
                                        a.download = `geographic-analytics-${timeRange}.csv`;
                                        a.click();
                                        URL.revokeObjectURL(url);
                                    }}
                                    data={geographicData || []}
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
                                        Focus Region:
                                    </label>
                                    <select
                                        value={selectedRegion}
                                        onChange={(e) => setSelectedRegion(e.target.value)}
                                        className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm"
                                    >
                                        {regionOptions.map(option => (
                                            <option key={option.id} value={option.id}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Metric:
                                    </label>
                                    <select className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm">
                                        <option value="revenue">Revenue</option>
                                        <option value="customers">Customers</option>
                                        <option value="orders">Orders</option>
                                        <option value="aov">Avg Order Value</option>
                                    </select>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Currency:
                                    </label>
                                    <select className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm">
                                        <option value="usd">USD</option>
                                        <option value="local">Local Currency</option>
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
                                Failed to load geographic analytics data. Please try again.
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

                {/* Main Geographic Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                    className="mb-8"
                >
                    <GeographicChart />
                </motion.div>

                {/* Regional Performance Details */}
                {geographicData && geographicData.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.6 }}
                        className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"
                    >
                        {/* Top Markets Table */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                                <div className="flex items-center space-x-3">
                                    <Target className="w-5 h-5 text-blue-500" />
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                        Top Markets
                                    </h3>
                                </div>
                            </div>

                            <div className="p-4">
                                <div className="space-y-3">
                                    {geographicData.slice(0, 6).map((region: any, index: number) => (
                                        <motion.div
                                            key={region.region}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.1, duration: 0.3 }}
                                            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                                        >
                                            <div className="flex items-center space-x-3">
                                                <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg text-white font-bold text-sm">
                                                    #{index + 1}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                        {region.region}
                                                    </p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                        {region.percentage}% market share
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                                    ${(region.revenue / 1000).toFixed(0)}K
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    {region.customers.toLocaleString()} customers
                                                </p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Market Insights */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                            <div className="flex items-center space-x-3 mb-4">
                                <Activity className="w-5 h-5 text-green-500" />
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    Market Insights
                                </h3>
                            </div>

                            <div className="space-y-4">
                                {topRegion && (
                                    <>
                                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                            <div className="flex items-center space-x-2">
                                                <Target className="w-4 h-4 text-blue-600" />
                                                <span className="text-sm font-medium text-blue-800 dark:text-blue-400">
                                                    Leading Market
                                                </span>
                                            </div>
                                            <p className="text-blue-900 dark:text-blue-300 text-sm mt-1">
                                                {topRegion.region} leads with {topRegion.percentage}% market share and ${(topRegion.revenue / 1000).toFixed(0)}K revenue.
                                            </p>
                                        </div>

                                        <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                                            <div className="flex items-center space-x-2">
                                                <Users className="w-4 h-4 text-green-600" />
                                                <span className="text-sm font-medium text-green-800 dark:text-green-400">
                                                    Customer Distribution
                                                </span>
                                            </div>
                                            <p className="text-green-900 dark:text-green-300 text-sm mt-1">
                                                {totalCustomers.toLocaleString()} customers across {activeRegions} regions, avg {Math.round(totalCustomers / activeRegions)} per region.
                                            </p>
                                        </div>

                                        <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                                            <div className="flex items-center space-x-2">
                                                <DollarSign className="w-4 h-4 text-amber-600" />
                                                <span className="text-sm font-medium text-amber-800 dark:text-amber-400">
                                                    Revenue per Customer
                                                </span>
                                            </div>
                                            <p className="text-amber-900 dark:text-amber-300 text-sm mt-1">
                                                Average of ${totalCustomers > 0 ? Math.round(totalRevenue / totalCustomers) : 0} per customer globally.
                                            </p>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Regional Performance Table */}
                {geographicData && geographicData.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.6 }}
                        className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden mb-8"
                    >
                        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <BarChart3 className="w-5 h-5 text-indigo-500" />
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                        Regional Performance Details
                                    </h3>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                        {geographicData.length} active regions
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Region
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Revenue
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Customers
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Market Share
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Avg per Customer
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {geographicData.map((region: any, index: number) => (
                                        <motion.tr
                                            key={region.region}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.05, duration: 0.3 }}
                                            className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                                                        <Globe className="w-5 h-5" />
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                            {region.region}
                                                        </div>
                                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                                            Rank #{index + 1}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                    ${region.revenue.toLocaleString()}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900 dark:text-white">
                                                    {region.customers.toLocaleString()}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-1 bg-gray-200 dark:bg-gray-600 rounded-full h-2 mr-3">
                                                        <div
                                                            className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full"
                                                            style={{ width: `${Math.min(region.percentage, 100)}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                        {region.percentage}%
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                    ${region.customers > 0 ? Math.round(region.revenue / region.customers) : 0}
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                )}

                {/* Regional Growth Opportunities */}
                {geographicData && geographicData.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6, duration: 0.6 }}
                        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
                    >
                        {/* Growth Opportunities */}
                        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                            <div className="flex items-center space-x-3 mb-4">
                                <TrendingUp className="w-5 h-5 text-green-500" />
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    Growth Opportunities
                                </h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {geographicData.slice(0, 4).map((region: any, index: number) => {
                                    const growthPotential = 100 - region.percentage; // Simplified calculation
                                    const revenuePerCustomer = region.customers > 0 ? region.revenue / region.customers : 0;
                                    
                                    return (
                                        <motion.div
                                            key={region.region}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.1, duration: 0.3 }}
                                            className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                                        >
                                            <div className="flex items-center space-x-2 mb-2">
                                                <MapPin className="w-4 h-4 text-blue-500" />
                                                <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {region.region}
                                                </h4>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-500 dark:text-gray-400">Revenue/Customer:</span>
                                                    <span className="text-gray-900 dark:text-white font-medium">
                                                        ${Math.round(revenuePerCustomer)}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-500 dark:text-gray-400">Growth Potential:</span>
                                                    <span className="text-green-600 font-medium">
                                                        {growthPotential.toFixed(1)}%
                                                    </span>
                                                </div>
                                                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                                                    <div
                                                        className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full"
                                                        style={{ width: `${Math.min(region.percentage, 100)}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                            <div className="flex items-center space-x-3 mb-4">
                                <Navigation className="w-5 h-5 text-purple-500" />
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    Quick Actions
                                </h3>
                            </div>

                            <div className="space-y-3">
                                <button className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                                    <div className="flex items-center space-x-3">
                                        <Globe className="w-4 h-4 text-blue-500" />
                                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                                            Expand Markets
                                        </span>
                                    </div>
                                    <ChevronLeft className="w-4 h-4 text-gray-400 rotate-180" />
                                </button>

                                <button className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                                    <div className="flex items-center space-x-3">
                                        <Target className="w-4 h-4 text-green-500" />
                                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                                            Target Campaigns
                                        </span>
                                    </div>
                                    <ChevronLeft className="w-4 h-4 text-gray-400 rotate-180" />
                                </button>

                                <button className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                                    <div className="flex items-center space-x-3">
                                        <TrendingUp className="w-4 h-4 text-purple-500" />
                                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                                            Growth Analysis
                                        </span>
                                    </div>
                                    <ChevronLeft className="w-4 h-4 text-gray-400 rotate-180" />
                                </button>

                                <Link
                                    href="/admin/customers"
                                    className="w-full flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                                >
                                    <div className="flex items-center space-x-3">
                                        <Users className="w-4 h-4 text-blue-600" />
                                        <span className="text-sm font-medium text-blue-900 dark:text-blue-400">
                                            Manage Customers
                                        </span>
                                    </div>
                                    <ChevronLeft className="w-4 h-4 text-blue-600 rotate-180" />
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Loading State */}
                {isLoading && !geographicData && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center justify-center py-12"
                    >
                        <div className="flex items-center space-x-3 text-gray-500 dark:text-gray-400">
                            <RefreshCw className="w-6 h-6 animate-spin" />
                            <span>Loading geographic analytics...</span>
                        </div>
                    </motion.div>
                )}
            </div>
        </main>
    );
}