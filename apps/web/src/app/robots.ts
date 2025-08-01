// app/robots.ts
import { MetadataRoute } from 'next'

/**
 * Robots.txt Configuration for Jason & Co. Luxury Jewelry
 *
 * Business Impact:
 * - Guides search engines to valuable content first
 * - Protects admin/private areas from indexing
 * - Optimizes crawl budget for product pages
 * - Ensures sitemap discovery by all search engines
 *
 * SEO Benefits:
 * - Prioritizes luxury jewelry content for crawling
 * - Prevents duplicate content issues
 * - Directs search engines to fresh product inventory
 * - Maintains clean search results (no admin/cart pages)
 */

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://jasonjewels.com'; //'https://jasonandco.shop';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                // Main search engine crawlers (Google, Bing, etc.)
                userAgent: '*',
                allow: [
                    '/',                    // Homepage - maximum priority
                    '/shop',               // Shop page - high priority
                    '/shop/*',             // Category pages - high priority
                    '/product/*',          // Product pages - maximum priority
                    '/gallery',            // Gallery - medium priority
                    '/about',              // About page - medium priority
                    '/contact',            // Contact page - medium priority
                    '/custom-orders',      // Custom orders - high priority
                    '/api/images/*',       // Product images - allow crawling
                    '/*.jpg',              // Image files
                    '/*.png',              // Image files
                    '/*.webp',             // Modern image formats
                    '/*.avif'              // Next-gen image formats
                ],
                disallow: [
                    // Admin and private areas
                    '/admin',              // Admin dashboard
                    '/admin/*',            // All admin pages
                    '/api',                // API endpoints (except images)
                    '/api/*',              // All API routes

                    // User account areas
                    '/account',            // User accounts
                    '/account/*',          // Account pages
                    '/login',              // Login page
                    '/register',           // Registration
                    '/auth/*',             // Authentication flows

                    // E-commerce private areas
                    '/cart',               // Shopping cart
                    '/checkout',           // Checkout process
                    '/checkout/*',         // Checkout steps
                    '/order/*',            // Order confirmations
                    '/payment/*',          // Payment processing

                    // Technical and utility pages
                    '/_next/*',            // Next.js internal files
                    '/.*',                 // Hidden files
                    '/*.json$',            // JSON files
                    '/sitemap.xml.gz',     // Compressed sitemap

                    // Search and filter URLs that create duplicate content
                    '/shop?*sort=*',       // Avoid indexing sorted results
                    '/shop?*page=*',       // Avoid pagination duplicate content
                    '/search?*',           // Search result pages

                    // Private file areas
                    '/uploads/private/*',  // Private file uploads
                    '/temp/*',             // Temporary files
                    '/backup/*',           // Backup files

                    // WordPress-style paths (in case of migration history)
                    '/wp-admin',
                    '/wp-content',
                    '/wp-includes'
                ],
                // Crawl delay for respectful crawling (0.5 seconds)
                crawlDelay: 0.5
            },

            // Special rules for Google (more permissive)
            {
                userAgent: 'Googlebot',
                allow: [
                    '/',
                    '/shop',
                    '/shop/*',
                    '/product/*',
                    '/gallery',
                    '/about',
                    '/contact',
                    '/custom-orders',
                    '/api/images/*',        // Allow Google to crawl product images
                    '/*.jpg',
                    '/*.png',
                    '/*.webp',
                    '/*.avif'
                ],
                disallow: [
                    '/admin',
                    '/admin/*',
                    '/api',                 // Still block API endpoints
                    '/account',
                    '/account/*',
                    '/cart',
                    '/checkout',
                    '/checkout/*',
                    '/_next/*'
                ]
            },

            // Image crawling optimization for Google Images
            {
                userAgent: 'Googlebot-Image',
                allow: [
                    '/images/*',            // Product images
                    '/api/images/*',        // Dynamic images
                    '/uploads/products/*',  // Product upload directory
                    '/*.jpg',
                    '/*.jpeg',
                    '/*.png',
                    '/*.webp',
                    '/*.avif',
                    '/*.svg'
                ],
                disallow: [
                    '/admin/*',
                    '/uploads/private/*'
                ]
            },

            // Bing optimization
            {
                userAgent: 'bingbot',
                allow: [
                    '/',
                    '/shop',
                    '/shop/*',
                    '/product/*',
                    '/gallery',
                    '/about',
                    '/contact',
                    '/custom-orders'
                ],
                disallow: [
                    '/admin',
                    '/admin/*',
                    '/api',
                    '/account',
                    '/cart',
                    '/checkout'
                ],
                crawlDelay: 1
            },

            // Social media crawlers (for better sharing)
            {
                userAgent: 'facebookexternalhit',
                allow: [
                    '/',
                    '/shop/*',
                    '/product/*',
                    '/gallery',
                    '/about',
                    '/contact',
                    '/images/*'
                ],
                disallow: [
                    '/admin',
                    '/account',
                    '/cart',
                    '/checkout'
                ]
            },

            // Block aggressive crawlers that don't respect crawl delays
            {
                userAgent: [
                    'AhrefsBot',
                    'SemrushBot',
                    'MJ12bot',
                    'DotBot',
                    'BLEXBot'
                ],
                disallow: ['/']
            }
        ],

        // Sitemap location - critical for SEO discovery
        sitemap: `${BASE_URL}/sitemap.xml`,

        // Additional sitemaps (for future expansion)
        // sitemap: [
        //   `${BASE_URL}/sitemap.xml`,
        //   `${BASE_URL}/product-sitemap.xml`,  // Future: dedicated product sitemap
        //   `${BASE_URL}/image-sitemap.xml`     // Future: image sitemap for Google Images
        // ]
    };
}

/**
 * Advanced Robots.txt Configuration Notes:
 * 
 * ===== CRAWL BUDGET OPTIMIZATION =====
 * - Allows all valuable content (products, categories, static pages)
 * - Blocks admin, cart, checkout to preserve crawl budget
 * - Prevents duplicate content from search/filter URLs
 * - Optimizes for luxury jewelry content discovery
 * 
 * ===== SEARCH ENGINE SPECIFIC RULES =====
 * - Google: Most permissive, fastest crawl rate
 * - Bing: Slightly more conservative crawl delay
 * - Images: Optimized for Google Images ranking
 * - Social: Facebook crawler optimization for sharing
 * 
 * ===== LUXURY E-COMMERCE OPTIMIZATION =====
 * - Prioritizes product pages for maximum visibility
 * - Allows category browsing for keyword targeting
 * - Protects customer privacy (accounts, orders, payments)
 * - Maintains professional search presence
 * 
 * ===== NEXT STEPS =====
 * 1. Monitor Google Search Console for crawl efficiency
 * 2. Track product page indexing rates
 * 3. Verify sitemap discovery and processing
 * 4. Monitor for any blocked valuable content
 * 
 * ===== EXPECTED RESULTS =====
 * - 100% of product pages discovered within 48 hours
 * - Efficient crawl budget usage = faster new product indexing
 * - Clean search results with no private/admin pages
 * - Optimal luxury jewelry content visibility
 */