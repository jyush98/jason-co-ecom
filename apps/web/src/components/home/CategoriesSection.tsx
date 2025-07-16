"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface Category {
    name: string;
    image: string;
    path: string;
}

interface CategoriesSectionProps {
    categories?: Category[];
    title?: string;
    autoplay?: boolean;
    autoplayInterval?: number;
}

const defaultCategories: Category[] = [
    {
        name: "Necklaces",
        image: "/images/collection1.png",
        path: "/shop?category=necklaces"
    },
    {
        name: "Bracelets",
        image: "/images/collection3.png",
        path: "/shop?category=bracelets"
    },
    {
        name: "Rings",
        image: "/images/collection3.png",
        path: "/shop?category=rings"
    },
    {
        name: "Earrings",
        image: "/images/collection1.png",
        path: "/shop?category=earrings"
    },
    {
        name: "Watches",
        image: "/images/collection1.png",
        path: "/shop?category=watches"
    },
    {
        name: "Grillz",
        image: "/images/collection3.png",
        path: "/shop?category=grillz"
    },
];

export default function CategoriesSection({
    categories = defaultCategories,
    title = "EXPLORE BY CATEGORY",
    autoplay = true,
    autoplayInterval = 5000
}: CategoriesSectionProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAutoplayActive, setIsAutoplayActive] = useState(autoplay);
    const sectionRef = useRef<HTMLDivElement>(null);
    const isInView = useInView(sectionRef, { once: true, amount: 0.3 });

    // Responsive settings
    const [slidesToShow, setSlidesToShow] = useState(4);
    const [slideWidth, setSlideWidth] = useState(300);

    useEffect(() => {
        const updateLayout = () => {
            if (window.innerWidth >= 1024) {
                setSlidesToShow(4);
                setSlideWidth(300);
            } else if (window.innerWidth >= 768) {
                setSlidesToShow(3);
                setSlideWidth(250);
            } else if (window.innerWidth >= 480) {
                setSlidesToShow(2);
                setSlideWidth(200);
            } else {
                setSlidesToShow(1);
                setSlideWidth(280);
            }
        };

        updateLayout();
        window.addEventListener('resize', updateLayout);
        return () => window.removeEventListener('resize', updateLayout);
    }, []);

    // Infinite cycling autoplay
    useEffect(() => {
        if (!isAutoplayActive || !isInView) return;

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % categories.length);
        }, autoplayInterval);

        return () => clearInterval(interval);
    }, [isAutoplayActive, isInView, categories.length, autoplayInterval]);

    // Infinite cycling navigation
    const goLeft = () => {
        setCurrentIndex((prev) => (prev - 1 + categories.length) % categories.length);
        setIsAutoplayActive(false);
    };

    const goRight = () => {
        setCurrentIndex((prev) => (prev + 1) % categories.length);
        setIsAutoplayActive(false);
    };

    const goToSlide = (index: number) => {
        setCurrentIndex(index);
        setIsAutoplayActive(false);
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.3,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 40, scale: 0.9 },
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

    return (
        <section
            ref={sectionRef}
            className="py-20 md:py-32 bg-black text-white transition-colors duration-500"
            onMouseEnter={() => setIsAutoplayActive(false)}
            onMouseLeave={() => setIsAutoplayActive(autoplay)}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <motion.div
                    className="text-center mb-16"
                    initial={{ opacity: 0, y: 50 }}
                    animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
                    transition={{ duration: 0.8 }}
                >
                    <h2 className="text-3xl md:text-5xl font-sans tracking-wide text-white">
                        {title}
                    </h2>
                </motion.div>

                {/* Categories Carousel */}
                <div className="relative">
                    {/* Navigation Buttons - Always enabled for infinite cycling */}
                    <div className="hidden md:flex absolute top-1/2 -translate-y-1/2 left-0 right-0 justify-between pointer-events-none z-10">
                        <button
                            onClick={goLeft}
                            className="p-3 bg-white/90 dark:bg-black/90 backdrop-blur-sm border border-gray-300 dark:border-gray-600 transition-all duration-300 pointer-events-auto hover:bg-gold hover:text-black hover:border-gold"
                            aria-label="Previous categories"
                        >
                            <ChevronLeft size={20} />
                        </button>

                        <button
                            onClick={goRight}
                            className="p-3 bg-white/90 dark:bg-black/90 backdrop-blur-sm border border-gray-300 dark:border-gray-600 transition-all duration-300 pointer-events-auto hover:bg-gold hover:text-black hover:border-gold"
                            aria-label="Next categories"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>

                    {/* Categories Grid */}
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate={isInView ? "visible" : "hidden"}
                        className="overflow-hidden max-w-6xl mx-auto"
                    >
                        <motion.div
                            className="flex transition-transform duration-500 ease-out"
                            style={{
                                transform: `translateX(-${currentIndex * (slideWidth + 32)}px)`,
                            }}
                        >
                            {/* Render categories in a loop - show all categories but shift position */}
                            {[...categories, ...categories].map((category, index) => {
                                const actualIndex = index % categories.length;
                                return (
                                    <motion.div
                                        key={`${category.name}-${index}`}
                                        variants={itemVariants}
                                        className="flex-none mr-8"
                                        style={{ width: slideWidth }}
                                    >
                                        <Link href={category.path} className="group block">
                                            <div className="relative overflow-hidden bg-black">
                                                {/* Image */}
                                                <div className="relative aspect-[4/5] overflow-hidden">
                                                    <Image
                                                        src={category.image}
                                                        alt={category.name}
                                                        fill
                                                        className="object-cover transform group-hover:scale-110 transition-transform duration-700"
                                                    />

                                                    {/* Gradient Overlay */}
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                                                    {/* Hover Overlay */}
                                                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                                </div>

                                                {/* Content */}
                                                <div className="absolute bottom-0 left-0 right-0 p-4">
                                                    <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                                                        <h3 className="text-lg font-sans font-medium text-white group-hover:text-gold transition-colors duration-300">
                                                            {category.name}
                                                        </h3>
                                                    </div>
                                                </div>

                                                {/* Accent Border */}
                                                <div className="absolute top-3 right-3 w-8 h-px bg-gold transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-right" />
                                            </div>
                                        </Link>
                                    </motion.div>
                                );
                            })}
                        </motion.div>
                    </motion.div>

                    {/* Dot Indicators */}
                    <div className="flex justify-center mt-8 space-x-2">
                        {categories.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => goToSlide(index)}
                                className={`w-2 h-2 rounded-full transition-all duration-300 ${currentIndex === index
                                        ? 'bg-gold scale-125'
                                        : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
                                    }`}
                                aria-label={`Go to category ${index + 1}`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}