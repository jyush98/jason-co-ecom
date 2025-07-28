"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAuth, useClerk } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
    Loader2,
    CheckCircle,
    XCircle,
    ArrowRight,
    AlertTriangle,
    RefreshCw
} from "lucide-react";
import AuthLayout from "./AuthLayout";

export default function SSOCallback() {
    const { isLoaded, isSignedIn } = useAuth();
    const { handleRedirectCallback } = useClerk();
    const router = useRouter();
    const searchParams = useSearchParams();

    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [error, setError] = useState<string>('');
    const [retryCount, setRetryCount] = useState(0);

    // Get redirect URL from query params or default
    const redirectUrl = searchParams?.get('redirect_url') || '/account';
    const welcomeParam = searchParams?.get('welcome') === 'true' ? '?welcome=true' : '';

    useEffect(() => {
        if (!isLoaded) return;

        const handleOAuthCallback = async () => {
            try {
                setStatus('loading');
                setError('');

                // Handle the OAuth callback
                await handleRedirectCallback({
                    // Redirect to account page after successful auth
                    redirectUrl: `${redirectUrl}${welcomeParam}`,
                });

                // If we get here, the callback was successful
                setStatus('success');

                // Small delay to show success state, then redirect
                setTimeout(() => {
                    router.push(`${redirectUrl}${welcomeParam}`);
                }, 1500);

            } catch (err: any) {
                console.error('OAuth callback error:', err);

                // Handle different error types
                let errorMessage = 'Authentication failed. Please try again.';

                if (err.errors) {
                    const firstError = err.errors[0];
                    switch (firstError?.code) {
                        case 'oauth_access_denied':
                            errorMessage = 'Access was denied. Please try signing in again.';
                            break;
                        case 'oauth_callback_invalid':
                            errorMessage = 'Invalid authentication response. Please try again.';
                            break;
                        case 'session_exists':
                            // User is already signed in, redirect them
                            router.push(`${redirectUrl}${welcomeParam}`);
                            return;
                        default:
                            errorMessage = firstError?.longMessage || firstError?.message || errorMessage;
                    }
                }

                setError(errorMessage);
                setStatus('error');
            }
        };

        // Check if user is already signed in
        if (isSignedIn) {
            setStatus('success');
            setTimeout(() => {
                router.push(`${redirectUrl}${welcomeParam}`);
            }, 1000);
            return;
        }

        // Handle the OAuth callback
        handleOAuthCallback();
    }, [isLoaded, isSignedIn, handleRedirectCallback, router, redirectUrl, welcomeParam]);

    // Retry authentication
    const handleRetry = () => {
        setRetryCount(prev => prev + 1);
        setStatus('loading');
        setError('');

        // Redirect back to sign-in page
        router.push('/sign-in');
    };

    // Manual redirect to account
    const handleContinue = () => {
        router.push(`${redirectUrl}${welcomeParam}`);
    };

    const containerVariants = {
        hidden: { opacity: 0, scale: 0.95 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: {
                duration: 0.5,
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <AuthLayout
            title="Signing you in..."
            subtitle="Please wait while we complete your authentication."
            showBackButton={false}
        >
            <motion.div
                className="text-center space-y-6"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* Loading State */}
                {status === 'loading' && (
                    <motion.div className="space-y-6" variants={itemVariants}>
                        {/* Loading Spinner */}
                        <div className="mx-auto w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center">
                            <Loader2 size={32} className="text-gold animate-spin" />
                        </div>

                        {/* Loading Messages */}
                        <div className="space-y-2">
                            <h3 className="text-lg font-medium text-black dark:text-white">
                                Completing your sign-in...
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                We're securely processing your authentication. This should only take a moment.
                            </p>
                        </div>

                        {/* Progress Indicator */}
                        <div className="max-w-xs mx-auto">
                            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-gold rounded-full"
                                    initial={{ width: 0 }}
                                    animate={{ width: "100%" }}
                                    transition={{ duration: 3, ease: "easeInOut" }}
                                />
                            </div>
                        </div>

                        {/* Retry indicator if taking too long */}
                        {retryCount > 0 && (
                            <motion.p
                                className="text-sm text-gray-500"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 2 }}
                            >
                                Attempt {retryCount + 1}...
                            </motion.p>
                        )}
                    </motion.div>
                )}

                {/* Success State */}
                {status === 'success' && (
                    <motion.div className="space-y-6" variants={itemVariants}>
                        {/* Success Icon */}
                        <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                            <CheckCircle size={32} className="text-green-600 dark:text-green-400" />
                        </div>

                        {/* Success Messages */}
                        <div className="space-y-2">
                            <h3 className="text-lg font-medium text-black dark:text-white">
                                Welcome to Jason & Co.!
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                You've been successfully signed in. Redirecting you to your account...
                            </p>
                        </div>

                        {/* Manual Continue Button */}
                        <button
                            onClick={handleContinue}
                            className="inline-flex items-center gap-2 text-gold hover:text-gold/80 font-medium transition-colors"
                        >
                            Continue to Account
                            <ArrowRight size={16} />
                        </button>
                    </motion.div>
                )}

                {/* Error State */}
                {status === 'error' && (
                    <motion.div className="space-y-6" variants={itemVariants}>
                        {/* Error Icon */}
                        <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                            <XCircle size={32} className="text-red-600 dark:text-red-400" />
                        </div>

                        {/* Error Messages */}
                        <div className="space-y-2">
                            <h3 className="text-lg font-medium text-black dark:text-white">
                                Authentication Failed
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                {error || 'We encountered an issue while signing you in. Please try again.'}
                            </p>
                        </div>

                        {/* Error Actions */}
                        <div className="space-y-3">
                            <button
                                onClick={handleRetry}
                                className="w-full bg-gold hover:bg-gold/90 text-black font-medium py-3 px-6 rounded-lg transition-all duration-300 hover:scale-[1.02] flex items-center justify-center gap-2"
                            >
                                <RefreshCw size={18} />
                                Try Again
                            </button>

                            <Link
                                href="/sign-in"
                                className="block w-full text-center py-3 px-6 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                            >
                                Back to Sign In
                            </Link>
                        </div>

                        {/* Help Text */}
                        <div className="text-center">
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Still having trouble?{" "}
                                <Link href="/contact" className="text-gold hover:text-gold/80 font-medium">
                                    Contact Support
                                </Link>
                            </p>
                        </div>
                    </motion.div>
                )}

                {/* Security Notice */}
                <motion.div
                    className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg"
                    variants={itemVariants}
                >
                    <div className="flex items-start gap-3">
                        <AlertTriangle size={20} className="text-blue-600 mt-0.5 flex-shrink-0" />
                        <div className="text-left">
                            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                                Secure Authentication
                            </h4>
                            <p className="text-sm text-blue-700 dark:text-blue-300">
                                Your authentication is protected with industry-standard security measures.
                                We never store your social media passwords.
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Debug Info (Development Only) */}
                {process.env.NODE_ENV === 'development' && (
                    <motion.div
                        className="mt-4 p-3 bg-gray-100 dark:bg-gray-800 rounded text-xs text-left"
                        variants={itemVariants}
                    >
                        <strong>Debug Info (Dev Only):</strong>
                        <br />
                        Status: {status}
                        <br />
                        Signed In: {isSignedIn ? 'Yes' : 'No'}
                        <br />
                        Redirect URL: {redirectUrl}
                        <br />
                        Retry Count: {retryCount}
                        {error && (
                            <>
                                <br />
                                Error: {error}
                            </>
                        )}
                    </motion.div>
                )}
            </motion.div>
        </AuthLayout>
    );
}