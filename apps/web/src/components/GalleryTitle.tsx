"use client";

import { motion, useTransform, MotionValue } from "framer-motion";
import { GalleryElegantItemType } from "@/types/gallery";
import { useMotionValueEvent } from "framer-motion";
import { useState } from "react";

interface GalleryTitleProps {
  galleryItems: GalleryElegantItemType[];
  linearProgress: MotionValue<number>;
  totalItems: number;
}

export default function GalleryTitle({ galleryItems, linearProgress, totalItems }: GalleryTitleProps) {
  // Track current scroll progress as a regular state value
  const [currentProgress, setCurrentProgress] = useState(0);

  // Listen to the motion value and update state
  useMotionValueEvent(linearProgress, "change", (latest) => {
    setCurrentProgress(latest);
  });

  // Container opacity transform (this is the ONLY useTransform we need)
  const containerOpacity = useTransform(
    linearProgress,
    [0, totalItems - 0.3, totalItems],
    [1, 1, 0]
  );

  // Helper function to calculate item opacity based on current scroll progress
  const getItemOpacity = (index: number): number => {
    const fadeInStart = index - 0.6;
    const fadeInEnd = index - 0.2;
    const fadeOutStart = index + 0.2;
    const fadeOutEnd = index + 0.6;

    if (currentProgress <= fadeInStart || currentProgress >= fadeOutEnd) return 0;
    if (currentProgress >= fadeInEnd && currentProgress <= fadeOutStart) return 1;

    if (currentProgress < fadeInEnd) {
      return (currentProgress - fadeInStart) / (fadeInEnd - fadeInStart);
    } else {
      return 1 - (currentProgress - fadeOutStart) / (fadeOutEnd - fadeOutStart);
    }
  };

  // Helper function to calculate item Y position
  const getItemY = (index: number, isMobile: boolean = false): number => {
    const moveStart = index - 0.3;
    const moveCenter = index;
    const moveEnd = index + 0.3;
    const moveRange = isMobile ? 15 : 20;

    if (currentProgress <= moveStart) return moveRange;
    if (currentProgress >= moveEnd) return -moveRange;
    if (currentProgress === moveCenter) return 0;

    if (currentProgress < moveCenter) {
      const t = (currentProgress - moveStart) / (moveCenter - moveStart);
      return moveRange * (1 - t);
    } else {
      const t = (currentProgress - moveCenter) / (moveEnd - moveCenter);
      return -moveRange * t;
    }
  };

  return (
    <>
      {/* Desktop: Fixed left title */}
      <motion.div
        className="hidden md:block fixed left-12 top-1/2 transform -translate-y-1/2 z-20"
        style={{ opacity: containerOpacity }}
      >
        <div className="text-left">
          {galleryItems.map((item, index) => (
            <motion.div
              key={item.id}
              className="absolute inset-0"
              animate={{
                opacity: getItemOpacity(index),
                y: getItemY(index)
              }}
              transition={{
                duration: 0.1,
                ease: "linear"
              }}
            >
              <h2 className="text-4xl md:text-6xl font-sans text-black dark:text-white tracking-wider">
                {item.title.toUpperCase()}
              </h2>
              <p className="text-gold text-lg tracking-widest mt-2">
                {item.collection.toUpperCase()}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Mobile: Fixed bottom title */}
      <motion.div
        className="md:hidden fixed bottom-0 left-1/2 transform -translate-x-1/2 z-20 w-full h-[10vh] flex items-center justify-center px-6"
        style={{ opacity: containerOpacity }}
      >
        <div className="text-center">
          {galleryItems.map((item, index) => (
            <motion.div
              key={item.id}
              className="absolute inset-0"
              animate={{
                opacity: getItemOpacity(index),
                y: getItemY(index, true)
              }}
              transition={{
                duration: 0.1,
                ease: "linear"
              }}
            >
              <h2 className="text-2xl sm:text-3xl font-sans text-black dark:text-white tracking-wider">
                {item.title.toUpperCase()}
              </h2>
              <p className="text-gold text-sm sm:text-base tracking-widest mt-1">
                {item.collection.toUpperCase()}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </>
  );
}