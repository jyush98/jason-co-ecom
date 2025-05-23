"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { fetchProducts } from "../utils/api";
import { Product } from "../types/product";
import ProductGrid from "./ProductGrid";

const categories = ["All", "Necklaces", "Bracelets", "Rings"];

export default function ProductList({ initialCategory }: { initialCategory?: string }) {
    const searchParams = useSearchParams();
    const router = useRouter();

    const [products, setProducts] = useState<Product[]>([]);
    const [search, setSearch] = useState(searchParams?.get("name") || "");
    const [category, setCategory] = useState<string>(initialCategory || "All");
    const [loading, setLoading] = useState<boolean>(true);

    const [page, setPage] = useState(1);
    const [pageSize] = useState(12);
    const [sortBy, setSortBy] = useState("price");
    const [sortOrder, setSortOrder] = useState("asc");

    const debounceTimer = useRef<NodeJS.Timeout | null>(null);

    const getProducts = useCallback(() => {
        setLoading(true);
        fetchProducts({ name: search, category, page, pageSize, sortBy, sortOrder })
            .then(setProducts)
            .catch(() => setProducts([]))
            .finally(() => setLoading(false));
    }, [search, category, page, pageSize, sortBy, sortOrder]);

    useEffect(() => {
        if (debounceTimer.current) clearTimeout(debounceTimer.current);
        debounceTimer.current = setTimeout(() => {
            getProducts();
        }, 300);
    }, [search, category, page, pageSize, sortBy, sortOrder, getProducts]);

    useEffect(() => {
        setCategory(initialCategory || "All");
    }, [initialCategory]);

    const handleCategoryChange = (value: string) => {
        const params = new URLSearchParams(window.location.search);
        if (value === "All") {
            params.delete("category");
        } else {
            params.set("category", value);
        }
        router.push(`/shop?${params.toString()}`);
        setCategory(value);
    };

    if (loading) {
        return <div className="pt-[var(--navbar-height)] text-center text-white-400 text-xl">Loading...</div>;
    }

    return (
        <div className="pt-[var(--navbar-height)] max-w-screen-xl mx-auto px-4 py-10">
            <h2 className="text-4xl font-sans-serif text-center text-white uppercase tracking-wider mb-8 hidden">
                Shop All Jewelry
            </h2>

            {/* Controls */}
            <div className="flex justify-center mb-8">
                <div className="w-full md:w-[70%] flex flex-col gap-4">
                    <input
                        type="text"
                        placeholder="Search for a piece..."
                        className="w-full px-6 py-3 bg-black border border-white/30 rounded-full text-white placeholder-white/40 shadow-inner focus:outline-none focus:ring-2 focus:ring-white/50 transition-all text-base"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />

                    <div className="flex flex-wrap gap-3 items-center justify-center text-sm">
                        <select
                            value={category}
                            onChange={(e) => handleCategoryChange(e.target.value)}
                            className="px-5 py-3 bg-black border border-white/30 rounded-full text-white shadow-inner focus:outline-none focus:ring-2 focus:ring-white/50 transition-all text-sm"
                        >
                            {categories.map((cat) => (
                                <option key={cat} value={cat}>
                                    {cat}
                                </option>
                            ))}
                        </select>

                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="px-5 py-3 bg-black border border-white/30 rounded-full text-white shadow-inner focus:outline-none focus:ring-2 focus:ring-white/50 transition-all text-sm"
                        >
                            <option value="price">Price</option>
                            <option value="name">Name</option>
                        </select>

                        <select
                            value={sortOrder}
                            onChange={(e) => setSortOrder(e.target.value)}
                            className="px-5 py-3 bg-black border border-white/30 rounded-full text-white shadow-inner focus:outline-none focus:ring-2 focus:ring-white/50 transition-all text-sm"
                        >
                            <option value="asc">Asc</option>
                            <option value="desc">Desc</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Product Grid */}
            <ProductGrid products={products} />

            {/* Pagination */}
            <div className="flex justify-center mt-10">
                <button
                    onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                    className="px-4 py-2 bg-white text-black rounded-lg mx-2 disabled:opacity-50"
                    disabled={page === 1}
                >
                    Previous
                </button>
                <span className="text-white text-lg mx-4">Page {page}</span>
                <button
                    onClick={() => setPage((prev) => prev + 1)}
                    className="px-4 py-2 bg-white text-black rounded-lg mx-2"
                >
                    Next
                </button>
            </div>
        </div>
    );
}
