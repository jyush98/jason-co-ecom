"use client";

import { useEffect, useState } from "react";
import { fetchProducts } from "../utils/api";
import { addToCart } from "../utils/cart";
import { useAuth } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { Product } from "../types/product";

const categories = ["All", "Necklaces", "Bracelets", "Rings"];

export default function ProductList() {
    const { getToken } = useAuth();
    const [products, setProducts] = useState<Product[]>([]);
    const [search, setSearch] = useState("");
    const [minPrice, setMinPrice] = useState<number | undefined>();
    const [maxPrice, setMaxPrice] = useState<number | undefined>();
    const [category, setCategory] = useState<string>("All");
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const getProducts = async () => {
            try {
                setLoading(true);
                const filters = {
                    name: search,
                    minPrice,
                    maxPrice,
                    category: category !== "All" ? category : undefined,
                };
                const data = await fetchProducts(filters);
                setProducts(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error("Error fetching products:", error);
                setProducts([]);
            } finally {
                setLoading(false);
            }
        };
        getProducts();
    }, [search, minPrice, maxPrice, category]);

    const handleAddToCart = async (productId: number) => {
        const token = await getToken();
        if (token) {
            await addToCart(productId, 1, token);
            alert("Item added to cart!");
        }
    };

    if (loading) {
        return <div className="text-center text-gold-400 text-xl">Loading...</div>;
    }

    return (
        <div className="container mx-auto py-12">
            <h2 className="text-4xl font-serif text-center text-gray-200 uppercase tracking-wider">
                Featured Jewelry
            </h2>

            {/* Filters */}
            <div className="flex flex-wrap gap-4 justify-center mt-6 mb-10">
                <input
                    type="text"
                    placeholder="Search..."
                    className="px-4 py-2 border border-white bg-black text-white rounded-lg w-64 focus:outline-none"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <input
                    type="number"
                    placeholder="Min Price"
                    className="px-4 py-2 border border-white bg-black text-white rounded-lg w-32 focus:outline-none"
                    value={minPrice || ""}
                    onChange={(e) => setMinPrice(e.target.value ? parseFloat(e.target.value) : undefined)}
                />
                <input
                    type="number"
                    placeholder="Max Price"
                    className="px-4 py-2 border border-white bg-black text-white rounded-lg w-32 focus:outline-none"
                    value={maxPrice || ""}
                    onChange={(e) => setMaxPrice(e.target.value ? parseFloat(e.target.value) : undefined)}
                />
                <select
                    className="px-4 py-2 border border-white bg-black text-white rounded-lg focus:outline-none"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                >
                    {categories.map((cat) => (
                        <option key={cat} value={cat}>
                            {cat}
                        </option>
                    ))}
                </select>
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10 mt-8">
                {products.map((product) => (
                    <motion.div
                        key={product.id}
                        className="relative bg-gray-900 border border-gray-800 rounded-lg overflow-hidden shadow-lg transform hover:scale-105 transition">
                        <img src={product.image_url} alt={product.name} className="w-full h-80 object-cover rounded-t-lg" />
                        <div className="p-4 text-center">
                            <h3 className="text-xl font-semibold text-white">{product.name}</h3>
                            <p className="text-lg text-gray-300">${product.price.toFixed(2)}</p>
                            <button className="mt-4 px-6 py-2 bg-gray-400 text-white rounded-lg hover:bg-gold-600 transition shadow-md">
                                View Details
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
