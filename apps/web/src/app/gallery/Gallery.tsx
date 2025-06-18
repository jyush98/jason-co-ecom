"use client";

import { galleryItems } from "@/data/gallery";
import GalleryFeatureRow from "@/components/GalleryFeatureRow";

export default function Gallery() {
  return (
    <section className="space-y-20 py-12 max-w-6xl mx-auto">
      {galleryItems.map((item, idx) => (
        <GalleryFeatureRow key={item.id} item={item} reverse={idx % 2 === 1} />
      ))}
    </section>
  );
}
