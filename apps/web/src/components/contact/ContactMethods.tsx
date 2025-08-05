'use client'

import { motion } from 'framer-motion'
import { Phone, Mail, MessageCircle, Calendar, Clock, Copy, ExternalLink } from 'lucide-react'
import { useState } from 'react'

const ContactMethods = () => {
    const [copiedText, setCopiedText] = useState<string | null>(null)

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1, delayChildren: 0.3 }
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

    const copyToClipboard = async (text: string, label: string) => {
        try {
            await navigator.clipboard.writeText(text)
            setCopiedText(label)
            setTimeout(() => setCopiedText(null), 2000)
        } catch (error) {
            console.error('Failed to copy:', error)
        }
    }

    const contactMethods = [
        {
            id: 'phone',
            title: 'Call Direct',
            subtitle: 'Immediate assistance',
            icon: Phone,
            primary: '(212) 555-GOLD',
            secondary: 'Mon-Fri 10am-7pm EST',
            action: 'tel:+12125554653',
            actionLabel: 'Call Now',
            availability: 'Available now',
            description: 'Speak directly with our design consultants for immediate assistance with custom orders, appointments, or general inquiries.'
        },
        {
            id: 'email',
            title: 'Email Inquiry',
            subtitle: 'Detailed correspondence',
            icon: Mail,
            primary: 'jonathan@jasonjewels.com',
            secondary: 'Response within 2 hours',
            action: 'mailto:jonathan@jasonjewels.com',
            actionLabel: 'Send Email',
            availability: 'Always available',
            description: 'Send detailed project descriptions, inspiration images, and questions. Perfect for complex custom order discussions.'
        },
        {
            id: 'whatsapp',
            title: 'WhatsApp Business',
            subtitle: 'Instant messaging',
            icon: MessageCircle,
            primary: '+1 (212) 555-4653',
            secondary: 'Quick responses',
            action: 'https://wa.me/12125554653',
            actionLabel: 'Message Us',
            availability: 'Business hours',
            description: 'Get instant responses for quick questions, appointment scheduling, and order updates. Media sharing enabled.'
        },
        {
            id: 'consultation',
            title: 'Private Consultation',
            subtitle: 'Premium service',
            icon: Calendar,
            primary: 'Book 1-on-1 Session',
            secondary: 'Virtual or in-person',
            action: '/book-consultation',
            actionLabel: 'Schedule Now',
            availability: 'Limited slots',
            description: 'Dedicated design consultation for custom orders $5,000+. Includes material selection, design review, and timeline planning.'
        }
    ]

    const emergencyContact = {
        title: 'VIP Emergency Line',
        subtitle: 'For existing clients only',
        phone: '+1 (212) 555-VIPS',
        hours: '24/7 for orders $25K+',
        description: 'Dedicated line for high-value clients with urgent custom order needs or time-sensitive requests.'
    }

    return (
        <section className="py-20 md:py-32 px-6 md:px-20">
            <div className="max-w-7xl mx-auto">
                {/* Section Header */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    className="text-center mb-16"
                >
                    <motion.h2
                        variants={itemVariants}
                        className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4"
                    >
                        Choose Your{' '}
                        <span className="text-[#D4AF37]">Channel</span>
                    </motion.h2>
                    <motion.p
                        variants={itemVariants}
                        className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed max-w-3xl mx-auto"
                    >
                        Multiple ways to connect with our team. From instant messaging to private consultations,
                        we're here to support your luxury jewelry journey.
                    </motion.p>
                </motion.div>

                {/* Contact Methods Grid */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-50px" }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16"
                >
                    {contactMethods.map((method) => {
                        const IconComponent = method.icon
                        return (
                            <motion.div
                                key={method.id}
                                variants={itemVariants}
                                whileHover={{ scale: 1.02, y: -4 }}
                                className="bg-white dark:bg-black rounded-2xl p-8 border border-gray-200 dark:border-gray-800 hover:border-[#D4AF37] hover:shadow-xl transition-all duration-300 group"
                            >
                                {/* Method Header */}
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-[#D4AF37]/10 rounded-lg group-hover:bg-[#D4AF37]/20 transition-colors">
                                            <IconComponent size={24} className="text-[#D4AF37]" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                                {method.title}
                                            </h3>
                                            <p className="text-gray-600 dark:text-gray-400">
                                                {method.subtitle}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Availability Badge */}
                                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${method.availability === 'Available now'
                                            ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                                            : method.availability === 'Limited slots'
                                                ? 'bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400'
                                                : 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                                        }`}>
                                        {method.availability}
                                    </div>
                                </div>

                                {/* Contact Details */}
                                <div className="mb-6">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="text-lg font-semibold text-gray-900 dark:text-white">
                                            {method.primary}
                                        </span>
                                        <button
                                            onClick={() => copyToClipboard(method.primary, method.id)}
                                            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                                            title="Copy to clipboard"
                                        >
                                            <Copy size={14} className="text-gray-400 hover:text-[#D4AF37] transition-colors" />
                                        </button>
                                        {copiedText === method.id && (
                                            <span className="text-xs text-[#D4AF37] font-medium">Copied!</span>
                                        )}
                                    </div>
                                    <p className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                                        <Clock size={14} />
                                        {method.secondary}
                                    </p>
                                </div>

                                {/* Description */}
                                <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                                    {method.description}
                                </p>

                                {/* Action Button */}
                                <motion.a
                                    href={method.action}
                                    target={method.action.startsWith('http') ? '_blank' : undefined}
                                    rel={method.action.startsWith('http') ? 'noopener noreferrer' : undefined}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="inline-flex items-center gap-2 bg-[#D4AF37] hover:bg-[#FFD700] text-black font-bold py-3 px-6 rounded-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                                >
                                    <IconComponent size={18} />
                                    {method.actionLabel}
                                    {method.action.startsWith('http') && <ExternalLink size={16} />}
                                </motion.a>
                            </motion.div>
                        )
                    })}
                </motion.div>

                {/* VIP Emergency Contact */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    className="max-w-4xl mx-auto"
                >
                    <motion.div
                        variants={itemVariants}
                        className="bg-gradient-to-r from-[#D4AF37]/10 to-transparent dark:from-[#D4AF37]/5 dark:to-transparent rounded-2xl p-8 border border-[#D4AF37]/20 backdrop-blur-sm"
                    >
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-[#D4AF37] rounded-lg">
                                        <Phone size={20} className="text-black" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                        {emergencyContact.title}
                                    </h3>
                                </div>
                                <p className="text-gray-600 dark:text-gray-400 mb-2">
                                    {emergencyContact.subtitle}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-500 leading-relaxed">
                                    {emergencyContact.description}
                                </p>
                            </div>

                            <div className="text-right">
                                <div className="text-2xl font-bold text-[#D4AF37] mb-1">
                                    {emergencyContact.phone}
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                    {emergencyContact.hours}
                                </div>
                                <a
                                    href={`tel:${emergencyContact.phone.replace(/\D/g, '')}`}
                                    className="inline-flex items-center gap-2 border-2 border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black font-bold py-2 px-4 rounded-lg transition-all duration-300"
                                >
                                    <Phone size={16} />
                                    Emergency Call
                                </a>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    )
}

export default ContactMethods