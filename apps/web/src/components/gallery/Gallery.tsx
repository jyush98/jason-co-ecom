"use client";

import { useRef, useEffect } from "react";
import { useScroll, useTransform } from "framer-motion";
import { galleryItems } from "@/data/gallery";
import ScrollGalleryItem from "@/components/gallery/ScrollGalleryItem";
import GalleryTitle from "@/components/gallery/GalleryTitle";
import GalleryEndForm from "@/components/gallery/GalleryEndForm";
import { GALLERY_CONFIG } from "@/config/galleryConfig";

export default function Gallery() {
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate scroll height using config
  const totalItems = galleryItems.length;
  const scrollHeight = totalItems * GALLERY_CONFIG.SECTION_HEIGHT + GALLERY_CONFIG.SECTION_HEIGHT;

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
      style={{ height: `${scrollHeight}vh` }}
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
        <GalleryEndForm
          linearProgress={linearProgress}
          totalItems={totalItems}
        />
      </div>

      {/* Fixed left title */}
      <GalleryTitle
        galleryItems={galleryItems}
        linearProgress={linearProgress}
        totalItems={totalItems}
      />

      {/* Precise scroll snap points - aligned with item centers */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Snap point for each gallery item */}
        {galleryItems.map((_, index) => (
          <div
            key={`item-snap-${index}`}
            className="absolute w-full"
            style={{
              top: `${index * GALLERY_CONFIG.SECTION_HEIGHT}vh`,
              height: `${GALLERY_CONFIG.SECTION_HEIGHT}vh`,
              scrollSnapAlign: "center", // Changed to center alignment
              scrollSnapStop: "always", // Force stop at each item
            }}
          />
        ))}

        {/* Snap point for the end form */}
        <div
          className="absolute w-full"
          style={{
            top: `${totalItems * GALLERY_CONFIG.SECTION_HEIGHT}vh`,
            height: `${GALLERY_CONFIG.SECTION_HEIGHT}vh`,
            scrollSnapAlign: "center",
            scrollSnapStop: "always",
          }}
        />
      </div>
    </div>
  );
}