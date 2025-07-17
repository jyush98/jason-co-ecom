// app/product/[id]/page.tsx
import { notFound } from "next/navigation";
import { ProductDetailView } from "@/components/products";
import { Product } from "@/types/product";
import type { Metadata } from "next";

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { id } = await params;

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/products/${id}`);
    if (!res.ok) return {};

    const product = await res.json();
    const images = product.image_urls?.length ? product.image_urls : [product.image_url];

    return {
      title: `${product.name} – Jason & Co. | WHERE AMBITION MEETS ARTISTRY`,
      description: product.description ?? "Discover this exceptional piece from Jason & Co. - Designed without Limits.",
      openGraph: {
        title: `${product.name} – Jason & Co.`,
        description: product.description ?? "WHERE AMBITION MEETS ARTISTRY",
        images: images.map((img: string) => ({ url: img, width: 800, height: 800 })),
        type: 'website',
      },
      twitter: {
        card: "summary_large_image",
        title: `${product.name} – Jason & Co.`,
        description: product.description ?? "WHERE AMBITION MEETS ARTISTRY",
        images,
      },
    };
  } catch (error) {
    return {
      title: "Product – Jason & Co.",
      description: "WHERE AMBITION MEETS ARTISTRY"
    };
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/products/${id}`, {
      next: { revalidate: 300 }, // 5 minutes
    });

    if (!res.ok) return notFound();

    const product: Product = await res.json();

    return <ProductDetailView product={product} />;
  } catch (error) {
    console.error('Failed to fetch product:', error);
    return notFound();
  }
}