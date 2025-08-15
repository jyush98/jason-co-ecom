'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Send, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { submitContactInquiry } from '@/utils/api'
import businessInfo from '@/config/businessInfo'

interface ContactFormData {
    name: string
    email: string
    phone: string
    company: string
    subject: string
    message: string
    budget_range: string
    timeline: string
    preferred_contact: string[]
    preferred_location: string
}

const ContactForm = () => {
    const [formData, setFormData] = useState<ContactFormData>({
        name: '',
        email: '',
        phone: '',
        company: '',
        subject: 'general',
        message: '',
        budget_range: '',
        timeline: '',
        preferred_contact: [],
        preferred_location: 'nyc-atelier'
    })

    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
    const [errors, setErrors] = useState<Partial<ContactFormData>>({})

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

    const validateForm = () => {
        const newErrors: Partial<ContactFormData> = {}

        if (!formData.name.trim()) newErrors.name = 'Name is required'
        if (!formData.email.trim()) newErrors.email = 'Email is required'
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Please enter a valid email'
        if (!formData.message.trim()) newErrors.message = 'Message is required'
        if (formData.message.length < 10) newErrors.message = 'Please provide more details (minimum 10 characters)'

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!validateForm()) return

        setIsSubmitting(true)
        setSubmitStatus('idle') // Reset status

        try {
            const response = await submitContactInquiry({
                name: formData.name,
                email: formData.email,
                phone: formData.phone || undefined,
                company: formData.company || undefined,
                subject: formData.subject,
                message: formData.message,
                budget_range: formData.budget_range || undefined,
                timeline: formData.timeline || undefined,
                preferred_location: formData.preferred_location,
                preferred_contact: formData.preferred_contact
            })

            // Check for success - the API should return {success: true, ...} or just succeed with 200
            if (response && (response.success !== false)) {
                setSubmitStatus('success')
                // Reset form after success
                setTimeout(() => {
                    setFormData({
                        name: '', email: '', phone: '', company: '',
                        subject: 'general', message: '', budget_range: '',
                        timeline: '', preferred_contact: [], preferred_location: 'nyc-atelier'
                    })
                    setSubmitStatus('idle')
                }, 5000) // Give user more time to read success message
            } else {
                setSubmitStatus('error')
            }
        } catch (error) {
            console.error('Contact form submission error:', error)
            setSubmitStatus('error')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleInputChange = (field: keyof ContactFormData, value: string | string[]) => {
        setFormData(prev => ({ ...prev, [field]: value }))
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }))
        }
    }

    const toggleContactMethod = (method: string) => {
        const current = formData.preferred_contact
        const updated = current.includes(method)
            ? current.filter(m => m !== method)
            : [...current, method]
        handleInputChange('preferred_contact', updated)
    }

    if (submitStatus === 'success') {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white dark:bg-black rounded-2xl p-8 md:p-12 border border-gray-200 dark:border-gray-800 text-center max-w-2xl mx-auto"
            >
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                >
                    <CheckCircle size={64} className="text-[#D4AF37] mx-auto mb-6" />
                </motion.div>
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                    Message Sent Successfully!
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed mb-6">
                    Thank you for reaching out. We typically respond within 2 hours during business hours.
                    For urgent custom order inquiries, call us directly at{' '}
                    <a href={`tel:${businessInfo.contact.primary.phone}`} className="text-[#D4AF37] hover:text-[#FFD700] transition-colors">
                        {businessInfo.contact.primary.phone}
                    </a>
                </p>
                <button
                    onClick={() => setSubmitStatus('idle')}
                    className="bg-[#D4AF37] hover:bg-[#FFD700] text-black font-medium py-2 px-6 rounded-lg transition-colors"
                >
                    Send Another Message
                </button>
            </motion.div>
        )
    }

    return (
        <section className="py-20 md:py-32 px-6 md:px-20 bg-gray-50 dark:bg-gray-900">
            <div className="max-w-4xl mx-auto">
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
                        Start the{' '}
                        <span className="text-[#D4AF37]">Conversation</span>
                    </motion.h2>
                    <motion.p
                        variants={itemVariants}
                        className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed"
                    >
                        Tell us about your vision and we'll help bring it to life
                    </motion.p>
                </motion.div>

                <motion.form
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-50px" }}
                    onSubmit={handleSubmit}
                    className="bg-white dark:bg-black rounded-2xl p-8 md:p-12 border border-gray-200 dark:border-gray-800 shadow-lg"
                >
                    {/* Name and Email Row */}
                    <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                                Full Name *
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => handleInputChange('name', e.target.value)}
                                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent transition-all duration-300 bg-white dark:bg-black text-gray-900 dark:text-white ${errors.name
                                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                                    : 'border-gray-300 dark:border-gray-600 hover:border-[#D4AF37]'
                                    }`}
                                placeholder="Your full name"
                            />
                            {errors.name && (
                                <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
                                    <AlertCircle size={14} />
                                    {errors.name}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                                Email Address *
                            </label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => handleInputChange('email', e.target.value)}
                                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent transition-all duration-300 bg-white dark:bg-black text-gray-900 dark:text-white ${errors.email
                                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                                    : 'border-gray-300 dark:border-gray-600 hover:border-[#D4AF37]'
                                    }`}
                                placeholder="your.email@domain.com"
                            />
                            {errors.email && (
                                <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
                                    <AlertCircle size={14} />
                                    {errors.email}
                                </p>
                            )}
                        </div>
                    </motion.div>

                    {/* Phone and Company Row */}
                    <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                                Phone Number
                            </label>
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => handleInputChange('phone', e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent transition-all duration-300 bg-white dark:bg-black text-gray-900 dark:text-white hover:border-[#D4AF37]"
                                placeholder="(555) 123-4567"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                                Company (Optional)
                            </label>
                            <input
                                type="text"
                                value={formData.company}
                                onChange={(e) => handleInputChange('company', e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent transition-all duration-300 bg-white dark:bg-black text-gray-900 dark:text-white hover:border-[#D4AF37]"
                                placeholder="Your company name"
                            />
                        </div>
                    </motion.div>

                    {/* Subject and Budget Row */}
                    <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                                Subject
                            </label>
                            <select
                                value={formData.subject}
                                onChange={(e) => handleInputChange('subject', e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent transition-all duration-300 bg-white dark:bg-black text-gray-900 dark:text-white hover:border-[#D4AF37]"
                            >
                                <option value="general">General Inquiry</option>
                                <option value="custom_order">Custom Order</option>
                                <option value="consultation">Design Consultation</option>
                                <option value="support">Customer Support</option>
                                <option value="media">Media & Press</option>
                                <option value="partnership">Business Partnership</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                                Budget Range (Custom Orders)
                            </label>
                            <select
                                value={formData.budget_range}
                                onChange={(e) => handleInputChange('budget_range', e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent transition-all duration-300 bg-white dark:bg-black text-gray-900 dark:text-white hover:border-[#D4AF37]"
                            >
                                <option value="">Select budget range</option>
                                <option value="under_5k">Under $5,000</option>
                                <option value="5k_15k">$5,000 - $15,000</option>
                                <option value="15k_30k">$15,000 - $30,000</option>
                                <option value="30k_50k">$30,000 - $50,000</option>
                                <option value="50k_plus">$50,000+</option>
                                <option value="investment_piece">Investment Piece ($100K+)</option>
                            </select>
                        </div>
                    </motion.div>

                    {/* Timeline and Preferred Location */}
                    <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                                Timeline
                            </label>
                            <select
                                value={formData.timeline}
                                onChange={(e) => handleInputChange('timeline', e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent transition-all duration-300 bg-white dark:bg-black text-gray-900 dark:text-white hover:border-[#D4AF37]"
                            >
                                <option value="">When do you need this?</option>
                                <option value="asap">ASAP / Rush Order</option>
                                <option value="1_month">Within 1 Month</option>
                                <option value="3_months">1-3 Months</option>
                                <option value="6_months">3-6 Months</option>
                                <option value="flexible">Flexible Timeline</option>
                                <option value="special_date">Specific Date/Event</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                                Preferred Location
                            </label>
                            <select
                                value={formData.preferred_location}
                                onChange={(e) => handleInputChange('preferred_location', e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent transition-all duration-300 bg-white dark:bg-black text-gray-900 dark:text-white hover:border-[#D4AF37]"
                            >
                                <option value="nyc-atelier">NYC Atelier</option>
                                <option value="virtual">Virtual Consultation</option>
                                <option value="la-showroom">LA Showroom (Coming Soon)</option>
                                <option value="miami-boutique">Miami Boutique (Coming Soon)</option>
                                <option value="other">Other Location</option>
                            </select>
                        </div>
                    </motion.div>

                    {/* Message */}
                    <motion.div variants={itemVariants} className="mb-6">
                        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                            Tell us about your vision *
                        </label>
                        <textarea
                            value={formData.message}
                            onChange={(e) => handleInputChange('message', e.target.value)}
                            rows={5}
                            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent transition-all duration-300 bg-white dark:bg-black text-gray-900 dark:text-white resize-none ${errors.message
                                ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                                : 'border-gray-300 dark:border-gray-600 hover:border-[#D4AF37]'
                                }`}
                            placeholder="Describe your project, inspiration, or questions. The more details you provide, the better we can assist you..."
                        />
                        {errors.message && (
                            <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
                                <AlertCircle size={14} />
                                {errors.message}
                            </p>
                        )}
                    </motion.div>

                    {/* Preferred Contact Methods */}
                    <motion.div variants={itemVariants} className="mb-8">
                        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-4">
                            How would you prefer we contact you?
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {[
                                { id: 'email', label: 'Email' },
                                { id: 'phone', label: 'Phone Call' },
                                { id: 'text', label: 'Text Message' },
                                { id: 'whatsapp', label: 'WhatsApp' }
                            ].map((method) => (
                                <button
                                    key={method.id}
                                    type="button"
                                    onClick={() => toggleContactMethod(method.id)}
                                    className={`p-3 rounded-lg border text-sm font-medium transition-all duration-300 ${formData.preferred_contact.includes(method.id)
                                        ? 'bg-[#D4AF37] border-[#D4AF37] text-black'
                                        : 'border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white hover:border-[#D4AF37] hover:bg-[#D4AF37]/10'
                                        }`}
                                >
                                    {method.label}
                                </button>
                            ))}
                        </div>
                    </motion.div>

                    {/* Submit Button */}
                    <motion.div variants={itemVariants}>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-[#D4AF37] hover:bg-[#FFD700] text-black font-bold py-4 px-8 rounded-lg transition-all duration-300 hover:scale-105 hover:-translate-y-1 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:translate-y-0 flex items-center justify-center gap-3"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 size={20} className="animate-spin" />
                                    Sending Message...
                                </>
                            ) : (
                                <>
                                    <Send size={20} />
                                    Send Message
                                </>
                            )}
                        </button>

                        {submitStatus === 'error' && (
                            <p className="mt-4 text-red-500 text-center flex items-center justify-center gap-2">
                                <AlertCircle size={16} />
                                There was an error sending your message. Please try again or contact us directly.
                            </p>
                        )}
                    </motion.div>

                    {/* Privacy Notice */}
                    <motion.p
                        variants={itemVariants}
                        className="text-sm text-gray-500 dark:text-gray-400 text-center mt-6"
                    >
                        We respect your privacy. Your information will only be used to respond to your inquiry.
                        Read our <a href="/privacy" className="text-[#D4AF37] hover:text-[#FFD700] transition-colors">Privacy Policy</a>.
                    </motion.p>
                </motion.form>
            </div>
        </section>
    )
}

export default ContactForm