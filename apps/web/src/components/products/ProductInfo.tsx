// components/product/ProductInfo.tsx
"use client";

import { motion } from "framer-motion";
import { Product } from "@/types/product";
import AddToCartButton from "@/components/cart/AddToCartButton";
import { PRODUCT_CONFIG } from "@/config/productConfig";
import { createStaggeredListItem } from "@/lib/animations";

interface ProductInfoProps {
    product: Product;
    isDark?: boolean;
}

export default function ProductInfo({ product }: ProductInfoProps) {
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(price / 100);
    };

    const infoVariants = createStaggeredListItem(
        PRODUCT_CONFIG.animations.infoSection.staggerDelay,
        PRODUCT_CONFIG.animations.infoSection.duration,
        20
    );

    return (
        <div className="space-y-8">
            {/* Product Name & Category */}
            <motion.div
                custom={0}
                variants={infoVariants}
                initial="hidden"
                animate="visible"
                className="space-y-3"
            >
                {/* Category Badge */}
                <div className="inline-block">
                    <span className="px-3 py-1 text-xs tracking-[0.2em] uppercase bg-gold/10 text-gold border border-gold/20 font-medium">
                        {product.category_name || "La Collection"}
                    </span>
                </div>

                {/* Product Name */}
                <h1 className="text-3xl md:text-5xl font-serif tracking-wider leading-tight">
                    {product.name}
                </h1>

                {/* Subtitle */}
                <p className="text-sm tracking-[0.15em] uppercase text-gray-600 dark:text-gray-400 font-light">
                    WHERE AMBITION MEETS ARTISTRY
                </p>
            </motion.div>

            {/* Price */}
            <motion.div
                custom={1}
                variants={infoVariants}
                initial="hidden"
                animate="visible"
                className="flex items-baseline gap-4"
            >
                <span className="text-2xl md:text-3xl font-light tracking-wide">
                    {formatPrice(product.price)}
                </span>
                {PRODUCT_CONFIG.showOriginalPrice && product.price && (
                    <span className="text-lg text-gray-500 dark:text-gray-400 line-through">
                        {/* TODO: Add originalPrice property to Product type if needed */}
                        {formatPrice(product.price * 1.2)} {/* Placeholder calculation */}
                    </span>
                )}
            </motion.div>

            {/* Description */}
            {product.description && (
                <motion.div
                    custom={2}
                    variants={infoVariants}
                    initial="hidden"
                    animate="visible"
                    className="space-y-4"
                >
                    <div className="w-12 h-px bg-gold" />
                    <p className="text-base md:text-lg leading-relaxed text-gray-700 dark:text-gray-300 max-w-lg">
                        {product.description}
                    </p>
                </motion.div>
            )}

            {/* Add to Cart */}
            <motion.div
                custom={3}
                variants={infoVariants}
                initial="hidden"
                animate="visible"
                className="pt-4"
            >
                <div className="space-y-4">
                    <AddToCartButton
                        productId={product.id}
                        productName={product.name}
                        productPrice={product.price}
                        productImageUrl={product.image_url}
                        fullWidth
                    />

                    {/* Purchase Note */}
                    <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                        Free shipping worldwide • 30-day returns • Lifetime warranty
                    </p>
                </div>
            </motion.div>

            {/* Product Details */}
            {(product.details || PRODUCT_CONFIG.showDefaultDetails) && (
                <motion.div
                    custom={4}
                    variants={infoVariants}
                    initial="hidden"
                    animate="visible"
                    className="space-y-6 pt-8 border-t border-gray-200 dark:border-gray-800"
                >
                    <h2 className="text-lg font-medium tracking-wide uppercase">
                        Specifications
                    </h2>

                    <div className="grid grid-cols-1 gap-y-4 text-sm">
                        {product.details ? (
                            Object.entries(product.details).map(([label, value]) => (
                                <div key={label} className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800">
                                    <span className="text-gray-600 dark:text-gray-400 tracking-wide">
                                        {label}
                                    </span>
                                    <span className="font-medium text-right max-w-[60%]">
                                        {String(value)}
                                    </span>
                                </div>
                            ))
                        ) : (
                            // Default details for luxury jewelry
                            <>
                                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800">
                                    <span className="text-gray-600 dark:text-gray-400 tracking-wide">Metal</span>
                                    <span className="font-medium">18k Rose Gold</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800">
                                    <span className="text-gray-600 dark:text-gray-400 tracking-wide">Diamond Quality</span>
                                    <span className="font-medium">VS+ Clarity</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800">
                                    <span className="text-gray-600 dark:text-gray-400 tracking-wide">Diamond Color</span>
                                    <span className="font-medium">D–F Range</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800">
                                    <span className="text-gray-600 dark:text-gray-400 tracking-wide">Craftsmanship</span>
                                    <span className="font-medium">Hand-finished</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800">
                                    <span className="text-gray-600 dark:text-gray-400 tracking-wide">Origin</span>
                                    <span className="font-medium">Made to Order</span>
                                </div>
                            </>
                        )}
                    </div>
                </motion.div>
            )}

            {/* Authenticity */}
            <motion.div
                custom={5}
                variants={infoVariants}
                initial="hidden"
                animate="visible"
                className="space-y-4 pt-6 border-t border-gray-200 dark:border-gray-800"
            >
                <h3 className="text-sm font-medium tracking-wide uppercase text-gold">
                    Authenticity & Quality
                </h3>
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <p>✓ Certificate of authenticity included</p>
                    <p>✓ GIA certified diamonds (where applicable)</p>
                    <p>✓ Hallmarked precious metals</p>
                    <p>✓ Designed without limits, crafted for eternity</p>
                </div>
            </motion.div>
        </div>
    );
}
