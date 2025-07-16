"use client";

import { useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Product } from "@/types/product";
import { ProductCard } from "@/components/shop";
import { HOME_CONFIG } from "@/config";
import { useInfiniteCarousel } from "@/lib/hooks";

interface FeaturedProductsProps {
    products: Product[];
    title?: string;
    subtitle?: string;
    showPrices?: boolean;
    viewAllLink?: string;
    isLoading?: boolean;
}

export default function FeaturedProducts({
    products,
    title = HOME_CONFIG.featuredProducts.title,
    subtitle = HOME_CONFIG.featuredProducts.subtitle,
    showPrices = HOME_CONFIG.featuredProducts.showPrices,
    viewAllLink = HOME_CONFIG.featuredProducts.viewAllLink,
    isLoading = false
}: FeaturedProductsProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const sectionRef = useRef<HTMLDivElement>(null);
    const isInView = useInView(sectionRef, { once: true, amount: 0.3 });

    const itemWidth = HOME_CONFIG.featuredProducts.itemWidth;
    const gap = HOME_CONFIG.featuredProducts.gap;

    // Use infinite carousel hook
    const { currentIndex, goLeft, goRight, goToSlide } = useInfiniteCarousel({
        itemCount: products.length,
        autoplay: false, // No autoplay for featured products
        onSlideChange: (index) => {
            // Update scroll position when slide changes
            if (scrollRef.current) {
                const scrollAmount = index * (itemWidth + gap);
                scrollRef.current.scrollTo({
                    left: scrollAmount,
                    behavior: 'smooth'
                });
            }
        }
    });

    // Update scroll position when currentIndex changes
    useEffect(() => {
        if (!scrollRef.current) return;

        const scrollAmount = currentIndex * (itemWidth + gap);
        scrollRef.current.scrollTo({
            left: scrollAmount,
            behavior: 'smooth'
        });
    }, [currentIndex, itemWidth, gap]);

    if (isLoading) {
        return (
            <section className="py-20 md:py-32 bg-white dark:bg-black text-black dark:text-white transition-colors duration-500">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-sans tracking-wide mb-6">
                            {title}
                        </h2>
                        <div className="w-24 h-px bg-gold mx-auto mb-6" />
                        <p className="text-gray-600 dark:text-gray-400 text-lg tracking-wide max-w-2xl mx-auto">
                            {subtitle}
                        </p>
                    </div>

                    {/* Loading skeleton */}
                    <div className="flex gap-8 overflow-hidden">
                        {Array.from({ length: 4 }).map((_, index) => (
                            <div
                                key={index}
                                className="flex-none animate-pulse"
                                style={{ width: itemWidth }}
                            >
                                <div className="aspect-square bg-gray-200 dark:bg-gray-800 mb-4"></div>
                                <div className="h-4 bg-gray-200 dark:bg-gray-800 mb-2"></div>
                                <div className="h-3 bg-gray-200 dark:bg-gray-800 w-1/2"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    if (!products.length) return null;

    // Create extended product array for seamless infinite scroll
    const extendedProducts = [...products, ...products, ...products];

    return (
        <section
            ref={sectionRef}
            className="py-20 md:py-32 bg-white dark:bg-black text-black dark:text-white transition-colors duration-500"
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <motion.div
                    className="text-center mb-16"
                    initial={{ opacity: 0, y: 50 }}
                    animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
                    transition={{ duration: HOME_CONFIG.animations.transitions.duration }}
                >
                    <h2 className="text-3xl md:text-5xl font-sans tracking-wide mb-6">
                        {title}
                    </h2>
                    <div className="w-24 h-px bg-gold mx-auto mb-6" />
                    <p className="text-gray-600 dark:text-gray-400 text-lg tracking-wide max-w-2xl mx-auto">
                        {subtitle}
                    </p>
                </motion.div>

                {/* Products Container */}
                <motion.div
                    className="relative"
                    initial={{ opacity: 0 }}
                    animate={isInView ? { opacity: 1 } : { opacity: 0 }}
                    transition={{ duration: HOME_CONFIG.animations.transitions.duration, delay: 0.3 }}
                >
                    {/* Navigation Buttons - Always enabled for infinite cycling */}
                    <div className="hidden md:flex absolute top-1/2 -translate-y-1/2 left-0 right-0 justify-between pointer-events-none z-10">
                        <button
                            onClick={goLeft}
                            className="p-4 bg-white/90 dark:bg-black/90 backdrop-blur-sm border border-gray-300 dark:border-gray-600 transition-all duration-300 pointer-events-auto hover:bg-gold hover:text-black hover:border-gold"
                            aria-label="Previous products"
                        >
                            <ChevronLeft size={24} />
                        </button>

                        <button
                            onClick={goRight}
                            className="p-4 bg-white/90 dark:bg-black/90 backdrop-blur-sm border border-gray-300 dark:border-gray-600 transition-all duration-300 pointer-events-auto hover:bg-gold hover:text-black hover:border-gold"
                            aria-label="Next products"
                        >
                            <ChevronRight size={24} />
                        </button>
                    </div>

                    {/* Scrollable Products */}
                    <div
                        ref={scrollRef}
                        className="flex gap-8 overflow-x-auto scrollbar-hide pb-4"
                        style={{
                            scrollSnapType: 'x mandatory',
                            scrollbarWidth: 'none',
                            msOverflowStyle: 'none',
                        }}
                    >
                        {extendedProducts.map((product, index) => {
                            const actualIndex = index % products.length;
                            return (
                                <motion.div
                                    key={`${product.id}-${index}`}
                                    className="flex-none"
                                    style={{
                                        width: itemWidth,
                                        scrollSnapAlign: 'start'
                                    }}
                                    initial={{ opacity: 0, x: 50 }}
                                    animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
                                    transition={{
                                        duration: HOME_CONFIG.featuredProducts.animation.duration,
                                        delay: 0.5 + (actualIndex * HOME_CONFIG.featuredProducts.animation.staggerDelay),
                                        ease: "easeOut"
                                    }}
                                >
                                    <ProductCard
                                        product={product}
                                        showPrice={showPrices}
                                        index={actualIndex}
                                        disableRotation={true}
                                    />
                                </motion.div>
                            );
                        })}
                    </div>

                    {/* Mobile Scroll Indicators */}
                    <div className="flex justify-center mt-8 space-x-2 md:hidden">
                        {products.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => goToSlide(index)}
                                className={`w-2 h-2 rounded-full transition-all duration-300 ${currentIndex === index
                                    ? 'bg-gold scale-125'
                                    : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
                                    }`}
                                aria-label={`Go to product ${index + 1}`}
                            />
                        ))}
                    </div>
                </motion.div>

                {/* View All CTA */}
                <motion.div
                    className="text-center mt-16"
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                    transition={{ duration: HOME_CONFIG.animations.transitions.duration, delay: 1 }}
                >
                    <a
                        href={viewAllLink}
                        className="inline-block px-8 py-4 border border-current hover:text-white hover:bg-black dark:hover:text-black dark:hover:bg-white transition-all duration-300 tracking-widest uppercase text-sm group"
                    >
                        <span className="inline-block transform group-hover:translate-x-1 transition-transform duration-300">
                            View All Products
                        </span>
                        <span className="inline-block ml-2 transform group-hover:translate-x-1 transition-transform duration-300">
                            →
                        </span>
                    </a>
                </motion.div>
            </div>

            <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
        </section>
    );
}