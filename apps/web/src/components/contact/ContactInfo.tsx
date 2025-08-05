'use client'

import { motion } from 'framer-motion'
import {
    MapPin,
    Phone,
    Mail,
    Clock,
    Shield,
    Award,
    Users,
    Calendar,
    ExternalLink,
    CheckCircle
} from 'lucide-react'

const ContactInfo = () => {
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

    const businessInfo = {
        legal: {
            name: "Jason & Co. Fine Jewelry LLC",
            registration: "NYC Business License #JWL-2024-001",
            insurance: "Fully insured and bonded",
            certifications: [
                "Gemological Institute of America (GIA) Certified",
                "Better Business Bureau A+ Rating",
                "NYC Department of Consumer Affairs Licensed"
            ]
        },
        contact: {
            primary: {
                phone: "(212) 555-GOLD",
                email: "jonathan@jasonjewels.com",
                whatsapp: "+1 (212) 555-4653"
            },
            departments: {
                sales: "sales@jasonjewels.com",
                support: "support@jasonjewels.com",
                custom: "custom@jasonjewels.com",
                media: "press@jasonjewels.com"
            }
        },
        hours: {
            regular: {
                "Monday - Friday": "10:00 AM - 7:00 PM EST",
                "Saturday": "10:00 AM - 6:00 PM EST",
                "Sunday": "By Appointment Only"
            },
            holiday: "Holiday hours may vary. Call ahead during major holidays.",
            emergency: "VIP emergency line available 24/7 for orders $25,000+"
        },
        policies: {
            response: "We respond to all inquiries within 2 hours during business hours",
            consultation: "Free consultations for all custom orders",
            privacy: "We never share your information with third parties",
            security: "All communications are encrypted and secure"
        }
    }

    const stats = [
        { icon: Users, value: "2,500+", label: "Satisfied Clients" },
        { icon: Award, value: "15+", label: "Years Experience" },
        { icon: CheckCircle, value: "500+", label: "Custom Pieces Created" },
        { icon: Shield, value: "100%", label: "Satisfaction Guarantee" }
    ]

    return (
        <section className="py-20 md:py-32 px-6 md:px-20 bg-gray-50 dark:bg-gray-900/20">
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
                        Business{' '}
                        <span className="text-[#D4AF37]">Information</span>
                    </motion.h2>
                    <motion.p
                        variants={itemVariants}
                        className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed max-w-3xl mx-auto"
                    >
                        Transparency and trust are the foundation of every relationship.
                        Here's everything you need to know about working with Jason & Co.
                    </motion.p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Contact Details */}
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-50px" }}
                        className="space-y-8"
                    >
                        {/* Primary Contact */}
                        <motion.div
                            variants={itemVariants}
                            className="bg-white dark:bg-black rounded-2xl p-8 border border-gray-200 dark:border-gray-800 hover:border-[#D4AF37] hover:shadow-lg transition-all duration-300"
                        >
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                                <Phone className="text-[#D4AF37]" size={24} />
                                Primary Contact
                            </h3>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Phone</span>
                                    <a
                                        href={`tel:${businessInfo.contact.primary.phone.replace(/\D/g, '')}`}
                                        className="text-[#D4AF37] hover:text-[#FFD700] font-medium transition-colors"
                                    >
                                        {businessInfo.contact.primary.phone}
                                    </a>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Email</span>
                                    <a
                                        href={`mailto:${businessInfo.contact.primary.email}`}
                                        className="text-[#D4AF37] hover:text-[#FFD700] font-medium transition-colors"
                                    >
                                        {businessInfo.contact.primary.email}
                                    </a>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">WhatsApp</span>
                                    <a
                                        href={`https://wa.me/${businessInfo.contact.primary.whatsapp.replace(/\D/g, '')}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-[#D4AF37] hover:text-[#FFD700] font-medium transition-colors flex items-center gap-1"
                                    >
                                        {businessInfo.contact.primary.whatsapp}
                                        <ExternalLink size={14} />
                                    </a>
                                </div>
                            </div>
                        </motion.div>

                        {/* Department Contacts */}
                        <motion.div
                            variants={itemVariants}
                            className="bg-white dark:bg-black rounded-2xl p-8 border border-gray-200 dark:border-gray-800 hover:border-[#D4AF37] hover:shadow-lg transition-all duration-300"
                        >
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                                <Mail className="text-[#D4AF37]" size={24} />
                                Department Contacts
                            </h3>

                            <div className="space-y-4">
                                {Object.entries(businessInfo.contact.departments).map(([dept, email]) => (
                                    <div key={dept} className="flex items-center justify-between">
                                        <span className="text-gray-600 dark:text-gray-400 capitalize">
                                            {dept === 'custom' ? 'Custom Orders' : dept}
                                        </span>
                                        <a
                                            href={`mailto:${email}`}
                                            className="text-[#D4AF37] hover:text-[#FFD700] font-medium transition-colors"
                                        >
                                            {email}
                                        </a>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Business Hours */}
                        <motion.div
                            variants={itemVariants}
                            className="bg-white dark:bg-black rounded-2xl p-8 border border-gray-200 dark:border-gray-800 hover:border-[#D4AF37] hover:shadow-lg transition-all duration-300"
                        >
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                                <Clock className="text-[#D4AF37]" size={24} />
                                Business Hours
                            </h3>

                            <div className="space-y-3">
                                {Object.entries(businessInfo.hours.regular).map(([days, hours]) => (
                                    <div key={days} className="flex justify-between items-center">
                                        <span className="text-gray-600 dark:text-gray-400 font-medium">{days}</span>
                                        <span className="text-gray-900 dark:text-white">{hours}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                    <strong>Holiday Notice:</strong> {businessInfo.hours.holiday}
                                </p>
                                <p className="text-sm text-[#D4AF37] font-medium">
                                    <strong>VIP Service:</strong> {businessInfo.hours.emergency}
                                </p>
                            </div>
                        </motion.div>
                    </motion.div>

                    {/* Business Credentials & Stats */}
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-50px" }}
                        className="space-y-8"
                    >
                        {/* Company Stats */}
                        <motion.div
                            variants={itemVariants}
                            className="bg-white dark:bg-black rounded-2xl p-8 border border-gray-200 dark:border-gray-800"
                        >
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
                                Trusted by{' '}
                                <span className="text-[#D4AF37]">Thousands</span>
                            </h3>

                            <div className="grid grid-cols-2 gap-6">
                                {stats.map((stat, index) => {
                                    const IconComponent = stat.icon
                                    return (
                                        <motion.div
                                            key={index}
                                            whileHover={{ scale: 1.05 }}
                                            className="text-center p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-all duration-300"
                                        >
                                            <IconComponent size={32} className="text-[#D4AF37] mx-auto mb-3" />
                                            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                                                {stat.value}
                                            </div>
                                            <div className="text-gray-600 dark:text-gray-400 text-sm">
                                                {stat.label}
                                            </div>
                                        </motion.div>
                                    )
                                })}
                            </div>
                        </motion.div>

                        {/* Certifications */}
                        <motion.div
                            variants={itemVariants}
                            className="bg-white dark:bg-black rounded-2xl p-8 border border-gray-200 dark:border-gray-800"
                        >
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                                <Shield className="text-[#D4AF37]" size={24} />
                                Credentials & Certifications
                            </h3>

                            <div className="space-y-4">
                                <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                                    <p className="font-semibold text-gray-900 dark:text-white mb-1">
                                        {businessInfo.legal.name}
                                    </p>
                                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                                        {businessInfo.legal.registration}
                                    </p>
                                </div>

                                <div className="space-y-3">
                                    {businessInfo.legal.certifications.map((cert, index) => (
                                        <div key={index} className="flex items-center gap-3">
                                            <CheckCircle size={16} className="text-[#D4AF37] flex-shrink-0" />
                                            <span className="text-gray-600 dark:text-gray-400">{cert}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>

                        {/* Service Policies */}
                        <motion.div
                            variants={itemVariants}
                            className="bg-white dark:bg-black rounded-2xl p-8 border border-gray-200 dark:border-gray-800"
                        >
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                                <Users className="text-[#D4AF37]" size={24} />
                                Service Commitments
                            </h3>

                            <div className="space-y-4">
                                {Object.entries(businessInfo.policies).map(([key, policy]) => (
                                    <div key={key} className="flex items-start gap-3">
                                        <CheckCircle size={16} className="text-[#D4AF37] flex-shrink-0 mt-1" />
                                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                            {policy}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Emergency & VIP Contact */}
                        <motion.div
                            variants={itemVariants}
                            className="bg-gradient-to-r from-[#D4AF37]/10 to-transparent dark:from-[#D4AF37]/5 dark:to-transparent rounded-2xl p-8 border border-[#D4AF37]/20"
                        >
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
                                <Calendar className="text-[#D4AF37]" size={24} />
                                VIP Client Services
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h4 className="font-bold text-gray-900 dark:text-white mb-2">
                                        After-Hours Support
                                    </h4>
                                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-3">
                                        Emergency line for time-sensitive custom orders and VIP client needs.
                                    </p>
                                    <a
                                        href="tel:+12125555847"
                                        className="text-[#D4AF37] hover:text-[#FFD700] font-medium transition-colors flex items-center gap-2"
                                    >
                                        <Phone size={16} />
                                        (212) 555-VIPS
                                    </a>
                                </div>

                                <div>
                                    <h4 className="font-bold text-gray-900 dark:text-white mb-2">
                                        Concierge Services
                                    </h4>
                                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-3">
                                        White-glove delivery, insurance coordination, and personal shopping assistance.
                                    </p>
                                    <a
                                        href="mailto:concierge@jasonjewels.com"
                                        className="text-[#D4AF37] hover:text-[#FFD700] font-medium transition-colors flex items-center gap-2"
                                    >
                                        <Mail size={16} />
                                        concierge@jasonjewels.com
                                    </a>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>

                {/* Response Time Guarantee */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    className="mt-16"
                >
                    <motion.div
                        variants={itemVariants}
                        className="bg-white dark:bg-black rounded-2xl p-8 md:p-12 border border-gray-200 dark:border-gray-800 text-center max-w-4xl mx-auto"
                    >
                        <h3 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                            Our{' '}
                            <span className="text-[#D4AF37]">Commitment</span>
                            {' '}to You
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                            <div className="text-center">
                                <div className="text-4xl font-bold text-[#D4AF37] mb-2">2hrs</div>
                                <div className="text-gray-600 dark:text-gray-400">Response Time</div>
                                <div className="text-sm text-gray-500 mt-1">During business hours</div>
                            </div>
                            <div className="text-center">
                                <div className="text-4xl font-bold text-[#D4AF37] mb-2">100%</div>
                                <div className="text-gray-600 dark:text-gray-400">Satisfaction</div>
                                <div className="text-sm text-gray-500 mt-1">Guarantee on all work</div>
                            </div>
                            <div className="text-center">
                                <div className="text-4xl font-bold text-[#D4AF37] mb-2">24/7</div>
                                <div className="text-gray-600 dark:text-gray-400">VIP Support</div>
                                <div className="text-sm text-gray-500 mt-1">For premium orders</div>
                            </div>
                        </div>

                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-8">
                            When you work with Jason & Co., you're not just getting exceptional jewelry –
                            you're gaining a committed partner in bringing your vision to life. Every interaction
                            is designed to exceed your expectations.
                        </p>

                        {/* Legal Links */}
                        <div className="flex flex-wrap justify-center gap-6 text-sm">
                            <a
                                href="/privacy"
                                className="text-[#D4AF37] hover:text-[#FFD700] transition-colors"
                            >
                                Privacy Policy
                            </a>
                            <a
                                href="/terms"
                                className="text-[#D4AF37] hover:text-[#FFD700] transition-colors"
                            >
                                Terms of Service
                            </a>
                            <a
                                href="/warranty"
                                className="text-[#D4AF37] hover:text-[#FFD700] transition-colors"
                            >
                                Warranty Information
                            </a>
                            <a
                                href="/shipping"
                                className="text-[#D4AF37] hover:text-[#FFD700] transition-colors"
                            >
                                Shipping Policy
                            </a>
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    )
}

export default ContactInfo