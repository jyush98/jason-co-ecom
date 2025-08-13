// components/seo/SEODashboard.tsx
// ✅ PHASE 1C COMPLETE: Mock Data Elimination - SEO Dashboard
// Real API integration with Google Search Console + graceful fallbacks

'use client';

import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Search, Eye, MousePointer, BarChart3, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';

// ✅ Real API Integration - No Mock Data
interface SEOAnalyticsData {
    summary: {
        total_clicks: number;
        total_impressions: number;
        average_ctr: number;
        average_position: number;
        top_10_keywords: number;
        mobile_clicks_percentage: number;
        opportunity_keywords: number;
    };
    keywords: Array<{
        query: string;
        clicks: number;
        impressions: number;
        ctr: number;
        position: number;
        opportunity_score: number;
    }>;
    pages: Array<{
        page: string;
        clicks: number;
        impressions: number;
        ctr: number;
        position: number;
        page_type: 'product' | 'category' | 'homepage' | 'gallery' | 'custom';
    }>;
    devices: {
        mobile: { clicks: number; impressions: number; ctr: number; position: number; };
        desktop: { clicks: number; impressions: number; ctr: number; position: number; };
    };
    opportunities: {
        high_impression_low_ctr: Array<{ query: string; clicks: number; impressions: number; ctr: number; position: number; opportunity_score: number; }>;
        positions_11_20: Array<{ query: string; clicks: number; impressions: number; ctr: number; position: number; opportunity_score: number; }>;
    };
    recommendations: Array<{
        type: string;
        priority: 'high' | 'medium' | 'low';
        title: string;
        description: string;
    }>;
}

// ✅ Real API Hook - No Mock Data
function useSEOAnalytics(timeRange: number) {
    const [data, setData] = useState<SEOAnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchSEOData = async () => {
        try {
            setLoading(true);
            setError(null);

            // ✅ Real API call to backend SEO analytics
            const response = await fetch(`/api/v1/seo/analytics?days=${timeRange}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error(`SEO API Error: ${response.status}`);
            }

            const seoData = await response.json();

            // ✅ Data validation and normalization
            if (seoData && typeof seoData === 'object') {
                setData(seoData);
            } else {
                throw new Error('Invalid SEO data format received');
            }

        } catch (err) {
            console.error('SEO Analytics fetch error:', err);
            setError(err instanceof Error ? err.message : 'Failed to load SEO analytics');

            // ✅ NO MOCK DATA FALLBACK - Set empty state instead
            setData(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSEOData();
    }, [timeRange]);

    return { data, loading, error, refetch: fetchSEOData };
}

// Simple UI components
const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
    <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm ${className}`}>
        {children}
    </div>
);

const CardHeader = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
    <div className={`p-6 pb-2 ${className}`}>{children}</div>
);

const CardContent = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
    <div className={`p-6 pt-2 ${className}`}>{children}</div>
);

const CardTitle = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
    <h3 className={`text-lg font-semibold leading-none tracking-tight text-gray-900 dark:text-white ${className}`}>
        {children}
    </h3>
);

const Tabs = ({ defaultValue, children, className = '' }: { defaultValue: string; children: React.ReactNode; className?: string }) => {
    const [activeTab, setActiveTab] = useState(defaultValue);
    return (
        <div className={className}>
            {React.Children.map(children, child =>
                React.isValidElement(child)
                    ? React.cloneElement(child as React.ReactElement<any>, { activeTab, setActiveTab })
                    : child
            )}
        </div>
    );
};

const TabsList = ({ children, className = '', activeTab, setActiveTab }: any) => (
    <div className={`inline-flex h-10 items-center justify-center rounded-md bg-gray-100 dark:bg-gray-700 p-1 text-gray-500 dark:text-gray-400 ${className}`}>
        {React.Children.map(children, child =>
            React.isValidElement(child)
                ? React.cloneElement(child as React.ReactElement<any>, { activeTab, setActiveTab })
                : child
        )}
    </div>
);

const TabsTrigger = ({ value, children, activeTab, setActiveTab }: any) => (
    <button
        className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${activeTab === value
                ? 'bg-white dark:bg-gray-800 text-gray-950 dark:text-white shadow-sm'
                : 'hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
        onClick={() => setActiveTab(value)}
    >
        {children}
    </button>
);

const TabsContent = ({ value, children, activeTab }: any) => (
    activeTab === value ? <div>{children}</div> : null
);

const Button = ({ children, variant = 'default', size = 'default', className = '', onClick }: {
    children: React.ReactNode;
    variant?: 'default' | 'outline' | 'destructive' | 'secondary';
    size?: 'sm' | 'default' | 'lg';
    className?: string;
    onClick?: () => void;
}) => {
    const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';
    const variantClasses = {
        default: 'bg-gray-900 dark:bg-gray-100 text-gray-50 dark:text-gray-900 hover:bg-gray-900/90 dark:hover:bg-gray-100/90',
        outline: 'border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white',
        destructive: 'bg-red-500 text-gray-50 hover:bg-red-500/90',
        secondary: 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-100/80 dark:hover:bg-gray-700/80'
    };
    const sizeClasses = {
        sm: 'h-9 px-3 text-sm',
        default: 'h-10 px-4 py-2',
        lg: 'h-11 px-8'
    };

    return (
        <button
            className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
            onClick={onClick}
        >
            {children}
        </button>
    );
};

const Badge = ({ children, variant = 'default', className = '' }: {
    children: React.ReactNode;
    variant?: 'default' | 'secondary' | 'destructive' | 'outline';
    className?: string;
}) => {
    const baseClasses = 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2';
    const variantClasses = {
        default: 'bg-gray-900 dark:bg-gray-100 text-gray-50 dark:text-gray-900 hover:bg-gray-900/80',
        secondary: 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-100/80',
        destructive: 'bg-red-500 text-gray-50 hover:bg-red-500/80',
        outline: 'text-gray-950 dark:text-gray-50 border border-gray-200 dark:border-gray-700'
    };

    return (
        <div className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
            {children}
        </div>
    );
};

// ✅ Main SEO Dashboard Component - Real Data Only
interface SEODashboardProps {
    days?: number;
}

export function SEODashboard({ days = 30 }: SEODashboardProps) {
    const [selectedTimeRange, setSelectedTimeRange] = useState(days);

    // ✅ Real API Integration - No Mock Data
    const { data, loading, error, refetch } = useSEOAnalytics(selectedTimeRange);

    // ✅ Loading State
    if (loading) {
        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">SEO Performance Dashboard</h1>
                    <div className="flex items-center space-x-2">
                        <RefreshCw className="w-4 h-4 animate-spin text-gray-500" />
                        <span className="text-sm text-gray-500 dark:text-gray-400">Loading SEO data...</span>
                    </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {[...Array(4)].map((_, i) => (
                        <Card key={i} className="animate-pulse">
                            <CardContent className="p-6">
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    // ✅ Error State
    if (error) {
        return (
            <Card className="border-red-200 dark:border-red-800">
                <CardContent className="p-6">
                    <div className="flex items-center space-x-2 text-red-600 dark:text-red-400">
                        <AlertTriangle className="h-5 w-5" />
                        <span>Error loading SEO data: {error}</span>
                    </div>
                    <div className="mt-4">
                        <Button onClick={refetch} variant="outline" size="sm">
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Retry
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    // ✅ Empty State - No Mock Data Fallback
    if (!data) {
        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">SEO Performance Dashboard</h1>
                    <div className="flex space-x-2">
                        {[7, 30, 90].map((range) => (
                            <Button
                                key={range}
                                variant={selectedTimeRange === range ? "default" : "outline"}
                                size="sm"
                                onClick={() => setSelectedTimeRange(range)}
                            >
                                {range} days
                            </Button>
                        ))}
                    </div>
                </div>

                <Card>
                    <CardContent className="p-12 text-center">
                        <Search className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                            No SEO Data Available
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                            SEO analytics will appear here once your website starts receiving search traffic and Google Search Console is properly configured.
                        </p>
                        <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                            <p>• Connect Google Search Console to your website</p>
                            <p>• Wait for search data to accumulate (typically 24-48 hours)</p>
                            <p>• Ensure your site is properly indexed by Google</p>
                        </div>
                        <div className="mt-6">
                            <Button onClick={refetch} variant="outline">
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Check Again
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // ✅ Real Data Display
    const { summary, keywords, pages, devices, opportunities, recommendations } = data;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">SEO Performance Dashboard</h1>
                <div className="flex space-x-2">
                    {[7, 30, 90].map((range) => (
                        <Button
                            key={range}
                            variant={selectedTimeRange === range ? "default" : "outline"}
                            size="sm"
                            onClick={() => setSelectedTimeRange(range)}
                        >
                            {range} days
                        </Button>
                    ))}
                    <Button onClick={refetch} variant="outline" size="sm">
                        <RefreshCw className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Summary Metrics */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Clicks</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{summary.total_clicks.toLocaleString()}</p>
                            </div>
                            <MousePointer className="h-8 w-8 text-blue-600" />
                        </div>
                        <div className="mt-2 flex items-center text-sm">
                            <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                            <span className="text-green-600">Search traffic performance</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Impressions</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{summary.total_impressions.toLocaleString()}</p>
                            </div>
                            <Eye className="h-8 w-8 text-purple-600" />
                        </div>
                        <div className="mt-2 flex items-center text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Search visibility</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Average CTR</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{summary.average_ctr.toFixed(1)}%</p>
                            </div>
                            <BarChart3 className="h-8 w-8 text-orange-600" />
                        </div>
                        <div className="mt-2 flex items-center text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Click-through rate</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg. Position</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{summary.average_position.toFixed(1)}</p>
                            </div>
                            <Search className="h-8 w-8 text-indigo-600" />
                        </div>
                        <div className="mt-2 flex items-center text-sm">
                            {summary.average_position <= 10 ? (
                                <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                            ) : (
                                <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
                            )}
                            <span className={summary.average_position <= 10 ? "text-green-600" : "text-red-600"}>
                                {summary.average_position <= 10 ? "Strong ranking" : "Needs improvement"}
                            </span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Dashboard Tabs */}
            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="keywords">Keywords</TabsTrigger>
                    <TabsTrigger value="pages">Pages</TabsTrigger>
                    <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        {/* Device Performance */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Device Performance</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Mobile</span>
                                        <div className="flex items-center space-x-2">
                                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                                {devices.mobile.clicks.toLocaleString()} clicks
                                            </div>
                                            <Badge variant="secondary">
                                                {summary.mobile_clicks_percentage.toFixed(1)}%
                                            </Badge>
                                        </div>
                                    </div>
                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                        <div
                                            className="bg-blue-600 h-2 rounded-full"
                                            style={{ width: `${summary.mobile_clicks_percentage}%` }}
                                        ></div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Desktop</span>
                                        <div className="flex items-center space-x-2">
                                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                                {devices.desktop.clicks.toLocaleString()} clicks
                                            </div>
                                            <Badge variant="outline">
                                                {(100 - summary.mobile_clicks_percentage).toFixed(1)}%
                                            </Badge>
                                        </div>
                                    </div>
                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                        <div
                                            className="bg-gray-600 h-2 rounded-full"
                                            style={{ width: `${100 - summary.mobile_clicks_percentage}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Quick Stats */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Performance Highlights</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">Keywords in Top 10</span>
                                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                                            {summary.top_10_keywords}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">High Opportunity Keywords</span>
                                        <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400">
                                            {summary.opportunity_keywords}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">Total Indexed Pages</span>
                                        <Badge variant="outline">
                                            {pages.length}
                                        </Badge>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Keywords Tab */}
                <TabsContent value="keywords" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Top Performing Keywords</CardTitle>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Luxury jewelry search terms driving the most traffic</p>
                        </CardHeader>
                        <CardContent>
                            {keywords.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b dark:border-gray-700">
                                                <th className="text-left py-2 text-gray-900 dark:text-white">Keyword</th>
                                                <th className="text-right py-2 text-gray-900 dark:text-white">Clicks</th>
                                                <th className="text-right py-2 text-gray-900 dark:text-white">Impressions</th>
                                                <th className="text-right py-2 text-gray-900 dark:text-white">CTR</th>
                                                <th className="text-right py-2 text-gray-900 dark:text-white">Position</th>
                                                <th className="text-right py-2 text-gray-900 dark:text-white">Opportunity</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {keywords.map((keyword, index) => (
                                                <tr key={index} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                                    <td className="py-3 font-medium text-gray-900 dark:text-white">{keyword.query}</td>
                                                    <td className="text-right py-3 text-gray-900 dark:text-white">{keyword.clicks.toLocaleString()}</td>
                                                    <td className="text-right py-3 text-gray-900 dark:text-white">{keyword.impressions.toLocaleString()}</td>
                                                    <td className="text-right py-3 text-gray-900 dark:text-white">{keyword.ctr.toFixed(1)}%</td>
                                                    <td className="text-right py-3">
                                                        <Badge
                                                            variant={keyword.position <= 10 ? "default" : "secondary"}
                                                            className={keyword.position <= 10 ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400" : ""}
                                                        >
                                                            {keyword.position.toFixed(1)}
                                                        </Badge>
                                                    </td>
                                                    <td className="text-right py-3">
                                                        <Badge
                                                            variant={keyword.opportunity_score > 5 ? "destructive" : "outline"}
                                                            className={keyword.opportunity_score > 5 ? "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400" : ""}
                                                        >
                                                            {keyword.opportunity_score.toFixed(1)}
                                                        </Badge>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <Search className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                                    <p className="text-gray-500 dark:text-gray-400">No keyword data available for the selected period.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Pages Tab */}
                <TabsContent value="pages" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Page Performance</CardTitle>
                            <p className="text-sm text-gray-600 dark:text-gray-400">How individual pages perform in search results</p>
                        </CardHeader>
                        <CardContent>
                            {pages.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b dark:border-gray-700">
                                                <th className="text-left py-2 text-gray-900 dark:text-white">Page</th>
                                                <th className="text-center py-2 text-gray-900 dark:text-white">Type</th>
                                                <th className="text-right py-2 text-gray-900 dark:text-white">Clicks</th>
                                                <th className="text-right py-2 text-gray-900 dark:text-white">Impressions</th>
                                                <th className="text-right py-2 text-gray-900 dark:text-white">CTR</th>
                                                <th className="text-right py-2 text-gray-900 dark:text-white">Position</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {pages.map((page, index) => (
                                                <tr key={index} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                                    <td className="py-3 font-medium max-w-xs truncate text-gray-900 dark:text-white">{page.page}</td>
                                                    <td className="text-center py-3">
                                                        <Badge variant="outline" className="capitalize">
                                                            {page.page_type}
                                                        </Badge>
                                                    </td>
                                                    <td className="text-right py-3 text-gray-900 dark:text-white">{page.clicks.toLocaleString()}</td>
                                                    <td className="text-right py-3 text-gray-900 dark:text-white">{page.impressions.toLocaleString()}</td>
                                                    <td className="text-right py-3 text-gray-900 dark:text-white">{page.ctr.toFixed(1)}%</td>
                                                    <td className="text-right py-3">
                                                        <Badge
                                                            variant={page.position <= 10 ? "default" : "secondary"}
                                                            className={page.position <= 10 ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400" : ""}
                                                        >
                                                            {page.position.toFixed(1)}
                                                        </Badge>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <Eye className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                                    <p className="text-gray-500 dark:text-gray-400">No page performance data available for the selected period.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Opportunities Tab */}
                <TabsContent value="opportunities" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <AlertTriangle className="h-5 w-5 text-orange-500" />
                                    <span>Low CTR High Impressions</span>
                                </CardTitle>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Keywords with high visibility but poor click-through rates</p>
                            </CardHeader>
                            <CardContent>
                                {opportunities.high_impression_low_ctr.length > 0 ? (
                                    <div className="space-y-3">
                                        {opportunities.high_impression_low_ctr.map((keyword, index) => (
                                            <div key={index} className="flex justify-between items-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                                                <div>
                                                    <p className="font-medium text-sm text-gray-900 dark:text-white">{keyword.query}</p>
                                                    <p className="text-xs text-gray-600 dark:text-gray-400">
                                                        {keyword.impressions.toLocaleString()} impressions, {keyword.ctr.toFixed(1)}% CTR
                                                    </p>
                                                </div>
                                                <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400">
                                                    Pos {keyword.position.toFixed(1)}
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-500 dark:text-gray-400 text-center py-4">No low CTR opportunities found.</p>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <TrendingUp className="h-5 w-5 text-blue-500" />
                                    <span>Near First Page</span>
                                </CardTitle>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Keywords ranking 11-20 that could reach first page</p>
                            </CardHeader>
                            <CardContent>
                                {opportunities.positions_11_20.length > 0 ? (
                                    <div className="space-y-3">
                                        {opportunities.positions_11_20.map((keyword, index) => (
                                            <div key={index} className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                                <div>
                                                    <p className="font-medium text-sm text-gray-900 dark:text-white">{keyword.query}</p>
                                                    <p className="text-xs text-gray-600 dark:text-gray-400">
                                                        {keyword.clicks} clicks, {keyword.ctr.toFixed(1)}% CTR
                                                    </p>
                                                </div>
                                                <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                                                    Pos {keyword.position.toFixed(1)}
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-500 dark:text-gray-400 text-center py-4">No near first page opportunities found.</p>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Recommendations */}
                    {recommendations.length > 0 && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Action Items</h3>
                            {recommendations.map((rec, index) => (
                                <Card key={index} className={`border-l-4 ${rec.priority === 'high' ? 'border-l-red-500' :
                                        rec.priority === 'medium' ? 'border-l-orange-500' :
                                            'border-l-blue-500'
                                    }`}>
                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <CardTitle className="flex items-center space-x-2">
                                                    <CheckCircle className="h-5 w-5 text-green-500" />
                                                    <span>{rec.title}</span>
                                                </CardTitle>
                                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{rec.description}</p>
                                            </div>
                                            <Badge
                                                variant={rec.priority === 'high' ? 'destructive' : rec.priority === 'medium' ? 'default' : 'secondary'}
                                            >
                                                {rec.priority} priority
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <Button variant="outline" size="sm">
                                            Take Action
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}