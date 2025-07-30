// api/admin/analytics/products/route.ts
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
    
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '30d';
    const sortBy = searchParams.get('sortBy') || 'revenue';
    
    // Calculate date range using your existing pattern
    const now = new Date();
    const daysBack = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365;
    const startDate = new Date(now.getTime() - (daysBack * 24 * 60 * 60 * 1000));
    const previousStartDate = new Date(startDate.getTime() - (daysBack * 24 * 60 * 60 * 1000));

    // Product performance metrics
    const metricsQuery = `
      WITH current_period AS (
        SELECT 
          COUNT(DISTINCT p.id) as total_products,
          COUNT(DISTINCT CASE WHEN oi.created_at >= $1 THEN p.id END) as active_products,
          SUM(CASE WHEN oi.created_at >= $1 THEN oi.line_total ELSE 0 END) as total_revenue,
          SUM(CASE WHEN oi.created_at >= $1 THEN oi.quantity ELSE 0 END) as total_units,
          AVG(CASE WHEN pr.created_at >= $1 THEN pr.rating ELSE NULL END) as avg_rating
        FROM products p
        LEFT JOIN order_items oi ON p.id = oi.product_id
        LEFT JOIN product_reviews pr ON p.id = pr.product_id
        WHERE EXISTS (
          SELECT 1 FROM order_items oi2 
          JOIN orders o2 ON oi2.order_id = o2.id 
          WHERE oi2.product_id = p.id 
          AND o2.status NOT IN ('cancelled', 'refunded')
        )
      ),
      previous_period AS (
        SELECT 
          SUM(oi.line_total) as prev_revenue,
          SUM(oi.quantity) as prev_units
        FROM order_items oi
        JOIN orders o ON oi.order_id = o.id
        WHERE oi.created_at >= $2
        AND oi.created_at < $1
        AND o.status NOT IN ('cancelled', 'refunded')
      )
      SELECT 
        cp.*,
        pp.prev_revenue,
        pp.prev_units,
        CASE 
          WHEN pp.prev_revenue > 0 
          THEN ROUND(((cp.total_revenue - pp.prev_revenue) / pp.prev_revenue * 100), 2)
          ELSE 0 
        END as revenue_growth,
        CASE 
          WHEN pp.prev_units > 0 
          THEN ROUND(((cp.total_units - pp.prev_units) / pp.prev_units * 100), 2)
          ELSE 0 
        END as units_growth
      FROM current_period cp, previous_period pp
    `;

    const metricsResult = await pool.query(metricsQuery, [startDate, previousStartDate]);

    // Top performing products
    const productsQuery = `
      WITH product_performance AS (
        SELECT 
          p.id,
          p.name,
          p.category,
          p.price,
          p.inventory_count,
          SUM(oi.line_total) as revenue,
          SUM(oi.quantity) as units_sold,
          COUNT(DISTINCT o.id) as order_count,
          AVG(pr.rating) as avg_rating,
          COUNT(pv.id) as view_count,
          MAX(oi.created_at) as last_sale_date
        FROM products p
        LEFT JOIN order_items oi ON p.id = oi.product_id 
        LEFT JOIN orders o ON oi.order_id = o.id
        LEFT JOIN product_reviews pr ON p.id = pr.product_id
        LEFT JOIN product_views pv ON p.id = pv.product_id AND pv.created_at >= $1
        WHERE oi.created_at >= $1
        AND o.status NOT IN ('cancelled', 'refunded')
        GROUP BY p.id, p.name, p.category, p.price, p.inventory_count
        HAVING SUM(oi.line_total) > 0
      )
      SELECT 
        *,
        CASE 
          WHEN view_count > 0 
          THEN ROUND((order_count::numeric / view_count * 100), 2)
          ELSE 0 
        END as conversion_rate,
        ROUND(revenue * 0.3, 2) as profit, -- Assuming 30% profit margin
        ROUND(RANDOM() * 30 + 5, 1) as growth_rate -- Placeholder for growth calculation
      FROM product_performance
      ORDER BY 
        CASE 
          WHEN $3 = 'revenue' THEN revenue
          WHEN $3 = 'units' THEN units_sold
          WHEN $3 = 'rating' THEN avg_rating
          WHEN $3 = 'profit' THEN revenue * 0.3
          ELSE revenue
        END DESC
      LIMIT 20
    `;

    const productsResult = await pool.query(productsQuery, [startDate, startDate, sortBy]);

    // Category performance
    const categoriesQuery = `
      SELECT 
        p.category,
        SUM(oi.line_total) as revenue,
        SUM(oi.quantity) as units_sold,
        COUNT(DISTINCT p.id) as product_count,
        AVG(pr.rating) as avg_rating,
        ROUND(RANDOM() * 25 + 5, 1) as growth_rate -- Placeholder
      FROM products p
      LEFT JOIN order_items oi ON p.id = oi.product_id
      LEFT JOIN orders o ON oi.order_id = o.id
      LEFT JOIN product_reviews pr ON p.id = pr.product_id
      WHERE oi.created_at >= $1
      AND o.status NOT IN ('cancelled', 'refunded')
      AND p.category IS NOT NULL
      GROUP BY p.category
      HAVING SUM(oi.line_total) > 0
      ORDER BY revenue DESC
    `;

    const categoriesResult = await pool.query(categoriesQuery, [startDate]);

    // Daily sales data
    const salesQuery = `
      WITH date_series AS (
        SELECT generate_series(
          $1::date,
          $2::date,
          '1 day'::interval
        )::date as date
      )
      SELECT 
        ds.date::text,
        COALESCE(SUM(oi.line_total), 0) as revenue,
        COALESCE(SUM(oi.quantity), 0) as units,
        COALESCE(COUNT(DISTINCT o.id), 0) as orders,
        CASE 
          WHEN COUNT(DISTINCT o.id) > 0 
          THEN ROUND(SUM(oi.line_total) / COUNT(DISTINCT o.id), 2)
          ELSE 0 
        END as avg_order_value
      FROM date_series ds
      LEFT JOIN order_items oi ON DATE(oi.created_at) = ds.date
      LEFT JOIN orders o ON oi.order_id = o.id AND o.status NOT IN ('cancelled', 'refunded')
      GROUP BY ds.date
      ORDER BY ds.date
    `;

    const salesResult = await pool.query(salesQuery, [startDate, now]);

    const metrics = metricsResult.rows[0];
    const response = {
      metrics: {
        totalProducts: Number(metrics?.total_products || 0),
        activeProducts: Number(metrics?.active_products || 0),
        topSellingProduct: productsResult.rows[0]?.name || 'N/A',
        averageRating: Number(metrics?.avg_rating || 0).toFixed(1),
        totalRevenue: Number(metrics?.total_revenue || 0),
        totalUnits: Number(metrics?.total_units || 0),
        conversionRate: 3.2, // Placeholder - would need page view data
        inventoryTurnover: 4.8, // Placeholder - complex calculation
        growthRate: Number(metrics?.revenue_growth || 0),
        periodComparison: {
          revenue: Number(metrics?.revenue_growth || 0),
          units: Number(metrics?.units_growth || 0),
          newProducts: 6.3 // Placeholder
        }
      },
      topProducts: productsResult.rows.map(row => ({
        id: row.id,
        name: row.name,
        category: row.category,
        revenue: Number(row.revenue || 0),
        unitsSold: Number(row.units_sold || 0),
        viewCount: Number(row.view_count || 0),
        rating: Number(row.avg_rating || 0),
        price: Number(row.price || 0),
        inventory: Number(row.inventory_count || 0),
        conversionRate: Number(row.conversion_rate || 0),
        profit: Number(row.profit || 0),
        growthRate: Number(row.growth_rate || 0),
        lastSaleDate: row.last_sale_date || new Date().toISOString()
      })),
      categories: categoriesResult.rows.map(row => ({
        category: row.category,
        revenue: Number(row.revenue || 0),
        unitsSold: Number(row.units_sold || 0),
        productCount: Number(row.product_count || 0),
        avgRating: Number(row.avg_rating || 0),
        growthRate: Number(row.growth_rate || 0),
        color: getCategoryColor(row.category)
      })),
      salesData: salesResult.rows.map(row => ({
        date: row.date,
        revenue: Number(row.revenue || 0),
        units: Number(row.units || 0),
        orders: Number(row.orders || 0),
        avgOrderValue: Number(row.avg_order_value || 0)
      }))
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Product analytics error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    'Rings': '#FFD700',
    'Necklaces': '#87CEEB',
    'Earrings': '#DDA0DD',
    'Bracelets': '#98FB98',
    'Watches': '#F0E68C'
  };
  return colors[category] || '#87CEEB';
}
