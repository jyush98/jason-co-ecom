"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

interface AddToCartToastProps {
  product: {
    name: string;
    image_url: string;
  } | null;
}

export default function AddToCartToast({ product }: AddToCartToastProps) {
  return (
    <AnimatePresence>
      {product && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white text-black dark:bg-black dark:text-white border border-black dark:border-white px-5 py-4 rounded-none flex items-center space-x-4 z-50 shadow-md"
        >
          <Image
            src={product.image_url}
            alt={product.name}
            width={48}
            height={48}
            className="object-cover aspect-square border border-black dark:border-white"
          />
          <div className="text-sm leading-snug tracking-wide">
            <p className="mb-0.5 uppercase text-xs">Added to Cart</p>
            <p className="text-black dark:text-white font-medium">{product.name}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
