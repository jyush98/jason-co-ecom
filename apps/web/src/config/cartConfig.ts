// config/cartConfig.ts

export interface CartDrawerConfig {
    position: 'left' | 'right';
    width: string;
    mobileWidth: string;
    mobileFullscreen: boolean;
    animationDuration: number;
    backdropBlur: boolean;
    closeOnBackdropClick: boolean;
}

export interface CheckoutConfig {
    steps: ('shipping' | 'payment' | 'review')[];
    enableGuestCheckout: boolean;
    requirePhoneNumber: boolean;
    enableAddressSuggestions: boolean;
    enableExpressCheckout: boolean;
    autoCalculateShipping: boolean;
    autoCalculateTax: boolean;
    saveUserAddresses: boolean;
}

export interface CartFeatures {
    enableSaveForLater: boolean;
    enableWishlist: boolean;
    enablePromoCodes: boolean;
    enableGiftOptions: boolean;
    enableOrderNotes: boolean;
    enableQuantityLimits: boolean;
    enableRecentlyViewed: boolean;
    enableBulkActions: boolean;
    maxQuantityPerItem: number;
    maxItemsInCart: number;
}

export interface CartAnimations {
    itemAdd: number;
    itemRemove: number;
    quantityUpdate: number;
    drawerSlide: number;
    checkoutTransition: number;
    loadingSpinner: number;
}

export interface CartMessaging {
    drawer: {
        title: string;
        emptyTitle: string;
        emptyDescription: string;
        continueShoppingCTA: string;
        checkoutCTA: string;
        viewCartCTA: string;
    };
    cart: {
        title: string;
        emptyTitle: string;
        emptyDescription: string;
        subtotalLabel: string;
        taxLabel: string;
        shippingLabel: string;
        totalLabel: string;
        promoCodePlaceholder: string;
        checkoutCTA: string;
        continueShoppingCTA: string;
    };
    checkout: {
        stepTitles: {
            shipping: string;
            payment: string;
            review: string;
        };
        shippingForm: {
            title: string;
            subtitle: string;
            guestEmailPlaceholder: string;
            firstNamePlaceholder: string;
            lastNamePlaceholder: string;
            addressPlaceholder: string;
            cityPlaceholder: string;
            statePlaceholder: string;
            zipPlaceholder: string;
            phonePlaceholder: string;
        };
        paymentForm: {
            title: string;
            subtitle: string;
            cardNumberPlaceholder: string;
            expiryPlaceholder: string;
            cvcPlaceholder: string;
        };
        reviewOrder: {
            title: string;
            subtitle: string;
            placeOrderCTA: string;
            backToPaymentCTA: string;
        };
        confirmation: {
            title: string;
            subtitle: string;
            orderNumberLabel: string;
            continueShoppingCTA: string;
            trackOrderCTA: string;
        };
    };
    errors: {
        addToCartFailed: string;
        removeFromCartFailed: string;
        updateQuantityFailed: string;
        loadCartFailed: string;
        checkoutFailed: string;
        paymentFailed: string;
        invalidPromoCode: string;
        exceedsQuantityLimit: string;
        exceedsCartLimit: string;
    };
}

export interface CartConfig {
    drawer: CartDrawerConfig;
    checkout: CheckoutConfig;
    features: CartFeatures;
    animations: CartAnimations;
    messaging: CartMessaging;
    breakpoints: {
        mobile: number;
        tablet: number;
        desktop: number;
    };
    currency: {
        code: string;
        symbol: string;
        decimals: number;
    };
}

export const CART_CONFIG: CartConfig = {
    drawer: {
        position: 'right',
        width: '420px',
        mobileWidth: '100vw',
        mobileFullscreen: true,
        animationDuration: 300,
        backdropBlur: true,
        closeOnBackdropClick: true,
    },

    checkout: {
        steps: ['shipping', 'payment', 'review'],
        enableGuestCheckout: true,
        requirePhoneNumber: false,
        enableAddressSuggestions: true,
        enableExpressCheckout: false, // Future: Apple Pay, Google Pay
        autoCalculateShipping: true,
        autoCalculateTax: true,
        saveUserAddresses: true,
    },

    features: {
        enableSaveForLater: true,
        enableWishlist: true,
        enablePromoCodes: true,
        enableGiftOptions: true,
        enableOrderNotes: true,
        enableQuantityLimits: true,
        enableRecentlyViewed: false, // Future enhancement
        enableBulkActions: false, // Future enhancement
        maxQuantityPerItem: 10,
        maxItemsInCart: 50,
    },

    animations: {
        itemAdd: 400,
        itemRemove: 300,
        quantityUpdate: 200,
        drawerSlide: 300,
        checkoutTransition: 400,
        loadingSpinner: 1000,
    },

    messaging: {
        drawer: {
            title: "Your Collection",
            emptyTitle: "Your vision awaits",
            emptyDescription: "Start building your collection of exceptional pieces",
            continueShoppingCTA: "Continue Creating",
            checkoutCTA: "Complete Your Vision",
            viewCartCTA: "View Full Cart",
        },
        cart: {
            title: "Your Cart",
            emptyTitle: "Your cart is empty",
            emptyDescription: "Discover pieces that embody ambition and artistry",
            subtotalLabel: "Subtotal",
            taxLabel: "Tax",
            shippingLabel: "Shipping",
            totalLabel: "Total",
            promoCodePlaceholder: "Enter promo code",
            checkoutCTA: "Proceed to Checkout",
            continueShoppingCTA: "Continue Shopping",
        },
        checkout: {
            stepTitles: {
                shipping: "Shipping Information",
                payment: "Payment Method",
                review: "Review Your Order",
            },
            shippingForm: {
                title: "Where should we send your pieces?",
                subtitle: "We ship worldwide with premium packaging",
                guestEmailPlaceholder: "Enter your email",
                firstNamePlaceholder: "First name",
                lastNamePlaceholder: "Last name",
                addressPlaceholder: "Street address",
                cityPlaceholder: "City",
                statePlaceholder: "State / Province",
                zipPlaceholder: "ZIP / Postal code",
                phonePlaceholder: "Phone number (optional)",
            },
            paymentForm: {
                title: "Complete your purchase",
                subtitle: "Your payment information is secure and encrypted",
                cardNumberPlaceholder: "Card number",
                expiryPlaceholder: "MM/YY",
                cvcPlaceholder: "CVC",
            },
            reviewOrder: {
                title: "Review your order",
                subtitle: "Confirm your details before completing your purchase",
                placeOrderCTA: "Complete Purchase",
                backToPaymentCTA: "Back to Payment",
            },
            confirmation: {
                title: "Order Confirmed!",
                subtitle: "Thank you for your purchase. Your order is being prepared with the utmost care.",
                orderNumberLabel: "Order Number",
                continueShoppingCTA: "Continue Shopping",
                trackOrderCTA: "Track Your Order",
            },
        },
        errors: {
            addToCartFailed: "Failed to add item to cart. Please try again.",
            removeFromCartFailed: "Failed to remove item from cart. Please try again.",
            updateQuantityFailed: "Failed to update quantity. Please try again.",
            loadCartFailed: "Failed to load cart. Please refresh the page.",
            checkoutFailed: "Checkout failed. Please try again.",
            paymentFailed: "Payment failed. Please check your payment information.",
            invalidPromoCode: "Invalid promo code. Please check and try again.",
            exceedsQuantityLimit: "Maximum quantity per item is",
            exceedsCartLimit: "Maximum number of items in cart is",
        },
    },

    breakpoints: {
        mobile: 768,
        tablet: 1024,
        desktop: 1280,
    },

    currency: {
        code: 'USD',
        symbol: '$',
        decimals: 2,
    },
} as const;

// Helper functions for cart config
export const getCartMessage = (section: keyof CartMessaging, key: string): string => {
    const sectionMessages = CART_CONFIG.messaging[section] as any;
    return sectionMessages[key] || '';
};

export const getCartFeature = (feature: keyof CartFeatures): boolean | number => {
    return CART_CONFIG.features[feature];
};

export const getCartAnimation = (animation: keyof CartAnimations): number => {
    return CART_CONFIG.animations[animation];
};

export const formatCartPrice = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: CART_CONFIG.currency.code,
        minimumFractionDigits: CART_CONFIG.currency.decimals,
        maximumFractionDigits: CART_CONFIG.currency.decimals,
    }).format(amount);
};