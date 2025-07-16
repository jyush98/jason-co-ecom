"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Product } from "@/types/product";
import { ProductCard } from "@/components/shop";

interface FeaturedProductsProps {
    products: Product[];
    title?: string;
    subtitle?: string;
    showPrices?: boolean;
}

export default function FeaturedProducts({
    products,
    title = "SIGNATURE PIECES",
    subtitle = "Crafted for those who demand excellence",
    showPrices = true
}: FeaturedProductsProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const scrollRef = useRef<HTMLDivElement>(null);
    const sectionRef = useRef<HTMLDivElement>(null);
    const isInView = useInView(sectionRef, { once: true, amount: 0.3 });

    const itemWidth = 400; // Fixed width for consistent spacing
    const gap = 32; // Gap between items

    // Infinite cycling navigation
    const scrollTo = (direction: 'left' | 'right') => {
        if (!scrollRef.current) return;

        if (direction === 'left') {
            // Cycle to end if at beginning
            setCurrentIndex((prev) => (prev - 1 + products.length) % products.length);
        } else {
            // Cycle to beginning if at end
            setCurrentIndex((prev) => (prev + 1) % products.length);
        }
    };

    const scrollToIndex = (index: number) => {
        setCurrentIndex(index);
    };

    // Update scroll position when currentIndex changes
    useEffect(() => {
        if (!scrollRef.current) return;

        const scrollAmount = currentIndex * (itemWidth + gap);
        scrollRef.current.scrollTo({
            left: scrollAmount,
            behavior: 'smooth'
        });
    }, [currentIndex, itemWidth, gap]);

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
                    transition={{ duration: 0.8 }}
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
                    transition={{ duration: 0.8, delay: 0.3 }}
                >
                    {/* Navigation Buttons - Always enabled for infinite cycling */}
                    <div className="hidden md:flex absolute top-1/2 -translate-y-1/2 left-0 right-0 justify-between pointer-events-none z-10">
                        <button
                            onClick={() => scrollTo('left')}
                            className="p-4 bg-white/90 dark:bg-black/90 backdrop-blur-sm border border-gray-300 dark:border-gray-600 transition-all duration-300 pointer-events-auto hover:bg-gold hover:text-black hover:border-gold"
                            aria-label="Previous products"
                        >
                            <ChevronLeft size={24} />
                        </button>

                        <button
                            onClick={() => scrollTo('right')}
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
                                        duration: 0.6,
                                        delay: 0.5 + (actualIndex * 0.1),
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
                                onClick={() => scrollToIndex(index)}
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
                    transition={{ duration: 0.8, delay: 1 }}
                >
                    <a
                        href="/shop"
                        className="inline-block px-8 py-4 border border-current hover:bg-current hover:text-white dark:hover:text-black transition-all duration-300 tracking-widest uppercase text-sm group"
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