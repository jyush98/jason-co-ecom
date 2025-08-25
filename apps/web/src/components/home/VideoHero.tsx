"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";
import { JewelryImage } from "@/components/ui/OptimizedImage";
import { createStaggerContainer, createEntranceAnimation } from "@/lib/animations";

interface VideoHeroProps {
    videoSrc: string;
    fallbackImage: string;
    title: string;
    subtitle: string;
    ctaText: string;
    ctaLink: string;
    autoplay?: boolean;
    showControls?: boolean;
}

export default function VideoHero({
    videoSrc,
    fallbackImage,
    title,
    subtitle,
    ctaText,
    ctaLink,
    autoplay = true,
    showControls = true,
}: VideoHeroProps) {
    const [isPlaying, setIsPlaying] = useState(autoplay);
    const [isMuted, setIsMuted] = useState(true);
    const [isVideoLoaded, setIsVideoLoaded] = useState(false);
    const [hasError, setHasError] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const handleLoadedData = () => {
            setIsVideoLoaded(true);
            if (autoplay && isPlaying) {
                video.play().catch(() => {
                    setHasError(true);
                    setIsPlaying(false);
                });
            }
        };

        const handleError = () => {
            setHasError(true);
            setIsVideoLoaded(false);
        };

        video.addEventListener('loadeddata', handleLoadedData);
        video.addEventListener('error', handleError);

        return () => {
            video.removeEventListener('loadeddata', handleLoadedData);
            video.removeEventListener('error', handleError);
        };
    }, [autoplay, isPlaying]);

    const togglePlayPause = () => {
        const video = videoRef.current;
        if (!video || hasError) return;

        if (isPlaying) {
            video.pause();
            setIsPlaying(false);
        } else {
            video.play().catch(() => {
                setHasError(true);
                setIsPlaying(false);
            });
            setIsPlaying(true);
        }
    };

    const toggleMute = () => {
        const video = videoRef.current;
        if (!video || hasError) return;

        video.muted = !isMuted;
        setIsMuted(!isMuted);
    };

    const containerVariants = createStaggerContainer(0.2, 0.3, 0.8);
    const itemVariants = createEntranceAnimation(10, 1, 0.6);

    return (
        <section className="relative h-screen w-full overflow-hidden bg-black">
            {/* Video Background */}
            {!hasError && (
                <video
                    ref={videoRef}
                    className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${isVideoLoaded ? 'opacity-100' : 'opacity-0'
                        }`}
                    autoPlay={autoplay}
                muted={isMuted}
                    loop
                    playsInline
                    poster={fallbackImage}
                >
                    <source src={videoSrc} type="video/mp4" />
                    Your browser does not support the video tag.
                </video>
            )}

            {/* Optimized Fallback Image - Critical Performance Improvement */}
            <div className={`absolute inset-0 transition-opacity duration-1000 ${isVideoLoaded && !hasError ? 'opacity-0' : 'opacity-100'
                }`}>
                <JewelryImage.Hero
                    src={fallbackImage}
                    alt={`${title} - Luxury Jewelry Hero`}
                    className="h-full w-full object-cover"
                    placeholder="blur"
                    width={1920}
                    height={1080}
                />
            </div>

            {/* Dark Overlay for Text Readability */}
            <div className="absolute inset-0 bg-black/40" />

            {/* Content Overlay */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="relative z-10 flex h-full items-center justify-center px-4 text-center text-white"
            >
                <div className="max-w-4xl">
                    <motion.h1
                        variants={itemVariants}
                        className="mb-6 text-4xl font-bold tracking-tight sm:text-6xl md:text-7xl lg:text-8xl"
                        style={{ fontFamily: 'var(--font-playfair)' }}
                    >
                        {title}
                    </motion.h1>

                    <motion.p
                        variants={itemVariants}
                        className="mb-8 text-lg font-light sm:text-xl md:text-2xl"
                        style={{ fontFamily: 'var(--font-inter)' }}
                    >
                        {subtitle}
                    </motion.p>

                    <motion.div variants={itemVariants}>
                        <motion.a
                            href={ctaLink}
                            className="inline-block rounded-full bg-white px-8 py-4 text-lg font-semibold text-black transition-all duration-300 hover:bg-gray-100 hover:scale-105"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            style={{ fontFamily: 'var(--font-inter)' }}
                        >
                            {ctaText}
                        </motion.a>
                    </motion.div>
                </div>
            </motion.div>

            {/* Video Controls */}
            {showControls && !hasError && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1, duration: 0.6 }}
                    className="absolute bottom-8 right-8 z-20 flex space-x-4"
                >
                    <motion.button
                        onClick={togglePlayPause}
                        className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm transition-all duration-300 hover:bg-white/30 hover:scale-110"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        aria-label={isPlaying ? "Pause video" : "Play video"}
                    >
                        {isPlaying ? (
                            <Pause className="h-5 w-5 text-white" />
                        ) : (
                            <Play className="h-5 w-5 text-white ml-0.5" />
                        )}
                    </motion.button>

                    <motion.button
                        onClick={toggleMute}
                        className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm transition-all duration-300 hover:bg-white/30 hover:scale-110"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        aria-label={isMuted ? "Unmute video" : "Mute video"}
                    >
                        {isMuted ? (
                            <VolumeX className="h-5 w-5 text-white" />
                        ) : (
                            <Volume2 className="h-5 w-5 text-white" />
                        )}
                    </motion.button>
                </motion.div>
            )}

            {/* Scroll Indicator */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5, duration: 0.6 }}
                className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20"
            >
                <motion.div
                    animate={{ y: [0, 10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="h-8 w-0.5 bg-white/60"
                />
            </motion.div>

            {/* Performance Optimization: Preload Next Section Images */}
            <div className="hidden">
                {/* This preloads critical images for the next sections */}
                <link rel="preload" as="image" href="/images/featured-product-1.jpg" />
                <link rel="preload" as="image" href="/images/featured-product-2.jpg" />
            </div>
        </section>
    );
}