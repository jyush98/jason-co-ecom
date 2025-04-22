'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

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
          className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white text-black px-4 py-3 rounded-xl shadow-lg flex items-center space-x-4 z-50"
        >
          <Image
            src={product.image_url}
            alt={product.name}
            width={48}
            height={48}
            className="rounded object-cover"
          />
          <div className="text-sm font-medium">
            <p className="mb-0.5">Added to Cart</p>
            <p className="text-gray-600">{product.name}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
