'use client'

import { motion } from 'framer-motion'
import { MapPin, Phone, Mail, Clock, ArrowRight, Bell, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { subscribeLocationNotification } from '@/utils/api'
import { businessInfo, EMAIL_ADDRESSES, formatAddress, getGoogleMapsLink, isBusinessOpen } from '@/config/businessInfo'

interface Location {
    id: string
    name: string
    status: 'open' | 'coming_soon' | 'planning'
    city: string
    state?: string
    country?: string
    address?: {
        street: string
        city: string
        state: string
        zip: string
        country: string
    }
    contact?: {
        phone: string
        email: string
    }
    hours?: {
        [key: string]: string
    }
    features: string[]
    expectedOpen?: string
    image?: string
}

const LocationsGrid = () => {
    const [notifyEmails, setNotifyEmails] = useState<{ [key: string]: string }>({})
    const [notifyStatus, setNotifyStatus] = useState<{ [key: string]: 'idle' | 'loading' | 'success' | 'error' }>({})

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.15, delayChildren: 0.3 }
        }
    }

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.7, ease: "easeOut" }
        }
    }

    // ✅ FIXED: Use centralized business information for all locations
    const locations: Location[] = [
        {
            id: "headquarters",
            name: businessInfo.locations.headquarters.name,
            status: "open",
            city: businessInfo.locations.headquarters.address.city,
            state: businessInfo.locations.headquarters.address.state,
            address: businessInfo.locations.headquarters.address,
            contact: {
                phone: businessInfo.locations.headquarters.phone || businessInfo.contact.primary.phone,
                email: businessInfo.locations.headquarters.email || EMAIL_ADDRESSES.INFO
            },
            hours: businessInfo.locations.headquarters.hours,
            features: [
                "Private design consultations",
                "Custom order showroom",
                "Expert craftsmen on-site",
                "VIP client lounge"
            ]
        },
        // ✅ FIXED: Update showrooms to use centralized data
        ...businessInfo.locations.showrooms.map((showroom, index) => ({
            id: `showroom-${index}`,
            name: showroom.name,
            status: "open" as const,
            city: showroom.address.city,
            state: showroom.address.state,
            address: showroom.address,
            contact: {
                phone: showroom.phone || businessInfo.contact.primary.phone,
                email: showroom.email || EMAIL_ADDRESSES.INFO
            },
            hours: showroom.hours,
            features: [
                "Luxury showroom experience",
                "Personal shopping service",
                "Expert consultation",
                "Appointment scheduling"
            ]
        })),
        // ✅ Future locations - updated with correct email domains
        {
            id: "la-showroom-future",
            name: "Los Angeles Showroom",
            status: "coming_soon",
            city: "Beverly Hills",
            state: "CA",
            expectedOpen: "Fall 2025",
            features: [
                "Celebrity clientele focus",
                "West Coast design studio",
                "Hollywood glamour aesthetic",
                "Private viewing suites"
            ]
        },
        {
            id: "miami-boutique",
            name: "Miami Beach Boutique",
            status: "coming_soon",
            city: "Miami Beach",
            state: "FL",
            expectedOpen: "Winter 2025",
            features: [
                "Beachfront luxury location",
                "Latin luxury market",
                "Art Deco inspired space",
                "Yacht delivery services"
            ]
        },
        {
            id: "london-atelier",
            name: "London Atelier",
            status: "planning",
            city: "Mayfair",
            country: "United Kingdom",
            expectedOpen: "2026",
            features: [
                "European market entry",
                "Royal district prestige",
                "British luxury heritage",
                "International shipping hub"
            ]
        }
    ]

    const handleNotifySignup = async (locationId: string) => {
        const email = notifyEmails[locationId]
        if (!email || !/\S+@\S+\.\S+/.test(email)) return

        setNotifyStatus(prev => ({ ...prev, [locationId]: 'loading' }))

        try {
            const response = await subscribeLocationNotification({
                email,
                location_id: locationId
            })

            if (response && (response.success !== false)) {
                setNotifyStatus(prev => ({ ...prev, [locationId]: 'success' }))
                setNotifyEmails(prev => ({ ...prev, [locationId]: '' }))

                // Reset success status after 3 seconds
                setTimeout(() => {
                    setNotifyStatus(prev => ({ ...prev, [locationId]: 'idle' }))
                }, 3000)
            } else {
                setNotifyStatus(prev => ({ ...prev, [locationId]: 'error' }))
            }
        } catch (error) {
            console.error('Failed to sign up for notifications:', error)
            setNotifyStatus(prev => ({ ...prev, [locationId]: 'error' }))
        }
    }

    const renderCurrentLocation = (location: Location) => {
        // ✅ FIXED: Use dynamic business hours check
        const isOpen = location.id === 'headquarters'
            ? isBusinessOpen(businessInfo.locations.headquarters)
            : isBusinessOpen(businessInfo.locations.showrooms.find(s => s.name === location.name) || businessInfo.locations.headquarters)

        return (
            <motion.div
                variants={itemVariants}
                whileHover={{ scale: 1.02, y: -4 }}
                className="bg-white dark:bg-black rounded-2xl p-8 border border-gray-200 dark:border-gray-800 hover:border-[#D4AF37] hover:shadow-xl transition-all duration-300"
            >
                {/* Location Header */}
                <div className="flex items-start justify-between mb-6">
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                            {location.name}
                        </h3>
                        <div className="flex items-center gap-2 text-[#D4AF37] font-medium">
                            <MapPin size={16} />
                            <span>{location.city}, {location.state}</span>
                        </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${isOpen
                            ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                            : 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                        }`}>
                        {isOpen ? 'Open Now' : 'Closed'}
                    </div>
                </div>

                {/* Address */}
                {location.address && (
                    <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                        <div className="flex items-start gap-3">
                            <MapPin size={18} className="text-[#D4AF37] mt-1 flex-shrink-0" />
                            <div>
                                <p className="text-gray-900 dark:text-white font-medium">
                                    {location.address.street}
                                </p>
                                <p className="text-gray-600 dark:text-gray-400">
                                    {formatAddress(location.address)}
                                </p>
                                <a
                                    href={getGoogleMapsLink({ address: location.address } as any)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[#D4AF37] hover:text-[#FFD700] text-sm font-medium mt-2 transition-colors inline-flex items-center gap-1"
                                >
                                    Get Directions <ArrowRight size={14} />
                                </a>
                            </div>
                        </div>
                    </div>
                )}

                {/* Contact Info */}
                {location.contact && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <a
                            href={`tel:${location.contact.phone.replace(/\D/g, '')}`}
                            className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors group"
                        >
                            <Phone size={18} className="text-[#D4AF37] group-hover:scale-110 transition-transform" />
                            <span className="text-gray-900 dark:text-white font-medium">
                                {location.contact.phone}
                            </span>
                        </a>

                        <a
                            href={`mailto:${location.contact.email}`}
                            className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors group"
                        >
                            <Mail size={18} className="text-[#D4AF37] group-hover:scale-110 transition-transform" />
                            <span className="text-gray-900 dark:text-white font-medium">
                                Email Us
                            </span>
                        </a>
                    </div>
                )}

                {/* Business Hours */}
                {location.hours && (
                    <div className="mb-6">
                        <div className="flex items-center gap-2 mb-3">
                            <Clock size={18} className="text-[#D4AF37]" />
                            <h4 className="font-semibold text-gray-900 dark:text-white">Business Hours</h4>
                        </div>
                        <div className="space-y-1">
                            {Object.entries(location.hours).map(([day, hours]) => (
                                <div key={day} className="flex justify-between items-center py-1">
                                    <span className="text-gray-600 dark:text-gray-400 font-medium capitalize">{day}</span>
                                    <span className="text-gray-900 dark:text-white">{hours}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Features */}
                <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Services Available</h4>
                    <div className="space-y-2">
                        {location.features.map((feature, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-[#D4AF37] rounded-full flex-shrink-0" />
                                <span className="text-gray-600 dark:text-gray-400">{feature}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </motion.div>
        )
    }

    const renderFutureLocation = (location: Location) => {
        const status = notifyStatus[location.id] || 'idle'

        return (
            <motion.div
                variants={itemVariants}
                whileHover={{ scale: 1.02, y: -4 }}
                className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/50 dark:to-gray-800/50 rounded-2xl p-8 border border-gray-200 dark:border-gray-700 hover:border-[#D4AF37] hover:shadow-xl transition-all duration-300 relative overflow-hidden"
            >
                {/* Coming Soon Badge */}
                <div className="absolute top-4 right-4 px-3 py-1 bg-[#D4AF37] text-black rounded-full text-sm font-bold">
                    {location.status === 'planning' ? 'In Planning' : 'Coming Soon'}
                </div>

                {/* Location Header */}
                <div className="mb-6">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        {location.name}
                    </h3>
                    <div className="flex items-center gap-2 text-[#D4AF37] font-medium">
                        <MapPin size={16} />
                        <span>{location.city}{location.state && `, ${location.state}`}{location.country && `, ${location.country}`}</span>
                    </div>
                    {location.expectedOpen && (
                        <p className="text-gray-600 dark:text-gray-400 mt-2">
                            Expected Opening: <span className="font-medium">{location.expectedOpen}</span>
                        </p>
                    )}
                </div>

                {/* Features Preview */}
                <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Planned Features</h4>
                    <div className="space-y-2">
                        {location.features.map((feature, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-[#D4AF37] rounded-full flex-shrink-0" />
                                <span className="text-gray-600 dark:text-gray-400">{feature}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Notify Me Section */}
                <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <Bell size={16} className="text-[#D4AF37]" />
                        Get Notified When We Open
                    </h4>

                    {status === 'success' ? (
                        <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                            <CheckCircle size={20} className="text-green-600 dark:text-green-400" />
                            <span className="text-green-700 dark:text-green-400 font-medium">
                                You're subscribed! We'll notify you when we open.
                            </span>
                        </div>
                    ) : (
                        <>
                            <div className="flex gap-2">
                                <input
                                    type="email"
                                    value={notifyEmails[location.id] || ''}
                                    onChange={(e) => setNotifyEmails(prev => ({ ...prev, [location.id]: e.target.value }))}
                                    placeholder="your.email@domain.com"
                                    disabled={status === 'loading'}
                                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent transition-all duration-300 bg-white dark:bg-black text-gray-900 dark:text-white disabled:opacity-50"
                                />
                                <button
                                    onClick={() => handleNotifySignup(location.id)}
                                    disabled={status === 'loading' || !notifyEmails[location.id]?.trim()}
                                    className="px-4 py-2 bg-[#D4AF37] hover:bg-[#FFD700] text-black font-medium rounded-lg transition-all duration-300 hover:scale-105 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                                >
                                    {status === 'loading' ? (
                                        <Loader2 size={16} className="animate-spin" />
                                    ) : (
                                        <Bell size={16} />
                                    )}
                                    {status === 'loading' ? 'Subscribing...' : 'Notify'}
                                </button>
                            </div>

                            {status === 'error' && (
                                <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                                    <AlertCircle size={16} className="text-red-600 dark:text-red-400" />
                                    <span className="text-red-700 dark:text-red-400 text-sm">
                                        Failed to subscribe. Please try again.
                                    </span>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </motion.div>
        )
    }

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
                        Visit Our{' '}
                        <span className="text-[#D4AF37]">Locations</span>
                    </motion.h2>
                    <motion.p
                        variants={itemVariants}
                        className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed max-w-3xl mx-auto"
                    >
                        Experience luxury jewelry design in our expertly crafted spaces.
                        From our flagship locations to exciting new showrooms coming soon.
                    </motion.p>
                </motion.div>

                {/* Locations Grid */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-50px" }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-8"
                >
                    {/* Current Locations - Full Details */}
                    {locations
                        .filter(location => location.status === 'open')
                        .map(location => (
                            <div key={location.id} className="md:col-span-2">
                                {renderCurrentLocation(location)}
                            </div>
                        ))}

                    {/* Future Locations */}
                    {locations
                        .filter(location => location.status !== 'open')
                        .map(location => (
                            <div key={location.id}>
                                {renderFutureLocation(location)}
                            </div>
                        ))}
                </motion.div>

                {/* Contact Information Section */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    className="mt-16"
                >
                    <motion.div
                        variants={itemVariants}
                        className="bg-white dark:bg-black rounded-2xl p-8 border border-gray-200 dark:border-gray-800 text-center"
                    >
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                            Questions About Our Locations?
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            Our team can help you plan your visit or answer questions about our services.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                            <a
                                href={`tel:${businessInfo.contact.primary.phone.replace(/\D/g, '')}`}
                                className="inline-flex items-center gap-2 bg-[#D4AF37] hover:bg-[#FFD700] text-black font-semibold px-6 py-3 rounded-lg transition-colors"
                            >
                                <Phone size={18} />
                                {businessInfo.contact.primary.phone}
                            </a>
                            <a
                                href={`mailto:${EMAIL_ADDRESSES.INFO}`}
                                className="inline-flex items-center gap-2 border border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black font-semibold px-6 py-3 rounded-lg transition-colors"
                            >
                                <Mail size={18} />
                                {EMAIL_ADDRESSES.INFO}
                            </a>
                        </div>
                    </motion.div>
                </motion.div>

                {/* Expansion Vision */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    className="mt-16 text-center"
                >
                    <motion.div
                        variants={itemVariants}
                        className="bg-white dark:bg-black rounded-2xl p-8 md:p-12 border border-gray-200 dark:border-gray-800 max-w-4xl mx-auto"
                    >
                        <h3 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                            Expanding{' '}
                            <span className="text-[#D4AF37]">Worldwide</span>
                        </h3>
                        <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed mb-8">
                            Our vision extends beyond borders. As we grow, we're bringing the {businessInfo.company.name}
                            experience to luxury markets worldwide, always maintaining our commitment to
                            exceptional craftsmanship and personalized service.
                        </p>

                        {/* Global Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="text-center">
                                <div className="text-3xl md:text-4xl font-bold text-[#D4AF37] mb-2">
                                    {businessInfo.locations.showrooms.length + 3}
                                </div>
                                <div className="text-gray-600 dark:text-gray-400">Total Planned Locations</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl md:text-4xl font-bold text-[#D4AF37] mb-2">3</div>
                                <div className="text-gray-600 dark:text-gray-400">Continents</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl md:text-4xl font-bold text-[#D4AF37] mb-2">2025</div>
                                <div className="text-gray-600 dark:text-gray-400">Next Opening</div>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    )
}

export default LocationsGrid