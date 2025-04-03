"use client";

import { useEffect, useState } from "react";
import { fetchProducts } from "../utils/api";
import ProductGrid from "../components/ProductGrid";
import { Product } from "../types/product";
import Hero from "../components/Hero";
import Collections from "../components/Collections";
import CategoriesCarousel from "@/components/CategoriesCarousel";

export default function Home() {
    const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);

    useEffect(() => {
        const getFeaturedProducts = async () => {
            try {
                const filters = {};
                const data = await fetchProducts(filters);
                const featured = data.filter((product: Product) => product.featured);
                setFeaturedProducts(featured);
            } catch (error) {
                console.error("Error fetching featured products:", error);
                setFeaturedProducts([]);
            }
        };
        getFeaturedProducts();
    }, []);

    return (
        <main className="min-h-screen p-8 pt-navbar">
            <Hero />
            <Collections />
            <CategoriesCarousel />
            {/* <div className="container mx-auto py-12">
                <h2 className="text-4xl font-serif text-center text-gray-300 uppercase tracking-wide">
                    Featured Jewelry
                </h2>
                <ProductGrid products={featuredProducts} />
            </div> */}
        </main>
    );
}
