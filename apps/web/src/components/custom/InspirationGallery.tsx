'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, Filter, Heart, Share2, Eye, Clock, DollarSign,
    Sparkles, ChevronDown, X, Play, Image as ImageIcon
} from 'lucide-react';

// Types for inspiration gallery
export interface InspirationItem {
    id: string;
    title: string;
    description: string;
    images: string[];
    category: 'engagement_ring' | 'wedding_band' | 'necklace' | 'earrings' | 'bracelet' | 'watch' | 'other';
    style: 'modern' | 'classic' | 'vintage' | 'avant_garde';
    priceRange: '1k-3k' | '3k-5k' | '5k-10k' | '10k-20k' | '20k+';
    materials: string[];
    creationTime: string; // e.g., "8 weeks"
    tags: string[];
    isFeatured: boolean;
    likes: number;
    createdAt: string;
    processVideo?: string; // URL to creation process video
    beforeAfter?: {
        before: string;
        after: string;
        story: string;
    };
}

const SAMPLE_INSPIRATION_DATA: InspirationItem[] = [
    {
        id: '1',
        title: 'Art Deco Engagement Ring',
        description: 'Vintage-inspired engagement ring with geometric diamond setting and milgrain details.',
        images: ['/api/placeholder/400/400', '/api/placeholder/400/400', '/api/placeholder/400/400'],
        category: 'engagement_ring',
        style: 'vintage',
        priceRange: '5k-10k',
        materials: ['18K White Gold', 'Diamond', 'Sapphire Accents'],
        creationTime: '6 weeks',
        tags: ['vintage', 'geometric', 'milgrain', 'sapphire'],
        isFeatured: true,
        likes: 127,
        createdAt: '2024-01-15',
        processVideo: '/videos/ring-creation-1.mp4'
    },
    {
        id: '2',
        title: 'Modern Minimalist Necklace',
        description: 'Clean lines meet luxury in this contemporary diamond pendant design.',
        images: ['/api/placeholder/400/400', '/api/placeholder/400/400'],
        category: 'necklace',
        style: 'modern',
        priceRange: '3k-5k',
        materials: ['14K Rose Gold', 'Diamond'],
        creationTime: '4 weeks',
        tags: ['minimalist', 'contemporary', 'pendant'],
        isFeatured: false,
        likes: 89,
        createdAt: '2024-02-01',
        beforeAfter: {
            before: '/api/placeholder/400/400',
            after: '/api/placeholder/400/400',
            story: 'Transformed a family heirloom diamond into a modern statement piece.'
        }
    },
    {
        id: '3',
        title: 'Custom Watch with Diamond Bezel',
        description: 'Luxury timepiece with custom diamond-set bezel and leather strap.',
        images: ['/api/placeholder/400/400', '/api/placeholder/400/400', '/api/placeholder/400/400'],
        category: 'watch',
        style: 'modern',
        priceRange: '10k-20k',
        materials: ['Stainless Steel', 'Diamond', 'Italian Leather'],
        creationTime: '12 weeks',
        tags: ['luxury', 'timepiece', 'diamond-bezel'],
        isFeatured: true,
        likes: 156,
        createdAt: '2024-01-08'
    }
];

const CATEGORY_OPTIONS = [
    { id: 'all', label: 'All Categories', icon: '✨' },
    { id: 'engagement_ring', label: 'Engagement Rings', icon: '💍' },
    { id: 'wedding_band', label: 'Wedding Bands', icon: '💒' },
    { id: 'necklace', label: 'Necklaces', icon: '📿' },
    { id: 'earrings', label: 'Earrings', icon: '👂' },
    { id: 'bracelet', label: 'Bracelets', icon: '⌚' },
    { id: 'watch', label: 'Watches', icon: '⏰' },
    { id: 'other', label: 'Other', icon: '💎' }
];

const STYLE_OPTIONS = [
    { id: 'all', label: 'All Styles' },
    { id: 'modern', label: 'Modern' },
    { id: 'classic', label: 'Classic' },
    { id: 'vintage', label: 'Vintage' },
    { id: 'avant_garde', label: 'Avant-Garde' }
];

const PRICE_OPTIONS = [
    { id: 'all', label: 'All Prices' },
    { id: '1k-3k', label: '$1K - $3K' },
    { id: '3k-5k', label: '$3K - $5K' },
    { id: '5k-10k', label: '$5K - $10K' },
    { id: '10k-20k', label: '$10K - $20K' },
    { id: '20k+', label: '$20K+' }
];

interface InspirationGalleryProps {
    data?: InspirationItem[];
    onUseAsInspiration?: (item: InspirationItem) => void;
    showFilters?: boolean;
    maxItems?: number;
    className?: string;
}

export function InspirationGallery({
    data = SAMPLE_INSPIRATION_DATA,
    onUseAsInspiration,
    showFilters = true,
    maxItems,
    className = ''
}: InspirationGalleryProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedStyle, setSelectedStyle] = useState('all');
    const [selectedPriceRange, setSelectedPriceRange] = useState('all');
    const [showFiltersPanel, setShowFiltersPanel] = useState(false);
    const [selectedItem, setSelectedItem] = useState<InspirationItem | null>(null);
    const [likedItems, setLikedItems] = useState<Set<string>>(new Set());

    // Filter and search logic
    const filteredItems = useMemo(() => {
        let filtered = data;

        // Search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(item =>
                item.title.toLowerCase().includes(query) ||
                item.description.toLowerCase().includes(query) ||
                item.tags.some(tag => tag.toLowerCase().includes(query)) ||
                item.materials.some(material => material.toLowerCase().includes(query))
            );
        }

        // Category filter
        if (selectedCategory !== 'all') {
            filtered = filtered.filter(item => item.category === selectedCategory);
        }

        // Style filter
        if (selectedStyle !== 'all') {
            filtered = filtered.filter(item => item.style === selectedStyle);
        }

        // Price range filter
        if (selectedPriceRange !== 'all') {
            filtered = filtered.filter(item => item.priceRange === selectedPriceRange);
        }

        // Sort by featured first, then by likes
        filtered.sort((a, b) => {
            if (a.isFeatured && !b.isFeatured) return -1;
            if (!a.isFeatured && b.isFeatured) return 1;
            return b.likes - a.likes;
        });

        // Limit items if specified
        if (maxItems) {
            filtered = filtered.slice(0, maxItems);
        }

        return filtered;
    }, [data, searchQuery, selectedCategory, selectedStyle, selectedPriceRange, maxItems]);

    const toggleLike = (itemId: string) => {
        setLikedItems(prev => {
            const newSet = new Set(prev);
            if (newSet.has(itemId)) {
                newSet.delete(itemId);
            } else {
                newSet.add(itemId);
            }
            return newSet;
        });
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <div className={`space-y-6 ${className}`}>
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
            >
                <h2 className="text-4xl font-bold mb-4 flex items-center justify-center gap-3">
                    {/* <Sparkles className="w-8 h-8 text-amber-500 hidden" /> */}
                    Design Inspiration
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
                    Explore our collection of custom creations to spark your imagination and discover what's possible.
                </p>
            </motion.div>

            {/* Search and Filters */}
            {showFilters && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                >
                    {/* Search Bar */}
                    <div className="relative max-w-md mx-auto">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search designs, materials, styles..."
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-black text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
                        />
                    </div>

                    {/* Category Filters */}
                    <div className="flex flex-wrap justify-center gap-2">
                        {CATEGORY_OPTIONS.map((category) => (
                            <button
                                key={category.id}
                                onClick={() => setSelectedCategory(category.id)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${selectedCategory === category.id
                                        ? 'bg-black dark:bg-white text-white dark:text-black'
                                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                                    }`}
                            >
                                {/* <span>{category.icon}</span> */}
                                <span className="text-sm font-medium">{category.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Advanced Filters Toggle */}
                    <div className="text-center">
                        <button
                            onClick={() => setShowFiltersPanel(!showFiltersPanel)}
                            className="flex items-center gap-2 mx-auto px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                        >
                            <Filter className="w-4 h-4" />
                            Advanced Filters
                            <ChevronDown className={`w-4 h-4 transition-transform ${showFiltersPanel ? 'rotate-180' : ''}`} />
                        </button>
                    </div>

                    {/* Advanced Filters Panel */}
                    <AnimatePresence>
                        {showFiltersPanel && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 space-y-4"
                            >
                                <div className="grid md:grid-cols-2 gap-4">
                                    {/* Style Filter */}
                                    <div>
                                        <label className="block text-sm font-semibold mb-2">Style</label>
                                        <select
                                            value={selectedStyle}
                                            onChange={(e) => setSelectedStyle(e.target.value)}
                                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-black text-black dark:text-white"
                                        >
                                            {STYLE_OPTIONS.map((style) => (
                                                <option key={style.id} value={style.id}>
                                                    {style.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Price Range Filter */}
                                    <div>
                                        <label className="block text-sm font-semibold mb-2">Price Range</label>
                                        <select
                                            value={selectedPriceRange}
                                            onChange={(e) => setSelectedPriceRange(e.target.value)}
                                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-black text-black dark:text-white"
                                        >
                                            {PRICE_OPTIONS.map((price) => (
                                                <option key={price.id} value={price.id}>
                                                    {price.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Clear Filters */}
                                <div className="flex justify-center">
                                    <button
                                        onClick={() => {
                                            setSelectedCategory('all');
                                            setSelectedStyle('all');
                                            setSelectedPriceRange('all');
                                            setSearchQuery('');
                                        }}
                                        className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors"
                                    >
                                        Clear All Filters
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            )}

            {/* Results Count */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center text-gray-600 dark:text-gray-400"
            >
                {filteredItems.length} {filteredItems.length === 1 ? 'design' : 'designs'} found
            </motion.div>

            {/* Gallery Grid */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
                <AnimatePresence>
                    {filteredItems.map((item) => (
                        <InspirationCard
                            key={item.id}
                            item={item}
                            isLiked={likedItems.has(item.id)}
                            onLike={() => toggleLike(item.id)}
                            onView={() => setSelectedItem(item)}
                            onUseAsInspiration={onUseAsInspiration}
                            variants={itemVariants}
                        />
                    ))}
                </AnimatePresence>
            </motion.div>

            {/* Empty State */}
            {filteredItems.length === 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-12"
                >
                    <ImageIcon className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No designs found</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                        Try adjusting your search criteria or browse all categories.
                    </p>
                    <button
                        onClick={() => {
                            setSelectedCategory('all');
                            setSelectedStyle('all');
                            setSelectedPriceRange('all');
                            setSearchQuery('');
                        }}
                        className="px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
                    >
                        View All Designs
                    </button>
                </motion.div>
            )}

            {/* Detail Modal */}
            <AnimatePresence>
                {selectedItem && (
                    <InspirationDetailModal
                        item={selectedItem}
                        onClose={() => setSelectedItem(null)}
                        onUseAsInspiration={onUseAsInspiration}
                        isLiked={likedItems.has(selectedItem.id)}
                        onLike={() => toggleLike(selectedItem.id)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

const formatPriceRange = (range: string) => {
    const formatMap: Record<string, string> = {
        '1k-3k': '$1,000 - $3,000',
        '3k-5k': '$3,000 - $5,000',
        '5k-10k': '$5,000 - $10,000',
        '10k-20k': '$10,000 - $20,000',
        '20k+': '$20,000+'
    };
    return formatMap[range] || range;
};

// Individual inspiration card component
function InspirationCard({
    item,
    isLiked,
    onLike,
    onView,
    onUseAsInspiration,
    variants
}: {
    item: InspirationItem;
    isLiked: boolean;
    onLike: () => void;
    onView: () => void;
    onUseAsInspiration?: (item: InspirationItem) => void;
    variants: any;
}) {
    return (
        <motion.div
            variants={variants}
            layout
            className="group relative bg-white dark:bg-gray-900 rounded-xl overflow-hidden shadow-sm border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-all duration-300"
        >
            {/* Featured Badge */}
            {item.isFeatured && (
                <div className="absolute top-3 left-3 z-10 bg-amber-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                    Featured
                </div>
            )}

            {/* Main Image */}
            <div className="relative aspect-square overflow-hidden bg-gray-100 dark:bg-gray-800">
                <img
                    src={item.images[0]}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Overlay Actions */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="flex gap-2">
                        <button
                            onClick={onView}
                            className="p-3 bg-white/90 text-black rounded-full hover:bg-white transition-colors"
                        >
                            <Eye className="w-4 h-4" />
                        </button>
                        <button
                            onClick={onLike}
                            className={`p-3 rounded-full transition-colors ${isLiked
                                    ? 'bg-red-500 text-white'
                                    : 'bg-white/90 text-black hover:bg-white'
                                }`}
                        >
                            <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                        </button>
                        <button className="p-3 bg-white/90 text-black rounded-full hover:bg-white transition-colors">
                            <Share2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Process Video Indicator */}
                {item.processVideo && (
                    <div className="absolute bottom-3 right-3 bg-black/70 text-white p-2 rounded-full">
                        <Play className="w-3 h-3" />
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-4 space-y-3">
                <div>
                    <h3 className="font-semibold text-lg mb-1 line-clamp-1">{item.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">
                        {item.description}
                    </p>
                </div>

                {/* Materials */}
                <div className="flex flex-wrap gap-1">
                    {item.materials.slice(0, 2).map((material, index) => (
                        <span
                            key={index}
                            className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-full"
                        >
                            {material}
                        </span>
                    ))}
                    {item.materials.length > 2 && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                            +{item.materials.length - 2} more
                        </span>
                    )}
                </div>

                {/* Metadata */}
                <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {item.creationTime}
                        </div>
                        <div className="flex items-center gap-1">
                            <DollarSign className="w-3 h-3" />
                            {formatPriceRange(item.priceRange)}
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        <Heart className="w-3 h-3" />
                        {item.likes}
                    </div>
                </div>

                {/* Use as Inspiration Button */}
                {onUseAsInspiration && (
                    <button
                        onClick={() => onUseAsInspiration(item)}
                        className="w-full py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors text-sm font-medium"
                    >
                        Use as Inspiration
                    </button>
                )}
            </div>
        </motion.div>
    );
}

// Detail modal component
function InspirationDetailModal({
    item,
    onClose,
    onUseAsInspiration,
    isLiked,
    onLike
}: {
    item: InspirationItem;
    onClose: () => void;
    onUseAsInspiration?: (item: InspirationItem) => void;
    isLiked: boolean;
    onLike: () => void;
}) {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const formatPriceRange = (range: string) => {
        const formatMap: Record<string, string> = {
            '1k-3k': '$1,000 - $3,000',
            '3k-5k': '$3,000 - $5,000',
            '5k-10k': '$5,000 - $10,000',
            '10k-20k': '$10,000 - $20,000',
            '20k+': '$20,000+'
        };
        return formatMap[range] || range;
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 overflow-y-auto"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="relative bg-white dark:bg-gray-900 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="grid md:grid-cols-2 gap-6 p-6">
                    {/* Images Section */}
                    <div className="space-y-4">
                        {/* Main Image */}
                        <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                            <img
                                src={item.images[currentImageIndex]}
                                alt={`${item.title} - Image ${currentImageIndex + 1}`}
                                className="w-full h-full object-cover"
                            />
                        </div>

                        {/* Image Thumbnails */}
                        {item.images.length > 1 && (
                            <div className="flex gap-2 overflow-x-auto">
                                {item.images.map((image, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setCurrentImageIndex(index)}
                                        className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${index === currentImageIndex
                                                ? 'border-black dark:border-white'
                                                : 'border-gray-200 dark:border-gray-700'
                                            }`}
                                    >
                                        <img
                                            src={image}
                                            alt={`Thumbnail ${index + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Details Section */}
                    <div className="space-y-6">
                        <div>
                            <div className="flex items-start justify-between mb-3">
                                <h2 className="text-2xl font-bold">{item.title}</h2>
                                <div className="flex gap-2">
                                    <button
                                        onClick={onLike}
                                        className={`p-2 rounded-full transition-colors ${isLiked
                                                ? 'bg-red-500 text-white'
                                                : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                                            }`}
                                    >
                                        <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                                    </button>
                                    <button className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                                        <Share2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            <p className="text-gray-600 dark:text-gray-400">{item.description}</p>
                        </div>

                        {/* Specifications */}
                        <div className="space-y-4">
                            <div>
                                <h4 className="font-semibold mb-2">Specifications</h4>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-gray-600 dark:text-gray-400">Style:</span>
                                        <span className="ml-2 capitalize">{item.style}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600 dark:text-gray-400">Timeline:</span>
                                        <span className="ml-2">{item.creationTime}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600 dark:text-gray-400">Price Range:</span>
                                        <span className="ml-2">{formatPriceRange(item.priceRange)}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600 dark:text-gray-400">Likes:</span>
                                        <span className="ml-2">{item.likes}</span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h4 className="font-semibold mb-2">Materials</h4>
                                <div className="flex flex-wrap gap-2">
                                    {item.materials.map((material, index) => (
                                        <span
                                            key={index}
                                            className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full text-sm"
                                        >
                                            {material}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h4 className="font-semibold mb-2">Tags</h4>
                                <div className="flex flex-wrap gap-2">
                                    {item.tags.map((tag, index) => (
                                        <span
                                            key={index}
                                            className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 px-2 py-1 rounded-full"
                                        >
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Before/After Story */}
                        {item.beforeAfter && (
                            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                                <h4 className="font-semibold mb-3">Transformation Story</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                    {item.beforeAfter.story}
                                </p>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Before</p>
                                        <img
                                            src={item.beforeAfter.before}
                                            alt="Before transformation"
                                            className="w-full aspect-square object-cover rounded-lg"
                                        />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">After</p>
                                        <img
                                            src={item.beforeAfter.after}
                                            alt="After transformation"
                                            className="w-full aspect-square object-cover rounded-lg"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="space-y-3">
                            {onUseAsInspiration && (
                                <button
                                    onClick={() => {
                                        onUseAsInspiration(item);
                                        onClose();
                                    }}
                                    className="w-full py-3 bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors font-medium"
                                >
                                    Use as Inspiration for My Design
                                </button>
                            )}

                            <button className="w-full py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                                Request Similar Design
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}