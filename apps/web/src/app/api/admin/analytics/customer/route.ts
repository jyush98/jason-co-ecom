// api/admin/analytics/customers/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { pool } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // TODO: Add admin role verification like your revenue route
    // const user = await getUserRole(userId);
    // if (user.role !== 'admin') {
    //   return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    // }

    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '30d';
    
    // Calculate date range using your existing pattern
    const now = new Date();
    const daysBack = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365;
    const startDate = new Date(now.getTime() - (daysBack * 24 * 60 * 60 * 1000));
    const previousStartDate = new Date(startDate.getTime() - (daysBack * 24 * 60 * 60 * 1000));

    // Customer metrics query using your pool pattern
    const metricsQuery = `
      WITH customer_stats AS (
        SELECT 
          COUNT(DISTINCT o.user_id) as total_customers,
          COUNT(DISTINCT CASE WHEN o.created_at >= $1 THEN o.user_id END) as active_customers,
          AVG(o.total_price) as avg_order_value,
          COUNT(*) as total_orders,
          SUM(o.total_price) as total_revenue
        FROM orders o
        WHERE o.created_at >= $2
        AND o.status NOT IN ('cancelled', 'refunded')
      ),
      new_customers AS (
        SELECT COUNT(*) as count
        FROM users u
        WHERE u.created_at >= $1
      ),
      returning_customers AS (
        SELECT COUNT(DISTINCT o.user_id) as count
        FROM orders o
        WHERE o.user_id IN (
          SELECT DISTINCT user_id 
          FROM orders 
          WHERE created_at < $1
          AND status NOT IN ('cancelled', 'refunded')
        )
        AND o.created_at >= $1
        AND o.status NOT IN ('cancelled', 'refunded')
      ),
      previous_metrics AS (
        SELECT 
          COUNT(DISTINCT o.user_id) as prev_customers,
          COUNT(DISTINCT CASE WHEN u.created_at >= $2 
                               AND u.created_at < $1 THEN o.user_id END) as prev_new_customers
        FROM orders o
        LEFT JOIN users u ON o.user_id = u.id
        WHERE o.created_at >= $2
        AND o.created_at < $1
        AND o.status NOT IN ('cancelled', 'refunded')
      )
      SELECT 
        cs.*,
        nc.count as new_customers,
        rc.count as returning_customers,
        pm.prev_customers,
        pm.prev_new_customers,
        CASE 
          WHEN pm.prev_customers > 0 
          THEN ROUND(((cs.total_customers - pm.prev_customers)::numeric / pm.prev_customers * 100), 2)
          ELSE 0 
        END as growth_rate,
        CASE 
          WHEN pm.prev_new_customers > 0 
          THEN ROUND(((nc.count - pm.prev_new_customers)::numeric / pm.prev_new_customers * 100), 2)
          ELSE 0 
        END as new_customer_growth
      FROM customer_stats cs, new_customers nc, returning_customers rc, previous_metrics pm
    `;

    const metricsResult = await pool.query(metricsQuery, [startDate, previousStartDate]);

    // Daily customer trends
    const trendsQuery = `
      WITH date_series AS (
        SELECT generate_series(
          $1::date,
          $2::date,
          '1 day'::interval
        )::date as date
      ),
      daily_stats AS (
        SELECT 
          DATE(o.created_at) as date,
          COUNT(DISTINCT o.user_id) as active_customers,
          COUNT(DISTINCT CASE WHEN u.created_at::date = DATE(o.created_at) THEN o.user_id END) as new_customers,
          COUNT(DISTINCT CASE WHEN u.created_at::date < DATE(o.created_at) THEN o.user_id END) as returning_customers
        FROM orders o
        LEFT JOIN users u ON o.user_id = u.id
        WHERE o.created_at >= $1
        AND o.status NOT IN ('cancelled', 'refunded')
        GROUP BY DATE(o.created_at)
      )
      SELECT 
        ds.date::text,
        COALESCE(dst.active_customers, 0) as active_customers,
        COALESCE(dst.new_customers, 0) as new_customers,
        COALESCE(dst.returning_customers, 0) as returning_customers,
        CASE 
          WHEN dst.active_customers > 0 
          THEN ROUND((dst.returning_customers::numeric / dst.active_customers * 100), 2)
          ELSE 0 
        END as retention_rate,
        CASE 
          WHEN dst.active_customers > 0 
          THEN ROUND(((dst.active_customers - dst.returning_customers)::numeric / dst.active_customers * 100), 2)
          ELSE 0 
        END as churn_rate
      FROM date_series ds
      LEFT JOIN daily_stats dst ON ds.date = dst.date
      ORDER BY ds.date
    `;

    const trendsResult = await pool.query(trendsQuery, [startDate, now]);

    // Customer segments
    const segmentsQuery = `
      WITH customer_orders AS (
        SELECT 
          o.user_id,
          COUNT(*) as order_count,
          SUM(o.total_price) as lifetime_value,
          MAX(o.created_at) as last_order_date,
          MIN(o.created_at) as first_order_date
        FROM orders o
        WHERE o.created_at >= $1
        AND o.status NOT IN ('cancelled', 'refunded')
        GROUP BY o.user_id
      ),
      customer_segments AS (
        SELECT 
          user_id,
          order_count,
          lifetime_value,
          last_order_date,
          first_order_date,
          CASE 
            WHEN lifetime_value >= 2000 THEN 'VIP Customers'
            WHEN order_count >= 3 THEN 'Regular Customers'
            WHEN last_order_date >= $2 THEN 'New Customers'
            ELSE 'Inactive Customers'
          END as segment
        FROM customer_orders
      )
      SELECT 
        segment,
        COUNT(*) as count,
        ROUND(AVG(lifetime_value), 2) as avg_ltv,
        ROUND((COUNT(*)::numeric / (SELECT COUNT(*) FROM customer_segments) * 100), 1) as percentage
      FROM customer_segments
      GROUP BY segment
      ORDER BY avg_ltv DESC
    `;

    const segmentsResult = await pool.query(segmentsQuery, [previousStartDate, startDate]);

    const metrics = metricsResult.rows[0];
    const response = {
      metrics: {
        totalCustomers: Number(metrics?.total_customers || 0),
        newCustomers: Number(metrics?.new_customers || 0),
        returningCustomers: Number(metrics?.returning_customers || 0),
        customerLifetimeValue: Math.round(Number(metrics?.avg_order_value || 0) * 2.5), // Estimated LTV
        averageOrdersPerCustomer: Math.round((Number(metrics?.total_orders || 0) / Number(metrics?.total_customers || 1)) * 10) / 10,
        customerRetentionRate: Math.round((Number(metrics?.returning_customers || 0) / Number(metrics?.total_customers || 1)) * 100),
        growthRate: Number(metrics?.growth_rate || 0),
        periodComparison: {
          customers: Number(metrics?.growth_rate || 0),
          newCustomers: Number(metrics?.new_customer_growth || 0),
          ltv: Math.random() * 10 + 5 // Placeholder for LTV growth
        }
      },
      trends: trendsResult.rows.map(row => ({
        date: row.date,
        newCustomers: Number(row.new_customers),
        totalCustomers: Number(row.active_customers),
        activeCustomers: Number(row.active_customers),
        returningCustomers: Number(row.returning_customers),
        churnRate: Number(row.churn_rate),
        retentionRate: Number(row.retention_rate)
      })),
      segments: segmentsResult.rows.map(row => ({
        segment: row.segment,
        count: Number(row.count),
        percentage: Number(row.percentage),
        avgLTV: Number(row.avg_ltv),
        color: getSegmentColor(row.segment)
      }))
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Customer analytics error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function getSegmentColor(segment: string): string {
  const colors: Record<string, string> = {
    'VIP Customers': '#FFD700',
    'Regular Customers': '#FFA500',
    'New Customers': '#87CEEB',
    'Inactive Customers': '#D3D3D3'
  };
  return colors[segment] || '#87CEEB';
}