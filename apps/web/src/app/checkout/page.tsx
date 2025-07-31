// app/checkout/page.tsx - Fixed Router Import
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation"; // ✅ Add this import
import { ArrowLeft, Check, Truck, CreditCard, FileText, Lock } from "lucide-react";
import Link from "next/link";
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';

import { useCartData } from "@/app/store/cartStore";
import { CART_CONFIG } from "@/config/cartConfig";
import {
    CheckoutStep,
    CheckoutFormData,
    ShippingAddress,
    ShippingMethod,
    PaymentMethod
} from "@/types/cart";
import { formatCartPrice } from "@/config/cartConfig";

// Import your components
import ShippingForm from "@/components/checkout/ShippingForm";
import PaymentForm from "@/components/checkout/PaymentForm";
import OrderReview from "@/components/checkout/OrderReview";
import { JewelryImage } from "@/components/ui/OptimizedImage";

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function CheckoutPage() {
    const { getToken } = useAuth();
    const { isSignedIn, user } = useUser();
    const { cart, isLoading: cartLoading, fetchCart } = useCartData();
    const router = useRouter(); // ✅ Add this line

    // Checkout state
    const [currentStep, setCurrentStep] = useState<CheckoutStep>('shipping');
    const [formData, setFormData] = useState<Partial<CheckoutFormData>>({
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
    });
    const [availableShippingMethods, setAvailableShippingMethods] = useState<ShippingMethod[]>([]);
    const [selectedShippingMethod, setSelectedShippingMethod] = useState<ShippingMethod>();
    const [isLoading, setIsLoading] = useState(false);
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

    const [tax, setTax] = useState(0);

    // Fetch cart on mount
    useEffect(() => {
        const loadCart = async () => {
            const token = await getToken();
            if (token) {
                await fetchCart(token);
            }
        };
        loadCart();
    }, [getToken, fetchCart]);

    // Auto-populate shipping methods when address is complete
    useEffect(() => {
        const address = formData.shipping_address;
        if (address?.address_line_1 && address?.city && address?.state && address?.postal_code) {
            loadShippingMethods();
        }
    }, [formData.shipping_address]);

    useEffect(() => {
        const calculateTaxes = async () => {
            const address = formData.shipping_address;
            if (address?.state && cart) {
                try {
                    const token = await getToken();
                    if (token) {
                        const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
                        const response = await fetch(`${API_BASE_URL}/cart/calculate-tax`, {
                            method: 'POST',
                            headers: {
                                'Authorization': `Bearer ${token}`,
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                state: address.state,
                                subtotal: cart.subtotal,
                                shipping: selectedShippingMethod?.price || 0,
                            }),
                        });

                        if (response.ok) {
                            const taxData = await response.json();
                            console.log('Tax calculated:', taxData); // Debug log
                            setTax(taxData.tax_amount);
                        }
                    }
                } catch (error) {
                    console.error('Failed to calculate tax:', error);
                }
            } else {
                setTax(0); // Reset tax if no state selected
            }
        };

        calculateTaxes();
    }, [formData.shipping_address?.state, cart?.subtotal, selectedShippingMethod?.price, getToken]);


    const loadShippingMethods = async () => {
        setIsLoading(true);
        try {
            // Mock shipping methods - replace with real API call
            const methods: ShippingMethod[] = [
                {
                    id: 'standard',
                    name: 'Standard Shipping',
                    description: 'Free shipping on orders over $100',
                    price: cart && cart.subtotal >= 100 ? 0 : 15,
                    estimated_days: '5-7 business days',
                    is_express: false
                },
                {
                    id: 'express',
                    name: 'Express Shipping',
                    description: 'Faster delivery',
                    price: 25,
                    estimated_days: '2-3 business days',
                    is_express: true
                },
                {
                    id: 'overnight',
                    name: 'Overnight Shipping',
                    description: 'Next business day delivery',
                    price: 45,
                    estimated_days: '1 business day',
                    is_express: true
                }
            ];

            setAvailableShippingMethods(methods);

            // Auto-select first method if none selected
            if (!selectedShippingMethod && methods.length > 0) {
                setSelectedShippingMethod(methods[0]);
                setFormData(prev => ({ ...prev, shipping_method: methods[0] }));
            }
        } catch (error) {
            console.error('Failed to load shipping methods:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Step configuration
    const steps = [
        {
            key: 'shipping' as CheckoutStep,
            title: 'Shipping',
            icon: <Truck size={20} />,
            description: 'Address & delivery'
        },
        {
            key: 'payment' as CheckoutStep,
            title: 'Payment',
            icon: <CreditCard size={20} />,
            description: 'Payment method'
        },
        {
            key: 'review' as CheckoutStep,
            title: 'Review',
            icon: <FileText size={20} />,
            description: 'Confirm order'
        }
    ];

    const currentStepIndex = steps.findIndex(step => step.key === currentStep);

    // Navigation handlers
    const goToStep = (step: CheckoutStep) => {
        if (canNavigateToStep(step)) {
            setCurrentStep(step);
            setValidationErrors({});
        }
    };

    const goToNextStep = () => {
        const nextIndex = currentStepIndex + 1;
        if (nextIndex < steps.length) {
            setCurrentStep(steps[nextIndex].key);
        }
    };

    const goToPreviousStep = () => {
        const prevIndex = currentStepIndex - 1;
        if (prevIndex >= 0) {
            setCurrentStep(steps[prevIndex].key);
        }
    };

    const canNavigateToStep = (step: CheckoutStep): boolean => {
        const stepIndex = steps.findIndex(s => s.key === step);
        const currentIndex = currentStepIndex;

        // Can always go backward
        if (stepIndex <= currentIndex) return true;

        // Can only go forward if current step is complete
        return isStepComplete(steps[stepIndex - 1]?.key);
    };

    const isStepComplete = (step: CheckoutStep): boolean => {
        switch (step) {
            case 'shipping':
                return !!(formData.shipping_address &&
                    validateShippingAddress(formData.shipping_address) &&
                    selectedShippingMethod);
            case 'payment':
                return !!(formData.payment_method && formData.payment_method.id);
            case 'review':
                return false; // Never complete until order submitted
            default:
                return false;
        }
    };

    const validateShippingAddress = (address: ShippingAddress): boolean => {
        const required = ['first_name', 'last_name', 'address_line_1', 'city', 'state', 'postal_code'];
        if (!isSignedIn) {
            required.push('email');
        }

        return required.every(field => {
            const value = address[field as keyof ShippingAddress];
            return typeof value === 'string' && value.trim().length > 0;
        });
    };

    // Form update handlers
    const updateShippingAddress = (updates: Partial<ShippingAddress>) => {
        setFormData(prev => ({
            ...prev,
            shipping_address: {
                ...prev.shipping_address!,
                ...updates,
            }
        }));
    };

    const updateBillingAddress = (address: ShippingAddress) => {
        setFormData(prev => ({
            ...prev,
            billing_address: address
        }));
    };

    const selectShippingMethod = (method: ShippingMethod) => {
        setSelectedShippingMethod(method);
        setFormData(prev => ({
            ...prev,
            shipping_method: method
        }));
    };

    const selectPaymentMethod = (method: PaymentMethod) => {
        setFormData(prev => ({
            ...prev,
            payment_method: method
        }));
    };

    // Calculate totals
    const subtotal = cart?.subtotal || 0;
    const shippingCost = selectedShippingMethod?.price || 0;
    const total = subtotal + shippingCost + tax;

    // Handle successful order completion
    const handleOrderSuccess = () => {
        // The OrderReview component will handle getting the order number from the API response
        // and then call this function to redirect to confirmation
        router.push(`/checkout/confirmation?order_number=ORD-SUCCESS`);
    };

    if (cartLoading || !cart) {
        return <CheckoutSkeleton />;
    }

    if (cart.items.length === 0) {
        return <EmptyCartRedirect />;
    }

    return (
        <div className="min-h-screen bg-white dark:bg-black pt-[var(--navbar-height)]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Header */}
                <div className="mb-12">
                    <Link
                        href="/cart"
                        className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gold transition-colors mb-6"
                    >
                        <ArrowLeft size={20} />
                        <span className="tracking-wide">Back to Cart</span>
                    </Link>

                    <div className="flex items-center gap-4 mb-8">
                        <Lock size={32} className="text-gold" />
                        <h1 className="text-3xl md:text-4xl font-serif text-black dark:text-white">
                            Secure Checkout
                        </h1>
                    </div>

                    {/* Progress Steps */}
                    <div className="flex items-center justify-between mb-8">
                        {steps.map((step, index) => (
                            <div key={step.key} className="flex items-center flex-1 text-gray-900 dark:text-gray-100">
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
                    w-8 h-8 rounded-full flex items-center justify-center
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
                                            step.icon
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
                </div>

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
                                {currentStep === 'shipping' && (
                                    <ShippingForm
                                        formData={formData}
                                        shippingMethods={availableShippingMethods}
                                        selectedMethod={selectedShippingMethod}
                                        isGuestCheckout={!isSignedIn}
                                        isLoading={isLoading}
                                        validationErrors={validationErrors}
                                        onUpdateAddress={updateShippingAddress}
                                        onSelectShippingMethod={selectShippingMethod}
                                        onNext={goToNextStep}
                                    />
                                )}

                                {currentStep === 'payment' && (
                                    <Elements stripe={stripePromise}>
                                        <PaymentForm
                                            formData={formData}
                                            validationErrors={validationErrors}
                                            onSelectPaymentMethod={selectPaymentMethod}
                                            onUpdateBillingAddress={updateBillingAddress}
                                            onPrevious={goToPreviousStep}
                                            onNext={goToNextStep}
                                            isLoading={isLoading}
                                            orderTotal={total}
                                        />
                                    </Elements>
                                )}

                                {currentStep === 'review' && (
                                    <OrderReview
                                        cart={cart}
                                        formData={formData}
                                        shippingMethod={selectedShippingMethod!}
                                        tax={tax}
                                        total={total}
                                        onPrevious={goToPreviousStep}
                                        onPlaceOrder={handleOrderSuccess}
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
                            subtotal={subtotal}
                            shippingCost={shippingCost}
                            tax={tax}
                            total={total}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

// Order Summary component
function CheckoutOrderSummary({ cart, shippingMethod, subtotal, shippingCost, tax, total }: any) {
    return (
        <div className="sticky top-[calc(var(--navbar-height)+2rem)] bg-gray-50 dark:bg-gray-900 text-black dark:text-white rounded-lg p-6">
            <h3 className="text-xl font-serif mb-6">Order Summary</h3>

            {/* Items */}
            <div className="space-y-4 mb-6">
                {cart.items.map((item: any) => (
                    <div key={item.product_id} className="flex gap-4">
                        <div className={`w-16 h-16 ${item.product.display_theme === "dark" ? "bg-black" : "bg-white"} rounded overflow-hidden`}>
                            <JewelryImage.Product
                                src={item.product.image_url}
                                alt={item.product.name}
                                className="w-full h-full object-contain"
                            />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium truncate">{item.product.name}</h4>
                            <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                            <p className="text-sm font-medium">{formatCartPrice(item.product.price * item.quantity)}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Totals */}
            <div className="space-y-2 mb-6">
                <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{formatCartPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>{shippingCost > 0 ? formatCartPrice(shippingCost) : 'Free'}</span>
                </div>
                <div className="flex justify-between">
                    <span>Tax</span>
                    <span>{formatCartPrice(tax)}</span>
                </div>
                <div className="border-t pt-2">
                    <div className="flex justify-between text-lg font-semibold">
                        <span>Total</span>
                        <span className="text-gold">{formatCartPrice(total)}</span>
                    </div>
                </div>
            </div>

            {/* Security notice */}
            <div className="text-center">
                <p className="text-xs text-gray-500">🔒 Secure checkout with SSL encryption</p>
            </div>
        </div>
    );
}

// Loading and empty states
function CheckoutSkeleton() {
    return (
        <div className="min-h-screen bg-white dark:bg-black pt-[var(--navbar-height)]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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
                <Link href="/shop" className="bg-gold hover:bg-gold/90 text-black px-8 py-4 font-medium tracking-widest uppercase text-sm">
                    Continue Shopping
                </Link>
            </div>
        </div>
    );
}