"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { fetchProducts } from "../utils/api";
import { Product } from "../types/product";
import ProductGrid from "./ProductGrid";

const categories = ["All", "Necklaces", "Bracelets", "Rings"];

export default function ProductList({ initialCategory }: { initialCategory?: string }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [minPrice, setMinPrice] = useState<number | undefined>();
  const [maxPrice, setMaxPrice] = useState<number | undefined>();
  const [category, setCategory] = useState<string>(initialCategory || "All");
  const [loading, setLoading] = useState<boolean>(true);

  const [page, setPage] = useState(1);
  const [pageSize] = useState(12);
  const [sortBy, setSortBy] = useState("price");
  const [sortOrder, setSortOrder] = useState("asc");

  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  const getProducts = useCallback(() => {
    setLoading(true);
    fetchProducts({ name: search, minPrice, maxPrice, category, page, pageSize, sortBy, sortOrder })
      .then(setProducts)
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [search, minPrice, maxPrice, category, page, pageSize, sortBy, sortOrder]);

  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      getProducts();
    }, 300);
  }, [search, minPrice, maxPrice, category, page, pageSize, sortBy, sortOrder, getProducts]);

  useEffect(() => {
    setCategory(initialCategory || "All");
  }, [initialCategory]);

  if (loading) {
    return <div className="text-center text-gold-400 text-xl">Loading...</div>;
  }

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-10">
      <h2 className="text-4xl font-serif text-center text-white uppercase tracking-wider mb-8">
        Shop All Jewelry
      </h2>

      {/* Controls */}
      <div className="flex flex-wrap gap-4 justify-center md:justify-between mb-8">
        <div className="flex flex-wrap gap-4 w-full md:w-auto justify-center">
          <input
            type="text"
            placeholder="Search..."
            className="px-4 py-2 border border-white bg-black text-white rounded-lg w-60"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <input
            type="number"
            placeholder="Min"
            className="px-4 py-2 border border-white bg-black text-white rounded-lg w-28"
            value={minPrice || ""}
            onChange={(e) => setMinPrice(e.target.value ? parseFloat(e.target.value) : undefined)}
          />
          <input
            type="number"
            placeholder="Max"
            className="px-4 py-2 border border-white bg-black text-white rounded-lg w-28"
            value={maxPrice || ""}
            onChange={(e) => setMaxPrice(e.target.value ? parseFloat(e.target.value) : undefined)}
          />
          <select
            className="px-4 py-2 border border-white bg-black text-white rounded-lg"
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

        <div className="flex gap-4 justify-center w-full md:w-auto">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-white bg-black text-white rounded-lg"
          >
            <option value="price">Sort by Price</option>
            <option value="name">Sort by Name</option>
          </select>

          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="px-4 py-2 border border-white bg-black text-white rounded-lg"
          >
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
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
