'use client'

import { motion } from 'framer-motion'
import { useRef } from 'react'
import Image from 'next/image'

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

export default function OurStory() {
    const ref = useRef(null)
    // const isInView = useInView(ref, { once: true })

    return (
        <motion.section
            ref={ref}
            className="py-24 px-6 md:px-20 bg-white dark:bg-black"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
        >
            <div className="max-w-6xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <motion.div variants={itemVariants}>
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-gray-200 mb-8 tracking-tight">
                            The Jason & Co.
                            <br />
                            <span className="text-[#D4AF37]">Legacy</span>
                        </h2>
                        <div className="space-y-6 text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                            <p>
                                Born from a vision to transform precious metals into powerful statements,
                                Jason & Co. represents the intersection of ambition and artistry.
                            </p>
                            <p>
                                Our NYC-based atelier specializes in custom luxury jewelry that refuses
                                to follow conventions. We don&apos;t just create pieces—we engineer statements
                                that reflect your journey, celebrate your achievements, and announce your arrival.
                            </p>
                            <p>
                                From the initial sketch to the final polish, every Jason & Co. creation
                                is a collaboration between your vision and our relentless pursuit of perfection.
                            </p>
                        </div>
                    </motion.div>

                    <motion.div
                        variants={itemVariants}
                        className="relative aspect-square rounded-lg overflow-hidden"
                        whileHover={{
                            scale: 1.02,
                            transition: { duration: 0.3, ease: "easeOut" }
                        }}
                    >
                        <Image
                            src="/images/chrome-hearts-jesus/chain.jpg"
                            alt="Jason & Co. craftsmanship"
                            fill
                            className="object-cover"
                            priority
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    </motion.div>
                </div>
            </div>
        </motion.section>
    )
}