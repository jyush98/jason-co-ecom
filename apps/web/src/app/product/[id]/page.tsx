import { notFound } from "next/navigation";
import ProductImageGallery from "@/components/ProductImageGallery";
import AddToCartButton from "@/components/AddToCartButton";
import React from "react";
import { Product } from "@/types/product";
import type { Metadata } from "next";
import Link from "next/link";

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata(propsPromise: ProductPageProps): Promise<Metadata> {
  const { id } = await propsPromise.params;

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/products/${id}`);
  if (!res.ok) return {};

  const product = await res.json();
  const images = product.image_urls?.length ? product.image_urls : [product.image_url];

  return {
    title: `${product.name} – Jason & Co.`,
    description: product.description ?? "Explore this one-of-a-kind piece from Jason & Co.",
    openGraph: {
      title: `${product.name} – Jason & Co.`,
      description: product.description ?? "Explore this one-of-a-kind piece from Jason & Co.",
      images,
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.name} – Jason & Co.`,
      description: product.description ?? "Explore this one-of-a-kind piece from Jason & Co.",
      images,
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/products/${id}`, {
    next: { revalidate: 60 },
  });

  if (!res.ok) return notFound();

  const product: Product = await res.json();
  const images = product.image_urls?.length ? product.image_urls : [product.image_url];
  const isDark = product.display_theme === "dark";

  return (
    <div className="bg-white text-black dark:bg-black dark:text-white">
      <div
        className="pt-[var(--navbar-height)] px-4 max-w-6xl mx-auto min-h-screen"
      >
        <div className="mb-6">
          <Link
            href="/shop"
            className={`inline-flex items-center gap-1 text-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 rounded`}
            aria-label="Go back to the Shop page"
          >
            ← Back to Shop
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <ProductImageGallery images={images} />

          <div className="space-y-6 w-full max-w-lg mx-auto md:mx-0">
            <div className="space-y-1">
              <h1 className="text-3xl md:text-4xl font-serif tracking-widest uppercase">
                {product.name}
              </h1>
              {product.description && (
                <p className="text-sm opacity-70">{product.description.slice(0, 100)}...</p>
              )}
              <p className="text-xl opacity-80 font-sans">${product.price.toLocaleString()}</p>
              <p className="text-sm uppercase tracking-wider opacity-60">{product.category}</p>
            </div>

            <hr className={`${isDark ? "border-white/20" : "border-black/20"}`} />

            <AddToCartButton
              productId={product.id}
              productName={product.name}
              productPrice={product.price}
              productImageUrl={product.image_url}
              fullWidth
            />

            {product.description && (
              <p className="text-base opacity-80 leading-relaxed font-sans">{product.description}</p>
            )}

            <div>
              <h2 className="text-lg font-medium mt-8 mb-3 font-sans">Details</h2>
              <div className="grid grid-cols-2 gap-y-2 text-sm opacity-70 font-sans">
                {(product.details &&
                  Object.entries(product.details).map(([label, value]) => (
                    <React.Fragment key={label}>
                      <span>{label}</span>
                      <span className="opacity-90">{String(value)}</span>
                    </React.Fragment>
                  ))) || (
                    <>
                      <span>Metal</span>
                      <span className="opacity-90">14k Rose Gold</span>
                      <span>Diamond Quality</span>
                      <span className="opacity-90">VS+</span>
                      <span>Diamond Color</span>
                      <span className="opacity-90">D–F</span>
                      <span>Carat Weight</span>
                      <span className="opacity-90">42.3 ct</span>
                      <span>Dimensions</span>
                      <span className="opacity-90">Length – 4.3 inches</span>
                    </>
                  )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

  );
}
