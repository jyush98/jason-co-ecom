"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Check, Lock } from "lucide-react";
import Link from "next/link";

// ✅ Updated imports - using our new modular structure
import { useCheckoutFlow } from "@/lib/hooks";
import { validateShippingAddress, calculateCheckoutProgress } from "@/utils";
import { CART_CONFIG } from "@/config";
import { ShippingForm, PaymentForm, OrderReview } from "@/components/checkout";
import { useCartData } from "@/app/store/cartStore";
import { JewelryImage } from "../ui/OptimizedImage";

interface CheckoutFlowProps {
  onOrderComplete?: (orderNumber: string) => void;
  onError?: (error: string) => void;
  className?: string;
}

export default function CheckoutFlow({
  onOrderComplete,
  onError,
  className = ""
}: CheckoutFlowProps) {
  const { cart, isLoading: cartLoading } = useCartData();
  const flowRef = useRef<HTMLDivElement>(null);

  // ✅ Using our new useCheckoutFlow hook instead of manual state management
  const {
    // Current state
    currentStep,
    formData,
    availableShippingMethods,
    selectedShippingMethod,
    validationErrors,
    isLoading,
    isSubmitting,
    error,

    // Navigation
    goToStep,
    goToNextStep,
    goToPreviousStep,
    canNavigateToStep,
    isStepComplete,

    // Form updates
    updateShippingAddress,
    updateBillingAddress,
    selectShippingMethod,
    selectPaymentMethod,

    // Actions
    fetchShippingMethods,
    submitOrder,
    clearErrors,
  } = useCheckoutFlow();

  // ✅ Using our new utility function
  const progressPercentage = calculateCheckoutProgress(currentStep);

  // Step configuration - now using our centralized config
  const steps = [
    {
      key: 'shipping' as const,
      title: CART_CONFIG.messaging.checkout.stepTitles.shipping,
      icon: '🚚',
      description: 'Enter your delivery details'
    },
    {
      key: 'payment' as const,
      title: CART_CONFIG.messaging.checkout.stepTitles.payment,
      icon: '💳',
      description: 'Choose your payment method'
    },
    {
      key: 'review' as const,
      title: CART_CONFIG.messaging.checkout.stepTitles.review,
      icon: '📋',
      description: 'Confirm your order'
    }
  ];

  const currentStepIndex = steps.findIndex(step => step.key === currentStep);

  // Handle order completion
  const handleOrderComplete = () => {
    submitOrder().then(() => {
      // The hook handles the actual submission
      // We'll get the order number from the response
      onOrderComplete?.("ORD-" + Date.now().toString(36).toUpperCase());
    }).catch((err) => {
      onError?.(err.message);
    });
  };

  if (cartLoading || !cart) {
    return <CheckoutFlowSkeleton />;
  }

  if (cart.items.length === 0) {
    return <EmptyCartRedirect />;
  }

  return (
    <div className={`min-h-screen bg-white dark:bg-black pt-[var(--navbar-height)] ${className}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-4 mb-8">
            <Link
              href="/cart"
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
            >
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-3xl md:text-4xl font-serif text-black dark:text-white">
              Secure Checkout
            </h1>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Lock size={16} />
              <span>SSL Secured</span>
            </div>
          </div>

          {/* ✅ Enhanced Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
              <span>Step {currentStepIndex + 1} of {steps.length}</span>
              <span>{Math.round(progressPercentage)}% Complete</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <motion.div
                className="bg-gold h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-8">
            {steps.map((step, index) => (
              <div key={step.key} className="flex items-center flex-1">
                <button
                  onClick={() => goToStep(step.key)}
                  disabled={!canNavigateToStep(step.key)}
                  className={`
                    flex items-center gap-3 p-4 rounded-lg transition-all duration-300 w-full
                    ${currentStep === step.key
                      ? 'bg-gold text-black'
                      : isStepComplete(step.key)
                        ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400'
                        : canNavigateToStep(step.key)
                          ? 'hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer'
                          : 'opacity-50 cursor-not-allowed'
                    }
                  `}
                >
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-sm
                    ${currentStep === step.key
                      ? 'bg-black text-gold'
                      : isStepComplete(step.key)
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700'
                    }
                  `}>
                    {isStepComplete(step.key) ? (
                      <Check size={16} />
                    ) : (
                      <span>{step.icon}</span>
                    )}
                  </div>

                  <div className="hidden md:block text-left">
                    <div className="font-medium">{step.title}</div>
                    <div className="text-xs opacity-75">{step.description}</div>
                  </div>
                </button>

                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className={`
                    h-px flex-1 mx-4
                    ${index < currentStepIndex ? 'bg-green-600' : 'bg-gray-200 dark:bg-gray-700'}
                  `} />
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Error Display */}
        <AnimatePresence>
          {error && (
            <motion.div
              className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex justify-between items-center">
                <span>{error}</span>
                <button onClick={clearErrors} className="text-red-400 hover:text-red-600">
                  ✕
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Step Content - Left Side */}
          <div className="lg:col-span-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4 }}
              >
                {/* ✅ Using our modular checkout components */}
                {currentStep === 'shipping' && (
                  <ShippingForm
                    formData={formData}
                    shippingMethods={availableShippingMethods}
                    selectedMethod={selectedShippingMethod || undefined}
                    isGuestCheckout={!formData.shipping_address?.email}
                    isLoading={isLoading}
                    validationErrors={validationErrors}
                    onUpdateAddress={updateShippingAddress}
                    onSelectShippingMethod={selectShippingMethod}
                    onNext={goToNextStep}
                  />
                )}

                {currentStep === 'payment' && (
                  <PaymentForm
                    formData={formData}
                    validationErrors={validationErrors}
                    onSelectPaymentMethod={selectPaymentMethod}
                    onUpdateBillingAddress={updateBillingAddress}
                    onPrevious={goToPreviousStep}
                    onNext={goToNextStep}
                    isLoading={isLoading}
                    orderTotal={cart.total}
                  />
                )}

                {currentStep === 'review' && (
                  <OrderReview
                    cart={cart}
                    formData={formData}
                    shippingMethod={selectedShippingMethod!}
                    tax={cart.tax} // TODO: Fix this?
                    total={cart.total}
                    onPrevious={goToPreviousStep}
                    onPlaceOrder={handleOrderComplete}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Order Summary - Right Side */}
          <div className="lg:col-span-4">
            <CheckoutOrderSummary
              cart={cart}
              shippingMethod={selectedShippingMethod}
              currentStep={currentStep}
              onPrevious={currentStepIndex > 0 ? goToPreviousStep : undefined}
              onNext={goToNextStep}
              isSubmitting={isSubmitting}
              canProceed={isStepComplete(currentStep)}
              isLastStep={currentStepIndex === steps.length - 1}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ✅ Improved Order Summary Component
function CheckoutOrderSummary({
  cart,
  shippingMethod,
  currentStep,
  onPrevious,
  onNext,
  isSubmitting,
  canProceed,
  isLastStep,
  tax
}: any) {
  const shippingCost = shippingMethod?.price || 0;
  const total = cart.subtotal + shippingCost + tax;

  return (
    <div className="sticky top-[calc(var(--navbar-height)+2rem)] bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
      <h3 className="text-xl font-serif mb-6">Order Summary</h3>

      {/* Items Preview */}
      <div className="space-y-3 mb-6">
        {cart.items.slice(0, 3).map((item: any) => (
          <div key={item.product_id} className="flex gap-3">
            <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden">
              {item.product.image_url && (
                <JewelryImage.Product
                  src={item.product.image_url}
                  alt={item.product.name}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{item.product.name}</p>
              <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
            </div>
          </div>
        ))}
        {cart.items.length > 3 && (
          <p className="text-sm text-gray-500">+{cart.items.length - 3} more items</p>
        )}
      </div>

      {/* Totals */}
      <div className="space-y-2 mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>${cart.subtotal}</span>
        </div>
        {shippingMethod && (
          <div className="flex justify-between">
            <span>Shipping</span>
            <span>{shippingCost > 0 ? `$${shippingCost}` : 'Free'}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span>Tax</span>
          <span>${cart.tax}</span>
        </div>
        <div className="flex justify-between text-lg font-semibold pt-2 border-t border-gray-200 dark:border-gray-700">
          <span>Total</span>
          <span className="text-gold">${total}</span>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="space-y-3">
        {!isLastStep ? (
          <button
            onClick={onNext}
            disabled={!canProceed || isSubmitting}
            className="w-full bg-gold hover:bg-gold/90 text-black font-medium py-4 px-6 rounded-lg transition-all duration-300 hover:scale-[1.02] tracking-widest uppercase text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {isSubmitting ? 'Processing...' : `Continue to ${getNextStepName(currentStep)}`}
          </button>
        ) : (
          <button
            onClick={onNext}
            disabled={!canProceed || isSubmitting}
            className="w-full bg-gold hover:bg-gold/90 text-black font-medium py-4 px-6 rounded-lg transition-all duration-300 hover:scale-[1.02] tracking-widest uppercase text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {isSubmitting ? 'Placing Order...' : 'Complete Purchase'}
          </button>
        )}

        {onPrevious && (
          <button
            onClick={onPrevious}
            disabled={isSubmitting}
            className="w-full border border-gray-300 dark:border-gray-600 py-3 px-6 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm tracking-wide disabled:opacity-50"
          >
            Back
          </button>
        )}
      </div>

      {/* Security Badge */}
      <div className="mt-6 text-center">
        <p className="text-xs text-gray-500">🔒 Secure checkout with SSL encryption</p>
      </div>
    </div>
  );
}

// Helper function for next step name
function getNextStepName(currentStep: string): string {
  switch (currentStep) {
    case 'shipping': return 'Payment';
    case 'payment': return 'Review';
    default: return 'Next';
  }
}

// Loading and empty states (unchanged but improved)
function CheckoutFlowSkeleton() {
  return (
    <div className="min-h-screen bg-white dark:bg-black pt-[var(--navbar-height)]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64 mb-8" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2" />
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-full mb-8" />
          <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-8 space-y-6">
              <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
            <div className="lg:col-span-4">
              <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyCartRedirect() {
  return (
    <div className="min-h-screen bg-white dark:bg-black pt-[var(--navbar-height)] flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-serif mb-4">Your cart is empty</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8">Add some items to your cart before checkout</p>
        <Link href="/shop" className="bg-gold hover:bg-gold/90 text-black px-8 py-4 font-medium tracking-widest uppercase text-sm">
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}