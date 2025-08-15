import type { Metadata } from 'next'
import {
    ContactHero,
    ContactForm,
    LocationsGrid,
    ContactMethods,
    ConsultationCTA,
    ContactInfo
} from '@/components/contact'

export const metadata: Metadata = {
    title: "Contact Jason & Co. | Schedule Your Private Consultation",
    description: "Connect with Jason & Co.'s luxury jewelry experts. Schedule private consultations, visit our NYC atelier, or start your custom design journey. Multiple contact methods available.",
    keywords: "contact luxury jewelry, schedule jewelry consultation, custom jewelry inquiry, Jason Co NYC, jewelry design consultation, luxury jewelry contact",
    openGraph: {
        title: "Contact Jason & Co. | Schedule Your Private Consultation",
        description: "Connect with Jason & Co.'s luxury jewelry experts. Schedule private consultations, visit our NYC atelier, or start your custom design journey.",
        images: [
            {
                url: "/images/contact-og.jpg",
                width: 1200,
                height: 630,
                alt: "Contact Jason & Co. - Luxury Jewelry Consultations"
            }
        ],
        type: "website"
    },
    twitter: {
        card: "summary_large_image",
        title: "Contact Jason & Co. | Schedule Your Private Consultation",
        description: "Connect with Jason & Co.'s luxury jewelry experts. Schedule consultations, visit our NYC atelier, or start your custom design journey.",
        images: ["/images/contact-twitter.jpg"]
    },
    alternates: {
        canonical: `${process.env.NEXT_PUBLIC_BASE_URL}/contact`
    }
}

export default function ContactPage() {
    return (
        <main className="min-h-screen">
            {/* Hero Section - Premium brand immersion */}
            <ContactHero />

            {/* Contact Form - Primary conversion driver */}
            <ContactForm />

            {/* Consultation CTA - High-value service booking */}
            <ConsultationCTA />

            {/* Locations Grid - Current NYC + future expansion */}
            <LocationsGrid />

            {/* Contact Methods - Multi-channel communication */}
            <ContactMethods />

            {/* Business Info - Credibility and transparency */}
            <ContactInfo />
        </main>
    )
}