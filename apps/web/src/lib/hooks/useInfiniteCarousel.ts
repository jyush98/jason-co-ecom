import { useState, useEffect, useCallback } from 'react';
import { UseInfiniteCarouselOptions, UseInfiniteCarouselReturn } from '@/types/home';

/**
 * Custom hook for infinite carousel functionality
 * Provides cycling navigation with autoplay support
 */
export const useInfiniteCarousel = ({
  itemCount,
  autoplay = false,
  autoplayInterval = 5000,
  onSlideChange
}: UseInfiniteCarouselOptions): UseInfiniteCarouselReturn => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoplayActive, setIsAutoplayActive] = useState(autoplay);

  // Infinite cycling navigation
  const goLeft = useCallback(() => {
    const newIndex = (currentIndex - 1 + itemCount) % itemCount;
    setCurrentIndex(newIndex);
    setIsAutoplayActive(false); // Stop autoplay on manual interaction
    onSlideChange?.(newIndex);
  }, [currentIndex, itemCount, onSlideChange]);

  const goRight = useCallback(() => {
    const newIndex = (currentIndex + 1) % itemCount;
    setCurrentIndex(newIndex);
    setIsAutoplayActive(false); // Stop autoplay on manual interaction
    onSlideChange?.(newIndex);
  }, [currentIndex, itemCount, onSlideChange]);

  const goToSlide = useCallback((index: number) => {
    const validIndex = Math.max(0, Math.min(index, itemCount - 1));
    setCurrentIndex(validIndex);
    setIsAutoplayActive(false); // Stop autoplay on manual interaction
    onSlideChange?.(validIndex);
  }, [itemCount, onSlideChange]);

  const setAutoplay = useCallback((active: boolean) => {
    setIsAutoplayActive(active);
  }, []);

  // Autoplay functionality
  useEffect(() => {
    if (!isAutoplayActive || itemCount <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % itemCount);
    }, autoplayInterval);

    return () => clearInterval(interval);
  }, [isAutoplayActive, itemCount, autoplayInterval]);

  return {
    currentIndex,
    goLeft,
    goRight,
    goToSlide,
    setAutoplay
  };
};

/**
 * Hook for responsive carousel settings
 * Manages breakpoint-based configuration
 */
export const useResponsiveCarousel = () => {
  const [settings, setSettings] = useState({
    slidesToShow: 4,
    slideWidth: 300
  });

  useEffect(() => {
    const updateSettings = () => {
      if (window.innerWidth >= 1024) {
        setSettings({ slidesToShow: 4, slideWidth: 300 });
      } else if (window.innerWidth >= 768) {
        setSettings({ slidesToShow: 3, slideWidth: 250 });
      } else if (window.innerWidth >= 480) {
        setSettings({ slidesToShow: 2, slideWidth: 200 });
      } else {
        setSettings({ slidesToShow: 1, slideWidth: 280 });
      }
    };

    updateSettings();
    window.addEventListener('resize', updateSettings);
    return () => window.removeEventListener('resize', updateSettings);
  }, []);

  return settings;
};