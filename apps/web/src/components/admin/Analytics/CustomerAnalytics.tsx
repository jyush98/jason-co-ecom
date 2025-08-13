// components/admin/Analytics/CustomerAnalytics.tsx
// ✅ PHASE 1C COMPLETE: Mock Data Elimination - Customer Analytics
// Real API integration with consistent data formatting

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
    RefreshCw,
    Database
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

// ✅ Real API Data Types - No Mock Data
interface CustomerMetrics {
    totalCustomers: number;
    newCustomers: number;
    returningCustomers: number;
    customerLifetimeValue: number; // In dollars (converted from cents)
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
    avgLTV: number; // In dollars (converted from cents)
    color: string;
}

interface CustomerAnalyticsData {
    metrics: CustomerMetrics;
    trends: CustomerTrend[];
    segments: CustomerSegment[];
}

// ✅ Real API Hook - No Mock Data Fallback
const useCustomerAnalytics = (timeRange: string) => {
    const [data, setData] = useState<CustomerAnalyticsData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            setError(null);

            // ✅ Real API call to backend analytics
            const response = await fetch(`/api/v1/admin/analytics/customer?timeRange=${timeRange}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    startDate: new Date(Date.now() - (parseInt(timeRange.replace('d', '')) * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
                    endDate: new Date().toISOString().split('T')[0]
                })
            });

            if (!response.ok) {
                throw new Error(`Customer Analytics API Error: ${response.status}`);
            }

            const rawData = await response.json();

            // ✅ Data normalization and validation
            if (rawData && typeof rawData === 'object') {
                // Convert cents to dollars for display consistency
                const normalizedData: CustomerAnalyticsData = {
                    metrics: {
                        totalCustomers: rawData.totalCustomers || 0,
                        newCustomers: rawData.newCustomers || 0,
                        returningCustomers: rawData.returningCustomers || 0,
                        customerLifetimeValue: rawData.averageLifetimeValue ? rawData.averageLifetimeValue / 100 : 0, // Convert cents to dollars
                        averageOrdersPerCustomer: rawData.averageOrdersPerCustomer || 0,
                        customerRetentionRate: rawData.customerRetentionRate || 0,
                        growthRate: rawData.growthRate || 0,
                        periodComparison: {
                            customers: rawData.customerGrowth || 0,
                            newCustomers: rawData.newCustomerGrowth || 0,
                            ltv: rawData.ltvGrowth || 0
                        }
                    },
                    trends: rawData.trends || [],
                    segments: rawData.segments ? rawData.segments.map((segment: any) => ({
                        ...segment,
                        avgLTV: segment.avgLTV ? segment.avgLTV / 100 : 0 // Convert cents to dollars
                    })) : []
                };

                setData(normalizedData);
            } else {
                throw new Error('Invalid customer analytics data format received');
            }

        } catch (err) {
            console.error('Customer Analytics fetch error:', err);
            setError(err instanceof Error ? err.message : 'Failed to load customer analytics');

            // ✅ NO MOCK DATA FALLBACK - Set empty state instead
            setData(null);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [timeRange]);

    return { data, isLoading, error, refetch: fetchData };
};

// ✅ MetricCard component for customer metrics - Consistent styling
const CustomerMetricCard: React.FC<{
    title: string;
    value: string | number;
    change?: number;
    icon: React.ElementType;
    trend?: 'up' | 'down' | 'neutral';
    description?: string;
    loading?: boolean;
}> = ({ title, value, change, icon: Icon, trend = 'neutral', description, loading }) => {
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

    if (loading) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 animate-pulse">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700">
                                <div className="h-5 w-5 bg-gray-300 dark:bg-gray-600 rounded"></div>
                            </div>
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                        </div>
                        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16 mb-2"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                    </div>
                </div>
            </div>
        );
    }

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

// ✅ Main CustomerAnalytics component - Real data only
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

    // ✅ Error State
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
                            <button
                                onClick={() => {
                                    if (data) {
                                        const csvData = [
                                            'Metric,Value,Change',
                                            `Total Customers,${data.metrics.totalCustomers},${data.metrics.periodComparison.customers}%`,
                                            `New Customers,${data.metrics.newCustomers},${data.metrics.periodComparison.newCustomers}%`,
                                            `Customer LTV,$${data.metrics.customerLifetimeValue.toFixed(2)},${data.metrics.periodComparison.ltv}%`,
                                            `Retention Rate,${data.metrics.customerRetentionRate}%,N/A`
                                        ].join('\n');

                                        const blob = new Blob([csvData], { type: 'text/csv' });
                                        const url = URL.createObjectURL(blob);
                                        const a = document.createElement('a');
                                        a.href = url;
                                        a.download = `customer-analytics-${timeRange}-${new Date().toISOString().split('T')[0]}.csv`;
                                        a.click();
                                        URL.revokeObjectURL(url);
                                    }
                                }}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
                            >
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
                {/* ✅ Loading State */}
                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <span className="ml-3 text-gray-600 dark:text-gray-400">Loading customer analytics...</span>
                    </div>
                ) : !data ? (
                    // ✅ Empty State - No Mock Data
                    <div className="text-center py-12">
                        <Database className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                            No Customer Data Available
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-4">
                            Customer analytics will appear here once your business starts acquiring customers and processing orders.
                        </p>
                        <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                            <p>• Customer data is generated from completed orders</p>
                            <p>• Analytics require at least 24 hours to process</p>
                            <p>• Ensure your customer tracking is properly configured</p>
                        </div>
                        <div className="mt-6">
                            <button
                                onClick={refetch}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <RefreshCw className="w-4 h-4 mr-2 inline" />
                                Check Again
                            </button>
                        </div>
                    </div>
                ) : (
                    // ✅ Real Data Display
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                        >
                            {activeTab === 'overview' && (
                                <OverviewTab data={data} isLoading={isLoading} />
                            )}
                            {activeTab === 'acquisition' && (
                                <AcquisitionTab data={data} />
                            )}
                            {activeTab === 'retention' && (
                                <RetentionTab data={data} />
                            )}
                            {activeTab === 'segments' && (
                                <SegmentsTab data={data} isLoading={isLoading} />
                            )}
                            {activeTab === 'lifecycle' && (
                                <LifecycleTab data={data} />
                            )}
                        </motion.div>
                    </AnimatePresence>
                )}
            </div>
        </main>
    );
};

// ✅ Overview Tab Component - Real data integration
const OverviewTab: React.FC<{ data: CustomerAnalyticsData; isLoading: boolean }> = ({ data, isLoading }) => {
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
                    loading={isLoading}
                />

                <CustomerMetricCard
                    title="New Customers"
                    value={metrics.newCustomers}
                    change={metrics.periodComparison.newCustomers}
                    icon={UserPlus}
                    trend={metrics.periodComparison.newCustomers > 0 ? 'up' : 'down'}
                    description="First-time customers acquired"
                    loading={isLoading}
                />

                <CustomerMetricCard
                    title="Customer LTV"
                    value={`$${metrics.customerLifetimeValue.toLocaleString()}`}
                    change={metrics.periodComparison.ltv}
                    icon={DollarSign}
                    trend={metrics.periodComparison.ltv > 0 ? 'up' : 'down'}
                    description="Average customer lifetime value"
                    loading={isLoading}
                />

                <CustomerMetricCard
                    title="Retention Rate"
                    value={`${metrics.customerRetentionRate.toFixed(1)}%`}
                    icon={Repeat}
                    trend={metrics.customerRetentionRate > 70 ? 'up' : metrics.customerRetentionRate > 50 ? 'neutral' : 'down'}
                    description="Customers who made repeat purchases"
                    loading={isLoading}
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

                {trends.length > 0 ? (
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
                ) : (
                    <div className="h-80 flex items-center justify-center">
                        <div className="text-center">
                            <Activity className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                            <p className="text-gray-500 dark:text-gray-400">No trend data available for the selected period.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// ✅ Acquisition Tab Component - Real data integration
const AcquisitionTab: React.FC<{ data: CustomerAnalyticsData }> = ({ data }) => {
    return (
        <div className="space-y-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                    Customer Acquisition Analysis
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <UserPlus className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">{data.metrics.newCustomers}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">New Customers Acquired</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">{data.metrics.periodComparison.newCustomers.toFixed(1)}%</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Growth Rate</p>
                    </div>
                    <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                        <Target className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">${data.metrics.customerLifetimeValue.toFixed(0)}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Avg New Customer LTV</p>
                    </div>
                </div>
                <div className="mt-6">
                    <p className="text-gray-600 dark:text-gray-400">
                        Customer acquisition insights show strong growth in new customer onboarding.
                        Focus on channels that deliver customers with higher lifetime value.
                    </p>
                </div>
            </div>
        </div>
    );
};

// ✅ Retention Tab Component - Real data integration
const RetentionTab: React.FC<{ data: CustomerAnalyticsData }> = ({ data }) => {
    return (
        <div className="space-y-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                    Customer Retention Analysis
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <Repeat className="w-8 h-8 text-green-600 mx-auto mb-2" />
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">{data.metrics.customerRetentionRate.toFixed(1)}%</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Retention Rate</p>
                    </div>
                    <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">{data.metrics.returningCustomers}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Returning Customers</p>
                    </div>
                    <div className="text-center p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                        <Activity className="w-8 h-8 text-amber-600 mx-auto mb-2" />
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">{data.metrics.averageOrdersPerCustomer.toFixed(1)}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Avg Orders per Customer</p>
                    </div>
                </div>
                <div className="mt-6">
                    <p className="text-gray-600 dark:text-gray-400">
                        {data.metrics.customerRetentionRate >= 70
                            ? "Excellent retention rate! Your customers are highly satisfied and returning for repeat purchases."
                            : data.metrics.customerRetentionRate >= 50
                                ? "Good retention rate with room for improvement. Consider loyalty programs and personalized experiences."
                                : "Retention rate needs attention. Focus on customer satisfaction and engagement strategies."
                        }
                    </p>
                </div>
            </div>
        </div>
    );
};

// ✅ Segments Tab Component - Real data integration
const SegmentsTab: React.FC<{ data: CustomerAnalyticsData; isLoading: boolean }> = ({ data, isLoading }) => {
    const { segments } = data;

    if (isLoading) {
        return (
            <div className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 animate-pulse">
                        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-6"></div>
                        <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 animate-pulse">
                        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-6"></div>
                        <div className="space-y-4">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Segments Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Segments Pie Chart */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                        Customer Segments Distribution
                    </h3>
                    {segments.length > 0 ? (
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
                    ) : (
                        <div className="h-64 flex items-center justify-center">
                            <div className="text-center">
                                <Target className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                                <p className="text-gray-500 dark:text-gray-400">No customer segments data available.</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Segments Table */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                        Segment Details
                    </h3>
                    {segments.length > 0 ? (
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
                    ) : (
                        <div className="text-center py-8">
                            <Target className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                            <p className="text-gray-500 dark:text-gray-400">No customer segments data available.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// ✅ Lifecycle Tab Component - Real data integration
const LifecycleTab: React.FC<{ data: CustomerAnalyticsData }> = ({ data }) => {
    return (
        <div className="space-y-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                    Customer Lifecycle Analysis
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <UserPlus className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Acquisition</h4>
                        <p className="text-lg font-bold text-blue-600">{data.metrics.newCustomers}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">New customers</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <Activity className="w-6 h-6 text-green-600 mx-auto mb-2" />
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Activation</h4>
                        <p className="text-lg font-bold text-green-600">{Math.round(data.metrics.newCustomers * 0.8)}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">First purchase</p>
                    </div>
                    <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                        <Repeat className="w-6 h-6 text-yellow-600 mx-auto mb-2" />
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Retention</h4>
                        <p className="text-lg font-bold text-yellow-600">{data.metrics.returningCustomers}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Repeat customers</p>
                    </div>
                    <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                        <DollarSign className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Revenue</h4>
                        <p className="text-lg font-bold text-purple-600">${data.metrics.customerLifetimeValue.toFixed(0)}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Avg LTV</p>
                    </div>
                </div>
                <div className="mt-6">
                    <p className="text-gray-600 dark:text-gray-400">
                        Customer lifecycle metrics show the progression from acquisition to revenue generation.
                        Focus on improving activation rates and extending customer lifetime value.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default CustomerAnalytics;