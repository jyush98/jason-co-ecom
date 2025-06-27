"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import Image from "next/image";
import { customItems } from "@/data/custom";
import SignatureGallery from "@/components/Signature Gallery";

export default function CustomOrdersPage() {
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);

    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/custom-order`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.detail || "Submission failed");

      toast.success("Inquiry submitted!");
      form.reset();
    } catch (err) {
      toast.error("Something went wrong. Please try again.");
    }

    setSubmitting(false);
  };

  return (
    <div className="bg-white text-black dark:bg-black dark:text-white text-foreground font-sans">

      {/* SECTION 1: HERO */}
      <section className="h-screen w-full flex flex-col items-center justify-center text-center px-6">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-5xl md:text-6xl font-bold tracking-tight"
        >
          Your Vision. Our Craft.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl"
        >
          From initial idea to final delivery, we craft custom pieces that are unapologetically personal and made to last.
        </motion.p>
      </section>

      {/* SECTION 2: SIGNATURE GALLERY */}
      {/* <SignatureGallery customItems={customItems}/> */}

      {/* SECTION 3: YOUR JOURNEY */}
      <section className="bg-muted py-20 px-6 md:px-20">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Your Journey</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 text-center text-muted-foreground text-lg">
          <div>
            <p className="text-foreground font-semibold mb-2">1. Vision</p>
            <p>Share your idea, sketch, or inspiration.</p>
          </div>
          <div>
            <p className="text-foreground font-semibold mb-2">2. Design</p>
            <p>We create a tailored mockup of your vision.</p>
          </div>
          <div>
            <p className="text-foreground font-semibold mb-2">3. Craftsmanship</p>
            <p>We handcraft using natural diamonds and precious metals.</p>
          </div>
          <div>
            <p className="text-foreground font-semibold mb-2">4. Delivery</p>
            <p>Shipped insured and ready to wear.</p>
          </div>
        </div>
      </section>

      {/* SECTION 4: INQUIRY FORM */}
      <section className="px-6 md:px-20 py-20 bg-background">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-6">Start Your Design</h2>
          <p className="text-center text-muted-foreground text-lg max-w-2xl mx-auto mb-12">
            Every piece begins with a conversation. Tell us what you envision — from specific details to general inspiration — and we’ll take it from there.
          </p>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8" noValidate>
            <div className="space-y-6">
              <input type="text" name="name" placeholder="Name" required className="w-full p-4 border border-black rounded bg-muted text-foreground placeholder-muted-foreground" />
              <input type="text" name="phone" placeholder="Phone Number" required className="w-full p-4 border border-black rounded bg-muted text-foreground placeholder-muted-foreground" />
              <input type="email" name="email" placeholder="Email Address (optional)" className="w-full p-4 border border-black rounded bg-muted text-foreground placeholder-muted-foreground" />
              <div>
                <label className="block text-sm text-muted-foreground mb-2">Upload Inspiration (optional)</label>
                <input type="file" name="inspiration" accept="image/*" className="w-full p-4 rounded bg-muted text-foreground file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-foreground file:text-background hover:file:bg-muted-foreground/90" />
              </div>
            </div>
            <div className="flex flex-col">
              <textarea name="message" placeholder="Tell us what you're looking for..." required rows={10} className="w-full h-full border border-black p-4 rounded bg-muted text-foreground placeholder-muted-foreground" />
              <button type="submit" disabled={submitting} className="mt-6 w-full border border-black py-3 bg-foreground text-background font-semibold rounded hover:bg-muted-foreground transition-colors">
                {submitting ? "Submitting..." : "Create My Piece"}
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}
