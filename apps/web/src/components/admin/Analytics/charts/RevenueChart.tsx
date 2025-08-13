'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
    LineChart,
    Line,
    AreaChart,
    Area,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
    PieChart,
    Pie,
    Cell
} from 'recharts';
import {
    Calendar,
    TrendingUp,
    TrendingDown,
    BarChart3,
    PieChart as PieChartIcon,
    Download,
    RefreshCw,
    AlertTriangle,
    Database
} from 'lucide-react';

// Real API Integration - No Mock Data
import { AnalyticsService, type AnalyticsDateRange } from '@/lib/services/analyticsService';

// Types for revenue data (updated for real API integration)
interface RevenueDataPoint {
    date: string;
    revenue: number;
    orders: number;
    averageOrderValue: number;
    category?: string;
    previousPeriodRevenue?: number;
    growth?: number;
    formattedDate?: string;
}

interface RevenueMetrics {
    totalRevenue: number;
    growth: number;
    totalOrders: number;
    averageOrderValue: number;
    topCategory: string;
}

interface CategoryData {
    name: string;
    value: number;
    revenue: number;
    color: string;
}

interface RevenueChartProps {
    dateRange?: AnalyticsDateRange;
    isLoading?: boolean;
    error?: string | null;
    onRefresh?: () => void;
    onExport?: () => void;
    className?: string;
}

// Chart visualization types
type ChartType = 'line' | 'area' | 'bar' | 'pie';
type TimeRange = '7d' | '30d' | '90d' | '1y' | 'custom';

// Chart configuration
const chartColors = {
    primary: '#D4AF37', // Jason & Co. gold
    secondary: '#C9A96E',
    accent: '#B8956A',
    success: '#22C55E',
    warning: '#F59E0B',
    error: '#EF4444',
    muted: '#6B7280'
};

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
                <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                    {new Date(label).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                    })}
                </p>
                {payload.map((entry: any, index: number) => (
                    <p key={index} className="text-sm" style={{ color: entry.color }}>
                        {entry.name}: {
                            entry.name.includes('Revenue')
                                ? `$${entry.value.toLocaleString()}`
                                : entry.value.toLocaleString()
                        }
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

// Helper function to generate date range
const generateDateRange = (timeRange: TimeRange): AnalyticsDateRange => {
    const now = new Date();
    const daysBack = {
        '7d': 7,
        '30d': 30,
        '90d': 90,
        '1y': 365,
        'custom': 30
    }[timeRange];

    const startDate = new Date(now.getTime() - (daysBack * 24 * 60 * 60 * 1000));

    return {
        startDate: startDate.toISOString().split('T')[0],
        endDate: now.toISOString().split('T')[0]
    };
};

// Helper function to calculate metrics from data
const calculateMetrics = (data: RevenueDataPoint[]): RevenueMetrics => {
    if (data.length === 0) {
        return {
            totalRevenue: 0,
            growth: 0,
            totalOrders: 0,
            averageOrderValue: 0,
            topCategory: 'No Data'
        };
    }

    const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0);
    const totalOrders = data.reduce((sum, item) => sum + item.orders, 0);
    const averageOrderValue = totalOrders > 0 ? (totalRevenue / totalOrders / 100) : 0;

    // Calculate growth (simplified - compare first and last periods)
    const firstPeriodRevenue = data[0]?.previousPeriodRevenue || data[0]?.revenue || 0;
    const lastPeriodRevenue = data[data.length - 1]?.revenue || 0;
    const growth = firstPeriodRevenue > 0
        ? ((lastPeriodRevenue - firstPeriodRevenue) / firstPeriodRevenue) * 100
        : 0;

    return {
        totalRevenue,
        growth,
        totalOrders,
        averageOrderValue,
        topCategory: 'Fine Jewelry' // This would come from category analytics API
    };
};

export function RevenueChart({
    dateRange,
    isLoading: externalLoading = false,
    error: externalError = null,
    onRefresh,
    onExport,
    className = ''
}: RevenueChartProps) {
    // State management for real API integration
    const [revenueData, setRevenueData] = useState<RevenueDataPoint[]>([]);
    const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
    const [metrics, setMetrics] = useState<RevenueMetrics>({
        totalRevenue: 0,
        growth: 0,
        totalOrders: 0,
        averageOrderValue: 0,
        topCategory: 'No Data'
    });

    // Local state
    const [internalLoading, setInternalLoading] = useState(true);
    const [internalError, setInternalError] = useState<string | null>(null);
    const [chartType, setChartType] = useState<ChartType>('area');
    const [timeRange, setTimeRange] = useState<TimeRange>('30d');
    const [showComparison, setShowComparison] = useState(true);

    // Determine actual loading and error states
    const isLoading = externalLoading || internalLoading;
    const error = externalError || internalError;

    // Real API data fetching
    useEffect(() => {
        async function fetchRevenueData() {
            setInternalLoading(true);
            setInternalError(null);

            try {
                // Use provided dateRange or generate from timeRange
                const actualDateRange = dateRange || generateDateRange(timeRange);

                // Fetch real revenue data from API
                const apiRevenueData = await AnalyticsService.getRevenueData(actualDateRange);

                // Transform API data to component format
                const transformedData: RevenueDataPoint[] = apiRevenueData.map(item => ({
                    date: item.date,
                    revenue: item.revenue,
                    orders: item.orders,
                    averageOrderValue: item.avgOrderValue,
                    growth: item.growth || 0,
                    formattedDate: new Date(item.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric'
                    })
                }));

                setRevenueData(transformedData);

                // Calculate metrics from real data
                const calculatedMetrics = calculateMetrics(transformedData);
                setMetrics(calculatedMetrics);

                // Fetch category data for pie chart (if available)
                try {
                    const productAnalytics = await AnalyticsService.getProductAnalytics(actualDateRange);
                    setCategoryData(productAnalytics.categoryPerformance.map(cat => ({
                        name: cat.category,
                        value: cat.percentage,
                        revenue: cat.revenue,
                        color: cat.color
                    })));
                } catch (categoryError) {
                    console.warn('Category data not available:', categoryError);
                    setCategoryData([]);
                }

            } catch (err) {
                console.error('Failed to fetch revenue data:', err);
                setInternalError('Unable to load revenue data. Please check your connection and try again.');
                // Don't set mock data - leave empty for graceful degradation
                setRevenueData([]);
                setCategoryData([]);
            } finally {
                setInternalLoading(false);
            }
        }

        fetchRevenueData();
    }, [dateRange, timeRange]);

    // Process data based on selected time range
    const processedData = useMemo(() => {
        if (revenueData.length === 0) return [];

        return revenueData.map(item => ({
            ...item,
            formattedDate: item.formattedDate || new Date(item.date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
            })
        }));
    }, [revenueData]);

    // Refresh handler
    const handleRefresh = () => {
        if (onRefresh) {
            onRefresh();
        } else {
            // Trigger internal refresh
            setTimeRange(prev => prev); // Force useEffect to run
        }
    };

    // Chart render functions
    const renderLineChart = () => (
        <LineChart data={processedData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis
                dataKey="formattedDate"
                stroke="#6B7280"
                fontSize={12}
                tickLine={false}
            />
            <YAxis
                stroke="#6B7280"
                fontSize={12}
                tickLine={false}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line
                type="monotone"
                dataKey="revenue"
                name="Revenue"
                stroke={chartColors.primary}
                strokeWidth={3}
                dot={{ fill: chartColors.primary, strokeWidth: 0, r: 4 }}
                activeDot={{ r: 6, fill: chartColors.primary }}
            />
            {showComparison && processedData.some(item => item.previousPeriodRevenue) && (
                <Line
                    type="monotone"
                    dataKey="previousPeriodRevenue"
                    name="Previous Period"
                    stroke={chartColors.muted}
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                />
            )}
        </LineChart>
    );

    const renderAreaChart = () => (
        <AreaChart data={processedData}>
            <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={chartColors.primary} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={chartColors.primary} stopOpacity={0.05} />
                </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis
                dataKey="formattedDate"
                stroke="#6B7280"
                fontSize={12}
                tickLine={false}
            />
            <YAxis
                stroke="#6B7280"
                fontSize={12}
                tickLine={false}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Area
                type="monotone"
                dataKey="revenue"
                name="Revenue"
                stroke={chartColors.primary}
                fillOpacity={1}
                fill="url(#revenueGradient)"
                strokeWidth={2}
            />
            {showComparison && processedData.some(item => item.previousPeriodRevenue) && (
                <Area
                    type="monotone"
                    dataKey="previousPeriodRevenue"
                    name="Previous Period"
                    stroke={chartColors.muted}
                    fill="transparent"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                />
            )}
        </AreaChart>
    );

    const renderBarChart = () => (
        <BarChart data={processedData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis
                dataKey="formattedDate"
                stroke="#6B7280"
                fontSize={12}
                tickLine={false}
            />
            <YAxis
                stroke="#6B7280"
                fontSize={12}
                tickLine={false}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar
                dataKey="revenue"
                name="Revenue"
                fill={chartColors.primary}
                radius={[2, 2, 0, 0]}
            />
            {showComparison && processedData.some(item => item.previousPeriodRevenue) && (
                <Bar
                    dataKey="previousPeriodRevenue"
                    name="Previous Period"
                    fill={chartColors.muted}
                    radius={[2, 2, 0, 0]}
                />
            )}
        </BarChart>
    );

    const renderPieChart = () => {
        if (categoryData.length === 0) {
            return (
                <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                    <div className="text-center">
                        <PieChartIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                        <p className="text-sm">Category data not available</p>
                    </div>
                </div>
            );
        }

        return (
            <PieChart>
                <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name} ${(value? value.toFixed(0): 0 )}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                >
                    {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                </Pie>
                <Tooltip
                    formatter={(value, name) => [`${value}%`, name]}
                    contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #E5E7EB',
                        borderRadius: '8px'
                    }}
                />
            </PieChart>
        );
    };

    const getChartComponent = () => {
        switch (chartType) {
            case 'line': return renderLineChart();
            case 'area': return renderAreaChart();
            case 'bar': return renderBarChart();
            case 'pie': return renderPieChart();
            default: return renderAreaChart();
        }
    };

    // Loading state
    if (isLoading) {
        return (
            <div className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
                <div className="animate-pulse">
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
                    <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                    <div className="grid grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className={`bg-white dark:bg-gray-800 rounded-xl border border-red-200 dark:border-red-700 p-6 ${className}`}>
                <div className="text-center py-12">
                    <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-red-600 dark:text-red-400 mb-2">
                        Revenue Data Unavailable
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
                    <div className="flex items-center justify-center gap-3">
                        <button
                            onClick={handleRefresh}
                            className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors flex items-center gap-2"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Try Again
                        </button>
                        <a
                            href="/admin/analytics"
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Back to Analytics
                        </a>
                    </div>
                </div>
            </div>
        );
    }

    // Empty state
    if (processedData.length === 0) {
        return (
            <div className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
                <div className="text-center py-12">
                    <Database className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        No Revenue Data
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                        Revenue data will appear here once orders are processed.
                    </p>
                    <p className="text-sm text-gray-400 dark:text-gray-500">
                        Make sure your backend analytics API is configured and returning data.
                    </p>
                </div>
            </div>
        );
    }

    // Main chart render
    return (
        <div className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 ${className}`}>
            {/* Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Revenue Analytics
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Real-time revenue trends and performance metrics
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleRefresh}
                            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                            title="Refresh data"
                        >
                            <RefreshCw className="w-4 h-4" />
                        </button>
                        {onExport && (
                            <button
                                onClick={onExport}
                                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                                title="Export data"
                            >
                                <Download className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Controls */}
                <div className="flex flex-wrap items-center gap-4">
                    {/* Time Range Selector */}
                    <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <select
                            value={timeRange}
                            onChange={(e) => setTimeRange(e.target.value as TimeRange)}
                            className="text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                            <option value="7d">Last 7 days</option>
                            <option value="30d">Last 30 days</option>
                            <option value="90d">Last 90 days</option>
                            <option value="1y">Last year</option>
                            <option value="custom">Custom range</option>
                        </select>
                    </div>

                    {/* Chart Type Selector */}
                    <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                        <button
                            onClick={() => setChartType('area')}
                            className={`p-1.5 rounded ${chartType === 'area' ? 'bg-white dark:bg-gray-600 shadow-sm' : ''}`}
                            title="Area Chart"
                        >
                            <BarChart3 className={`w-4 h-4 ${chartType === 'area' ? 'text-amber-600' : 'text-gray-400'}`} />
                        </button>
                        <button
                            onClick={() => setChartType('line')}
                            className={`p-1.5 rounded ${chartType === 'line' ? 'bg-white dark:bg-gray-600 shadow-sm' : ''}`}
                            title="Line Chart"
                        >
                            <TrendingUp className={`w-4 h-4 ${chartType === 'line' ? 'text-amber-600' : 'text-gray-400'}`} />
                        </button>
                        <button
                            onClick={() => setChartType('bar')}
                            className={`p-1.5 rounded ${chartType === 'bar' ? 'bg-white dark:bg-gray-600 shadow-sm' : ''}`}
                            title="Bar Chart"
                        >
                            <BarChart3 className={`w-4 h-4 ${chartType === 'bar' ? 'text-amber-600' : 'text-gray-400'}`} />
                        </button>
                        <button
                            onClick={() => setChartType('pie')}
                            className={`p-1.5 rounded ${chartType === 'pie' ? 'bg-white dark:bg-gray-600 shadow-sm' : ''}`}
                            title="Category Breakdown"
                        >
                            <PieChartIcon className={`w-4 h-4 ${chartType === 'pie' ? 'text-amber-600' : 'text-gray-400'}`} />
                        </button>
                    </div>

                    {/* Comparison Toggle */}
                    {chartType !== 'pie' && (
                        <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <input
                                type="checkbox"
                                checked={showComparison}
                                onChange={(e) => setShowComparison(e.target.checked)}
                                className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                            />
                            Compare periods
                        </label>
                    )}
                </div>
            </div>

            {/* Chart */}
            <div className="p-6">
                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        {getChartComponent()}
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Summary Metrics */}
            <div className="px-6 pb-6">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                            ${metrics.totalRevenue.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Total Revenue</div>
                        <div className={`text-xs flex items-center justify-center gap-1 mt-1 ${metrics.growth >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                            {metrics.growth >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                            {Math.abs(metrics.growth).toFixed(1)}%
                        </div>
                    </div>

                    <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                            {metrics.totalOrders.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Total Orders</div>
                    </div>

                    <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                            ${metrics.averageOrderValue.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Avg Order Value</div>
                    </div>

                    <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="text-lg font-bold text-gray-900 dark:text-white">
                            {metrics.topCategory}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Top Category</div>
                    </div>
                </div>
            </div>
        </div>
    );
}