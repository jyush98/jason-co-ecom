import type { NextConfig } from "next";

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
  // Image Optimization - CRITICAL for mobile performance
  images: {
    // Enable modern formats for better compression
    formats: ['image/webp', 'image/avif'],

    // Optimize image quality vs file size
    // quality: 80, // Reduces file size by ~40% with minimal quality loss

    // Enable responsive image sizing
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],

    // FIXED: Migrated all domains to remotePatterns (no more deprecated domains)
    remotePatterns: [
      // AWS S3 bucket for inspiration images
      {
        protocol: 'https',
        hostname: 'jasonco-inspiration-images.s3.us-east-2.amazonaws.com',
        pathname: '/**',
      },
      // Clerk authentication images
      {
        protocol: 'https',
        hostname: 'img.clerk.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.clerk.dev',
        port: '',
        pathname: '/**',
      },
      // Stock photo and jewelry websites
      {
        protocol: 'https',
        hostname: 'media.istockphoto.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.nathanalanjewelers.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.longsjewelers.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'img.goodfon.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'hannahnaomi.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'shrinejewelry.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'media.gettyimages.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'royalparadisejewelry.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn11.bigcommerce.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'faithheart-jewelry.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.shutterstock.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'johnnysaintstudio.com',
        pathname: '/**',
      },
      // Jason & Co. domain variants
      {
        protocol: 'https',
        hostname: 'jasonjewels.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.jasonjewels.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'jasonandco.shop',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.jasonandco.shop',
        pathname: '/**',
      },
      // Common CDNs and image services
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        pathname: '/**',
      },
    ],

    // Minimize layout shift
    minimumCacheTTL: 60,

    // Enable blur placeholders for smooth loading
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Bundle Optimization - Reduce JavaScript payload
  experimental: {
    // Enable modern bundling for smaller payloads
    optimizeCss: true,

    // REMOVED: ppr: true (requires Next.js canary version)
    // Enable when you upgrade to canary: ppr: true,
  },

  // Compiler optimizations
  compiler: {
    // Remove console.logs in production
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,

    // Enable React optimizations
    reactRemoveProperties: process.env.NODE_ENV === 'production',
  },

  // Performance optimizations
  poweredByHeader: false, // Remove X-Powered-By header

  // Compress responses
  compress: true,

  // Enable static optimization
  trailingSlash: false,

  // Headers for better caching and security
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Font optimization headers
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          // Preconnect to external domains
          {
            key: 'Link',
            value: '<https://fonts.googleapis.com>; rel=preconnect; crossorigin'
          },
        ],
      },
      {
        // Cache static assets aggressively
        source: '/images/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Cache woff2 fonts
        source: '/(.*)\.woff2',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Cache woff fonts
        source: '/(.*)\.woff',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },

  // Webpack optimizations
  webpack: (config, { dev, isServer }) => {
    // Production optimizations
    if (!dev && !isServer) {
      // Enable aggressive code splitting
      config.optimization.splitChunks.cacheGroups = {
        ...config.optimization.splitChunks.cacheGroups,

        // Separate vendor chunks
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
          priority: 10,
        },

        // Separate common chunks
        common: {
          minChunks: 2,
          chunks: 'all',
          priority: 5,
          reuseExistingChunk: true,
        },
      };
    }

    return config;
  },

  // Environment-specific optimizations
  env: {
    // Enable performance monitoring
    NEXT_PUBLIC_ENABLE_PERFORMANCE_MONITORING: 'true',

    // Image optimization settings
    NEXT_PUBLIC_IMAGE_QUALITY: '80',
    NEXT_PUBLIC_IMAGE_FORMATS: 'webp,avif',
  },

  // Redirect configuration for domain switch
  async redirects() {
    return [
      // Add redirects here when switching to jasonandco.shop
      // {
      //   source: '/:path*',
      //   has: [
      //     {
      //       type: 'host',
      //       value: 'jasonjewels.com',
      //     },
      //   ],
      //   destination: 'https://jasonandco.shop/:path*',
      //   permanent: true,
      // },
    ];
  },
};

export default nextConfig;