'use client'

import { motion } from 'framer-motion'
import { useKeenSlider } from 'keen-slider/react'
import 'keen-slider/keen-slider.min.css'
import Image from 'next/image'

export default function AboutPage() {
  const [sliderRef] = useKeenSlider<HTMLDivElement>({
    loop: true,
    mode: 'snap',
    slides: { perView: 1, spacing: 15 },
  })

  return (
    <div className="bg-black text-white font-sans">
      {/* HERO SECTION */}
      <section className="relative h-screen w-full overflow-hidden flex items-center justify-center">
        <div className="bg-gradient-to-b from-black to-matte absolute inset-0 z-0">
          <div
            className="w-full h-full bg-cover bg-center opacity-30"
            style={{ backgroundImage: 'url("/placeholders/hero.jpg")' }}
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
            <motion.span
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
              className="inline-block ml-2"
            >
            </motion.span>
          </h1>
          <p className="mt-4 text-lg md:text-2xl max-w-2xl mx-auto text-gray-200">
            Makers of natural diamond masterpieces — crafted for icons, not followers.
          </p>
        </motion.div>
      </section>

      {/* BRAND STORY */}
      <section className="py-24 px-6 md:px-20 bg-matte text-white">
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

      {/* MEDIA CAROUSEL */}
      <section className="px-6 md:px-20 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div ref={sliderRef} className="keen-slider rounded-xl overflow-hidden">
            <div className="keen-slider__slide number-slide1">
              <Image src="/placeholders/showcase1.jpg" alt="Custom piece" width={1200} height={800} className="w-full h-auto object-cover" />
            </div>
            <div className="keen-slider__slide number-slide2">
              <video autoPlay loop muted className="w-full h-auto object-cover">
                <source src="/placeholders/video1.mp4" type="video/mp4" />
              </video>
            </div>
            <div className="keen-slider__slide number-slide3">
              <Image src="/placeholders/showcase2.jpg" alt="Details" width={1200} height={800} className="w-full h-auto object-cover" />
            </div>
          </div>
        </motion.div>
      </section>

      {/* CLIENTS / CELEBRITY TRUST */}
      <section className="bg-white text-black py-24 px-6 md:px-20">
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
      <section className="py-24 px-6 md:px-20 bg-gradient-to-b from-matte to-neutral-900 text-white">
        <motion.div
          className="max-w-4xl mx-auto text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-sans-serif font-bold mb-4">
            Your Vision. Our Craft.
            <motion.span
              initial={{ scale: 0.8, opacity: 0.7 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
              className="inline-block ml-2"
            >
            </motion.span>
          </h2>
          <p className="text-lg text-gray-300 mb-8">
            Whether you're chasing something never done before or refining a timeless piece — we got you.
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