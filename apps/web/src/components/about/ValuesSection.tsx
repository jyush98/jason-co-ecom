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

export default function ValuesSection() {
    const ref = useRef(null)
    const isInView = useInView(ref, { once: true })

    const brandPillars = [
        { title: "Excellence", subtitle: "Uncompromising quality" },
        { title: "Innovation", subtitle: "Pushing boundaries" },
        { title: "Integrity", subtitle: "Trust and transparency" },
        { title: "Artistry", subtitle: "Creative mastery" }
    ]

    return (
        <motion.section
            ref={ref}
            className="py-24 px-6 md:px-20 bg-white dark:bg-black"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
        >
            <div className="max-w-4xl mx-auto text-center">
                <motion.div variants={itemVariants}>
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-gray-200 mb-8 tracking-tight">
                        Engineered to
                        <span className="text-[#D4AF37]"> Stun</span>
                    </h2>
                </motion.div>

                <motion.div variants={itemVariants} className="space-y-8 text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                    <p>
                        Every Jason & Co. piece is a collaboration between your imagination and
                        our relentless pursuit of perfection. From diamond-drenched pendants to
                        finely set watches, every detail is engineered to stun.
                    </p>
                    <p>
                        We believe luxury isn't about following traditions—it's about breaking them.
                        Our workshop is where ambition takes physical form, where your success story
                        becomes wearable art.
                    </p>
                </motion.div>

                {/* Brand Pillars */}
                <motion.div
                    variants={itemVariants}
                    className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16"
                >
                    {brandPillars.map((pillar, index) => (
                        <motion.div
                            key={pillar.title}
                            className="text-center group"
                            whileHover={{
                                scale: 1.05,
                                transition: { duration: 0.2, ease: "easeOut" }
                            }}
                        >
                            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2 group-hover:text-[#D4AF37] transition-colors duration-300">
                                {pillar.title}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-500 uppercase tracking-widest">
                                {pillar.subtitle}
                            </p>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </motion.section>
    )
}