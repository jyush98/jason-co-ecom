"use client";

import GalleryFilter from "@/components/GalleryFilter";
import GalleryGrid from "@/components/GalleryGrid";
import { useState } from "react";
import { galleryItems} from "@/data/gallery"

export default function Gallery() {
    const [selectedCategory, setSelectedCategory] = useState("All");

    const filteredItems = selectedCategory === "All"
        ? galleryItems
        : galleryItems.filter(item => item.category === selectedCategory);

    return (
        <section className="px-6 py-12 max-w-6xl mx-auto">
            <div className="mb-8 text-center">
                <h1 className="text-4xl font-serif mb-2">Crafted Excellence</h1>
                <p className="text-lg text-gray-400">
                    A curated selection of our finest custom creations.
                </p>
            </div>
            <GalleryFilter selected={selectedCategory} setSelected={setSelectedCategory} />
            <GalleryGrid items={filteredItems} />
        </section>
    );
}
