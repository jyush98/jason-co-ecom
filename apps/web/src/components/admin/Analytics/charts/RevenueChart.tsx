'use client';

import React, { useState, useMemo } from 'react';
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
    DollarSign,
    Eye,
    BarChart3,
    PieChart as PieChartIcon,
    Download,
    Filter,
    RefreshCw
} from 'lucide-react';

// Types for revenue data
interface RevenueDataPoint {
    date: string;
    revenue: number;
    orders: number;
    averageOrderValue: number;
    category?: string;
    previousPeriodRevenue?: number;
}

interface RevenueMetrics {
    totalRevenue: number;
    growth: number;
    totalOrders: number;
    averageOrderValue: number;
    topCategory: string;
}

interface RevenueChartProps {
    data?: RevenueDataPoint[];
    metrics?: RevenueMetrics;
    isLoading?: boolean;
    error?: string | null;
    onRefresh?: () => void;
    onExport?: () => void;
    className?: string;
}

// Chart visualization types
type ChartType = 'line' | 'area' | 'bar' | 'pie';
type TimeRange = '7d' | '30d' | '90d' | '1y' | 'custom';

// Sample data for development (replace with real API data)
const sampleRevenueData: RevenueDataPoint[] = [
    { date: '2024-01-01', revenue: 12500, orders: 25, averageOrderValue: 500, previousPeriodRevenue: 11200 },
    { date: '2024-01-02', revenue: 15800, orders: 31, averageOrderValue: 510, previousPeriodRevenue: 14100 },
    { date: '2024-01-03', revenue: 18200, orders: 36, averageOrderValue: 506, previousPeriodRevenue: 16800 },
    { date: '2024-01-04', revenue: 14600, orders: 29, averageOrderValue: 503, previousPeriodRevenue: 13900 },
    { date: '2024-01-05', revenue: 21300, orders: 42, averageOrderValue: 507, previousPeriodRevenue: 19200 },
    { date: '2024-01-06', revenue: 19700, orders: 38, averageOrderValue: 518, previousPeriodRevenue: 18300 },
    { date: '2024-01-07', revenue: 22900, orders: 45, averageOrderValue: 509, previousPeriodRevenue: 20800 },
    { date: '2024-01-08', revenue: 25100, orders: 48, averageOrderValue: 523, previousPeriodRevenue: 22400 },
    { date: '2024-01-09', revenue: 18900, orders: 37, averageOrderValue: 511, previousPeriodRevenue: 17600 },
    { date: '2024-01-10', revenue: 26800, orders: 52, averageOrderValue: 515, previousPeriodRevenue: 24100 },
    { date: '2024-01-11', revenue: 24200, orders: 47, averageOrderValue: 515, previousPeriodRevenue: 22800 },
    { date: '2024-01-12', revenue: 28500, orders: 55, averageOrderValue: 518, previousPeriodRevenue: 25900 },
    { date: '2024-01-13', revenue: 31200, orders: 60, averageOrderValue: 520, previousPeriodRevenue: 28100 },
    { date: '2024-01-14', revenue: 27800, orders: 54, averageOrderValue: 515, previousPeriodRevenue: 25400 }
];

const sampleCategoryData = [
    { name: 'Fine Jewelry', value: 45, revenue: 142500, color: '#D4A574' },
    { name: 'Engagement Rings', value: 30, revenue: 95000, color: '#C9A96E' },
    { name: 'Wedding Bands', value: 15, revenue: 47500, color: '#B8956A' },
    { name: 'Custom Pieces', value: 10, revenue: 31667, color: '#A78B5F' }
];

const sampleMetrics: RevenueMetrics = {
    totalRevenue: 316667,
    growth: 12.5,
    totalOrders: 618,
    averageOrderValue: 512,
    topCategory: 'Fine Jewelry'
};

// Chart configuration
const chartColors = {
    primary: '#D4A574',
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

export function RevenueChart({
    data = sampleRevenueData,
    metrics = sampleMetrics,
    isLoading = false,
    error = null,
    onRefresh,
    onExport,
    className = ''
}: RevenueChartProps) {
    const [chartType, setChartType] = useState<ChartType>('area');
    const [timeRange, setTimeRange] = useState<TimeRange>('30d');
    const [showComparison, setShowComparison] = useState(true);
    const [activeView, setActiveView] = useState<'revenue' | 'orders' | 'aov'>('revenue');

    // Process data based on selected time range
    const processedData = useMemo(() => {
        let filteredData = [...data];

        // Apply time range filtering (simplified for demo)
        const now = new Date();
        const daysBack = {
            '7d': 7,
            '30d': 30,
            '90d': 90,
            '1y': 365,
            'custom': 30 // Default to 30 for custom
        }[timeRange];

        const cutoffDate = new Date(now.getTime() - (daysBack * 24 * 60 * 60 * 1000));
        filteredData = filteredData.filter(item => new Date(item.date) >= cutoffDate);

        // Add formatted date and growth calculation
        return filteredData.map(item => ({
            ...item,
            formattedDate: new Date(item.date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
            }),
            growth: item.previousPeriodRevenue
                ? ((item.revenue - item.previousPeriodRevenue) / item.previousPeriodRevenue * 100)
                : 0
        }));
    }, [data, timeRange]);

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
            {showComparison && (
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
            {showComparison && (
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
            {showComparison && (
                <Bar
                    dataKey="previousPeriodRevenue"
                    name="Previous Period"
                    fill={chartColors.muted}
                    radius={[2, 2, 0, 0]}
                />
            )}
        </BarChart>
    );

    const renderPieChart = () => (
        <PieChart>
            <Pie
                data={sampleCategoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent ? percent : 0 * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
            >
                {sampleCategoryData.map((entry, index) => (
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

    const getChartComponent = () => {
        switch (chartType) {
            case 'line': return renderLineChart();
            case 'area': return renderAreaChart();
            case 'bar': return renderBarChart();
            case 'pie': return renderPieChart();
            default: return renderAreaChart();
        }
    };

    if (isLoading) {
        return (
            <div className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
                <div className="animate-pulse">
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
                    <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
                <div className="text-center py-12">
                    <div className="text-red-500 mb-2">⚠️</div>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">{error}</p>
                    {onRefresh && (
                        <button
                            onClick={onRefresh}
                            className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                        >
                            Try Again
                        </button>
                    )}
                </div>
            </div>
        );
    }

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
                            Track revenue trends and performance metrics
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        {onRefresh && (
                            <button
                                onClick={onRefresh}
                                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                                title="Refresh data"
                            >
                                <RefreshCw className="w-4 h-4" />
                            </button>
                        )}
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