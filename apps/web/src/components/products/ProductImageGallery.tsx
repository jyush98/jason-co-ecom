// components/product/ProductImageGallery.tsx
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight, ZoomIn, RotateCw, Maximize2 } from "lucide-react";

interface ProductImageGalleryProps {
    images: string[];
    productName: string;
    isDark?: boolean;
}

export default function ProductImageGallery({
    images,
    productName,
    isDark = false
}: ProductImageGalleryProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isZoomed, setIsZoomed] = useState(false);
    const [rotation, setRotation] = useState(0);
    const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);

    const modalRef = useRef<HTMLDivElement>(null);
    const imageRef = useRef<HTMLDivElement>(null);

    // Mouse position for zoom functionality
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    // Transform mouse position to image translation for zoom
    const imageX = useTransform(mouseX, [0, 1], [-50, 50]);
    const imageY = useTransform(mouseY, [0, 1], [-50, 50]);

    const currentImage = images[currentIndex] || images[0];

    // Navigation functions
    const goToNext = useCallback(() => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
    }, [images.length]);

    const goToPrevious = useCallback(() => {
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    }, [images.length]);

    const goToSlide = useCallback((index: number) => {
        setCurrentIndex(index);
    }, []);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isModalOpen) return;

            switch (e.key) {
                case 'ArrowLeft':
                    e.preventDefault();
                    goToPrevious();
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    goToNext();
                    break;
                case 'Escape':
                    e.preventDefault();
                    closeModal();
                    break;
                case ' ':
                    e.preventDefault();
                    toggleZoom();
                    break;
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isModalOpen, goToNext, goToPrevious]);

    // Touch handlers for swipe navigation
    const handleTouchStart = (e: React.TouchEvent) => {
        const touch = e.touches[0];
        setTouchStart({ x: touch.clientX, y: touch.clientY });
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        if (!touchStart) return;

        const touch = e.changedTouches[0];
        const deltaX = touch.clientX - touchStart.x;
        const deltaY = Math.abs(touch.clientY - touchStart.y);

        // Only trigger swipe if horizontal movement is greater than vertical
        if (Math.abs(deltaX) > 50 && deltaY < 100) {
            if (deltaX > 0) {
                goToPrevious();
            } else {
                goToNext();
            }
        }

        setTouchStart(null);
    };

    // Mouse move handler for zoom
    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isZoomed || !imageRef.current) return;

        const rect = imageRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;

        mouseX.set(x);
        mouseY.set(y);
    };

    const openModal = () => {
        setIsModalOpen(true);
        document.body.style.overflow = 'hidden';
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setIsZoomed(false);
        setRotation(0);
        document.body.style.overflow = '';
    };

    const toggleZoom = () => {
        setIsZoomed(!isZoomed);
    };

    const rotate360 = () => {
        setRotation(prev => prev + 90);
    };

    return (
        <>
            {/* Main Gallery */}
            <div className="space-y-6">
                {/* Main Image */}
                <motion.div
                    className={`relative aspect-square overflow-hidden cursor-zoom-in group ${isDark
                        ? "bg-black"
                        : "bg-white"
                        }`}
                    onClick={openModal}
                    whileHover={{ scale: 1.01 }}
                    transition={{ duration: 0.3 }}
                >
                    <Image
                        src={currentImage}
                        alt={`${productName} - View ${currentIndex + 1}`}
                        fill
                        className="object-contain transition-transform duration-500 group-hover:scale-105"
                        sizes="(min-width: 1024px) 50vw, 100vw"
                        priority={currentIndex === 0}
                    />

                    {/* Overlay Icons */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="flex gap-2">
                            <div className="p-2 bg-white/90 dark:bg-black/90 backdrop-blur-sm rounded-full">
                                <ZoomIn size={16} />
                            </div>
                            <div className="p-2 bg-white/90 dark:bg-black/90 backdrop-blur-sm rounded-full">
                                <Maximize2 size={16} />
                            </div>
                        </div>
                    </div>

                    {/* Navigation arrows for multiple images */}
                    {images.length > 1 && (
                        <>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    goToPrevious();
                                }}
                                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/90 dark:bg-black/90 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-gold hover:text-black"
                                aria-label="Previous image"
                            >
                                <ChevronLeft size={20} />
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    goToNext();
                                }}
                                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/90 dark:bg-black/90 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-gold hover:text-black"
                                aria-label="Next image"
                            >
                                <ChevronRight size={20} />
                            </button>
                        </>
                    )}
                </motion.div>

                {/* Thumbnails */}
                {images.length > 1 && (
                    <div className="flex gap-3 overflow-x-auto pb-2">
                        {images.map((image, index) => (
                            <motion.button
                                key={index}
                                onClick={() => goToSlide(index)}
                                className={`relative flex-none w-16 h-16 md:w-20 md:h-20 overflow-hidden transition-all duration-300 ${index === currentIndex
                                        ? 'ring-2 ring-gold'
                                        : 'ring-1 ring-gray-300 dark:ring-gray-700 hover:ring-gold/50'
                                    }`}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Image
                                    src={image}
                                    alt={`${productName} thumbnail ${index + 1}`}
                                    fill
                                    className="object-contain"
                                    sizes="80px"
                                />
                            </motion.button>
                        ))}
                    </div>
                )}

                {/* Image Counter */}
                {images.length > 1 && (
                    <div className="text-center text-sm text-gray-500 dark:text-gray-400">
                        {currentIndex + 1} of {images.length}
                    </div>
                )}
            </div>

            {/* Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <motion.div
                        ref={modalRef}
                        className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        onTouchStart={handleTouchStart}
                        onTouchEnd={handleTouchEnd}
                    >
                        {/* Controls */}
                        <div className="absolute top-4 right-4 z-10 flex gap-2">
                            <button
                                onClick={toggleZoom}
                                className={`p-3 bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-colors ${isZoomed ? 'bg-gold text-black' : ''
                                    }`}
                                aria-label={isZoomed ? "Zoom out" : "Zoom in"}
                            >
                                <ZoomIn size={20} />
                            </button>
                            <button
                                onClick={rotate360}
                                className="p-3 bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-colors"
                                aria-label="Rotate image"
                            >
                                <RotateCw size={20} />
                            </button>
                            <button
                                onClick={closeModal}
                                className="p-3 bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-colors"
                                aria-label="Close modal"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Navigation */}
                        {images.length > 1 && (
                            <>
                                <button
                                    onClick={goToPrevious}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 p-4 bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-colors z-10"
                                    aria-label="Previous image"
                                >
                                    <ChevronLeft size={24} />
                                </button>
                                <button
                                    onClick={goToNext}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 p-4 bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-colors z-10"
                                    aria-label="Next image"
                                >
                                    <ChevronRight size={24} />
                                </button>
                            </>
                        )}

                        {/* Image Container */}
                        <motion.div
                            ref={imageRef}
                            className="flex items-center justify-center h-full p-4 cursor-pointer"
                            onClick={toggleZoom}
                            onMouseMove={handleMouseMove}
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.9 }}
                            transition={{ duration: 0.3 }}
                        >
                            <motion.div
                                className="relative max-w-4xl max-h-full"
                                style={{
                                    transform: isZoomed ? 'scale(2)' : 'scale(1)',
                                    x: isZoomed ? imageX : 0,
                                    y: isZoomed ? imageY : 0,
                                    rotate: rotation,
                                }}
                                transition={{ duration: 0.3, ease: "easeOut" }}
                            >
                                <Image
                                    src={currentImage}
                                    alt={`${productName} - Full view ${currentIndex + 1}`}
                                    width={800}
                                    height={800}
                                    className="max-w-full max-h-full object-contain"
                                    sizes="90vw"
                                />
                            </motion.div>
                        </motion.div>

                        {/* Bottom Info */}
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center text-white">
                            <p className="text-sm mb-2">{productName}</p>
                            {images.length > 1 && (
                                <p className="text-xs opacity-60">
                                    {currentIndex + 1} of {images.length} • Use arrow keys to navigate
                                </p>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}