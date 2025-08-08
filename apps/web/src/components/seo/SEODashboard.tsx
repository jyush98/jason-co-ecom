// components/seo/SEODashboard.tsx
// Fixed SEO monitoring dashboard with proper imports and types

'use client';

import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Search, Eye, MousePointer, BarChart3, AlertTriangle, CheckCircle } from 'lucide-react';

// Simple UI components that work with your existing setup
interface CardProps {
    children: React.ReactNode;
    className?: string;
}

const Card = ({ children, className = '' }: CardProps) => (
    <div className={`bg-white rounded-lg border shadow-sm ${className}`}>
        {children}
    </div>
);

const CardHeader = ({ children, className = '' }: CardProps) => (
    <div className={`p-6 pb-2 ${className}`}>
        {children}
    </div>
);

const CardContent = ({ children, className = '' }: CardProps) => (
    <div className={`p-6 pt-2 ${className}`}>
        {children}
    </div>
);

const CardTitle = ({ children, className = '' }: CardProps) => (
    <h3 className={`text-lg font-semibold leading-none tracking-tight ${className}`}>
        {children}
    </h3>
);

// Simple Tabs component
interface TabsProps {
    defaultValue: string;
    children: React.ReactNode;
    className?: string;
}

const Tabs = ({ defaultValue, children, className = '' }: TabsProps) => {
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
    <div className={`inline-flex h-10 items-center justify-center rounded-md bg-gray-100 p-1 text-gray-500 ${className}`}>
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
                ? 'bg-white text-gray-950 shadow-sm'
                : 'hover:bg-gray-200'
            }`}
        onClick={() => setActiveTab(value)}
    >
        {children}
    </button>
);

const TabsContent = ({ value, children, activeTab }: any) => (
    activeTab === value ? <div>{children}</div> : null
);

// Simple Button component
interface ButtonProps {
    children: React.ReactNode;
    variant?: 'default' | 'outline' | 'destructive' | 'secondary';
    size?: 'sm' | 'default' | 'lg';
    className?: string;
    onClick?: () => void;
}

const Button = ({ children, variant = 'default', size = 'default', className = '', onClick }: ButtonProps) => {
    const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';

    const variantClasses = {
        default: 'bg-gray-900 text-gray-50 hover:bg-gray-900/90',
        outline: 'border border-gray-200 bg-white hover:bg-gray-100 hover:text-gray-900',
        destructive: 'bg-red-500 text-gray-50 hover:bg-red-500/90',
        secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-100/80'
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

// Simple Badge component
interface BadgeProps {
    children: React.ReactNode;
    variant?: 'default' | 'secondary' | 'destructive' | 'outline';
    className?: string;
}

const Badge = ({ children, variant = 'default', className = '' }: BadgeProps) => {
    const baseClasses = 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2';

    const variantClasses = {
        default: 'bg-gray-900 text-gray-50 hover:bg-gray-900/80',
        secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-100/80',
        destructive: 'bg-red-500 text-gray-50 hover:bg-red-500/80',
        outline: 'text-gray-950 border border-gray-200'
    };

    return (
        <div className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
            {children}
        </div>
    );
};

// Fixed interfaces for Search Console data
interface SearchConsoleSummary {
    total_clicks: number;
    total_impressions: number;
    average_ctr: number;
    average_position: number;
    top_10_keywords: number;
    mobile_clicks_percentage: number;
    opportunity_keywords: number;
}

interface KeywordData {
    query: string;
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
    opportunity_score: number;
}

interface PageData {
    page: string;
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
    page_type: 'product' | 'category' | 'homepage' | 'gallery' | 'custom';
}

interface DeviceData {
    mobile: {
        clicks: number;
        impressions: number;
        ctr: number;
        position: number;
    };
    desktop: {
        clicks: number;
        impressions: number;
        ctr: number;
        position: number;
    };
}

interface OpportunityData {
    high_impression_low_ctr: KeywordData[];
    positions_11_20: KeywordData[];
}

interface RecommendationData {
    type: string;
    priority: 'high' | 'medium' | 'low';
    title: string;
    description: string;
    keywords?: KeywordData[];
}

interface SearchConsoleData {
    summary: SearchConsoleSummary;
    keywords: KeywordData[];
    pages: PageData[];
    devices: DeviceData;
    opportunities: OpportunityData;
    recommendations: RecommendationData[];
}

// Mock data function (fixed types)
function getMockSearchConsoleData(): SearchConsoleData {
    return {
        summary: {
            total_clicks: 2847,
            total_impressions: 45230,
            average_ctr: 6.3,
            average_position: 8.2,
            top_10_keywords: 34,
            mobile_clicks_percentage: 68.4,
            opportunity_keywords: 12
        },
        keywords: [
            { query: 'luxury engagement rings', clicks: 145, impressions: 2340, ctr: 6.2, position: 4.1, opportunity_score: 8.5 },
            { query: 'custom wedding bands', clicks: 98, impressions: 1876, ctr: 5.2, position: 6.8, opportunity_score: 7.2 },
            { query: 'handmade jewelry design', clicks: 76, impressions: 1432, ctr: 5.3, position: 7.9, opportunity_score: 6.8 },
            { query: 'diamond necklace luxury', clicks: 54, impressions: 987, ctr: 5.5, position: 9.2, opportunity_score: 5.9 },
            { query: 'gold earrings custom', clicks: 43, impressions: 823, ctr: 5.2, position: 11.4, opportunity_score: 7.8 },
            { query: 'silver bracelet handmade', clicks: 38, impressions: 756, ctr: 5.0, position: 12.1, opportunity_score: 6.5 },
            { query: 'platinum wedding ring', clicks: 35, impressions: 642, ctr: 5.5, position: 8.7, opportunity_score: 5.2 },
            { query: 'custom jewelry designer', clicks: 32, impressions: 598, ctr: 5.4, position: 9.8, opportunity_score: 5.8 }
        ],
        pages: [
            { page: '/', clicks: 423, impressions: 5670, ctr: 7.5, position: 5.2, page_type: 'homepage' },
            { page: '/shop', clicks: 287, impressions: 4230, ctr: 6.8, position: 6.1, page_type: 'category' },
            { page: '/product/engagement-ring-1', clicks: 156, impressions: 2340, ctr: 6.7, position: 4.8, page_type: 'product' },
            { page: '/gallery', clicks: 98, impressions: 1876, ctr: 5.2, position: 8.1, page_type: 'gallery' },
            { page: '/custom-orders', clicks: 76, impressions: 1123, ctr: 6.8, position: 7.3, page_type: 'custom' }
        ],
        devices: {
            mobile: { clicks: 1946, impressions: 30956, ctr: 6.3, position: 8.7 },
            desktop: { clicks: 901, impressions: 14274, ctr: 6.3, position: 7.4 }
        },
        opportunities: {
            high_impression_low_ctr: [
                { query: 'jewelry store near me', clicks: 23, impressions: 1234, ctr: 1.9, position: 12.3, opportunity_score: 8.5 },
                { query: 'buy engagement ring online', clicks: 18, impressions: 987, ctr: 1.8, position: 15.1, opportunity_score: 7.8 }
            ],
            positions_11_20: [
                { query: 'custom jewelry designer', clicks: 34, impressions: 567, ctr: 6.0, position: 13.2, opportunity_score: 6.5 },
                { query: 'luxury jewelry brand', clicks: 28, impressions: 432, ctr: 6.5, position: 14.8, opportunity_score: 6.2 }
            ]
        },
        recommendations: [
            {
                type: 'ctr_optimization',
                priority: 'high',
                title: 'Optimize Title Tags and Meta Descriptions',
                description: '8 keywords have high impressions but low CTR. Improve titles and descriptions.'
            },
            {
                type: 'position_improvement',
                priority: 'high',
                title: 'Push Keywords from Page 2 to Page 1',
                description: '12 keywords are close to first page. Focus on content optimization.'
            }
        ]
    };
}

// Helper function to generate trend data
// function generateTrendData(days: number) {
//     const data = [];
//     const today = new Date();

//     for (let i = days - 1; i >= 0; i--) {
//         const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
//         const dayOfWeek = date.getDay();

//         // Simulate realistic luxury jewelry traffic patterns
//         const baseClicks = 85 + Math.random() * 30;
//         const weekendMultiplier = dayOfWeek === 0 || dayOfWeek === 6 ? 0.7 : 1;
//         const trendMultiplier = 1 + (days - i) / days * 0.2; // Growing trend

//         data.push({
//             date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
//             clicks: Math.round(baseClicks * weekendMultiplier * trendMultiplier),
//             impressions: Math.round(baseClicks * weekendMultiplier * trendMultiplier * 15), // Scaled for chart
//             ctr: (5.5 + Math.random() * 2).toFixed(1)
//         });
//     }

//     return data;
// }

// Main dashboard component
interface SEODashboardProps {
    useMockData?: boolean;
    days?: number;
}

export function SEODashboard({ days = 30 }: SEODashboardProps) {
    const [selectedTimeRange, setSelectedTimeRange] = useState(days);

    // For now, always use mock data to avoid API issues
    const data = getMockSearchConsoleData();
    const loading = false;
    const error = null;

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {[...Array(4)].map((_, i) => (
                        <Card key={i} className="animate-pulse">
                            <CardContent className="p-6">
                                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <Card className="border-red-200">
                <CardContent className="p-6">
                    <div className="flex items-center space-x-2 text-red-600">
                        <AlertTriangle className="h-5 w-5" />
                        <span>Error loading SEO data: {error}</span>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (!data) return null;

    const { summary, keywords, pages, devices, opportunities, recommendations } = data;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">SEO Performance Dashboard</h1>
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

            {/* Summary Metrics */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Clicks</p>
                                <p className="text-2xl font-bold">{summary.total_clicks.toLocaleString()}</p>
                            </div>
                            <MousePointer className="h-8 w-8 text-blue-600" />
                        </div>
                        <div className="mt-2 flex items-center text-sm">
                            <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                            <span className="text-green-600">+12.5% vs last period</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Impressions</p>
                                <p className="text-2xl font-bold">{summary.total_impressions.toLocaleString()}</p>
                            </div>
                            <Eye className="h-8 w-8 text-purple-600" />
                        </div>
                        <div className="mt-2 flex items-center text-sm">
                            <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                            <span className="text-green-600">+8.3% vs last period</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Average CTR</p>
                                <p className="text-2xl font-bold">{summary.average_ctr.toFixed(1)}%</p>
                            </div>
                            <BarChart3 className="h-8 w-8 text-orange-600" />
                        </div>
                        <div className="mt-2 flex items-center text-sm">
                            <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                            <span className="text-green-600">+0.4% vs last period</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Avg. Position</p>
                                <p className="text-2xl font-bold">{summary.average_position.toFixed(1)}</p>
                            </div>
                            <Search className="h-8 w-8 text-indigo-600" />
                        </div>
                        <div className="mt-2 flex items-center text-sm">
                            <TrendingDown className="h-4 w-4 text-green-600 mr-1" />
                            <span className="text-green-600">-0.8 vs last period</span>
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
                                        <span className="text-sm font-medium">Mobile</span>
                                        <div className="flex items-center space-x-2">
                                            <div className="text-sm text-gray-600">
                                                {devices.mobile.clicks.toLocaleString()} clicks
                                            </div>
                                            <Badge variant="secondary">
                                                {summary.mobile_clicks_percentage.toFixed(1)}%
                                            </Badge>
                                        </div>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-blue-600 h-2 rounded-full"
                                            style={{ width: `${summary.mobile_clicks_percentage}%` }}
                                        ></div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">Desktop</span>
                                        <div className="flex items-center space-x-2">
                                            <div className="text-sm text-gray-600">
                                                {devices.desktop.clicks.toLocaleString()} clicks
                                            </div>
                                            <Badge variant="outline">
                                                {(100 - summary.mobile_clicks_percentage).toFixed(1)}%
                                            </Badge>
                                        </div>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
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
                                        <span className="text-sm">Keywords in Top 10</span>
                                        <Badge className="bg-green-100 text-green-800">
                                            {summary.top_10_keywords}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm">High Opportunity Keywords</span>
                                        <Badge className="bg-orange-100 text-orange-800">
                                            {summary.opportunity_keywords}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm">Total Indexed Pages</span>
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
                            <p className="text-sm text-gray-600">Luxury jewelry search terms driving the most traffic</p>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="text-left py-2">Keyword</th>
                                            <th className="text-right py-2">Clicks</th>
                                            <th className="text-right py-2">Impressions</th>
                                            <th className="text-right py-2">CTR</th>
                                            <th className="text-right py-2">Position</th>
                                            <th className="text-right py-2">Opportunity</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {keywords.map((keyword, index) => (
                                            <tr key={index} className="border-b hover:bg-gray-50">
                                                <td className="py-3 font-medium">{keyword.query}</td>
                                                <td className="text-right py-3">{keyword.clicks.toLocaleString()}</td>
                                                <td className="text-right py-3">{keyword.impressions.toLocaleString()}</td>
                                                <td className="text-right py-3">{keyword.ctr.toFixed(1)}%</td>
                                                <td className="text-right py-3">
                                                    <Badge
                                                        variant={keyword.position <= 10 ? "default" : "secondary"}
                                                        className={keyword.position <= 10 ? "bg-green-100 text-green-800" : ""}
                                                    >
                                                        {keyword.position.toFixed(1)}
                                                    </Badge>
                                                </td>
                                                <td className="text-right py-3">
                                                    <Badge
                                                        variant={keyword.opportunity_score > 5 ? "destructive" : "outline"}
                                                        className={keyword.opportunity_score > 5 ? "bg-orange-100 text-orange-800" : ""}
                                                    >
                                                        {keyword.opportunity_score.toFixed(1)}
                                                    </Badge>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Pages Tab */}
                <TabsContent value="pages" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Page Performance</CardTitle>
                            <p className="text-sm text-gray-600">How individual pages perform in search results</p>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="text-left py-2">Page</th>
                                            <th className="text-center py-2">Type</th>
                                            <th className="text-right py-2">Clicks</th>
                                            <th className="text-right py-2">Impressions</th>
                                            <th className="text-right py-2">CTR</th>
                                            <th className="text-right py-2">Position</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {pages.map((page, index) => (
                                            <tr key={index} className="border-b hover:bg-gray-50">
                                                <td className="py-3 font-medium max-w-xs truncate">{page.page}</td>
                                                <td className="text-center py-3">
                                                    <Badge variant="outline" className="capitalize">
                                                        {page.page_type}
                                                    </Badge>
                                                </td>
                                                <td className="text-right py-3">{page.clicks.toLocaleString()}</td>
                                                <td className="text-right py-3">{page.impressions.toLocaleString()}</td>
                                                <td className="text-right py-3">{page.ctr.toFixed(1)}%</td>
                                                <td className="text-right py-3">
                                                    <Badge
                                                        variant={page.position <= 10 ? "default" : "secondary"}
                                                        className={page.position <= 10 ? "bg-green-100 text-green-800" : ""}
                                                    >
                                                        {page.position.toFixed(1)}
                                                    </Badge>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
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
                                <p className="text-sm text-gray-600">Keywords with high visibility but poor click-through rates</p>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {opportunities.high_impression_low_ctr.map((keyword, index) => (
                                        <div key={index} className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                                            <div>
                                                <p className="font-medium text-sm">{keyword.query}</p>
                                                <p className="text-xs text-gray-600">
                                                    {keyword.impressions.toLocaleString()} impressions, {keyword.ctr.toFixed(1)}% CTR
                                                </p>
                                            </div>
                                            <Badge className="bg-orange-100 text-orange-800">
                                                Pos {keyword.position.toFixed(1)}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <TrendingUp className="h-5 w-5 text-blue-500" />
                                    <span>Near First Page</span>
                                </CardTitle>
                                <p className="text-sm text-gray-600">Keywords ranking 11-20 that could reach first page</p>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {opportunities.positions_11_20.map((keyword, index) => (
                                        <div key={index} className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                                            <div>
                                                <p className="font-medium text-sm">{keyword.query}</p>
                                                <p className="text-xs text-gray-600">
                                                    {keyword.clicks} clicks, {keyword.ctr.toFixed(1)}% CTR
                                                </p>
                                            </div>
                                            <Badge className="bg-blue-100 text-blue-800">
                                                Pos {keyword.position.toFixed(1)}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Recommendations */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Action Items</h3>
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
                                            <p className="text-sm text-gray-600 mt-1">{rec.description}</p>
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
                </TabsContent>
            </Tabs>
        </div>
    );
}