"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";

const categories = [
    { name: "Necklaces", image: "/images/collection1.png", path: "/shop?category=necklaces" },
    { name: "Bracelets", image: "/images/collection2.png", path: "/shop?category=bracelets" },
    { name: "Rings", image: "/images/collection3.png", path: "/shop?category=rings" },
    { name: "Earrings", image: "/images/collection1.png", path: "/shop?category=earrings" },
    { name: "Watches", image: "/images/collection2.png", path: "/shop?category=watches" },
    { name: "Grillz", image: "/images/collection3.png", path: "/shop?category=grillz" }
];

export default function CategoriesCarousel() {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [sliderRef, instanceRef] = useKeenSlider({
        loop: true,
        slides: {
            origin: "center",
            perView: 4, // Show 5 slides (half + 3 full + half)
            spacing: 40,
        },
        mode: "free-snap",
        rubberband: false,
        breakpoints: {
            "(max-width: 768px)": {
                slides: { perView: 3, spacing: 8 }, // Adjust for tablet
            },
            "(max-width: 480px)": {
                slides: { perView: 1.5, spacing: 4 }, // Half-image effect on mobile
            },
        },
        slideChanged(slider) {
            setCurrentSlide(slider.track.details.rel);
        },
    });

    const scrollToSlide = (index: number) => {
        instanceRef.current?.moveToIdx(index);
    };

    useEffect(() => {
        const interval = setInterval(() => {
            instanceRef.current?.next();
        }, 5000);
        return () => clearInterval(interval);
    }, [instanceRef]);

    return (
        <section className="py-24 bg-black text-white">
            <h2 className="text-4xl font-sans text-center mb-10">Categories</h2>

            <div ref={sliderRef} className="keen-slider">
                {categories.map((cat, idx) => (
                    <div
                        key={idx}
                        className="keen-slider__slide relative overflow-hidden rounded-lg cursor-pointer"
                        onClick={() => scrollToSlide(idx)}
                    >
                        <Image
                            src={cat.image}
                            alt={cat.name}
                            width={600}
                            height={400}
                            className="object-cover w-full h-full"
                            priority={idx < 3} // Prioritize loading first few images
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                            <Link href={cat.path} className="text-white text-lg font-medium hover:underline">
                                {cat.name}
                            </Link>
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex justify-center mt-8 space-x-0">
                {categories.map((cat, idx) => (
                    <div
                        key={cat.name}
                        className="h-6 w-10 flex items-center justify-center cursor-pointer"
                        onClick={() => scrollToSlide(idx)}
                    >
                        <button
                            className={`transition-all rounded h-1 w-8 ${currentSlide === idx ? "bg-white" : "bg-gray-600 hover:bg-white"
                                }`}
                            aria-label={`Go to ${cat.name}`}
                        />
                    </div>
                ))}
            </div>
        </section>
    );
}