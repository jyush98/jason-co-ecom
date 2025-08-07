"use client";
// lib/auth/integration.ts

import { useState, useEffect, useCallback, useMemo } from 'react';
import { currentUser } from '@clerk/nextjs/server';
import type { User as ClerkUser } from '@clerk/nextjs/server';
import { apiClient } from '../api/client';
import { useIntegrationStore } from '../stores/integrationStore';
import { ApiError, ErrorHandler } from '../api/errors';

// Import your domain User type (from apiClient)
type User = {
    id: number;
    clerk_id: string;
    email: string;
    first_name?: string;
    last_name?: string;
}

/**
 * Authentication integration class for managing Clerk <-> Database sync
 */
export class AuthIntegration {
    /**
     * Sync Clerk user with database
     */
    static async syncUserWithDatabase(): Promise<User | null> {
        try {
            const clerkUser = await currentUser();
            if (!clerkUser) {
                console.log('No authenticated Clerk user found');
                return null;
            }

            console.log('Syncing user with database:', clerkUser.id);

            // Check if user already exists in database
            let dbUser = await apiClient.getUser(clerkUser.id);

            if (!dbUser) {
                // Create new user in database
                console.log('Creating new user in database');
                dbUser = await this.createUserFromClerk(clerkUser);
            } else {
                // Update existing user with latest Clerk data if needed
                console.log('Updating existing user');
                dbUser = await this.updateUserFromClerk(dbUser, clerkUser);
            }

            // Update integration store with synced user data
            if (dbUser) {
                const integrationStore = useIntegrationStore.getState();
                integrationStore.setSyncStatus(`user_${clerkUser.id}`, { status: 'success' });
            }

            return dbUser;
        } catch (error) {
            const apiError = ErrorHandler.handleApiErrorSync(error);
            console.error('User sync failed:', apiError);

            // Update integration store with error
            const clerkUser = await currentUser().catch(() => null);
            if (clerkUser) {
                const integrationStore = useIntegrationStore.getState();
                integrationStore.setSyncStatus(`user_${clerkUser.id}`, {
                    status: 'error',
                    error: apiError.message
                });
            }

            return null;
        }
    }

    /**
     * Create new user in database from Clerk data
     */
    private static async createUserFromClerk(clerkUser: ClerkUser): Promise<User | null> {
        try {
            // Create user data object for API call
            const userData = {
                id: clerkUser.id, // Use Clerk ID
                emailAddresses: [{ emailAddress: clerkUser.emailAddresses[0]?.emailAddress || '' }],
                firstName: clerkUser.firstName || '',
                lastName: clerkUser.lastName || '',
                imageUrl: clerkUser.imageUrl,
            };

            // Call API to sync/create user
            const createdUser = await apiClient.syncUserWithClerk(userData);

            console.log('User created successfully:', createdUser?.id);
            return createdUser;
        } catch (error) {
            console.error('Failed to create user:', error);
            return null;
        }
    }

    /**
     * Update existing user with latest Clerk data
     */
    private static async updateUserFromClerk(
        dbUser: User,
        clerkUser: ClerkUser
    ): Promise<User> {
        // Check if any data needs updating
        const needsUpdate =
            dbUser.email !== clerkUser.emailAddresses[0]?.emailAddress ||
            dbUser.first_name !== clerkUser.firstName ||
            dbUser.last_name !== clerkUser.lastName;

        if (!needsUpdate) {
            console.log('User data is up to date');
            return dbUser;
        }

        try {
            // Update user data via API
            const updatedUser = await apiClient.put<User>(`/api/user/${dbUser.id}`, {
                email: clerkUser.emailAddresses[0]?.emailAddress,
                first_name: clerkUser.firstName,
                last_name: clerkUser.lastName,
            });

            console.log('User data updated successfully');
            return updatedUser;
        } catch (error) {
            console.error('Failed to update user:', error);
            return dbUser; // Return original user if update fails
        }
    }

    /**
     * Get comprehensive user context
     */
    static async getUserContext(): Promise<UserContext> {
        try {
            const clerkUser = await currentUser();

            if (!clerkUser) {
                return {
                    clerk_id: null,
                    clerk_user: null,
                    db_user: null,
                    is_authenticated: false,
                    is_admin: false,
                    permissions: [],
                    session_data: null,
                };
            }

            // Get database user
            const dbUser = await apiClient.getUser(clerkUser.id);

            // Check admin status
            const isAdmin = this.isAdminUser(clerkUser, dbUser);

            // Get user permissions
            const permissions = this.getUserPermissions(clerkUser, dbUser);

            // Get session data
            const sessionData = await this.getSessionData(clerkUser.id);

            return {
                clerk_id: clerkUser.id,
                clerk_user: clerkUser,
                db_user: dbUser,
                is_authenticated: true,
                is_admin: isAdmin,
                permissions,
                session_data: sessionData,
            };
        } catch (error) {
            console.error('Error getting user context:', error);
            return {
                clerk_id: null,
                clerk_user: null,
                db_user: null,
                is_authenticated: false,
                is_admin: false,
                permissions: [],
                session_data: null,
            };
        }
    }

    /**
     * Ensure user exists before protected operations
     */
    static async ensureUserExists(): Promise<User | null> {
        try {
            const clerkUser = await currentUser();
            if (!clerkUser) {
                throw new ApiError(401, 'User not authenticated', 'UNAUTHORIZED');
            }

            // Try to get existing user
            let dbUser = await apiClient.getUser(clerkUser.id);

            if (!dbUser) {
                // Create user if doesn't exist
                dbUser = await this.syncUserWithDatabase();
            }

            if (!dbUser) {
                throw new ApiError(500, 'Failed to create user', 'USER_CREATE_FAILED');
            }

            return dbUser;
        } catch (error) {
            console.error('Error ensuring user exists:', error);
            throw error;
        }
    }

    /**
     * Check if user has admin privileges
     */
    private static isAdminUser(clerkUser: ClerkUser, dbUser: User | null): boolean {
        // Check Clerk metadata for admin flag
        const clerkAdmin = clerkUser.publicMetadata?.admin === true ||
            clerkUser.privateMetadata?.admin === true;

        // For now, admin check is only through Clerk metadata
        // You could add more logic here based on your domain User type
        return clerkAdmin;
    }

    /**
     * Get user permissions based on role and metadata
     */
    private static getUserPermissions(clerkUser: ClerkUser, dbUser: User | null): string[] {
        const permissions: string[] = [];

        if (!dbUser) {
            return ['read:public'];
        }

        // Base permissions for authenticated users
        permissions.push('read:profile', 'write:profile', 'read:orders', 'write:orders');

        // Check if admin via Clerk metadata
        if (this.isAdminUser(clerkUser, dbUser)) {
            permissions.push(
                'read:all', 'write:all', 'delete:all',
                'manage:users', 'manage:products', 'manage:orders',
                'access:admin', 'manage:settings'
            );
        } else {
            // Regular customer permissions
            permissions.push('read:products', 'write:cart', 'write:custom_orders');
        }

        return permissions;
    }

    /**
     * Get additional session data
     */
    private static async getSessionData(clerkId: string): Promise<SessionData | null> {
        try {
            // Get session-specific data (cart, preferences, etc.)
            const integrationStore = useIntegrationStore.getState();

            return {
                last_activity: new Date().toISOString(),
                cart_items: integrationStore.cachedCartData?.item_count || 0,
                session_duration: 0, // Would be calculated based on login time
                device_info: this.getDeviceInfo(),
                location_info: null, // Would be populated if location services enabled
            };
        } catch (error) {
            console.error('Error getting session data:', error);
            return null;
        }
    }

    /**
     * Get basic device information
     */
    private static getDeviceInfo(): DeviceInfo {
        if (typeof window === 'undefined') {
            return {
                user_agent: 'server',
                platform: 'server',
                is_mobile: false,
            };
        }

        return {
            user_agent: navigator.userAgent,
            platform: navigator.platform,
            is_mobile: /Mobile|Android|iPhone|iPad/.test(navigator.userAgent),
        };
    }

    /**
     * Handle user sign out
     */
    static async handleSignOut(): Promise<void> {
        try {
            console.log('Handling user sign out');

            // Clear integration store cache
            const integrationStore = useIntegrationStore.getState();
            integrationStore.invalidateCache();
            integrationStore.resetIntegrationState();

            // Clear any pending operations
            integrationStore.pendingOperations.forEach(op => {
                integrationStore.removePendingOperation(op.id);
            });

            console.log('User data cleared on sign out');
        } catch (error) {
            console.error('Error during sign out cleanup:', error);
        }
    }

    /**
     * Handle user sign in
     */
    static async handleSignIn(clerkUser: ClerkUser): Promise<UserContext> {
        try {
            console.log('Handling user sign in:', clerkUser.id);

            // Sync user with database
            await this.syncUserWithDatabase();

            // Get full user context
            const userContext = await this.getUserContext();

            // Initialize background sync for user data
            const integrationStore = useIntegrationStore.getState();
            await integrationStore.syncUserData(clerkUser.id);
            await integrationStore.syncCartData();

            console.log('User sign in completed');
            return userContext;
        } catch (error) {
            console.error('Error during sign in:', error);
            throw error;
        }
    }

    /**
     * Validate user permissions
     */
    static hasPermission(userContext: UserContext, permission: string): boolean {
        return userContext.permissions.includes(permission) ||
            userContext.permissions.includes('read:all') ||
            userContext.permissions.includes('write:all');
    }

    /**
     * Get authentication token for API calls
     */
    static async getAuthToken(): Promise<string | null> {
        try {
            // Note: This should be called from a component context where useAuth is available
            // For server-side, you'd use a different approach
            return null; // Placeholder - implement based on your needs
        } catch (error) {
            console.error('Error getting auth token:', error);
            return null;
        }
    }

    /**
     * Refresh user session and sync data
     */
    static async refreshUserSession(): Promise<UserContext | null> {
        try {
            const clerkUser = await currentUser();
            if (!clerkUser) {
                return null;
            }

            // Re-sync user data
            await this.syncUserWithDatabase();

            // Get updated context
            return await this.getUserContext();
        } catch (error) {
            console.error('Error refreshing user session:', error);
            return null;
        }
    }

    /**
     * Check if user session is valid
     */
    static async isSessionValid(): Promise<boolean> {
        try {
            const clerkUser = await currentUser();
            return !!clerkUser;
        } catch (error) {
            console.error('Error checking session validity:', error);
            return false;
        }
    }

    /**
     * Handle authentication errors
     */
    static handleAuthError(error: ApiError): {
        shouldRedirect: boolean;
        redirectPath?: string;
        message: string;
    } {
        switch (error.code) {
            case 'UNAUTHORIZED':
                return {
                    shouldRedirect: true,
                    redirectPath: '/sign-in',
                    message: 'Please sign in to continue',
                };

            case 'FORBIDDEN':
                return {
                    shouldRedirect: false,
                    message: 'You don\'t have permission to access this resource',
                };

            case 'USER_NOT_FOUND':
                return {
                    shouldRedirect: true,
                    redirectPath: '/sign-up',
                    message: 'Account not found. Please create an account',
                };

            default:
                return {
                    shouldRedirect: false,
                    message: 'Authentication error occurred',
                };
        }
    }
}

// User context interface - now using domain User type
export interface UserContext {
    clerk_id: string | null;
    clerk_user: ClerkUser | null;
    db_user: User | null;  // ✅ Now using domain User type
    is_authenticated: boolean;
    is_admin: boolean;
    permissions: string[];
    session_data: SessionData | null;
}

// Session data interface
export interface SessionData {
    last_activity: string;
    cart_items: number;
    session_duration: number;
    device_info: DeviceInfo;
    location_info: LocationInfo | null;
}

export interface DeviceInfo {
    user_agent: string;
    platform: string;
    is_mobile: boolean;
}

export interface LocationInfo {
    country?: string;
    region?: string;
    city?: string;
    timezone?: string;
}

// React hooks for authentication integration
export const useAuthContext = () => {
    const [userContext, setUserContext] = useState<UserContext | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;

        const loadUserContext = async () => {
            try {
                setIsLoading(true);
                setError(null);

                const context = await AuthIntegration.getUserContext();

                if (mounted) {
                    setUserContext(context);
                }
            } catch (err) {
                if (mounted) {
                    setError(err instanceof Error ? err.message : 'Failed to load user context');
                }
            } finally {
                if (mounted) {
                    setIsLoading(false);
                }
            }
        };

        loadUserContext();

        return () => {
            mounted = false;
        };
    }, []);

    const refreshContext = useCallback(async () => {
        const context = await AuthIntegration.refreshUserSession();
        setUserContext(context);
    }, []);

    return {
        userContext,
        isLoading,
        error,
        refreshContext,
        hasPermission: (permission: string) =>
            userContext ? AuthIntegration.hasPermission(userContext, permission) : false,
    };
};

export const useAuthGuard = (requiredPermission?: string) => {
    const { userContext, isLoading } = useAuthContext();

    const isAuthorized = useMemo(() => {
        if (!userContext?.is_authenticated) return false;
        if (!requiredPermission) return true;
        return AuthIntegration.hasPermission(userContext, requiredPermission);
    }, [userContext, requiredPermission]);

    return {
        isAuthenticated: userContext?.is_authenticated || false,
        isAuthorized,
        isLoading,
        userContext,
    };
};