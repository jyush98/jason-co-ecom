"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSignIn, useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    Eye,
    EyeOff,
    Mail,
    Lock,
    ArrowRight,
    AlertCircle,
    Loader2,
    Check
} from "lucide-react";
import AuthLayout from "./AuthLayout";

export default function CustomSignInPage() {
    const { isLoaded, signIn, setActive } = useSignIn();
    const { isSignedIn } = useAuth();
    const router = useRouter();

    // Form state
    const [emailAddress, setEmailAddress] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [_attemptCount, setAttemptCount] = useState(0);

    // Redirect if already signed in
    if (isSignedIn) {
        router.push("/account");
        return null;
    }

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isLoaded || !signIn) return;

        setIsLoading(true);
        setErrors({});
        setAttemptCount(prev => prev + 1);

        try {
            // Attempt to sign in
            const result = await signIn.create({
                identifier: emailAddress,
                password,
            });

            if (result.status === "complete") {
                // Sign in successful
                await setActive({ session: result.createdSessionId });
                router.push("/account");
            } else {
                // Handle other sign-in statuses (shouldn't happen with email/password)
                console.log("Sign-in incomplete:", result);
            }
        } catch (err: any) {
            // Handle errors
            const errorMessages: { [key: string]: string } = {};

            if (err.errors) {
                err.errors.forEach((error: any) => {
                    switch (error.code) {
                        case "form_identifier_not_found":
                            errorMessages.email = "No account found with this email address";
                            break;
                        case "form_password_incorrect":
                            errorMessages.password = "Incorrect password";
                            break;
                        case "too_many_requests":
                            errorMessages.general = "Too many attempts. Please try again later.";
                            break;
                        default:
                            errorMessages.general = error.longMessage || "Sign in failed. Please try again.";
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

    // Handle social sign-in (Google, etc.)
    const handleSocialSignIn = async (provider: "oauth_google" | "oauth_facebook") => {
        if (!isLoaded || !signIn) return;

        try {
            await signIn.authenticateWithRedirect({
                strategy: provider,
                redirectUrl: "/sso-callback",
                redirectUrlComplete: "/account"
            });
        } catch (err) {
            console.error("Social sign-in error:", err);
            setErrors({ general: "Social sign-in failed. Please try again." });
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

    return (
        <AuthLayout
            title="Welcome Back"
            subtitle="Sign in to your account to access your jewelry collection, orders, and exclusive member benefits."
            showBackButton={true}
            backHref="/"
        >
            <motion.form
                onSubmit={handleSubmit}
                className="space-y-6"
                variants={formVariants}
                initial="hidden"
                animate="visible"
            >
                {/* General Error Message */}
                <AnimatePresence>
                    {errors.general && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
                        >
                            <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                                <AlertCircle size={16} />
                                <span className="text-sm font-medium">{errors.general}</span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Email Field */}
                <motion.div variants={fieldVariants}>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Email Address
                    </label>
                    <div className="relative">
                        <Mail
                            size={20}
                            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                        />
                        <input
                            type="email"
                            value={emailAddress}
                            onChange={(e) => setEmailAddress(e.target.value)}
                            className={`w-full pl-12 pr-4 py-4 border rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent transition-all duration-300 ${errors.email
                                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                                }`}
                            placeholder="Enter your email address"
                            required
                            disabled={isLoading}
                        />
                    </div>
                    {errors.email && (
                        <motion.p
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
                        >
                            <AlertCircle size={14} />
                            {errors.email}
                        </motion.p>
                    )}
                </motion.div>

                {/* Password Field */}
                <motion.div variants={fieldVariants}>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Password
                    </label>
                    <div className="relative">
                        <Lock
                            size={20}
                            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                        />
                        <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={`w-full pl-12 pr-12 py-4 border rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent transition-all duration-300 ${errors.password
                                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                                }`}
                            placeholder="Enter your password"
                            required
                            disabled={isLoading}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                        >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>
                    {errors.password && (
                        <motion.p
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
                        >
                            <AlertCircle size={14} />
                            {errors.password}
                        </motion.p>
                    )}
                </motion.div>

                {/* Forgot Password Link */}
                <motion.div
                    className="flex justify-end"
                    variants={fieldVariants}
                >
                    <Link
                        href="/reset-password"
                        className="text-sm text-gold hover:text-gold/80 transition-colors font-medium"
                    >
                        Forgot your password?
                    </Link>
                </motion.div>

                {/* Sign In Button */}
                <motion.button
                    type="submit"
                    disabled={!emailAddress || !password || isLoading}
                    className="w-full bg-gold hover:bg-gold/90 disabled:bg-gray-300 disabled:cursor-not-allowed text-black font-medium py-4 px-6 rounded-lg transition-all duration-300 hover:scale-[1.02] tracking-wide uppercase text-sm flex items-center justify-center gap-2"
                    variants={fieldVariants}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    {isLoading ? (
                        <>
                            <Loader2 size={18} className="animate-spin" />
                            Signing In...
                        </>
                    ) : (
                        <>
                            Sign In
                            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </>
                    )}
                </motion.button>

                {/* Divider */}
                <motion.div
                    className="relative my-6"
                    variants={fieldVariants}
                >
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300 dark:border-gray-600" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-4 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                            Or continue with
                        </span>
                    </div>
                </motion.div>

                {/* Social Sign-In Buttons */}
                <motion.div
                    className="space-y-3"
                    variants={fieldVariants}
                >
                    <button
                        type="button"
                        onClick={() => handleSocialSignIn("oauth_google")}
                        className="w-full flex items-center justify-center gap-3 py-4 px-6 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        <span className="font-medium">Continue with Google</span>
                    </button>
                </motion.div>

                {/* Sign Up Link */}
                <motion.div
                    className="text-center pt-4"
                    variants={fieldVariants}
                >
                    <p className="text-gray-600 dark:text-gray-400">
                        Don't have an account?{" "}
                        <Link
                            href="/sign-up"
                            className="text-gold hover:text-gold/80 font-medium transition-colors"
                        >
                            Create an account
                        </Link>
                    </p>
                </motion.div>

                {/* Member Benefits Preview */}
                <motion.div
                    className="mt-8 p-4 bg-gold/5 border border-gold/20 rounded-lg"
                    variants={fieldVariants}
                >
                    <h4 className="font-medium text-black dark:text-white mb-2">Member Benefits:</h4>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                        <li className="flex items-center gap-2">
                            <Check size={14} className="text-gold" />
                            Exclusive access to new collections
                        </li>
                        <li className="flex items-center gap-2">
                            <Check size={14} className="text-gold" />
                            Priority custom design consultations
                        </li>
                        <li className="flex items-center gap-2">
                            <Check size={14} className="text-gold" />
                            Order tracking and history
                        </li>
                    </ul>
                </motion.div>
            </motion.form>
        </AuthLayout>
    );
}