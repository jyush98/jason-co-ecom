'use client'

import { motion } from 'framer-motion'
import { MapPin, Phone, Mail, Clock, ArrowRight, Bell } from 'lucide-react'
import { useState } from 'react'

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

    const locations: Location[] = [
        {
            id: "nyc-atelier",
            name: "Jason & Co. Atelier",
            status: "open",
            city: "Manhattan",
            state: "NY",
            address: {
                street: "123 Madison Avenue, Suite 456",
                city: "New York",
                state: "NY",
                zip: "10016"
            },
            contact: {
                phone: "(212) 555-GOLD",
                email: "manhattan@jasonjewels.com"
            },
            hours: {
                "Monday": "10:00 AM - 7:00 PM",
                "Tuesday": "10:00 AM - 7:00 PM",
                "Wednesday": "10:00 AM - 7:00 PM",
                "Thursday": "10:00 AM - 7:00 PM",
                "Friday": "10:00 AM - 7:00 PM",
                "Saturday": "10:00 AM - 6:00 PM",
                "Sunday": "By Appointment Only"
            },
            features: [
                "Private design consultations",
                "Custom order showroom",
                "Expert craftsmen on-site",
                "VIP client lounge"
            ]
        },
        {
            id: "la-showroom",
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

        try {
            await fetch('/api/contact/location-notify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, location_id: locationId })
            })

            // Clear email input and show success
            setNotifyEmails(prev => ({ ...prev, [locationId]: '' }))
            // Could add toast notification here
        } catch (error) {
            console.error('Failed to sign up for notifications:', error)
        }
    }

    const renderCurrentLocation = (location: Location) => (
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
                <div className="px-3 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-full text-sm font-medium">
                    Open Now
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
                                {location.address.city}, {location.address.state} {location.address.zip}
                            </p>
                            <button className="text-[#D4AF37] hover:text-[#FFD700] text-sm font-medium mt-2 transition-colors">
                                Get Directions →
                            </button>
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
                                <span className="text-gray-600 dark:text-gray-400 font-medium">{day}</span>
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

    const renderFutureLocation = (location: Location) => (
        <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.02, y: -4 }}
            className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/50 dark:to-gray-800/50 rounded-2xl p-8 border border-gray-200 dark:border-gray-700 hover:border-[#D4AF37] hover:shadow-xl transition-all duration-300 relative overflow-hidden"
        >
            {/* Coming Soon Badge */}
            <div className="absolute top-4 right-4 px-3 py-1 bg-[#D4AF37] text-black rounded-full text-sm font-bold">
                Coming Soon
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
                <div className="flex gap-2">
                    <input
                        type="email"
                        value={notifyEmails[location.id] || ''}
                        onChange={(e) => setNotifyEmails(prev => ({ ...prev, [location.id]: e.target.value }))}
                        placeholder="your.email@domain.com"
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent transition-all duration-300 bg-white dark:bg-black"
                    />
                    <button
                        onClick={() => handleNotifySignup(location.id)}
                        className="px-4 py-2 bg-[#D4AF37] hover:bg-[#FFD700] text-black font-medium rounded-lg transition-all duration-300 hover:scale-105 flex items-center gap-1"
                    >
                        <Bell size={16} />
                        Notify
                    </button>
                </div>
            </div>
        </motion.div>
    )

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
                        <span className="text-[#D4AF37]">Ateliers</span>
                    </motion.h2>
                    <motion.p
                        variants={itemVariants}
                        className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed max-w-3xl mx-auto"
                    >
                        Experience luxury jewelry design in our expertly crafted spaces.
                        From our flagship NYC atelier to exciting new locations coming soon.
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
                    {/* Current Location - Full Details */}
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
                        .map(location => renderFutureLocation(location))}
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
                            Our vision extends beyond borders. As we grow, we're bringing the Jason & Co.
                            experience to luxury markets worldwide, always maintaining our commitment to
                            exceptional craftsmanship and personalized service.
                        </p>

                        {/* Global Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="text-center">
                                <div className="text-3xl md:text-4xl font-bold text-[#D4AF37] mb-2">4</div>
                                <div className="text-gray-600 dark:text-gray-400">Planned Locations</div>
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