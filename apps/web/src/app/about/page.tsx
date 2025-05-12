'use client'

import { motion } from 'framer-motion'
import MediaImage from './MediaImage'

export default function AboutPage() {
  return (
    <div className="bg-black text-white font-sans">
      {/* HERO SECTION */}
      <section className="relative h-screen w-full overflow-hidden flex items-center justify-center">
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
      <section className="py-24 px-6 md:px-20 bg-gradient-to-b from-matte to-black text-white">
        <motion.div
          className="max-w-5xl mx-auto text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl font-sans-serif font-bold mb-8">Where Vision Meets Precision</h2>
          <p className="text-lg md:text-xl text-gray-300">
            Every Jason & Co. piece is a collaboration — between your imagination and our relentless pursuit of perfection.
            From diamond-drenched pendants to finely set watches, every detail is engineered to stun.
          </p>
        </motion.div>
      </section>

      {/* MEDIA GRID */}
      <section className="px-6 md:px-20 pb-24">
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
              <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover rounded-md">
                <source src="/videos/chrome.mov" type="video/mp4" />
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
      <section className="py-24 px-6 md:px-20 bg-gradient-to-b from-black to-matte text-white">
        <motion.div
          className="max-w-4xl mx-auto text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-sans-serif font-bold mb-4">
            Your Vision. Our Craft.
          </h2>
          <p className="text-lg text-gray-300 mb-8">
            {"Whether you're chasing something never done before or refining a timeless piece — we got you."}
          </p>
          <a
            href="/contact"
            className="shimmer-hover inline-block bg-white text-black px-8 py-3 rounded-full font-semibold hover:bg-neutral-200 transition"
          >
            Start Your Custom Piece
          </a>
        </motion.div>
      </section>
    </div>
  )
}