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

export default function MediaGrid() {
    const ref = useRef(null)
    // const isInView = useInView(ref, { once: true })

    return (
        <motion.section
            ref={ref}
            className="py-16 px-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
        >
            <div className="max-w-7xl mx-auto">
                <motion.div
                    variants={itemVariants}
                    className="grid grid-cols-2 md:grid-cols-5 gap-4 h-[500px]"
                >
                    {/* Image 1 */}
                    <motion.div
                        className="relative col-span-1 rounded-lg overflow-hidden"
                        whileHover={{
                            scale: 1.02,
                            transition: { duration: 0.3, ease: "easeOut" }
                        }}
                    >
                        <Image
                            src="/images/chrome-hearts-jesus/chain.jpg"
                            alt="Custom chain detail"
                            fill
                            className="object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
                    </motion.div>

                    {/* Image 2 */}
                    <motion.div
                        className="relative col-span-1 rounded-lg overflow-hidden"
                        whileHover={{
                            scale: 1.02,
                            transition: { duration: 0.3, ease: "easeOut" }
                        }}
                    >
                        <Image
                            src="/images/chrome-hearts-jesus/chain-zoom-1.jpg"
                            alt="Chain craftsmanship close-up"
                            fill
                            className="object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
                    </motion.div>

                    {/* Video - Center */}
                    <motion.div
                        className="relative col-span-2 md:col-span-1 rounded-lg overflow-hidden"
                        whileHover={{
                            scale: 1.02,
                            transition: { duration: 0.3, ease: "easeOut" }
                        }}
                    >
                        <video
                            autoPlay
                            loop
                            muted
                            playsInline
                            className="w-full h-full object-cover"
                        >
                            <source
                                src="https://jasonco-inspiration-images.s3.us-east-2.amazonaws.com/content/chrome-chain-black.mp4"
                                type="video/mp4"
                            />
                        </video>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
                    </motion.div>

                    {/* Image 3 */}
                    <motion.div
                        className="relative col-span-1 rounded-lg overflow-hidden"
                        whileHover={{
                            scale: 1.02,
                            transition: { duration: 0.3, ease: "easeOut" }
                        }}
                    >
                        <Image
                            src="/images/chrome-hearts-jesus/chain-zoom-2.jpg"
                            alt="Premium chain details"
                            fill
                            className="object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
                    </motion.div>

                    {/* Image 4 */}
                    <motion.div
                        className="relative col-span-1 rounded-lg overflow-hidden"
                        whileHover={{
                            scale: 1.02,
                            transition: { duration: 0.3, ease: "easeOut" }
                        }}
                    >
                        <Image
                            src="/images/chrome-hearts-jesus/full-piece.jpg"
                            alt="Complete jewelry piece"
                            fill
                            className="object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
                    </motion.div>
                </motion.div>
            </div>
        </motion.section>
    )
}