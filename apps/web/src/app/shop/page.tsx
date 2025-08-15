// app/shop/page.tsx
export const dynamic = "force-dynamic";

import ProductList from '@/components/products/ProductList';
import { createCategoryMetadata } from '@/lib/seo/metadata';
import { BreadcrumbSchema, CollectionSchema } from '@/components/seo/SchemaMarkup';
import { Suspense } from 'react';

/**
 * SEO-Optimized Shop Page for Jason & Co. Luxury Jewelry
 *
 * Business Impact:
 * - Category-specific SEO for luxury jewelry keywords
 * - Rich search results with product collections
 * - Breadcrumb navigation for better UX and SEO
 * - Social media optimization for category sharing
 *
 * Expected Results:
 * - Top 10 rankings for "luxury [category]" keywords
 * - Enhanced product discovery through category optimization
 * - Better social media engagement when sharing categories
 * - Improved internal linking and site structure
 */

interface ShopPageProps {
  searchParams: Promise<{
    category?: string;
    search?: string;
    sortBy?: string;
    page?: string;
  }>;
}

interface ProductSummary {
  name: string;
  price: number;
  image_url?: string;
}

// Dynamic metadata generation based on category and search
export async function generateMetadata({ searchParams }: ShopPageProps) {
  const params = await searchParams;
  const { category, search } = params;

  // If there's a search query, optimize for search results
  if (search) {
    return createCategoryMetadata({
      category: `Search Results: "${search}"`,
      description: `Search results for "${search}" in our luxury jewelry collection. Discover handcrafted pieces designed without limits.`,
      productCount: undefined // Could fetch actual search result count
    });
  }

  // Category-specific optimization
  if (category && category !== 'All') {
    const categoryName = category.charAt(0).toUpperCase() + category.slice(1);
    const categoryDescriptions = {
      rings: `Explore our exquisite ${categoryName.toLowerCase()} collection featuring custom engagement rings, wedding bands, and designer rings. Each piece handcrafted with premium materials and exceptional artistry.`,
      necklaces: `Discover our luxury ${categoryName.toLowerCase()} collection. From delicate chains to statement pieces, each necklace is designed without limits and crafted to perfection.`,
      earrings: `Browse our premium ${categoryName.toLowerCase()} collection. Elegant studs, dramatic drops, and custom designs that embody where ambition meets artistry.`,
      bracelets: `Shop our luxury ${categoryName.toLowerCase()} collection. Handcrafted bracelets and bangles designed for the discerning jewelry enthusiast.`,
      watches: `Explore our premium ${categoryName.toLowerCase()} and timepiece collection. Luxury accessories that combine functionality with artistic design.`,
      chains: `Discover our designer ${categoryName.toLowerCase()} collection. From delicate links to bold statement pieces, crafted with exceptional attention to detail.`,
      custom: `Create your perfect piece with our custom jewelry design service. Bespoke ${categoryName.toLowerCase()} designed without limits, tailored to your vision.`
    };

    return createCategoryMetadata({
      category: categoryName,
      description: categoryDescriptions[category.toLowerCase() as keyof typeof categoryDescriptions]
        || `Explore our premium ${categoryName.toLowerCase()} collection. Handcrafted luxury jewelry designed without limits.`,
      productCount: undefined // Could fetch actual category count
    });
  }

  // Default shop page metadata
  return createCategoryMetadata({
    category: 'All Jewelry',
    description: 'Shop our complete luxury jewelry collection at Jason & Co. Custom engagement rings, designer necklaces, premium watches, and exclusive handcrafted pieces. Where ambition meets artistry.',
    productCount: undefined
  });
}

// Generate static params for popular categories (optional - for ISG)
export async function generateStaticParams() {
  const popularCategories = [
    'rings',
    'necklaces',
    'earrings',
    'bracelets',
    'watches',
    'chains'
  ];

  return popularCategories.map(category => ({
    searchParams: { category }
  }));
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams;
  const { category, search } = params;

  // Generate breadcrumb navigation for SEO and UX
  const generateBreadcrumbs = () => {
    const items = [
      { name: 'Home', url: '/' },
      { name: 'Shop', url: '/shop' }
    ];

    if (search) {
      items.push({
        name: `Search: "${search}"`,
        url: `/shop?search=${encodeURIComponent(search)}`
      });
    } else if (category && category !== 'All') {
      const categoryName = category.charAt(0).toUpperCase() + category.slice(1);
      items.push({
        name: categoryName,
        url: `/shop?category=${category}`
      });
    }

    return items;
  };

  const breadcrumbItems = generateBreadcrumbs();

  // Get category display name for schema
  const getCategoryDisplayName = () => {
    if (search) return `Search Results: "${search}"`;
    if (category && category !== 'All') {
      return category.charAt(0).toUpperCase() + category.slice(1) + ' Collection';
    }
    return 'All Jewelry Collection';
  };

  return (
    <div className="bg-white dark:bg-black">
      {/* SEO Structured Data */}
      <BreadcrumbSchema items={breadcrumbItems} />

      {/* Collection Schema for category pages */}
      <Suspense fallback={null}>
        <CollectionSchemaWrapper
          categoryName={getCategoryDisplayName()}
          category={category}
          search={search}
        />
      </Suspense>

      {/* Direct ProductList integration - no wrapper needed */}
      <ProductList
        initialCategory={category}
        initialSearch={search}
      />
    </div>
  );
}

// Separate component for Collection Schema to handle async data fetching
async function CollectionSchemaWrapper({
  categoryName,
  category,
  search
}: {
  categoryName: string;
  category?: string;
  search?: string;
}) {
  try {
    // Fetch featured products for the collection schema
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/products?${new URLSearchParams({
      ...(category && category !== 'All' && { category }),
      ...(search && { name: search }),
      page_size: '6' // Featured items for schema
    })}`, {
      next: { revalidate: 3600 } // Cache for 1 hour
    });

    if (!response.ok) return null;

    const data = await response.json();
    const products = Array.isArray(data) ? data : (data.products || data.items || []);

    // Only render if we have products
    if (products.length === 0) return null;

    const collectionDescription = search
      ? `Search results for "${search}" in our luxury jewelry collection.`
      : category && category !== 'All'
        ? `Our ${category} collection features handcrafted luxury pieces designed without limits.`
        : 'Our complete luxury jewelry collection featuring custom engagement rings, designer pieces, and handcrafted accessories.';

    return (
      <CollectionSchema
        name={categoryName}
        description={collectionDescription}
        products={products.map((product: ProductSummary) => ({
          name: product.name,
          price: product.price,
          image: product.image_url ? `${process.env.NEXT_PUBLIC_BASE_URL || 'https://jasonandco.shop'}${product.image_url}` : '/images/product-placeholder.jpg'
        }))}
      />
    );
  } catch (error) {
    console.error('Error generating collection schema:', error);
    return null;
  }
}