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

export default function ProcessSection() {
    const ref = useRef(null)
    // const isInView = useInView(ref, { once: true })

    const steps = [
        {
            number: "01",
            title: "Consultation",
            description: "Your vision meets our expertise. We listen, we understand, we plan."
        },
        {
            number: "02",
            title: "Design",
            description: "Concept sketches become technical drawings. Every angle, every stone, every detail."
        },
        {
            number: "03",
            title: "Craft",
            description: "Master artisans transform precious metals with techniques passed down through generations."
        },
        {
            number: "04",
            title: "Perfect",
            description: "Final polish, quality control, and presentation. Nothing leaves until it's flawless."
        }
    ]

    return (
        <motion.section
            ref={ref}
            className="py-24 px-6 md:px-20 bg-gray-50 dark:bg-gray-900"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
        >
            <div className="max-w-6xl mx-auto">
                <motion.div variants={itemVariants} className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-gray-200 mb-6 tracking-tight">
                        Our
                        <span className="text-[#D4AF37]"> Process</span>
                    </h2>
                    <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                        From concept to completion, every step is engineered for excellence.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {steps.map((step) => (
                        <motion.div
                            key={step.number}
                            variants={itemVariants}
                            className="relative group"
                        >
                            <div className="text-center">
                                <motion.div
                                    className="relative mb-6"
                                    whileHover={{
                                        scale: 1.1,
                                        transition: { duration: 0.2, ease: "easeOut" }
                                    }}
                                >
                                    <div className="w-24 h-24 mx-auto rounded-full border-2 border-[#D4AF37] flex items-center justify-center group-hover:bg-[#D4AF37] transition-all duration-300">
                                        <span className="text-2xl font-bold text-[#D4AF37] group-hover:text-black transition-colors duration-300">
                                            {step.number}
                                        </span>
                                    </div>
                                </motion.div>

                                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4 tracking-tight">
                                    {step.title}
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                    {step.description}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </motion.section>
    )
}