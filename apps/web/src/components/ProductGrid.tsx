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

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {products.map((product) => (
          <Link key={product.id} href={`/product/${product.id}`}>
            <motion.div
              className="relative border border-white/10 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-shadow bg-black"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <div className="w-full aspect-square overflow-hidden">
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover object-center"
                />
              </div>
              <div className="px-4 py-3 text-white space-y-1">
                <h3 className="text-lg font-medium">{product.name}</h3>
                <p className="text-sm text-white/70">${product.price.toFixed(2)}</p>
                <AddToCartButton productId={product.id} />
              </div>
            </motion.div>
          </Link>
        ))}
      </div>

      <AddToCartToast product={addedProduct} />
    </>
  );
}
