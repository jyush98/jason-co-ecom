"use client";

import Image from "next/image";
import { useState } from "react";

interface ProductImageGalleryProps {
  images: string[];
}

export default function ProductImageGallery({ images }: ProductImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(images[0]);

  return (
    <div className="flex gap-4">
      {/* Thumbnails */}
      <div className="flex flex-col gap-4">
        {images.map((img, index) => (
          <div
            key={index}
            onClick={() => setSelectedImage(img)}
            className={`relative w-20 h-20 cursor-pointer border ${
              selectedImage === img ? "border-black" : "border-transparent"
            }`}
          >
            <Image src={img} alt={`Thumb ${index}`} fill className="object-cover rounded-md" />
          </div>
        ))}
      </div>

      {/* Main Image */}
      <div className="relative w-full aspect-square rounded-2xl overflow-hidden shadow-lg">
        <Image
          src={selectedImage}
          alt="Main product image"
          fill
          className="object-cover"
          sizes="(min-width: 768px) 50vw, 100vw"
        />
      </div>
    </div>
  );
}
