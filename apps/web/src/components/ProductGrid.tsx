"use client";

import { useState } from "react";
import { Product } from "../types/product";
import AddToCartToast from "./AddtoCartToast";
import AddToCartButton from "./AddToCartButton";
import { motion } from "framer-motion";
import Link from "next/link";

interface ProductGridProps {
  products: Product[];
}

export default function ProductGrid({ products }: ProductGridProps) {
  const [addedProduct] = useState<{ name: string; image_url: string } | null>(null);
  const [activeId, setActiveId] = useState<number | null>(null);

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {products.map((product) => {
          const primary = product.image_urls?.[0] || product.image_url;
          const hover = product.image_urls?.[1] || product.image_url;

          const isActive = activeId === product.id;

          return (
            <Link
              key={product.id}
              href={`/product/${product.id}`}
              aria-label={`View details for ${product.name}`}
              onTouchStart={() => setActiveId(product.id)}
              onMouseEnter={() => setActiveId(product.id)}
              onMouseLeave={() => setActiveId(null)}
            >
              <motion.div
                className="relative border border-white/10 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-shadow bg-black flex flex-col h-full"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <div className="w-full aspect-square relative">
                  <img
                    src={primary}
                    alt={`${product.name} main image`}
                    className={`w-full h-full object-cover object-center absolute inset-0 transition-all duration-500 ease-in-out transform ${isActive ? "opacity-0" : "opacity-100 hover:scale-110"
                      }`}
                  />
                  <img
                    src={hover}
                    alt={`${product.name} alternate view`}
                    className={`w-full h-full object-cover object-center absolute inset-0 transition-all duration-500 ease-in-out transform ${isActive ? "opacity-100" : "opacity-0 hover:scale-110"
                      }`}
                    aria-hidden="true"
                  />
                </div>
                <div className="flex flex-col justify-between px-4 py-3 text-white grow">
                  <div className="space-y-1">
                    <h3 className="text-lg font-medium">{product.name}</h3>
                    <p className="text-sm text-white/70">${product.price.toFixed(2)}</p>
                  </div>
                  <AddToCartButton productId={product.id} productName={product.name} productPrice={product.price} productImageUrl={product.image_url} aria-label={`Add ${product.name} to cart`} />
                </div>
              </motion.div>
            </Link>
          );
        })}
      </div>

      <AddToCartToast product={addedProduct} />
    </>
  );
}
