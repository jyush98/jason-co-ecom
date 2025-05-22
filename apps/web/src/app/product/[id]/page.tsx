import { notFound } from "next/navigation";
import ProductImageGallery from "@/components/ProductImageGallery";
import AddToCartButton from "@/components/AddToCartButton";
import React from "react";
import { Product } from "@/types/product";

interface ProductPageProps {
  params: Promise<{ id: string }>; // ✅ required in Next 15
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params; // ✅ await is now required

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/products/${id}`,
    {
      next: { revalidate: 60 },
    }
  );

  if (!res.ok) return notFound();

  const product: Product = await res.json();
  const images = product.image_urls?.length
    ? product.image_urls
    : [product.image_url];

  return (
    <div className="pt-[var(--navbar-height)] px-4 max-w-6xl mx-auto text-white">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <ProductImageGallery images={images} />

        <div className="space-y-6 w-full max-w-lg mx-auto md:mx-0">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
            {product.name}
          </h1>

          <hr className="border-t border-white/20" />

          <AddToCartButton productId={product.id} fullWidth />

          {product.description && (
            <p className="text-base text-white/80 leading-relaxed">
              {product.description}
            </p>
          )}

          <div>
            <h2 className="text-lg font-medium mt-8 mb-3">Details</h2>
            <div className="grid grid-cols-2 gap-y-2 text-sm text-white/70">
              {(product.details &&
                Object.entries(product.details).map(([label, value]) => (
                  <React.Fragment key={label}>
                    <span>{label}</span>
                    <span className="text-white/90">{String(value)}</span>
                  </React.Fragment>
                ))) || (
                  <>
                    <span>Metal</span>
                    <span className="text-white/90">14k Rose Gold</span>
                    <span>Diamond Quality</span>
                    <span className="text-white/90">VS+</span>
                    <span>Diamond Color</span>
                    <span className="text-white/90">D–F</span>
                    <span>Carat Weight</span>
                    <span className="text-white/90">42.3 ct</span>
                    <span>Dimensions</span>
                    <span className="text-white/90">Length – 4.3 inches</span>
                  </>
                )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
