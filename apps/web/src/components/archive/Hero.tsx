"use client";

import Image from "next/image";

export default function Hero() {
    return (
        <div className="relative w-[95vw] h-screen mx-auto flex items-center justify-center bg-black text-white">
            <Image
                src="/patek-philippe-246234.jpg"
                alt="Luxury Watch"
                layout="fill"
                objectFit="cover"
                className="opacity-30"
                priority
            />
            <div className="absolute text-center max-w-[90%] md:max-w-[70%] px-4">
                <h1 className="text-6xl md:text-7xl font-sans tracking-widest uppercase text-white">
                    Timeless Luxury
                </h1>
                <p className="mt-4 text-lg text-gray-300">
                    Handcrafted elegance, <i>redefined.</i>
                </p>
                <button
                    onClick={() => window.location.href = "/shop"}
                    className="mt-6 px-8 py-3 border border-white bg-transparent text-white  text-lg tracking-wide uppercase hover:bg-white hover:text-black transition-all duration-300"
                >
                    Shop Now
                </button>

            </div>
        </div>
    );
}
