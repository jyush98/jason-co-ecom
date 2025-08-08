'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users,
    TrendingUp,
    UserPlus,
    Repeat,
    DollarSign,
    Activity,
    Target,
    AlertTriangle,
    Download,
    RefreshCw
} from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from 'recharts';

// Types for Customer Analytics
interface CustomerMetrics {
    totalCustomers: number;
    newCustomers: number;
    returningCustomers: number;
    customerLifetimeValue: number;
    averageOrdersPerCustomer: number;
    customerRetentionRate: number;
    growthRate: number;
    periodComparison: {
        customers: number;
        newCustomers: number;
        ltv: number;
    };
}

interface CustomerTrend {
    date: string;
    newCustomers: number;
    totalCustomers: number;
    activeCustomers: number;
    returningCustomers: number;
    churnRate: number;
    retentionRate: number;
}

interface CustomerSegment {
    segment: string;
    count: number;
    percentage: number;
    avgLTV: number;
    color: string;
}

interface CustomerAnalyticsData {
    metrics: CustomerMetrics;
    trends: CustomerTrend[];
    segments: CustomerSegment[];
}

// Custom hook for customer analytics data
const useCustomerAnalytics = (timeRange: string) => {
    const [data, setData] = useState<CustomerAnalyticsData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            setError(null);

            const response = await fetch(`/api/admin/analytics/customer?timeRange=${timeRange}`);

            if (!response.ok) {
                throw new Error('Failed to fetch customer analytics');
            }

            const analyticsData = await response.json();
            setData(analyticsData);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [timeRange]);

    return { data, isLoading, error, refetch: fetchData };
};

// MetricCard component for customer metrics
const CustomerMetricCard: React.FC<{
    title: string;
    value: string | number;
    change?: number;
    icon: React.ElementType;
    trend?: 'up' | 'down' | 'neutral';
    description?: string;
}> = ({ title, value, change, icon: Icon, trend = 'neutral', description }) => {
    const getTrendColor = () => {
        switch (trend) {
            case 'up': return 'text-green-600 dark:text-green-400';
            case 'down': return 'text-red-600 dark:text-red-400';
            default: return 'text-gray-600 dark:text-gray-400';
        }
    };

    const getTrendBg = () => {
        switch (trend) {
            case 'up': return 'bg-green-50 dark:bg-green-900/20';
            case 'down': return 'bg-red-50 dark:bg-red-900/20';
            default: return 'bg-gray-50 dark:bg-gray-800';
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
        >
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                        <div className={`p-2 rounded-lg ${getTrendBg()}`}>
                            <Icon className={`h-5 w-5 ${getTrendColor()}`} />
                        </div>
                        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            {title}
                        </h3>
                    </div>

                    <div className="space-y-1">
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            {typeof value === 'number' ? value.toLocaleString() : value}
                        </p>

                        {change !== undefined && (
                            <div className="flex items-center gap-1">
                                <TrendingUp className={`h-4 w-4 ${getTrendColor()}`} />
                                <span className={`text-sm font-medium ${getTrendColor()}`}>
                                    {change > 0 ? '+' : ''}{change.toFixed(1)}%
                                </span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                    vs previous period
                                </span>
                            </div>
                        )}

                        {description && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                {description}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

// Main CustomerAnalytics component
const CustomerAnalytics: React.FC = () => {
    const [timeRange, setTimeRange] = useState('30d');
    const [activeTab, setActiveTab] = useState('overview');

    const { data, isLoading, error, refetch } = useCustomerAnalytics(timeRange);

    // Tab configuration
    const tabs = [
        { id: 'overview', label: 'Overview', icon: Users },
        { id: 'acquisition', label: 'Acquisition', icon: UserPlus },
        { id: 'retention', label: 'Retention', icon: Repeat },
        { id: 'segments', label: 'Segments', icon: Target },
        { id: 'lifecycle', label: 'Lifecycle', icon: Activity }
    ];

    const timeRangeOptions = [
        { value: '7d', label: 'Last 7 days' },
        { value: '30d', label: 'Last 30 days' },
        { value: '90d', label: 'Last 90 days' },
        { value: '365d', label: 'Last year' }
    ];

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        Error Loading Customer Analytics
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
                    <button
                        onClick={refetch}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Sticky Header */}
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-6 py-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                Customer Intelligence Center
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400 mt-1">
                                Deep insights into customer behavior, retention, and lifetime value
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

                            {/* Refresh Button */}
                            <button
                                onClick={refetch}
                                disabled={isLoading}
                                className="p-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50"
                            >
                                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                            </button>

                            {/* Export Button */}
                            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2">
                                <Download className="h-4 w-4" />
                                Export
                            </button>
                        </div>
                    </div>

                    {/* Tab Navigation */}
                    <div className="flex space-x-1 mt-6 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === tab.id
                                        ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm'
                                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                                        }`}
                                >
                                    <Icon className="h-4 w-4" />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <span className="ml-3 text-gray-600 dark:text-gray-400">Loading customer analytics...</span>
                    </div>
                ) : (
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                        >
                            {activeTab === 'overview' && data && (
                                <OverviewTab data={data} />
                            )}
                            {activeTab === 'acquisition' && data && (
                                <AcquisitionTab />
                            )}
                            {activeTab === 'retention' && data && (
                                <RetentionTab />
                            )}
                            {activeTab === 'segments' && data && (
                                <SegmentsTab data={data} />
                            )}
                            {activeTab === 'lifecycle' && data && (
                                <LifecycleTab />
                            )}
                        </motion.div>
                    </AnimatePresence>
                )}
            </div>
        </main>
    );
};

// Overview Tab Component
const OverviewTab: React.FC<{ data: CustomerAnalyticsData }> = ({ data }) => {
    const { metrics, trends } = data;

    return (
        <div className="space-y-8">
            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <CustomerMetricCard
                    title="Total Customers"
                    value={metrics.totalCustomers}
                    change={metrics.growthRate}
                    icon={Users}
                    trend={metrics.growthRate > 0 ? 'up' : metrics.growthRate < 0 ? 'down' : 'neutral'}
                    description="Active customers in selected period"
                />

                <CustomerMetricCard
                    title="New Customers"
                    value={metrics.newCustomers}
                    change={metrics.periodComparison.newCustomers}
                    icon={UserPlus}
                    trend={metrics.periodComparison.newCustomers > 0 ? 'up' : 'down'}
                    description="First-time customers acquired"
                />

                <CustomerMetricCard
                    title="Customer LTV"
                    value={`$${metrics.customerLifetimeValue.toLocaleString()}`}
                    change={metrics.periodComparison.ltv}
                    icon={DollarSign}
                    trend={metrics.periodComparison.ltv > 0 ? 'up' : 'down'}
                    description="Average customer lifetime value"
                />

                <CustomerMetricCard
                    title="Retention Rate"
                    value={`${metrics.customerRetentionRate}%`}
                    icon={Repeat}
                    trend={metrics.customerRetentionRate > 70 ? 'up' : metrics.customerRetentionRate > 50 ? 'neutral' : 'down'}
                    description="Customers who made repeat purchases"
                />
            </div>

            {/* Customer Trends Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Customer Acquisition Trends
                    </h3>
                    <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                            <span className="text-gray-600 dark:text-gray-400">New Customers</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            <span className="text-gray-600 dark:text-gray-400">Returning Customers</span>
                        </div>
                    </div>
                </div>

                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={trends}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                            <XAxis
                                dataKey="date"
                                stroke="#6B7280"
                                fontSize={12}
                                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            />
                            <YAxis stroke="#6B7280" fontSize={12} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#1F2937',
                                    border: 'none',
                                    borderRadius: '8px',
                                    color: '#F9FAFB'
                                }}
                                labelFormatter={(value) => new Date(value).toLocaleDateString()}
                            />
                            <Legend />
                            <Area
                                type="monotone"
                                dataKey="newCustomers"
                                stackId="1"
                                stroke="#3B82F6"
                                fill="#3B82F6"
                                fillOpacity={0.6}
                                name="New Customers"
                            />
                            <Area
                                type="monotone"
                                dataKey="returningCustomers"
                                stackId="1"
                                stroke="#10B981"
                                fill="#10B981"
                                fillOpacity={0.6}
                                name="Returning Customers"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

// Acquisition Tab Component - No data parameter since it's not used yet
const AcquisitionTab: React.FC = () => {
    return (
        <div className="space-y-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                    Customer Acquisition Analysis
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                    Detailed acquisition metrics and channels will be displayed here.
                </p>
            </div>
        </div>
    );
};

// Retention Tab Component - No data parameter since it's not used yet
const RetentionTab: React.FC = () => {
    return (
        <div className="space-y-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                    Customer Retention Analysis
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                    Retention cohorts and churn analysis will be displayed here.
                </p>
            </div>
        </div>
    );
};

// Segments Tab Component
const SegmentsTab: React.FC<{ data: CustomerAnalyticsData }> = ({ data }) => {
    const { segments } = data;

    return (
        <div className="space-y-8">
            {/* Segments Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Segments Pie Chart */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                        Customer Segments Distribution
                    </h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={segments}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="count"
                                >
                                    {segments.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#1F2937',
                                        border: 'none',
                                        borderRadius: '8px',
                                        color: '#F9FAFB'
                                    }}
                                />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Segments Table */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                        Segment Details
                    </h3>
                    <div className="space-y-4">
                        {segments.map((segment, index) => (
                            <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-4 h-4 rounded-full"
                                        style={{ backgroundColor: segment.color }}
                                    ></div>
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-white">
                                            {segment.segment}
                                        </p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            {segment.count} customers ({segment.percentage}%)
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-semibold text-gray-900 dark:text-white">
                                        ${segment.avgLTV.toLocaleString()}
                                    </p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Avg LTV
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Lifecycle Tab Component - No data parameter since it's not used yet
const LifecycleTab: React.FC = () => {
    return (
        <div className="space-y-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                    Customer Lifecycle Analysis
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                    Customer journey stages and lifecycle metrics will be displayed here.
                </p>
            </div>
        </div>
    );
};

export default CustomerAnalytics;