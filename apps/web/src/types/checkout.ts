// types/checkout.ts

import { Order, OrderItem, OrderStatus } from './order'; // Your existing types
import { ShippingAddress, ShippingMethod, PaymentMethod, CheckoutFormData } from './cart';

// Checkout flow state management
export interface CheckoutFlow {
  steps: CheckoutStepConfig[];
  current_step_index: number;
  total_steps: number;
  can_go_back: boolean;
  can_go_forward: boolean;
  is_complete: boolean;
}

export interface CheckoutStepConfig {
  id: CheckoutStepId;
  title: string;
  subtitle?: string;
  is_required: boolean;
  validation_schema?: any; // For form validation
  component: string; // Component name to render
}

export type CheckoutStepId = 'shipping' | 'payment' | 'review' | 'confirmation';

// Form validation types
export interface FormValidationError {
  field: string;
  message: string;
  type: 'required' | 'invalid' | 'min_length' | 'max_length' | 'pattern';
}

export interface FormValidationResult {
  is_valid: boolean;
  errors: FormValidationError[];
  warnings?: string[];
}

// Shipping calculation
export interface ShippingCalculationRequest {
  destination: Pick<ShippingAddress, 'city' | 'state' | 'postal_code' | 'country'>;
  items: Array<{
    product_id: number;
    quantity: number;
    weight?: number;
    dimensions?: {
      length: number;
      width: number;
      height: number;
    };
  }>;
  subtotal: number;
}

export interface ShippingCalculationResponse {
  success: boolean;
  methods: ShippingMethod[];
  errors?: string[];
  warnings?: string[];
}

// Tax calculation
export interface TaxCalculationRequest {
  destination: Pick<ShippingAddress, 'city' | 'state' | 'postal_code' | 'country'>;
  subtotal: number;
  shipping_cost: number;
  items: Array<{
    product_id: number;
    quantity: number;
    unit_price: number;
    tax_category?: string;
  }>;
}

export interface TaxCalculationResponse {
  success: boolean;
  tax_amount: number;
  tax_rate: number;
  tax_breakdown?: Array<{
    type: string;
    rate: number;
    amount: number;
    description: string;
  }>;
  errors?: string[];
}

// Payment processing
export interface PaymentIntent {
  id: string;
  client_secret: string;
  amount: number;
  currency: string;
  status: 'requires_payment_method' | 'requires_confirmation' | 'requires_action' | 'processing' | 'succeeded' | 'canceled';
  metadata?: Record<string, string>;
}

export interface PaymentProcessingResult {
  success: boolean;
  payment_intent?: PaymentIntent;
  order_id?: number;
  order_number?: string;
  redirect_url?: string;
  error?: string;
  requires_action?: boolean;
}

// Order creation
export interface CreateOrderRequest {
  checkout_data: CheckoutFormData;
  cart_items: Array<{
    product_id: number;
    quantity: number;
    unit_price: number;
    custom_options?: Record<string, string>;
  }>;
  payment_intent_id?: string;
  subtotal: number;
  tax_amount: number;
  shipping_cost: number;
  promo_discount?: number;
  total_amount: number;
  currency: string;
  guest_email?: string;
  utm_data?: {
    source?: string;
    medium?: string;
    campaign?: string;
    content?: string;
  };
}

export interface CreateOrderResponse {
  success: boolean;
  order?: Order;
  order_number?: string;
  payment_required?: boolean;
  payment_url?: string;
  confirmation_url?: string;
  errors?: string[];
}

// Address validation and autocomplete
export interface AddressValidationRequest {
  address: Partial<ShippingAddress>;
  validate_existence?: boolean;
  suggest_corrections?: boolean;
}

export interface AddressValidationResponse {
  is_valid: boolean;
  normalized_address?: ShippingAddress;
  suggestions?: ShippingAddress[];
  errors?: string[];
  warnings?: string[];
}

export interface AddressSuggestion {
  formatted_address: string;
  components: {
    street_number?: string;
    route?: string;
    locality: string;
    administrative_area_level_1: string;
    postal_code: string;
    country: string;
  };
  place_id?: string;
}

// Checkout analytics and tracking
export interface CheckoutAnalytics {
  session_id: string;
  started_at: string;
  current_step: CheckoutStepId;
  step_completion_times: Record<CheckoutStepId, number>;
  abandonment_point?: CheckoutStepId;
  payment_method_selected?: string;
  shipping_method_selected?: string;
  promo_codes_attempted?: string[];
  errors_encountered?: Array<{
    step: CheckoutStepId;
    error: string;
    timestamp: string;
  }>;
  device_info?: {
    type: 'mobile' | 'tablet' | 'desktop';
    browser: string;
    os: string;
  };
}

// Guest checkout session
export interface GuestCheckoutSession {
  session_id: string;
  email: string;
  created_at: string;
  expires_at: string;
  checkout_data?: Partial<CheckoutFormData>;
  order_id?: number;
}

// Checkout preferences and saved data
export interface CheckoutPreferences {
  user_id?: string;
  saved_addresses: ShippingAddress[];
  saved_payment_methods: PaymentMethod[];
  default_shipping_address_id?: string;
  default_payment_method_id?: string;
  marketing_consent: boolean;
  newsletter_subscription: boolean;
  sms_notifications: boolean;
}

// Express checkout (Apple Pay, Google Pay)
export interface ExpressCheckoutData {
  payment_method: 'apple_pay' | 'google_pay' | 'shop_pay';
  shipping_address: ShippingAddress;
  billing_address?: ShippingAddress;
  contact_info: {
    email: string;
    phone?: string;
  };
  shipping_method?: ShippingMethod;
}

// Checkout errors and recovery
export interface CheckoutError {
  code: string;
  message: string;
  step: CheckoutStepId;
  field?: string;
  recoverable: boolean;
  suggested_action?: string;
  retry_count?: number;
}

export interface CheckoutRecovery {
  session_id: string;
  last_successful_step: CheckoutStepId;
  saved_data: Partial<CheckoutFormData>;
  timestamp: string;
  recovery_url: string;
}

// Checkout completion
export interface CheckoutCompletion {
  order: Order;
  order_number: string;
  confirmation_email_sent: boolean;
  estimated_delivery?: {
    min_days: number;
    max_days: number;
    date_range: string;
  };
  tracking_info?: {
    tracking_number?: string;
    carrier?: string;
    tracking_url?: string;
  };
  next_steps: Array<{
    action: string;
    description: string;
    url?: string;
  }>;
}

// Component prop types for checkout
export interface CheckoutFlowProps {
  initial_step?: CheckoutStepId;
  guest_email?: string;
  on_completion: (completion: CheckoutCompletion) => void;
  on_error: (error: CheckoutError) => void;
  on_step_change?: (step: CheckoutStepId) => void;
}

export interface ShippingFormProps {
  initial_data?: Partial<ShippingAddress>;
  is_guest: boolean;
  on_submit: (address: ShippingAddress, shipping_method?: ShippingMethod) => void;
  on_back?: () => void;
  is_loading?: boolean;
  validation_errors?: FormValidationError[];
}

export interface PaymentFormProps {
  order_total: number;
  shipping_address: ShippingAddress;
  shipping_method: ShippingMethod;
  on_submit: (payment_data: any) => void;
  on_back: () => void;
  is_loading?: boolean;
  client_secret?: string;
}

export interface OrderReviewProps {
  checkout_data: CheckoutFormData;
  order_preview: any; // Order preview data
  on_confirm: () => void;
  on_back: () => void;
  is_loading?: boolean;
}

export interface OrderConfirmationProps {
  completion: CheckoutCompletion;
  on_continue_shopping: () => void;
  on_track_order?: () => void;
}

// Utility types
export type CheckoutFormField = keyof CheckoutFormData;
export type CheckoutStepIndex = 0 | 1 | 2 | 3;

// Type guards for checkout
export const isValidCheckoutStep = (step: string): step is CheckoutStepId => {
  return ['shipping', 'payment', 'review', 'confirmation'].includes(step);
};

export const isCheckoutComplete = (step: CheckoutStepId): boolean => {
  return step === 'confirmation';
};

export const canGoBackFromStep = (step: CheckoutStepId): boolean => {
  return step !== 'shipping' && step !== 'confirmation';
};

// Checkout step ordering and navigation
export const CHECKOUT_STEP_ORDER: CheckoutStepId[] = ['shipping', 'payment', 'review', 'confirmation'];

export const getNextStep = (current: CheckoutStepId): CheckoutStepId | null => {
  const currentIndex = CHECKOUT_STEP_ORDER.indexOf(current);
  return currentIndex < CHECKOUT_STEP_ORDER.length - 1 
    ? CHECKOUT_STEP_ORDER[currentIndex + 1] 
    : null;
};

export const getPreviousStep = (current: CheckoutStepId): CheckoutStepId | null => {
  const currentIndex = CHECKOUT_STEP_ORDER.indexOf(current);
  return currentIndex > 0 
    ? CHECKOUT_STEP_ORDER[currentIndex - 1] 
    : null;
};

export const getStepProgress = (current: CheckoutStepId): number => {
  const currentIndex = CHECKOUT_STEP_ORDER.indexOf(current);
  return ((currentIndex + 1) / CHECKOUT_STEP_ORDER.length) * 100;
};