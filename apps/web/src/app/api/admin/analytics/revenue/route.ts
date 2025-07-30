// app/api/admin/analytics/revenue/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { pool } from '@/lib/db'; // Assuming you have a configured PostgreSQL pool

// Types for revenue analytics
interface RevenueDataPoint {
  date: string;
  revenue: number;
  orders: number;
  averageOrderValue: number;
  previousPeriodRevenue?: number;
}

interface RevenueMetrics {
  totalRevenue: number;
  growth: number;
  totalOrders: number;
  averageOrderValue: number;
  topCategory: string;
}

interface CategoryBreakdown {
  name: string;
  value: number;
  revenue: number;
  color: string;
}

interface RevenueAnalyticsResponse {
  data: RevenueDataPoint[];
  metrics: RevenueMetrics;
  categories: CategoryBreakdown[];
  dateRange: {
    start: string;
    end: string;
    period: string;
  };
}

// Helper function to get date range based on period
function getDateRange(period: string, customStart?: string, customEnd?: string) {
  const now = new Date();
  let startDate: Date;
  let endDate = new Date(now);

  switch (period) {
    case '7d':
      startDate = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
      break;
    case '30d':
      startDate = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
      break;
    case '90d':
      startDate = new Date(now.getTime() - (90 * 24 * 60 * 60 * 1000));
      break;
    case '1y':
      startDate = new Date(now.getTime() - (365 * 24 * 60 * 60 * 1000));
      break;
    case 'custom':
      if (customStart && customEnd) {
        startDate = new Date(customStart);
        endDate = new Date(customEnd);
      } else {
        startDate = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
      }
      break;
    default:
      startDate = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
  }

  return { startDate, endDate };
}

// Helper function to get previous period dates for comparison
function getPreviousPeriodRange(startDate: Date, endDate: Date) {
  const periodLength = endDate.getTime() - startDate.getTime();
  const previousEndDate = new Date(startDate.getTime() - 1);
  const previousStartDate = new Date(previousEndDate.getTime() - periodLength);

  return { previousStartDate, previousEndDate };
}

// Main GET handler
export async function GET(request: NextRequest) {
  try {
    // Authentication check
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // TODO: Add admin role verification
    // const user = await getUserRole(userId);
    // if (user.role !== 'admin') {
    //   return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    // }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30d';
    const customStart = searchParams.get('start');
    const customEnd = searchParams.get('end');
    const groupBy = searchParams.get('groupBy') || 'day'; // day, week, month
    const includeComparison = searchParams.get('comparison') === 'true';

    // Get date ranges
    const { startDate, endDate } = getDateRange(period, customStart || undefined, customEnd || undefined);
    const { previousStartDate, previousEndDate } = getPreviousPeriodRange(startDate, endDate);

    // Build the main revenue query
    const revenueQuery = `
      WITH daily_revenue AS (
        SELECT 
          DATE(created_at) as order_date,
          SUM(total_price) as daily_revenue,
          COUNT(*) as daily_orders,
          AVG(total_price) as avg_order_value
        FROM orders 
        WHERE 
          created_at >= $1 
          AND created_at <= $2
          AND status NOT IN ('cancelled', 'refunded')
        GROUP BY DATE(created_at)
        ORDER BY order_date
      ),
      ${includeComparison ? `
      previous_period_revenue AS (
        SELECT 
          DATE(created_at) as order_date,
          SUM(total_price) as daily_revenue
        FROM orders 
        WHERE 
          created_at >= $3 
          AND created_at <= $4
          AND status NOT IN ('cancelled', 'refunded')
        GROUP BY DATE(created_at)
      ),
      ` : ''}
      date_series AS (
        SELECT generate_series(
          DATE($1),
          DATE($2),
          '1 day'::interval
        )::date as series_date
      )
      SELECT 
        ds.series_date::text as date,
        COALESCE(dr.daily_revenue, 0) as revenue,
        COALESCE(dr.daily_orders, 0) as orders,
        COALESCE(dr.avg_order_value, 0) as average_order_value
        ${includeComparison ? ', COALESCE(ppr.daily_revenue, 0) as previous_period_revenue' : ''}
      FROM date_series ds
      LEFT JOIN daily_revenue dr ON ds.series_date = dr.order_date
      ${includeComparison ? `
      LEFT JOIN previous_period_revenue ppr ON 
        ds.series_date = ppr.order_date + INTERVAL '${Math.ceil((endDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000))} days'
      ` : ''}
      ORDER BY ds.series_date;
    `;

    // Execute revenue query
    const queryParams = includeComparison
      ? [startDate, endDate, previousStartDate, previousEndDate]
      : [startDate, endDate];

    const revenueResult = await pool.query(revenueQuery, queryParams);

    // Get overall metrics
    const metricsQuery = `
      SELECT 
        SUM(total_price) as total_revenue,
        COUNT(*) as total_orders,
        AVG(total_price) as avg_order_value
      FROM orders 
      WHERE 
        created_at >= $1 
        AND created_at <= $2
        AND status NOT IN ('cancelled', 'refunded')
    `;

    const metricsResult = await pool.query(metricsQuery, [startDate, endDate]);

    // Get previous period metrics for growth calculation
    let growth = 0;
    if (includeComparison) {
      const previousMetricsQuery = `
        SELECT SUM(total_price) as previous_revenue
        FROM orders 
        WHERE 
          created_at >= $1 
          AND created_at <= $2
          AND status NOT IN ('cancelled', 'refunded')
      `;

      const previousMetricsResult = await pool.query(previousMetricsQuery, [previousStartDate, previousEndDate]);

      const currentRevenue = parseFloat(metricsResult.rows[0]?.total_revenue || '0');
      const previousRevenue = parseFloat(previousMetricsResult.rows[0]?.previous_revenue || '0');

      if (previousRevenue > 0) {
        growth = ((currentRevenue - previousRevenue) / previousRevenue) * 100;
      }
    }

    // Get category breakdown
    const categoryQuery = `
      SELECT 
        COALESCE(oi.product_category, 'Uncategorized') as category_name,
        SUM(oi.line_total) as category_revenue,
        COUNT(DISTINCT oi.order_id) as category_orders
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      WHERE 
        o.created_at >= $1 
        AND o.created_at <= $2
        AND o.status NOT IN ('cancelled', 'refunded')
      GROUP BY oi.product_category
      ORDER BY category_revenue DESC
      LIMIT 6
    `;

    const categoryResult = await pool.query(categoryQuery, [startDate, endDate]);

    // Process category data with colors
    const categoryColors = ['#D4A574', '#C9A96E', '#B8956A', '#A78B5F', '#96825A', '#8B7355'];
    const totalCategoryRevenue = categoryResult.rows.reduce((sum, row) => sum + parseFloat(row.category_revenue), 0);

    const categories: CategoryBreakdown[] = categoryResult.rows.map((row, index) => ({
      name: row.category_name,
      value: totalCategoryRevenue > 0 ? Math.round((parseFloat(row.category_revenue) / totalCategoryRevenue) * 100) : 0,
      revenue: parseFloat(row.category_revenue),
      color: categoryColors[index % categoryColors.length]
    }));

    // Find top category
    const topCategory = categories.length > 0 ? categories[0].name : 'No Data';

    // Format response data
    const data: RevenueDataPoint[] = revenueResult.rows.map(row => ({
      date: row.date,
      revenue: parseFloat(row.revenue || '0'),
      orders: parseInt(row.orders || '0'),
      averageOrderValue: parseFloat(row.average_order_value || '0'),
      ...(includeComparison && { previousPeriodRevenue: parseFloat(row.previous_period_revenue || '0') })
    }));

    const metrics: RevenueMetrics = {
      totalRevenue: parseFloat(metricsResult.rows[0]?.total_revenue || '0'),
      growth: Math.round(growth * 100) / 100,
      totalOrders: parseInt(metricsResult.rows[0]?.total_orders || '0'),
      averageOrderValue: parseFloat(metricsResult.rows[0]?.avg_order_value || '0'),
      topCategory
    };

    const response: RevenueAnalyticsResponse = {
      data,
      metrics,
      categories,
      dateRange: {
        start: startDate.toISOString().split('T')[0],
        end: endDate.toISOString().split('T')[0],
        period
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Revenue analytics API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Optional: POST handler for custom analytics requests
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      startDate,
      endDate,
      groupBy = 'day',
      filters = {},
      includeComparison = false
    } = body;

    // Custom analytics logic here
    // This could handle more complex filtering, custom date ranges, etc.

    // For now, redirect to GET with query params
    const searchParams = new URLSearchParams({
      period: 'custom',
      start: startDate,
      end: endDate,
      groupBy,
      comparison: includeComparison.toString(),
      ...filters
    });

    // Re-use GET logic
    const url = new URL(request.url);
    url.search = searchParams.toString();

    return GET(new NextRequest(url));

  } catch (error) {
    console.error('Custom revenue analytics error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
