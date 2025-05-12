'use client';

import { useState } from 'react';
import { Product } from '../types/product';
import AddToCartToast from './AddtoCartToast';
import AddToCartButton from './AddToCartButton';
import { motion } from 'framer-motion';
import Link from 'next/link';


interface ProductGridProps {
    products: Product[];
}

export default function ProductGrid({ products }: ProductGridProps) {
    const [addedProduct, _] = useState<{ name: string; image_url: string } | null>(null);

    return (
        <>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 p-4">
                {products.map((product) => (
                    <Link key={product.id} href={`/product/${product.id}`}>
                    <motion.div
                      className="relative border border-white/10 rounded-2xl overflow-hidden shadow-xl shadow-neutral-900/20 hover:shadow-2xl transition-shadow"
                      whileHover={{ scale: 1.03 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="-mt-4 -mx-4">
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-full h-48 object-cover object-top"
                        />
                      </div>
                      <div className="px-4 pb-4 pt-2 bg-black">
                        <h3 className="text-lg font-semibold font-sans-serif">{product.name}</h3>
                        <p className="text-gray-600">${product.price.toFixed(2)}</p>
                        <AddToCartButton productId={product.id}/>
                      </div>
                    </motion.div>
                  </Link>
                ))}
            </div>

            <AddToCartToast product={addedProduct} />
        </>
    );
}
