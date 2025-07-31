// api/admin/analytics/geographic/route.ts
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

    // Geographic data query - Using mathematical rounding for PostgreSQL compatibility  
    const geographicQuery = `
      WITH regional_mapping AS (
        SELECT 
          CASE 
            WHEN UPPER(shipping_address->>'country') IN ('US', 'USA', 'UNITED STATES') THEN 'North America'
            WHEN UPPER(shipping_address->>'country') IN ('CA', 'CANADA') THEN 'North America'
            WHEN UPPER(shipping_address->>'country') IN ('GB', 'UK', 'DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'AT', 'CH', 'SE', 'NO', 'DK') THEN 'Europe'
            WHEN UPPER(shipping_address->>'country') IN ('JP', 'CN', 'KR', 'SG', 'AU', 'NZ', 'IN', 'TH', 'MY', 'PH') THEN 'Asia Pacific'
            WHEN UPPER(shipping_address->>'country') IN ('MX', 'BR', 'AR', 'CL', 'CO', 'PE', 'VE') THEN 'Latin America'
            WHEN UPPER(shipping_address->>'country') IN ('AE', 'SA', 'IL', 'TR', 'EG', 'ZA') THEN 'Middle East & Africa'
            ELSE 'Other'
          END as region,
          shipping_address->>'country' as country,
          shipping_address->>'state' as state,
          shipping_address->>'city' as city,
          o.total_price,
          o.user_id
        FROM orders o
        WHERE o.created_at >= $1
        AND o.shipping_address IS NOT NULL
        AND o.shipping_address->>'country' IS NOT NULL
        AND o.status NOT IN ('cancelled', 'refunded')
      )
      SELECT 
        region,
        COUNT(DISTINCT user_id) as customers,
        COUNT(*) as orders,
        SUM(total_price) as revenue,
        FLOOR(AVG(total_price) * 100 + 0.5) / 100 as avg_order_value,
        FLOOR((COUNT(DISTINCT user_id)::numeric / (SELECT COUNT(DISTINCT user_id) FROM regional_mapping) * 100) * 10 + 0.5) / 10 as customer_percentage,
        FLOOR((SUM(total_price)::numeric / (SELECT SUM(total_price) FROM regional_mapping) * 100) * 10 + 0.5) / 10 as revenue_percentage
      FROM regional_mapping
      WHERE region != 'Other'
      GROUP BY region
      ORDER BY revenue DESC
    `;

    const geographicResult = await pool.query(geographicQuery, [startDate]);

    const response = geographicResult.rows.map(row => ({
      region: row.region,
      customers: Number(row.customers),
      orders: Number(row.orders),
      revenue: Number(row.revenue),
      avgOrderValue: Number(row.avg_order_value),
      customerPercentage: Number(row.customer_percentage),
      revenuePercentage: Number(row.revenue_percentage)
    }));

    return NextResponse.json(response);

  } catch (error) {
    console.error('Geographic analytics error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}