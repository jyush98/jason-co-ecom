// components/product/SocialShare.tsx
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Share2, Heart, Bookmark, Copy, Check } from "lucide-react";
import { Product } from "@/types/product";

interface SocialShareProps {
    product: Product;
    isDark?: boolean;
}

export default function SocialShare({ product, isDark = false }: SocialShareProps) {
    const [isShareOpen, setIsShareOpen] = useState(false);
    const [isCopied, setIsCopied] = useState(false);
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [isSaved, setIsSaved] = useState(false);

    const productUrl = typeof window !== 'undefined' ? window.location.href : '';
    const shareText = `Check out this stunning piece: ${product.name} from Jason & Co. - WHERE AMBITION MEETS ARTISTRY`;

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(productUrl);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        } catch (error) {
            console.error('Failed to copy link:', error);
        }
    };

    const handleShare = (platform: string) => {
        const encodedUrl = encodeURIComponent(productUrl);
        const encodedText = encodeURIComponent(shareText);

        const shareUrls: Record<string, string> = {
            twitter: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
            facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
            linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
            pinterest: `https://pinterest.com/pin/create/button/?url=${encodedUrl}&description=${encodedText}&media=${encodeURIComponent(product.image_url)}`,
            whatsapp: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
        };

        if (shareUrls[platform]) {
            window.open(shareUrls[platform], '_blank', 'width=600,height=400');
        }
        setIsShareOpen(false);
    };

    const toggleWishlist = () => {
        setIsWishlisted(!isWishlisted);
        // TODO: Implement wishlist API call
    };

    const toggleSaved = () => {
        setIsSaved(!isSaved);
        // TODO: Implement save/bookmark API call
    };

    const shareVariants = {
        hidden: { opacity: 0, scale: 0.95, y: 10 },
        visible: {
            opacity: 1,
            scale: 1,
            y: 0,
            transition: {
                duration: 0.2,
                ease: "easeOut",
            },
        },
        exit: {
            opacity: 0,
            scale: 0.95,
            y: 10,
            transition: {
                duration: 0.15,
            },
        },
    };

    return (
        <div className="space-y-6">
            {/* Action Buttons Row */}
            <div className="flex items-center gap-4">
                {/* Share Button */}
                <div className="relative">
                    <motion.button
                        onClick={() => setIsShareOpen(!isShareOpen)}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 hover:border-gold hover:text-gold transition-all duration-300 text-sm tracking-wide"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <Share2 size={16} />
                        <span>Share</span>
                    </motion.button>

                    {/* Share Dropdown */}
                    <AnimatePresence>
                        {isShareOpen && (
                            <motion.div
                                variants={shareVariants}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                className="absolute top-full mt-2 left-0 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 shadow-xl min-w-[200px] z-20"
                            >
                                <div className="p-4 space-y-3">
                                    <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-medium">
                                        Share this piece
                                    </p>

                                    {/* Social Platforms */}
                                    <div className="space-y-2">
                                        <button
                                            onClick={() => handleShare('twitter')}
                                            className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors text-left"
                                        >
                                            <div className="w-5 h-5 bg-blue-400 rounded"></div>
                                            <span>Twitter</span>
                                        </button>

                                        <button
                                            onClick={() => handleShare('facebook')}
                                            className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors text-left"
                                        >
                                            <div className="w-5 h-5 bg-blue-600 rounded"></div>
                                            <span>Facebook</span>
                                        </button>

                                        <button
                                            onClick={() => handleShare('linkedin')}
                                            className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors text-left"
                                        >
                                            <div className="w-5 h-5 bg-blue-700 rounded"></div>
                                            <span>LinkedIn</span>
                                        </button>

                                        <button
                                            onClick={() => handleShare('pinterest')}
                                            className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors text-left"
                                        >
                                            <div className="w-5 h-5 bg-red-600 rounded"></div>
                                            <span>Pinterest</span>
                                        </button>

                                        <button
                                            onClick={() => handleShare('whatsapp')}
                                            className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors text-left"
                                        >
                                            <div className="w-5 h-5 bg-green-500 rounded"></div>
                                            <span>WhatsApp</span>
                                        </button>
                                    </div>

                                    <div className="border-t border-gray-200 dark:border-gray-800 pt-3">
                                        <button
                                            onClick={handleCopyLink}
                                            className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors text-left"
                                        >
                                            {isCopied ? (
                                                <>
                                                    <Check size={16} className="text-green-500" />
                                                    <span className="text-green-500">Link copied!</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Copy size={16} />
                                                    <span>Copy link</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Wishlist Button */}
                <motion.button
                    onClick={toggleWishlist}
                    className={`flex items-center gap-2 px-4 py-2 border transition-all duration-300 text-sm tracking-wide ${isWishlisted
                            ? 'border-gold text-gold bg-gold/10'
                            : 'border-gray-300 dark:border-gray-600 hover:border-gold hover:text-gold'
                        }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    <Heart size={16} className={isWishlisted ? 'fill-current' : ''} />
                    <span>{isWishlisted ? 'Wishlisted' : 'Wishlist'}</span>
                </motion.button>

                {/* Save Button */}
                <motion.button
                    onClick={toggleSaved}
                    className={`flex items-center gap-2 px-4 py-2 border transition-all duration-300 text-sm tracking-wide ${isSaved
                            ? 'border-gold text-gold bg-gold/10'
                            : 'border-gray-300 dark:border-gray-600 hover:border-gold hover:text-gold'
                        }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    <Bookmark size={16} className={isSaved ? 'fill-current' : ''} />
                    <span>{isSaved ? 'Saved' : 'Save'}</span>
                </motion.button>
            </div>

            {/* Product ID & SKU */}
            <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                <p>Product ID: {product.id}</p>
                <p>SKU: JC-{product.id.toString().padStart(6, '0')}</p>
            </div>

            {/* Click outside to close share dropdown */}
            {isShareOpen && (
                <div
                    className="fixed inset-0 z-10"
                    onClick={() => setIsShareOpen(false)}
                />
            )}
        </div>
    );
}