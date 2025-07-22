"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Truck, Clock, Check, AlertCircle, Loader2 } from "lucide-react";
import { useAuth, useUser } from "@clerk/nextjs";
import { CART_CONFIG } from "@/config/cartConfig";
import { ShippingAddress, ShippingMethod, CheckoutFormData } from "@/types/cart";

interface ShippingFormProps {
    formData: Partial<CheckoutFormData>;
    shippingMethods: ShippingMethod[];
    selectedMethod?: ShippingMethod;
    isGuestCheckout: boolean;
    isLoading: boolean;
    validationErrors: Record<string, string>;
    onUpdateAddress: (updates: Partial<ShippingAddress>) => void;
    onSelectShippingMethod: (method: ShippingMethod) => void;
    onNext: () => void;
}

export default function ShippingForm({
    formData,
    shippingMethods,
    selectedMethod,
    isGuestCheckout,
    isLoading,
    validationErrors,
    onUpdateAddress,
    onSelectShippingMethod,
    onNext
}: ShippingFormProps) {
    const { user } = useUser();
    const [isValidatingAddress, setIsValidatingAddress] = useState(false);
    const [addressSuggestions, setAddressSuggestions] = useState<any[]>([]);

    const address = formData.shipping_address || {
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
    };

    // Auto-populate user data for authenticated users
    useEffect(() => {
        if (!isGuestCheckout && user) {
            onUpdateAddress({
                first_name: user.firstName || address.first_name,
                last_name: user.lastName || address.last_name,
                email: user.primaryEmailAddress?.emailAddress || address.email,
            });
        }
    }, [user, isGuestCheckout]);

    // Validate address and fetch shipping methods when address is complete
    useEffect(() => {
        const isAddressComplete = address.address_line_1 && address.city && address.state && address.postal_code;

        if (isAddressComplete && !isValidatingAddress) {
            validateAndFetchShipping();
        }
    }, [address.address_line_1, address.city, address.state, address.postal_code]);

    const validateAndFetchShipping = async () => {
        setIsValidatingAddress(true);
        try {
            // In a real app, you'd validate the address and fetch shipping methods
            // For now, we'll simulate this
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Mock shipping methods - replace with real API call
            const mockMethods: ShippingMethod[] = [
                {
                    id: 'standard',
                    name: 'Standard Shipping',
                    description: 'Free shipping on orders over $100',
                    price: address.postal_code ? (calculateShippingPrice() > 0 ? 15 : 0) : 15,
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

            // You would replace this with actual API call to your shipping service
            // const methods = await fetchShippingMethods(address);

        } catch (error) {
            console.error('Failed to validate address:', error);
        } finally {
            setIsValidatingAddress(false);
        }
    };

    const calculateShippingPrice = () => {
        // Mock calculation - replace with real logic
        return 15; // Base shipping cost
    };

    const handleInputChange = (field: keyof ShippingAddress, value: string) => {
        onUpdateAddress({ [field]: value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isFormValid()) {
            onNext();
        }
    };

    const isFormValid = () => {
        const requiredFields = ['first_name', 'last_name', 'address_line_1', 'city', 'state', 'postal_code'];
        if (isGuestCheckout) requiredFields.push('email');

        return requiredFields.every(field => {
            const value = address[field as keyof ShippingAddress];
            return typeof value === 'string' && value.trim().length > 0;
        }) && selectedMethod;
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
            className="max-w-2xl"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Header */}
                <motion.div variants={itemVariants}>
                    <h2 className="text-2xl font-serif text-black dark:text-white mb-2">
                        {CART_CONFIG.messaging.checkout.shippingForm.title}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        {CART_CONFIG.messaging.checkout.shippingForm.subtitle}
                    </p>
                </motion.div>

                {/* Guest Email (if applicable) */}
                {isGuestCheckout && (
                    <motion.div variants={itemVariants} className="space-y-4">
                        <h3 className="text-lg font-medium flex items-center gap-2">
                            <MapPin size={20} className="text-gold" />
                            Contact Information
                        </h3>

                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Email Address *
                            </label>
                            <input
                                type="email"
                                value={address.email || ''}
                                onChange={(e) => handleInputChange('email', e.target.value)}
                                placeholder={CART_CONFIG.messaging.checkout.shippingForm.guestEmailPlaceholder}
                                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent transition-colors ${validationErrors.email
                                        ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                                        : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-black'
                                    }`}
                                required
                            />
                            {validationErrors.email && (
                                <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                                    <AlertCircle size={14} />
                                    {validationErrors.email}
                                </p>
                            )}
                        </div>
                    </motion.div>
                )}

                {/* Shipping Address */}
                <motion.div variants={itemVariants} className="space-y-4">
                    <h3 className="text-lg font-medium flex items-center gap-2">
                        <MapPin size={20} className="text-gold" />
                        Shipping Address
                    </h3>

                    {/* Name Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                First Name *
                            </label>
                            <input
                                type="text"
                                value={address.first_name}
                                onChange={(e) => handleInputChange('first_name', e.target.value)}
                                placeholder={CART_CONFIG.messaging.checkout.shippingForm.firstNamePlaceholder}
                                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent transition-colors ${validationErrors.first_name
                                        ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                                        : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-black'
                                    }`}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Last Name *
                            </label>
                            <input
                                type="text"
                                value={address.last_name}
                                onChange={(e) => handleInputChange('last_name', e.target.value)}
                                placeholder={CART_CONFIG.messaging.checkout.shippingForm.lastNamePlaceholder}
                                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent transition-colors ${validationErrors.last_name
                                        ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                                        : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-black'
                                    }`}
                                required
                            />
                        </div>
                    </div>

                    {/* Address Fields */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Street Address *
                        </label>
                        <input
                            type="text"
                            value={address.address_line_1}
                            onChange={(e) => handleInputChange('address_line_1', e.target.value)}
                            placeholder={CART_CONFIG.messaging.checkout.shippingForm.addressPlaceholder}
                            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent transition-colors ${validationErrors.address_line_1
                                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                                    : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-black'
                                }`}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Apartment, Suite, etc. (Optional)
                        </label>
                        <input
                            type="text"
                            value={address.address_line_2 || ''}
                            onChange={(e) => handleInputChange('address_line_2', e.target.value)}
                            placeholder="Apartment, suite, unit, building, floor, etc."
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-black rounded-lg focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent transition-colors"
                        />
                    </div>

                    {/* City, State, ZIP */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                City *
                            </label>
                            <input
                                type="text"
                                value={address.city}
                                onChange={(e) => handleInputChange('city', e.target.value)}
                                placeholder={CART_CONFIG.messaging.checkout.shippingForm.cityPlaceholder}
                                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent transition-colors ${validationErrors.city
                                        ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                                        : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-black'
                                    }`}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">
                                State *
                            </label>
                            <input
                                type="text"
                                value={address.state}
                                onChange={(e) => handleInputChange('state', e.target.value)}
                                placeholder={CART_CONFIG.messaging.checkout.shippingForm.statePlaceholder}
                                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent transition-colors ${validationErrors.state
                                        ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                                        : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-black'
                                    }`}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">
                                ZIP Code *
                            </label>
                            <input
                                type="text"
                                value={address.postal_code}
                                onChange={(e) => handleInputChange('postal_code', e.target.value)}
                                placeholder={CART_CONFIG.messaging.checkout.shippingForm.zipPlaceholder}
                                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent transition-colors ${validationErrors.postal_code
                                        ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                                        : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-black'
                                    }`}
                                required
                            />
                        </div>
                    </div>

                    {/* Phone (Optional) */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Phone Number (Optional)
                        </label>
                        <input
                            type="tel"
                            value={address.phone || ''}
                            onChange={(e) => handleInputChange('phone', e.target.value)}
                            placeholder={CART_CONFIG.messaging.checkout.shippingForm.phonePlaceholder}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-black rounded-lg focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent transition-colors"
                        />
                    </div>
                </motion.div>

                {/* Shipping Methods */}
                <motion.div variants={itemVariants} className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium flex items-center gap-2">
                            <Truck size={20} className="text-gold" />
                            Shipping Method
                        </h3>
                        {isValidatingAddress && (
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <Loader2 size={16} className="animate-spin" />
                                Calculating shipping...
                            </div>
                        )}
                    </div>

                    {shippingMethods.length > 0 ? (
                        <div className="space-y-3">
                            {shippingMethods.map((method) => (
                                <motion.div
                                    key={method.id}
                                    className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 ${selectedMethod?.id === method.id
                                            ? 'border-gold bg-gold/5 ring-1 ring-gold'
                                            : 'border-gray-300 dark:border-gray-600 hover:border-gold/50'
                                        }`}
                                    onClick={() => onSelectShippingMethod(method)}
                                    whileHover={{ scale: 1.01 }}
                                    whileTap={{ scale: 0.99 }}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${selectedMethod?.id === method.id
                                                    ? 'border-gold bg-gold'
                                                    : 'border-gray-300 dark:border-gray-600'
                                                }`}>
                                                {selectedMethod?.id === method.id && (
                                                    <Check size={10} className="text-white" />
                                                )}
                                            </div>
                                            <div>
                                                <div className="font-medium flex items-center gap-2">
                                                    {method.name}
                                                    {method.is_express && (
                                                        <span className="text-xs bg-gold text-black px-2 py-0.5 rounded font-medium">
                                                            EXPRESS
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                                    {method.description}
                                                </div>
                                                <div className="text-sm text-gray-500 flex items-center gap-1">
                                                    <Clock size={14} />
                                                    {method.estimated_days}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-medium">
                                                {method.price === 0 ? 'Free' : `$${method.price}`}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            <Truck size={48} className="mx-auto mb-4 opacity-50" />
                            <p>Enter your address to see shipping options</p>
                        </div>
                    )}
                </motion.div>

                {/* Continue Button */}
                <motion.div variants={itemVariants} className="pt-6">
                    <button
                        type="submit"
                        disabled={!isFormValid() || isLoading || isValidatingAddress}
                        className="w-full bg-gold hover:bg-gold/90 text-black font-medium py-4 px-6 rounded-lg transition-all duration-300 hover:scale-[1.02] tracking-widest uppercase text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                        {isLoading ? (
                            <div className="flex items-center justify-center gap-2">
                                <Loader2 size={16} className="animate-spin" />
                                Processing...
                            </div>
                        ) : (
                            'Continue to Payment'
                        )}
                    </button>
                </motion.div>
            </form>
        </motion.div>
    );
}