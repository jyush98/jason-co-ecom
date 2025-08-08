"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
    Loader2,
    RefreshCw,
    RotateCcw,
    Database,
    Download,
    Upload,
    Search,
    TrendingUp
} from "lucide-react";

export interface LoadingSpinnerProps {
    // Basic configuration
    isLoading?: boolean;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    variant?: 'default' | 'dots' | 'pulse' | 'bars' | 'circle' | 'custom';
    color?: 'primary' | 'gold' | 'blue' | 'green' | 'red' | 'gray';

    // Content and messaging
    message?: string;
    submessage?: string;
    showMessage?: boolean;
    icon?: React.ReactNode;

    // Layout and positioning
    overlay?: boolean;
    fullScreen?: boolean;
    center?: boolean;
    inline?: boolean;
    className?: string;

    // Animation customization
    speed?: 'slow' | 'normal' | 'fast';
    direction?: 'clockwise' | 'counterclockwise';

    // Progress indication
    progress?: number; // 0-100
    showProgress?: boolean;

    // Business context
    context?: 'loading' | 'saving' | 'uploading' | 'downloading' | 'searching' | 'processing' | 'analyzing';
}

const contextIcons = {
    loading: <Database size={20} />,
    saving: <RotateCcw size={20} />,
    uploading: <Upload size={20} />,
    downloading: <Download size={20} />,
    searching: <Search size={20} />,
    processing: <RefreshCw size={20} />,
    analyzing: <TrendingUp size={20} />
};

const contextMessages = {
    loading: 'Loading data...',
    saving: 'Saving changes...',
    uploading: 'Uploading files...',
    downloading: 'Preparing download...',
    searching: 'Searching...',
    processing: 'Processing...',
    analyzing: 'Analyzing data...'
};

const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
};

const colorClasses = {
    primary: 'text-gray-600 dark:text-gray-300',
    gold: 'text-gold',
    blue: 'text-blue-500',
    green: 'text-green-500',
    red: 'text-red-500',
    gray: 'text-gray-400'
};

const speedClasses = {
    slow: 'animate-spin duration-2000',
    normal: 'animate-spin duration-1000',
    fast: 'animate-spin duration-500'
};

export default function LoadingSpinner({
    isLoading = true,
    size = 'md',
    variant = 'default',
    color = 'primary',
    message,
    submessage,
    showMessage = true,
    icon,
    overlay = false,
    fullScreen = false,
    center = true,
    inline = false,
    className = "",
    speed = 'normal',
    direction = 'clockwise',
    progress,
    showProgress = false,
    context
}: LoadingSpinnerProps) {

    const displayMessage = message || (context ? contextMessages[context] : 'Loading...');
    const displayIcon = icon || (context ? contextIcons[context] : <Loader2 size={20} />);

    const getAnimationClass = () => {
        if (variant === 'custom') return '';

        const duration = speed === 'slow' ? 'duration-2000' : speed === 'fast' ? 'duration-500' : 'duration-1000';
        const rotation = direction === 'counterclockwise' ? 'animate-reverse-spin' : 'animate-spin';

        return `${rotation} ${duration}`;
    };

    const renderSpinner = () => {
        const sizeClass = sizeClasses[size];
        const colorClass = colorClasses[color];
        const animationClass = getAnimationClass();

        switch (variant) {
            case 'dots':
                return <DotsSpinner size={size} color={color} speed={speed} />;

            case 'pulse':
                return <PulseSpinner size={size} color={color} speed={speed} />;

            case 'bars':
                return <BarsSpinner size={size} color={color} speed={speed} />;

            case 'circle':
                return <CircleSpinner size={size} color={color} speed={speed} />;

            case 'custom':
                return (
                    <motion.div
                        className={`${sizeClass} ${colorClass}`}
                        animate={{ rotate: direction === 'clockwise' ? 360 : -360 }}
                        transition={{
                            duration: speed === 'slow' ? 2 : speed === 'fast' ? 0.5 : 1,
                            repeat: Infinity,
                            ease: "linear"
                        }}
                    >
                        {displayIcon}
                    </motion.div>
                );

            default:
                return (
                    <div className={`${sizeClass} ${colorClass} ${animationClass}`}>
                        <Loader2 className="w-full h-full" />
                    </div>
                );
        }
    };

    const renderContent = () => (
        <div className={`flex flex-col items-center ${inline ? 'flex-row gap-3' : 'gap-3'}`}>
            {/* Spinner */}
            <div className="relative">
                {renderSpinner()}

                {/* Progress Ring */}
                {showProgress && progress !== undefined && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                            <path
                                className="stroke-gray-200 dark:stroke-gray-700"
                                strokeWidth="3"
                                fill="none"
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                            <motion.path
                                className="stroke-gold"
                                strokeWidth="3"
                                strokeLinecap="round"
                                fill="none"
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                initial={{ strokeDasharray: "0 100" }}
                                animate={{ strokeDasharray: `${progress} 100` }}
                                transition={{ duration: 0.5, ease: "easeInOut" }}
                            />
                        </svg>
                    </div>
                )}
            </div>

            {/* Message */}
            {showMessage && !inline && (
                <div className="text-center space-y-1">
                    {displayMessage && (
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {displayMessage}
                        </p>
                    )}
                    {submessage && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            {submessage}
                        </p>
                    )}
                    {showProgress && progress !== undefined && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            {Math.round(progress)}% complete
                        </p>
                    )}
                </div>
            )}

            {/* Inline Message */}
            {showMessage && inline && displayMessage && (
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {displayMessage}
                </span>
            )}
        </div>
    );

    if (!isLoading) {
        return null;
    }

    // Full screen overlay
    if (fullScreen) {
        return (
            <AnimatePresence>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 bg-white/80 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center"
                >
                    {renderContent()}
                </motion.div>
            </AnimatePresence>
        );
    }

    // Overlay
    if (overlay) {
        return (
            <AnimatePresence>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-40 bg-white/60 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center rounded-lg"
                >
                    {renderContent()}
                </motion.div>
            </AnimatePresence>
        );
    }

    // Centered
    if (center) {
        return (
            <div className={`flex items-center justify-center p-8 ${className}`}>
                {renderContent()}
            </div>
        );
    }

    // Default/inline
    return (
        <div className={className}>
            {renderContent()}
        </div>
    );
}

// Dots Spinner Component
function DotsSpinner({
    size,
    color,
    speed
}: {
    size: LoadingSpinnerProps['size'];
    color: LoadingSpinnerProps['color'];
    speed: LoadingSpinnerProps['speed'];
}) {
    const dotSize = size === 'xs' ? 'w-1 h-1' :
        size === 'sm' ? 'w-1.5 h-1.5' :
            size === 'md' ? 'w-2 h-2' :
                size === 'lg' ? 'w-3 h-3' : 'w-4 h-4';

    const colorClass = colorClasses[color || 'primary'];
    const duration = speed === 'slow' ? 1.4 : speed === 'fast' ? 0.6 : 1.0;

    return (
        <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
                <motion.div
                    key={i}
                    className={`${dotSize} ${colorClass} bg-current rounded-full`}
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.7, 1, 0.7]
                    }}
                    transition={{
                        duration,
                        repeat: Infinity,
                        delay: i * 0.2
                    }}
                />
            ))}
        </div>
    );
}

// Pulse Spinner Component
function PulseSpinner({
    size,
    color,
    speed
}: {
    size: LoadingSpinnerProps['size'];
    color: LoadingSpinnerProps['color'];
    speed: LoadingSpinnerProps['speed'];
}) {
    const sizeClass = sizeClasses[size || 'md'];
    const colorClass = colorClasses[color || 'primary'];
    const duration = speed === 'slow' ? 2 : speed === 'fast' ? 0.8 : 1.2;

    return (
        <motion.div
            className={`${sizeClass} ${colorClass} bg-current rounded-full`}
            animate={{
                scale: [1, 1.3, 1],
                opacity: [1, 0.3, 1]
            }}
            transition={{
                duration,
                repeat: Infinity,
                ease: "easeInOut"
            }}
        />
    );
}

// Bars Spinner Component
function BarsSpinner({
    size,
    color,
    speed
}: {
    size: LoadingSpinnerProps['size'];
    color: LoadingSpinnerProps['color'];
    speed: LoadingSpinnerProps['speed'];
}) {
    const barHeight = size === 'xs' ? 'h-3' :
        size === 'sm' ? 'h-4' :
            size === 'md' ? 'h-6' :
                size === 'lg' ? 'h-8' : 'h-12';

    const barWidth = 'w-0.5';
    const colorClass = colorClasses[color || 'primary'];
    const duration = speed === 'slow' ? 1.2 : speed === 'fast' ? 0.6 : 0.8;

    return (
        <div className="flex items-end gap-0.5">
            {[0, 1, 2, 3, 4].map((i) => (
                <motion.div
                    key={i}
                    className={`${barWidth} ${barHeight} ${colorClass} bg-current`}
                    animate={{
                        scaleY: [1, 0.4, 1]
                    }}
                    transition={{
                        duration,
                        repeat: Infinity,
                        delay: i * 0.1
                    }}
                />
            ))}
        </div>
    );
}

// Circle Spinner Component
function CircleSpinner({
    size,
    color,
    speed
}: {
    size: LoadingSpinnerProps['size'];
    color: LoadingSpinnerProps['color'];
    speed: LoadingSpinnerProps['speed'];
}) {
    const sizeClass = sizeClasses[size || 'md'];
    const colorClass = colorClasses[color || 'primary'];
    const duration = speed === 'slow' ? 2 : speed === 'fast' ? 0.8 : 1.2;

    return (
        <div className={`${sizeClass} relative`}>
            <motion.div
                className={`w-full h-full border-2 border-transparent border-t-current ${colorClass} rounded-full`}
                animate={{ rotate: 360 }}
                transition={{
                    duration,
                    repeat: Infinity,
                    ease: "linear"
                }}
            />
        </div>
    );
}

// Skeleton Loader Component (bonus utility)
export function SkeletonLoader({
    lines = 3,
    height = 'h-4',
    className = ""
}: {
    lines?: number;
    height?: string;
    className?: string;
}) {
    return (
        <div className={`space-y-3 ${className}`}>
            {Array.from({ length: lines }).map((_, i) => (
                <motion.div
                    key={i}
                    className={`${height} bg-gray-200 dark:bg-gray-700 rounded`}
                    style={{ width: `${Math.random() * 40 + 60}%` }}
                    animate={{
                        opacity: [0.5, 1, 0.5]
                    }}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        delay: i * 0.2
                    }}
                />
            ))}
        </div>
    );
}

// Table Skeleton Component (bonus utility)
export function TableSkeleton({
    rows = 5,
    columns = 4,
    className = ""
}: {
    rows?: number;
    columns?: number;
    className?: string;
}) {
    return (
        <div className={`space-y-4 ${className}`}>
            {/* Header */}
            <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
                {Array.from({ length: columns }).map((_, i) => (
                    <div key={`header-${i}`} className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                ))}
            </div>

            {/* Rows */}
            {Array.from({ length: rows }).map((_, rowIndex) => (
                <div key={rowIndex} className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
                    {Array.from({ length: columns }).map((_, colIndex) => (
                        <motion.div
                            key={`cell-${rowIndex}-${colIndex}`}
                            className="h-4 bg-gray-200 dark:bg-gray-700 rounded"
                            animate={{
                                opacity: [0.5, 1, 0.5]
                            }}
                            transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                delay: (rowIndex * columns + colIndex) * 0.1
                            }}
                        />
                    ))}
                </div>
            ))}
        </div>
    );
}

// Button Loading State Component (bonus utility)
export function ButtonLoading({
    children,
    isLoading = false,
    loadingText = "Loading...",
    size = 'md',
    className = ""
}: {
    children: React.ReactNode;
    isLoading?: boolean;
    loadingText?: string;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}) {
    const spinnerSize = size === 'sm' ? 'xs' : size === 'lg' ? 'md' : 'sm';

    return (
        <span className={`flex items-center justify-center gap-2 ${className}`}>
            <AnimatePresence mode="wait">
                {isLoading ? (
                    <motion.span
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-2"
                    >
                        <LoadingSpinner size={spinnerSize} variant="default" inline showMessage={false} />
                        {loadingText}
                    </motion.span>
                ) : (
                    <motion.span
                        key="content"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        {children}
                    </motion.span>
                )}
            </AnimatePresence>
        </span>
    );
}
