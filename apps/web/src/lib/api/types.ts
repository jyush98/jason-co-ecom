// lib/api/types.ts

// Core Product interface
export interface Product {
    id: number;
    name: string;
    description?: string;
    price: number;
    image_url?: string;
    category_id?: number;
    category?: string;
    status?: ProductStatus;
    inventory_count?: number;
    sku?: string;
    weight?: number;
    created_at?: string;
    updated_at?: string;
}

// Base API response wrapper
export interface ApiResponse<T> {
    data: T;
    success: boolean;
    message?: string;
    errors?: string[];
    timestamp?: string;
}

// Pagination interfaces
export interface PaginationParams {
    page: number;
    limit: number;
    skip: number;
}

export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    page_size: number;
    total_pages: number;
    has_next: boolean;
    has_previous: boolean;
}

// Filter interfaces
export interface ProductFilters extends Partial<PaginationParams> {
    name?: string;
    category_id?: number;
    price_min?: number;
    price_max?: number;
    search?: string;
    status?: ProductStatus;
    sort_by?: 'price_asc' | 'price_desc' | 'newest' | 'featured' | 'popular';
    sort_order?: 'asc' | 'desc';
    category?: string; // For backward compatibility with your current API
    minPrice?: number; // For backward compatibility
    maxPrice?: number; // For backward compatibility
    pageSize?: number; // For backward compatibility
    sortBy?: string; // For backward compatibility
    sortOrder?: string; // For backward compatibility
}

export interface OrderFilters extends Partial<PaginationParams> {
    user_id?: string;
    status?: OrderStatus;
    date_from?: string;
    date_to?: string;
    order_number?: string;
    payment_status?: PaymentStatus;
}

export interface UserFilters extends Partial<PaginationParams> {
    search?: string;
    status?: UserStatus;
    role?: UserRole;
    created_from?: string;
    created_to?: string;
}

// Product-related types
export enum ProductStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
    OUT_OF_STOCK = 'out_of_stock',
    DISCONTINUED = 'discontinued'
}

export interface ProductListResponse extends PaginatedResponse<Product> {
    categories?: Category[];
    filters_applied: ProductFilters;
    price_range?: {
        min: number;
        max: number;
    };
}

export interface ProductCreateRequest {
    name: string;
    description?: string;
    price: number;
    category_id?: number;
    image_url?: string;
    status?: ProductStatus;
    inventory_count?: number;
    sku?: string;
    weight?: number;
    dimensions?: {
        length: number;
        width: number;
        height: number;
    };
}

export interface ProductUpdateRequest extends Partial<ProductCreateRequest> {
    id: number;
}

// Category types
export interface Category {
    id: number;
    name: string;
    description?: string;
    parent_id?: number;
    image_url?: string;
    sort_order?: number;
    is_active: boolean;
    product_count?: number;
}

// Order-related types
export enum OrderStatus {
    PENDING = 'pending',
    CONFIRMED = 'confirmed',
    PROCESSING = 'processing',
    SHIPPED = 'shipped',
    DELIVERED = 'delivered',
    CANCELLED = 'cancelled',
    REFUNDED = 'refunded'
}

export enum PaymentStatus {
    PENDING = 'pending',
    PAID = 'paid',
    FAILED = 'failed',
    REFUNDED = 'refunded',
    PARTIALLY_REFUNDED = 'partially_refunded'
}

export interface OrderCreateRequest {
    items: OrderItemRequest[];
    shipping_address: ShippingAddress;
    billing_address?: ShippingAddress;
    shipping_method?: string;
    payment_method: string;
    order_notes?: string;
    promo_code?: string;
    is_gift?: boolean;
    gift_message?: string;
}

export interface OrderItemRequest {
    product_id: number;
    quantity: number;
    unit_price?: number; // For custom pricing
    custom_options?: Record<string, any>;
}

export interface OrderResponse {
    id: number;
    order_number: string;
    status: OrderStatus;
    payment_status: PaymentStatus;
    items: OrderItem[];
    shipping_address: ShippingAddress;
    billing_address?: ShippingAddress;
    subtotal: number;
    tax: number;
    shipping_cost: number;
    discount: number;
    total: number;
    created_at: string;
    updated_at: string;
    estimated_delivery?: string;
    tracking_number?: string;
    notes?: string;
}

export interface OrderItem {
    id: number;
    product_id: number;
    product: Product;
    quantity: number;
    unit_price: number;
    total_price: number;
    custom_options?: Record<string, any>;
}

// Address types
export interface ShippingAddress {
    first_name: string;
    last_name: string;
    company?: string;
    address_line_1: string;
    address_line_2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    phone?: string;
}

// User-related types
export enum UserStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
    SUSPENDED = 'suspended'
}

export enum UserRole {
    CUSTOMER = 'customer',
    ADMIN = 'admin',
    STAFF = 'staff'
}

export interface UserResponse {
    id: number;
    clerk_id: string;
    email: string;
    first_name?: string;
    last_name?: string;
    phone?: string;
    status: UserStatus;
    role: UserRole;
    created_at: string;
    updated_at: string;
    last_login?: string;
    email_verified: boolean;
    profile_image_url?: string;
    preferences?: UserPreferences;
    addresses?: ShippingAddress[];
    order_count?: number;
    total_spent?: number;
}

export interface UserPreferences {
    newsletter_subscribed: boolean;
    marketing_emails: boolean;
    order_notifications: boolean;
    preferred_currency: string;
    preferred_language: string;
    timezone?: string;
}

export interface UserCreateRequest {
    clerk_id: string;
    email: string;
    first_name?: string;
    last_name?: string;
    phone?: string;
    role?: UserRole;
    preferences?: Partial<UserPreferences>;
}

export interface UserUpdateRequest extends Partial<UserCreateRequest> {
    id?: number;
    status?: UserStatus;
}

// Cart-related types
export interface CartActionResult {
    success: boolean;
    message?: string;
    cart?: Cart;
    error?: string;
    warnings?: string[];
}

export interface AddToCartRequest {
    product_id: number;
    quantity: number;
    custom_options?: Record<string, any>;
}

export interface UpdateCartItemRequest {
    product_id: number;
    quantity?: number;
    custom_options?: Record<string, any>;
    saved_for_later?: boolean;
}

export interface Cart {
    id?: string;
    user_id?: string;
    items: CartItem[];
    subtotal: number;
    tax: number;
    shipping: number;
    total: number;
    item_count: number;
    promo_code?: string;
    promo_discount?: number;
    currency: string;
    last_updated: string;
    expires_at?: string;
}

export interface CartItem {
    product_id: number;
    quantity: number;
    product: Product;
    unit_price: number;
    total_price: number;
    added_at?: string;
    custom_options?: Record<string, any>;
    saved_for_later?: boolean;
}

// Payment-related types
export interface PaymentIntent {
    id: string;
    amount: number;
    currency: string;
    status: 'requires_payment_method' | 'requires_confirmation' | 'succeeded' | 'cancelled';
    client_secret: string;
    metadata?: Record<string, any>;
}

export interface PaymentMethodRequest {
    type: 'card' | 'paypal' | 'apple_pay' | 'google_pay';
    card_token?: string;
    billing_address?: ShippingAddress;
    save_for_future?: boolean;
}

// Analytics types
export interface AnalyticsMetrics {
    revenue: {
        total: number;
        period_change: number;
        breakdown: Array<{ date: string; amount: number }>;
    };
    orders: {
        total: number;
        period_change: number;
        average_value: number;
        breakdown: Array<{ date: string; count: number }>;
    };
    customers: {
        total: number;
        new_customers: number;
        returning_customers: number;
        period_change: number;
    };
    products: {
        total_sold: number;
        top_products: Array<{ product: Product; quantity_sold: number; revenue: number }>;
    };
}

export interface AnalyticsFilters {
    date_from: string;
    date_to: string;
    period: 'day' | 'week' | 'month' | 'year';
    metrics?: string[];
    segment?: string;
}

// Custom order types (for Jason & Co jewelry)
export interface CustomOrderRequest {
    customer_info: {
        name: string;
        email: string;
        phone?: string;
    };
    project_details: {
        type: 'engagement_ring' | 'wedding_band' | 'necklace' | 'bracelet' | 'earrings' | 'other';
        description: string;
        budget_range: string;
        timeline: string;
        inspiration_images?: string[];
    };
    specifications?: {
        metal_type?: string;
        stone_preferences?: string;
        size_requirements?: string;
        special_requests?: string;
    };
    source?: string; // Where they found us
    urgency?: 'low' | 'medium' | 'high';
}

export interface CustomOrderResponse {
    id: number;
    order_number: string;
    status: 'inquiry' | 'consultation' | 'design' | 'approval' | 'production' | 'completed';
    customer_info: CustomOrderRequest['customer_info'];
    project_details: CustomOrderRequest['project_details'];
    estimated_value?: number;
    timeline_weeks?: number;
    assigned_designer?: string;
    created_at: string;
    updated_at: string;
    consultation_scheduled?: string;
    notes?: string;
}

// Search types
export interface SearchRequest {
    query: string;
    filters?: {
        categories?: number[];
        price_range?: { min: number; max: number };
        availability?: boolean;
    };
    sort?: string;
    limit?: number;
    offset?: number;
}

export interface SearchResponse {
    results: {
        products: Product[];
        categories: Category[];
        total_count: number;
    };
    suggestions?: string[];
    filters_applied: SearchRequest['filters'];
    query: string;
}

// File upload types
export interface FileUploadRequest {
    file: File;
    type: 'product_image' | 'custom_order_inspiration' | 'user_avatar';
    metadata?: Record<string, any>;
}

export interface FileUploadResponse {
    id: string;
    url: string;
    filename: string;
    size: number;
    type: string;
    uploaded_at: string;
}

// Notification types
export interface NotificationRequest {
    type: 'order_update' | 'custom_order_update' | 'promotional' | 'system';
    recipient_id: string;
    title: string;
    message: string;
    action_url?: string;
    metadata?: Record<string, any>;
}

export interface NotificationResponse {
    id: string;
    type: NotificationRequest['type'];
    title: string;
    message: string;
    read: boolean;
    created_at: string;
    action_url?: string;
}

// Inventory types
export interface InventoryItem {
    product_id: number;
    quantity_available: number;
    quantity_reserved: number;
    reorder_level: number;
    last_updated: string;
    location?: string;
}

export interface InventoryUpdateRequest {
    product_id: number;
    quantity_change: number;
    reason: 'sale' | 'restock' | 'adjustment' | 'return' | 'damage';
    notes?: string;
}

// Webhook types
export interface WebhookEvent {
    id: string;
    type: string;
    data: Record<string, any>;
    created_at: string;
    processed: boolean;
}

export interface WebhookSubscription {
    id: string;
    url: string;
    events: string[];
    active: boolean;
    secret?: string;
}

// Type utilities
export type RequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export interface RequestOptions {
    method?: RequestMethod;
    headers?: Record<string, string>;
    timeout?: number;
    retries?: number;
    cache?: boolean;
}

// Error response structure
export interface ErrorResponse {
    error: string;
    message: string;
    code?: string;
    details?: Record<string, any>;
    timestamp: string;
    path?: string;
    status: number;
    validation_errors?: ValidationError[];
}

export interface ValidationError {
    field: string;
    message: string;
    code: string;
    value?: any;
}

// API Health and Status
export interface HealthCheckResponse {
    status: 'healthy' | 'degraded' | 'unhealthy';
    timestamp: string;
    version: string;
    services: {
        database: 'up' | 'down';
        cache: 'up' | 'down';
        payments: 'up' | 'down';
        email: 'up' | 'down';
    };
    response_time_ms: number;
}

// Rate limiting
export interface RateLimitInfo {
    limit: number;
    remaining: number;
    reset_at: string;
    retry_after?: number;
}

// Bulk operations
export interface BulkOperationRequest<T> {
    operations: Array<{
        operation: 'create' | 'update' | 'delete';
        data: T;
        id?: string | number;
    }>;
    batch_size?: number;
    continue_on_error?: boolean;
}

export interface BulkOperationResponse<T> {
    success_count: number;
    error_count: number;
    results: Array<{
        success: boolean;
        data?: T;
        error?: string;
        operation_index: number;
    }>;
    total_processed: number;
    processing_time_ms: number;
}

// Export/Import types
export interface ExportRequest {
    type: 'products' | 'orders' | 'customers';
    format: 'csv' | 'xlsx' | 'json';
    filters?: Record<string, any>;
    fields?: string[];
    date_range?: {
        from: string;
        to: string;
    };
}

export interface ExportResponse {
    id: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    download_url?: string;
    expires_at?: string;
    record_count?: number;
    file_size_bytes?: number;
    created_at: string;
}

// Advanced product types for Jason & Co
export interface JewelryProduct extends Product {
    jewelry_specific: {
        metal_type: 'gold' | 'silver' | 'platinum' | 'titanium' | 'mixed';
        metal_karat?: string;
        stone_types?: string[];
        stone_count?: number;
        total_carat_weight?: number;
        setting_style?: string;
        collection?: string;
        handmade: boolean;
        customizable: boolean;
        gender_target?: 'men' | 'women' | 'unisex';
        occasion_tags?: string[];
        certification?: {
            type: string;
            number: string;
            issued_by: string;
        };
    };
}

// Admin dashboard types
export interface DashboardStats {
    overview: {
        total_revenue: number;
        total_orders: number;
        total_customers: number;
        average_order_value: number;
        revenue_growth: number;
        order_growth: number;
        customer_growth: number;
    };
    recent_activity: {
        recent_orders: OrderResponse[];
        recent_customers: UserResponse[];
        low_inventory: InventoryItem[];
        pending_custom_orders: CustomOrderResponse[];
    };
    performance_metrics: {
        conversion_rate: number;
        cart_abandonment_rate: number;
        customer_lifetime_value: number;
        return_rate: number;
        top_performing_products: Product[];
        sales_by_category: Array<{ category: Category; sales: number }>;
    };
}

// Integration with external services
export interface EmailServiceRequest {
    to: string[];
    template_id: string;
    template_data: Record<string, any>;
    from?: string;
    reply_to?: string;
    tags?: string[];
}

export interface SMSServiceRequest {
    to: string;
    message: string;
    from?: string;
    type: 'transactional' | 'marketing';
}

// Advanced filtering and sorting
export interface AdvancedFilters {
    and?: FilterGroup[];
    or?: FilterGroup[];
    not?: FilterGroup[];
}

export interface FilterGroup {
    field: string;
    operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'nin' | 'contains' | 'starts_with' | 'ends_with';
    value: any;
}

export interface SortOptions {
    field: string;
    direction: 'asc' | 'desc';
    nulls_first?: boolean;
}

// API versioning
export interface ApiVersion {
    version: string;
    deprecated: boolean;
    sunset_date?: string;
    breaking_changes?: string[];
    migration_guide_url?: string;
}

// Audit logging
export interface AuditLog {
    id: string;
    user_id?: string;
    action: string;
    resource_type: string;
    resource_id?: string;
    changes?: {
        before: Record<string, any>;
        after: Record<string, any>;
    };
    ip_address?: string;
    user_agent?: string;
    timestamp: string;
    metadata?: Record<string, any>;
}

// API Key management (for future API access)
export interface ApiKey {
    id: string;
    name: string;
    key_preview: string; // Last 4 characters
    permissions: string[];
    rate_limit?: number;
    created_at: string;
    last_used?: string;
    expires_at?: string;
    active: boolean;
}

// Subscription/webhook retry logic
export interface RetryPolicy {
    max_attempts: number;
    initial_delay_ms: number;
    max_delay_ms: number;
    backoff_multiplier: number;
    retry_conditions: string[];
}

// Type guards for runtime validation
export const isApiError = (error: unknown): error is ErrorResponse => {
    return typeof error === 'object' &&
        error !== null &&
        'error' in error &&
        'message' in error &&
        'status' in error;
};

export const isValidProduct = (product: unknown): product is Product => {
    return typeof product === 'object' &&
        product !== null &&
        'id' in product &&
        'name' in product &&
        'price' in product;
};

export const isValidOrder = (order: unknown): order is OrderResponse => {
    return typeof order === 'object' &&
        order !== null &&
        'id' in order &&
        'status' in order &&
        'total' in order;
};

// Utility types for API responses
export type ApiSuccessResponse<T> = {
    success: true;
    data: T;
    message?: string;
};

export type ApiErrorResponse = {
    success: false;
    error: string;
    message: string;
    details?: any;
};

export type ApiResult<T> = ApiSuccessResponse<T> | ApiErrorResponse;

// Helper type for making certain fields optional
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// Helper type for making certain fields required
export type RequiredBy<T, K extends keyof T> = T & Required<Pick<T, K>>;

// Generic list response type
export type ListResponse<T> = {
    items: T[];
    total: number;
    page: number;
    page_size: number;
    has_next: boolean;
    has_previous: boolean;
};

// Generic ID type that can be string or number
export type ID = string | number;

// Base entity with common fields
export interface BaseEntity {
    id: ID;
    created_at: string;
    updated_at: string;
}