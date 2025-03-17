"use client";

import { useAuth } from "@clerk/nextjs";
import { addToCart } from "../utils/cart";
import { motion } from "framer-motion";
import { Product } from "../types/product";

interface ProductGridProps {
    products: Product[];
}

export default function ProductGrid({ products }: ProductGridProps) {
    const { getToken } = useAuth();

    const handleAddToCart = async (productId: number) => {
        const token = await getToken();
        console.log(token);
        if (token) {
            await addToCart(productId, 1, token);
        }
    };

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10 mt-8">
            {products.map((product) => (
                <motion.div
                    key={product.id}
                    className="relative bg-gray-900 border border-gray-800 rounded-lg overflow-hidden shadow-lg transform hover:scale-105 transition">
                    <img src={product.image_url} alt={product.name} className="w-full h-80 object-cover rounded-t-lg" />
                    <div className="p-4 text-center">
                        <h3 className="text-xl font-semibold text-white">{product.name}</h3>
                        <p className="text-lg text-gray-300">${product.price.toFixed(2)}</p>
                        <div className="flex justify-center space-x-4">
                            <button className="mt-4 px-6 py-2 bg-gray-400 text-white rounded-lg hover:bg-gold-600 transition shadow-md">
                                View Details
                            </button>
                            <button className="mt-4 px-6 py-2 bg-gray-400 text-white rounded-lg hover:bg-black transition shadow-md"
                            onClick={() => handleAddToCart(product.id)}>
                                Add to Cart
                            </button>
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    );
}
