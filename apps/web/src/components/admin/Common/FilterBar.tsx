"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Search,
    X,
    Calendar,
    ChevronDown,
    RotateCcw,
    Download,
    SlidersHorizontal
} from "lucide-react";

// Types for different filter configurations
export interface FilterOption {
    label: string;
    value: string | number;
    count?: number;
    color?: string;
}

export interface FilterConfig {
    key: string;
    label: string;
    type: 'select' | 'multiselect' | 'date' | 'daterange' | 'number' | 'text' | 'boolean';
    options?: FilterOption[];
    placeholder?: string;
    icon?: React.ReactNode;
    min?: number;
    max?: number;
    step?: number;
}

export interface FilterValue {
    [key: string]: any;
}

export interface FilterBarProps {
    // Configuration
    configs: FilterConfig[];
    searchPlaceholder?: string;
    searchKeys?: string[]; // Keys to search within objects
    className?: string;

    // Data and filtering
    onFiltersChange: (filters: FilterValue, searchTerm: string) => void;
    onExport?: () => void;

    // Quick filters
    quickFilters?: {
        label: string;
        filters: FilterValue;
        icon?: React.ReactNode;
    }[];

    // State management
    initialFilters?: FilterValue;
    persistFilters?: boolean; // Save to localStorage
    storageKey?: string;

    // UI customization
    showExport?: boolean;
    showClearAll?: boolean;
    compactMode?: boolean;
    maxVisibleFilters?: number;
}

export default function FilterBar({
    configs,
    searchPlaceholder = "Search...",
    // searchKeys = [],
    className = "",
    onFiltersChange,
    onExport,
    quickFilters = [],
    initialFilters = {},
    persistFilters = false,
    storageKey = "admin-filters",
    showExport = true,
    showClearAll = true,
    compactMode = false,
    maxVisibleFilters = 6
}: FilterBarProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [filters, setFilters] = useState<FilterValue>(initialFilters);
    const [isExpanded, setIsExpanded] = useState(false);
    const [openDropdowns, setOpenDropdowns] = useState<Set<string>>(new Set());

    // Load filters from localStorage on mount
    useEffect(() => {
        if (persistFilters && storageKey) {
            const saved = localStorage.getItem(storageKey);
            if (saved) {
                try {
                    const parsedFilters = JSON.parse(saved);
                    setFilters(parsedFilters);
                } catch (error) {
                    console.warn('Failed to parse saved filters:', error);
                }
            }
        }
    }, [persistFilters, storageKey]);

    // Save filters to localStorage when they change
    useEffect(() => {
        if (persistFilters && storageKey) {
            localStorage.setItem(storageKey, JSON.stringify(filters));
        }
    }, [filters, persistFilters, storageKey]);

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            onFiltersChange(filters, searchTerm);
        }, 300);

        return () => clearTimeout(timer);
    }, [searchTerm, filters, onFiltersChange]);

    // Get active filter count
    const activeFilterCount = useMemo(() => {
        return Object.values(filters).filter(value => {
            if (Array.isArray(value)) return value.length > 0;
            if (typeof value === 'string') return value.trim() !== '';
            if (typeof value === 'number') return value !== 0;
            if (typeof value === 'boolean') return value;
            if (value && typeof value === 'object') {
                return Object.values(value).some(v => v !== '' && v !== null && v !== undefined);
            }
            return false;
        }).length;
    }, [filters]);

    const handleFilterChange = useCallback((key: string, value: any) => {
        setFilters(prev => ({
            ...prev,
            [key]: value
        }));
    }, []);

    const handleQuickFilter = useCallback((quickFilterValue: FilterValue) => {
        setFilters(quickFilterValue);
        setSearchTerm("");
    }, []);

    const clearAllFilters = useCallback(() => {
        setFilters({});
        setSearchTerm("");
        setOpenDropdowns(new Set());
    }, []);

    const toggleDropdown = useCallback((key: string) => {
        setOpenDropdowns(prev => {
            const newSet = new Set(prev);
            if (newSet.has(key)) {
                newSet.delete(key);
            } else {
                newSet.add(key);
            }
            return newSet;
        });
    }, []);

    // Determine visible and hidden configs
    const visibleConfigs = configs.slice(0, maxVisibleFilters);
    const hiddenConfigs = configs.slice(maxVisibleFilters);
    const showMoreButton = hiddenConfigs.length > 0;

    const containerVariants = {
        hidden: { opacity: 0, y: -10 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.3,
                staggerChildren: 0.05
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, scale: 0.95 },
        visible: { opacity: 1, scale: 1 }
    };

    return (
        <motion.div
            className={`bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-4 ${className}`}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {/* Top Row - Search and Quick Actions */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                {/* Search Input */}
                <motion.div variants={itemVariants} className="relative flex-1 max-w-md">
                    <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder={searchPlaceholder}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent transition-all duration-200"
                    />
                    {searchTerm && (
                        <button
                            onClick={() => setSearchTerm("")}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                            <X size={16} />
                        </button>
                    )}
                </motion.div>

                {/* Action Buttons */}
                <motion.div variants={itemVariants} className="flex items-center gap-2">
                    {/* Active Filter Count */}
                    {activeFilterCount > 0 && (
                        <span className="px-2 py-1 bg-gold/10 text-gold text-sm font-medium rounded-full">
                            {activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''}
                        </span>
                    )}

                    {/* More Filters Toggle */}
                    {showMoreButton && (
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="flex items-center gap-2 px-3 py-2 text-gray-600 dark:text-gray-300 hover:text-gold border border-gray-300 dark:border-gray-600 rounded-lg hover:border-gold transition-all duration-200"
                        >
                            <SlidersHorizontal size={16} />
                            <span className="text-sm">More</span>
                            <ChevronDown
                                size={16}
                                className={`transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''
                                    }`}
                            />
                        </button>
                    )}

                    {/* Clear All */}
                    {showClearAll && activeFilterCount > 0 && (
                        <button
                            onClick={clearAllFilters}
                            className="flex items-center gap-2 px-3 py-2 text-gray-600 dark:text-gray-300 hover:text-red-600 border border-gray-300 dark:border-gray-600 rounded-lg hover:border-red-300 transition-all duration-200"
                        >
                            <RotateCcw size={16} />
                            <span className="text-sm">Clear</span>
                        </button>
                    )}

                    {/* Export Button */}
                    {showExport && onExport && (
                        <button
                            onClick={onExport}
                            className="flex items-center gap-2 px-3 py-2 bg-gold hover:bg-gold/90 text-black font-medium rounded-lg transition-all duration-200"
                        >
                            <Download size={16} />
                            <span className="text-sm">Export</span>
                        </button>
                    )}
                </motion.div>
            </div>

            {/* Quick Filters */}
            {quickFilters.length > 0 && (
                <motion.div variants={itemVariants} className="flex flex-wrap gap-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400 font-medium px-2 py-1">
                        Quick Filters:
                    </span>
                    {quickFilters.map((quickFilter, index) => (
                        <button
                            key={index}
                            onClick={() => handleQuickFilter(quickFilter.filters)}
                            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-800 hover:bg-gold/10 hover:text-gold border border-gray-200 dark:border-gray-700 rounded-md transition-all duration-200"
                        >
                            {quickFilter.icon}
                            {quickFilter.label}
                        </button>
                    ))}
                </motion.div>
            )}

            {/* Filter Controls */}
            <div className="space-y-4">
                {/* Always Visible Filters */}
                {visibleConfigs.length > 0 && (
                    <motion.div
                        variants={itemVariants}
                        className={`grid gap-3 ${compactMode
                                ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'
                                : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                            }`}
                    >
                        {visibleConfigs.map((config) => (
                            <FilterControl
                                key={config.key}
                                config={config}
                                value={filters[config.key]}
                                onChange={(value) => handleFilterChange(config.key, value)}
                                isOpen={openDropdowns.has(config.key)}
                                onToggle={() => toggleDropdown(config.key)}
                                compact={compactMode}
                            />
                        ))}
                    </motion.div>
                )}

                {/* Expandable Additional Filters */}
                <AnimatePresence>
                    {isExpanded && hiddenConfigs.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                        >
                            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                                <div className={`grid gap-3 ${compactMode
                                        ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'
                                        : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                                    }`}>
                                    {hiddenConfigs.map((config) => (
                                        <FilterControl
                                            key={config.key}
                                            config={config}
                                            value={filters[config.key]}
                                            onChange={(value) => handleFilterChange(config.key, value)}
                                            isOpen={openDropdowns.has(config.key)}
                                            onToggle={() => toggleDropdown(config.key)}
                                            compact={compactMode}
                                        />
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}

// Individual Filter Control Component
interface FilterControlProps {
    config: FilterConfig;
    value: any;
    onChange: (value: any) => void;
    isOpen: boolean;
    onToggle: () => void;
    compact: boolean;
}

function FilterControl({ config, value, onChange, isOpen, onToggle, compact }: FilterControlProps) {
    const hasValue = useMemo(() => {
        if (Array.isArray(value)) return value.length > 0;
        if (typeof value === 'string') return value.trim() !== '';
        if (typeof value === 'number') return value !== 0;
        if (typeof value === 'boolean') return value;
        if (value && typeof value === 'object') {
            return Object.values(value).some(v => v !== '' && v !== null && v !== undefined);
        }
        return false;
    }, [value]);

    const renderControl = () => {
        switch (config.type) {
            case 'select':
            case 'multiselect':
                return (
                    <div className="relative">
                        <button
                            onClick={onToggle}
                            className={`w-full flex items-center justify-between px-3 py-2 border rounded-lg text-left transition-all duration-200 ${hasValue
                                    ? 'border-gold bg-gold/5 text-gold'
                                    : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-gold'
                                } ${compact ? 'text-sm' : ''}`}
                        >
                            <span className="flex items-center gap-2">
                                {config.icon}
                                <span className="truncate">
                                    {hasValue
                                        ? Array.isArray(value)
                                            ? `${value.length} selected`
                                            : config.options?.find(opt => opt.value === value)?.label || value
                                        : config.placeholder || config.label
                                    }
                                </span>
                            </span>
                            <ChevronDown
                                size={16}
                                className={`transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''
                                    }`}
                            />
                        </button>

                        <AnimatePresence>
                            {isOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                    transition={{ duration: 0.2 }}
                                    className="absolute top-full left-0 right-0 z-50 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl max-h-60 overflow-y-auto"
                                >
                                    {config.options?.map((option) => (
                                        <label
                                            key={option.value}
                                            className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                                        >
                                            <input
                                                type={config.type === 'multiselect' ? 'checkbox' : 'radio'}
                                                name={config.key}
                                                checked={
                                                    config.type === 'multiselect'
                                                        ? Array.isArray(value) && value.includes(option.value)
                                                        : value === option.value
                                                }
                                                onChange={(e) => {
                                                    if (config.type === 'multiselect') {
                                                        const currentValues = Array.isArray(value) ? value : [];
                                                        if (e.target.checked) {
                                                            onChange([...currentValues, option.value]);
                                                        } else {
                                                            onChange(currentValues.filter(v => v !== option.value));
                                                        }
                                                    } else {
                                                        onChange(e.target.checked ? option.value : '');
                                                    }
                                                }}
                                                className="w-4 h-4 text-gold border-gray-300 rounded focus:ring-gold"
                                            />
                                            <span className="flex-1 text-sm">{option.label}</span>
                                            {option.count !== undefined && (
                                                <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
                                                    {option.count}
                                                </span>
                                            )}
                                        </label>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                );

            case 'date':
                return (
                    <div className="relative">
                        <Calendar size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="date"
                            value={value || ''}
                            onChange={(e) => onChange(e.target.value)}
                            className={`w-full pl-10 pr-3 py-2 border rounded-lg transition-all duration-200 ${hasValue
                                    ? 'border-gold bg-gold/5 text-gold'
                                    : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
                                } ${compact ? 'text-sm' : ''}`}
                        />
                    </div>
                );

            case 'daterange':
                return (
                    <div className="flex gap-2">
                        <input
                            type="date"
                            value={value?.start || ''}
                            onChange={(e) => onChange({ ...value, start: e.target.value })}
                            placeholder="Start date"
                            className={`flex-1 px-3 py-2 border rounded-lg transition-all duration-200 ${hasValue
                                    ? 'border-gold bg-gold/5'
                                    : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
                                } ${compact ? 'text-sm' : ''}`}
                        />
                        <input
                            type="date"
                            value={value?.end || ''}
                            onChange={(e) => onChange({ ...value, end: e.target.value })}
                            placeholder="End date"
                            className={`flex-1 px-3 py-2 border rounded-lg transition-all duration-200 ${hasValue
                                    ? 'border-gold bg-gold/5'
                                    : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
                                } ${compact ? 'text-sm' : ''}`}
                        />
                    </div>
                );

            case 'number':
                return (
                    <div className="relative">
                        {config.icon && (
                            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                                {config.icon}
                            </div>
                        )}
                        <input
                            type="number"
                            value={value || ''}
                            onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
                            placeholder={config.placeholder}
                            min={config.min}
                            max={config.max}
                            step={config.step}
                            className={`w-full ${config.icon ? 'pl-10' : 'pl-3'} pr-3 py-2 border rounded-lg transition-all duration-200 ${hasValue
                                    ? 'border-gold bg-gold/5'
                                    : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
                                } ${compact ? 'text-sm' : ''}`}
                        />
                    </div>
                );

            case 'boolean':
                return (
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={!!value}
                            onChange={(e) => onChange(e.target.checked)}
                            className="w-4 h-4 text-gold border-gray-300 rounded focus:ring-gold"
                        />
                        <span className={`${compact ? 'text-sm' : ''}`}>{config.label}</span>
                    </label>
                );

            default:
                return (
                    <div className="relative">
                        {config.icon && (
                            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                                {config.icon}
                            </div>
                        )}
                        <input
                            type="text"
                            value={value || ''}
                            onChange={(e) => onChange(e.target.value)}
                            placeholder={config.placeholder}
                            className={`w-full ${config.icon ? 'pl-10' : 'pl-3'} pr-3 py-2 border rounded-lg transition-all duration-200 ${hasValue
                                    ? 'border-gold bg-gold/5'
                                    : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
                                } ${compact ? 'text-sm' : ''}`}
                        />
                    </div>
                );
        }
    };

    return (
        <div className="space-y-1">
            {config.type !== 'boolean' && (
                <label className={`block font-medium text-gray-700 dark:text-gray-300 ${compact ? 'text-xs' : 'text-sm'
                    }`}>
                    {config.label}
                </label>
            )}
            {renderControl()}
        </div>
    );
}