// components/checkout/OrderReview.tsx - Fixed version
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
    Check,
    CreditCard,
    MapPin,
    Truck,
    Package,
    Loader2,
    AlertCircle,
    Edit
} from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { formatCartPrice } from "@/config/cartConfig";
import { Cart, CheckoutFormData, ShippingMethod } from "@/types/cart";
import { JewelryImage } from "../ui/OptimizedImage";

interface OrderReviewProps {
    cart: Cart;
    formData: Partial<CheckoutFormData>;
    shippingMethod: ShippingMethod;
    tax: number,
    total: number;
    onPrevious: () => void;
    onPlaceOrder: () => void; // This will be called after successful order submission
}

export default function OrderReview({
    cart,
    formData,
    shippingMethod,
    tax,
    total,
    onPrevious,
    onPlaceOrder,
}: OrderReviewProps) {
    const { getToken } = useAuth();
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string>('');

    const handleSubmitOrder = async () => {
        setIsSubmitting(true);
        setSubmitError('');

        try {
            const token = await getToken();

            // Submit the order to your backend
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/payment/submit-order`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    shipping_address: formData.shipping_address,
                    billing_address: formData.billing_address || formData.shipping_address,
                    shipping_method: shippingMethod,
                    payment_method: formData.payment_method,
                    gift_options: formData.gift_options,
                    order_notes: formData.order_notes,
                    payment_intent_id: formData.payment_method?.id // From successful payment
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Order submission failed');
            }

            const result = await response.json();
            console.log('Order submitted successfully:', result);

            // Redirect to confirmation page with the order number from API response
            router.push(`/checkout/confirmation?order_number=${result.order_number}`);

        } catch (error) {
            console.error('Order submission error:', error);
            setSubmitError(error instanceof Error ? error.message : 'Failed to place order. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
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
            className="max-w-4xl text-black dark:text-white"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <div className="space-y-8">
                {/* Header */}
                <motion.div variants={itemVariants}>
                    <h2 className="text-2xl font-serif mb-2">
                        Review Your Order
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        Please review your order details before completing your purchase
                    </p>
                </motion.div>

                {/* Error Display */}
                {submitError && (
                    <motion.div
                        variants={itemVariants}
                        className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
                    >
                        <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                            <AlertCircle size={16} />
                            <span className="text-sm">{submitError}</span>
                        </div>
                    </motion.div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Column - Order Details */}
                    <div className="space-y-6">
                        {/* Order Items */}
                        <motion.div
                            variants={itemVariants}
                            className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6"
                        >
                            <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                                <Package size={20} className="text-gold" />
                                Order Items ({cart.items.length})
                            </h3>

                            <div className="space-y-4">
                                {cart.items.map((item) => (
                                    <div key={item.product_id} className="flex gap-4">
                                        <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden flex-shrink-0">
                                            <JewelryImage.Product
                                                src={item.product.image_url? item.product.image_url : "/placeholder.jpg"}
                                                alt={item.product.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-medium truncate">{item.product.name}</h4>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                Quantity: {item.quantity}
                                            </p>
                                            <p className="text-sm font-medium text-gold">
                                                {formatCartPrice(item.product.price * item.quantity)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Shipping Information */}
                        <motion.div
                            variants={itemVariants}
                            className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6"
                        >
                            <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                                <Truck size={20} className="text-gold" />
                                Shipping Information
                                <button
                                    onClick={onPrevious}
                                    className="ml-auto text-gold hover:text-gold/80 transition-colors"
                                >
                                    <Edit size={16} />
                                </button>
                            </h3>

                            <div className="space-y-3">
                                <div>
                                    <p className="font-medium">Delivery Address</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {formData.shipping_address?.first_name} {formData.shipping_address?.last_name}<br />
                                        {formData.shipping_address?.address_line_1}<br />
                                        {formData.shipping_address?.address_line_2 && (
                                            <>{formData.shipping_address.address_line_2}<br /></>
                                        )}
                                        {formData.shipping_address?.city}, {formData.shipping_address?.state} {formData.shipping_address?.postal_code}
                                    </p>
                                </div>

                                <div>
                                    <p className="font-medium">Shipping Method</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {shippingMethod.name} - {shippingMethod.estimated_days}
                                        {shippingMethod.price > 0 && (
                                            <span className="ml-2 text-gold">
                                                {formatCartPrice(shippingMethod.price)}
                                            </span>
                                        )}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Right Column - Payment & Summary */}
                    <div className="space-y-6">
                        {/* Payment Information */}
                        <motion.div
                            variants={itemVariants}
                            className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6"
                        >
                            <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                                <CreditCard size={20} className="text-gold" />
                                Payment Method
                                <button
                                    onClick={onPrevious}
                                    className="ml-auto text-gold hover:text-gold/80 transition-colors"
                                >
                                    <Edit size={16} />
                                </button>
                            </h3>

                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
                                    <CreditCard size={16} className="text-gray-600 dark:text-gray-400" />
                                </div>
                                <div>
                                    <p className="font-medium">
                                        {formData.payment_method?.brand || 'Card'} ending in {formData.payment_method?.last_four || '****'}
                                    </p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Billing address: {formData.billing_address?.city || formData.shipping_address?.city}, {formData.billing_address?.state || formData.shipping_address?.state}
                                    </p>
                                </div>
                                <div className="ml-auto">
                                    <Check size={16} className="text-green-600" />
                                </div>
                            </div>
                        </motion.div>

                        {/* Order Summary */}
                        <motion.div
                            variants={itemVariants}
                            className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6"
                        >
                            <h3 className="text-lg font-medium mb-4">Order Summary</h3>

                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span>Subtotal</span>
                                    <span>{formatCartPrice(cart.subtotal)}</span>
                                </div>

                                <div className="flex justify-between">
                                    <span>Shipping</span>
                                    <span>{shippingMethod.price > 0 ? formatCartPrice(shippingMethod.price) : 'Free'}</span>
                                </div>

                                <div className="flex justify-between">
                                    <span>Tax</span>
                                    <span>{formatCartPrice(tax)}</span>
                                </div>

                                {cart.promo_discount && cart.promo_discount > 0 && (
                                    <div className="flex justify-between text-green-600 dark:text-green-400">
                                        <span>Discount</span>
                                        <span>-{formatCartPrice(cart.promo_discount)}</span>
                                    </div>
                                )}

                                <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                                    <div className="flex justify-between text-lg font-semibold">
                                        <span>Total</span>
                                        <span className="text-gold">{formatCartPrice(total)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Estimated Delivery */}
                            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded">
                                <p className="text-sm text-blue-700 dark:text-blue-300">
                                    <strong>Estimated Delivery:</strong> {shippingMethod.estimated_days}
                                </p>
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Action Buttons */}
                <motion.div
                    variants={itemVariants}
                    className="flex gap-4 pt-6 border-t border-gray-200 dark:border-gray-700"
                >
                    <button
                        type="button"
                        onClick={onPrevious}
                        disabled={isSubmitting}
                        className="flex-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-4 px-6 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
                    >
                        Back to Payment
                    </button>

                    <button
                        onClick={handleSubmitOrder}
                        disabled={isSubmitting}
                        className="flex-1 bg-gold hover:bg-gold/90 text-black font-medium py-4 px-6 rounded-lg transition-all duration-300 hover:scale-[1.02] tracking-widest uppercase text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                        {isSubmitting ? (
                            <div className="flex items-center justify-center gap-2">
                                <Loader2 size={16} className="animate-spin" />
                                Placing Order...
                            </div>
                        ) : (
                            'Place Order'
                        )}
                    </button>
                </motion.div>

                {/* Order Terms */}
                <motion.div
                    variants={itemVariants}
                    className="text-center text-sm text-gray-500 dark:text-gray-400"
                >
                    <p>
                        By placing this order, you agree to our{' '}
                        <a href="/terms" className="text-gold hover:text-gold/80 transition-colors">
                            Terms of Service
                        </a>{' '}
                        and{' '}
                        <a href="/privacy" className="text-gold hover:text-gold/80 transition-colors">
                            Privacy Policy
                        </a>
                    </p>
                </motion.div>
            </div>
        </motion.div>
    );
}