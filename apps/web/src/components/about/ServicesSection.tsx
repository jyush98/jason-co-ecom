'use client'

import { motion } from 'framer-motion'
import { useRef } from 'react'
import { Star, Award, Users } from 'lucide-react'

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

export default function ServicesSection() {
    const ref = useRef(null)
    // const isInView = useInView(ref, { once: true })

    const services = [
        {
            icon: <Star className="w-8 h-8" />,
            title: "Custom Design",
            description: "From concept sketches to final masterpiece, we bring your vision to life with uncompromising attention to detail."
        },
        {
            icon: <Award className="w-8 h-8" />,
            title: "Expert Craftsmanship",
            description: "Premium materials meet decades of expertise. Gold, platinum, diamonds—only the finest for those who demand excellence."
        },
        {
            icon: <Users className="w-8 h-8" />,
            title: "White-Glove Service",
            description: "Personal consultations, design refinements, and lifetime support. Your journey with us extends far beyond the purchase."
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
                        How We
                        <span className="text-[#D4AF37]"> Create</span>
                    </h2>
                    <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                        Our process fuses street-born energy with red-carpet precision.
                        We don&apos;t follow trends—we stone-set what&apos;s next.
                    </p>
                </motion.div>

                <div className="flex flex-col lg:grid lg:grid-cols-3 gap-8">
                    {services.map((service) => (
                        <motion.div
                            key={service.title}
                            variants={itemVariants}
                            className="group text-center p-8 rounded-lg bg-white dark:bg-black border border-gray-200 dark:border-gray-800 hover:border-[#D4AF37] transition-colors duration-300"
                            whileHover={{
                                scale: 1.02,
                                y: -4,
                                transition: { duration: 0.2, ease: "easeOut" }
                            }}
                        >
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#D4AF37]/10 rounded-full mb-6 group-hover:bg-[#D4AF37]/20 transition-colors duration-300">
                                <div className="text-[#D4AF37]">
                                    {service.icon}
                                </div>
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4 tracking-tight">
                                {service.title}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                {service.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </motion.section>
    )
}