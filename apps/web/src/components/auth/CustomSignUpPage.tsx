"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import {
    Mail,
    Lock,
    User,
    Eye,
    EyeOff,
    Loader2,
    AlertCircle,
    Check,
    Shield
} from "lucide-react";
import Link from "next/link";

interface CustomSignUpPageProps {
    className?: string;
}

export default function CustomSignUpPage({ className = "" }: CustomSignUpPageProps) {
    const { signUp, setActive, isLoaded } = useSignUp();
    const router = useRouter();

    // Dev mode detection
    const isDev = process.env.NODE_ENV === 'development';

    // Form state
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        emailAddress: "",
        password: "",
        confirmPassword: ""
    });

    // UI state
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [currentStep, setCurrentStep] = useState<'signup' | 'verification'>('signup');
    const [verificationCode, setVerificationCode] = useState("");
    const [acceptedTerms, setAcceptedTerms] = useState(false);

    // CAPTCHA element ref
    const captchaRef = useRef<HTMLDivElement>(null);

    // Clear errors when user types
    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: "" }));
        }
    };

    // Dev helper function to populate test data
    const fillTestData = () => {
        const testNumber = Math.floor(Math.random() * 1000);
        setFormData({
            firstName: "Alan",
            lastName: "Turing",
            emailAddress: `jonathan@jasonjewels${testNumber}.com`,
            password: "ThisIsATestPassword123!",
            confirmPassword: "ThisIsATestPassword123!",
        });
        setAcceptedTerms(true);
        setErrors({});
    };

    // Validate form before submission
    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.firstName.trim()) {
            newErrors.firstName = "First name is required";
        }

        if (!formData.lastName.trim()) {
            newErrors.lastName = "Last name is required";
        }

        if (!formData.emailAddress.trim()) {
            newErrors.emailAddress = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.emailAddress)) {
            newErrors.emailAddress = "Please enter a valid email address";
        }

        if (!formData.password) {
            newErrors.password = "Password is required";
        } else if (formData.password.length < 8) {
            newErrors.password = "Password must be at least 8 characters";
        }

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match";
        }

        if (!acceptedTerms) {
            newErrors.terms = "You must accept the terms and conditions";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isLoaded || !signUp) return;
        if (!validateForm()) return;

        setIsSubmitting(true);
        setErrors({});

        try {
            console.log('🚨 NEW CODE IS RUNNING - ULTRA MINIMAL TEST 🚨');
            console.log('🔍 DEBUG: Attempting sign-up with minimal data only...');
            console.log('📧 Email:', formData.emailAddress);
            console.log('🔐 Password length:', formData.password.length);

            // Add timeout protection
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Sign-up timeout after 30 seconds')), 30000);
            });

            // ULTRA-MINIMAL TEST: Only email and password (NO NAMES!)
            console.log('🔄 Calling signUp.create...');
            const response = await Promise.race([
                signUp.create({
                    emailAddress: formData.emailAddress,
                    password: formData.password,
                }),
                timeoutPromise
            ]) as any;

            console.log('✅ Sign-up creation successful:', response);
            console.log('🔄 Response status:', response?.status);
            console.log('🔄 Response verification:', response?.verifications);

            // Step 2: Prepare email verification
            console.log('🔄 Preparing email verification...');
            const verificationResult = await Promise.race([
                signUp.prepareEmailAddressVerification({
                    strategy: "email_code"
                }),
                timeoutPromise
            ]) as any;

            console.log('✅ Email verification prepared:', verificationResult);
            console.log('🎯 Moving to verification step...');
            setCurrentStep('verification');

        } catch (error: any) {
            console.error("❌ Sign-up error:", error);
            console.error("❌ Error details:", JSON.stringify(error, null, 2));

            // Handle specific Clerk errors
            if (error.errors) {
                const newErrors: Record<string, string> = {};
                error.errors.forEach((err: any) => {
                    if (err.meta?.paramName) {
                        newErrors[err.meta.paramName] = err.longMessage || err.message;
                    } else {
                        newErrors.general = err.longMessage || err.message;
                    }
                });
                setErrors(newErrors);
            } else {
                setErrors({
                    general: error.message || "Failed to create account. Please try again."
                });
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle email verification
    const handleVerification = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isLoaded || !signUp) return;

        setIsSubmitting(true);
        setErrors({});

        try {
            // Complete the sign-up process
            const completeSignUp = await signUp.attemptEmailAddressVerification({
                code: verificationCode,
            });

            if (completeSignUp.status === "complete") {
                console.log('✅ Email verification successful');
                
                // NOW try to update with names after verification
                try {
                    console.log('🔄 Updating user with names...');
                    await signUp.update({
                        firstName: formData.firstName,
                        lastName: formData.lastName,
                    });
                    console.log('✅ Names updated successfully');
                } catch (nameError) {
                    console.warn('⚠️ Name update failed, but continuing:', nameError);
                    // Don't block the flow - webhook can handle names
                }

                await setActive({ session: completeSignUp.createdSessionId });
                router.push("/account?welcome=true");
            } else {
                setErrors({
                    verification: "Verification incomplete. Please try again."
                });
            }
        } catch (error: any) {
            console.error("Verification error:", error);

            if (error.errors) {
                const newErrors: Record<string, string> = {};
                error.errors.forEach((err: any) => {
                    newErrors.verification = err.longMessage || err.message;
                });
                setErrors(newErrors);
            } else {
                setErrors({
                    verification: "Invalid verification code. Please try again."
                });
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle OAuth sign-up
    const handleOAuthSignUp = async (provider: 'oauth_google') => {
        if (!signUp) return;

        try {
            await signUp.authenticateWithRedirect({
                strategy: provider,
                redirectUrl: "/sso-callback",
                redirectUrlComplete: "/account?welcome=true",
            });
        } catch (error) {
            console.error("OAuth error:", error);
            setErrors({
                general: "Failed to sign up with Google. Please try again."
            });
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

    // Render verification step
    if (currentStep === 'verification') {
        return (
            <motion.div
                className={`max-w-md mx-auto ${className}`}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <div className="pt-[var(--navbar-height)] text-center mb-8">
                    <motion.div
                        className="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-4"
                        variants={itemVariants}
                    >
                        <Mail size={32} className="text-gold" />
                    </motion.div>

                    <motion.h3
                        className="text-2xl font-serif text-black dark:text-white mb-2"
                        variants={itemVariants}
                    >
                        Check Your Email
                    </motion.h3>

                    <motion.p
                        className="text-gray-600 dark:text-gray-400"
                        variants={itemVariants}
                    >
                        We've sent a verification code to <br />
                        <span className="font-medium">{formData.emailAddress}</span>
                    </motion.p>
                </div>

                <motion.form onSubmit={handleVerification} className="space-y-6" variants={itemVariants}>
                    <div>
                        <label className="block text-sm font-medium text-black dark:text-white mb-2">
                            Verification Code
                        </label>
                        <input
                            type="text"
                            value={verificationCode}
                            onChange={(e) => setVerificationCode(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-black rounded-lg focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent transition-colors text-center text-lg tracking-widest"
                            placeholder="Enter 6-digit code"
                            maxLength={6}
                            required
                        />
                        {errors.verification && (
                            <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                                <AlertCircle size={16} />
                                {errors.verification}
                            </p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={!verificationCode || isSubmitting}
                        className="w-full bg-gold hover:bg-gold/90 text-black font-medium py-3 px-6 rounded-lg transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 size={20} className="animate-spin" />
                                Verifying...
                            </>
                        ) : (
                            <>
                                <Check size={20} />
                                Verify Email
                            </>
                        )}
                    </button>

                    <div className="text-center">
                        <button
                            type="button"
                            onClick={() => setCurrentStep('signup')}
                            className="text-gold hover:text-gold/80 text-sm font-medium transition-colors"
                        >
                            ← Back to sign up
                        </button>
                    </div>
                </motion.form>
            </motion.div>
        );
    }

    // Render sign-up form
    return (
        <motion.div
            className={`pt-[var(--navbar-height)] max-w-md mx-auto ${className}`}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {/* CAPTCHA DOM Element */}
            <div ref={captchaRef} id="clerk-captcha" className="clerk-captcha" />

            {/* Dev Mode Test Data Button */}
            {isDev && (
                <motion.div
                    className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg"
                    variants={itemVariants}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">
                                🧪 Development Mode
                            </h4>
                            <p className="text-xs text-blue-600 dark:text-blue-400">
                                Fill form with test data for quick testing
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={fillTestData}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded transition-colors"
                        >
                            Fill Test Data
                        </button>
                    </div>
                    <div className="mt-2 text-xs text-blue-500 dark:text-blue-400">
                        Test email format: test[number]@example.com
                    </div>
                </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* General Error */}
                <AnimatePresence>
                    {errors.general && (
                        <motion.div
                            className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                        >
                            <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                                <AlertCircle size={16} />
                                <span className="text-sm">{errors.general}</span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* OAuth Sign Up */}
                <motion.div variants={itemVariants}>
                    <button
                        type="button"
                        onClick={() => handleOAuthSignUp('oauth_google')}
                        className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        <span>Continue with Google</span>
                    </button>
                </motion.div>

                {/* Divider */}
                <motion.div
                    className="relative flex items-center"
                    variants={itemVariants}
                >
                    <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
                    <span className="flex-shrink mx-4 text-gray-500 dark:text-gray-400 text-sm">or</span>
                    <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
                </motion.div>

                {/* Name Fields */}
                <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-4" variants={itemVariants}>
                    <div>
                        <label className="block text-sm font-medium text-black dark:text-white mb-2">
                            First Name *
                        </label>
                        <div className="relative">
                            <User size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                value={formData.firstName}
                                onChange={(e) => handleInputChange('firstName', e.target.value)}
                                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent transition-colors ${errors.firstName
                                        ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                                        : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-black'
                                    }`}
                                placeholder="First name"
                                required
                            />
                        </div>
                        {errors.firstName && (
                            <p className="mt-1 text-sm text-red-500">{errors.firstName}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-black dark:text-white mb-2">
                            Last Name *
                        </label>
                        <div className="relative">
                            <User size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                value={formData.lastName}
                                onChange={(e) => handleInputChange('lastName', e.target.value)}
                                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent transition-colors ${errors.lastName
                                        ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                                        : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-black'
                                    }`}
                                placeholder="Last name"
                                required
                            />
                        </div>
                        {errors.lastName && (
                            <p className="mt-1 text-sm text-red-500">{errors.lastName}</p>
                        )}
                    </div>
                </motion.div>

                {/* Email Field */}
                <motion.div variants={itemVariants}>
                    <label className="block text-sm font-medium text-black dark:text-white mb-2">
                        Email Address *
                    </label>
                    <div className="relative">
                        <Mail size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="email"
                            value={formData.emailAddress}
                            onChange={(e) => handleInputChange('emailAddress', e.target.value)}
                            className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent transition-colors ${errors.emailAddress
                                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                                    : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-black'
                                }`}
                            placeholder="Enter your email"
                            required
                        />
                    </div>
                    {errors.emailAddress && (
                        <p className="mt-1 text-sm text-red-500">{errors.emailAddress}</p>
                    )}
                </motion.div>

                {/* Password Fields */}
                <motion.div variants={itemVariants}>
                    <label className="block text-sm font-medium text-black dark:text-white mb-2">
                        Password *
                    </label>
                    <div className="relative">
                        <Lock size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type={showPassword ? "text" : "password"}
                            value={formData.password}
                            onChange={(e) => handleInputChange('password', e.target.value)}
                            className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent transition-colors ${errors.password
                                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                                    : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-black'
                                }`}
                            placeholder="Create a password"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>
                    {errors.password && (
                        <p className="mt-1 text-sm text-red-500">{errors.password}</p>
                    )}
                </motion.div>

                <motion.div variants={itemVariants}>
                    <label className="block text-sm font-medium text-black dark:text-white mb-2">
                        Confirm Password *
                    </label>
                    <div className="relative">
                        <Lock size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            value={formData.confirmPassword}
                            onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                            className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent transition-colors ${errors.confirmPassword
                                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                                    : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-black'
                                }`}
                            placeholder="Confirm your password"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>
                    {errors.confirmPassword && (
                        <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>
                    )}
                </motion.div>

                {/* Terms Acceptance */}
                <motion.div variants={itemVariants}>
                    <label className="flex items-start gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={acceptedTerms}
                            onChange={(e) => setAcceptedTerms(e.target.checked)}
                            className="mt-1 w-4 h-4 text-gold focus:ring-gold border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                            I agree to the{" "}
                            <Link href="/terms" className="text-gold hover:text-gold/80 font-medium">
                                Terms of Service
                            </Link>{" "}
                            and{" "}
                            <Link href="/privacy" className="text-gold hover:text-gold/80 font-medium">
                                Privacy Policy
                            </Link>
                        </span>
                    </label>
                    {errors.terms && (
                        <p className="mt-1 text-sm text-red-500">{errors.terms}</p>
                    )}
                </motion.div>

                {/* Submit Button */}
                <motion.div variants={itemVariants}>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-gold hover:bg-gold/90 text-black font-medium py-3 px-6 rounded-lg transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 size={20} className="animate-spin" />
                                Creating Account...
                            </>
                        ) : (
                            <>
                                <Shield size={20} />
                                Create Account
                            </>
                        )}
                    </button>
                </motion.div>

                {/* Sign In Link */}
                <motion.div
                    className="text-center"
                    variants={itemVariants}
                >
                    <p className="text-gray-600 dark:text-gray-400">
                        Already have an account?{" "}
                        <Link
                            href="/sign-in"
                            className="text-gold hover:text-gold/80 font-medium transition-colors"
                        >
                            Sign in
                        </Link>
                    </p>
                </motion.div>
            </form>
        </motion.div>
    );
}