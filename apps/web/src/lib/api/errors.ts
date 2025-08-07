// lib/api/errors.ts

import { ErrorResponse, ValidationError } from './types';

/**
 * Custom API Error class with enhanced error handling
 */
export class ApiError extends Error {
    public readonly name = 'ApiError';
    public readonly timestamp: string;
    public readonly isApiError = true;

    constructor(
        public readonly status: number,
        message: string,
        public readonly code?: string,
        public readonly details?: any,
        public readonly validationErrors?: ValidationError[],
        public readonly path?: string
    ) {
        super(message);
        this.timestamp = new Date().toISOString();

        // Ensure the name of this error is the same as the class name
        Object.setPrototypeOf(this, ApiError.prototype);
    }

    /**
     * Create ApiError from HTTP response (async - parses response body)
     */
    static async fromResponse(response: Response, requestPath?: string): Promise<ApiError> {
        let errorData: Partial<ErrorResponse>;

        try {
            errorData = await response.json();
        } catch {
            // If response body isn't valid JSON, create a generic error
            errorData = {
                error: 'HTTP_ERROR',
                message: response.statusText || 'An unknown error occurred',
                status: response.status,
            };
        }

        return new ApiError(
            response.status,
            errorData.message || `HTTP ${response.status}: ${response.statusText}`,
            errorData.code || this.getDefaultErrorCode(response.status),
            errorData.details,
            errorData.validation_errors,
            errorData.path || requestPath
        );
    }

    /**
     * Create ApiError from HTTP response (sync - no body parsing)
     * Use when you need immediate error creation without async
     */
    static fromResponseSync(
        response: Response,
        requestPath?: string,
        fallbackMessage?: string
    ): ApiError {
        const message = fallbackMessage ||
            response.statusText ||
            `HTTP ${response.status}`;

        return new ApiError(
            response.status,
            message,
            this.getDefaultErrorCode(response.status),
            undefined, // No details since we can't parse the body synchronously
            undefined, // No validation errors
            requestPath
        );
    }

    /**
     * Create ApiError from network/fetch errors
     */
    static fromNetworkError(error: Error, requestPath?: string): ApiError {
        let status = 0;
        let code = 'NETWORK_ERROR';
        let message = 'Network connection failed';

        if (error.name === 'AbortError') {
            status = 408;
            code = 'REQUEST_TIMEOUT';
            message = 'Request timed out';
        } else if (error.message.includes('Failed to fetch')) {
            code = 'CONNECTION_FAILED';
            message = 'Unable to connect to server';
        } else if (error.message.includes('NetworkError')) {
            code = 'NETWORK_ERROR';
            message = 'Network error occurred';
        }

        return new ApiError(
            status,
            message,
            code,
            { originalError: error.message },
            undefined,
            requestPath
        );
    }

    /**
     * Get default error code based on HTTP status
     */
    private static getDefaultErrorCode(status: number): string {
        switch (Math.floor(status / 100)) {
            case 4:
                switch (status) {
                    case 400: return 'BAD_REQUEST';
                    case 401: return 'UNAUTHORIZED';
                    case 403: return 'FORBIDDEN';
                    case 404: return 'NOT_FOUND';
                    case 409: return 'CONFLICT';
                    case 422: return 'VALIDATION_ERROR';
                    case 429: return 'RATE_LIMITED';
                    default: return 'CLIENT_ERROR';
                }
            case 5:
                switch (status) {
                    case 500: return 'INTERNAL_SERVER_ERROR';
                    case 502: return 'BAD_GATEWAY';
                    case 503: return 'SERVICE_UNAVAILABLE';
                    case 504: return 'GATEWAY_TIMEOUT';
                    default: return 'SERVER_ERROR';
                }
            default:
                return 'UNKNOWN_ERROR';
        }
    }

    /**
     * Make getDefaultErrorCode accessible for external use
     */
    public static getErrorCode(status: number): string {
        return this.getDefaultErrorCode(status);
    }

    /**
     * Check if error is retryable
     */
    get isRetryable(): boolean {
        // Network errors are retryable
        if (this.status === 0) return true;

        // Server errors are retryable
        if (this.status >= 500) return true;

        // Timeout errors are retryable
        if (this.status === 408 || this.code === 'REQUEST_TIMEOUT') return true;

        // Rate limit errors are retryable (after delay)
        if (this.status === 429) return true;

        return false;
    }

    /**
     * Get user-friendly error message
     */
    get userMessage(): string {
        switch (this.code) {
            case 'NETWORK_ERROR':
            case 'CONNECTION_FAILED':
                return 'Unable to connect. Please check your internet connection and try again.';
            case 'REQUEST_TIMEOUT':
                return 'Request timed out. Please try again.';
            case 'UNAUTHORIZED':
                return 'Please sign in to continue.';
            case 'FORBIDDEN':
                return 'You don\'t have permission to perform this action.';
            case 'NOT_FOUND':
                return 'The requested resource was not found.';
            case 'VALIDATION_ERROR':
                return this.getValidationMessage();
            case 'RATE_LIMITED':
                return 'Too many requests. Please wait a moment and try again.';
            case 'SERVICE_UNAVAILABLE':
                return 'Service is temporarily unavailable. Please try again later.';
            case 'INTERNAL_SERVER_ERROR':
                return 'Something went wrong on our end. Please try again.';
            default:
                return this.message || 'An unexpected error occurred.';
        }
    }

    /**
     * Get formatted validation error message
     */
    private getValidationMessage(): string {
        if (!this.validationErrors || this.validationErrors.length === 0) {
            return 'Please check your input and try again.';
        }

        if (this.validationErrors.length === 1) {
            return this.validationErrors[0].message;
        }

        const fieldNames = this.validationErrors.map(error => error.field);
        return `Please check the following fields: ${fieldNames.join(', ')}`;
    }

    /**
     * Serialize error for logging
     */
    toJSON() {
        return {
            name: this.name,
            message: this.message,
            status: this.status,
            code: this.code,
            details: this.details,
            validationErrors: this.validationErrors,
            path: this.path,
            timestamp: this.timestamp,
            stack: this.stack,
        };
    }
}

/**
 * Specialized error classes
 */
export class ValidationApiError extends ApiError {
    constructor(
        message: string,
        validationErrors: ValidationError[],
        details?: any
    ) {
        super(422, message, 'VALIDATION_ERROR', details, validationErrors);
    }

    /**
     * Get errors for a specific field
     */
    getFieldErrors(field: string): ValidationError[] {
        return this.validationErrors?.filter(error => error.field === field) || [];
    }

    /**
     * Check if a field has errors
     */
    hasFieldError(field: string): boolean {
        return this.getFieldErrors(field).length > 0;
    }

    /**
     * Get first error message for a field
     */
    getFieldErrorMessage(field: string): string | null {
        const fieldErrors = this.getFieldErrors(field);
        return fieldErrors.length > 0 ? fieldErrors[0].message : null;
    }
}

export class AuthenticationError extends ApiError {
    constructor(message: string = 'Authentication required') {
        super(401, message, 'UNAUTHORIZED');
    }
}

export class AuthorizationError extends ApiError {
    constructor(message: string = 'Access denied') {
        super(403, message, 'FORBIDDEN');
    }
}

export class NotFoundError extends ApiError {
    constructor(resource: string = 'Resource') {
        super(404, `${resource} not found`, 'NOT_FOUND');
    }
}

export class ConflictError extends ApiError {
    constructor(message: string = 'Resource conflict') {
        super(409, message, 'CONFLICT');
    }
}

export class RateLimitError extends ApiError {
    constructor(
        message: string = 'Rate limit exceeded',
        public readonly retryAfter?: number
    ) {
        super(429, message, 'RATE_LIMITED', { retryAfter });
    }
}

export class ServerError extends ApiError {
    constructor(message: string = 'Internal server error') {
        super(500, message, 'INTERNAL_SERVER_ERROR');
    }
}

/**
 * Error handler utility functions
 */
export class ErrorHandler {
    /**
     * Handle and classify errors from API calls (synchronous)
     * Use when you need immediate error handling without async complexity
     * Note: Response body won't be parsed, so less detailed error info
     */
    static handleApiErrorSync(error: unknown, requestPath?: string): ApiError {
        // Already an ApiError
        if (error instanceof ApiError) {
            return error;
        }

        // Handle Response objects (from fetch) - sync version without body parsing
        if (error instanceof Response) {
            return ApiError.fromResponseSync(error, requestPath);
        }

        // Handle network/fetch errors
        if (error instanceof Error) {
            return ApiError.fromNetworkError(error, requestPath);
        }

        // Handle unknown errors
        return new ApiError(
            500,
            'An unexpected error occurred',
            'UNKNOWN_ERROR',
            { originalError: error },
            undefined,
            requestPath
        );
    }

    /**
     * Handle and classify errors from API calls (asynchronous)
     * Use when you can await and want full error details including response body parsing
     */
    static async handleApiErrorAsync(error: unknown, requestPath?: string): Promise<ApiError> {
        // Already an ApiError
        if (error instanceof ApiError) {
            return error;
        }

        // Handle Response objects (from fetch) - async version with body parsing
        if (error instanceof Response) {
            return await ApiError.fromResponse(error, requestPath);
        }

        // Handle network/fetch errors
        if (error instanceof Error) {
            return ApiError.fromNetworkError(error, requestPath);
        }

        // Handle unknown errors
        return new ApiError(
            500,
            'An unexpected error occurred',
            'UNKNOWN_ERROR',
            { originalError: error },
            undefined,
            requestPath
        );
    }

    /**
     * Legacy method for backward compatibility
     * @deprecated Use handleApiErrorSync or handleApiErrorAsync instead
     */
    static handleApiError(error: unknown, requestPath?: string): ApiError {
        console.warn('ErrorHandler.handleApiError is deprecated. Use handleApiErrorSync or handleApiErrorAsync instead.');
        return this.handleApiErrorSync(error, requestPath);
    }

    /**
     * Log error with appropriate level based on severity
     */
    static logError(error: ApiError, context?: Record<string, any>): void {
        const logData = {
            ...error.toJSON(),
            context,
        };

        // Use different log levels based on error type
        if (error.status >= 500) {
            console.error('Server Error:', logData);
        } else if (error.status === 0) {
            console.warn('Network Error:', logData);
        } else if (error.status >= 400) {
            console.info('Client Error:', logData);
        } else {
            console.debug('API Error:', logData);
        }
    }

    /**
     * Check if error should be reported to error tracking service
     */
    static shouldReport(error: ApiError): boolean {
        // Don't report client errors (4xx) except authentication issues
        if (error.status >= 400 && error.status < 500) {
            return error.status === 401 || error.status === 403;
        }

        // Report all server errors and network errors
        return error.status >= 500 || error.status === 0;
    }

    /**
     * Create user-friendly error notification
     */
    static createErrorNotification(error: ApiError): {
        title: string;
        message: string;
        type: 'error' | 'warning' | 'info';
    } {
        let type: 'error' | 'warning' | 'info' = 'error';
        let title = 'Error';

        switch (error.code) {
            case 'NETWORK_ERROR':
            case 'CONNECTION_FAILED':
                title = 'Connection Error';
                type = 'warning';
                break;
            case 'REQUEST_TIMEOUT':
                title = 'Request Timeout';
                type = 'warning';
                break;
            case 'UNAUTHORIZED':
                title = 'Authentication Required';
                type = 'info';
                break;
            case 'FORBIDDEN':
                title = 'Access Denied';
                break;
            case 'NOT_FOUND':
                title = 'Not Found';
                break;
            case 'VALIDATION_ERROR':
                title = 'Validation Error';
                type = 'warning';
                break;
            case 'RATE_LIMITED':
                title = 'Rate Limited';
                type = 'warning';
                break;
            case 'SERVICE_UNAVAILABLE':
                title = 'Service Unavailable';
                type = 'warning';
                break;
            default:
                title = 'Error';
                break;
        }

        return {
            title,
            message: error.userMessage,
            type,
        };
    }
}

/**
 * Type guards for error checking
 */
export const isApiError = (error: unknown): error is ApiError => {
    return error instanceof ApiError || (
        typeof error === 'object' &&
        error !== null &&
        'isApiError' in error &&
        (error as any).isApiError === true
    );
};

export const isValidationError = (error: unknown): error is ValidationApiError => {
    return error instanceof ValidationApiError || (
        isApiError(error) &&
        error.code === 'VALIDATION_ERROR' &&
        Array.isArray(error.validationErrors)
    );
};

export const isNetworkError = (error: unknown): error is ApiError => {
    return isApiError(error) && (
        error.status === 0 ||
        error.code === 'NETWORK_ERROR' ||
        error.code === 'CONNECTION_FAILED' ||
        error.code === 'REQUEST_TIMEOUT'
    );
};

export const isServerError = (error: unknown): error is ApiError => {
    return isApiError(error) && error.status >= 500;
};

export const isRetryableError = (error: unknown): boolean => {
    return isApiError(error) && error.isRetryable;
};

/**
 * Error recovery strategies
 */
export class ErrorRecovery {
    /**
     * Get recommended retry delay for an error
     */
    static getRetryDelay(error: ApiError, attemptNumber: number): number {
        // Rate limit errors should respect retry-after header
        if (error instanceof RateLimitError && error.retryAfter) {
            return error.retryAfter * 1000; // Convert to milliseconds
        }

        // Exponential backoff for retryable errors
        if (error.isRetryable) {
            return Math.min(1000 * Math.pow(2, attemptNumber), 30000); // Max 30 seconds
        }

        return 0; // No retry recommended
    }

    /**
     * Create recovery action suggestions
     */
    static getRecoveryActions(error: ApiError): Array<{
        label: string;
        action: string;
        primary?: boolean;
    }> {
        const actions: Array<{
            label: string;
            action: string;
            primary?: boolean;
        }> = [];

        switch (error.code) {
            case 'NETWORK_ERROR':
            case 'CONNECTION_FAILED':
                actions.push(
                    { label: 'Try Again', action: 'retry', primary: true },
                    { label: 'Check Connection', action: 'check_network' }
                );
                break;

            case 'UNAUTHORIZED':
                actions.push(
                    { label: 'Sign In', action: 'sign_in', primary: true },
                    { label: 'Refresh Page', action: 'refresh' }
                );
                break;

            case 'RATE_LIMITED':
                actions.push(
                    { label: 'Wait and Retry', action: 'wait_retry', primary: true }
                );
                break;

            case 'SERVICE_UNAVAILABLE':
                actions.push(
                    { label: 'Try Again Later', action: 'retry_later', primary: true },
                    { label: 'Check Status Page', action: 'status_page' }
                );
                break;

            default:
                if (error.isRetryable) {
                    actions.push(
                        { label: 'Try Again', action: 'retry', primary: true }
                    );
                }
                break;
        }

        // Always offer contact support for non-trivial errors
        if (error.status >= 500 || !actions.length) {
            actions.push(
                { label: 'Contact Support', action: 'contact_support' }
            );
        }

        return actions;
    }
}