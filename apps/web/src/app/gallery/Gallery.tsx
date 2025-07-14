"use client";

import { useRef, useEffect } from "react";
import { motion, useScroll, useTransform, useMotionValue } from "framer-motion";
import { galleryItems } from "@/data/gallery";
import ScrollGalleryItem from "@/components/ScrollGalleryItem";

export default function Gallery() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Calculate scroll height - LONGER sections for slower, more deliberate transitions
  const totalItems = galleryItems.length;
  const scrollHeight = totalItems * 80 + 80; // Longer sections for slower reveals
  
  // Track scroll progress within the gallery container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });
  
  // Create a simple linear progress with tighter spacing
  const linearProgress = useTransform(scrollYProgress, [0, 1], [0, totalItems + 1]);
  
  // Hide footer on this page
  useEffect(() => {
    const footer = document.querySelector('footer');
    if (footer) {
      footer.style.display = 'none';
    }
    
    return () => {
      const footer = document.querySelector('footer');
      if (footer) {
        footer.style.display = '';
      }
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="relative bg-white dark:bg-black"
      style={{ height: `${scrollHeight + 100}vh` }} // Extra space for end menu
    >
      {/* Fixed viewport container for jewelry pieces */}
      <div className="sticky top-[var(--navbar-height)] h-[calc(100vh-var(--navbar-height))] w-full overflow-hidden">
        {/* Render each item once in sequence */}
        {galleryItems.map((item, itemIndex) => (
          <ScrollGalleryItem
            key={item.id}
            item={item}
            index={itemIndex}
            globalIndex={itemIndex}
            totalItems={totalItems}
            extendedProgress={linearProgress}
            cycleIndex={0}
          />
        ))}
        
        {/* End Menu/Form */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          style={{
            opacity: useTransform(
              linearProgress,
              [totalItems - 0.5, totalItems, totalItems + 0.5],
              [0, 1, 1]
            ),
            scale: useTransform(
              linearProgress,
              [totalItems - 0.3, totalItems, totalItems + 0.3],
              [0.9, 1, 1]
            )
          }}
        >
          <div className="bg-white/10 dark:bg-black/10 backdrop-blur-xl rounded-2xl p-12 border border-gold/20 max-w-2xl mx-8 text-center">
            <motion.h2 
              className="text-5xl font-sans text-black dark:text-white mb-6 tracking-wider"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              INSPIRED?
            </motion.h2>
            
            <motion.p 
              className="text-xl text-gray-600 dark:text-gray-400 mb-8 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              Ready to create your own masterpiece? Let's bring your vision to life with our custom jewelry design service.
            </motion.p>
            
            <motion.div 
              className="space-y-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <a
                href="/custom"
                className="inline-block bg-gold hover:bg-gold/90 text-black font-medium px-8 py-4 rounded-full transition-all duration-300 hover:scale-105 hover:shadow-xl mr-4"
              >
                START CUSTOM ORDER
              </a>
              
              <a
                href="/shop"
                className="inline-block border-2 border-gold text-gold hover:bg-gold hover:text-black font-medium px-8 py-4 rounded-full transition-all duration-300 hover:scale-105"
              >
                BROWSE COLLECTION
              </a>
            </motion.div>
            
            <motion.div 
              className="mt-8 pt-6 border-t border-gold/20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              <p className="text-sm text-gray-500 dark:text-gray-500 mb-3">
                Questions? We're here to help.
              </p>
              <a 
                href="/contact"
                className="text-gold hover:text-gold/80 font-medium transition-colors"
              >
                Contact Our Design Team →
              </a>
            </motion.div>
          </div>
        </motion.div>
      </div>
      
      {/* Fixed left title - with overlapping transitions */}
      <motion.div 
        className="fixed left-12 top-1/2 transform -translate-y-1/2 z-20"
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

      {/* Enhanced scroll snap points - longer for slower transitions */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(Math.floor((scrollHeight) / 80))].map((_, index) => (
          <div 
            key={index}
            className="absolute w-full"
            style={{
              top: `${index * 80}vh`,
              height: "80vh",
              scrollSnapAlign: "start",
              scrollSnapStop: "always"
            }}
          />
        ))}
      </div>
    </div>
  );
}