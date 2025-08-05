'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

// Animation variants following established patterns
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2
        }
    }
}

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, ease: "easeOut" }
    }
}

export default function AboutHero() {
    const ref = useRef(null)
    const isInView = useInView(ref, { once: true })

    return (
        <motion.section
            ref={ref}
            className="relative min-h-screen flex items-center justify-center overflow-hidden"
            variants={containerVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
        >
            {/* Premium Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black">
                <div
                    className="w-full h-full bg-cover bg-center opacity-30"
                    style={{ backgroundImage: 'url("/images/chrome-hearts-jesus/chain-sideways.png")' }}
                />
            </div>

            {/* Backdrop Blur Overlay - matching navigation style */}
            <div className="absolute inset-0 bg-white/5 dark:bg-black/20 backdrop-blur-[2px]" />

            <motion.div
                variants={itemVariants}
                className="relative z-10 text-center px-6 max-w-4xl mx-auto"
            >
                <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-6">
                    WHERE AMBITION
                    <br />
                    <span className="text-[#D4AF37]">MEETS ARTISTRY</span>
                </h1>
                <p className="text-xl md:text-2xl text-gray-300 font-light tracking-[0.1em] uppercase">
                    Crafted for Icons, Not Followers
                </p>
            </motion.div>
        </motion.section>
    )
}