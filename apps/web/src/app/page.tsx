"use client";

import { useEffect, useState } from "react";
import { fetchProducts } from "../utils/api";
import { Product } from "../types/product";
import Hero from "../components/Hero";
import Collections from "../components/Collections";
import CategoriesCarousel from "@/components/CategoriesCarousel";

export default function Home() {
    const [, setFeaturedProducts] = useState<Product[]>([]);

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
        </main>
    );
}
