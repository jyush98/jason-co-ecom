// apps/web/src/utils/checkoutUtils.ts
// Checkout-specific utility functions

import type {
    ShippingAddress,
    ShippingMethod,
    PaymentMethod,
    CheckoutFormData,
    CheckoutStep
} from '@/types/cart';
import { formatCartPrice } from '@/config/cartConfig';

// Address validation utilities
export const validateShippingAddress = (address: ShippingAddress, isGuestCheckout: boolean = false): {
    isValid: boolean;
    errors: Record<string, string>;
} => {
    const errors: Record<string, string> = {};

    // Required fields for all users
    const requiredFields = [
        { field: 'first_name', label: 'First name' },
        { field: 'last_name', label: 'Last name' },
        { field: 'address_line_1', label: 'Street address' },
        { field: 'city', label: 'City' },
        { field: 'state', label: 'State' },
        { field: 'postal_code', label: 'ZIP code' },
        { field: 'country', label: 'Country' }
    ];

    // Add email requirement for guest checkout
    if (isGuestCheckout) {
        requiredFields.push({ field: 'email', label: 'Email' });
    }

    // Check required fields
    requiredFields.forEach(({ field, label }) => {
        const value = address[field as keyof ShippingAddress];
        if (!value || (typeof value === 'string' && value.trim().length === 0)) {
            errors[field] = `${label} is required`;
        }
    });

    // Email format validation
    if (address.email && address.email.trim()) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(address.email)) {
            errors.email = 'Please enter a valid email address';
        }
    }

    // Phone format validation (if provided)
    if (address.phone && address.phone.trim()) {
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        if (!phoneRegex.test(address.phone.replace(/[\s\-\(\)]/g, ''))) {
            errors.phone = 'Please enter a valid phone number';
        }
    }

    // ZIP code format validation (US)
    if (address.postal_code && address.country === 'US') {
        const zipRegex = /^\d{5}(-\d{4})?$/;
        if (!zipRegex.test(address.postal_code)) {
            errors.postal_code = 'Please enter a valid US ZIP code (e.g., 12345 or 12345-6789)';
        }
    }

    // State validation (US)
    if (address.state && address.country === 'US') {
        const usStates = [
            'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
            'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
            'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
            'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
            'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
        ];
        if (!usStates.includes(address.state.toUpperCase())) {
            errors.state = 'Please enter a valid US state code (e.g., CA, NY, TX)';
        }
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};

// Payment method validation
export const validatePaymentMethod = (paymentMethod: PaymentMethod): {
    isValid: boolean;
    errors: Record<string, string>;
} => {
    const errors: Record<string, string> = {};

    if (!paymentMethod.id) {
        errors.payment = 'Payment method is required';
    }

    if (!paymentMethod.type) {
        errors.payment_type = 'Payment type is required';
    }

    // Card-specific validation
    if (paymentMethod.type === 'card') {
        if (!paymentMethod.last_four) {
            errors.card = 'Card information is incomplete';
        }

        if (!paymentMethod.brand) {
            errors.card_brand = 'Card brand is required';
        }

        if (!paymentMethod.exp_month || !paymentMethod.exp_year) {
            errors.card_expiry = 'Card expiry date is required';
        }

        // Check if card is expired
        if (paymentMethod.exp_month && paymentMethod.exp_year) {
            const now = new Date();
            const expiry = new Date(paymentMethod.exp_year, paymentMethod.exp_month - 1);
            if (expiry < now) {
                errors.card_expiry = 'Card has expired';
            }
        }
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};

// Checkout step validation
export const validateCheckoutStep = (
    step: CheckoutStep,
    formData: Partial<CheckoutFormData>,
    selectedShippingMethod?: ShippingMethod,
    isGuestCheckout: boolean = false
): { isValid: boolean; errors: Record<string, string> } => {
    let errors: Record<string, string> = {};

    switch (step) {
        case 'shipping':
            if (!formData.shipping_address) {
                errors.shipping = 'Shipping address is required';
            } else {
                const addressValidation = validateShippingAddress(formData.shipping_address, isGuestCheckout);
                errors = { ...errors, ...addressValidation.errors };
            }

            if (!selectedShippingMethod) {
                errors.shipping_method = 'Please select a shipping method';
            }
            break;

        case 'payment':
            if (!formData.payment_method) {
                errors.payment = 'Payment method is required';
            } else {
                const paymentValidation = validatePaymentMethod(formData.payment_method);
                errors = { ...errors, ...paymentValidation.errors };
            }
            break;

        case 'review':
            // Final validation - all previous steps should be complete
            const shippingValidation = validateCheckoutStep('shipping', formData, selectedShippingMethod, isGuestCheckout);
            const paymentValidation = validateCheckoutStep('payment', formData, selectedShippingMethod, isGuestCheckout);

            errors = {
                ...errors,
                ...shippingValidation.errors,
                ...paymentValidation.errors
            };
            break;
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};

// Shipping cost calculation
export const calculateShippingCost = (
    method: ShippingMethod,
    cartSubtotal: number,
    itemCount: number,
    address?: ShippingAddress
): number => {
    let cost = method.price;

    // Free shipping threshold
    const freeShippingThreshold = 500;
    if (cartSubtotal >= freeShippingThreshold && !method.is_express) {
        return 0;
    }

    // Express shipping surcharge
    if (method.is_express && itemCount > 5) {
        cost += itemCount * 2; // $2 per item for express with many items
    }

    // Remote area surcharge (mock logic)
    if (address?.state && ['AK', 'HI'].includes(address.state)) {
        cost += 10; // Additional $10 for Alaska/Hawaii
    }

    return Math.max(0, cost);
};

// Tax calculation by state
export const calculateTaxByState = (subtotal: number, state: string): number => {
    // Mock state tax rates - replace with real tax service
    const stateTaxRates: Record<string, number> = {
        'CA': 0.095,  // 9.5%
        'NY': 0.08,   // 8%
        'TX': 0.0625, // 6.25%
        'FL': 0.06,   // 6%
        'WA': 0.065,  // 6.5%
        'OR': 0.0,    // No sales tax
        'NH': 0.0,    // No sales tax
        'MT': 0.0,    // No sales tax
        'DE': 0.0,    // No sales tax
    };

    const taxRate = stateTaxRates[state] || 0.05; // Default 5%
    return subtotal * taxRate;
};

// Order summary calculation
export const calculateOrderSummary = (
    cartSubtotal: number,
    shippingMethod: ShippingMethod,
    address: ShippingAddress,
    itemCount: number,
    promoDiscount: number = 0
) => {
    const shipping = calculateShippingCost(shippingMethod, cartSubtotal, itemCount, address);
    const tax = calculateTaxByState(cartSubtotal - promoDiscount, address.state);
    const total = cartSubtotal + shipping + tax - promoDiscount;

    return {
        subtotal: cartSubtotal,
        shipping,
        tax,
        discount: promoDiscount,
        total: Math.max(0, total),
        // Formatted versions
        formatted: {
            subtotal: formatCartPrice(cartSubtotal),
            shipping: formatCartPrice(shipping),
            tax: formatCartPrice(tax),
            discount: formatCartPrice(promoDiscount),
            total: formatCartPrice(Math.max(0, total))
        }
    };
};

// Address formatting utilities
export const formatAddressForDisplay = (address: ShippingAddress): string => {
    const parts = [
        address.address_line_1,
        address.address_line_2,
        `${address.city}, ${address.state} ${address.postal_code}`,
        address.country !== 'US' ? address.country : null
    ].filter(Boolean);

    return parts.join('\n');
};

export const formatAddressOneLine = (address: ShippingAddress): string => {
    const parts = [
        address.address_line_1,
        address.address_line_2,
        address.city,
        address.state,
        address.postal_code
    ].filter(Boolean);

    return parts.join(', ');
};

// Progress calculation
export const calculateCheckoutProgress = (currentStep: CheckoutStep): number => {
    const steps: CheckoutStep[] = ['shipping', 'payment', 'review'];
    const currentIndex = steps.indexOf(currentStep);
    return ((currentIndex + 1) / steps.length) * 100;
};

// Estimated delivery calculation
export const calculateEstimatedDelivery = (
    shippingMethod: ShippingMethod,
    orderDate: Date = new Date()
): { earliest: Date; latest: Date; formatted: string } => {
    const businessDaysToAdd = shippingMethod.is_express ? 1 : 5;
    const maxBusinessDays = shippingMethod.is_express ? 3 : 7;

    const addBusinessDays = (date: Date, days: number): Date => {
        const result = new Date(date);
        let addedDays = 0;

        while (addedDays < days) {
            result.setDate(result.getDate() + 1);
            // Skip weekends
            if (result.getDay() !== 0 && result.getDay() !== 6) {
                addedDays++;
            }
        }

        return result;
    };

    const earliest = addBusinessDays(orderDate, businessDaysToAdd);
    const latest = addBusinessDays(orderDate, maxBusinessDays);

    const formatDate = (date: Date): string => {
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        });
    };

    return {
        earliest,
        latest,
        formatted: `${formatDate(earliest)} - ${formatDate(latest)}`
    };
};

// Checkout form data serialization
export const serializeCheckoutData = (formData: Partial<CheckoutFormData>): string => {
    try {
        return JSON.stringify({
            ...formData,
            timestamp: new Date().toISOString(),
            version: '1.0'
        });
    } catch (error) {
        console.error('Failed to serialize checkout data:', error);
        return '{}';
    }
};

// ✅ FIXED: Properly handle unused destructured variables
export const deserializeCheckoutData = (data: string): Partial<CheckoutFormData> | null => {
    try {
        const parsed = JSON.parse(data);

        // Remove metadata fields and return only form data
        // Create a clean copy without timestamp and version
        const formData = { ...parsed };
        delete formData.timestamp;
        delete formData.version;

        return formData;
    } catch (error) {
        console.error('Failed to deserialize checkout data:', error);
        return null;
    }
};