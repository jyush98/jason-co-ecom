// components/product/SocialShare.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Share2, Bookmark, Copy, Check } from "lucide-react";
import { Product } from "@/types/product";
import AddToWishlistButton from "../wishlist/AddToWishListButton";
import { createDropdown } from "@/lib/animations";

interface SocialShareProps {
    product: Product;
    isDark?: boolean;
}

export default function SocialShare({ product }: SocialShareProps) {
    const [isShareOpen, setIsShareOpen] = useState(false);
    const [isCopied, setIsCopied] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [isLoadingSave, setIsLoadingSave] = useState(false);
    const shareRef = useRef<HTMLDivElement>(null);

    const productUrl = typeof window !== 'undefined' ? window.location.href : '';
    const shareText = `Check out this stunning piece: ${product.name} from Jason & Co. - WHERE AMBITION MEETS ARTISTRY`;

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (shareRef.current && !shareRef.current.contains(event.target as Node)) {
                setIsShareOpen(false);
            }
        }

        if (isShareOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [isShareOpen]);

    // Load saved status on mount
    useEffect(() => {
        const checkSavedStatus = async () => {
            // TODO: Check if product is saved - you'll need to implement this API
            // const savedStatus = await checkIfProductSaved(product.id);
            // setIsSaved(savedStatus);
        };
        checkSavedStatus();
    }, [product.id]);

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(productUrl);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        } catch (error) {
            console.error('Failed to copy link:', error);
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = productUrl;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        }
    };

    const handleShare = (platform: string) => {
        const encodedUrl = encodeURIComponent(productUrl);
        const encodedText = encodeURIComponent(shareText);
        const imageUrl = product.image_url || product.image_urls?.[0] || '';

        const shareUrls: Record<string, string> = {
            twitter: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
            facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
            linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
            pinterest: `https://pinterest.com/pin/create/button/?url=${encodedUrl}&description=${encodedText}&media=${encodeURIComponent(imageUrl)}`,
            whatsapp: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
            email: `mailto:?subject=${encodeURIComponent(`Check out: ${product.name}`)}&body=${encodedText}%20${encodedUrl}`,
        };

        if (shareUrls[platform]) {
            window.open(shareUrls[platform], '_blank', 'width=600,height=400');
        }
        setIsShareOpen(false);

        // Track sharing event for analytics
        if (typeof window !== 'undefined' && window.gtag) {
            window.gtag('event', 'share', {
                method: platform,
                content_type: 'product',
                content_id: product.id.toString(),
                event_category: 'Social',
                event_label: product.name
            });
        }
    };

    const handleSaveToggle = async () => {
        if (isLoadingSave) return;

        setIsLoadingSave(true);
        try {
            if (isSaved) {
                // Remove from saved items
                // TODO: Implement API call to remove from saved items
                // await removeFromSaved(product.id);
                setIsSaved(false);
                console.log('Removed from saved items');
            } else {
                // Add to saved items
                // TODO: Implement API call to save item
                // await addToSaved(product.id);
                setIsSaved(true);
                console.log('Added to saved items');
            }

            // Track save action for analytics
            if (typeof window !== 'undefined' && window.gtag) {
                window.gtag('event', isSaved ? 'remove_from_saved' : 'add_to_saved', {
                    event_category: 'Product',
                    event_label: product.name,
                    value: product.price ? product.price / 100 : 0
                });
            }

        } catch (error) {
            console.error('Failed to toggle save status:', error);
            // Revert on error
            setIsSaved(!isSaved);
        } finally {
            setIsLoadingSave(false);
        }
    };

    const shareVariants = createDropdown(10, 0.95, 0.2, 0.15);


    // Generate SKU more reliably
    const generateSKU = (product: Product): string => {
        if (product.sku) return product.sku;

        // Generate SKU based on product properties
        const prefix = 'JC';
        const categoryCode = product.category_name ?
            product.category_name.substring(0, 2).toUpperCase() : 'GN';
        const idPadded = product.id.toString().padStart(4, '0');

        return `${prefix}-${categoryCode}-${idPadded}`;
    };

    return (
        <div className="space-y-6">
            {/* Action Buttons Row */}
            <div className="flex items-center gap-4 justify-center">
                {/* Share Button */}
                <div className="relative" ref={shareRef}>
                    <motion.button
                        onClick={() => setIsShareOpen(!isShareOpen)}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 hover:border-gold hover:text-gold transition-all duration-300 text-sm tracking-wide"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        aria-expanded={isShareOpen}
                        aria-haspopup="true"
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
                                className="absolute top-full mt-2 left-0 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 shadow-xl min-w-[200px] z-20 rounded-lg overflow-hidden"
                            >
                                <div className="p-4 space-y-3">
                                    <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-medium">
                                        Share this piece
                                    </p>

                                    {/* Social Platforms */}
                                    <div className="space-y-1">
                                        <button
                                            onClick={() => handleShare('twitter')}
                                            className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors text-left rounded"
                                        >
                                            <div className="w-5 h-5 bg-blue-400 rounded flex items-center justify-center text-white text-xs font-bold">
                                                𝕏
                                            </div>
                                            <span>Twitter / X</span>
                                        </button>

                                        <button
                                            onClick={() => handleShare('facebook')}
                                            className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors text-left rounded"
                                        >
                                            <div className="w-5 h-5 bg-blue-600 rounded flex items-center justify-center text-white text-xs font-bold">
                                                f
                                            </div>
                                            <span>Facebook</span>
                                        </button>

                                        <button
                                            onClick={() => handleShare('linkedin')}
                                            className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors text-left rounded"
                                        >
                                            <div className="w-5 h-5 bg-blue-700 rounded flex items-center justify-center text-white text-xs font-bold">
                                                in
                                            </div>
                                            <span>LinkedIn</span>
                                        </button>

                                        <button
                                            onClick={() => handleShare('pinterest')}
                                            className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors text-left rounded"
                                        >
                                            <div className="w-5 h-5 bg-red-600 rounded flex items-center justify-center text-white text-xs font-bold">
                                                P
                                            </div>
                                            <span>Pinterest</span>
                                        </button>

                                        <button
                                            onClick={() => handleShare('whatsapp')}
                                            className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors text-left rounded"
                                        >
                                            <div className="w-5 h-5 bg-green-500 rounded flex items-center justify-center text-white text-xs font-bold">
                                                W
                                            </div>
                                            <span>WhatsApp</span>
                                        </button>

                                        <button
                                            onClick={() => handleShare('email')}
                                            className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors text-left rounded"
                                        >
                                            <div className="w-5 h-5 bg-gray-600 rounded flex items-center justify-center text-white text-xs font-bold">
                                                @
                                            </div>
                                            <span>Email</span>
                                        </button>
                                    </div>

                                    <div className="border-t border-gray-200 dark:border-gray-800 pt-3">
                                        <button
                                            onClick={handleCopyLink}
                                            className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors text-left rounded"
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
                <AddToWishlistButton
                    product={product}
                    variant="default"
                    size="md"
                    onSuccess={(isInWishlist: boolean) => {
                        console.log(`Product ${isInWishlist ? 'added to' : 'removed from'} wishlist`);
                    }}
                />

                {/* Save Button */}
                <motion.button
                    onClick={handleSaveToggle}
                    disabled={isLoadingSave}
                    className={`flex items-center gap-2 px-4 py-2 border transition-all duration-300 text-sm tracking-wide ${isSaved
                        ? 'border-gold text-gold bg-gold/10'
                        : 'border-gray-300 dark:border-gray-600 hover:border-gold hover:text-gold'
                        } ${isLoadingSave ? 'opacity-50 cursor-not-allowed' : ''}`}
                    whileHover={!isLoadingSave ? { scale: 1.02 } : {}}
                    whileTap={!isLoadingSave ? { scale: 0.98 } : {}}
                >
                    <Bookmark size={16} className={isSaved ? 'fill-current' : ''} />
                    <span>
                        {isLoadingSave ? 'Saving...' : isSaved ? 'Saved' : 'Save'}
                    </span>
                </motion.button>
            </div>

            {/* Product ID & SKU */}
            <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1 text-center">
                <p>Product ID: {product.id}</p>
                <p>SKU: {generateSKU(product)}</p>
            </div>
        </div>
    );
}