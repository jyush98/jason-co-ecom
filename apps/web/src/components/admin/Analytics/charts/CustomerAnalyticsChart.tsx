// components/admin/Analytics/IntegratedCustomerChart.tsx
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
    AreaChart,
    Area,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    BarChart,
    Bar
} from 'recharts';
import {
    Users,
    TrendingUp,
    UserPlus,
    UserCheck,
    DollarSign,
    RefreshCw,
    Download
} from 'lucide-react';
import { useCustomerAnalytics, useGeographicAnalytics } from '@/lib/hooks/useAnalytics';

interface IntegratedCustomerChartProps {
    timeRange: string;
    chartType: string;
    onTimeRangeChange: (range: string) => void;
    onChartTypeChange: (type: string) => void;
}

export default function IntegratedCustomerChart({
    timeRange,
    chartType,
    // onTimeRangeChange,
    // onChartTypeChange
}: IntegratedCustomerChartProps) {
    const { data: customerData, isLoading: customerLoading, refetch: refetchCustomers } = useCustomerAnalytics(timeRange);
    const { data: geoData, isLoading: geoLoading } = useGeographicAnalytics(timeRange);

    const isLoading = customerLoading || geoLoading;

    // Custom tooltip component
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (!active || !payload || !payload.length) return null;

        return (
            <div className="bg-slate-900/95 backdrop-blur-sm border border-slate-700 rounded-lg p-3 shadow-xl">
                <p className="text-slate-300 text-sm mb-1">{label}</p>
                {payload.map((entry: any, index: number) => (
                    <p key={index} className="text-sm" style={{ color: entry.color }}>
                        {entry.name}: {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
                    </p>
                ))}
            </div>
        );
    };

    const renderChart = () => {
        if (isLoading) {
            return (
                <div className="flex items-center justify-center h-96">
                    <div className="flex items-center space-x-2 text-slate-400">
                        <RefreshCw className="w-6 h-6 animate-spin" />
                        <span>Loading customer analytics...</span>
                    </div>
                </div>
            );
        }

        if (!customerData) {
            return (
                <div className="flex items-center justify-center h-96">
                    <div className="text-slate-400">No customer data available</div>
                </div>
            );
        }

        switch (chartType) {
            case 'acquisition':
                return (
                    <ResponsiveContainer width="100%" height={400}>
                        <AreaChart data={customerData.trends}>
                            <defs>
                                <linearGradient id="newCustomers" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#FFD700" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#FFD700" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="returningCustomers" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#87CEEB" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#87CEEB" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis
                                dataKey="date"
                                stroke="#9CA3AF"
                                tick={{ fill: '#9CA3AF' }}
                                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            />
                            <YAxis stroke="#9CA3AF" tick={{ fill: '#9CA3AF' }} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            <Area
                                type="monotone"
                                dataKey="newCustomers"
                                stackId="1"
                                stroke="#FFD700"
                                fillOpacity={0.6}
                                fill="url(#newCustomers)"
                                name="New Customers"
                            />
                            <Area
                                type="monotone"
                                dataKey="returningCustomers"
                                stackId="1"
                                stroke="#87CEEB"
                                fillOpacity={0.6}
                                fill="url(#returningCustomers)"
                                name="Returning Customers"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                );

            case 'retention':
                return (
                    <ResponsiveContainer width="100%" height={400}>
                        <LineChart data={customerData.trends}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis
                                dataKey="date"
                                stroke="#9CA3AF"
                                tick={{ fill: '#9CA3AF' }}
                                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            />
                            <YAxis stroke="#9CA3AF" tick={{ fill: '#9CA3AF' }} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            <Line
                                type="monotone"
                                dataKey="retentionRate"
                                stroke="#10B981"
                                strokeWidth={3}
                                dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                                name="Retention Rate (%)"
                            />
                            <Line
                                type="monotone"
                                dataKey="churnRate"
                                stroke="#EF4444"
                                strokeWidth={3}
                                dot={{ fill: '#EF4444', strokeWidth: 2, r: 4 }}
                                name="Churn Rate (%)"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                );

            case 'segments':
                return (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-96">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={customerData.segments}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ segment, percentage }) => `${segment}: ${percentage}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="count"
                                >
                                    {customerData.segments?.map((entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                            </PieChart>
                        </ResponsiveContainer>

                        <div className="space-y-4">
                            {customerData.segments?.map((segment: any, index: number) => (
                                <motion.div
                                    key={segment.segment}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700"
                                >
                                    <div className="flex items-center space-x-3">
                                        <div
                                            className="w-4 h-4 rounded-full"
                                            style={{ backgroundColor: segment.color }}
                                        />
                                        <div>
                                            <p className="text-white font-medium">{segment.segment}</p>
                                            <p className="text-slate-400 text-sm">{segment.count.toLocaleString()} customers</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-white font-semibold">${segment.avgLTV.toLocaleString()}</p>
                                        <p className="text-slate-400 text-sm">Avg LTV</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                );

            case 'geographic':
                return (
                    <div className="space-y-4">
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={geoData} layout="horizontal">
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                <XAxis type="number" stroke="#9CA3AF" tick={{ fill: '#9CA3AF' }} />
                                <YAxis dataKey="region" type="category" stroke="#9CA3AF" tick={{ fill: '#9CA3AF' }} width={100} />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="customers" fill="#FFD700" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {geoData?.map((region: any, index: number) => (
                                <motion.div
                                    key={region.region}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="p-4 bg-slate-800/50 rounded-lg border border-slate-700"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="text-white font-medium">{region.region}</h4>
                                        <span className="text-amber-400 text-sm">{region.percentage}%</span>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-400">Customers:</span>
                                            <span className="text-white">{region.customers.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-400">Revenue:</span>
                                            <span className="text-white">${(region.revenue / 1000).toFixed(0)}K</span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900/50 backdrop-blur-sm rounded-lg border border-slate-700 p-6"
        >
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
                <div className="flex items-center space-x-3 mb-4 lg:mb-0">
                    <div className="p-2 bg-amber-500/20 rounded-lg">
                        <Users className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-white">Customer Analytics</h3>
                        <p className="text-slate-400 text-sm">Live customer insights from your database</p>
                    </div>
                </div>

                <div className="flex items-center space-x-2">
                    <button
                        onClick={refetchCustomers}
                        disabled={isLoading}
                        className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-600 transition-colors disabled:opacity-50"
                    >
                        <RefreshCw className={`w-4 h-4 text-slate-300 ${isLoading ? 'animate-spin' : ''}`} />
                    </button>

                    <button className="flex items-center space-x-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-600 transition-colors">
                        <Download className="w-4 h-4 text-slate-300" />
                        <span className="text-slate-300 text-sm">Export</span>
                    </button>
                </div>
            </div>

            {/* Metrics Cards */}
            {customerData?.metrics && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-4 bg-slate-800/50 rounded-lg border border-slate-700"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-400 text-sm">Total Customers</p>
                                <p className="text-white text-2xl font-bold">{customerData.metrics.totalCustomers.toLocaleString()}</p>
                            </div>
                            <div className="p-2 bg-blue-500/20 rounded-lg">
                                <Users className="w-5 h-5 text-blue-400" />
                            </div>
                        </div>
                        <div className="flex items-center mt-2">
                            <TrendingUp className="w-4 h-4 text-green-400 mr-1" />
                            <span className="text-green-400 text-sm">+{customerData.metrics.periodComparison.customers}%</span>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 }}
                        className="p-4 bg-slate-800/50 rounded-lg border border-slate-700"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-400 text-sm">New Customers</p>
                                <p className="text-white text-2xl font-bold">{customerData.metrics.newCustomers}</p>
                            </div>
                            <div className="p-2 bg-green-500/20 rounded-lg">
                                <UserPlus className="w-5 h-5 text-green-400" />
                            </div>
                        </div>
                        <div className="flex items-center mt-2">
                            <TrendingUp className="w-4 h-4 text-green-400 mr-1" />
                            <span className="text-green-400 text-sm">+{customerData.metrics.periodComparison.newCustomers}%</span>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="p-4 bg-slate-800/50 rounded-lg border border-slate-700"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-400 text-sm">Avg LTV</p>
                                <p className="text-white text-2xl font-bold">${customerData.metrics.customerLifetimeValue.toLocaleString()}</p>
                            </div>
                            <div className="p-2 bg-amber-500/20 rounded-lg">
                                <DollarSign className="w-5 h-5 text-amber-400" />
                            </div>
                        </div>
                        <div className="flex items-center mt-2">
                            <TrendingUp className="w-4 h-4 text-green-400 mr-1" />
                            <span className="text-green-400 text-sm">+{customerData.metrics.periodComparison.ltv}%</span>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 }}
                        className="p-4 bg-slate-800/50 rounded-lg border border-slate-700"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-400 text-sm">Retention Rate</p>
                                <p className="text-white text-2xl font-bold">{customerData.metrics.customerRetentionRate}%</p>
                            </div>
                            <div className="p-2 bg-purple-500/20 rounded-lg">
                                <UserCheck className="w-5 h-5 text-purple-400" />
                            </div>
                        </div>
                        <div className="flex items-center mt-2">
                            <span className="text-amber-400 text-sm">{customerData.metrics.averageOrdersPerCustomer} avg orders</span>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Chart */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-slate-800/30 rounded-lg p-4 border border-slate-700"
            >
                {renderChart()}
            </motion.div>
        </motion.div>
    );
}

