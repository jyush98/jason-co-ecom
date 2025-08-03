'use client';

import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Calculator, TrendingUp, Info, DollarSign } from 'lucide-react';

// Price calculation interfaces
interface PriceFactors {
    projectType: string;
    metalType: string;
    budgetRange: string;
    complexity: 'simple' | 'moderate' | 'complex' | 'exceptional';
    timelinePreference: string;
    stoneCount?: number;
    customFeatures: string[];
}

interface PriceEstimate {
    minPrice: number;
    maxPrice: number;
    basePrice: number;
    metalCost: number;
    stoneCost: number;
    laborCost: number;
    complexityMultiplier: number;
    timelineMultiplier: number;
    breakdown: PriceBreakdown[];
}

interface PriceBreakdown {
    category: string;
    description: string;
    cost: number;
    percentage: number;
}

// Base pricing structure (these would come from your backend/config)
const BASE_PRICES = {
    engagement_ring: { min: 2500, max: 15000, base: 4000 },
    wedding_band: { min: 800, max: 4000, base: 1500 },
    necklace: { min: 1200, max: 8000, base: 2500 },
    earrings: { min: 600, max: 5000, base: 1800 },
    bracelet: { min: 800, max: 6000, base: 2000 },
    watch: { min: 5000, max: 25000, base: 8000 },
    other: { min: 1000, max: 10000, base: 3000 }
};

const METAL_MULTIPLIERS = {
    gold_14k: 1.0,
    gold_18k: 1.3,
    platinum: 1.8,
    white_gold: 1.1,
    rose_gold: 1.05
};

const COMPLEXITY_MULTIPLIERS = {
    simple: 1.0,
    moderate: 1.4,
    complex: 2.0,
    exceptional: 3.0
};

const TIMELINE_MULTIPLIERS = {
    standard: 1.0,
    expedited: 1.2,
    rush: 1.4,
    flexible: 0.95
};

interface PriceCalculatorProps {
    formData: Partial<PriceFactors>;
    onEstimateUpdate?: (estimate: PriceEstimate) => void;
    showBreakdown?: boolean;
    compact?: boolean;
}

export function PriceCalculator({
    formData,
    onEstimateUpdate,
    showBreakdown = true,
    compact = false
}: PriceCalculatorProps) {
    const [showDetailedBreakdown, setShowDetailedBreakdown] = useState(false);

    // Calculate price estimate
    const priceEstimate = useMemo(() => {
        const projectType = formData.projectType || 'other';
        const metalType = formData.metalType || 'gold_14k';
        const timelinePreference = formData.timelinePreference || 'standard';

        // Get base pricing for project type
        const basePricing = BASE_PRICES[projectType as keyof typeof BASE_PRICES] || BASE_PRICES.other;

        // Determine complexity based on form data
        let complexity: PriceFactors['complexity'] = 'simple';
        if (formData.customFeatures && formData.customFeatures.length > 0) {
            complexity = formData.customFeatures.length > 3 ? 'complex' : 'moderate';
        }
        if (formData.stoneCount && formData.stoneCount > 5) {
            complexity = 'complex';
        }

        // Calculate multipliers
        const metalMultiplier = METAL_MULTIPLIERS[metalType as keyof typeof METAL_MULTIPLIERS] || 1.0;
        const complexityMultiplier = COMPLEXITY_MULTIPLIERS[complexity];
        const timelineMultiplier = TIMELINE_MULTIPLIERS[timelinePreference as keyof typeof TIMELINE_MULTIPLIERS] || 1.0;

        // Calculate costs
        const basePrice = basePricing.base;
        const metalCost = basePrice * 0.4 * metalMultiplier;
        const laborCost = basePrice * 0.3 * complexityMultiplier;
        const stoneCost = basePrice * 0.2;
        const overheadCost = basePrice * 0.1;

        const totalBaseCost = metalCost + laborCost + stoneCost + overheadCost;
        const finalCost = totalBaseCost * timelineMultiplier;

        // Calculate range
        const minPrice = Math.round(finalCost * 0.8);
        const maxPrice = Math.round(finalCost * 1.4);

        // Create breakdown
        const breakdown: PriceBreakdown[] = [
            {
                category: 'Materials',
                description: 'Precious metals and stones',
                cost: metalCost + stoneCost,
                percentage: ((metalCost + stoneCost) / finalCost) * 100
            },
            {
                category: 'Craftsmanship',
                description: 'Design and labor',
                cost: laborCost,
                percentage: (laborCost / finalCost) * 100
            },
            {
                category: 'Timeline Premium',
                description: timelinePreference === 'standard' ? 'Standard timeline' : 'Expedited service',
                cost: finalCost - totalBaseCost,
                percentage: ((finalCost - totalBaseCost) / finalCost) * 100
            }
        ];

        const estimate: PriceEstimate = {
            minPrice,
            maxPrice,
            basePrice: Math.round(finalCost),
            metalCost: Math.round(metalCost),
            stoneCost: Math.round(stoneCost),
            laborCost: Math.round(laborCost),
            complexityMultiplier,
            timelineMultiplier,
            breakdown
        };

        // Notify parent component
        if (onEstimateUpdate) {
            onEstimateUpdate(estimate);
        }

        return estimate;
    }, [formData, onEstimateUpdate]);

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(price);
    };

    if (compact) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Calculator className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        <span className="text-sm font-medium">Estimated Range</span>
                    </div>
                    <div className="text-right">
                        <div className="font-bold text-lg">
                            {formatPrice(priceEstimate.minPrice)} - {formatPrice(priceEstimate.maxPrice)}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                            Based on your selections
                        </div>
                    </div>
                </div>
            </motion.div>
        );
    }

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.6,
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm"
        >
            {/* Header */}
            <motion.div variants={itemVariants} className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-black dark:bg-white rounded-lg">
                    <Calculator className="w-5 h-5 text-white dark:text-black" />
                </div>
                <div>
                    <h3 className="text-xl font-bold">Price Estimate</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                        Based on your selections
                    </p>
                </div>
            </motion.div>

            {/* Main Price Display */}
            <motion.div
                variants={itemVariants}
                className="text-center py-8 bg-gray-50 dark:bg-gray-900 rounded-lg mb-6"
            >
                <div className="flex items-center justify-center gap-2 mb-2">
                    <TrendingUp className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Investment Range
                    </span>
                </div>

                <div className="text-4xl font-bold mb-2">
                    <span className="text-2xl">$</span>
                    {(priceEstimate.minPrice / 1000).toFixed(0)}k
                    <span className="text-2xl text-gray-400 mx-2">—</span>
                    <span className="text-2xl">$</span>
                    {(priceEstimate.maxPrice / 1000).toFixed(0)}k
                </div>

                <div className="text-sm text-gray-600 dark:text-gray-400">
                    Typical range: {formatPrice(priceEstimate.basePrice)}
                </div>
            </motion.div>

            {/* Quick Factors */}
            <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                        Complexity
                    </div>
                    <div className="font-semibold capitalize">
                        {formData.customFeatures && formData.customFeatures.length > 3 ? 'Complex' :
                            formData.customFeatures && formData.customFeatures.length > 0 ? 'Moderate' : 'Simple'}
                    </div>
                </div>

                <div className="text-center p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                        Timeline
                    </div>
                    <div className="font-semibold capitalize">
                        {formData.timelinePreference?.replace('_', ' ') || 'Standard'}
                    </div>
                </div>
            </motion.div>

            {/* Price Breakdown */}
            {showBreakdown && (
                <motion.div variants={itemVariants}>
                    <button
                        onClick={() => setShowDetailedBreakdown(!showDetailedBreakdown)}
                        className="flex items-center justify-between w-full p-3 bg-gray-50 dark:bg-gray-900 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                        <span className="font-medium">Price Breakdown</span>
                        <motion.div
                            animate={{ rotate: showDetailedBreakdown ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            ▼
                        </motion.div>
                    </button>

                    {showDetailedBreakdown && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            transition={{ duration: 0.3 }}
                            className="mt-4 space-y-3"
                        >
                            {priceEstimate.breakdown.map((item, index) => (
                                <div key={index} className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                                    <div>
                                        <div className="font-medium">{item.category}</div>
                                        <div className="text-sm text-gray-600 dark:text-gray-400">
                                            {item.description}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-medium">{formatPrice(item.cost)}</div>
                                        <div className="text-sm text-gray-600 dark:text-gray-400">
                                            {item.percentage.toFixed(0)}%
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </motion.div>
                    )}
                </motion.div>
            )}

            {/* Disclaimer */}
            <motion.div
                variants={itemVariants}
                className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800"
            >
                <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                    <div className="text-sm">
                        <div className="font-medium text-amber-800 dark:text-amber-200 mb-1">
                            Pricing Information
                        </div>
                        <div className="text-amber-700 dark:text-amber-300">
                            This is an estimate based on your specifications. Final pricing will be determined
                            during your consultation based on exact materials, design complexity, and timeline requirements.
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* CTA */}
            <motion.div variants={itemVariants} className="mt-6">
                <button className="w-full p-4 bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors font-medium flex items-center justify-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Get Exact Quote in Consultation
                </button>
            </motion.div>
        </motion.div>
    );
}

// Standalone price display component for use in forms
export function PriceDisplay({ estimate }: { estimate: PriceEstimate }) {
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(price);
    };

    return (
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-sm">
            <TrendingUp className="w-3 h-3" />
            <span className="font-medium">
                {formatPrice(estimate.minPrice)} - {formatPrice(estimate.maxPrice)}
            </span>
        </div>
    );
}

// Hook for using price calculation logic
export function usePriceCalculation(formData: Partial<PriceFactors>) {
    return useMemo(() => {
        // Same calculation logic as in PriceCalculator component
        const projectType = formData.projectType || 'other';
        const metalType = formData.metalType || 'gold_14k';
        const timelinePreference = formData.timelinePreference || 'standard';

        const basePricing = BASE_PRICES[projectType as keyof typeof BASE_PRICES] || BASE_PRICES.other;

        let complexity: PriceFactors['complexity'] = 'simple';
        if (formData.customFeatures && formData.customFeatures.length > 0) {
            complexity = formData.customFeatures.length > 3 ? 'complex' : 'moderate';
        }

        const metalMultiplier = METAL_MULTIPLIERS[metalType as keyof typeof METAL_MULTIPLIERS] || 1.0;
        const complexityMultiplier = COMPLEXITY_MULTIPLIERS[complexity];
        const timelineMultiplier = TIMELINE_MULTIPLIERS[timelinePreference as keyof typeof TIMELINE_MULTIPLIERS] || 1.0;

        const basePrice = basePricing.base;
        const finalCost = basePrice * metalMultiplier * complexityMultiplier * timelineMultiplier;

        return {
            minPrice: Math.round(finalCost * 0.8),
            maxPrice: Math.round(finalCost * 1.4),
            basePrice: Math.round(finalCost)
        };
    }, [formData]);
}