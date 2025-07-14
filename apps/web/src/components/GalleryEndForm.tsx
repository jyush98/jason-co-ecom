"use client";

import { motion, useTransform, MotionValue } from "framer-motion";

interface GalleryEndFormProps {
    linearProgress: MotionValue<number>;
    totalItems: number;
}

export default function GalleryEndForm({ linearProgress, totalItems }: GalleryEndFormProps) {
    return (
        <motion.div
            className="absolute inset-0 flex items-center justify-center"
            style={{
                opacity: useTransform(
                    linearProgress,
                    [totalItems - 0.5, totalItems, totalItems + 0.5],
                    [0, 1, 1]
                ),
                scale: useTransform(
                    linearProgress,
                    [totalItems - 0.3, totalItems, totalItems + 0.3],
                    [0.9, 1, 1]
                )
            }}
        >
            <div className="bg-white/10 dark:bg-black/10 backdrop-blur-xl rounded-2xl p-8 md:p-12 border border-gold/20 max-w-2xl mx-4 md:mx-8 text-center">
                <motion.h2
                    className="text-3xl md:text-5xl font-sans text-black dark:text-white mb-4 md:mb-6 tracking-wider"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    INSPIRED?
                </motion.h2>

                <motion.p
                    className="text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-6 md:mb-8 leading-relaxed px-2"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    Ready to create your own masterpiece? Let's bring your vision to life with our custom jewelry design service.
                </motion.p>

                <motion.div
                    className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                >
                    <a
                        href="/custom"
                        className="w-full sm:w-auto bg-gold hover:bg-gold/90 text-black font-medium px-6 md:px-8 py-3 md:py-4 rounded-full transition-all duration-300 hover:scale-105 hover:shadow-xl text-center"
                    >
                        START CUSTOM ORDER
                    </a>

                    <a
                        href="/shop"
                        className="w-full sm:w-auto border-2 border-gold text-gold hover:bg-gold hover:text-black font-medium px-6 md:px-8 py-3 md:py-4 rounded-full transition-all duration-300 hover:scale-105 text-center"
                    >
                        BROWSE COLLECTION
                    </a>
                </motion.div>

                <motion.div
                    className="mt-6 md:mt-8 pt-4 md:pt-6 border-t border-gold/20"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                >
                    <p className="text-xs md:text-sm text-gray-500 dark:text-gray-500 mb-2 md:mb-3">
                        Questions? We're here to help.
                    </p>
                    <a
                        href="/contact"
                        className="text-gold hover:text-gold/80 font-medium transition-colors text-sm md:text-base"
                    >
                        Contact Our Design Team →
                    </a>
                </motion.div>
            </div>
        </motion.div>
    );
}