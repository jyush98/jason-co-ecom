"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface ProductImageGalleryProps {
  images: string[];
}

export default function ProductImageGallery({ images }: ProductImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [zoomed, setZoomed] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  useEffect(() => {
    if (images?.length > 0) {
      setSelectedImage(images[0]);
    }
  }, [images]);

  const handleSwipe = (dir: "left" | "right") => {
    if (!selectedImage) return;
    const idx = images.findIndex((img) => img === selectedImage);
    const newIdx =
      dir === "left"
        ? Math.min(idx + 1, images.length - 1)
        : Math.max(idx - 1, 0);
    setSelectedImage(images[newIdx]);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX;
    if (deltaX > 50) handleSwipe("right");
    if (deltaX < -50) handleSwipe("left");
    setTouchStartX(null);
  };

  if (!selectedImage) return null;

  return (
    <>
      {/* Thumbnails + Main Image */}
      <div className="flex flex-col md:flex-row gap-4 w-full">
        {/* Thumbnails */}
        <div className="flex md:flex-col gap-4 overflow-x-auto md:overflow-visible">
          {images.map((img, index) => (
            <div
              key={index}
              onClick={() => setSelectedImage(img)}
              className={`relative min-w-[64px] md:min-w-0 w-16 h-16 cursor-pointer border ${selectedImage === img ? "border-white" : "border-transparent"
                }`}
            >
              <Image src={img} alt={`Thumb ${index}`} fill className="object-cover rounded-md" />
            </div>
          ))}
        </div>

        {/* Main Image */}
        <div
          className="relative w-full aspect-square overflow-hidden rounded-2xl shadow-lg cursor-zoom-in"
          onClick={() => setModalOpen(true)}
        >
          <Image
            src={selectedImage}
            alt="Main product image"
            fill
            className="object-cover"
            sizes="(min-width: 768px) 50vw, 100vw"
          />
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center"
          onClick={() => {
            if (!zoomed) setModalOpen(false);
          }}
        >
          {/* Close Button */}
          <button
            onClick={() => setModalOpen(false)}
            className="absolute top-4 right-4 text-white z-50"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSwipe("left");
                }}
                className="absolute left-4 text-white z-50"
              >
                <ChevronLeft className="w-8 h-8" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSwipe("right");
                }}
                className="absolute right-4 text-white z-50"
              >
                <ChevronRight className="w-8 h-8" />
              </button>
            </>
          )}

          {/* Image Frame */}
          <div
            className={`relative w-[600px] h-[600px] max-w-full max-h-[80vh] rounded-md border border-white/50 bg-black shadow-xl overflow-hidden transition-transform duration-300 ${zoomed ? "cursor-move scale-125" : "cursor-zoom-in"
              }`}
            onClick={(e) => {
              e.stopPropagation();
              setZoomed((prev) => !prev);
            }}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <Image
              src={selectedImage}
              alt="Zoomed product"
              fill
              className="object-contain"
              sizes="90vw"
            />
          </div>
        </div>
      )}
    </>
  );
}
