'use client'

import { motion } from 'framer-motion'
import { Phone, Mail, MapPin, Calendar } from 'lucide-react'

const ContactHero = () => {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1, delayChildren: 0.2 }
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

    const iconVariants = {
        hidden: { opacity: 0, scale: 0.8 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: { duration: 0.5, ease: "easeOut" }
        }
    }

    return (
        <section className="relative h-[60vh] md:h-[70vh] flex items-center justify-center overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-white via-gray-100 to-white dark:from-black dark:via-gray-900 dark:to-black" />

            {/* Content overlay */}
            <div className="absolute inset-0 bg-white/5 dark:bg-black/20 backdrop-blur-[2px]" />

            {/* Main content */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="relative z-10 text-center px-6 md:px-20 max-w-4xl mx-auto"
            >
                {/* Main heading */}
                <motion.h1
                    variants={itemVariants}
                    className="text-5xl md:text-7xl font-bold text-black dark:text-white mb-6 tracking-tight"
                >
                    GET IN{' '}
                    <span className="text-[#D4AF37] font-black tracking-wider">
                        TOUCH
                    </span>
                </motion.h1>

                {/* Subtitle */}
                <motion.p
                    variants={itemVariants}
                    className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 mb-8 font-light leading-relaxed"
                >
                    Ready to create something extraordinary?
                    <br className="hidden md:block" />
                    <span className="text-[#D4AF37] font-medium">
                        Let's turn your vision into reality.
                    </span>
                </motion.p>

                {/* Contact method preview icons */}
                <motion.div
                    variants={itemVariants}
                    className="flex items-center justify-center gap-8 md:gap-12"
                >
                    <motion.div
                        variants={iconVariants}
                        whileHover={{ scale: 1.1, y: -2 }}
                        className="flex flex-col items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-[#D4AF37] transition-colors duration-300 cursor-pointer"
                    >
                        <div className="p-3 rounded-full border border-gray-600 hover:border-[#D4AF37] transition-colors duration-300">
                            <Phone size={24} />
                        </div>
                        <span className="text-sm font-medium">Call</span>
                    </motion.div>

                    <motion.div
                        variants={iconVariants}
                        whileHover={{ scale: 1.1, y: -2 }}
                        className="flex flex-col items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-[#D4AF37] transition-colors duration-300 cursor-pointer"
                    >
                        <div className="p-3 rounded-full border border-gray-600 hover:border-[#D4AF37] transition-colors duration-300">
                            <Mail size={24} />
                        </div>
                        <span className="text-sm font-medium">Email</span>
                    </motion.div>

                    <motion.div
                        variants={iconVariants}
                        whileHover={{ scale: 1.1, y: -2 }}
                        className="flex flex-col items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-[#D4AF37] transition-colors duration-300 cursor-pointer"
                    >
                        <div className="p-3 rounded-full border border-gray-600 hover:border-[#D4AF37] transition-colors duration-300">
                            <MapPin size={24} />
                        </div>
                        <span className="text-sm font-medium">Visit</span>
                    </motion.div>

                    <motion.div
                        variants={iconVariants}
                        whileHover={{ scale: 1.1, y: -2 }}
                        className="flex flex-col items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-[#D4AF37] transition-colors duration-300 cursor-pointer"
                    >
                        <div className="p-3 rounded-full border border-gray-600 hover:border-[#D4AF37] transition-colors duration-300">
                            <Calendar size={24} />
                        </div>
                        <span className="text-sm font-medium">Book</span>
                    </motion.div>
                </motion.div>
            </motion.div>
        </section>
    )
}

export default ContactHero