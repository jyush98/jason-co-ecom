// app/product/[id]/page.tsx
import { notFound } from "next/navigation";
import { ProductDetailView } from "@/components/products";
import { Product } from "@/types/product";
import { ProductSchema, BreadcrumbSchema } from "@/components/seo/SchemaMarkup";
import { createProductMetadata } from '@/lib/seo/metadata';
import { ProductTracker } from '@/components/analytics/ProductTracker';
import type { Metadata } from "next";

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

// Enhanced metadata generation with luxury jewelry optimization
export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { id } = await params;

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/products/${id}`, {
      next: { revalidate: 3600 } // Cache for 1 hour
    });

    if (!res.ok) {
      return {
        title: "Product Not Found – Jason & Co.",
        description: "The requested luxury jewelry piece could not be found.",
        robots: { index: false, follow: false }
      };
    }

    const product = await res.json();
    const images = product.image_urls?.length ? product.image_urls : [product.image_url].filter(Boolean);

    // Use the comprehensive metadata generator
    return createProductMetadata({
      product: {
        name: product.name,
        description: product.description || `Discover this exceptional ${product.category || 'jewelry'} piece from Jason & Co. Handcrafted luxury designed without limits.`,
        price: product.price,
        category: product.category || 'Jewelry',
        inStock: true, // Update based on your inventory system
        sku: product.id.toString()
      },
      images: images.map((img: string) =>
        img.startsWith('http') ? img : `${process.env.NEXT_PUBLIC_BASE_URL || 'https://jasonandco.shop'}${img}`
      )
    });

  } catch (error) {
    console.error('Error generating product metadata:', error);
    return {
      title: "Product – Jason & Co. | Luxury Jewelry",
      description: "Discover exceptional luxury jewelry pieces designed without limits. Where ambition meets artistry.",
      robots: { index: false, follow: true }
    };
  }
}

// Generate static params for popular products (optional - for ISG performance)
export async function generateStaticParams() {
  try {
    // Fetch featured/popular products for static generation
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/products?featured=true&page_size=20`, {
      next: { revalidate: 86400 } // Cache for 24 hours
    });

    if (!res.ok) return [];

    const data = await res.json();
    const products = Array.isArray(data) ? data : (data.products || data.items || []);

    return products.map((product: any) => ({
      id: product.id.toString()
    }));
  } catch (error) {
    console.error('Error generating static params for products:', error);
    return [];
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/products/${id}`, {
      next: { revalidate: 300 }, // 5 minutes - keep your existing cache
    });

    if (!res.ok) return notFound();

    const product: Product = await res.json();

    // Generate SEO-optimized breadcrumbs
    const generateBreadcrumbs = (product: Product) => {
      const items = [
        { name: 'Home', url: '/' },
        { name: 'Shop', url: '/shop' }
      ];

      // Add category if available
      if (product.category) {
        const categoryName = product.category.charAt(0).toUpperCase() + product.category.slice(1);
        items.push({
          name: categoryName,
          url: `/shop?category=${product.category.toLowerCase()}`
        });
      }

      // Add product (current page)
      items.push({
        name: product.name,
        url: `/product/${product.id}`
      });

      return items;
    };

    // Generate SEO-friendly URL slug for canonical
    const generateProductSlug = (name: string) => {
      return name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
    };

    const breadcrumbItems = generateBreadcrumbs(product);
    const productSlug = generateProductSlug(product.name);
    const canonicalUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://jasonandco.shop'}/product/${product.id}/${productSlug}`;

    return (
      <>
        {/* Simple Product Tracking - exactly as you specified */}
        <ProductTracker product={product} viewType="detail" />

        {/* ===== STRUCTURED DATA FOR SEO ===== */}

        {/* Product Schema for Rich Search Results */}
        <ProductSchema
          product={{
            name: product.name,
            description: product.description || `Exceptional ${product.category || 'jewelry'} piece from Jason & Co. Handcrafted luxury designed without limits.`,
            price: product.price,
            images: product.image_urls?.length
              ? product.image_urls.map((img: string) =>
                img.startsWith('http') ? img : `${process.env.NEXT_PUBLIC_BASE_URL || 'https://jasonandco.shop'}${img}`
              )
              : product.image_url
                ? [product.image_url.startsWith('http') ? product.image_url : `${process.env.NEXT_PUBLIC_BASE_URL || 'https://jasonandco.shop'}${product.image_url}`]
                : [`${process.env.NEXT_PUBLIC_BASE_URL || 'https://jasonandco.shop'}/images/product-placeholder.jpg`],
            category: product.category || 'Jewelry',
            inStock: true, // Update based on your inventory system
            sku: product.id.toString(),
            brand: 'Jason & Co.'
          }}
        />

        {/* Breadcrumb Schema for Navigation SEO */}
        <BreadcrumbSchema items={breadcrumbItems} />

        {/* Additional Product-Specific Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebPage',
              '@id': canonicalUrl,
              url: canonicalUrl,
              name: `${product.name} - Jason & Co.`,
              description: product.description || `Luxury ${product.category || 'jewelry'} piece from Jason & Co.`,
              isPartOf: {
                '@id': `${process.env.NEXT_PUBLIC_BASE_URL || 'https://jasonandco.shop'}/#website`
              },
              about: {
                '@id': `${canonicalUrl}#product`
              },
              mainEntity: {
                '@id': `${canonicalUrl}#product`
              }
            }, null, 0)
          }}
        />

        {/* ===== PRODUCT DETAIL VIEW ===== */}
        <ProductDetailView product={product} />
      </>
    );

  } catch (error) {
    console.error('Failed to fetch product:', error);
    return notFound();
  }
}