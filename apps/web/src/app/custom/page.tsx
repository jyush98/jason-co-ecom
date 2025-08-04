"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { CustomOrderFlow, type CustomOrderFormState } from "@/components/custom/CustomOrderFlow";
import { InspirationGallery, type InspirationItem } from "@/components/custom/InspirationGallery";
// import Image from "next/image";
// import { customItems } from "@/data/custom";
// import SignatureGallery from "@/components/Signature Gallery";

export default function CustomOrdersPage() {
  const router = useRouter();

  // Handle custom order form submission
  const handleCustomOrderSubmit = async (formData: CustomOrderFormState) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/custom-orders/submit`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.detail || "Submission failed");

      toast.success("Custom order submitted successfully!");
      router.push("/custom-orders/thank-you");
    } catch (error) {
      console.error("Custom order submission failed:", error);
      throw error; // Re-throw so CustomOrderFlow can handle the error
    }
  };

  // Handle draft saving (optional)
  const handleSaveDraft = (formData: Partial<CustomOrderFormState>) => {
    try {
      localStorage.setItem('customOrderDraft', JSON.stringify(formData));
    } catch (error) {
      console.error("Failed to save draft:", error);
    }
  };

  // Handle inspiration selection
  const handleUseAsInspiration = (item: InspirationItem) => {
    // You could scroll to the form or pre-fill some data
    const element = document.getElementById('custom-order-form');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }

    toast.success(`Using "${item.title}" as inspiration!`);
    // Optionally pre-fill form data based on inspiration
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

      {/* SECTION 4: INSPIRATION GALLERY */}
      <section className="py-20 px-6 md:px-20 bg-background">
        <InspirationGallery
          onUseAsInspiration={handleUseAsInspiration}
          maxItems={6} // Limit to 6 items for page performance
          className="max-w-6xl mx-auto"
        />
      </section>

      {/* SECTION 5: ENHANCED CUSTOM ORDER FORM */}
      <section id="custom-order-form" className="py-20 bg-white dark:bg-black">
        <div className="mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Start Your Design</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Every piece begins with a conversation. Our enhanced design process helps us understand your vision perfectly.
            </p>
          </div>

          <CustomOrderFlow
            onSubmit={handleCustomOrderSubmit}
            onSaveDraft={handleSaveDraft}
            initialData={
              // Optionally load draft from localStorage
              typeof window !== 'undefined'
                ? JSON.parse(localStorage.getItem('customOrderDraft') || '{}')
                : {}
            }
          />
        </div>
      </section>
    </div>
  );
}