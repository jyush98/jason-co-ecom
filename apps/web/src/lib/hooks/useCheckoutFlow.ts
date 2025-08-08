// apps/web/src/lib/hooks/useCheckoutFlow.ts
// Multi-step checkout flow management hook

import { useState, useCallback, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import type {
    CheckoutStep,
    CheckoutFormData,
    ShippingMethod,
    PaymentMethod,
    ShippingAddress
} from '@/types/cart';

interface UseCheckoutFlowReturn {
    // Current state
    currentStep: CheckoutStep;
    formData: Partial<CheckoutFormData>;
    availableShippingMethods: ShippingMethod[];
    selectedShippingMethod: ShippingMethod | null;
    validationErrors: Record<string, string>;
    isLoading: boolean;
    isSubmitting: boolean;
    error: string | null;

    // Navigation
    goToStep: (step: CheckoutStep) => void;
    goToNextStep: () => void;
    goToPreviousStep: () => void;
    canNavigateToStep: (step: CheckoutStep) => boolean;
    isStepComplete: (step: CheckoutStep) => boolean;

    // Form updates
    updateShippingAddress: (updates: Partial<ShippingAddress>) => void;
    updateBillingAddress: (address: ShippingAddress) => void;
    selectShippingMethod: (method: ShippingMethod) => void;
    selectPaymentMethod: (method: PaymentMethod) => void;

    // Actions
    fetchShippingMethods: () => Promise<void>;
    submitOrder: () => Promise<void>;
    clearErrors: () => void;
}

// Export the interface for external use
export type { UseCheckoutFlowReturn };

const STEPS: CheckoutStep[] = ['shipping', 'payment', 'review'];

export function useCheckoutFlow(): UseCheckoutFlowReturn {
    // const { getToken } = useAuth();
    const { isSignedIn, user } = useUser();

    // State
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
    const [selectedShippingMethod, setSelectedShippingMethod] = useState<ShippingMethod | null>(null);
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Auto-populate user data for authenticated users
    useEffect(() => {
        if (isSignedIn && user) {
            updateShippingAddress({
                first_name: user.firstName || '',
                last_name: user.lastName || '',
                email: user.primaryEmailAddress?.emailAddress || '',
            });
        }
    }, [isSignedIn, user]);

    // Navigation functions
    const getCurrentStepIndex = useCallback(() => {
        return STEPS.findIndex(step => step === currentStep);
    }, [currentStep]);

    const canNavigateToStep = useCallback((step: CheckoutStep): boolean => {
        const stepIndex = STEPS.findIndex(s => s === step);
        const currentIndex = getCurrentStepIndex();

        // Can always go backward
        if (stepIndex <= currentIndex) return true;

        // Can only go forward if current step is complete
        return isStepComplete(STEPS[stepIndex - 1]);
    }, [getCurrentStepIndex]);

    const isStepComplete = useCallback((step: CheckoutStep): boolean => {
        switch (step) {
            case 'shipping':
                return validateShippingAddress(formData.shipping_address!) && !!selectedShippingMethod;
            case 'payment':
                return !!formData.payment_method;
            case 'review':
                return true;
            default:
                return false;
        }
    }, [formData, selectedShippingMethod]);

    const goToStep = useCallback((step: CheckoutStep) => {
        if (canNavigateToStep(step)) {
            setCurrentStep(step);
            setValidationErrors({});
            setError(null);
        }
    }, [canNavigateToStep]);

    const goToNextStep = useCallback(() => {
        const currentIndex = getCurrentStepIndex();
        const nextIndex = currentIndex + 1;

        if (nextIndex < STEPS.length) {
            goToStep(STEPS[nextIndex]);
        }
    }, [getCurrentStepIndex, goToStep]);

    const goToPreviousStep = useCallback(() => {
        const currentIndex = getCurrentStepIndex();
        const prevIndex = currentIndex - 1;

        if (prevIndex >= 0) {
            goToStep(STEPS[prevIndex]);
        }
    }, [getCurrentStepIndex, goToStep]);

    // Form update functions
    const updateShippingAddress = useCallback((updates: Partial<ShippingAddress>) => {
        setFormData(prev => ({
            ...prev,
            shipping_address: {
                ...prev.shipping_address!,
                ...updates,
            }
        }));
        setValidationErrors({}); // Clear errors on user input
    }, []);

    const updateBillingAddress = useCallback((address: ShippingAddress) => {
        setFormData(prev => ({
            ...prev,
            billing_address: address
        }));
    }, []);

    const selectShippingMethod = useCallback((method: ShippingMethod) => {
        setSelectedShippingMethod(method);
        setFormData(prev => ({
            ...prev,
            shipping_method: method
        }));
    }, []);

    const selectPaymentMethod = useCallback((method: PaymentMethod) => {
        setFormData(prev => ({
            ...prev,
            payment_method: method
        }));
    }, []);

    // Validation helper
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

    // API functions
    const fetchShippingMethods = useCallback(async () => {
        if (!formData.shipping_address || !validateShippingAddress(formData.shipping_address)) {
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            // Mock shipping methods - replace with real API call
            const methods: ShippingMethod[] = [
                {
                    id: 'standard',
                    name: 'Standard Shipping',
                    description: 'Free shipping on orders over $100',
                    price: 15,
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
                selectShippingMethod(methods[0]);
            }

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch shipping methods';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, [formData.shipping_address, selectedShippingMethod, selectShippingMethod, isSignedIn]);

    const submitOrder = useCallback(async () => {
        setIsSubmitting(true);
        setError(null);

        try {
            // TODO: Implement actual order submission
            const orderData = {
                shipping_address: formData.shipping_address,
                billing_address: formData.billing_address || formData.shipping_address,
                shipping_method: selectedShippingMethod,
                payment_method: formData.payment_method,
                gift_options: formData.gift_options,
                order_notes: formData.order_notes,
            };

            // Mock API call - replace with real implementation
            await new Promise(resolve => setTimeout(resolve, 2000));

            console.log('Order submitted:', orderData);

            // Success - parent component should handle navigation to confirmation

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to submit order';
            setError(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    }, [formData, selectedShippingMethod]);

    const clearErrors = useCallback(() => {
        setError(null);
        setValidationErrors({});
    }, []);

    return {
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
    };
}

export default useCheckoutFlow;