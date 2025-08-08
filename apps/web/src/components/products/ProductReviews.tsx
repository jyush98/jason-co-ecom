// components/product/ProductReviews.tsx
"use client";

import { useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Star, ChevronLeft, ChevronRight, User } from "lucide-react";

interface Review {
    id: string;
    author: string;
    rating: number;
    title: string;
    content: string;
    date: string;
    verified: boolean;
    images?: string[];
}

interface ProductReviewsProps {
    productId: number;
    productName: string;
    isDark?: boolean;
}

export default function ProductReviews({
    // productId,
    // productName,
    // isDark = false
}: ProductReviewsProps) {
    const [currentReviewIndex, setCurrentReviewIndex] = useState(0);
    const sectionRef = useRef<HTMLDivElement>(null);
    const isInView = useInView(sectionRef, { once: true, amount: 0.3 });

    // Mock reviews data (replace with real API call)
    const reviews: Review[] = [
        {
            id: "1",
            author: "Marcus T.",
            rating: 5,
            title: "Absolutely Stunning Craftsmanship",
            content: "This piece exceeded every expectation. The attention to detail is remarkable, and it truly embodies the 'where ambition meets artistry' philosophy. Worth every penny.",
            date: "2024-07-10",
            verified: true,
        },
        {
            id: "2",
            author: "Alexander K.",
            rating: 5,
            title: "Investment-Grade Quality",
            content: "As someone who collects luxury timepieces and jewelry, I can confidently say this rivals pieces from the most prestigious houses. The finishing is flawless.",
            date: "2024-07-05",
            verified: true,
        },
        {
            id: "3",
            author: "David M.",
            rating: 5,
            title: "Perfect for Special Occasions",
            content: "Bought this for a major business milestone. The impact it makes is undeniable - it's a conversation starter and perfectly represents success.",
            date: "2024-06-28",
            verified: true,
        }
    ];

    const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
    const totalReviews = reviews.length;

    const nextReview = () => {
        setCurrentReviewIndex((prev) => (prev + 1) % reviews.length);
    };

    const prevReview = () => {
        setCurrentReviewIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
    };

    const renderStars = (rating: number, size: "sm" | "md" | "lg" = "md") => {
        const sizeClasses = {
            sm: "w-3 h-3",
            md: "w-4 h-4",
            lg: "w-5 h-5"
        };

        return (
            <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, index) => (
                    <Star
                        key={index}
                        className={`${sizeClasses[size]} ${index < rating ? "fill-gold text-gold" : "text-gray-300 dark:text-gray-600"
                            }`}
                    />
                ))}
            </div>
        );
    };

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
            transition: {
                duration: 0.6,
                ease: "easeOut",
            },
        },
    };

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
                    What Our Clients Say
                </h2>
                <div className="w-16 h-px bg-gold mx-auto mb-6" />

                {/* Rating Summary */}
                <div className="flex items-center justify-center gap-4 mb-4">
                    {renderStars(averageRating, "lg")}
                    <span className="text-lg font-light">
                        {averageRating.toFixed(1)} out of 5
                    </span>
                    <span className="text-gray-500 dark:text-gray-400">
                        ({totalReviews} {totalReviews === 1 ? 'review' : 'reviews'})
                    </span>
                </div>
            </motion.div>

            {/* Reviews Carousel */}
            <motion.div
                className="relative max-w-4xl mx-auto"
                variants={containerVariants}
                initial="hidden"
                animate={isInView ? "visible" : "hidden"}
            >
                {/* Navigation Buttons */}
                {reviews.length > 1 && (
                    <div className="hidden md:flex absolute top-1/2 -translate-y-1/2 left-0 right-0 justify-between pointer-events-none z-10">
                        <button
                            onClick={prevReview}
                            className="p-3 bg-white/90 dark:bg-black/90 backdrop-blur-sm border border-gray-300 dark:border-gray-600 transition-all duration-300 pointer-events-auto hover:bg-gold hover:text-black hover:border-gold"
                            aria-label="Previous review"
                        >
                            <ChevronLeft size={20} />
                        </button>

                        <button
                            onClick={nextReview}
                            className="p-3 bg-white/90 dark:bg-black/90 backdrop-blur-sm border border-gray-300 dark:border-gray-600 transition-all duration-300 pointer-events-auto hover:bg-gold hover:text-black hover:border-gold"
                            aria-label="Next review"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                )}

                {/* Review Card */}
                <motion.div
                    key={currentReviewIndex}
                    variants={itemVariants}
                    className="bg-gray-50 dark:bg-gray-900/50 p-8 md:p-12 text-center space-y-6"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    {/* Rating */}
                    <div className="flex justify-center">
                        {renderStars(reviews[currentReviewIndex].rating, "lg")}
                    </div>

                    {/* Review Title */}
                    <h3 className="text-xl md:text-2xl font-serif leading-tight">
                        "{reviews[currentReviewIndex].title}"
                    </h3>

                    {/* Review Content */}
                    <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed max-w-2xl mx-auto">
                        {reviews[currentReviewIndex].content}
                    </p>

                    {/* Author Info */}
                    <div className="flex items-center justify-center gap-3 pt-4">
                        <div className="w-10 h-10 bg-gray-300 dark:bg-gray-700 rounded-full flex items-center justify-center">
                            <User size={16} className="text-gray-600 dark:text-gray-400" />
                        </div>
                        <div className="text-left">
                            <p className="font-medium">{reviews[currentReviewIndex].author}</p>
                            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                <span>Verified Purchase</span>
                                <span>•</span>
                                <span>{new Date(reviews[currentReviewIndex].date).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Review Indicators */}
                {reviews.length > 1 && (
                    <div className="flex justify-center mt-8 space-x-2">
                        {reviews.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentReviewIndex(index)}
                                className={`w-2 h-2 rounded-full transition-all duration-300 ${currentReviewIndex === index
                                        ? 'bg-gold scale-125'
                                        : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
                                    }`}
                                aria-label={`Go to review ${index + 1}`}
                            />
                        ))}
                    </div>
                )}
            </motion.div>

            {/* Write Review CTA */}
            <motion.div
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.6, delay: 0.8 }}
            >
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Own this piece? Share your experience
                </p>
                <button className="px-6 py-3 border border-current hover:bg-current hover:text-white dark:hover:text-black transition-all duration-300 tracking-widest uppercase text-sm">
                    Write a Review
                </button>
            </motion.div>
        </section>
    );
}