"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSignIn, useAuth } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
    Mail,
    Lock,
    Eye,
    EyeOff,
    ArrowRight,
    ArrowLeft,
    AlertCircle,
    Loader2,
    Check,
    Shield,
    RefreshCw
} from "lucide-react";
import AuthLayout from "./AuthLayout";

export default function PasswordResetPage() {
    const { isLoaded, signIn } = useSignIn();
    const { isSignedIn } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();

    // Check if this is a reset link from email
    const resetCode = searchParams?.get('code');
    const isResetLink = !!resetCode;

    // Form states
    const [step, setStep] = useState<'request' | 'verify' | 'reset' | 'success'>(
        isResetLink ? 'reset' : 'request'
    );
    const [emailAddress, setEmailAddress] = useState("");
    const [verificationCode, setVerificationCode] = useState(resetCode || "");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    // Redirect if already signed in
    if (isSignedIn) {
        router.push("/account");
        return null;
    }

    // Password strength validation
    const getPasswordStrength = (password: string) => {
        let strength = 0;
        if (password.length >= 8) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[a-z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;
        return strength;
    };

    const passwordStrength = getPasswordStrength(newPassword);
    const passwordsMatch = newPassword === confirmPassword && confirmPassword.length > 0;

    // Step 1: Request password reset
    const handleRequestReset = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isLoaded || !signIn) return;

        setIsLoading(true);
        setErrors({});

        try {
            // Request password reset
            await signIn.create({
                strategy: "reset_password_email_code",
                identifier: emailAddress,
            });

            setStep('verify');
        } catch (err: any) {
            const errorMessages: { [key: string]: string } = {};

            if (err.errors) {
                err.errors.forEach((error: any) => {
                    switch (error.code) {
                        case "form_identifier_not_found":
                            errorMessages.email = "No account found with this email address";
                            break;
                        case "too_many_requests":
                            errorMessages.general = "Too many requests. Please wait before trying again.";
                            break;
                        default:
                            errorMessages.general = error.longMessage || "Failed to send reset email. Please try again.";
                    }
                });
            } else {
                errorMessages.general = "Something went wrong. Please try again.";
            }

            setErrors(errorMessages);
        } finally {
            setIsLoading(false);
        }
    };

    // Step 2: Verify reset code
    const handleVerifyCode = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isLoaded || !signIn) return;

        setIsLoading(true);
        setErrors({});

        try {
            // Verify the reset code
            await signIn.attemptFirstFactor({
                strategy: "reset_password_email_code",
                code: verificationCode,
            });

            setStep('reset');
        } catch (err: any) {
            const errorMessages: { [key: string]: string } = {};

            if (err.errors) {
                err.errors.forEach((error: any) => {
                    switch (error.code) {
                        case "form_code_incorrect":
                            errorMessages.code = "Incorrect verification code";
                            break;
                        case "verification_expired":
                            errorMessages.code = "Verification code has expired";
                            break;
                        default:
                            errorMessages.general = error.longMessage || "Code verification failed. Please try again.";
                    }
                });
            } else {
                errorMessages.general = "Something went wrong. Please try again.";
            }

            setErrors(errorMessages);
        } finally {
            setIsLoading(false);
        }
    };

    // Step 3: Reset password
    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isLoaded || !signIn) return;

        // Validate passwords match
        if (newPassword !== confirmPassword) {
            setErrors({ confirm: "Passwords do not match" });
            return;
        }

        // Validate password strength
        if (passwordStrength < 3) {
            setErrors({ password: "Please choose a stronger password" });
            return;
        }

        setIsLoading(true);
        setErrors({});

        try {
            // Reset the password
            await signIn.resetPassword({
                password: newPassword,
            });

            setStep('success');
        } catch (err: any) {
            const errorMessages: { [key: string]: string } = {};

            if (err.errors) {
                err.errors.forEach((error: any) => {
                    switch (error.code) {
                        case "form_password_pwned":
                            errorMessages.password = "This password has been compromised. Please choose a different one.";
                            break;
                        case "form_password_not_strong_enough":
                            errorMessages.password = "Password is not strong enough";
                            break;
                        default:
                            errorMessages.general = error.longMessage || "Password reset failed. Please try again.";
                    }
                });
            } else {
                errorMessages.general = "Something went wrong. Please try again.";
            }

            setErrors(errorMessages);
        } finally {
            setIsLoading(false);
        }
    };

    // Resend reset email
    const handleResendEmail = async () => {
        if (!isLoaded || !signIn) return;

        setIsLoading(true);
        try {
            await signIn.create({
                strategy: "reset_password_email_code",
                identifier: emailAddress,
            });
            setErrors({});
        } catch {
            setErrors({ general: "Failed to resend email. Please try again." });
        } finally {
            setIsLoading(false);
        }
    };

    const formVariants = {
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

    const fieldVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: { opacity: 1, x: 0 }
    };

    // Step content configurations
    const stepConfig = {
        request: {
            title: "Reset Your Password",
            subtitle: "Enter your email address and we'll send you a verification code to reset your password."
        },
        verify: {
            title: "Check Your Email",
            subtitle: `We've sent a verification code to ${emailAddress}. Please enter it below to continue.`
        },
        reset: {
            title: "Create New Password",
            subtitle: "Choose a strong password for your account security."
        },
        success: {
            title: "Password Reset Complete",
            subtitle: "Your password has been successfully updated. You can now sign in with your new password."
        }
    };

    const currentConfig = stepConfig[step];

    return (
        <AuthLayout
            title={currentConfig.title}
            subtitle={currentConfig.subtitle}
            showBackButton={step === 'request'}
            backHref="/sign-in"
        >
            <AnimatePresence mode="wait">
                {/* Step 1: Request Reset */}
                {step === 'request' && (
                    <motion.form
                        key="request"
                        onSubmit={handleRequestReset}
                        className="space-y-6"
                        variants={formVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                    >
                        {/* General Error */}
                        {errors.general && (
                            <motion.div
                                className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
                                variants={fieldVariants}
                            >
                                <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                                    <AlertCircle size={16} />
                                    <span className="text-sm font-medium">{errors.general}</span>
                                </div>
                            </motion.div>
                        )}

                        {/* Email Input */}
                        <motion.div variants={fieldVariants}>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="email"
                                    value={emailAddress}
                                    onChange={(e) => setEmailAddress(e.target.value)}
                                    className={`w-full pl-12 pr-4 py-4 border rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent transition-all duration-300 ${errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                                        }`}
                                    placeholder="Enter your email address"
                                    required
                                    disabled={isLoading}
                                />
                            </div>
                            {errors.email && (
                                <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.email}</p>
                            )}
                        </motion.div>

                        {/* Submit Button */}
                        <motion.button
                            type="submit"
                            disabled={!emailAddress || isLoading}
                            className="w-full bg-gold hover:bg-gold/90 disabled:bg-gray-300 disabled:cursor-not-allowed text-black font-medium py-4 px-6 rounded-lg transition-all duration-300 hover:scale-[1.02] tracking-wide uppercase text-sm flex items-center justify-center gap-2"
                            variants={fieldVariants}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" />
                                    Sending Email...
                                </>
                            ) : (
                                <>
                                    Send Reset Code
                                    <ArrowRight size={18} />
                                </>
                            )}
                        </motion.button>

                        {/* Back to Sign In */}
                        <motion.div className="text-center" variants={fieldVariants}>
                            <Link
                                href="/sign-in"
                                className="text-gold hover:text-gold/80 text-sm font-medium flex items-center justify-center gap-1"
                            >
                                <ArrowLeft size={16} />
                                Back to Sign In
                            </Link>
                        </motion.div>
                    </motion.form>
                )}

                {/* Step 2: Verify Code */}
                {step === 'verify' && (
                    <motion.form
                        key="verify"
                        onSubmit={handleVerifyCode}
                        className="space-y-6"
                        variants={formVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                    >
                        {/* Verification Code */}
                        <motion.div variants={fieldVariants}>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Verification Code
                            </label>
                            <input
                                type="text"
                                value={verificationCode}
                                onChange={(e) => setVerificationCode(e.target.value)}
                                className="w-full px-4 py-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white text-center text-2xl tracking-widest focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
                                placeholder="000000"
                                maxLength={6}
                                required
                            />
                            {errors.code && (
                                <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.code}</p>
                            )}
                        </motion.div>

                        {/* Verify Button */}
                        <motion.button
                            type="submit"
                            disabled={!verificationCode || isLoading}
                            className="w-full bg-gold hover:bg-gold/90 disabled:bg-gray-300 text-black font-medium py-4 rounded-lg transition-all duration-300"
                            variants={fieldVariants}
                        >
                            {isLoading ? (
                                <div className="flex items-center justify-center gap-2">
                                    <Loader2 size={18} className="animate-spin" />
                                    Verifying...
                                </div>
                            ) : (
                                "Verify Code"
                            )}
                        </motion.button>

                        {/* Resend Code */}
                        <motion.div className="text-center space-y-2" variants={fieldVariants}>
                            <button
                                type="button"
                                onClick={handleResendEmail}
                                className="text-gold hover:text-gold/80 text-sm flex items-center justify-center gap-1"
                            >
                                <RefreshCw size={16} />
                                Resend Code
                            </button>
                            <p className="text-xs text-gray-500">
                                Didn't receive the email? Check your spam folder.
                            </p>
                        </motion.div>
                    </motion.form>
                )}

                {/* Step 3: Reset Password */}
                {step === 'reset' && (
                    <motion.form
                        key="reset"
                        onSubmit={handleResetPassword}
                        className="space-y-6"
                        variants={formVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                    >
                        {/* New Password */}
                        <motion.div variants={fieldVariants}>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                New Password
                            </label>
                            <div className="relative">
                                <Lock size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full pl-12 pr-12 py-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
                                    placeholder="Enter new password"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>

                            {/* Password Strength */}
                            {newPassword && (
                                <div className="mt-2">
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-gray-600 dark:text-gray-400">Password strength:</span>
                                        <span className={`font-medium ${passwordStrength >= 3 ? 'text-green-600' : 'text-orange-600'}`}>
                                            {['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'][passwordStrength - 1] || 'Very Weak'}
                                        </span>
                                    </div>
                                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full transition-all duration-300 ${['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'][passwordStrength - 1] || 'bg-gray-300'
                                                }`}
                                            style={{ width: `${(passwordStrength / 5) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            )}

                            {errors.password && (
                                <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.password}</p>
                            )}
                        </motion.div>

                        {/* Confirm Password */}
                        <motion.div variants={fieldVariants}>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Confirm New Password
                            </label>
                            <div className="relative">
                                <Lock size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className={`w-full pl-12 pr-12 py-4 border rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent ${confirmPassword && !passwordsMatch ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                                        }`}
                                    placeholder="Confirm new password"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>

                            {/* Password Match Indicator */}
                            {confirmPassword && (
                                <div className={`mt-2 text-sm flex items-center gap-1 ${passwordsMatch ? 'text-green-600' : 'text-red-600'}`}>
                                    {passwordsMatch ? <Check size={14} /> : <AlertCircle size={14} />}
                                    {passwordsMatch ? 'Passwords match' : 'Passwords do not match'}
                                </div>
                            )}

                            {errors.confirm && (
                                <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.confirm}</p>
                            )}
                        </motion.div>

                        {/* Reset Button */}
                        <motion.button
                            type="submit"
                            disabled={!newPassword || !confirmPassword || !passwordsMatch || passwordStrength < 3 || isLoading}
                            className="w-full bg-gold hover:bg-gold/90 disabled:bg-gray-300 disabled:cursor-not-allowed text-black font-medium py-4 px-6 rounded-lg transition-all duration-300 hover:scale-[1.02] tracking-wide uppercase text-sm flex items-center justify-center gap-2"
                            variants={fieldVariants}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" />
                                    Updating Password...
                                </>
                            ) : (
                                <>
                                    <Shield size={18} />
                                    Update Password
                                </>
                            )}
                        </motion.button>
                    </motion.form>
                )}

                {/* Step 4: Success */}
                {step === 'success' && (
                    <motion.div
                        key="success"
                        className="text-center space-y-6"
                        variants={formVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                    >
                        {/* Success Icon */}
                        <motion.div
                            className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center"
                            variants={fieldVariants}
                        >
                            <Check size={32} className="text-green-600 dark:text-green-400" />
                        </motion.div>

                        {/* Success Message */}
                        <motion.div variants={fieldVariants} className="space-y-4">
                            <p className="text-gray-600 dark:text-gray-400">
                                Your password has been successfully reset. You can now sign in with your new password.
                            </p>
                        </motion.div>

                        {/* Sign In Button */}
                        <motion.div variants={fieldVariants}>
                            <Link
                                href="/sign-in"
                                className="w-full bg-gold hover:bg-gold/90 text-black font-medium py-4 px-6 rounded-lg transition-all duration-300 hover:scale-[1.02] tracking-wide uppercase text-sm flex items-center justify-center gap-2"
                            >
                                <ArrowLeft size={18} />
                                Sign In Now
                            </Link>
                        </motion.div>

                        {/* Security Note */}
                        <motion.div
                            className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg"
                            variants={fieldVariants}
                        >
                            <div className="flex items-start gap-3">
                                <Shield size={20} className="text-blue-600 mt-0.5 flex-shrink-0" />
                                <div className="text-left">
                                    <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                                        Security Reminder
                                    </h4>
                                    <p className="text-sm text-blue-700 dark:text-blue-300">
                                        For your account security, consider enabling two-factor authentication in your account settings.
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </AuthLayout>
    );
}