// components/product/RelatedProducts.tsx
"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Product } from "@/types/product";
import { ProductCard } from "@/components/shop";
import { useInfiniteCarousel } from "@/lib/hooks";
import { PRODUCT_CONFIG } from "@/config/productConfig";
import { createStaggerContainer, createEntranceAnimation } from "@/lib/animations";

interface RelatedProductsProps {
  products: Product[];
  isLoading?: boolean;
  currentProductCategory?: string;
  isDark?: boolean;
}

export default function RelatedProducts({
  products,
  isLoading = false,
  currentProductCategory,
  // isDark = false
}: RelatedProductsProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.3 });

  const { currentIndex, goLeft, goRight, goToSlide } = useInfiniteCarousel({
    itemCount: products.length,
    autoplay: false,
  });

  const itemWidth = PRODUCT_CONFIG.relatedProducts.itemWidth;
  const gap = PRODUCT_CONFIG.relatedProducts.gap;

  const containerVariants = createStaggerContainer(0.1, 0.2);
  const itemVariants = createEntranceAnimation(30, 1, 0.6);

  if (isLoading) {
    return (
      <section className="space-y-8">
        <div className="text-center">
          <h2 className="text-2xl md:text-3xl font-serif tracking-wide mb-4">
            You Might Also Like
          </h2>
          <div className="w-16 h-px bg-gold mx-auto" />
        </div>

        <div className="flex gap-6 overflow-hidden">
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
      </section>
    );
  }

  if (!products.length) return null;

  // Create extended product array for seamless infinite scroll
  const extendedProducts = [...products, ...products];

  return (
    <section ref={sectionRef} className="space-y-12">
      {/* Section Header */}
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-2xl md:text-3xl font-serif tracking-wide mb-4">
          {currentProductCategory ? `More from ${currentProductCategory}` : "You Might Also Like"}
        </h2>
        <div className="w-16 h-px bg-gold mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Discover more pieces that share the same ambition and artistry
        </p>
      </motion.div>

      {/* Products Carousel */}
      <motion.div
        className="relative"
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
      >
        {/* Navigation Buttons */}
        <div className="hidden md:flex absolute top-1/2 -translate-y-1/2 left-0 right-0 justify-between pointer-events-none z-10">
          <button
            onClick={goLeft}
            className="p-4 bg-white/90 dark:bg-black/90 backdrop-blur-sm border border-gray-300 dark:border-gray-600 transition-all duration-300 pointer-events-auto hover:bg-gold hover:text-black hover:border-gold group"
            aria-label="Previous products"
          >
            <ChevronLeft size={24} className="transform group-hover:-translate-x-0.5 transition-transform duration-300" />
          </button>

          <button
            onClick={goRight}
            className="p-4 bg-white/90 dark:bg-black/90 backdrop-blur-sm border border-gray-300 dark:border-gray-600 transition-all duration-300 pointer-events-auto hover:bg-gold hover:text-black hover:border-gold group"
            aria-label="Next products"
          >
            <ChevronRight size={24} className="transform group-hover:translate-x-0.5 transition-transform duration-300" />
          </button>
        </div>

        {/* Products Container */}
        <div className="overflow-hidden">
          <motion.div
            className="flex gap-6 transition-transform duration-500 ease-out"
            style={{
              transform: `translateX(-${currentIndex * (itemWidth + gap)}px)`,
            }}
          >
            {extendedProducts.map((product, index) => {
              const actualIndex = index % products.length;
              return (
                <motion.div
                  key={`${product.id}-${index}`}
                  className="flex-none"
                  style={{ width: itemWidth }}
                  variants={itemVariants}
                >
                  <ProductCard
                    product={product}
                    showPrice={PRODUCT_CONFIG.relatedProducts.showPrices}
                    index={actualIndex}
                    disableRotation={false}
                  />
                </motion.div>
              );
            })}
          </motion.div>
        </div>

        {/* Mobile Indicators */}
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
        className="text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.6, delay: 0.8 }}
      >
        <a
          href={currentProductCategory ? `/shop?category=${currentProductCategory}` : "/shop"}
          className="inline-block px-8 py-4 border border-current hover:text-white hover:bg-black dark:hover:text-black dark:hover:bg-white transition-all duration-300 tracking-widest uppercase text-sm group"
        >
          <span className="inline-block transform group-hover:translate-x-1 transition-transform duration-300">
            {currentProductCategory ? `View All ${currentProductCategory}` : "View All Products"}
          </span>
          <span className="inline-block ml-2 transform group-hover:translate-x-1 transition-transform duration-300">
            →
          </span>
        </a>
      </motion.div>
    </section>
  );
}