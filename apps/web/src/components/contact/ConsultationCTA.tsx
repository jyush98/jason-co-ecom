'use client'

import { motion } from 'framer-motion'
import { Calendar, Video, MapPin, Star, ArrowRight, Clock, DollarSign } from 'lucide-react'

const ConsultationCTA = () => {
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

    const consultationTypes = [
        {
            id: 'virtual',
            title: 'Virtual Consultation',
            icon: Video,
            duration: '45-60 minutes',
            price: 'Complimentary',
            features: [
                'Screen share design process',
                'Material selection guidance',
                'Budget and timeline discussion',
                'Follow-up summary email'
            ],
            availability: 'Same day available',
            popular: false
        },
        {
            id: 'in-person',
            title: 'In-Person Atelier Visit',
            icon: MapPin,
            duration: '60-90 minutes',
            price: 'Complimentary',
            features: [
                'Handle materials in person',
                'Portfolio review session',
                'VIP atelier tour',
                'Refreshments included'
            ],
            availability: 'Book 2-3 days ahead',
            popular: true
        },
        {
            id: 'premium',
            title: 'Premium Design Session',
            icon: Star,
            duration: '2-3 hours',
            price: '$500 (Applied to order)',
            features: [
                'Dedicated design time',
                'CAD rendering preview',
                'Master craftsman consultation',
                'Priority project timeline'
            ],
            availability: 'Limited availability',
            popular: false
        }
    ]

    const nextAvailableSlots = [
        { day: 'Today', time: '3:00 PM EST', type: 'Virtual' },
        { day: 'Tomorrow', time: '11:00 AM EST', type: 'Virtual' },
        { day: 'Thursday', time: '2:30 PM EST', type: 'In-Person' },
        { day: 'Friday', time: '10:00 AM EST', type: 'Premium' },
    ]

    return (
        <section className="py-20 md:py-32 px-6 md:px-20 bg-gradient-to-br from-black via-gray-900 to-black text-white relative overflow-hidden">
            {/* Background accent */}
            <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-[#D4AF37]/5 to-transparent" />

            <div className="max-w-7xl mx-auto relative z-10">
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
                        className="text-4xl md:text-6xl font-bold mb-6"
                    >
                        Schedule Your{' '}
                        <span className="text-[#D4AF37] font-black">
                            Private Consultation
                        </span>
                    </motion.h2>
                    <motion.p
                        variants={itemVariants}
                        className="text-xl text-gray-300 leading-relaxed max-w-4xl mx-auto"
                    >
                        Experience personalized design guidance from our master craftsmen.
                        Whether virtual or in-person, every consultation is tailored to your vision and timeline.
                    </motion.p>
                </motion.div>

                {/* Consultation Types */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-50px" }}
                    className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16"
                >
                    {consultationTypes.map((consultation) => {
                        const IconComponent = consultation.icon
                        return (
                            <motion.div
                                key={consultation.id}
                                variants={itemVariants}
                                whileHover={{ scale: 1.05, y: -8 }}
                                className={`relative bg-white/10 backdrop-blur-sm rounded-2xl p-8 border transition-all duration-300 hover:shadow-2xl ${consultation.popular
                                        ? 'border-[#D4AF37] bg-[#D4AF37]/5'
                                        : 'border-white/20 hover:border-[#D4AF37]/50'
                                    }`}
                            >
                                {/* Popular Badge */}
                                {consultation.popular && (
                                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 px-4 py-1 bg-[#D4AF37] text-black text-sm font-bold rounded-full">
                                        Most Popular
                                    </div>
                                )}

                                {/* Icon */}
                                <div className="flex justify-center mb-6">
                                    <div className="p-4 bg-[#D4AF37]/20 rounded-2xl">
                                        <IconComponent size={32} className="text-[#D4AF37]" />
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="text-center mb-6">
                                    <h3 className="text-2xl font-bold mb-2">{consultation.title}</h3>
                                    <div className="flex items-center justify-center gap-4 text-sm text-gray-300 mb-4">
                                        <span className="flex items-center gap-1">
                                            <Clock size={14} />
                                            {consultation.duration}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <DollarSign size={14} />
                                            {consultation.price}
                                        </span>
                                    </div>
                                    <p className="text-[#D4AF37] font-medium text-sm mb-4">
                                        {consultation.availability}
                                    </p>
                                </div>

                                {/* Features */}
                                <div className="space-y-3 mb-8">
                                    {consultation.features.map((feature, index) => (
                                        <div key={index} className="flex items-center gap-3">
                                            <div className="w-2 h-2 bg-[#D4AF37] rounded-full flex-shrink-0" />
                                            <span className="text-gray-300 text-sm">{feature}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Action Button */}
                                <button
                                    className={`w-full py-3 px-6 rounded-lg font-bold transition-all duration-300 hover:scale-105 hover:-translate-y-1 hover:shadow-xl flex items-center justify-center gap-2 ${consultation.popular
                                            ? 'bg-[#D4AF37] text-black hover:bg-[#FFD700]'
                                            : 'border-2 border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black'
                                        }`}
                                >
                                    <Calendar size={18} />
                                    Book {consultation.title.split(' ')[0]}
                                    <ArrowRight size={16} />
                                </button>
                            </motion.div>
                        )
                    })}
                </motion.div>

                {/* Quick Booking Section */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 md:p-12 border border-white/20"
                >
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        {/* Quick Booking Info */}
                        <div>
                            <motion.h3
                                variants={itemVariants}
                                className="text-3xl md:text-4xl font-bold mb-6"
                            >
                                Next Available{' '}
                                <span className="text-[#D4AF37]">Appointments</span>
                            </motion.h3>
                            <motion.p
                                variants={itemVariants}
                                className="text-gray-300 text-lg leading-relaxed mb-8"
                            >
                                Don't wait weeks for your consultation. We have immediate availability
                                for both virtual and in-person sessions this week.
                            </motion.p>

                            {/* Available Slots */}
                            <motion.div variants={itemVariants} className="space-y-3">
                                {nextAvailableSlots.map((slot, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10 hover:border-[#D4AF37]/50 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-3 h-3 bg-[#D4AF37] rounded-full" />
                                            <span className="font-medium">{slot.day}</span>
                                            <span className="text-gray-400">•</span>
                                            <span className="text-gray-300">{slot.time}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[#D4AF37] text-sm font-medium">{slot.type}</span>
                                            <ArrowRight size={14} className="text-gray-400" />
                                        </div>
                                    </div>
                                ))}
                            </motion.div>
                        </div>

                        {/* Quick Action */}
                        <motion.div variants={itemVariants} className="text-center lg:text-left">
                            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                                <Calendar size={48} className="text-[#D4AF37] mx-auto lg:mx-0 mb-6" />

                                <h4 className="text-2xl font-bold mb-4">
                                    Book in Under 2 Minutes
                                </h4>
                                <p className="text-gray-300 mb-6 leading-relaxed">
                                    Choose your preferred time, consultation type, and project details.
                                    We'll send a confirmation with preparation materials.
                                </p>

                                {/* Booking Benefits */}
                                <div className="space-y-2 mb-8">
                                    <div className="flex items-center gap-2 text-sm">
                                        <div className="w-1.5 h-1.5 bg-[#D4AF37] rounded-full" />
                                        <span className="text-gray-300">No obligation consultation</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <div className="w-1.5 h-1.5 bg-[#D4AF37] rounded-full" />
                                        <span className="text-gray-300">Investment range discussion</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <div className="w-1.5 h-1.5 bg-[#D4AF37] rounded-full" />
                                        <span className="text-gray-300">Design feasibility review</span>
                                    </div>
                                </div>

                                {/* Primary CTA */}
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="w-full bg-[#D4AF37] hover:bg-[#FFD700] text-black font-bold py-4 px-8 rounded-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl flex items-center justify-center gap-3 text-lg"
                                >
                                    <Calendar size={20} />
                                    Schedule Private Consultation
                                    <ArrowRight size={18} />
                                </motion.button>

                                {/* Secondary Action */}
                                <p className="text-center mt-4 text-gray-400 text-sm">
                                    Or call us directly at{' '}
                                    <a
                                        href="tel:+12125554653"
                                        className="text-[#D4AF37] hover:text-[#FFD700] font-medium transition-colors"
                                    >
                                        (212) 555-GOLD
                                    </a>
                                </p>
                            </div>
                        </motion.div>
                    </div>
                </motion.div>

                {/* Investment Range Guidance */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    className="mt-16 text-center"
                >
                    <motion.div
                        variants={itemVariants}
                        className="max-w-4xl mx-auto"
                    >
                        <h3 className="text-2xl md:text-3xl font-bold mb-8">
                            Investment Range{' '}
                            <span className="text-[#D4AF37]">Guidance</span>
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[
                                { range: '$5K - $15K', type: 'Custom Rings', popular: 'Most Popular' },
                                { range: '$15K - $30K', type: 'Statement Pieces', popular: 'High Impact' },
                                { range: '$30K - $50K', type: 'Signature Collections', popular: 'Luxury' },
                                { range: '$50K+', type: 'Investment Art', popular: 'Ultra-Luxury' }
                            ].map((tier, index) => (
                                <motion.div
                                    key={index}
                                    variants={itemVariants}
                                    whileHover={{ scale: 1.05, y: -4 }}
                                    className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-[#D4AF37]/50 transition-all duration-300"
                                >
                                    <div className="text-2xl font-bold text-[#D4AF37] mb-2">
                                        {tier.range}
                                    </div>
                                    <div className="text-white font-medium mb-2">
                                        {tier.type}
                                    </div>
                                    <div className="text-[#D4AF37] text-sm font-medium">
                                        {tier.popular}
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        <motion.p
                            variants={itemVariants}
                            className="text-gray-300 mt-8 text-lg leading-relaxed"
                        >
                            Every project begins with understanding your vision and budget.
                            Our consultations help define the perfect investment level for your unique piece.
                        </motion.p>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    )
}

export default ConsultationCTA