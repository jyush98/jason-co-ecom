import type { Metadata } from 'next';

export interface SEOConfig {
  siteName: string;
  siteUrl: string;
  defaultTitle: string;
  defaultDescription: string;
  defaultImage: string;
  twitterHandle: string;
  keywords: string[];
}

export const seoConfig: SEOConfig = {
  siteName: 'Jason & Co. Luxury Jewelry',
  siteUrl: 'https://jasonandco.shop', // Update when you switch domains
  defaultTitle: 'Jason & Co. | Where Ambition Meets Artistry | Luxury Custom Jewelry',
  defaultDescription: 'Discover handcrafted luxury jewelry designed without limits. Custom engagement rings, bespoke necklaces, and artisanal pieces that embody where ambition meets artistry.',
  defaultImage: '/images/og-default.jpg',
  twitterHandle: '@jasonandco', // Update with your actual handle
  keywords: [
    'luxury jewelry',
    'custom jewelry',
    'bespoke engagement rings',
    'handcrafted jewelry',
    'designer jewelry',
    'custom engagement rings',
    'luxury necklaces',
    'artisanal jewelry',
    'jewelry consultation',
    'wedding rings',
    'diamond jewelry',
    'precious stones'
  ],
};

// Base metadata for the site
export function createMetadata({
  title,
  description,
  image,
  url,
  type = 'website',
  keywords,
  noIndex = false,
}: {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  keywords?: string[];
  noIndex?: boolean;
} = {}): Metadata {
  const metaTitle = title
    ? `${title} | ${seoConfig.siteName}`
    : seoConfig.defaultTitle;

  const metaDescription = description || seoConfig.defaultDescription;
  const metaImage = image || seoConfig.defaultImage;
  const metaUrl = url ? `${seoConfig.siteUrl}${url}` : seoConfig.siteUrl;
  const metaKeywords = keywords || seoConfig.keywords;

  // Map our internal type to valid OpenGraph types
  const ogType = type === 'product' ? 'website' : type;

  return {
    title: metaTitle,
    description: metaDescription,
    keywords: metaKeywords.join(', '),
    authors: [{ name: 'Jason & Co.' }],
    creator: 'Jason & Co.',
    publisher: 'Jason & Co.',
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    metadataBase: new URL(seoConfig.siteUrl),
    alternates: {
      canonical: metaUrl,
    },
    robots: {
      index: !noIndex,
      follow: !noIndex,
      googleBot: {
        index: !noIndex,
        follow: !noIndex,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      type: ogType, // Use the mapped type
      siteName: seoConfig.siteName,
      title: metaTitle,
      description: metaDescription,
      url: metaUrl,
      images: [
        {
          url: metaImage,
          width: 1200,
          height: 630,
          alt: metaTitle,
        },
      ],
      locale: 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      site: seoConfig.twitterHandle,
      creator: seoConfig.twitterHandle,
      title: metaTitle,
      description: metaDescription,
      images: [metaImage],
    },
    verification: {
      // Add your verification codes here
      google: '', // Add Google Search Console verification
      // bing: '', // Add Bing Webmaster verification if needed
    },
    // Add product-specific metadata in the other field for products
    ...(type === 'product' && {
      other: {
        'og:type': 'product',
        'product:retailer_item_id': '',
        'product:price:currency': 'USD',
      } as Record<string, string | number>,
    }),
  };
}

// Product-specific metadata
export function createProductMetadata({
  product,
  images,
}: {
  product: {
    name: string;
    description: string;
    price: number;
    category: string;
    inStock: boolean;
    sku?: string;
  };
  images: string[];
}): Metadata {
  const title = `${product.name} | Luxury ${product.category}`;
  const description = `${product.description.substring(0, 150)}... Starting at ${product.price.toLocaleString()}. Handcrafted luxury jewelry designed without limits.`;

  const baseMetadata = createMetadata({
    title,
    description,
    image: images[0],
    type: 'product',
    keywords: [
      product.name.toLowerCase(),
      product.category.toLowerCase(),
      'luxury jewelry',
      'custom jewelry',
      'handcrafted jewelry',
    ],
  });

  // Create the other object with proper typing
  const productOther: Record<string, string | number> = {
    'og:type': 'product',
    'product:price:amount': product.price.toString(),
    'product:price:currency': 'USD',
    'product:availability': product.inStock ? 'in stock' : 'out of stock',
    'product:category': product.category,
    'product:retailer_item_id': product.sku || product.name.replace(/\s+/g, '-').toLowerCase(),
  };

  // Add any existing other fields from base metadata
  if (baseMetadata.other) {
    Object.entries(baseMetadata.other).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        productOther[key] = Array.isArray(value) ? value.join(', ') : value;
      }
    });
  }

  return {
    ...baseMetadata,
    other: productOther,
  };
}

// Category page metadata
export function createCategoryMetadata({
  category,
  description,
  productCount,
}: {
  category: string;
  description?: string;
  productCount?: number;
}): Metadata {
  const title = `${category} Collection | Luxury Jewelry`;
  const defaultDescription = `Explore our exquisite ${category.toLowerCase()} collection. ${productCount ? `${productCount} unique pieces` : 'Handcrafted luxury jewelry'} designed without limits.`;

  return createMetadata({
    title,
    description: description || defaultDescription,
    keywords: [
      category.toLowerCase(),
      `luxury ${category.toLowerCase()}`,
      `custom ${category.toLowerCase()}`,
      'handcrafted jewelry',
      'designer jewelry',
    ],
  });
}

// Schema.org structured data
export function generateProductSchema(product: {
  name: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  inStock: boolean;
  sku?: string;
  brand?: string;
}) {
  return {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.images.map(img => `${seoConfig.siteUrl}${img}`),
    sku: product.sku || `${product.name.replace(/\s+/g, '-').toLowerCase()}`,
    brand: {
      '@type': 'Brand',
      name: product.brand || 'Jason & Co.',
    },
    offers: {
      '@type': 'Offer',
      url: `${seoConfig.siteUrl}/shop/${product.category}/${product.sku}`,
      priceCurrency: 'USD',
      price: product.price,
      priceValidUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 year from now
      availability: product.inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: 'Jason & Co.',
      },
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      reviewCount: '127', // Update with real data
    },
    category: product.category,
  };
}

export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Jason & Co.',
    url: seoConfig.siteUrl,
    logo: `${seoConfig.siteUrl}/images/logo.png`,
    description: seoConfig.defaultDescription,
    sameAs: [
      // Add your social media URLs here when available
      // 'https://www.instagram.com/jasonandco',
      // 'https://www.facebook.com/jasonandco',
      // 'https://www.pinterest.com/jasonandco',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+1-XXX-XXX-XXXX', // Add your phone number
      contactType: 'customer service',
      availableLanguage: 'English',
    },
  };
}

export function generateWebsiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: seoConfig.siteName,
    url: seoConfig.siteUrl,
    description: seoConfig.defaultDescription,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${seoConfig.siteUrl}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

// Breadcrumb schema
export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${seoConfig.siteUrl}${item.url}`,
    })),
  };
}