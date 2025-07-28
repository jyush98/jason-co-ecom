"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import AuthBackground from "./AuthBackground";

interface AuthLayoutProps {
    children: React.ReactNode;
    title: string;
    subtitle: string;
    showBackButton?: boolean;
    backHref?: string;
}

export default function AuthLayout({
    children,
    title,
    subtitle,
    showBackButton = true,
    backHref = "/"
}: AuthLayoutProps) {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                duration: 0.8,
                staggerChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6, ease: "easeOut" }
        }
    };

    return (
        <AuthBackground variant="luxury">
            <div className="bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-black dark:to-gray-800 justify-center items-start">
                <div className="pt-[var(--navbar-height)] pb-10 min-h-screen flex">
                    {/* Left Side - Brand & Imagery */}
                    <motion.div
                        className="hidden lg:w-1/2 relative"
                        initial={{ x: -100, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ duration: 1, ease: "easeOut" }}
                    >
                        {/* Background Image/Pattern */}
                        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black">
                            {/* Subtle luxury pattern overlay */}
                            <div className="absolute inset-0 opacity-10">
                                <div
                                    className="w-full h-full"
                                    style={{
                                        backgroundImage: `radial-gradient(circle at 25% 25%, #D4AF37 2px, transparent 2px), 
                                 radial-gradient(circle at 75% 75%, #D4AF37 2px, transparent 2px)`,
                                        backgroundSize: '100px 100px'
                                    }}
                                />
                            </div>

                            {/* Gold accent gradient */}
                            <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-gold/20 via-gold/5 to-transparent" />
                        </div>

                        {/* Content */}
                        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
                            <motion.div
                                variants={itemVariants}
                                className="mb-8"
                            >
                                {/* Logo */}
                                <Link href="/" className="inline-block mb-12">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-gold rounded-lg flex items-center justify-center">
                                            <span className="text-black font-serif font-bold text-xl">J</span>
                                        </div>
                                        <span className="text-2xl font-serif text-white tracking-wide">
                                            Jason & Co.
                                        </span>
                                    </div>
                                </Link>

                                {/* Brand Messaging */}
                                <motion.h1
                                    className="text-4xl xl:text-5xl font-serif mb-6 leading-tight"
                                    variants={itemVariants}
                                >
                                    Where Ambition
                                    <br />
                                    <span className="text-gold">Meets Artistry</span>
                                </motion.h1>

                                <motion.p
                                    className="text-xl text-gray-300 leading-relaxed max-w-md"
                                    variants={itemVariants}
                                >
                                    Designed without limits for those who demand excellence.
                                    Join the community of achievers who recognize true craftsmanship.
                                </motion.p>
                            </motion.div>

                            {/* Feature Highlights */}
                            <motion.div
                                className="space-y-4"
                                variants={itemVariants}
                            >
                                {[
                                    "Exclusive custom jewelry designs",
                                    "Premium materials and craftsmanship",
                                    "Personalized consultation service",
                                    "Worldwide shipping and service"
                                ].map((feature, index) => (
                                    <motion.div
                                        key={index}
                                        className="flex items-center gap-3"
                                        variants={itemVariants}
                                    >
                                        <div className="w-2 h-2 bg-gold rounded-full flex-shrink-0" />
                                        <span className="text-gray-300">{feature}</span>
                                    </motion.div>
                                ))}
                            </motion.div>
                        </div>
                    </motion.div>

                    {/* Right Side - Auth Form */}
                    <motion.div
                        className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-12 lg:px-16 xl:px-20"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        {/* Back Button */}
                        {showBackButton && (
                            <motion.div
                                className="absolute top-8 left-8 lg:left-auto lg:right-8"
                                variants={itemVariants}
                            >
                                <Link
                                    href={backHref}
                                    className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gold transition-colors group"
                                >
                                    <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                                    <span className="text-sm tracking-wide">Back to site</span>
                                </Link>
                            </motion.div>
                        )}

                        {/* Mobile Logo */}
                        <motion.div
                            className="lg:hidden mb-12 mt-16"
                            variants={itemVariants}
                        >
                            <Link href="/" className="inline-block">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gold rounded-lg flex items-center justify-center">
                                        <span className="text-black font-serif font-bold text-lg">J</span>
                                    </div>
                                    <span className="text-xl font-serif text-black dark:text-white tracking-wide">
                                        Jason & Co.
                                    </span>
                                </div>
                            </Link>
                        </motion.div>

                        {/* Form Header */}
                        <motion.div
                            className="mb-8"
                            variants={itemVariants}
                        >
                            <h2 className="text-3xl md:text-4xl font-sans-serif text-black dark:text-white mb-4 tracking-wide">
                                {title}
                            </h2>
                            <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                                {subtitle}
                            </p>
                        </motion.div>

                        {/* Form Content */}
                        <motion.div variants={itemVariants}>
                            {children}
                        </motion.div>

                        {/* Footer Links */}
                        <motion.div
                            className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700 text-center"
                            variants={itemVariants}
                        >
                            <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-500 dark:text-gray-400">
                                <Link href="/privacy" className="hover:text-gold transition-colors">
                                    Privacy Policy
                                </Link>
                                <Link href="/terms" className="hover:text-gold transition-colors">
                                    Terms of Service
                                </Link>
                                <Link href="/contact" className="hover:text-gold transition-colors">
                                    Contact Support
                                </Link>
                            </div>

                            <p className="mt-4 text-xs text-gray-400 dark:text-gray-500">
                                © 2024 Jason & Co. All rights reserved.
                            </p>
                        </motion.div>

                        {/* Trust Indicators */}
                        <motion.div
                            className="mt-6 flex items-center justify-center gap-4 text-xs text-gray-400"
                            variants={itemVariants}
                        >
                            <div className="flex items-center gap-1">
                                <div className="w-2 h-2 bg-green-500 rounded-full" />
                                <span>Secure & Encrypted</span>
                            </div>
                            <div className="w-px h-4 bg-gray-300 dark:bg-gray-600" />
                            <div className="flex items-center gap-1">
                                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                                <span>SSL Protected</span>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </AuthBackground>

    );
}

// Auth Background Component (for mobile/smaller screens)