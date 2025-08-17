"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Image from "next/image";

interface FullscreenMenuProps {
    categories: { name: string; path: string }[];
    onClose: () => void;
}

const FullscreenMenu = ({
    categories,
    onClose,
}: FullscreenMenuProps) => {
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [showMenu, setShowMenu] = useState(true);
    const router = useRouter();

    // Handle ESC key press
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [onClose]);

    const startTransition = (path: string) => {
        setIsTransitioning(true);
        setTimeout(() => {
            router.push(path);
            setTimeout(() => {
                setShowMenu(false);
                onClose();
                setIsTransitioning(false);
            }, 800);
        }, 600);
    };

    // Menu item variants for staggered animation
    const menuItemVariants = {
        hidden: {
            opacity: 0,
            y: 30,
        },
        visible: (i: number) => ({
            opacity: 1,
            y: 0,
            transition: {
                delay: i * 0.1,
                duration: 0.6,
                ease: "easeOut"
            }
        }),
        exit: {
            opacity: 0,
            y: -20,
            transition: {
                duration: 0.3
            }
        }
    };

    const numberVariants = {
        hidden: { opacity: 0.3 },
        visible: { opacity: 0.5 },
        hover: { opacity: 0.8 }
    };

    const textVariants = {
        hidden: { fontStyle: "normal" },
        visible: { fontStyle: "normal" },
        hover: {
            fontStyle: "italic",
            transition: { duration: 0.3, ease: "easeInOut" }
        }
    };

    return (
        <>
            <AnimatePresence>
                {showMenu && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, transition: { duration: 0.4 } }}
                        className="fixed inset-0 bg-white text-black dark:bg-black dark:text-white z-[70]"
                    >
                        {/* Main Navigation Container */}
                        <div className="flex items-center justify-center min-h-full px-8 md:px-16">
                            <div className="w-full max-w-4xl">

                                {/* Menu Items */}
                                <div className="space-y-8 md:space-y-12">
                                    {categories.map((category, index) => (
                                        <motion.div
                                            key={category.name}
                                            custom={index}
                                            variants={menuItemVariants}
                                            initial="hidden"
                                            animate="visible"
                                            exit="exit"
                                            whileHover="hover"
                                            className="group cursor-pointer flex items-baseline gap-6 md:gap-12"
                                            onClick={() => startTransition(category.path)}
                                        >
                                            {/* Number */}
                                            <motion.span
                                                variants={numberVariants}
                                                className="text-sm md:text-base font-light tracking-wider text-gray-400 dark:text-gray-500 min-w-[3rem]"
                                            >
                                                {String(index + 1).padStart(2, '0')}
                                            </motion.span>

                                            {/* Navigation Item Name */}
                                            <motion.h2
                                                variants={textVariants}
                                                className="text-4xl md:text-6xl lg:text-7xl font-serif leading-none tracking-tight transition-colors duration-300"
                                                style={{
                                                    fontFamily: "'Playfair Display', 'Times New Roman', serif"
                                                }}
                                            >
                                                {category.name}
                                            </motion.h2>
                                        </motion.div>
                                    ))}
                                </div>

                                {/* Close indicator */}
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.8 }}
                                    className="absolute bottom-8 right-8"
                                >
                                    <button
                                        onClick={onClose}
                                        className="text-sm tracking-widest text-gray-400 hover:text-black dark:hover:text-white transition-colors duration-300"
                                    >
                                        ESC TO CLOSE
                                    </button>
                                </motion.div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Transition Overlay */}
            <AnimatePresence>
                {isTransitioning && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4 }}
                        className="fixed inset-0 bg-black z-[80] flex items-center justify-center"
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                            className="text-center"
                        >
                            {/* Original logo image */}
                            <motion.div
                                initial={{ opacity: 0.1, scale: 0.95 }}
                                animate={{ opacity: 0.3, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 1, ease: "easeOut" }}
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

            <style jsx global>{`
                /* Import Playfair Display for that editorial feel */
                @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600;1,700&display=swap');
            `}</style>
        </>
    );
};

export default FullscreenMenu;