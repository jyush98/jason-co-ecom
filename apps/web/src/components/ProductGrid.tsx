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
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-10">
        {products.map((product) => {
          const primary = product.image_urls?.[0] || product.image_url;
          const hover = product.image_urls?.[1] || product.image_url;
          const isActive = activeId === product.id;
          const isDark = product.display_theme === "dark";
          console.log(isDark);
          console.log(product.display_theme);

          return (
            <Link
              key={product.id}
              href={`/product/${product.id}`}
              aria-label={`View details for ${product.name}`}
              onTouchStart={() => setActiveId(product.id)}
              onMouseEnter={() => setActiveId(product.id)}
              onMouseLeave={() => setActiveId(null)}
              className={`group text-center space-y-4 p-6 transition border ${isDark ? "bg-black text-white border-white" : "bg-white text-black border-black"
                }`}
            >
              <motion.div
                className="relative aspect-square w-full flex items-center justify-center"
                whileHover={{ scale: 1.01 }}
                transition={{ duration: 0.3 }}
              >
                <img
                  src={primary}
                  alt={`${product.name} main image`}
                  className={`absolute inset-0 object-contain w-full h-full transition-opacity duration-500 ease-in-out ${isActive ? "opacity-0" : "opacity-100 group-hover:scale-105"}`}
                />
                <img
                  src={hover}
                  alt={`${product.name} alternate view`}
                  className={`absolute inset-0 object-contain w-full h-full transition-opacity duration-500 ease-in-out ${isActive ? "opacity-100" : "opacity-0 group-hover:scale-105"}`}
                  aria-hidden="true"
                />
              </motion.div>

              <h3 className="uppercase text-sm tracking-widest">{product.name}</h3>
              <p className="text-xs text-gray-400 dark:text-gray-500">La Collection</p>

              <div className="w-6 h-6 mx-auto rounded-full border border-gray-300 flex items-center justify-center hover:bg-gold transition">
                <span className="text-[10px] text-gold">→</span>
              </div>

              <div className="hidden">
                <AddToCartButton
                  productId={product.id}
                  productName={product.name}
                  productPrice={product.price}
                  productImageUrl={product.image_url}
                  aria-label={`Add ${product.name} to cart`}
                />
              </div>
            </Link>
          );
        })}
      </div>

      <AddToCartToast product={addedProduct} />
    </>
  );
}
