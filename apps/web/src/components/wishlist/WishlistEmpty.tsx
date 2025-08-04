// components/wishlist/WishlistEmpty.tsx - Beautiful Empty State Component
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
    Heart,
    ShoppingBag,
    Star,
    Sparkles,
    ArrowRight,
    Plus,
    Search,
    Crown
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface WishlistEmptyProps {
    className?: string;
}

export default function WishlistEmpty({ className = "" }: WishlistEmptyProps) {
    const [hoveredCard, setHoveredCard] = useState<number | null>(null);

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
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6, ease: "easeOut" },
        },
    };

    const heartVariants = {
        hidden: { scale: 0, rotate: -180 },
        visible: {
            scale: 1,
            rotate: 0,
            transition: {
                type: "spring",
                stiffness: 200,
                damping: 15,
                delay: 0.5,
            },
        },
    };

    const sparkleVariants = {
        hidden: { opacity: 0, scale: 0 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: {
                delay: 1,
                duration: 0.5,
            },
        },
        animate: {
            y: [0, -10, 0],
            transition: {
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
            },
        },
    };

    // Sample featured products for suggestions
    const suggestedCategories = [
        {
            name: "Necklaces",
            description: "Statement pieces that define elegance",
            icon: "💎",
            link: "/shop?category=Necklaces",
            image: "/api/placeholder/200/200"
        },
        {
            name: "Rings",
            description: "Symbols of commitment and style",
            icon: "💍",
            link: "/shop?category=Rings",
            image: "/api/placeholder/200/200"
        },
        {
            name: "Bracelets",
            description: "Crafted for the ambitious",
            icon: "⌚",
            link: "/shop?category=Bracelets",
            image: "/api/placeholder/200/200"
        }
    ];

    return (
        <div className={`min-h-screen bg-white dark:bg-black pt-[var(--navbar-height)] ${className}`}>
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <motion.div
                    className="text-center"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    {/* Hero Section */}
                    <div className="relative mb-16">
                        {/* Floating Sparkles */}
                        <motion.div
                            className="absolute top-0 left-1/4 text-gold"
                            variants={sparkleVariants}
                            initial="hidden"
                            animate={["visible", "animate"]}
                        >
                            <Sparkles size={24} />
                        </motion.div>
                        <motion.div
                            className="absolute top-12 right-1/3 text-gold"
                            variants={sparkleVariants}
                            initial="hidden"
                            animate={["visible", "animate"]}
                            style={{ animationDelay: "0.5s" }}
                        >
                            <Star size={20} />
                        </motion.div>
                        <motion.div
                            className="absolute top-8 right-1/4 text-gold"
                            variants={sparkleVariants}
                            initial="hidden"
                            animate={["visible", "animate"]}
                            style={{ animationDelay: "1s" }}
                        >
                            <Sparkles size={16} />
                        </motion.div>

                        {/* Main Heart Icon */}
                        <motion.div
                            className="mx-auto mb-8 relative"
                            variants={heartVariants}
                        >
                            <div className="w-32 h-32 mx-auto bg-gradient-to-br from-gold/20 to-gold/5 rounded-full flex items-center justify-center">
                                <Heart size={64} className="text-gold" />
                            </div>

                            {/* Pulsing Ring */}
                            <motion.div
                                className="absolute inset-0 border-2 border-gold/30 rounded-full"
                                animate={{
                                    scale: [1, 1.2, 1],
                                    opacity: [0.3, 0.1, 0.3],
                                }}
                                transition={{
                                    duration: 3,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                }}
                            />
                        </motion.div>

                        {/* Main Message */}
                        <motion.div variants={itemVariants} className="space-y-4 mb-12">
                            <h1 className="text-4xl md:text-5xl font-serif text-black dark:text-white">
                                Your Collection Awaits
                            </h1>
                            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
                                Build your personal gallery of exceptional pieces. Save the jewelry that speaks to your ambition and artistry.
                            </p>
                        </motion.div>

                        {/* Primary CTA */}
                        <motion.div variants={itemVariants} className="mb-16">
                            <Link
                                href="/shop"
                                className="group inline-flex items-center gap-3 bg-gold hover:bg-gold/90 text-black px-8 py-4 rounded-lg font-medium text-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
                            >
                                <Search size={20} />
                                <span>Discover Our Collection</span>
                                <ArrowRight
                                    size={20}
                                    className="transform group-hover:translate-x-1 transition-transform"
                                />
                            </Link>
                        </motion.div>
                    </div>

                    {/* How It Works Section */}
                    <motion.div variants={itemVariants} className="mb-16">
                        <h2 className="text-2xl md:text-3xl font-serif mb-12 text-black dark:text-white">
                            How Your Wishlist Works
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                            {[
                                {
                                    icon: <Heart size={32} className="text-gold" />,
                                    title: "Save & Organize",
                                    description: "Heart your favorite pieces and organize them into custom collections"
                                },
                                {
                                    icon: <Star size={32} className="text-gold" />,
                                    title: "Set Priorities",
                                    description: "Mark items as high, medium, or low priority to focus on what matters most"
                                },
                                {
                                    icon: <ShoppingBag size={32} className="text-gold" />,
                                    title: "Shop When Ready",
                                    description: "Add multiple items to cart at once or purchase individual pieces"
                                }
                            ].map((step, index) => (
                                <motion.div
                                    key={index}
                                    className="text-center p-6 rounded-lg border border-gray-200 dark:border-gray-800 hover:border-gold/50 transition-colors"
                                    variants={itemVariants}
                                    whileHover={{ y: -5 }}
                                >
                                    <div className="w-16 h-16 mx-auto mb-4 bg-gold/10 rounded-full flex items-center justify-center">
                                        {step.icon}
                                    </div>
                                    <h3 className="text-lg font-medium mb-2 text-black dark:text-white">
                                        {step.title}
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                                        {step.description}
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Featured Categories */}
                    <motion.div variants={itemVariants} className="mb-16">
                        <h2 className="text-2xl md:text-3xl font-serif mb-8 text-black dark:text-white">
                            Start With These Categories
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-12 max-w-2xl mx-auto">
                            Explore our most popular collections and find pieces that embody your unique style and ambition.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                            {suggestedCategories.map((category, index) => (
                                <motion.div
                                    key={index}
                                    variants={itemVariants}
                                    onHoverStart={() => setHoveredCard(index)}
                                    onHoverEnd={() => setHoveredCard(null)}
                                >
                                    <Link
                                        href={category.link}
                                        className="group block bg-gray-50 dark:bg-gray-900 rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300"
                                    >
                                        <div className="relative aspect-square bg-gradient-to-br from-gold/10 to-gold/5 flex items-center justify-center text-6xl">
                                            {category.icon}

                                            {/* Hover Overlay */}
                                            <motion.div
                                                className="absolute inset-0 bg-black/20 flex items-center justify-center"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: hoveredCard === index ? 1 : 0 }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                <div className="bg-white/90 dark:bg-black/90 rounded-full p-3">
                                                    <ArrowRight size={24} className="text-gray-700 dark:text-gray-300" />
                                                </div>
                                            </motion.div>
                                        </div>

                                        <div className="p-6 text-center">
                                            <h3 className="text-lg font-medium mb-2 text-black dark:text-white group-hover:text-gold transition-colors">
                                                {category.name}
                                            </h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                {category.description}
                                            </p>
                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Bottom CTA Section */}
                    <motion.div
                        variants={itemVariants}
                        className="bg-gradient-to-r from-gold/10 via-gold/5 to-gold/10 rounded-2xl p-8 md:p-12"
                    >
                        <div className="flex items-center justify-center gap-3 mb-6">
                            <Crown size={24} className="text-gold" />
                            <h2 className="text-2xl font-serif text-black dark:text-white">
                                Where Ambition Meets Artistry
                            </h2>
                            <Crown size={24} className="text-gold" />
                        </div>

                        <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
                            Join the ranks of achievers who understand that exceptional jewelry is more than decoration—it's a statement of purpose.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                href="/gallery"
                                className="group inline-flex items-center gap-2 border border-gold text-gold hover:bg-gold hover:text-black px-6 py-3 rounded-lg font-medium transition-all duration-300 hover:scale-105"
                            >
                                <Sparkles size={16} />
                                <span>Explore Gallery</span>
                                <ArrowRight
                                    size={16}
                                    className="transform group-hover:translate-x-1 transition-transform"
                                />
                            </Link>

                            <Link
                                href="/custom-orders"
                                className="group inline-flex items-center gap-2 border border-gray-300 dark:border-gray-600 hover:border-gold hover:text-gold px-6 py-3 rounded-lg font-medium transition-all duration-300 hover:scale-105"
                            >
                                <Plus size={16} />
                                <span>Custom Orders</span>
                                <ArrowRight
                                    size={16}
                                    className="transform group-hover:translate-x-1 transition-transform"
                                />
                            </Link>
                        </div>
                    </motion.div>

                    {/* Inspirational Quote */}
                    <motion.div variants={itemVariants} className="mt-16 text-center">
                        <blockquote className="text-lg md:text-xl italic text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                            "Every piece of jewelry tells a story. Your wishlist is the beginning of yours."
                        </blockquote>
                        <p className="text-sm text-gold mt-4 tracking-widest uppercase">
                            — Jason & Co.
                        </p>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
}