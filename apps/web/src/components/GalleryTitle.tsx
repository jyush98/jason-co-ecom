"use client";

import { motion, useTransform, MotionValue } from "framer-motion";
import { GalleryElegantItemType } from "@/types/gallery";

interface GalleryTitleProps {
  galleryItems: GalleryElegantItemType[];
  linearProgress: MotionValue<number>;
  totalItems: number;
}

export default function GalleryTitle({ galleryItems, linearProgress, totalItems }: GalleryTitleProps) {
  return (
    <>
      {/* Desktop: Fixed left title */}
      <motion.div 
        className="hidden md:block fixed left-12 top-1/2 transform -translate-y-1/2 z-20"
        style={{
          opacity: useTransform(
            linearProgress,
            [0, totalItems - 0.3, totalItems],
            [1, 1, 0]
          )
        }}
      >
        <div className="text-left">
          {galleryItems.map((item, index) => {
            return (
              <motion.div
                key={item.id}
                className="absolute inset-0"
                style={{
                  opacity: useTransform(
                    linearProgress,
                    [
                      index - 0.6,  // Start fading in earlier
                      index - 0.2,  // Fully visible
                      index + 0.2,  // Still visible
                      index + 0.6   // Fade out later (overlapping)
                    ],
                    [0, 1, 1, 0]
                  ),
                  y: useTransform(
                    linearProgress,
                    [
                      index - 0.3,
                      index,
                      index + 0.3
                    ],
                    [20, 0, -20]
                  )
                }}
              >
                <h2 className="text-4xl md:text-6xl font-sans text-black dark:text-white tracking-wider">
                  {item.title.toUpperCase()}
                </h2>
                <p className="text-gold text-lg tracking-widest mt-2">
                  {item.collection.toUpperCase()}
                </p>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Mobile: Fixed bottom title - in the 10% bottom zone */}
      <motion.div 
        className="md:hidden fixed bottom-0 left-1/2 transform -translate-x-1/2 z-20 w-full h-[10vh] flex items-center justify-center px-6"
        style={{
          opacity: useTransform(
            linearProgress,
            [0, totalItems - 0.3, totalItems],
            [1, 1, 0]
          )
        }}
      >
        <div className="text-center">
          {galleryItems.map((item, index) => {
            return (
              <motion.div
                key={item.id}
                className="absolute inset-0"
                style={{
                  opacity: useTransform(
                    linearProgress,
                    [
                      index - 0.6,  // Start fading in earlier
                      index - 0.2,  // Fully visible
                      index + 0.2,  // Still visible
                      index + 0.6   // Fade out later (overlapping)
                    ],
                    [0, 1, 1, 0]
                  ),
                  y: useTransform(
                    linearProgress,
                    [
                      index - 0.3,
                      index,
                      index + 0.3
                    ],
                    [15, 0, -15]
                  )
                }}
              >
                <h2 className="text-2xl sm:text-3xl font-sans text-black dark:text-white tracking-wider">
                  {item.title.toUpperCase()}
                </h2>
                <p className="text-gold text-sm sm:text-base tracking-widest mt-1">
                  {item.collection.toUpperCase()}
                </p>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </>
  );
}