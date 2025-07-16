"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { fetchProducts } from "@/utils/api";
import { Product } from "@/types/product";
import {
    VideoHero,
    FeaturedProducts,
    CollectionsShowcase,
    CategoriesSection
} from "@/components/home";

export default function HomePage() {
    const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getFeaturedProducts = async () => {
            try {
                setLoading(true);
                const filters = {};
                const data = await fetchProducts(filters);

                // Filter for featured products, fallback to first 6 if no featured products
                const featured = data.filter((product: Product) => product.featured);
                const displayProducts = featured.length > 0 ? featured : data.slice(0, 6);

                setFeaturedProducts(displayProducts);
            } catch (error) {
                console.error("Error fetching featured products:", error);
                setFeaturedProducts([]);
            } finally {
                setLoading(false);
            }
        };

        getFeaturedProducts();
    }, []);

    return (
        <motion.main
            className="min-h-screen bg-white text-black dark:bg-black dark:text-white transition-colors duration-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            {/* Hero Section */}
            <VideoHero
                videoSrc="/hero-video.mp4" // Replace with your video path
                fallbackImage="/patek-philippe-246234.jpg" // Your current hero image
                title="WHERE AMBITION MEETS ARTISTRY"
                subtitle="Designed without Limits"
                ctaText="EXPLORE COLLECTION"
                ctaLink="/shop"
            />

            {/* Featured Products Section */}
            {!loading && featuredProducts.length > 0 && (
                <FeaturedProducts
                    products={featuredProducts}
                    title="SIGNATURE PIECES"
                    subtitle="Crafted for those who demand excellence"
                    showPrices={true}
                />
            )}

            {/* Collections Showcase */}
            <CollectionsShowcase
                title="COLLECTIONS"
            />

            {/* Categories Section */}
            <CategoriesSection
                title="EXPLORE BY CATEGORY"
                autoplay={true}
                autoplayInterval={5000}
            />

            {/* Optional: Loading State for Featured Products */}
            {loading && (
                <section className="py-20 md:py-32 bg-white dark:bg-black">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center">
                            <div className="w-12 h-12 border-2 border-gold/30 border-t-gold rounded-full animate-spin mx-auto mb-4" />
                            <p className="text-gray-600 dark:text-gray-400 text-sm tracking-widest uppercase">
                                Loading Featured Products
                            </p>
                        </div>
                    </div>
                </section>
            )}
        </motion.main>
    );
}