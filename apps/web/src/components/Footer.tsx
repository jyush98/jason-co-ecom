"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { FaInstagram, FaTiktok, FaEnvelope } from "react-icons/fa";
import { useTheme } from "next-themes";

import { EMAIL_ADDRESSES, SOCIAL_LINKS } from "@/config/businessInfo";

export default function Footer() {
  const { resolvedTheme } = useTheme();

  const socialLinks = [
    {
      icon: FaInstagram,
      href: SOCIAL_LINKS.instagram,
      label: "Instagram",
      username: "@jasonjeweler"
    },
    {
      icon: FaTiktok,
      href: SOCIAL_LINKS.tiktok,
      label: "TikTok",
      username: "@jasonjeweler"
    },
    {
      icon: FaEnvelope,
      href: `mailto:${EMAIL_ADDRESSES.INFO}`,
      label: "Email",
      username: `${EMAIL_ADDRESSES.INFO}`
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <footer className="bg-white dark:bg-black border-t border-gray-200 dark:border-gray-800 py-16 w-full">
      <motion.div
        className="max-w-4xl mx-auto px-4"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <div className="flex flex-col items-center justify-center text-center space-y-8">

          {/* Logo Section */}
          <motion.div variants={itemVariants} className="flex flex-col items-center space-y-4">
            <Image
              src={resolvedTheme === "dark" ? "/logo-dark.png" : "/logo-light.png"}
              alt="Jason & Co."
              width={280}
              height={140}
              className="object-contain"
              priority
            />

            {/* Brand Statement */}
            <motion.h2
              className="text-lg sm:text-xl font-light tracking-[0.2em] uppercase text-gray-800 dark:text-gray-200"
              variants={itemVariants}
            >
              WHERE AMBITION MEETS ARTISTRY
            </motion.h2>
          </motion.div>

          {/* Business Information */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-6 text-sm text-gray-600 dark:text-gray-400"
          >
            <div className="flex items-center gap-1">
              <span className="font-medium">Custom Orders Available</span>
            </div>
            <div className="hidden sm:block text-gold">•</div>
            <div className="flex items-center gap-1">
              <span className="font-medium">NYC Based</span>
            </div>
          </motion.div>

          {/* Contact Information */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col items-center space-y-2"
          >
            <p className="text-sm text-gray-500 dark:text-gray-500 uppercase tracking-wide">
              Ready to Create Something Extraordinary?
            </p>
            <Link
              href={`mailto:${EMAIL_ADDRESSES.INFO}`}
              className="text-base font-medium text-gray-800 dark:text-gray-200 hover:text-gold dark:hover:text-gold transition-colors duration-200"
            >
              {EMAIL_ADDRESSES.INFO}
            </Link>
          </motion.div>

          {/* Social Media Links */}
          <motion.div
            variants={itemVariants}
            className="flex justify-center space-x-8"
          >
            {socialLinks.map((social) => (
              <motion.a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.label}
                className="group flex flex-col items-center space-y-1"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="p-3 rounded-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 group-hover:border-gold/50 dark:group-hover:border-gold/50 transition-all duration-200">
                  <social.icon className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-gold transition-colors duration-200" />
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-500 group-hover:text-gold transition-colors duration-200">
                  {social.label}
                </span>
              </motion.a>
            ))}
          </motion.div>

          {/* Legal Links */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-6 text-xs text-gray-400 dark:text-gray-600"
          >
            <div className="flex items-center gap-4">
              <Link
                href="/privacy"
                className="hover:text-gold transition-colors duration-200 uppercase tracking-wide"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="hover:text-gold transition-colors duration-200 uppercase tracking-wide"
              >
                Terms of Service
              </Link>
              <Link
                href="/returns"
                className="hover:text-gold transition-colors duration-200 uppercase tracking-wide"
              >
                Returns
              </Link>
            </div>
          </motion.div>

          {/* Copyright */}
          <motion.div
            variants={itemVariants}
            className="pt-4 border-t border-gray-200 dark:border-gray-800 w-full"
          >
            <p className="text-xs text-gray-400 dark:text-gray-600 text-center uppercase tracking-wide">
              © {new Date().getFullYear()} Jason & Co. All rights reserved.
            </p>
          </motion.div>

        </div>
      </motion.div>
    </footer>
  );
}