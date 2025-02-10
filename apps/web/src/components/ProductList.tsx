"use client"

import { useEffect, useState } from "react";
import { fetchProducts } from "../utils/api";
import { motion } from "framer-motion";

interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    image_url: string;
    category: string;
}

const categories = ["All", "Necklaces", "Bracelets", "Rings"];

const ProductList = () => {
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
                console.log("API Response:", data); // Debug the response
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

    if (loading) {
        return <div className="text-center">Loading...</div>;
    }

    return (
        <div className="container mx-auto p-8">
            <h1 className="text-3xl font-bold text-center mb-8 text-gray-900">Featured Jewelry</h1>

            {/* Filter Section */}
            <div className="flex flex-wrap gap-4 justify-center mb-6">
                <input
                    type="text"
                    placeholder="Search for jewelry..."
                    className="px-4 py-2 border rounded-lg w-64 focus:outline-none"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <input
                    type="number"
                    placeholder="Min Price"
                    className="px-4 py-2 border rounded-lg w-32 focus:outline-none"
                    value={minPrice || ""}
                    onChange={(e) => setMinPrice(e.target.value ? parseFloat(e.target.value) : undefined)}
                />
                <input
                    type="number"
                    placeholder="Max Price"
                    className="px-4 py-2 border rounded-lg w-32 focus:outline-none"
                    value={maxPrice || ""}
                    onChange={(e) => setMaxPrice(e.target.value ? parseFloat(e.target.value) : undefined)}
                />
                <select
                    className="px-4 py-2 border rounded-lg focus:outline-none"
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
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {products.map((product) => (
                    <motion.div key={product.id} className="bg-white rounded-xl shadow-lg p-4">
                        <img src={product.image_url} alt={product.name} className="w-full h-56 object-cover" />
                        <h2 className="text-lg font-semibold">{product.name}</h2>
                        <p>${product.price.toFixed(2)}</p>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default ProductList;
