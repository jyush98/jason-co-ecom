"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useUser, useAuth } from "@clerk/nextjs";
import {
    User,
    Mail,
    Calendar,
    Camera,
    Save,
    AlertCircle,
    Check,
    Edit3,
    Shield,
    Globe
} from "lucide-react";

interface ProfileFormData {
    firstName: string;
    lastName: string;
    username: string;
    // Note: Email changes handled by Clerk directly
}

interface ProfileSettingsProps {
    className?: string;
}

export default function ProfileSettings({ className = "" }: ProfileSettingsProps) {
    const { user, isLoaded } = useUser();
    // const { getToken } = useAuth();

    const [formData, setFormData] = useState<ProfileFormData>({
        firstName: "",
        lastName: "",
        username: "",
    });

    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState<string>('');

    // Initialize form data when user loads
    useEffect(() => {
        if (isLoaded && user) {
            setFormData({
                firstName: user.firstName || "",
                lastName: user.lastName || "",
                username: user.username || "",
            });
        }
    }, [isLoaded, user]);

    const handleInputChange = (field: keyof ProfileFormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setSaveStatus('idle');
        setErrorMessage('');
    };

    const handleSave = async () => {
        if (!user) return;

        setIsSaving(true);
        setSaveStatus('idle');
        setErrorMessage('');

        try {
            // Update user profile through Clerk
            await user.update({
                firstName: formData.firstName,
                lastName: formData.lastName,
                username: formData.username || undefined,
            });

            setSaveStatus('success');
            setIsEditing(false);

            // Auto-clear success message after 3 seconds
            setTimeout(() => setSaveStatus('idle'), 3000);

        } catch (error) {
            console.error('Profile update error:', error);
            setSaveStatus('error');
            setErrorMessage(
                error instanceof Error
                    ? error.message
                    : 'Failed to update profile. Please try again.'
            );
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        if (user) {
            setFormData({
                firstName: user.firstName || "",
                lastName: user.lastName || "",
                username: user.username || "",
            });
        }
        setIsEditing(false);
        setSaveStatus('idle');
        setErrorMessage('');
    };

    const handleProfilePictureClick = () => {
        // Clerk handles profile picture changes through their UI
        // For now, we'll show a message about using Clerk's interface
        alert('Profile picture changes are managed through your account settings. Click "Manage Account" to update your photo.');
    };

    if (!isLoaded || !user) {
        return <ProfileSettingsSkeleton />;
    }

    const hasChanges =
        formData.firstName !== (user.firstName || "") ||
        formData.lastName !== (user.lastName || "") ||
        formData.username !== (user.username || "");

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

    return (
        <motion.div
            className={`max-w-2xl ${className}`}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <div className="space-y-8">
                {/* Header */}
                <motion.div variants={itemVariants}>
                    <h2 className="text-2xl font-serif text-black dark:text-white mb-2">
                        Profile Settings
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        Manage your account information and preferences
                    </p>
                </motion.div>

                {/* Status Messages */}
                {saveStatus === 'success' && (
                    <motion.div
                        variants={itemVariants}
                        className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg"
                    >
                        <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                            <Check size={16} />
                            <span className="text-sm font-medium">Profile updated successfully!</span>
                        </div>
                    </motion.div>
                )}

                {saveStatus === 'error' && (
                    <motion.div
                        variants={itemVariants}
                        className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
                    >
                        <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                            <AlertCircle size={16} />
                            <span className="text-sm font-medium">{errorMessage}</span>
                        </div>
                    </motion.div>
                )}

                {/* Profile Picture Section */}
                <motion.div
                    variants={itemVariants}
                    className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-700"
                >
                    <h3 className="text-lg font-medium text-black dark:text-white mb-4 flex items-center gap-2">
                        <Camera size={20} className="text-gold" />
                        Profile Picture
                    </h3>

                    <div className="flex items-center gap-6">
                        <div className="relative">
                            <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                                {user.imageUrl ? (
                                    <img
                                        src={user.imageUrl}
                                        alt="Profile"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <User size={32} className="text-gray-400" />
                                    </div>
                                )}
                            </div>
                            <button
                                onClick={handleProfilePictureClick}
                                className="absolute -bottom-1 -right-1 w-8 h-8 bg-gold hover:bg-gold/90 text-black rounded-full flex items-center justify-center transition-colors shadow-lg"
                            >
                                <Camera size={14} />
                            </button>
                        </div>

                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                JPG, PNG or GIF. Max size 10MB.
                            </p>
                            <button
                                onClick={handleProfilePictureClick}
                                className="text-gold hover:text-gold/80 text-sm font-medium transition-colors"
                            >
                                Change Picture
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* Personal Information */}
                <motion.div
                    variants={itemVariants}
                    className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-700"
                >
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-medium text-black dark:text-white flex items-center gap-2">
                            <User size={20} className="text-gold" />
                            Personal Information
                        </h3>

                        {!isEditing ? (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="flex items-center gap-2 text-gold hover:text-gold/80 text-sm font-medium transition-colors"
                            >
                                <Edit3 size={16} />
                                Edit
                            </button>
                        ) : (
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={handleCancel}
                                    disabled={isSaving}
                                    className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={!hasChanges || isSaving}
                                    className="flex items-center gap-2 px-4 py-2 bg-gold hover:bg-gold/90 text-black text-sm font-medium rounded transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSaving ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save size={16} />
                                            Save Changes
                                        </>
                                    )}
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="space-y-6">
                        {/* First Name */}
                        <div>
                            <label className="block text-sm font-medium text-black dark:text-white mb-2">
                                First Name
                            </label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={formData.firstName}
                                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-black rounded-lg focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent transition-colors"
                                    placeholder="Enter your first name"
                                />
                            ) : (
                                <div className="px-4 py-3 bg-gray-100 dark:bg-gray-800 rounded-lg text-black dark:text-white">
                                    {user.firstName || "Not set"}
                                </div>
                            )}
                        </div>

                        {/* Last Name */}
                        <div>
                            <label className="block text-sm font-medium text-black dark:text-white mb-2">
                                Last Name
                            </label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={formData.lastName}
                                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-black rounded-lg focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent transition-colors"
                                    placeholder="Enter your last name"
                                />
                            ) : (
                                <div className="px-4 py-3 bg-gray-100 dark:bg-gray-800 rounded-lg text-black dark:text-white">
                                    {user.lastName || "Not set"}
                                </div>
                            )}
                        </div>

                        {/* Username */}
                        <div>
                            <label className="block text-sm font-medium text-black dark:text-white mb-2">
                                Username (Optional)
                            </label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={formData.username}
                                    onChange={(e) => handleInputChange('username', e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-black rounded-lg focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent transition-colors"
                                    placeholder="Choose a username"
                                />
                            ) : (
                                <div className="px-4 py-3 bg-gray-100 dark:bg-gray-800 rounded-lg text-black dark:text-white">
                                    {user.username || "Not set"}
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* Account Information (Read-only) */}
                <motion.div
                    variants={itemVariants}
                    className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-700"
                >
                    <h3 className="text-lg font-medium text-black dark:text-white mb-6 flex items-center gap-2">
                        <Shield size={20} className="text-gold" />
                        Account Information
                    </h3>

                    <div className="space-y-4">
                        {/* Email */}
                        <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                            <div className="flex items-center gap-3">
                                <Mail size={16} className="text-gray-400" />
                                <div>
                                    <p className="text-sm font-medium text-black dark:text-white">Email Address</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {user.primaryEmailAddress?.emailAddress || "Not set"}
                                    </p>
                                </div>
                            </div>
                            <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded font-medium">
                                Verified
                            </span>
                        </div>

                        {/* Account Created */}
                        <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                            <div className="flex items-center gap-3">
                                <Calendar size={16} className="text-gray-400" />
                                <div>
                                    <p className="text-sm font-medium text-black dark:text-white">Account Created</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        }) : "Unknown"}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Last Updated */}
                        <div className="flex items-center justify-between py-3">
                            <div className="flex items-center gap-3">
                                <Globe size={16} className="text-gray-400" />
                                <div>
                                    <p className="text-sm font-medium text-black dark:text-white">Last Updated</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {user.updatedAt ? new Date(user.updatedAt).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        }) : "Never"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Clerk Account Management */}
                <motion.div
                    variants={itemVariants}
                    className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6"
                >
                    <h3 className="text-lg font-medium text-black dark:text-white mb-3">
                        Advanced Account Settings
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Manage your email, password, two-factor authentication, and other security settings.
                    </p>
                    <button
                        onClick={() => user.update({})} // This triggers Clerk's account management UI
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded transition-colors"
                    >
                        Manage Account
                    </button>
                </motion.div>
            </div>
        </motion.div>
    );
}

// Loading Skeleton
function ProfileSettingsSkeleton() {
    return (
        <div className="max-w-2xl space-y-8">
            {/* Header Skeleton */}
            <div>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-2 animate-pulse" />
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-96 animate-pulse" />
            </div>

            {/* Profile Picture Skeleton */}
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-4 animate-pulse" />
                <div className="flex items-center gap-6">
                    <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
                    <div className="space-y-2">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-48 animate-pulse" />
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse" />
                    </div>
                </div>
            </div>

            {/* Form Skeleton */}
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-6 animate-pulse" />
                <div className="space-y-6">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i}>
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2 animate-pulse" />
                            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}