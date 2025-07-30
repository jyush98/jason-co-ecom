'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    RadialBarChart,
    RadialBar,
    Treemap
} from 'recharts';
import {
    MapPin,
    TrendingUp,
    Globe,
    Download,
    RefreshCw,
    Users,
    DollarSign,
    BarChart3,
    Target,
    Zap
} from 'lucide-react';

// Types
interface GeographicData {
    region: string;
    customers: number;
    revenue: number;
    percentage: number;
    color?: string;
}

interface GeographicMetrics {
    totalRegions: number;
    topRegion: string;
    totalCustomers: number;
    totalRevenue: number;
    averageRevenuePerRegion: number;
    averageCustomersPerRegion: number;
}

type TimeRange = '7d' | '30d' | '90d' | '1y';
type ChartType = 'bar' | 'pie' | 'radial' | 'treemap';

// Regional colors
const REGION_COLORS = {
    'North America': '#FFD700', // Gold
    'Europe': '#87CEEB',        // Sky Blue
    'Asia Pacific': '#DDA0DD',  // Plum
    'Latin America': '#98FB98', // Pale Green
    'Middle East': '#F0E68C',   // Khaki
    'Africa': '#FFA07A',        // Light Salmon
    'Other': '#D3D3D3'          // Light Gray
};

// Component
export default function GeographicChart() {
    const [timeRange, setTimeRange] = useState<TimeRange>('30d');
    const [chartType, setChartType] = useState<ChartType>('bar');
    const [isLoading, setIsLoading] = useState(false);
    const [data, setData] = useState<GeographicData[]>([]);
    const [metrics, setMetrics] = useState<GeographicMetrics | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Load geographic data
    const loadData = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`/api/admin/analytics/geographic?timeRange=${timeRange}`);

            if (!response.ok) {
                throw new Error('Failed to fetch geographic data');
            }

            const result: GeographicData[] = await response.json();

            // Add colors to the data
            const dataWithColors = result.map(item => ({
                ...item,
                color: REGION_COLORS[item.region as keyof typeof REGION_COLORS] || REGION_COLORS.Other
            }));

            setData(dataWithColors);

            // Calculate metrics
            const totalCustomers = dataWithColors.reduce((sum, item) => sum + item.customers, 0);
            const totalRevenue = dataWithColors.reduce((sum, item) => sum + item.revenue, 0);
            const topRegion = dataWithColors.length > 0 ? dataWithColors[0].region : 'No Data';

            setMetrics({
                totalRegions: dataWithColors.length,
                topRegion,
                totalCustomers,
                totalRevenue,
                averageRevenuePerRegion: dataWithColors.length > 0 ? totalRevenue / dataWithColors.length : 0,
                averageCustomersPerRegion: dataWithColors.length > 0 ? totalCustomers / dataWithColors.length : 0
            });

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load geographic data');
            console.error('Geographic analytics error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [timeRange]);

    // Custom tooltip component
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (!active || !payload || !payload.length) return null;

        const data = payload[0]?.payload;
        if (!data) return null;

        return (
            <div className="bg-slate-900/95 backdrop-blur-sm border border-slate-700 rounded-lg p-3 shadow-xl">
                <p className="text-white font-medium mb-2">{data.region}</p>
                <div className="space-y-1">
                    <p className="text-slate-300 text-sm">
                        Customers: <span className="text-white font-medium">{data.customers.toLocaleString()}</span>
                    </p>
                    <p className="text-slate-300 text-sm">
                        Revenue: <span className="text-white font-medium">${data.revenue.toLocaleString()}</span>
                    </p>
                    <p className="text-slate-300 text-sm">
                        Market Share: <span className="text-white font-medium">{data.percentage}%</span>
                    </p>
                </div>
            </div>
        );
    };

    // Time range options
    const timeRanges = [
        { value: '7d' as TimeRange, label: '7 Days' },
        { value: '30d' as TimeRange, label: '30 Days' },
        { value: '90d' as TimeRange, label: '90 Days' },
        { value: '1y' as TimeRange, label: '1 Year' },
    ];

    // Chart type options
    const chartTypes = [
        { value: 'bar' as ChartType, label: 'Bar Chart', icon: BarChart3 },
        { value: 'pie' as ChartType, label: 'Pie Chart', icon: Target },
        { value: 'radial' as ChartType, label: 'Radial Chart', icon: Zap },
        { value: 'treemap' as ChartType, label: 'Tree Map', icon: Globe },
    ];

    const renderChart = () => {
        if (isLoading) {
            return (
                <div className="flex items-center justify-center h-96">
                    <div className="flex items-center space-x-2 text-slate-400">
                        <RefreshCw className="w-6 h-6 animate-spin" />
                        <span>Loading geographic analytics...</span>
                    </div>
                </div>
            );
        }

        if (error) {
            return (
                <div className="flex items-center justify-center h-96">
                    <div className="text-center text-slate-400">
                        <Globe className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>{error}</p>
                        <button
                            onClick={loadData}
                            className="mt-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white text-sm transition-colors"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            );
        }

        if (!data.length) {
            return (
                <div className="flex items-center justify-center h-96">
                    <div className="text-center text-slate-400">
                        <Globe className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>No geographic data available for this time period</p>
                    </div>
                </div>
            );
        }

        switch (chartType) {
            case 'bar':
                return (
                    <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={data} layout="horizontal">
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis type="number" stroke="#9CA3AF" tick={{ fill: '#9CA3AF' }} />
                            <YAxis
                                dataKey="region"
                                type="category"
                                stroke="#9CA3AF"
                                tick={{ fill: '#9CA3AF' }}
                                width={120}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            <Bar
                                dataKey="customers"
                                fill="#87CEEB"
                                radius={[0, 4, 4, 0]}
                                name="Customers"
                            />
                            <Bar
                                dataKey="revenue"
                                fill="#FFD700"
                                radius={[0, 4, 4, 0]}
                                name="Revenue ($)"
                            />
                        </BarChart>
                    </ResponsiveContainer>
                );

            case 'pie':
                return (
                    <ResponsiveContainer width="100%" height={400}>
                        <PieChart>
                            <Pie
                                data={data.map(({ region, revenue, ...rest }) => ({
                                    name: region,
                                    value: revenue,
                                    ...rest,
                                }))}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ region, percentage }) => `${region}: ${percentage}%`}
                                outerRadius={120}
                                fill="#8884d8"
                                dataKey="revenue"
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                    </ResponsiveContainer>
                );

            case 'radial':
                return (
                    <ResponsiveContainer width="100%" height={400}>
                        <RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="80%" data={data}>
                            <RadialBar
                                // minAngle={15}
                                label={{ position: 'insideStart', fill: '#fff' }}
                                background
                                // clockWise
                                dataKey="revenue"
                                fill="#FFD700"
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </RadialBar>
                            <Legend iconSize={18} layout="vertical" verticalAlign="middle" align="right" />
                            <Tooltip content={<CustomTooltip />} />
                        </RadialBarChart>
                    </ResponsiveContainer>
                );

            case 'treemap':
                return (
                    <ResponsiveContainer width="100%" height={400}>
                        <Treemap
                            data={data.map(({ region, revenue, ...rest }) => ({
                                name: region,
                                value: revenue,
                                ...rest,
                            }))}
                            dataKey="revenue"
                            // ratio={4 / 3}
                            stroke="#374151"
                            fill="#FFD700"
                            content={({ root, depth, x, y, width, height, index, payload, colors, name }) => {
                                if (depth === 1) {
                                    return (
                                        <g>
                                            <rect
                                                x={x}
                                                y={y}
                                                width={width}
                                                height={height}
                                                style={{
                                                    fill: payload?.color || '#FFD700',
                                                    stroke: '#374151',
                                                    strokeWidth: 2,
                                                    strokeOpacity: 1,
                                                }}
                                            />
                                            {width > 60 && height > 30 && (
                                                <>
                                                    <text
                                                        x={x + width / 2}
                                                        y={y + height / 2 - 6}
                                                        textAnchor="middle"
                                                        fill="#fff"
                                                        fontSize="12"
                                                        fontWeight="bold"
                                                    >
                                                        {payload?.region}
                                                    </text>
                                                    <text
                                                        x={x + width / 2}
                                                        y={y + height / 2 + 8}
                                                        textAnchor="middle"
                                                        fill="#fff"
                                                        fontSize="10"
                                                    >
                                                        ${(payload?.revenue / 1000).toFixed(0)}K
                                                    </text>
                                                </>
                                            )}
                                        </g>
                                    );
                                }
                                return <React.Fragment />;
                            }}
                        />
                    </ResponsiveContainer>
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
                        <MapPin className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-white">Geographic Analytics</h3>
                        <p className="text-slate-400 text-sm">Customer and revenue distribution by region</p>
                    </div>
                </div>

                <div className="flex items-center space-x-2">
                    <button
                        onClick={loadData}
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

            {/* Controls */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:space-x-6 mb-6 space-y-4 lg:space-y-0">
                {/* Chart Type Selector */}
                <div className="flex flex-wrap gap-2">
                    {chartTypes.map((type) => {
                        const Icon = type.icon;
                        return (
                            <button
                                key={type.value}
                                onClick={() => setChartType(type.value)}
                                className={`flex items-center space-x-2 px-3 py-2 rounded-lg border transition-all duration-200 ${chartType === type.value
                                        ? 'bg-amber-500/20 border-amber-500/30 text-amber-400'
                                        : 'bg-slate-800/50 border-slate-600 text-slate-300 hover:bg-slate-700/50'
                                    }`}
                            >
                                <Icon className="w-4 h-4" />
                                <span className="text-sm">{type.label}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Time Range Selector */}
                <div className="flex space-x-1 bg-slate-800/50 rounded-lg p-1 border border-slate-600">
                    {timeRanges.map((range) => (
                        <button
                            key={range.value}
                            onClick={() => setTimeRange(range.value)}
                            className={`px-3 py-1 rounded-md text-sm font-medium transition-all duration-200 ${timeRange === range.value
                                    ? 'bg-amber-500 text-slate-900'
                                    : 'text-slate-300 hover:text-white hover:bg-slate-700'
                                }`}
                        >
                            {range.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Metrics Cards */}
            {metrics && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-4 bg-slate-800/50 rounded-lg border border-slate-700"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-400 text-sm">Total Revenue</p>
                                <p className="text-white text-2xl font-bold">${(metrics.totalRevenue / 1000).toFixed(0)}K</p>
                            </div>
                            <div className="p-2 bg-green-500/20 rounded-lg">
                                <DollarSign className="w-5 h-5 text-green-400" />
                            </div>
                        </div>
                        <div className="flex items-center mt-2">
                            <span className="text-green-400 text-sm">Global reach</span>
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
                                <p className="text-slate-400 text-sm">Total Customers</p>
                                <p className="text-white text-2xl font-bold">{metrics.totalCustomers.toLocaleString()}</p>
                            </div>
                            <div className="p-2 bg-blue-500/20 rounded-lg">
                                <Users className="w-5 h-5 text-blue-400" />
                            </div>
                        </div>
                        <div className="flex items-center mt-2">
                            <span className="text-blue-400 text-sm">Worldwide</span>
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
                                <p className="text-slate-400 text-sm">Top Region</p>
                                <p className="text-white text-lg font-bold truncate">{metrics.topRegion}</p>
                            </div>
                            <div className="p-2 bg-amber-500/20 rounded-lg">
                                <Target className="w-5 h-5 text-amber-400" />
                            </div>
                        </div>
                        <div className="flex items-center mt-2">
                            <TrendingUp className="w-4 h-4 text-amber-400 mr-1" />
                            <span className="text-amber-400 text-sm">Best performer</span>
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
                                <p className="text-slate-400 text-sm">Active Regions</p>
                                <p className="text-white text-2xl font-bold">{metrics.totalRegions}</p>
                            </div>
                            <div className="p-2 bg-purple-500/20 rounded-lg">
                                <Globe className="w-5 h-5 text-purple-400" />
                            </div>
                        </div>
                        <div className="flex items-center mt-2">
                            <span className="text-purple-400 text-sm">Markets served</span>
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

            {/* Regional Breakdown Table */}
            {data.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="mt-6 bg-slate-800/30 rounded-lg p-4 border border-slate-700"
                >
                    <h4 className="text-white font-medium mb-4">Regional Performance Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {data.map((region, index) => (
                            <motion.div
                                key={region.region}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 * index }}
                                className="p-4 bg-slate-800/50 rounded-lg border border-slate-700"
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center space-x-2">
                                        <div
                                            className="w-3 h-3 rounded-full"
                                            style={{ backgroundColor: region.color }}
                                        />
                                        <h5 className="text-white font-medium">{region.region}</h5>
                                    </div>
                                    <span className="text-amber-400 text-sm font-medium">{region.percentage}%</span>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-400">Revenue:</span>
                                        <span className="text-white font-medium">${region.revenue.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-400">Customers:</span>
                                        <span className="text-white font-medium">{region.customers.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-400">Avg per Customer:</span>
                                        <span className="text-white font-medium">
                                            ${region.customers > 0 ? (region.revenue / region.customers).toFixed(0) : '0'}
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            )}
        </motion.div>
    );
}