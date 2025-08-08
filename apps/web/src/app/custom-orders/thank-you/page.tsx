// app/custom-orders/thank-you/page.tsx
"use client";

import { motion } from 'framer-motion';
import {
    Check,
    Phone,
    Mail,
    MessageCircle,
    ArrowRight,
    Shield,
    Award,
    Star
} from 'lucide-react';
import Link from 'next/link';

export default function CustomOrderThankYou() {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                duration: 0.6,
                staggerChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6, ease: "easeOut" }
        }
    };

    const checkVariants = {
        hidden: { scale: 0, rotate: -180 },
        visible: {
            scale: 1,
            rotate: 0,
            transition: {
                type: "spring",
                stiffness: 200,
                damping: 10,
                delay: 0.2
            }
        }
    };

    const timelineSteps = [
        {
            step: 1,
            title: "Initial Consultation",
            description: "We'll contact you within 24 hours to discuss your vision",
            timeframe: "Within 24 hours"
        },
        {
            step: 2,
            title: "Design Development",
            description: "Our artisans will create detailed designs and 3D renderings",
            timeframe: "3-5 business days"
        },
        {
            step: 3,
            title: "Approval & Production",
            description: "Once approved, we'll begin crafting your custom piece",
            timeframe: "2-4 weeks"
        },
        {
            step: 4,
            title: "Quality Assurance",
            description: "Final inspection and quality checks before delivery",
            timeframe: "2-3 business days"
        }
    ];

    return (
        <div className="pt-[var(--navbar-height)] min-h-screen bg-gray-50 dark:bg-black">
            {/* Hero Section */}
            <motion.div
                className="relative overflow-hidden bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-black"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-5">
                    <div className="absolute inset-0" style={{
                        backgroundImage: `radial-gradient(circle at 20% 50%, #D4AF37 1px, transparent 1px),
                             radial-gradient(circle at 80% 50%, #D4AF37 1px, transparent 1px)`,
                        backgroundSize: '100px 100px'
                    }} />
                </div>

                <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
                    <div className="text-center">
                        {/* Success Icon */}
                        <motion.div
                            className="inline-flex items-center justify-center w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full mb-8"
                            variants={checkVariants}
                        >
                            <Check className="w-12 h-12 text-green-600 dark:text-green-400" strokeWidth={3} />
                        </motion.div>

                        {/* Main Heading */}
                        <motion.h1
                            className="text-4xl md:text-5xl lg:text-6xl font-serif text-black dark:text-white mb-6"
                            variants={itemVariants}
                        >
                            Your Vision is <span className="text-gold">Received</span>
                        </motion.h1>

                        <motion.p
                            className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-12 max-w-2xl mx-auto leading-relaxed"
                            variants={itemVariants}
                        >
                            Thank you for choosing Jason & Co. Your custom order has been successfully submitted,
                            and our master artisans are ready to bring your vision to life.
                        </motion.p>

                        {/* Key Message */}
                        <motion.div
                            className="bg-gold/10 border border-gold/20 rounded-2xl p-8 max-w-2xl mx-auto mb-12"
                            variants={itemVariants}
                        >
                            <h3 className="text-2xl font-serif text-black dark:text-white mb-4">
                                Where Ambition Meets Artistry
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300 text-lg">
                                Your custom jewelry journey begins now. We&apos;ll contact you within 24 hours
                                to discuss your vision and begin the creation process.
                            </p>
                        </motion.div>
                    </div>
                </div>
            </motion.div>

            {/* What Happens Next Section */}
            <motion.section
                className="py-20 bg-gray-50 dark:bg-gray-900"
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
            >
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div className="text-center mb-16" variants={itemVariants}>
                        <h2 className="text-3xl md:text-4xl font-serif text-black dark:text-white mb-4">
                            What Happens Next?
                        </h2>
                        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                            Our proven process ensures every detail is perfect, from concept to creation.
                        </p>
                    </motion.div>

                    <div className="space-y-8">
                        {timelineSteps.map((step) => (
                            <motion.div
                                key={step.step}
                                className="flex items-start gap-6 bg-white dark:bg-black rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-800"
                                variants={itemVariants}
                            >
                                <div className="flex-shrink-0">
                                    <div className="w-12 h-12 rounded-full bg-gold flex items-center justify-center text-black font-bold">
                                        {step.step}
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2">
                                        <h3 className="text-xl font-semibold text-black dark:text-white">{step.title}</h3>
                                        <span className="text-sm text-gold font-medium">{step.timeframe}</span>
                                    </div>
                                    <p className="text-gray-600 dark:text-gray-300">{step.description}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </motion.section>

            {/* Contact & Support Section */}
            <motion.section
                className="py-20 bg-white dark:bg-black"
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
            >
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div className="text-center mb-12" variants={itemVariants}>
                        <h2 className="text-3xl md:text-4xl font-serif text-black dark:text-white mb-4">
                            Need to Reach Us?
                        </h2>
                        <p className="text-lg text-gray-600 dark:text-gray-300">
                            Our team is here to support you throughout your custom jewelry journey.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <motion.div
                            className="text-center p-6 bg-gray-50 dark:bg-gray-900 rounded-xl"
                            variants={itemVariants}
                        >
                            <div className="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Phone className="w-8 h-8 text-gold" />
                            </div>
                            <h3 className="text-lg font-semibold text-black dark:text-white mb-2">Call Us</h3>
                            <p className="text-gray-600 dark:text-gray-300 mb-3">Speak directly with our team</p>
                            <a
                                href="tel:+1-555-0123"
                                className="text-gold hover:text-gold/80 transition-colors font-medium"
                            >
                                (555) 123-4567
                            </a>
                        </motion.div>

                        <motion.div
                            className="text-center p-6 bg-gray-50 dark:bg-gray-900 rounded-xl"
                            variants={itemVariants}
                        >
                            <div className="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Mail className="w-8 h-8 text-gold" />
                            </div>
                            <h3 className="text-lg font-semibold text-black dark:text-white mb-2">Email Us</h3>
                            <p className="text-gray-600 dark:text-gray-300 mb-3">Get detailed responses</p>
                            <a
                                href="mailto:custom@jasonandco.com"
                                className="text-gold hover:text-gold/80 transition-colors font-medium"
                            >
                                custom@jasonandco.com
                            </a>
                        </motion.div>

                        <motion.div
                            className="text-center p-6 bg-gray-50 dark:bg-gray-900 rounded-xl"
                            variants={itemVariants}
                        >
                            <div className="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <MessageCircle className="w-8 h-8 text-gold" />
                            </div>
                            <h3 className="text-lg font-semibold text-black dark:text-white mb-2">Live Chat</h3>
                            <p className="text-gray-600 dark:text-gray-300 mb-3">Instant assistance available</p>
                            <span className="text-gold font-medium">Available 9 AM - 6 PM EST</span>
                        </motion.div>
                    </div>
                </div>
            </motion.section>

            {/* Trust Indicators */}
            <motion.section
                className="py-16 bg-gray-50 dark:bg-gray-900"
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
            >
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                        <motion.div variants={itemVariants}>
                            <Shield className="w-12 h-12 text-gold mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-black dark:text-white mb-2">Lifetime Warranty</h3>
                            <p className="text-gray-600 dark:text-gray-300 text-sm">
                                Every custom piece includes our comprehensive lifetime warranty
                            </p>
                        </motion.div>

                        <motion.div variants={itemVariants}>
                            <Award className="w-12 h-12 text-gold mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-black dark:text-white mb-2">Master Craftsmen</h3>
                            <p className="text-gray-600 dark:text-gray-300 text-sm">
                                Created by certified artisans with decades of experience
                            </p>
                        </motion.div>

                        <motion.div variants={itemVariants}>
                            <Star className="w-12 h-12 text-gold mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-black dark:text-white mb-2">100% Satisfaction</h3>
                            <p className="text-gray-600 dark:text-gray-300 text-sm">
                                We guarantee your complete satisfaction with every creation
                            </p>
                        </motion.div>
                    </div>
                </div>
            </motion.section>

            {/* Call to Action */}
            <motion.section
                className="py-20 bg-black dark:bg-gray-950"
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
            >
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <motion.h2
                        className="text-3xl md:text-4xl font-serif text-white mb-6"
                        variants={itemVariants}
                    >
                        Continue Exploring
                    </motion.h2>
                    <motion.p
                        className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto"
                        variants={itemVariants}
                    >
                        While we craft your custom piece, explore our existing collections for inspiration
                        or to add complementary pieces to your jewelry collection.
                    </motion.p>

                    <motion.div
                        className="flex flex-col sm:flex-row gap-4 justify-center"
                        variants={itemVariants}
                    >
                        <Link
                            href="/collections"
                            className="inline-flex items-center gap-2 bg-gold text-black px-8 py-4 rounded-lg font-semibold hover:bg-gold/90 transition-colors"
                        >
                            Browse Collections
                            <ArrowRight size={20} />
                        </Link>
                        <Link
                            href="/custom-orders"
                            className="inline-flex items-center gap-2 border border-gold text-gold px-8 py-4 rounded-lg font-semibold hover:bg-gold/10 transition-colors"
                        >
                            Start Another Project
                        </Link>
                    </motion.div>
                </div>
            </motion.section>
        </div>
    );
}