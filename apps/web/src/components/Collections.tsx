"use client";

import Image from "next/image";
import Link from "next/link";

const collections = [
  {
    name: "Necklaces",
    image: "/images/collection1.png",
    path: "/shop?category=necklaces"
  },
  {
    name: "Bracelets",
    image: "/images/collection2.png",
    path: "/shop?category=bracelets"
  },
  {
    name: "Rings",
    image: "/images/collection3.png",
    path: "/shop?category=rings"
  }
];

export default function CollectionsSection() {
  return (
    <section className="py-20 bg-black text-white">
      <h2 className="text-4xl font-serif uppercase text-center mb-12">Collections</h2>
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 px-4">
        {/* Left Column: First Image */}
        <div className="relative group overflow-hidden rounded-md shadow-lg">
          <Image
            src={collections[0].image}
            alt={collections[0].name}
            width={800}
            height={500}
            className="object-cover w-full h-full"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
            <Link
              href={collections[0].path}
              className="text-white text-lg font-medium hover:underline transition"
            >
              Shop {collections[0].name}
            </Link>
          </div>
        </div>

        {/* Right Column: Two stacked images */}
        <div className="flex flex-col gap-8">
          {collections.slice(1).map((col, index) => (
            <div key={index} className="relative group overflow-hidden rounded-md shadow-lg">
              <Image
                src={col.image}
                alt={col.name}
                width={800}
                height={240}
                className="object-cover w-full h-full"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                <Link
                  href={col.path}
                  className="text-white text-lg font-medium hover:underline transition"
                >
                  Shop {col.name}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
