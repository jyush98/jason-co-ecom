'use client'

import { motion } from 'framer-motion'
import { useRef } from 'react'
import { ChevronRight } from 'lucide-react'
import { createStaggerContainer, createEntranceAnimation } from '@/lib/animations';

// Animation variants following established patterns
const containerVariants = createStaggerContainer(0.1, 0.2);
const itemVariants = createEntranceAnimation(20, 1, 0.6);

export default function AboutCTA() {
    const ref = useRef(null)
    // const isInView = useInView(ref, { once: true })

    return (
        <motion.section
            ref={ref}
            className="py-24 px-6 md:px-20 bg-white dark:bg-black relative overflow-hidden"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
        >
            {/* Subtle background pattern */}
            <div className="absolute inset-0 opacity-5">
                <div className="w-full h-full bg-gradient-to-br from-[#D4AF37] to-transparent" />
            </div>

            <div className="max-w-4xl mx-auto text-center relative z-10">
                <motion.h2
                    variants={itemVariants}
                    className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-gray-200 mb-8 tracking-tight"
                >
                    Your Vision.
                    <br />
                    <span className="text-[#D4AF37]">Our Craft.</span>
                </motion.h2>

                <motion.p
                    variants={itemVariants}
                    className="text-xl text-gray-600 dark:text-gray-400 mb-12 leading-relaxed"
                >
                    Whether you&apos;re chasing something never done before or refining a timeless piece—we got you.
                </motion.p>

                <motion.div
                    variants={itemVariants}
                    className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                >
                    <motion.a
                        href="/custom"
                        className="w-full sm:w-auto bg-[#D4AF37] hover:bg-[#FFD700] text-black font-bold px-8 py-4 rounded-full transition-all duration-300 uppercase tracking-[0.2em] text-sm"
                        whileHover={{
                            scale: 1.05,
                            boxShadow: "0 10px 30px rgba(212, 175, 55, 0.3)"
                        }}
                        whileTap={{ scale: 0.98 }}
                    >
                        Start Custom Project
                    </motion.a>

                    <motion.a
                        href="/contact"
                        className="w-full sm:w-auto group flex items-center justify-center gap-2 border-2 border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black font-bold px-8 py-4 rounded-full transition-all duration-300 uppercase tracking-[0.2em] text-sm"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        Schedule Consultation
                        <ChevronRight
                            className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300"
                        />
                    </motion.a>
                </motion.div>

                <motion.div
                    variants={itemVariants}
                    className="mt-12 pt-8 border-t border-[#D4AF37]/20"
                >
                    <p className="text-sm text-gray-500 dark:text-gray-500 mb-3 uppercase tracking-widest">
                        Questions? We&apos;re here to help.
                    </p>
                    <a
                        href="mailto:jonathan@jasonjewels.com"
                        className="text-[#D4AF37] hover:text-[#FFD700] font-medium transition-colors duration-300 text-lg"
                    >
                        jonathan@jasonjewels.com
                    </a>
                </motion.div>
            </div>
        </motion.section>
    )
}