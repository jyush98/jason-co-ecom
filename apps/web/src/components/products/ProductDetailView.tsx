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
import { createEntranceAnimation, pageContainer } from "@/lib/animations";

interface ProductDetailViewProps {
    product: Product;
}

export default function ProductDetailView({ product }: ProductDetailViewProps) {
    const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
    const [isLoadingRelated, setIsLoadingRelated] = useState(false);
    const sectionRef = useRef<HTMLDivElement>(null);
    const _isInView = useInView(sectionRef, { once: true, amount: 0.1 }); // Fixed: Added underscore prefix

    // Fixed: Properly handle image URLs with type safety
    const images: string[] = product.image_urls?.filter((url): url is string => url != null) ||
        (product.image_url ? [product.image_url] : []);

    const isDark = product.display_theme === "dark";

    // Fixed: Handle category type properly
    const getCategoryString = (category: Product['category']): string | undefined => {
        if (typeof category === 'string') {
            return category;
        }
        if (category && typeof category === 'object' && 'name' in category) {
            return category.name;
        }
        return undefined;
    };

    // Load related products
    useEffect(() => {
        const loadRelatedProducts = async () => {
            const categoryString = getCategoryString(product.category);
            if (!categoryString) return;

            try {
                setIsLoadingRelated(true);
                const response = await fetchProducts({
                    category: categoryString, // Fixed: Use string category
                    pageSize: 8
                });

                // Fixed: Proper filter logic - compare with current product ID
                const filtered = response.products?.filter((relatedProduct: Product) => relatedProduct.id !== product.id) || [];
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
    const pageVariants = pageContainer;

    const sectionVariants = createEntranceAnimation(30, 1, 0.8);

    return (
        <motion.div
            ref={sectionRef}
            variants={pageVariants}
            initial="hidden"
            animate="visible"
            className="min-h-screen transition-colors duration-500 bg-gradient-to-br from-white to-gray-50 text-black dark:bg-gradient-to-br dark:from-gray-900 dark:to-black dark:text-white selection"
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
                            images={images} // Fixed: Now properly typed as string[]
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
                            currentProductCategory={getCategoryString(product.category)} // Fixed: Convert to string
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