// components/checkout/PaymentForm.tsx - Fixed Payment Intent Flow
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import { CreditCard, AlertCircle, Loader2, Shield } from "lucide-react";
import { useAuth, useUser } from "@clerk/nextjs";
import { CART_CONFIG } from "@/config/cartConfig";
import { PaymentMethod, CheckoutFormData, ShippingAddress } from "@/types/cart";
import { useTheme } from "next-themes";

interface PaymentFormProps {
    formData: Partial<CheckoutFormData>;
    validationErrors: Record<string, string>;
    onSelectPaymentMethod: (method: PaymentMethod) => void;
    onUpdateBillingAddress: (address: ShippingAddress) => void;
    onPrevious: () => void;
    onNext: () => void;
    isLoading: boolean;
    orderTotal: number;
}

export default function PaymentForm({
    formData,
    validationErrors,
    onSelectPaymentMethod,
    onUpdateBillingAddress,
    onPrevious,
    onNext,
    isLoading,
    orderTotal
}: PaymentFormProps) {
    const { getToken } = useAuth();
    const { user } = useUser();
    const stripe = useStripe();
    const elements = useElements();
    const { resolvedTheme } = useTheme()

    const [isProcessingPayment, setIsProcessingPayment] = useState(false);
    const [paymentIntentClientSecret, setPaymentIntentClientSecret] = useState<string>('');
    const [cardComplete, setCardComplete] = useState(false);
    const [cardErrors, setCardErrors] = useState<Record<string, string>>({});
    const [sameBillingAddress, setSameBillingAddress] = useState(true);
    const [billingAddress, setBillingAddress] = useState<ShippingAddress>(
        formData.shipping_address || {} as ShippingAddress
    );

    const placeholderColor = resolvedTheme === 'dark' ? '#ffffff' : '#9ca3af'

    // Create PaymentIntent when component mounts
    useEffect(() => {
        createPaymentIntent();
    }, [orderTotal]);

    const createPaymentIntent = async () => {
        try {
            const token = await getToken();
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/payment/create-intent`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    amount: Math.round(orderTotal), // Convert to cents
                    currency: 'usd',
                    shipping_address: formData.shipping_address,
                }),
            });

            if (!response.ok) {
                const errorData = await response.text();
                console.error('Payment intent error:', response.status, errorData);
                throw new Error(`Failed to create payment intent: ${response.status}`);
            }

            const { client_secret, payment_intent_id } = await response.json();
            setPaymentIntentClientSecret(client_secret);
            console.log('PaymentIntent created:', payment_intent_id);
        } catch (error) {
            console.error('Failed to create payment intent:', error);
            setCardErrors({ general: 'Failed to initialize payment. Please try again.' });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements || !paymentIntentClientSecret) {
            setCardErrors({ general: 'Payment system not ready. Please try again.' });
            return;
        }

        const cardElement = elements.getElement(CardElement);
        if (!cardElement) {
            setCardErrors({ general: 'Card element not found. Please refresh and try again.' });
            return;
        }

        setIsProcessingPayment(true);
        setCardErrors({});

        try {
            // Confirm the PaymentIntent with the card
            const { error, paymentIntent } = await stripe.confirmCardPayment(paymentIntentClientSecret, {
                payment_method: {
                    card: cardElement,
                    billing_details: {
                        name: `${billingAddress.first_name} ${billingAddress.last_name}`,
                        email: billingAddress.email || user?.primaryEmailAddress?.emailAddress,
                        address: {
                            line1: billingAddress.address_line_1,
                            line2: billingAddress.address_line_2 || undefined,
                            city: billingAddress.city,
                            state: billingAddress.state,
                            postal_code: billingAddress.postal_code,
                            country: billingAddress.country || 'US',
                        },
                    },
                },
            });

            if (error) {
                console.error('Payment failed:', error);
                setCardErrors({
                    general: error.message || 'Payment failed. Please try again.'
                });
                return;
            }

            if (paymentIntent && paymentIntent.status === 'succeeded') {
                console.log('Payment succeeded:', paymentIntent.id);

                // Safely extract card details
                let cardDetails = {
                    last_four: '****',
                    brand: 'card',
                    exp_month: undefined,
                    exp_year: undefined
                };

                // Check if payment_method is an object (not just an ID string)
                if (paymentIntent.payment_method && typeof paymentIntent.payment_method === 'object') {
                    const pm = paymentIntent.payment_method as any;
                    if (pm.card) {
                        cardDetails = {
                            last_four: pm.card.last4 || '****',
                            brand: pm.card.brand || 'card',
                            exp_month: pm.card.exp_month,
                            exp_year: pm.card.exp_year,
                        };
                    }
                }

                // Create the payment method object to pass to the next step
                const paymentMethod: PaymentMethod = {
                    id: paymentIntent.id, // Use PaymentIntent ID, not PaymentMethod ID
                    type: 'card',
                    last_four: cardDetails.last_four,
                    brand: cardDetails.brand,
                    exp_month: cardDetails.exp_month,
                    exp_year: cardDetails.exp_year,
                };

                // Pass the payment method and billing address to parent
                onSelectPaymentMethod(paymentMethod);
                if (!sameBillingAddress) {
                    onUpdateBillingAddress(billingAddress);
                }

                // Move to next step
                onNext();
            } else {
                setCardErrors({
                    general: 'Payment was not completed. Please try again.'
                });
            }
        } catch (error) {
            console.error('Payment processing error:', error);
            setCardErrors({
                general: 'An unexpected error occurred. Please try again.'
            });
        } finally {
            setIsProcessingPayment(false);
        }
    };

    const handleCardChange = (event: any) => {
        setCardComplete(event.complete);
        if (event.error) {
            setCardErrors({ card: event.error.message });
        } else {
            setCardErrors({});
        }
    };

    const handleBillingAddressChange = (field: keyof ShippingAddress, value: string) => {
        setBillingAddress(prev => ({ ...prev, [field]: value }));
    };

    const isFormValid = () => {
        return cardComplete && paymentIntentClientSecret &&
            (sameBillingAddress || validateBillingAddress(billingAddress));
    };

    const validateBillingAddress = (address: ShippingAddress): boolean => {
        const required = ['first_name', 'last_name', 'address_line_1', 'city', 'state', 'postal_code'];
        return required.every(field => {
            const value = address[field as keyof ShippingAddress];
            return typeof value === 'string' && value.trim().length > 0;
        });
    };

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.6,
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <motion.div
            className="max-w-2xl text-black dark:text-white"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Header */}
                <motion.div variants={itemVariants}>
                    <h2 className="text-2xl font-serif text-black dark:text-white mb-2">
                        {CART_CONFIG.messaging.checkout.paymentForm.title}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        {CART_CONFIG.messaging.checkout.paymentForm.subtitle}
                    </p>
                </motion.div>

                {/* Error Display */}
                {cardErrors.general && (
                    <motion.div
                        variants={itemVariants}
                        className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
                    >
                        <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                            <AlertCircle size={16} />
                            <span className="text-sm">{cardErrors.general}</span>
                        </div>
                    </motion.div>
                )}

                {/* Payment Method */}
                <motion.div variants={itemVariants} className="space-y-6">
                    <h3 className="text-lg font-medium flex items-center gap-2">
                        <CreditCard size={20} className="text-gold" />
                        Payment Information
                    </h3>

                    {/* Card Element */}
                    <div className="space-y-4">
                        <label className="block text-sm font-medium">
                            Card Details *
                        </label>
                        <div className={`p-4 border rounded-lg bg-white dark:bg-black transition-colors ${cardErrors.card
                            ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                            : cardComplete
                                ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                                : 'border-gray-300 dark:border-gray-600 focus-within:border-gold focus-within:ring-1 focus-within:ring-gold'
                            }`}>
                            <CardElement
                                onChange={handleCardChange}
                                options={{
                                    style: {
                                        base: {
                                            fontSize: '16px',
                                            color: placeholderColor,
                                            iconColor: placeholderColor,
                                            '::placeholder': {
                                                color: placeholderColor,
                                            },
                                            fontFamily: 'system-ui, sans-serif',
                                            lineHeight: '1.5',
                                        },
                                        invalid: {
                                            color: '#ef4444',
                                        },
                                    },
                                    hidePostalCode: false,
                                }}
                            />
                        </div>

                        {cardErrors.card && (
                            <p className="text-sm text-red-500 flex items-center gap-1">
                                <AlertCircle size={14} />
                                {cardErrors.card}
                            </p>
                        )}

                        {/* Test Card Info */}
                        <div className="text-xs text-gray-500 bg-gray-50 dark:bg-gray-900 p-3 rounded">
                            <strong>Test Card:</strong> 4242 4242 4242 4242 |
                            <strong> Expiry:</strong> Any future date |
                            <strong> CVC:</strong> Any 3 digits
                        </div>
                    </div>
                </motion.div>

                {/* Billing Address */}
                <motion.div variants={itemVariants} className="space-y-4">
                    <h3 className="text-lg font-medium">Billing Address</h3>

                    <label className="flex items-center gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={sameBillingAddress}
                            onChange={(e) => setSameBillingAddress(e.target.checked)}
                            className="w-4 h-4 text-gold focus:ring-gold border-gray-300 rounded"
                        />
                        <span className="text-sm">Same as shipping address</span>
                    </label>

                    {!sameBillingAddress && (
                        <motion.div
                            className="space-y-4 pl-6 border-l-2 border-gold/20"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            {/* Billing address form - simplified version */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input
                                    type="text"
                                    placeholder="First name"
                                    value={billingAddress.first_name || ''}
                                    onChange={(e) => handleBillingAddressChange('first_name', e.target.value)}
                                    className="px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-black rounded-lg focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
                                    required={!sameBillingAddress}
                                />
                                <input
                                    type="text"
                                    placeholder="Last name"
                                    value={billingAddress.last_name || ''}
                                    onChange={(e) => handleBillingAddressChange('last_name', e.target.value)}
                                    className="px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-black rounded-lg focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
                                    required={!sameBillingAddress}
                                />
                            </div>

                            <input
                                type="text"
                                placeholder="Street address"
                                value={billingAddress.address_line_1 || ''}
                                onChange={(e) => handleBillingAddressChange('address_line_1', e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-black rounded-lg focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
                                required={!sameBillingAddress}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <input
                                    type="text"
                                    placeholder="City"
                                    value={billingAddress.city || ''}
                                    onChange={(e) => handleBillingAddressChange('city', e.target.value)}
                                    className="px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-black rounded-lg focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
                                    required={!sameBillingAddress}
                                />
                                <input
                                    type="text"
                                    placeholder="State"
                                    value={billingAddress.state || ''}
                                    onChange={(e) => handleBillingAddressChange('state', e.target.value)}
                                    className="px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-black rounded-lg focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
                                    required={!sameBillingAddress}
                                />
                                <input
                                    type="text"
                                    placeholder="ZIP code"
                                    value={billingAddress.postal_code || ''}
                                    onChange={(e) => handleBillingAddressChange('postal_code', e.target.value)}
                                    className="px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-black rounded-lg focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
                                    required={!sameBillingAddress}
                                />
                            </div>
                        </motion.div>
                    )}
                </motion.div>

                {/* Security Notice */}
                <motion.div
                    variants={itemVariants}
                    className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg"
                >
                    <Shield size={20} className="text-blue-600 dark:text-blue-400" />
                    <div className="text-sm text-blue-700 dark:text-blue-300">
                        <p className="font-medium">Your payment is secure</p>
                        <p>We use industry-standard encryption to protect your information</p>
                    </div>
                </motion.div>

                {/* Action Buttons */}
                <motion.div variants={itemVariants} className="flex gap-4 pt-6">
                    <button
                        type="button"
                        onClick={onPrevious}
                        disabled={isProcessingPayment}
                        className="flex-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-4 px-6 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
                    >
                        Back to Shipping
                    </button>

                    <button
                        type="submit"
                        disabled={!isFormValid() || isProcessingPayment || !paymentIntentClientSecret}
                        className="flex-1 bg-gold hover:bg-gold/90 text-black font-medium py-4 px-6 rounded-lg transition-all duration-300 hover:scale-[1.02] tracking-widest uppercase text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                        {isProcessingPayment ? (
                            <div className="flex items-center justify-center gap-2">
                                <Loader2 size={16} className="animate-spin" />
                                Processing Payment...
                            </div>
                        ) : (
                            'Continue to Review'
                        )}
                    </button>
                </motion.div>
            </form>
        </motion.div>
    );
}