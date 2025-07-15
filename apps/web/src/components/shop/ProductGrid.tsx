"use client";

import { motion } from "framer-motion";
import { Product } from "@/types/product";
import ProductCard from "./ProductCard";
import { SHOP_CONFIG } from "@/config/shopConfig";

interface ProductGridProps {
  products: Product[];
  showPrices?: boolean;
  loading?: boolean;
}

export default function ProductGrid({
  products,
  showPrices = SHOP_CONFIG.showPrices,
  loading = false
}: ProductGridProps) {

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: SHOP_CONFIG.animation.staggerDelay,
        delayChildren: 0.2,
      },
    },
  };

  if (loading) {
    return null; // LoadingSkeleton will be handled by parent
  }

  return (
    <motion.div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12 lg:gap-16"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {products.map((product, index) => (
        <ProductCard
          key={product.id}
          product={product}
          showPrice={showPrices}
          index={index}
        />
      ))}
    </motion.div>
  );
}