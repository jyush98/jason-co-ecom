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
import { HOME_CONFIG } from "@/config/homeConfig";
import { defaultCollections, defaultCategories, heroVideoConfig } from "@/data/homepage";

export default function HomePage() {
    const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadFeaturedProducts = async () => {
            try {
                setIsLoading(true);
                const response = await fetchProducts({ pageSize: 8 });
                setFeaturedProducts(response.products || []);
            } catch (error) {
                console.error('Failed to load featured products:', error);
                setFeaturedProducts([]);
            } finally {
                setIsLoading(false);
            }
        };

        loadFeaturedProducts();
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="min-h-screen"
        >
            {/* Video Hero Section */}
            <VideoHero
                videoSrc={heroVideoConfig.src}
                fallbackImage={heroVideoConfig.fallback}
                title={HOME_CONFIG.hero.title}
                subtitle={HOME_CONFIG.hero.subtitle}
                ctaText={HOME_CONFIG.hero.ctaText}
                ctaLink={HOME_CONFIG.hero.ctaLink}
                autoplay={HOME_CONFIG.hero.autoplay}
                showControls={HOME_CONFIG.hero.showControls}
            />

            {/* Featured Products Section */}
            {!isLoading && featuredProducts.length > 0 && (
                <FeaturedProducts
                    products={featuredProducts}
                    title={HOME_CONFIG.featuredProducts.title}
                    subtitle={HOME_CONFIG.featuredProducts.subtitle}
                    showPrices={HOME_CONFIG.featuredProducts.showPrices}
                    viewAllLink={HOME_CONFIG.featuredProducts.viewAllLink}
                />
            )}

            {/* Collections Showcase */}
            <CollectionsShowcase
                collections={defaultCollections}
                title={HOME_CONFIG.collections.title}
            />

            {/* Categories Section */}
            <CategoriesSection
                categories={defaultCategories}
                title={HOME_CONFIG.categories.title}
                autoplay={HOME_CONFIG.categories.autoplay}
                autoplayInterval={HOME_CONFIG.categories.autoplayInterval}
            />
        </motion.div>
    );
}