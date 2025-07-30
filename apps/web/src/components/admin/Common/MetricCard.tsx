"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    TrendingUp,
    TrendingDown,
    Minus,
    Info,
    MoreHorizontal,
    RefreshCw,
    Download,
    ExternalLink,
    AlertTriangle,
    CheckCircle,
    Clock,
    DollarSign,
    Users,
    ShoppingCart,
    Package,
    Target,
    ArrowUpRight,
    ArrowDownRight
} from "lucide-react";
import { formatGrowth, formatGrowthNumber } from "@/utils/analyticsUtils";

// Types for MetricCard
export interface MetricData {
    id: string;
    title: string;
    value: string | number;
    formattedValue?: string;
    previousValue?: string | number;
    change?: {
        value: number;
        type: 'increase' | 'decrease' | 'neutral';
        period: string; // e.g., "vs last month", "vs last week"
        isPercentage?: boolean;
    };
    target?: {
        value: number;
        label: string;
        progress: number; // 0-100
    };
    status?: 'success' | 'warning' | 'danger' | 'neutral';
    description?: string;
    trend?: {
        data: number[];
        color?: string;
    };
    icon?: React.ElementType;
    color?: string;
    unit?: string;
    precision?: number;
}

export interface MetricCardProps {
    metric: MetricData;
    size?: 'sm' | 'md' | 'lg';
    variant?: 'default' | 'minimal' | 'detailed';
    loading?: boolean;
    error?: string | null;
    refreshable?: boolean;
    exportable?: boolean;
    clickable?: boolean;
    showTrend?: boolean;
    showTarget?: boolean;
    className?: string;
    onRefresh?: () => void;
    onExport?: () => void;
    onClick?: () => void;
}

export default function MetricCard({
    metric,
    size = 'md',
    variant = 'default',
    loading = false,
    error = null,
    refreshable = false,
    exportable = false,
    clickable = false,
    showTrend = true,
    showTarget = true,
    className = "",
    onRefresh,
    onExport,
    onClick
}: MetricCardProps) {
    const [showActions, setShowActions] = useState(false);

    // Size configurations
    const sizeConfig = {
        sm: {
            container: "p-4",
            title: "text-sm",
            value: "text-xl",
            icon: 16,
            trend: "h-8"
        },
        md: {
            container: "p-6",
            title: "text-sm",
            value: "text-2xl",
            icon: 20,
            trend: "h-12"
        },
        lg: {
            container: "p-8",
            title: "text-base",
            value: "text-3xl",
            icon: 24,
            trend: "h-16"
        }
    };

    const config = sizeConfig[size];

    // Status colors
    const statusColors = {
        success: "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800",
        warning: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800",
        danger: "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800",
        neutral: "text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800"
    };

    // Change indicators
    const getChangeColor = (type: string) => {
        switch (type) {
            case 'increase': return 'text-green-600 dark:text-green-400';
            case 'decrease': return 'text-red-600 dark:text-red-400';
            default: return 'text-gray-600 dark:text-gray-400';
        }
    };

    const getChangeIcon = (type: string) => {
        switch (type) {
            case 'increase': return TrendingUp;
            case 'decrease': return TrendingDown;
            default: return Minus;
        }
    };

    // Format value display
    const formatValue = (value: string | number): string => {
        if (metric.formattedValue) return metric.formattedValue;

        if (typeof value === 'number') {
            if (metric.precision !== undefined) {
                return value.toFixed(metric.precision);
            }
            if (value >= 1000000) {
                return (value / 1000000).toFixed(1) + 'M';
            }
            if (value >= 1000) {
                return (value / 1000).toFixed(1) + 'K';
            }
            return value.toString();
        }

        return value.toString();
    };

    const containerClasses = `
    relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg
    transition-all duration-200 hover:shadow-md
    ${clickable ? 'cursor-pointer hover:border-gold/50' : ''}
    ${metric.status ? statusColors[metric.status] : ''}
    ${config.container}
    ${className}
  `;

    if (loading) {
        return <MetricCardSkeleton size={size} className={className} />;
    }

    if (error) {
        return <MetricCardError error={error} onRefresh={onRefresh} className={className} />;
    }

    return (
        <motion.div
            className={containerClasses}
            onClick={clickable ? onClick : undefined}
            onHoverStart={() => setShowActions(true)}
            onHoverEnd={() => setShowActions(false)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            whileHover={clickable ? { scale: 1.02 } : {}}
        >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    {metric.icon && (
                        <div className={`p-2 rounded-lg ${metric.color ? `bg-${metric.color}-100 dark:bg-${metric.color}-900/20` : 'bg-gold/10'}`}>
                            <metric.icon
                                size={config.icon}
                                className={metric.color ? `text-${metric.color}-600 dark:text-${metric.color}-400` : 'text-gold'}
                            />
                        </div>
                    )}

                    <div>
                        <h3 className={`font-medium text-gray-900 dark:text-white ${config.title}`}>
                            {metric.title}
                        </h3>
                        {metric.description && variant === 'detailed' && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {metric.description}
                            </p>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <AnimatePresence>
                    {(refreshable || exportable) && showActions && (
                        <motion.div
                            className="flex items-center gap-1"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.2 }}
                        >
                            {refreshable && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onRefresh?.();
                                    }}
                                    className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded transition-colors"
                                    title="Refresh"
                                >
                                    <RefreshCw size={14} />
                                </button>
                            )}

                            {exportable && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onExport?.();
                                    }}
                                    className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded transition-colors"
                                    title="Export"
                                >
                                    <Download size={14} />
                                </button>
                            )}

                            {clickable && (
                                <ExternalLink size={14} className="text-gray-400" />
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Value and Change */}
            <div className="mb-4">
                <div className="flex items-baseline gap-2 mb-2">
                    <span className={`font-bold text-gray-900 dark:text-white ${config.value}`}>
                        {metric.unit && metric.unit !== '$' && metric.unit !== '%' && (
                            <span className="text-lg text-gray-500 mr-1">{metric.unit}</span>
                        )}
                        {metric.unit === '$' && <span className="text-lg text-gray-500">$</span>}
                        {formatValue(metric.value)}
                        {metric.unit === '%' && <span className="text-lg text-gray-500">%</span>}
                    </span>

                    {metric.change && (
                        <div className={`flex items-center gap-1 ${getChangeColor(metric.change.type)}`}>
                            {(() => {
                                const ChangeIcon = getChangeIcon(metric.change.type);
                                return <ChangeIcon size={16} />;
                            })()}
                            <span className="text-sm font-medium">
                                {metric.change.isPercentage ? '' : metric.unit === '$' ? '$' : ''}
                                {Math.abs(metric.change.value)}
                                {metric.change.isPercentage ? '%' : ''}
                            </span>
                        </div>
                    )}
                </div>

                {metric.change && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        {metric.change.period}
                    </p>
                )}
            </div>

            {/* Target Progress */}
            {metric.target && showTarget && variant !== 'minimal' && (
                <div className="mb-4">
                    <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-2">
                        <span>{metric.target.label}</span>
                        <span>{metric.target.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <motion.div
                            className={`h-2 rounded-full ${metric.target.progress >= 100
                                    ? 'bg-green-500'
                                    : metric.target.progress >= 75
                                        ? 'bg-blue-500'
                                        : metric.target.progress >= 50
                                            ? 'bg-yellow-500'
                                            : 'bg-red-500'
                                }`}
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(metric.target.progress, 100)}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                        />
                    </div>
                </div>
            )}

            {/* Trend Chart */}
            {metric.trend && showTrend && variant !== 'minimal' && (
                <div className={`${config.trend}`}>
                    <MiniTrendChart
                        data={metric.trend.data}
                        color={metric.trend.color || metric.color || 'gold'}
                        height={config.trend}
                    />
                </div>
            )}

            {/* Status Indicator */}
            {metric.status && variant === 'detailed' && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2 text-xs">
                        {metric.status === 'success' && <CheckCircle size={14} className="text-green-500" />}
                        {metric.status === 'warning' && <AlertTriangle size={14} className="text-amber-500" />}
                        {metric.status === 'danger' && <AlertTriangle size={14} className="text-red-500" />}
                        {metric.status === 'neutral' && <Clock size={14} className="text-gray-500" />}

                        <span className="text-gray-600 dark:text-gray-400">
                            {metric.status === 'success' && 'On track'}
                            {metric.status === 'warning' && 'Needs attention'}
                            {metric.status === 'danger' && 'Critical'}
                            {metric.status === 'neutral' && 'Monitoring'}
                        </span>
                    </div>
                </div>
            )}
        </motion.div>
    );
}

// Mini Trend Chart Component
interface MiniTrendChartProps {
    data: number[];
    color?: string;
    height?: string;
}

function MiniTrendChart({ data, color = 'gold', height = 'h-12' }: MiniTrendChartProps) {
    if (!data || data.length === 0) return null;

    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;

    const points = data.map((value, index) => {
        const x = (index / (data.length - 1)) * 100;
        const y = 100 - ((value - min) / range) * 100;
        return `${x},${y}`;
    }).join(' ');

    const colorClasses = {
        gold: 'stroke-gold',
        blue: 'stroke-blue-500',
        green: 'stroke-green-500',
        red: 'stroke-red-500',
        purple: 'stroke-purple-500'
    };

    const fillClasses = {
        gold: 'fill-gold/20',
        blue: 'fill-blue-500/20',
        green: 'fill-green-500/20',
        red: 'fill-red-500/20',
        purple: 'fill-purple-500/20'
    };

    return (
        <div className={`w-full ${height} relative`}>
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                {/* Gradient area under the line */}
                <defs>
                    <linearGradient id={`gradient-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="currentColor" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
                    </linearGradient>
                </defs>

                <polygon
                    points={`0,100 ${points} 100,100`}
                    className={fillClasses[color as keyof typeof fillClasses] || 'fill-gold/20'}
                />

                {/* Trend line */}
                <polyline
                    points={points}
                    fill="none"
                    strokeWidth="2"
                    className={colorClasses[color as keyof typeof colorClasses] || 'stroke-gold'}
                />

                {/* Data points */}
                {data.map((value, index) => {
                    const x = (index / (data.length - 1)) * 100;
                    const y = 100 - ((value - min) / range) * 100;
                    return (
                        <circle
                            key={index}
                            cx={x}
                            cy={y}
                            r="1.5"
                            className={colorClasses[color as keyof typeof colorClasses] || 'stroke-gold'}
                            fill="currentColor"
                        />
                    );
                })}
            </svg>
        </div>
    );
}

// Loading Skeleton
interface MetricCardSkeletonProps {
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

function MetricCardSkeleton({ size = 'md', className = "" }: MetricCardSkeletonProps) {
    const sizeConfig = {
        sm: "p-4",
        md: "p-6",
        lg: "p-8"
    };

    return (
        <div className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg ${sizeConfig[size]} ${className}`}>
            <div className="animate-pulse">
                {/* Header */}
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                    <div className="flex-1">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2" />
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-32" />
                    </div>
                </div>

                {/* Value */}
                <div className="mb-4">
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-2" />
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20" />
                </div>

                {/* Chart */}
                <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
        </div>
    );
}

// Error State
interface MetricCardErrorProps {
    error: string;
    onRefresh?: () => void;
    className?: string;
}

function MetricCardError({ error, onRefresh, className = "" }: MetricCardErrorProps) {
    return (
        <div className={`bg-white dark:bg-gray-800 border border-red-200 dark:border-red-800 rounded-lg p-6 ${className}`}>
            <div className="text-center">
                <AlertTriangle size={24} className="text-red-500 mx-auto mb-3" />
                <p className="text-sm text-red-600 dark:text-red-400 mb-4">{error}</p>
                {onRefresh && (
                    <button
                        onClick={onRefresh}
                        className="px-4 py-2 text-sm bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                    >
                        Try Again
                    </button>
                )}
            </div>
        </div>
    );
}

// Metric Card Grid Component
interface MetricCardGridProps {
    metrics: MetricData[];
    loading?: boolean;
    error?: string | null;
    columns?: number;
    size?: 'sm' | 'md' | 'lg';
    variant?: 'default' | 'minimal' | 'detailed';
    className?: string;
    onMetricClick?: (metric: MetricData) => void;
    onRefresh?: (metricId: string) => void;
    onExport?: (metricId: string) => void;
}

export function MetricCardGrid({
    metrics,
    loading = false,
    error = null,
    columns = 4,
    size = 'md',
    variant = 'default',
    className = "",
    onMetricClick,
    onRefresh,
    onExport
}: MetricCardGridProps) {
    const gridColumns = {
        1: 'grid-cols-1',
        2: 'grid-cols-1 md:grid-cols-2',
        3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
        4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
        5: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
        6: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6'
    };

    if (error) {
        return (
            <div className="text-center py-12">
                <AlertTriangle size={32} className="text-red-500 mx-auto mb-4" />
                <p className="text-red-600 dark:text-red-400">{error}</p>
            </div>
        );
    }

    return (
        <div className={`grid ${gridColumns[columns as keyof typeof gridColumns]} gap-6 ${className}`}>
            {loading
                ? Array.from({ length: columns }).map((_, index) => (
                    <MetricCardSkeleton key={index} size={size} />
                ))
                : metrics.map((metric) => (
                    <MetricCard
                        key={metric.id}
                        metric={metric}
                        size={size}
                        variant={variant}
                        clickable={!!onMetricClick}
                        refreshable={!!onRefresh}
                        exportable={!!onExport}
                        onClick={() => onMetricClick?.(metric)}
                        onRefresh={() => onRefresh?.(metric.id)}
                        onExport={() => onExport?.(metric.id)}
                    />
                ))
            }
        </div>
    );
}

// Predefined metric configurations for common business metrics
export const createRevenueMetric = (value: number, change: number, period: string = "vs last month"): MetricData => ({
    id: 'revenue',
    title: 'Total Revenue',
    value: value,
    formattedValue: `$${(value / 1000).toFixed(1)}K`,
    change: {
        value: Math.abs(change),
        type: change >= 0 ? 'increase' : 'decrease',
        period,
        isPercentage: true
    },
    icon: DollarSign,
    color: 'green',
    status: change >= 0 ? 'success' : 'warning'
});

export const createOrdersMetric = (value: number, change: number, target?: number): MetricData => ({
    id: 'orders',
    title: 'Total Orders',
    value: value,
    change: {
        value: Math.abs(change),
        type: change >= 0 ? 'increase' : 'decrease',
        period: 'vs last month',
        isPercentage: true
    },
    target: target ? {
        value: formatGrowthNumber(target),
        label: 'Monthly Target',
        progress: formatGrowthNumber((value / target) * 100)
    } : undefined,
    icon: ShoppingCart,
    color: 'blue',
    status: change >= 0 ? 'success' : 'warning'
});

export const createCustomersMetric = (value: number, change: number): MetricData => ({
    id: 'customers',
    title: 'Active Customers',
    value: value,
    change: {
        value: Math.abs(change),
        type: change >= 0 ? 'increase' : 'decrease',
        period: 'vs last month',
        isPercentage: true
    },
    icon: Users,
    color: 'purple',
    status: 'success'
});

export const createInventoryMetric = (value: number, alerts: number): MetricData => ({
    id: 'inventory',
    title: 'Low Stock Items',
    value: value,
    description: `${alerts} items need restocking`,
    icon: Package,
    color: 'amber',
    status: value > 10 ? 'danger' : value > 5 ? 'warning' : 'success'
});