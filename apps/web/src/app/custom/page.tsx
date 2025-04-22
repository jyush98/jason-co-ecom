'use client'

import { motion } from 'framer-motion'

export default function CustomOrdersPage() {
  return (
    <div className="bg-black text-white font-sans">
      {/* HERO */}
      <section className="h-screen flex flex-col items-center justify-center text-center px-6">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-5xl md:text-6xl font-bold"
        >
          Custom Orders
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mt-6 text-lg md:text-xl text-gray-300 max-w-2xl"
        >
          Let’s bring your vision to life — from concept to one-of-a-kind masterpiece.
        </motion.p>
      </section>

      {/* HOW IT WORKS */}
      <section className="px-6 md:px-20 py-20 bg-matte">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-8">How It Works</h2>
          <ul className="space-y-6 text-gray-300 text-lg leading-relaxed">
            <li><strong>1.</strong> Share your idea, sketch, or inspiration.</li>
            <li><strong>2.</strong> We design a piece around your vision and send a detailed mockup.</li>
            <li><strong>3.</strong> Once approved, we handcraft it using natural diamonds and precious metals.</li>
            <li><strong>4.</strong> Your custom piece is delivered to your door — insured and ready to wear.</li>
          </ul>
        </div>
      </section>

      {/* CONTACT FORM */}
      <section className="px-6 md:px-20 py-20 bg-black">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Tell Us About Your Idea</h2>
          <form className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <input type="text" placeholder="Name" className="w-full p-4 rounded bg-neutral-800 text-white placeholder-gray-400" required />
              <input type="text" placeholder="Phone Number" className="w-full p-4 rounded bg-neutral-800 text-white placeholder-gray-400" required />
              <input type="email" placeholder="Email Address (optional)" className="w-full p-4 rounded bg-neutral-800 text-white placeholder-gray-400" />
              <div>
                <label className="block text-sm text-gray-400 mb-2">Upload Inspiration (optional)</label>
                <input type="file" accept="image/*" className="w-full p-4 rounded bg-neutral-800 text-white file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-white file:text-black hover:file:bg-neutral-200" />
              </div>
            </div>
            <div className="flex flex-col">
              <textarea placeholder="Tell us what you're looking for..." rows={10} className="w-full h-full p-4 rounded bg-neutral-800 text-white placeholder-gray-400" required />
              <button type="submit" className="mt-6 w-full py-3 bg-white text-black font-semibold rounded hover:bg-neutral-200 transition">Submit Inquiry</button>
            </div>
          </form>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 md:px-20 bg-gradient-to-b from-matte to-black text-center hidden">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to create something iconic?</h2>
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
