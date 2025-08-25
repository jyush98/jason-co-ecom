'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import {
    Phone,
    Mail,
    Clock,
    Shield,
    Award,
    Users,
    Calendar,
    ExternalLink,
    CheckCircle,
    Loader2,
    AlertCircle
} from 'lucide-react'
import { getBusinessHours } from '@/utils/api'
// ✅ FIXED: Import from centralized business configuration
import {
    businessInfo,
    EMAIL_ADDRESSES,
} from '@/config/businessInfo'
import { createEntranceAnimation, createStaggerContainer } from '@/lib/animations'

interface BusinessHours {
    [key: string]: string
}

interface BusinessHoursResponse {
    hours: BusinessHours
    holiday_notice?: string
    emergency_notice?: string
    timezone?: string
}

const ContactInfo = () => {
    const [businessHours, setBusinessHours] = useState<BusinessHours | null>(null)
    const [hoursLoading, setHoursLoading] = useState(true)
    const [hoursError, setHoursError] = useState(false)
    const [holidayNotice, setHolidayNotice] = useState<string>('')
    const [emergencyNotice, setEmergencyNotice] = useState<string>('')

    const containerVariants = createStaggerContainer(0.1, 0.3);
    const itemVariants = createEntranceAnimation(20, 1, 0.6);

    // Load business hours from API
    useEffect(() => {
        const loadBusinessHours = async () => {
            try {
                const response: BusinessHoursResponse = await getBusinessHours()
                if (response && response.hours) {
                    setBusinessHours(response.hours)
                    setHolidayNotice(response.holiday_notice || "Holiday hours may vary. Call ahead during major holidays.")
                    setEmergencyNotice(response.emergency_notice || "VIP emergency line available 24/7 for orders $25,000+")
                } else {
                    // ✅ FIXED: Use centralized business hours
                    const staticHours = businessInfo.locations.headquarters.hours
                    const formattedHours = {
                        "Monday - Friday": `${staticHours.monday} - ${staticHours.friday}`,
                        "Saturday": staticHours.saturday,
                        "Sunday": staticHours.sunday
                    }
                    setBusinessHours(formattedHours)
                }
            } catch (error) {
                console.error('Failed to load business hours:', error)
                setHoursError(true)
                // ✅ FIXED: Fallback to centralized business hours
                const staticHours = businessInfo.locations.headquarters.hours
                const formattedHours = {
                    "Monday - Friday": `${staticHours.monday}`,
                    "Saturday": staticHours.saturday,
                    "Sunday": staticHours.sunday
                }
                setBusinessHours(formattedHours)
            } finally {
                setHoursLoading(false)
            }
        }

        loadBusinessHours()
    }, [])

    // ✅ FIXED: Updated business credentials with correct information
    const businessCredentials = {
        legal: {
            name: businessInfo.legal.businessName,
            registration: businessInfo.legal.registrationNumber,
            insurance: "Fully insured and bonded",
            certifications: [
                "Gemological Institute of America (GIA) Certified",
                "Better Business Bureau A+ Rating",
                "Licensed Luxury Jewelry Retailer"
            ]
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
                        Here's everything you need to know about working with {businessInfo.company.name}.
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
                                        href={`mailto:${EMAIL_ADDRESSES.INFO}`}
                                        className="text-[#D4AF37] hover:text-[#FFD700] font-medium transition-colors"
                                    >
                                        {EMAIL_ADDRESSES.INFO}
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

                        {/* Business Hours - Dynamic */}
                        <motion.div
                            variants={itemVariants}
                            className="bg-white dark:bg-black rounded-2xl p-8 border border-gray-200 dark:border-gray-800 hover:border-[#D4AF37] hover:shadow-lg transition-all duration-300"
                        >
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                                <Clock className="text-[#D4AF37]" size={24} />
                                Business Hours
                                {hoursLoading && <Loader2 size={16} className="animate-spin text-[#D4AF37]" />}
                            </h3>

                            {hoursLoading ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 size={24} className="animate-spin text-[#D4AF37]" />
                                    <span className="ml-2 text-gray-600 dark:text-gray-400">Loading hours...</span>
                                </div>
                            ) : hoursError ? (
                                <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg mb-4">
                                    <AlertCircle size={16} className="text-red-500" />
                                    <span className="text-red-700 dark:text-red-400 text-sm">
                                        Unable to load current hours. Showing standard hours.
                                    </span>
                                </div>
                            ) : null}

                            <div className="space-y-3">
                                {businessHours && Object.entries(businessHours).map(([days, hours]) => (
                                    <div key={days} className="flex justify-between items-center">
                                        <span className="text-gray-600 dark:text-gray-400 font-medium">{days}</span>
                                        <span className="text-gray-900 dark:text-white">{hours}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                    <strong>Holiday Notice:</strong> {holidayNotice}
                                </p>
                                <p className="text-sm text-[#D4AF37] font-medium">
                                    <strong>VIP Service:</strong> {emergencyNotice}
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
                                        {businessCredentials.legal.name}
                                    </p>
                                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                                        {businessCredentials.legal.registration}
                                    </p>
                                </div>

                                <div className="space-y-3">
                                    {businessCredentials.legal.certifications.map((cert, index) => (
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
                                {Object.entries(businessCredentials.policies).map(([key, policy]) => (
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
                                        href={`tel:${businessInfo.contact.primary.phone.replace(/\D/g, '')}`}
                                        className="text-[#D4AF37] hover:text-[#FFD700] font-medium transition-colors flex items-center gap-2"
                                    >
                                        <Phone size={16} />
                                        {businessInfo.contact.primary.phone}
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
                                        href={`mailto:${EMAIL_ADDRESSES.CUSTOM}`}
                                        className="text-[#D4AF37] hover:text-[#FFD700] font-medium transition-colors flex items-center gap-2"
                                    >
                                        <Mail size={16} />
                                        {EMAIL_ADDRESSES.CUSTOM}
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
                            When you work with {businessInfo.company.name}, you're not just getting exceptional jewelry –
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
                                href="/returns"
                                className="text-[#D4AF37] hover:text-[#FFD700] transition-colors"
                            >
                                Returns Policy
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