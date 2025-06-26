"use client";

import { galleryItems } from "@/data/gallery";
// import GalleryFeatureRow from "@/components/GalleryFeatureRow";
// import GalleryFeatureSpread from "@/components/GalleryFeatureSpread";
import GalleryElegantLayout from "@/components/GalleryElegantLayout";

export default function Gallery() {
  return (
    <section className="mx-auto w-[90%] bg-lavish">
      {galleryItems.map((item) => (
        <GalleryElegantLayout key={item.id} item={item} />
      ))}
    </section>
  );
}
