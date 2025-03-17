"use client"

import { UserButton, SignInButton, SignedIn, SignedOut } from "@clerk/nextjs";
import Link from "next/link";
import Image from "next/image";
import { useState, useRef } from "react";

const categories = [
    { name: "All Jewelry", path: "/shop" },
    { name: "Necklaces", path: "/shop?category=necklaces" },
    { name: "Bracelets", path: "/shop?category=bracelets" },
    { name: "Rings", path: "/shop?category=rings" },
];


const Navbar = () => {

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handleMouseEnter = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setIsDropdownOpen(true);
    };

    const handleMouseLeave = () => {
        timeoutRef.current = setTimeout(() => {
            setIsDropdownOpen(false);
        }, 200); // Delay before hiding submenu
    };

    return (
        <nav className="p-6 bg-black text-white flex justify-between items-center border-b border-gray-800 inter-semibold">
            <Link href="/" className="text-3xl font-serif tracking-wide uppercase">
                <Image src="/logo.jpg" alt="Jason & Co." width={240} height={120} priority />
            </Link>
            <div className="flex items-center z-50 space-x-6 text-lg font-serif uppercase">
            <div
                    className="relative"
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                >
                    <Link href="/shop" className="hover:text-gold-400 transition">Shop</Link>
                    {/* Submenu */}
                    {isDropdownOpen && (
                        <div className="absolute left-0 mt-2 w-56 bg-black border border-gray-700 rounded-lg shadow-lg opacity-0 animate-fadeIn">
                            {categories.map((category) => (
                                <Link
                                    key={category.name}
                                    href={category.path}
                                    className="block px-4 py-2 text-white hover:bg-gray-800 transition"
                                >
                                    {category.name}
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
                <Link href="/custom" className="hover:text-gold-400 transition">Custom Orders</Link>
                <Link href="/about" className="hover:text-gold-400 transition">About</Link>
                <Link href="/cart" className="hover:text-gold-400 transition">Cart</Link>
                <SignedOut><SignInButton /></SignedOut>
                <SignedIn><UserButton /></SignedIn>
            </div>
        </nav>
    );
};

export default Navbar;
