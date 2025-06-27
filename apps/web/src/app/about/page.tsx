'use client'

import { motion } from 'framer-motion'
import MediaImage from './MediaImage'
import { ChevronRight } from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="bg-white text-black dark:bg-black dark:text-white font-sans">
      {/* HERO SECTION */}
      <section className="relative h-screen w-full overflow-hidden flex items-center justify-center text-white">
        <div className="bg-gradient-to-b from-black to-matte absolute inset-0 z-0">
          <div
            className="w-full h-full bg-cover bg-center opacity-40"
            style={{ backgroundImage: 'url("/images/chrome-hearts-jesus/chain-sideways.png")' }}
          />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="z-10 text-center px-6"
        >
          <h1 className="text-5xl md:text-7xl font-sans-sans-serif font-extrabold tracking-tight">
            Jason & Co.
          </h1>
          <p className="mt-4 text-lg md:text-2xl max-w-2xl mx-auto text-gray-200">
            Makers of natural diamond masterpieces — crafted for icons, not followers.
          </p>
        </motion.div>
      </section>

      {/* BRAND STORY */}
      <section className="py-24 px-6 md:px-20 bg-muted text-foreground">
        <motion.div
          className="max-w-5xl mx-auto text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-8">
            Engineered to Stun
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground mb-6">
            Every Jason & Co. piece is a collaboration — between your imagination and our relentless pursuit of perfection.
            From diamond-drenched pendants to finely set watches, every detail is engineered to stun.
          </p>
          <p className="text-lg md:text-xl text-muted-foreground">
            Our workshop fuses street-born energy with red-carpet precision. We don&apos;t follow trends — we stone-set what&rsquo;s next.
          </p>
        </motion.div>
      </section>

      {/* MEDIA GRID */}
      <section className="px-6 md:px-20 py-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex justify-center gap-12">
            <MediaImage image="/images/chrome-hearts-jesus/chain.jpg" alt="chain picture" />
            <MediaImage image="/images/chrome-hearts-jesus/chain-zoom-1.jpg" alt="chain picture" />
            <div className="relative aspect-[9/16] w-full lg:w-1/4 m-4">
              <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover rounded-sm">
                <source src="https://jasonco-inspiration-images.s3.us-east-2.amazonaws.com/content/chrome-chain-black.mp4" type="video/mp4" />
              </video>
            </div>
            <MediaImage image="/images/chrome-hearts-jesus/chain-zoom-2.jpg" alt="chain picture" />
            <MediaImage image="/images/chrome-hearts-jesus/full-piece.jpg" alt="chain picture" />
          </div>
        </motion.div>
      </section>

      {/* CLIENTS / CELEBRITY TRUST */}
      <section className="bg-white text-black py-24 px-6 md:px-20 hidden">
        <motion.div
          className="max-w-5xl mx-auto text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl font-sans-serif font-bold mb-6">Trusted by Icons</h2>
          <p className="text-lg md:text-xl text-gray-700">
            Natural diamond pieces worn by platinum artists, moguls, and trendsetters across the globe.
          </p>
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6 opacity-80">
            <div className="text-xl font-semibold">[Artist Name]</div>
            <div className="text-xl font-semibold">[Athlete Name]</div>
            <div className="text-xl font-semibold">[Brand Partner]</div>
            <div className="text-xl font-semibold">[Celebrity]</div>
          </div>
        </motion.div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 md:px-20 bg-background text-foreground">
        <motion.div
          className="max-w-4xl mx-auto text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Your Vision. Our Craft.
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Whether you&apos;re chasing something never done before or refining a timeless piece — we got you.
          </p>
          <a
            href="/contact"
            className="group w-12 h-12 rounded-full border border-foreground mx-auto flex items-center justify-center transition-colors duration-300 hover:bg-foreground"
          >
            <ChevronRight
              className="text-foreground group-hover:text-background transition-colors duration-300"
              size={20}
            />
          </a>
        </motion.div>
      </section>
    </div>
  )
}