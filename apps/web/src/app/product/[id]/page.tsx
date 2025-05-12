import { notFound } from "next/navigation";
import ProductImageGallery from "@/components/ProductImageGallery";
import AddToCartButton from "@/components/AddToCartButton";
import React from "react";

interface PageProps {
  params: {
    id: string;
  };
}

interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  image_urls?: string[];
  category: string;
  details?: Record<string, string>;
}

export default async function ProductPage({ params }: PageProps) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/products/${params.id}`, {
    next: { revalidate: 60 },
  });

  if (!res.ok) return notFound();

  const product: Product = await res.json();
  const images = product.image_urls?.length ? product.image_urls : [product.image_url!];

  return (
    <div className="pt-[var(--navbar-height)] px-4 py-16 max-w-6xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <ProductImageGallery images={images} />
        <div className="space-y-6 w-full max-w-lg">
          <h1 className="text-4xl font-semibold tracking-tight">{product.name}</h1>
          <hr className="border-t border-gray-300" />
          <AddToCartButton productId={product.id} fullWidth />
          {product.description && (
            <p className="text-base text-gray-700 leading-relaxed">{product.description}</p>
          )}
          <div>
            <h2 className="text-lg font-medium mt-6 mb-2">Details:</h2>
            {!product.details && (
              <div className="grid grid-cols-2 text-sm gap-y-2">
                <span className="text-gray-600">Metal</span>
                <span>14k Rose Gold</span>
                <span className="text-gray-600">Diamond Quality</span>
                <span>VS+</span>
                <span className="text-gray-600">Diamond Color</span>
                <span>D–F</span>
                <span className="text-gray-600">Carat Weight</span>
                <span>42.3 ct</span>
                <span className="text-gray-600">Dimensions</span>
                <span>Length – 4.3 inches</span>
              </div>
            )}
            {product.details && (
              <div className="grid grid-cols-2 text-sm gap-y-2">
                {Object.entries(product.details).map(([label, value]) => (
                  <React.Fragment key={label}>
                    <span className="text-gray-600">{label}</span>
                    <span>{value}</span>
                  </React.Fragment>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
