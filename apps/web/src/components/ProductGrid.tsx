"use client";

import { useState } from "react";
import { Product } from "../types/product";
import AddToCartToast from "./AddtoCartToast";
import AddToCartButton from "./AddToCartButton";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

interface ProductGridProps {
  products: Product[];
  showPrices?: boolean; // Easy toggle for price display
}

// Configuration for easy customization
const GRID_CONFIG = {
  showPrices: true, // Master toggle - easy to switch
  animationDelay: 0.1, // Stagger delay between items
  hoverScale: 1.02,
  hoverRotation: 1, // degrees
  shadowIntensity: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
};

export default function ProductGrid({ products, showPrices = GRID_CONFIG.showPrices }: ProductGridProps) {
  const [addedProduct] = useState<{ name: string; image_url: string } | null>(null);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [quickViewId, setQuickViewId] = useState<number | null>(null);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: GRID_CONFIG.animationDelay,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 30,
      scale: 0.95
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <>
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12 lg:gap-16"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {products.map((product, index) => {
          const primary = product.image_urls?.[0] || product.image_url;
          const hover = product.image_urls?.[1] || product.image_url;
          const isActive = activeId === product.id;
          const isQuickView = quickViewId === product.id;
          const isDark = product.display_theme === "dark";

          return (
            <motion.div
              key={product.id}
              variants={itemVariants}
              className="group relative"
              onMouseEnter={() => setActiveId(product.id)}
              onMouseLeave={() => {
                setActiveId(null);
                setQuickViewId(null);
              }}
            >
              <Link
                href={`/product/${product.id}`}
                className="block"
                aria-label={`View details for ${product.name}`}
              >
                {/* Main Product Card */}
                <motion.div
                  className={`relative overflow-hidden transition-all duration-500 ease-out ${isDark
                      ? "bg-gradient-to-br from-gray-900 to-black text-white"
                      : "bg-gradient-to-br from-white to-gray-50 text-black"
                    }`}
                  style={{
                    boxShadow: isActive ? GRID_CONFIG.shadowIntensity : "0 4px 20px -4px rgba(0, 0, 0, 0.1)",
                  }}
                  whileHover={{
                    scale: GRID_CONFIG.hoverScale,
                    rotate: isActive ? GRID_CONFIG.hoverRotation : 0,
                    transition: { duration: 0.4, ease: "easeOut" }
                  }}
                >
                  {/* Image Container */}
                  <div className="relative aspect-square overflow-hidden">
                    {/* Primary Image */}
                    <motion.img
                      src={primary}
                      alt={`${product.name} main image`}
                      className="absolute inset-0 w-full h-full object-contain p-6 md:p-8"
                      style={{
                        opacity: isActive ? 0 : 1,
                        transition: "opacity 0.6s cubic-bezier(0.4, 0.0, 0.2, 1)",
                      }}
                    />

                    {/* Hover Image */}
                    <motion.img
                      src={hover}
                      alt={`${product.name} alternate view`}
                      className="absolute inset-0 w-full h-full object-contain p-6 md:p-8"
                      style={{
                        opacity: isActive ? 1 : 0,
                        transition: "opacity 0.6s cubic-bezier(0.4, 0.0, 0.2, 1)",
                      }}
                      aria-hidden="true"
                    />

                    {/* Elegant overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    {/* Category Badge */}
                    <motion.div
                      className="absolute top-4 right-4 opacity-0 group-hover:opacity-100"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{
                        opacity: isActive ? 1 : 0,
                        scale: isActive ? 1 : 0.8,
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      <span className="px-3 py-1 text-xs tracking-widest uppercase bg-white/90 dark:bg-black/90 text-black dark:text-white backdrop-blur-sm border border-black/10 dark:border-white/20">
                        {product.category || "Jewelry"}
                      </span>
                    </motion.div>
                  </div>

                  {/* Product Info */}
                  <div className="p-6 md:p-8 space-y-4 relative">
                    {/* Product Name */}
                    <div className="space-y-2">
                      <h3 className="font-serif text-lg md:text-xl tracking-wide leading-tight group-hover:text-gold transition-colors duration-300">
                        {product.name}
                      </h3>
                      <p className="text-xs tracking-[0.2em] uppercase text-gray-500 dark:text-gray-400 font-light">
                        La Collection
                      </p>
                    </div>

                    {/* Price (with toggle) */}
                    {showPrices && (
                      <motion.div
                        className="flex items-center justify-between"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                      >
                        <span className="text-lg font-light tracking-wide">
                          {formatPrice(product.price)}
                        </span>
                        <motion.div
                          className="w-8 h-8 rounded-full border border-current flex items-center justify-center group-hover:bg-gold group-hover:text-black group-hover:border-gold transition-all duration-300"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <span className="text-sm">→</span>
                        </motion.div>
                      </motion.div>
                    )}

                    {/* Quick View Trigger - positioned below price */}
                    <motion.div
                      className="pt-4 opacity-0 group-hover:opacity-100"
                      initial={{ y: 10, opacity: 0 }}
                      animate={{
                        y: isActive ? 0 : 10,
                        opacity: isActive ? 1 : 0,
                      }}
                      transition={{ duration: 0.3, delay: 0.1 }}
                    >
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          setQuickViewId(product.id);
                        }}
                        className="w-full py-2 text-sm tracking-widest uppercase border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gold hover:text-gold transition-all duration-300"
                      >
                        Quick View
                      </button>
                    </motion.div>
                  </div>
                </motion.div>
              </Link>

              {/* Quick View Overlay */}
              <AnimatePresence>
                {isQuickView && (
                  <motion.div
                    className="absolute inset-0 bg-white/95 dark:bg-black/95 backdrop-blur-sm z-10 flex items-center justify-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="text-center space-y-4 p-6">
                      <h4 className="text-xl font-serif">{product.name}</h4>
                      {showPrices && (
                        <p className="text-lg">{formatPrice(product.price)}</p>
                      )}
                      <div className="space-y-3">
                        <AddToCartButton
                          productId={product.id}
                          productName={product.name}
                          productPrice={product.price}
                          productImageUrl={product.image_url}
                          fullWidth
                        />
                        <Link
                          href={`/product/${product.id}`}
                          className="block w-full py-2 text-sm tracking-widest uppercase border border-current hover:text-white hover:bg-black transition-all duration-300 text-center"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </motion.div>

      <AddToCartToast product={addedProduct} />

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400;1,500&display=swap');
      `}</style>
    </>
  );
}