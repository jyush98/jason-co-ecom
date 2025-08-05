import type { Metadata } from 'next'
import {
  AboutHero,
  OurStory,
  ServicesSection,
  ValuesSection,
  ProcessSection,
  MediaGrid,
  AboutCTA
} from '@/components/about'

// SEO metadata following established patterns
export const metadata: Metadata = {
  title: "About Jason & Co. | Where Ambition Meets Artistry",
  description: "Discover the story behind Jason & Co.'s custom luxury jewelry. NYC-based atelier specializing in bespoke pieces that transform ambition into artistry.",
  keywords: "custom jewelry NYC, luxury jewelry design, bespoke jewelry, Jason & Co, WHERE AMBITION MEETS ARTISTRY",
  openGraph: {
    title: "About Jason & Co. | Where Ambition Meets Artistry",
    description: "NYC-based luxury jewelry atelier. Custom pieces engineered to stun.",
    images: [
      {
        url: "/images/chrome-hearts-jesus/chain.jpg",
        width: 1200,
        height: 630,
        alt: "Jason & Co. custom jewelry craftsmanship"
      }
    ]
  }
}

export default function AboutPage() {
  return (
    <div className="bg-white dark:bg-black text-gray-800 dark:text-gray-200 font-sans">
      <AboutHero />
      <OurStory />
      <ServicesSection />
      <MediaGrid />
      <ValuesSection />
      <ProcessSection />
      <AboutCTA />
    </div>
  )
}