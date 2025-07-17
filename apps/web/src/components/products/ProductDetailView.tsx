// components/product/ProductDetailView.tsx
"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Product } from "@/types/product";
import { fetchProducts } from "@/utils/api";
import {
    ProductImageGallery,
    ProductInfo,
    ProductOptions,
    RelatedProducts,
    ProductReviews,
    SocialShare
} from "@/components/products";
import { PRODUCT_CONFIG } from "@/config/productConfig";

interface ProductDetailViewProps {
    product: Product;
}

export default function ProductDetailView({ product }: ProductDetailViewProps) {
    const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
    const [isLoadingRelated, setIsLoadingRelated] = useState(false);
    const sectionRef = useRef<HTMLDivElement>(null);
    const isInView = useInView(sectionRef, { once: true, amount: 0.1 });

    const images = product.image_urls?.length ? product.image_urls : [product.image_url];
    const isDark = product.display_theme === "dark";

    // Load related products
    useEffect(() => {
        const loadRelatedProducts = async () => {
            if (!product.category) return;

            try {
                setIsLoadingRelated(true);
                const response = await fetchProducts({
                    category: product.category,
                    pageSize: 8
                });

                // Filter out current product
                const filtered = response.products?.filter((product: Product) => product.id !== product.id) || [];
                setRelatedProducts(filtered.slice(0, 6));
            } catch (error) {
                console.error('Failed to load related products:', error);
                setRelatedProducts([]);
            } finally {
                setIsLoadingRelated(false);
            }
        };

        loadRelatedProducts();
    }, [product.id, product.category]);

    // Page entrance animation variants
    const pageVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                duration: PRODUCT_CONFIG.animations.pageEntrance.duration,
                staggerChildren: PRODUCT_CONFIG.animations.pageEntrance.staggerDelay,
            },
        },
    };

    const sectionVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: PRODUCT_CONFIG.animations.sectionEntrance.duration,
                ease: "easeOut",
            },
        },
    };

    return (
        <motion.div
            ref={sectionRef}
            variants={pageVariants}
            initial="hidden"
            animate="visible"
            className="min-h-screen transition-colors duration-500 bg-gradient-to-br from-white to-gray-50 text-black  dark:bg-gradient-to-br dark:from-gray-900 dark:to-black dark:text-white selection"

        >
            {/* Navigation */}
            <motion.div
                variants={sectionVariants}
                className="pt-[var(--navbar-height)] px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
            >
                <div className="mb-8 md:mb-12">
                    <Link
                        href="/shop"
                        className="inline-flex items-center gap-3 text-sm tracking-wider uppercase font-medium hover:text-gold transition-colors duration-300 group"
                        aria-label="Return to Shop"
                    >
                        <ArrowLeft
                            size={16}
                            className="transform group-hover:-translate-x-1 transition-transform duration-300"
                        />
                        <span>Back to Collection</span>
                    </Link>
                </div>

                {/* Main Product Content */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 mb-20">
                    {/* Product Images */}
                    <motion.div variants={sectionVariants}>
                        <ProductImageGallery
                            images={images}
                            productName={product.name}
                            isDark={isDark}
                        />
                    </motion.div>

                    {/* Product Information */}
                    <motion.div variants={sectionVariants} className="space-y-8">
                        <ProductInfo
                            product={product}
                            isDark={isDark}
                        />

                        <ProductOptions
                            product={product}
                            isDark={isDark}
                        />

                        <SocialShare
                            product={product}
                            isDark={isDark}
                        />
                    </motion.div>
                </div>

                {/* Product Reviews */}
                {PRODUCT_CONFIG.features.showReviews && (
                    <motion.div
                        variants={sectionVariants}
                        className="mb-20"
                    >
                        <ProductReviews
                            productId={product.id}
                            productName={product.name}
                            isDark={isDark}
                        />
                    </motion.div>
                )}

                {/* Related Products */}
                {PRODUCT_CONFIG.features.showRelatedProducts && relatedProducts.length > 0 && (
                    <motion.div
                        variants={sectionVariants}
                        className="mb-20"
                    >
                        <RelatedProducts
                            products={relatedProducts}
                            isLoading={isLoadingRelated}
                            currentProductCategory={product.category}
                            isDark={isDark}
                        />
                    </motion.div>
                )}
            </motion.div>

            {/* Luxury spacing at bottom */}
            <div className="h-20" />
        </motion.div>
    );
}