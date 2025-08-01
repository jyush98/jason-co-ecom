import { motion, useTransform, MotionValue } from "framer-motion";
import { useState } from "react";
import { JewelryImage } from "@/components/ui/OptimizedImage";
import { useGA4LuxuryEvents } from '@/lib/hooks/useGA4';

interface ScrollGalleryItemProps {
  item: {
    id: string;
    title: string;
    description: string;
    largeImage: string;
    objectPosition?: string;
    collection: string;
    category: string;
  };
  index: number;
  globalIndex: number;
  totalItems: number;
  extendedProgress: MotionValue<number>;
  cycleIndex: number;
}

export default function ScrollGalleryItem({
  item,
  index,
  globalIndex,
  totalItems,
  extendedProgress,
  cycleIndex
}: ScrollGalleryItemProps) {
  const { trackGalleryEngagement } = useGA4LuxuryEvents();
  const [viewStartTime, setViewStartTime] = useState<number | null>(null);

  // Calculate the position of this item in the extended scroll
  const itemPosition = globalIndex;

  // Create smooth horizontal movement with longer transition zones
  const x = useTransform(
    extendedProgress,
    [
      itemPosition - 1,     // Start entering from right (earlier)
      itemPosition - 0.2,   // Almost centered
      itemPosition + 0.2,   // Still centered
      itemPosition + 1      // Fully exited left (later)
    ],
    [
      "100vw",   // Start off-screen right
      "0vw",     // Centered
      "0vw",     // Stay centered
      "-100vw"   // Exit off-screen left
    ]
  );

  // Overlapping opacity transitions for smooth crossfade
  const opacity = useTransform(
    extendedProgress,
    [
      itemPosition - 0.8,   // Start fading in earlier
      itemPosition - 0.3,   // Fully visible
      itemPosition + 0.3,   // Still fully visible
      itemPosition + 0.8    // Fade out later
    ],
    [0, 1, 1, 0]
  );

  // Subtle scale effect with longer transitions
  const scale = useTransform(
    extendedProgress,
    [
      itemPosition - 0.6,
      itemPosition - 0.1,
      itemPosition + 0.1,
      itemPosition + 0.6
    ],
    [0.9, 1, 1, 0.9]
  );

  // Enhanced rotation for more dynamic crossfading
  const rotateY = useTransform(
    extendedProgress,
    [
      itemPosition - 0.8,
      itemPosition - 0.4,
      itemPosition,
      itemPosition + 0.4,
      itemPosition + 0.8
    ],
    [10, 3, 0, -3, -10]
  );

  // Track gallery engagement
  const handleImageView = () => {
    setViewStartTime(Date.now());
    trackGalleryEngagement('image_view', item.title);
  };

  const handleImageExit = () => {
    if (viewStartTime) {
      const timeSpent = Date.now() - viewStartTime;
      if (timeSpent > 3000) { // Only track if viewed for 3+ seconds
        trackGalleryEngagement('image_engagement', item.title, timeSpent);
      }
    }
  };

  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center"
      style={{
        x,
        opacity,
        scale,
        rotateY,
        transformStyle: "preserve-3d"
      }}
      onMouseEnter={handleImageView}
      onMouseLeave={handleImageExit}
    >
      {/* Jewelry piece container - responsive sizing */}
      <div className="relative w-full h-full max-w-4xl flex md:items-center justify-center px-4 md:px-0">
        {/* Main jewelry image - 80% height on mobile, top-aligned */}
        <div className="relative w-full h-[80%] md:h-full flex items-start md:items-center justify-center">
          <div className="relative w-full h-full max-w-sm md:max-w-none">
            {/* Optimized Gallery Image */}
            <div
              className="relative w-full h-full"
              style={{
                objectPosition: item.objectPosition || "center top",
                filter: "drop-shadow(0 25px 50px rgba(0, 0, 0, 0.3))"
              }}
            >
              <JewelryImage.Gallery
                src={item.largeImage}
                alt={item.title}
                priority={cycleIndex === 1 && index < 2} // Prioritize middle cycle, first items
                className="object-contain h-full w-full"
              />
            </div>

            {/* Enhanced glow effect */}
            <motion.div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: "radial-gradient(circle at center, rgba(212, 175, 55, 0.15) 0%, transparent 60%)",
                opacity: useTransform(
                  extendedProgress,
                  [itemPosition - 0.5, itemPosition, itemPosition + 0.5],
                  [0.3, 0.8, 0.3]
                )
              }}
            />
          </div>
        </div>

        {/* Category badge with enhanced animation and optimized font */}
        <motion.div
          className="absolute top-4 md:top-8 right-4 md:right-8 bg-white/90 dark:bg-black/90 backdrop-blur-sm px-3 md:px-4 py-1.5 md:py-2 rounded-full border border-gold/40"
          style={{
            y: useTransform(
              extendedProgress,
              [itemPosition - 0.3, itemPosition, itemPosition + 0.3],
              [20, 0, -20]
            ),
            opacity: useTransform(
              extendedProgress,
              [itemPosition - 0.5, itemPosition - 0.2, itemPosition + 0.2, itemPosition + 0.5],
              [0, 1, 1, 0]
            )
          }}
        >
          <span className="text-gold text-xs md:text-sm tracking-wider uppercase font-medium font-body">
            {item.category}
          </span>
        </motion.div>

        {/* Cycle indicator (for debugging - remove in production) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="absolute top-4 left-4 bg-red-500 text-white px-2 py-1 text-xs rounded hidden">
            Cycle: {cycleIndex} | Item: {index}
          </div>
        )}
      </div>
    </motion.div>
  );
}