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
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState<string>(initialCategory || "All");
    const [loading, setLoading] = useState<boolean>(true);

    const [page, setPage] = useState(1);
    const [pageSize] = useState(12);
    const [sortBy, setSortBy] = useState("price");
    const [sortOrder, setSortOrder] = useState("asc");

    const debounceTimer = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const querySearch = searchParams?.get("search") || "";
        setSearch(querySearch);
      }, [searchParams]);
      

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
        return (
            <div className="pt-[var(--navbar-height)] text-center text-black dark:text-white text-xl">
                Loading...
            </div>
        );
    }

    return (
        <div className="pt-[var(--navbar-height)] max-w-screen-xl mx-auto px-4 py-20 bg-white text-black dark:bg-black dark:text-white transition-colors duration-300">
            {/* Header */}
            <h2 className="text-4xl font-sans uppercase text-center tracking-wider mb-12">
                Shop All Jewelry
            </h2>

            {/* Controls */}
            <div className="flex justify-center mb-16">
                <div className="w-full flex flex-wrap items-center gap-4">
                    {/* Search Bar */}
                    <input
                        type="text"
                        placeholder="Search for a piece..."
                        className="flex-grow px-6 py-3 h-[60px] border border-black dark:border-white bg-white text-black dark:bg-black dark:text-white placeholder-black/40 dark:placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20 transition-all text-base tracking-wide"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />

                    {/* Category Filter */}
                    <select
                        value={category}
                        onChange={(e) => handleCategoryChange(e.target.value)}
                        className="min-w-[140px] px-4 py-3 h-[60px] border border-black dark:border-white bg-white text-black dark:bg-black dark:text-white tracking-wide"
                    >
                        {categories.map((cat) => (
                            <option key={cat} value={cat}>
                                {cat}
                            </option>
                        ))}
                    </select>

                    {/* Sort Selector */}
                    <select
                        value={`${sortBy}-${sortOrder}`}
                        onChange={(e) => {
                            const [field, direction] = e.target.value.split("-");
                            setSortBy(field);
                            setSortOrder(direction);
                        }}
                        className="min-w-[170px] px-4 py-3 h-[60px] border border-black dark:border-white bg-white text-black dark:bg-black dark:text-white tracking-wide"
                    >
                        <option value="price-asc">Price - Asc</option>
                        <option value="price-desc">Price - Desc</option>
                        <option value="name-asc">Name - Asc</option>
                        <option value="name-desc">Name - Desc</option>
                    </select>
                </div>

            </div>

            {/* Product Grid or Empty State */}
            {products.length > 0 ? (
                <ProductGrid products={products} />
            ) : (
                <div className="text-center text-lg mt-20 tracking-wide">
                    No results found.
                </div>
            )}

            {/* Pagination */}
            <div className="flex justify-center mt-20">
                <button
                    onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                    className="px-6 py-2 border border-black text-black uppercase tracking-wide hover:bg-black hover:text-white dark:border-white dark:text-white dark:hover:bg-white dark:hover:text-black transition mx-2"
                    disabled={page === 1}
                >
                    Previous
                </button>
                <span className="text-lg mx-4">Page {page}</span>
                <button
                    onClick={() => setPage((prev) => prev + 1)}
                    className="px-6 py-2 border border-black text-black uppercase tracking-wide hover:bg-black hover:text-white dark:border-white dark:text-white dark:hover:bg-white dark:hover:text-black transition mx-2"
                >
                    Next
                </button>
            </div>
        </div>
    );
}
