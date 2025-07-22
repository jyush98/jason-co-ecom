"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth, useUser } from "@clerk/nextjs";
import { ArrowLeft, ArrowRight, Check, Truck, CreditCard, FileText, Lock } from "lucide-react";
import { CART_CONFIG } from "@/config/cartConfig";
import {
  CheckoutStep,
  CheckoutState,
  CheckoutFormData,
  ShippingAddress,
  ShippingMethod,
  PaymentMethod,
  CheckoutOrderPreview
} from "@/types/cart";
import { useCartData, useCartActions } from "@/app/store/cartStore";

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
  const { getToken } = useAuth();
  const { isSignedIn, user } = useUser();
  const { cart, isLoading: cartLoading } = useCartData();
  const flowRef = useRef<HTMLDivElement>(null);

  // Checkout state
  const [checkoutState, setCheckoutState] = useState<CheckoutState>({
    current_step: 'shipping',
    form_data: {
      shipping_address: {
        first_name: user?.firstName || '',
        last_name: user?.lastName || '',
        email: user?.primaryEmailAddress?.emailAddress || '',
        phone: '',
        address_line_1: '',
        address_line_2: '',
        city: '',
        state: '',
        postal_code: '',
        country: 'US',
      }
    },
    available_shipping_methods: [],
    is_guest_checkout: !isSignedIn,
    validation_errors: {},
    is_loading: false,
    is_submitting: false,
    error: null,
  });

  // Initialize guest email if not signed in
  useEffect(() => {
    if (!isSignedIn && !checkoutState.form_data.shipping_address?.email) {
      setCheckoutState(prev => ({
        ...prev,
        is_guest_checkout: true,
        form_data: {
          ...prev.form_data,
          shipping_address: {
            ...prev.form_data.shipping_address!,
            email: '',
          }
        }
      }));
    }
  }, [isSignedIn]);

  // Step configuration
  const steps: Array<{
    key: CheckoutStep;
    title: string;
    icon: React.ReactNode;
    description: string;
  }> = [
      {
        key: 'shipping',
        title: CART_CONFIG.messaging.checkout.stepTitles.shipping,
        icon: <Truck size={20} />,
        description: 'Enter your delivery details'
      },
      {
        key: 'payment',
        title: CART_CONFIG.messaging.checkout.stepTitles.payment,
        icon: <CreditCard size={20} />,
        description: 'Choose your payment method'
      },
      {
        key: 'review',
        title: CART_CONFIG.messaging.checkout.stepTitles.review,
        icon: <FileText size={20} />,
        description: 'Confirm your order'
      }
    ];

  const currentStepIndex = steps.findIndex(step => step.key === checkoutState.current_step);

  // Navigation handlers
  const goToStep = (step: CheckoutStep) => {
    if (canNavigateToStep(step)) {
      setCheckoutState(prev => ({
        ...prev,
        current_step: step,
        error: null,
      }));
    }
  };

  const goToPreviousStep = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      goToStep(steps[prevIndex].key);
    }
  };

  const goToNextStep = async () => {
    const isValid = await validateCurrentStep();
    if (isValid) {
      const nextIndex = currentStepIndex + 1;
      if (nextIndex < steps.length) {
        goToStep(steps[nextIndex].key);
      } else {
        // Final step - submit order
        await submitOrder();
      }
    }
  };

  // Validation
  const canNavigateToStep = (step: CheckoutStep): boolean => {
    const stepIndex = steps.findIndex(s => s.key === step);
    const currentIndex = currentStepIndex;

    // Can always go backward
    if (stepIndex <= currentIndex) return true;

    // Can only go forward if ALL previous steps are complete
    for (let i = 0; i < stepIndex; i++) {
      if (!isStepComplete(steps[i].key)) {
        return false;
      }
    }

    return true;
  };

  const isStepComplete = (step: CheckoutStep): boolean => {
    switch (step) {
      case 'shipping':
        // Use the correct variable name from your state
        return validateShippingAddress(checkoutState.form_data.shipping_address!) && !!checkoutState.form_data.shipping_method;
      case 'payment':
        // Payment is complete when payment method exists with an ID
        return !!checkoutState.form_data.payment_method?.id;
      case 'review':
        // Review step is never "complete" until order is actually submitted
        return false;
      default:
        return false;
    }
  };

  const validateShippingAddress = (address: ShippingAddress): boolean => {
    const required = ['first_name', 'last_name', 'address_line_1', 'city', 'state', 'postal_code'];
    if (checkoutState.is_guest_checkout) {
      required.push('email');
    }

    return required.every(field => {
      const value = address[field as keyof ShippingAddress];
      return typeof value === 'string' && value.trim().length > 0;
    });
  };

  const validateCurrentStep = async (): Promise<boolean> => {
    const errors: Record<string, string> = {};

    switch (checkoutState.current_step) {
      case 'shipping':
        if (!validateShippingAddress(checkoutState.form_data.shipping_address!)) {
          errors.shipping = 'Please fill in all required shipping information';
        }
        if (!checkoutState.selected_shipping_method) {
          errors.shipping_method = 'Please select a shipping method';
        }
        break;

      case 'payment':
        if (!checkoutState.form_data.payment_method) {
          errors.payment = 'Please select a payment method';
        }
        break;
    }

    setCheckoutState(prev => ({ ...prev, validation_errors: errors }));
    return Object.keys(errors).length === 0;
  };

  // Form data updates
  const updateFormData = (updates: Partial<CheckoutFormData>) => {
    setCheckoutState(prev => ({
      ...prev,
      form_data: {
        ...prev.form_data,
        ...updates,
      },
      validation_errors: {}, // Clear errors when user makes changes
    }));
  };

  const updateShippingAddress = (updates: Partial<ShippingAddress>) => {
    updateFormData({
      shipping_address: {
        ...checkoutState.form_data.shipping_address!,
        ...updates,
      }
    });
  };

  const selectShippingMethod = (method: ShippingMethod) => {
    setCheckoutState(prev => ({
      ...prev,
      selected_shipping_method: method,
      form_data: {
        ...prev.form_data,
        shipping_method: method,
      }
    }));
  };

  const selectPaymentMethod = (method: PaymentMethod) => {
    updateFormData({ payment_method: method });
  };

  // API calls
  const fetchShippingMethods = async () => {
    if (!checkoutState.form_data.shipping_address) return;

    setCheckoutState(prev => ({ ...prev, is_loading: true }));

    try {
      const token = await getToken();
      const response = await fetch('/api/checkout/shipping-methods', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address: checkoutState.form_data.shipping_address,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch shipping methods');
      }

      const methods: ShippingMethod[] = await response.json();

      setCheckoutState(prev => ({
        ...prev,
        available_shipping_methods: methods,
        is_loading: false,
      }));

      // Auto-select first method if none selected
      if (methods.length > 0 && !checkoutState.selected_shipping_method) {
        selectShippingMethod(methods[0]);
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load shipping methods';
      setCheckoutState(prev => ({
        ...prev,
        is_loading: false,
        error: errorMessage,
      }));
      onError?.(errorMessage);
    }
  };

  const submitOrder = async () => {
    if (!cart) return;

    setCheckoutState(prev => ({ ...prev, is_submitting: true, error: null }));

    try {
      const token = await getToken();
      const response = await fetch('/api/checkout/submit', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          shipping_address: checkoutState.form_data.shipping_address,
          billing_address: checkoutState.form_data.billing_address,
          shipping_method: checkoutState.selected_shipping_method,
          payment_method: checkoutState.form_data.payment_method,
          gift_options: checkoutState.form_data.gift_options,
          order_notes: checkoutState.form_data.order_notes,
          cart_id: cart.id || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit order');
      }

      const result = await response.json();

      setCheckoutState(prev => ({ ...prev, is_submitting: false }));
      onOrderComplete?.(result.order_number);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit order';
      setCheckoutState(prev => ({
        ...prev,
        is_submitting: false,
        error: errorMessage,
      }));
      onError?.(errorMessage);
    }
  };

  // Auto-fetch shipping methods when address is complete
  useEffect(() => {
    const address = checkoutState.form_data.shipping_address;
    if (address && validateShippingAddress(address) && checkoutState.current_step === 'shipping') {
      const timer = setTimeout(() => {
        fetchShippingMethods();
      }, 500); // Debounce

      return () => clearTimeout(timer);
    }
  }, [checkoutState.form_data.shipping_address, checkoutState.current_step]);

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
            <button
              onClick={() => window.history.back()}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-3xl md:text-4xl font-serif text-black dark:text-white">
              Secure Checkout
            </h1>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Lock size={16} />
              <span>SSL Secured</span>
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
                    flex items-center gap-3 p-4 rounded-lg transition-all duration-300
                    ${checkoutState.current_step === step.key
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
                    w-8 h-8 rounded-full flex items-center justify-center
                    ${checkoutState.current_step === step.key
                      ? 'bg-black text-gold'
                      : isStepComplete(step.key)
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700'
                    }
                  `}>
                    {isStepComplete(step.key) ? (
                      <Check size={16} />
                    ) : (
                      <span className="text-sm font-medium">{index + 1}</span>
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
          {checkoutState.error && (
            <motion.div
              className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              {checkoutState.error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Step Content - Left Side */}
          <div className="lg:col-span-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={checkoutState.current_step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4 }}
              >
                {checkoutState.current_step === 'shipping' && (
                  <ShippingStep
                    formData={checkoutState.form_data}
                    shippingMethods={checkoutState.available_shipping_methods}
                    selectedMethod={checkoutState.selected_shipping_method}
                    isGuestCheckout={checkoutState.is_guest_checkout}
                    isLoading={checkoutState.is_loading}
                    validationErrors={checkoutState.validation_errors}
                    onUpdateAddress={updateShippingAddress}
                    onSelectShippingMethod={selectShippingMethod}
                  />
                )}

                {checkoutState.current_step === 'payment' && (
                  <PaymentStep
                    formData={checkoutState.form_data}
                    validationErrors={checkoutState.validation_errors}
                    onSelectPaymentMethod={selectPaymentMethod}
                  />
                )}

                {checkoutState.current_step === 'review' && (
                  <ReviewStep
                    cart={cart}
                    formData={checkoutState.form_data}
                    shippingMethod={checkoutState.selected_shipping_method!}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Order Summary - Right Side */}
          <div className="lg:col-span-4">
            <CheckoutOrderSummary
              cart={cart}
              shippingMethod={checkoutState.selected_shipping_method}
              currentStep={checkoutState.current_step}
              onPrevious={currentStepIndex > 0 ? goToPreviousStep : undefined}
              onNext={goToNextStep}
              isSubmitting={checkoutState.is_submitting}
              canProceed={isStepComplete(checkoutState.current_step)}
              isLastStep={currentStepIndex === steps.length - 1}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Placeholder components for each step (to be implemented next)
function ShippingStep({ }: any) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-serif">Shipping Information</h2>
      <div className="p-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-center text-gray-500">
        Shipping Form Component (to be implemented)
      </div>
    </div>
  );
}

function PaymentStep({ }: any) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-serif">Payment Method</h2>
      <div className="p-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-center text-gray-500">
        Payment Form Component (to be implemented)
      </div>
    </div>
  );
}

function ReviewStep({ }: any) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-serif">Review Your Order</h2>
      <div className="p-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-center text-gray-500">
        Order Review Component (to be implemented)
      </div>
    </div>
  );
}

function CheckoutOrderSummary({ }: any) {
  return (
    <div className="sticky top-[calc(var(--navbar-height)+2rem)] space-y-6">
      <h3 className="text-xl font-serif">Order Summary</h3>
      <div className="p-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-center text-gray-500">
        Checkout Summary Component (to be implemented)
      </div>
    </div>
  );
}

// Loading and empty states
function CheckoutFlowSkeleton() {
  return (
    <div className="min-h-screen bg-white dark:bg-black pt-[var(--navbar-height)]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64 mb-8" />
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
        <a href="/shop" className="bg-gold hover:bg-gold/90 text-black px-8 py-4 font-medium tracking-widest uppercase text-sm">
          Continue Shopping
        </a>
      </div>
    </div>
  );
}