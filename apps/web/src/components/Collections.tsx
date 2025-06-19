"use client";

import Image from "next/image";
import Link from "next/link";

const collections = [
  {
    name: "Necklaces",
    image: "/images/collection1.png",
    path: "/shop?category=necklaces",
  },
  {
    name: "Bracelets",
    image: "/images/collection2.png",
    path: "/shop?category=bracelets",
  },
  {
    name: "Rings",
    image: "/images/collection3.png",
    path: "/shop?category=rings",
  },
];

export default function CollectionsSection() {
  return (
    <section className="py-20 bg-white text-black dark:bg-black dark:text-white transition-colors duration-300">
      <h2 className="text-4xl font-sans uppercase text-center mb-12 tracking-wide">
        Collections
      </h2>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 px-4">
        {/* Left Column: Large Feature Image */}
        <div className="relative group overflow-hidden rounded-none outline outline-1 outline-black dark:outline-white">
          <Image
            src={collections[0].image}
            alt={collections[0].name}
            width={800}
            height={500}
            className="object-cover w-full h-full"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
            <Link
              href={collections[0].path}
              className="px-6 py-2 border border-white text-white uppercase tracking-wide text-sm hover:bg-white hover:text-black transition"
            >
              → SHOP {collections[0].name.toUpperCase()}
            </Link>
          </div>
        </div>

        {/* Right Column: Two Stacked Portraits */}
        <div className="flex flex-col gap-8">
          {collections.slice(1).map((col, index) => (
            <div
              key={index}
              className="relative group overflow-hidden rounded-none outline outline-1 outline-black dark:outline-white"
            >
              <Image
                src={col.image}
                alt={col.name}
                width={800}
                height={240}
                className="object-cover w-full h-full"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
              <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
                <Link
                  href={col.path}
                  className="px-6 py-2 border border-white text-white uppercase tracking-wide text-sm hover:bg-white hover:text-black transition"
                >
                  → SHOP {col.name.toUpperCase()}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
