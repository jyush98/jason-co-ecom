"use client";

import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";
// import { fetchProducts } from "../utils/api";
// import { Product } from "../types/product";

interface FullscreenMenuProps {
    categories: { name: string; path: string }[];
    hoverImage: string;
    setHoverImage: (src: string) => void;
    onClose: () => void;
}

const FullscreenMenu = ({
    categories,
    hoverImage,
    setHoverImage,
    onClose,
}: FullscreenMenuProps) => {
    const [search, setSearch] = useState("");
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [showMenu, setShowMenu] = useState(true);
    const router = useRouter();

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && search.trim()) {
            startTransition(`/shop?search=${encodeURIComponent(search)}`);
        }
    };

    const startTransition = (path: string) => {
        setIsTransitioning(true);
        setTimeout(() => {
            router.push(path);
            setTimeout(() => {
                setShowMenu(false);
                onClose();
                setIsTransitioning(false);
            }, 1000);
        }, 1000);
    };

    return (
        <>
            <AnimatePresence>
                {showMenu && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, transition: { duration: 0.3 } }}
                        className="fixed left-0 right-0 top-[85px] bottom-0 bg-white text-black dark:bg-black dark:text-white z-40 flex"
                    >
                        {/* Left Side: Search + Category Links */}
                        <div className="w-1/2 pl-[15%] pr-4 py-10 flex flex-col justify-start space-y-8 relative">
                            <input
                                type="text"
                                placeholder="Search..."
                                className="bg-transparent border-b border-white text-2xl p-2 mb-4 outline-none placeholder-gray-400"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={handleKeyDown}
                            />

                            {categories.map((category) => (
                                <div
                                    key={category.name}
                                    className="text-4xl hover:underline cursor-pointer"
                                    onMouseEnter={() =>
                                        setHoverImage(
                                            `/images/${category.name.toLowerCase().replace(/ /g, "-")}.png`
                                        )
                                    }
                                    onClick={() => startTransition(category.path)}
                                >
                                    {category.name}
                                </div>
                            ))}
                        </div>

                        {/* Right Side: Image Preview */}
                        <div className="w-1/2 flex items-center justify-center">
                            <Image
                                src={hoverImage}
                                alt="Preview"
                                width={400}
                                height={400}
                                className="object-cover"
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Black overlay with logo during transition */}
            <AnimatePresence>
                {isTransitioning && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.6 }}
                        className="fixed inset-0 bg-black z-50 flex items-center justify-center"
                    >
                        <motion.div
                            initial={{ opacity: 0.1, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 1, ease: "easeOut" }}
                        >
                            <motion.div
                                initial={{ opacity: 0.3 }}
                                animate={{ opacity: 0.3 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.6, ease: "easeInOut" }}
                            >
                                <Image
                                    src="/logo.jpg"
                                    alt="Jason & Co. Logo"
                                    width={1000}
                                    height={500}
                                    className="object-contain"
                                />
                            </motion.div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default FullscreenMenu;
