"use client";

import Image from "next/image";

export default function Hero() {
    return (
        <div className="relative w-full h-screen flex items-center justify-center bg-black text-white">
            <Image
                src="/patek-philippe-246234.jpg"
                alt="Luxury Watch"
                layout="fill"
                objectFit="cover"
                className="opacity-30"
            />
            <div className="absolute text-center">
                <h1 className="text-6xl font-serif text-gray-200 tracking-widest uppercase">
                    Timeless Luxury
                </h1>
                <p className="mt-4 text-lg text-gray-300">
                Handcrafted elegance, <i>redefined.</i>
                </p>
                <button className="mt-6 px-6 py-3 bg-gray-500 text-white rounded-lg text-lg hover:bg-gray-600 transition"
                onClick={() => window.location.href = "/shop"}>
                    Shop Now
                </button>
            </div>
        </div>
    );
}
