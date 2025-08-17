'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import {
  ChevronRight,
  ChevronDown,
  Heart,
  Clock,
  Star,
  ArrowRight,
  // Check,
  Upload,
  // Phone,
  // Mail,
  Calendar,
  // X,
  ChevronLeft
} from 'lucide-react';

// Import your existing components
import { CustomOrderFlow, type CustomOrderFormState } from '@/components/custom/CustomOrderFlow';
import { InspirationGallery, type InspirationItem } from '@/components/custom/InspirationGallery';

// Mobile-specific data
const PROJECT_TYPES = [
  { id: 'engagement_ring', label: 'Engagement Ring', description: 'A symbol of commitment' },
  { id: 'wedding_band', label: 'Wedding Band', description: 'Complete the set' },
  { id: 'necklace', label: 'Necklace', description: 'Statement or subtle' },
  { id: 'earrings', label: 'Earrings', description: 'Elegant accents' },
  { id: 'bracelet', label: 'Bracelet', description: 'Wrist elegance' },
  { id: 'watch', label: 'Custom Watch', description: 'Timepiece perfection' }
];

const INSPIRATION_GALLERY = [
  { id: 1, title: 'Art Deco Ring', image: '/api/placeholder/400/400', category: 'Engagement Ring', timeline: '6 weeks' },
  { id: 2, title: 'Minimalist Pendant', image: '/api/placeholder/400/400', category: 'Necklace', timeline: '4 weeks' },
  { id: 3, title: 'Diamond Studs', image: '/api/placeholder/400/400', category: 'Earrings', timeline: '3 weeks' }
];

// Hook to detect screen size
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkDevice = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  return isMobile;
}

// Mobile Components
function MobileCustomOrdersPage({ onCustomOrderSubmit, onSaveDraft, onUseAsInspiration }: any) {
  const [currentView, setCurrentView] = useState<'landing' | 'form'>('landing');
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Partial<CustomOrderFormState>>({});
  const [showInspiration, setShowInspiration] = useState(false);

  const steps = [
    { id: 'vision', title: 'Your Vision', subtitle: 'What are you creating?' },
    { id: 'details', title: 'The Details', subtitle: 'Materials & specifications' },
    { id: 'inspiration', title: 'Visual Story', subtitle: 'Show us your vision' },
    { id: 'connect', title: 'Let\'s Connect', subtitle: 'Schedule your consultation' }
  ];

  if (currentView === 'landing') {
    return (
      <div className="bg-white dark:bg-black text-black dark:text-white min-h-screen">
        {/* Hero Section */}
        <section className="relative min-h-screen flex flex-col">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/60">
            <img
              src="/api/placeholder/400/800"
              alt="Custom jewelry creation process"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="relative z-10 flex flex-col justify-end flex-1 p-6 pb-12">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-white"
            >
              <h1 className="text-4xl font-bold leading-tight mb-4">
                Your Vision.
                <br />
                Our Craft.
              </h1>
              <p className="text-lg mb-8 text-white/90 leading-relaxed">
                From initial spark to final masterpiece, we bring your most personal jewelry visions to life with uncompromising artistry.
              </p>

              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => setCurrentView('form')}
                className="w-full bg-white text-black py-4 rounded-lg font-semibold text-lg flex items-center justify-center gap-2 shadow-xl"
              >
                Start Your Custom Design
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </motion.div>
          </div>
        </section>

        {/* Process Overview */}
        <section className="p-6 bg-gray-50 dark:bg-gray-950">
          <h2 className="text-2xl font-bold mb-6 text-center">How It Works</h2>
          <div className="space-y-6">
            {[
              { number: '01', title: 'Share Your Vision', description: 'Tell us about your dream piece—style, inspiration, budget, timeline.' },
              { number: '02', title: 'Design Together', description: 'We create detailed concepts and refine every detail with you.' },
              { number: '03', title: 'Master Craftsmanship', description: 'Our artisans handcraft your piece using premium materials.' },
              { number: '04', title: 'Lifetime Connection', description: 'Enjoy your creation with ongoing care and service.' }
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex gap-4"
              >
                <div className="w-12 h-12 bg-black dark:bg-white text-white dark:text-black rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                  {step.number}
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">{step.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Inspiration Gallery */}
        <section className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Recent Creations</h2>
            <button
              onClick={() => setShowInspiration(!showInspiration)}
              className="text-gray-600 dark:text-gray-400 flex items-center gap-1"
            >
              View All
              <ChevronDown className={`w-4 h-4 transition-transform ${showInspiration ? 'rotate-180' : ''}`} />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {INSPIRATION_GALLERY.slice(0, showInspiration ? INSPIRATION_GALLERY.length : 2).map((item) => (
              <motion.div
                key={item.id}
                layout
                className="relative rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800"
              >
                <div className="aspect-[4/3]">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                  <h3 className="text-white font-semibold">{item.title}</h3>
                  <div className="flex items-center justify-between text-white/80 text-sm">
                    <span>{item.category}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {item.timeline}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Social Proof */}
        <section className="p-6 bg-gray-50 dark:bg-gray-950">
          <div className="text-center mb-6">
            <div className="flex justify-center items-center gap-1 mb-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              "Jason & Co transformed my grandmother's diamond into the most beautiful engagement ring. The process was seamless and the result exceeded every expectation."
            </p>
            <p className="font-semibold mt-2">— Sarah M.</p>
          </div>
        </section>

        {/* CTA Section */}
        <section className="p-6">
          <div className="bg-black dark:bg-white text-white dark:text-black rounded-lg p-6 text-center">
            <h2 className="text-xl font-bold mb-2">Ready to Begin?</h2>
            <p className="mb-4 text-white/80 dark:text-black/80">
              The conversation starts with sharing your vision.
            </p>
            <button
              onClick={() => setCurrentView('form')}
              className="w-full bg-white dark:bg-black text-black dark:text-white py-3 rounded-lg font-semibold"
            >
              Start Your Design Journey
            </button>
          </div>
        </section>
      </div>
    );
  }

  // Mobile Form View
  return (
    <div className="bg-white dark:bg-black text-black dark:text-white min-h-screen">
      {/* Mobile Header */}
      <div className="sticky top-0 z-50 bg-white/95 dark:bg-black/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 p-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => currentStep === 0 ? setCurrentView('landing') : setCurrentStep(currentStep - 1)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-lg"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex-1 text-center">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Step {currentStep + 1} of {steps.length}
            </div>
            <div className="font-semibold">
              {steps[currentStep]?.title}
            </div>
          </div>

          <div className="w-8" />
        </div>

        {/* Step Indicators */}
        <div className="flex justify-center mt-3 gap-2">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`h-1 flex-1 rounded-full transition-colors ${index <= currentStep ? 'bg-black dark:bg-white' : 'bg-gray-200 dark:bg-gray-800'
                }`}
            />
          ))}
        </div>
      </div>

      {/* Form Content */}
      <div className="p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {currentStep === 0 && <MobileVisionStep formData={formData} setFormData={setFormData} />}
            {currentStep === 1 && <MobileDetailsStep formData={formData} setFormData={setFormData} />}
            {currentStep === 2 && <MobileInspirationStep formData={formData} setFormData={setFormData} />}
            {currentStep === 3 && <MobileConnectStep formData={formData} setFormData={setFormData} />}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800">
          {currentStep < steps.length - 1 ? (
            <button
              onClick={() => setCurrentStep(currentStep + 1)}
              className="w-full bg-black dark:bg-white text-white dark:text-black py-4 rounded-lg font-semibold flex items-center justify-center gap-2"
            >
              Continue
              <ChevronRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={async () => {
                try {
                  await onCustomOrderSubmit(formData);
                } catch (error) {
                  // Error handled by parent
                }
              }}
              className="w-full bg-black dark:bg-white text-white dark:text-black py-4 rounded-lg font-semibold"
            >
              Submit Custom Order
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Mobile Step Components
function MobileVisionStep({ formData, setFormData }: any) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">What's Your Vision?</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Every masterpiece starts with an idea. Share yours with us.
        </p>
      </div>

      <div>
        <label className="block font-semibold mb-3">I'm looking to create a...</label>
        <div className="grid grid-cols-2 gap-3">
          {PROJECT_TYPES.map((type) => (
            <button
              key={type.id}
              onClick={() => setFormData({ ...formData, projectType: type.id })}
              className={`p-3 rounded-lg border-2 text-left transition-all ${formData.projectType === type.id
                ? 'border-black dark:border-white bg-gray-50 dark:bg-gray-900'
                : 'border-gray-200 dark:border-gray-700'
                }`}
            >
              <div className="font-medium text-sm">{type.label}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{type.description}</div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block font-semibold mb-3">Investment Range</label>
        <div className="space-y-2">
          {[
            { id: '1k-3k', label: '$1,000 - $3,000', subtitle: 'Premium starting point' },
            { id: '3k-5k', label: '$3,000 - $5,000', subtitle: 'Most popular range' },
            { id: '5k-10k', label: '$5,000 - $10,000', subtitle: 'Luxury selection' },
            { id: '10k+', label: '$10,000+', subtitle: 'Ultimate luxury' }
          ].map((budget) => (
            <button
              key={budget.id}
              onClick={() => setFormData({ ...formData, budgetRange: budget.id })}
              className={`w-full p-3 rounded-lg border-2 text-left transition-all ${formData.budgetRange === budget.id
                ? 'border-black dark:border-white bg-gray-50 dark:bg-gray-900'
                : 'border-gray-200 dark:border-gray-700'
                }`}
            >
              <div className="font-medium">{budget.label}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">{budget.subtitle}</div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block font-semibold mb-3">Tell us about your vision</label>
        <textarea
          value={formData.inspiration || ''}
          onChange={(e) => setFormData({ ...formData, inspiration: e.target.value })}
          placeholder="Describe your dream piece, the story behind it, or any specific requirements..."
          rows={4}
          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-black placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
        />
      </div>
    </div>
  );
}

function MobileDetailsStep({ formData, setFormData }: any) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">The Details Matter</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Help us understand your material preferences and specifications.
        </p>
      </div>

      <div>
        <label className="block font-semibold mb-3">Preferred Metal</label>
        <div className="space-y-2">
          {[
            { id: 'gold_14k', label: '14K Gold', subtitle: 'Durable everyday luxury' },
            { id: 'gold_18k', label: '18K Gold', subtitle: 'Premium gold content' },
            { id: 'platinum', label: 'Platinum', subtitle: 'The ultimate precious metal' },
            { id: 'white_gold', label: 'White Gold', subtitle: 'Modern elegance' }
          ].map((metal) => (
            <button
              key={metal.id}
              onClick={() => setFormData({ ...formData, metalType: metal.id })}
              className={`w-full p-3 rounded-lg border-2 text-left transition-all ${formData.metalType === metal.id
                ? 'border-black dark:border-white bg-gray-50 dark:bg-gray-900'
                : 'border-gray-200 dark:border-gray-700'
                }`}
            >
              <div className="font-medium">{metal.label}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">{metal.subtitle}</div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block font-semibold mb-3">Stone Preferences</label>
        <textarea
          value={formData.stonePreferences?.join(', ') || ''}
          onChange={(e) => setFormData({ ...formData, stonePreferences: e.target.value.split(', ') })}
          placeholder="Diamond, sapphire, emerald, or other preferences..."
          rows={3}
          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-black placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
        />
      </div>

      <div>
        <label className="block font-semibold mb-3">Size & Specifications</label>
        <textarea
          value={formData.sizeRequirements || ''}
          onChange={(e) => setFormData({ ...formData, sizeRequirements: e.target.value })}
          placeholder="Ring size, chain length, dimensions, or any size requirements..."
          rows={3}
          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-black placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
        />
      </div>
    </div>
  );
}

function MobileInspirationStep({ formData, setFormData }: any) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Show Us Your Vision</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Images help us understand your style and bring your vision to life.
        </p>
      </div>

      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
        <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <h3 className="font-semibold mb-2">Upload Reference Images</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
          Inspiration photos, sketches, or style references
        </p>
        <button className="bg-black dark:bg-white text-white dark:text-black px-6 py-3 rounded-lg font-medium">
          Choose Images
        </button>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
          Up to 8 images • 10MB each • JPG, PNG, HEIC
        </p>
      </div>

      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
        <h4 className="font-semibold mb-2 text-sm">💡 What makes great reference images?</h4>
        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
          <li>• Multiple angles of pieces you love</li>
          <li>• Close-ups of details and textures</li>
          <li>• Your own sketches or drawings</li>
          <li>• Style inspiration from any source</li>
        </ul>
      </div>
    </div>
  );
}

function MobileConnectStep({ formData, setFormData }: any) {
  const contactInfo = formData.contactInfo || {};

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Let's Connect</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Schedule your consultation to discuss your vision in detail.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block font-medium mb-2">Full Name</label>
          <input
            type="text"
            value={contactInfo.name || ''}
            onChange={(e) => setFormData({
              ...formData,
              contactInfo: { ...contactInfo, name: e.target.value }
            })}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-black focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
            placeholder="Your full name"
          />
        </div>

        <div>
          <label className="block font-medium mb-2">Email</label>
          <input
            type="email"
            value={contactInfo.email || ''}
            onChange={(e) => setFormData({
              ...formData,
              contactInfo: { ...contactInfo, email: e.target.value }
            })}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-black focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
            placeholder="your@email.com"
          />
        </div>

        <div>
          <label className="block font-medium mb-2">Phone (Optional)</label>
          <input
            type="tel"
            value={contactInfo.phone || ''}
            onChange={(e) => setFormData({
              ...formData,
              contactInfo: { ...contactInfo, phone: e.target.value }
            })}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-black focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent"
            placeholder="(555) 123-4567"
          />
        </div>
      </div>

      <div>
        <label className="block font-semibold mb-3">Timeline Preference</label>
        <div className="space-y-2">
          {[
            { id: 'standard', label: 'Standard (8-12 weeks)', subtitle: 'Our recommended timeline' },
            { id: 'expedited', label: 'Expedited (4-6 weeks)', subtitle: 'Faster completion (+20%)' },
            { id: 'flexible', label: 'Flexible', subtitle: 'No specific deadline' }
          ].map((timeline) => (
            <button
              key={timeline.id}
              onClick={() => setFormData({ ...formData, timelinePreference: timeline.id })}
              className={`w-full p-3 rounded-lg border-2 text-left transition-all ${formData.timelinePreference === timeline.id
                ? 'border-black dark:border-white bg-gray-50 dark:bg-gray-900'
                : 'border-gray-200 dark:border-gray-700'
                }`}
            >
              <div className="font-medium">{timeline.label}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">{timeline.subtitle}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
        <h4 className="font-semibold mb-2 flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          What happens next?
        </h4>
        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
          <li>• We'll review your vision within 24 hours</li>
          <li>• Schedule a consultation call</li>
          <li>• Create initial design concepts</li>
          <li>• Begin crafting your masterpiece</li>
        </ul>
      </div>
    </div>
  );
}

// Main Component with Responsive Logic
export default function CustomOrdersPage() {
  const router = useRouter();
  const isMobile = useIsMobile();

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
      throw error;
    }
  };

  // Handle draft saving
  const handleSaveDraft = (formData: Partial<CustomOrderFormState>) => {
    try {
      localStorage.setItem('customOrderDraft', JSON.stringify(formData));
    } catch (error) {
      console.error("Failed to save draft:", error);
    }
  };

  // Handle inspiration selection
  const handleUseAsInspiration = (item: InspirationItem) => {
    const element = document.getElementById('custom-order-form');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    toast.success(`Using "${item.title}" as inspiration!`);
  };

  // Render mobile version
  if (isMobile) {
    return (
      <MobileCustomOrdersPage
        onCustomOrderSubmit={handleCustomOrderSubmit}
        onSaveDraft={handleSaveDraft}
        onUseAsInspiration={handleUseAsInspiration}
      />
    );
  }

  // Desktop version (your existing layout)
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

      {/* SECTION 2: YOUR JOURNEY */}
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

      {/* SECTION 3: INSPIRATION GALLERY */}
      <section className="py-20 px-6 md:px-20 bg-background">
        <InspirationGallery
          onUseAsInspiration={handleUseAsInspiration}
          maxItems={6}
          className="max-w-6xl mx-auto"
        />
      </section>

      {/* SECTION 4: ENHANCED CUSTOM ORDER FORM */}
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