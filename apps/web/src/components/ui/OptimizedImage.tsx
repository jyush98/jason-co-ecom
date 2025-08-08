import Image from 'next/image';
import { useState, useEffect } from 'react';

// Simple utility to merge CSS classes (replaces cn)
function mergeClasses(...classes: (string | undefined | null | false)[]): string {
    return classes.filter(Boolean).join(' ');
}

interface OptimizedImageProps {
    src: string;
    alt: string;
    width?: number;
    height?: number;
    className?: string;
    priority?: boolean;
    fill?: boolean;
    sizes?: string;
    quality?: number;
    placeholder?: 'blur' | 'empty';
    blurDataURL?: string;
    loading?: 'lazy' | 'eager';
    onLoad?: () => void;
    onError?: () => void;
    // Jewelry-specific props
    variant?: 'product' | 'hero' | 'gallery' | 'thumbnail';
    aspectRatio?: 'square' | '4/3' | '16/9' | 'portrait';
}

// Generate blur placeholder for jewelry images
function generateBlurDataURL(variant: string): string {
    // Different blur patterns for different jewelry types
    const blurPatterns = {
        product: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkbHB0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSrhcdaA2kjaKiUwAbQ8dFhJo8DhJo8dKiUwAbQ8dH/Z',
        hero: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkbHB0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSrhcdaA2kjaKiUwAbQ8dFhJo8DhJo8dKiUwAbQ8dH/Z',
        gallery: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkbHB0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSrhcdaA2kjaKiUwAbQ8dFhJo8DhJo8dKiUwAbQ8dH/Z',
        thumbnail: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkbHB0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSrhcdaA2kjaKiUwAbQ8dFhJo8DhJo8dKiUwAbQ8dH/Z',
    };

    return blurPatterns[variant as keyof typeof blurPatterns] || blurPatterns.product;
}

// IMPROVED: Get optimal sizes based on variant AND aspect ratio
function getOptimalSizes(variant: string, aspectRatio?: string): string {
    // Base configurations by variant
    const baseConfigs = {
        hero: {
            square: '(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 100vw',
            '4/3': '(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 100vw',
            '16/9': '(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 100vw',
            portrait: '(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 80vw',
            default: '(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 100vw'
        },
        product: {
            square: '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 40vw',
            '4/3': '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 35vw',
            '16/9': '(max-width: 768px) 100vw, (max-width: 1200px) 60vw, 50vw',
            portrait: '(max-width: 768px) 80vw, (max-width: 1200px) 40vw, 30vw',
            default: '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
        },
        gallery: {
            square: '(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw',
            '4/3': '(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw',
            '16/9': '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 40vw',
            portrait: '(max-width: 768px) 33vw, (max-width: 1200px) 25vw, 20vw',
            default: '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
        },
        thumbnail: {
            square: '(max-width: 768px) 25vw, 150px',
            '4/3': '(max-width: 768px) 25vw, 150px',
            '16/9': '(max-width: 768px) 33vw, 200px',
            portrait: '(max-width: 768px) 20vw, 120px',
            default: '(max-width: 768px) 25vw, 150px'
        }
    };

    const variantConfig = baseConfigs[variant as keyof typeof baseConfigs];
    if (!variantConfig) return baseConfigs.product.default;

    return variantConfig[aspectRatio as keyof typeof variantConfig] || variantConfig.default;
}

// IMPROVED: Get default dimensions based on variant AND aspect ratio
function getDefaultDimensions(variant: string, aspectRatio?: string): { width: number; height: number } {
    const baseDimensions = {
        hero: { width: 1920, height: 1080 },
        product: { width: 800, height: 800 },
        gallery: { width: 1200, height: 900 },
        thumbnail: { width: 400, height: 400 },
    };

    const base = baseDimensions[variant as keyof typeof baseDimensions] || baseDimensions.product;

    // Adjust dimensions based on aspect ratio
    if (aspectRatio) {
        switch (aspectRatio) {
            case 'square':
                return { width: base.width, height: base.width };
            case '4/3':
                return { width: base.width, height: Math.round(base.width * 0.75) };
            case '16/9':
                return { width: base.width, height: Math.round(base.width * 0.5625) };
            case 'portrait':
                return { width: base.width, height: Math.round(base.width * 1.33) };
            default:
                return base;
        }
    }

    return base;
}

// Get aspect ratio classes
function getAspectRatioClass(aspectRatio?: string): string {
    const ratioClasses = {
        square: 'aspect-square',
        '4/3': 'aspect-[4/3]',
        '16/9': 'aspect-video',
        portrait: 'aspect-[3/4]',
    };

    return ratioClasses[aspectRatio as keyof typeof ratioClasses] || '';
}

export function OptimizedImage({
    src,
    alt,
    width,
    height,
    className,
    priority = false,
    fill = false,
    sizes,
    quality = 80,
    placeholder = 'blur',
    blurDataURL,
    loading = 'lazy',
    onLoad,
    onError,
    variant = 'product',
    aspectRatio,
    ...props
}: OptimizedImageProps) {
    const [imageError, setImageError] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);

    // IMPROVED: Get default dimensions considering aspect ratio
    const defaultDimensions = getDefaultDimensions(variant, aspectRatio);
    const finalWidth = width || defaultDimensions.width;
    const finalHeight = height || defaultDimensions.height;

    // Auto-generate blur placeholder if not provided
    const autoBlurDataURL = blurDataURL || generateBlurDataURL(variant);

    // IMPROVED: Auto-generate sizes considering aspect ratio
    const autoSizes = sizes || getOptimalSizes(variant, aspectRatio);

    // Get aspect ratio class
    const aspectClass = getAspectRatioClass(aspectRatio);

    const handleLoad = () => {
        setImageLoaded(true);
        onLoad?.();
    };

    const handleError = () => {
        setImageError(true);
        onError?.();
    };

    // Fallback image for jewelry
    const fallbackSrc = '/images/jewelry-placeholder.jpg';

    if (imageError) {
        return (
            <div
                className={mergeClasses(
                    'flex items-center justify-center bg-gray-100 text-gray-400',
                    aspectClass,
                    className
                )}
            >
                <span className="text-sm">Image unavailable</span>
            </div>
        );
    }

    return (
        <div className={mergeClasses('relative overflow-hidden', aspectClass, className)}>
            <Image
                src={imageError ? fallbackSrc : src}
                alt={alt}
                width={fill ? undefined : finalWidth}
                height={fill ? undefined : finalHeight}
                fill={fill}
                priority={priority}
                sizes={autoSizes}
                quality={quality}
                placeholder={placeholder}
                blurDataURL={placeholder === 'blur' ? autoBlurDataURL : undefined}
                loading={priority ? 'eager' : loading}
                onLoad={handleLoad}
                onError={handleError}
                className={mergeClasses(
                    'object-cover transition-opacity duration-300',
                    imageLoaded ? 'opacity-100' : 'opacity-0',
                    fill ? 'absolute inset-0' : 'w-full h-full'
                )}
                {...props}
            />

            {/* Loading overlay */}
            {!imageLoaded && !imageError && (
                <div className="absolute inset-0 bg-gray-100 animate-pulse flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                </div>
            )}
        </div>
    );
}

// IMPROVED: Preset configurations with optimized aspect ratios
export const JewelryImage = {
    Hero: (props: Omit<OptimizedImageProps, 'variant' | 'priority'>) => (
        <OptimizedImage
            {...props}
            variant="hero"
            priority={true}
            aspectRatio={props.aspectRatio || '16/9'}
        />
    ),

    Product: (props: Omit<OptimizedImageProps, 'variant'>) => (
        <OptimizedImage
            {...props}
            variant="product"
            aspectRatio={props.aspectRatio || 'square'}
        />
    ),

    Gallery: (props: Omit<OptimizedImageProps, 'variant'>) => (
        <OptimizedImage
            {...props}
            variant="gallery"
            aspectRatio={props.aspectRatio || '4/3'}
        />
    ),

    Thumbnail: (props: Omit<OptimizedImageProps, 'variant'>) => (
        <OptimizedImage
            {...props}
            variant="thumbnail"
            aspectRatio={props.aspectRatio || 'square'}
        />
    ),
};

// Hook for progressive image loading
export function useProgressiveImage(src: string, lowQualitySrc?: string) {
    const [imgSrc, setImgSrc] = useState(lowQualitySrc || src);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const img = new window.Image();
        img.src = src;
        img.onload = () => {
            setImgSrc(src);
            setLoading(false);
        };
    }, [src]);

    return { src: imgSrc, loading };
}