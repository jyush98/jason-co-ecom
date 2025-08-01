"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Link from "next/link";
import { JewelryImage } from "@/components/ui/OptimizedImage";
import { defaultCollections } from "@/data/homepage";

interface Collection {
    name: string;
    image: string;
    path: string;
    featured?: boolean;
}

interface CollectionsShowcaseProps {
    collections?: Collection[];
    title?: string;
}

export default function CollectionsShowcase({
    collections = defaultCollections,
    title = "COLLECTIONS"
}: CollectionsShowcaseProps) {
    const sectionRef = useRef<HTMLDivElement>(null);
    const isInView = useInView(sectionRef, { once: true, amount: 0.2 });

    const featuredCollection = collections.find(c => c.featured) || collections[0];
    const otherCollections = collections.filter(c => c !== featuredCollection);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2,
                delayChildren: 0.3,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 60, scale: 0.95 },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
                duration: 0.8,
                ease: "easeOut",
            },
        },
    };

    const CollectionCard = ({
        collection,
        isFeatured = false,
        className = "",
        priority = false
    }: {
        collection: Collection;
        isFeatured?: boolean;
        className?: string;
        priority?: boolean;
    }) => (
        <motion.div
            variants={itemVariants}
            className={`group relative overflow-hidden bg-black ${className}`}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
        >
            <Link href={collection.path} className="block relative h-full">
                {/* Optimized Image - Now using JewelryImage.Gallery */}
                <div className="relative overflow-hidden h-full">
                    <JewelryImage.Gallery
                        src={collection.image}
                        alt={collection.name}
                        priority={priority}
                        className="object-cover transform group-hover:scale-105 transition-transform duration-700 h-full w-full"
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 z-10">
                    <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                        {/* Category Badge */}
                        <motion.div
                            className="inline-block px-3 py-1 mb-4 bg-white/20 backdrop-blur-sm border border-white/30 text-white text-xs tracking-widest uppercase"
                            whileHover={{ scale: 1.05 }}
                        >
                            {isFeatured ? "Featured" : "Collection"}
                        </motion.div>

                        {/* Collection Name */}
                        <h3 className="text-xl md:text-2xl font-sans font-medium mb-2 text-white group-hover:text-gold transition-colors duration-300">
                            {collection.name}
                        </h3>

                        {/* CTA Button - Fixed positioning and visibility */}
                        <div className="opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 delay-100">
                            <span className="inline-flex items-center gap-2 px-4 py-2 border border-white text-white text-sm tracking-widest uppercase hover:bg-white hover:text-black transition-all duration-300 bg-black/50 backdrop-blur-sm">
                                <span>Shop {collection.name}</span>
                                <span className="transform group-hover:translate-x-1 transition-transform duration-300">→</span>
                            </span>
                        </div>
                    </div>
                </div>

                {/* Accent Border */}
                <div className="absolute top-4 right-4 w-12 h-px bg-gold transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-right" />
            </Link>
        </motion.div>
    );

    return (
        <section
            ref={sectionRef}
            className="py-20 md:py-32 bg-gray-50 dark:bg-gray-900 text-black dark:text-white transition-colors duration-500"
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <motion.div
                    className="text-center mb-16 md:mb-20"
                    initial={{ opacity: 0, y: 50 }}
                    animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
                    transition={{ duration: 0.8 }}
                >
                    <h2 className="text-3xl md:text-5xl font-sans tracking-wide">
                        {title}
                    </h2>
                </motion.div>

                {/* Collections Grid - Fixed Heights */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate={isInView ? "visible" : "hidden"}
                    className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8"
                >
                    {/* Featured Collection - Left Side - Fixed Height */}
                    <CollectionCard
                        collection={featuredCollection}
                        isFeatured={true}
                        priority={true}
                        className="lg:col-span-7 h-96 md:h-[500px] lg:h-[500px]"
                    />

                    {/* Other Collections - Right Side - Fixed Heights to Match Left */}
                    <div className="lg:col-span-5 space-y-6">
                        {otherCollections.slice(0, 2).map((collection, index) => (
                            <CollectionCard
                                key={collection.name}
                                collection={collection}
                                priority={index === 0}
                                className="h-48 lg:h-[235px]"
                            />
                        ))}
                    </div>
                </motion.div>

                {/* Bottom CTA */}
                <motion.div
                    className="text-center mt-16 md:mt-20"
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                    transition={{ duration: 0.8, delay: 1.2 }}
                >
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <a
                            href="/shop"
                            className="px-8 py-4 bg-gold text-black hover:bg-gold/90 transition-all duration-300 tracking-widest uppercase text-sm group"
                        >
                            <span className="inline-block transform group-hover:translate-x-1 transition-transform duration-300">
                                Explore All Collections
                            </span>
                        </a>

                        <a
                            href="/custom"
                            className="px-8 py-4 border border-current hover:text-white hover:bg-black dark:hover:text-black dark:hover:bg-white transition-all duration-300 tracking-widest uppercase text-sm group"
                        >
                            <span className="inline-block transform group-hover:translate-x-1 transition-transform duration-300">
                                Custom Orders
                            </span>
                        </a>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}