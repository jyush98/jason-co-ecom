"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@clerk/nextjs";
import {
    Bell,
    // Mail,
    MessageSquare,
    Package,
    Heart,
    ShoppingBag,
    Star,
    Gift,
    TrendingUp,
    AlertCircle,
    Check,
    Loader2,
    Phone,
    // Volume2,
    // VolumeX,
    Info
} from "lucide-react";
import { createStaggerContainer, createEntranceAnimation } from "@/lib/animations";

// Notification preferences interface
interface NotificationPreferences {
    email_notifications: {
        order_confirmations: boolean;
        order_updates: boolean;
        shipping_notifications: boolean;
        delivery_confirmations: boolean;
        payment_receipts: boolean;
        returns_refunds: boolean;
    };
    marketing_notifications: {
        new_products: boolean;
        sales_promotions: boolean;
        exclusive_offers: boolean;
        collection_launches: boolean;
        wishlist_updates: boolean;
        price_drops: boolean;
        abandoned_cart: boolean;
    };
    account_notifications: {
        security_alerts: boolean;
        password_changes: boolean;
        profile_updates: boolean;
        privacy_updates: boolean;
    };
    sms_notifications: {
        enabled: boolean;
        phone_number: string;
        order_updates: boolean;
        shipping_alerts: boolean;
        delivery_notifications: boolean;
        security_alerts: boolean;
    };
    notification_frequency: 'immediate' | 'daily' | 'weekly';
    quiet_hours: {
        enabled: boolean;
        start_time: string;
        end_time: string;
        timezone: string;
    };
}

interface NotificationCategory {
    id: string;
    title: string;
    description: string;
    icon: React.ReactNode;
    items: Array<{
        key: string;
        label: string;
        description: string;
        icon?: React.ReactNode;
        required?: boolean;
    }>;
}

export default function NotificationSettings() {
    const { getToken } = useAuth();
    // const { user } = useUser();
    const [preferences, setPreferences] = useState<NotificationPreferences>({
        email_notifications: {
            order_confirmations: true,
            order_updates: true,
            shipping_notifications: true,
            delivery_confirmations: true,
            payment_receipts: true,
            returns_refunds: true,
        },
        marketing_notifications: {
            new_products: false,
            sales_promotions: false,
            exclusive_offers: true,
            collection_launches: false,
            wishlist_updates: true,
            price_drops: true,
            abandoned_cart: true,
        },
        account_notifications: {
            security_alerts: true,
            password_changes: true,
            profile_updates: false,
            privacy_updates: true,
        },
        sms_notifications: {
            enabled: false,
            phone_number: '',
            order_updates: false,
            shipping_alerts: false,
            delivery_notifications: false,
            security_alerts: true,
        },
        notification_frequency: 'immediate',
        quiet_hours: {
            enabled: false,
            start_time: '22:00',
            end_time: '08:00',
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
    });

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string>('');
    const [successMessage, setSuccessMessage] = useState<string>('');

    // Load preferences on mount
    useEffect(() => {
        loadPreferences();
    }, []);

    const loadPreferences = async () => {
        try {
            const token = await getToken();
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/account/notification-preferences`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();
                setPreferences(data);
            }
            // If 404, use defaults (first time user)
        } catch (error) {
            console.error('Failed to load notification preferences:', error);
            // Use defaults
        } finally {
            setIsLoading(false);
        }
    };

    const savePreferences = async () => {
        setIsSaving(true);
        setError('');
        setSuccessMessage('');

        try {
            const token = await getToken();
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/account/notification-preferences`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(preferences),
            });

            if (response.ok) {
                setSuccessMessage('Notification preferences saved successfully!');
                setTimeout(() => setSuccessMessage(''), 3000);
            } else {
                const errorData = await response.json();
                setError(errorData.detail || 'Failed to save preferences');
            }
        } catch (error) {
            console.error('Failed to save notification preferences:', error);
            setError('Failed to save preferences. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    // Helper function to update nested preferences
    const updatePreference = (category: keyof NotificationPreferences, key: string, value: boolean | string) => {
        setPreferences(prev => ({
            ...prev,
            [category]: {
                ...(prev[category] as Record<string, any>),
                [key]: value
            }
        }));
    };

    // Toggle all in a category
    const toggleCategory = (category: keyof NotificationPreferences, enabled: boolean) => {
        if (category === 'sms_notifications' || category === 'quiet_hours') return;

        const categoryPrefs = preferences[category] as Record<string, boolean>;
        const updatedCategory = Object.keys(categoryPrefs).reduce((acc, key) => {
            // Don't change required preferences
            const isRequired = (category === 'email_notifications' &&
                ['order_confirmations', 'payment_receipts'].includes(key)) ||
                (category === 'account_notifications' &&
                    ['security_alerts', 'password_changes'].includes(key));

            acc[key] = isRequired ? true : enabled;
            return acc;
        }, {} as Record<string, boolean>);

        setPreferences(prev => ({
            ...prev,
            [category]: updatedCategory
        }));
    };

    // Notification categories configuration
    const notificationCategories: NotificationCategory[] = [
        {
            id: 'email_notifications',
            title: 'Order & Account Emails',
            description: 'Essential notifications about your orders and account',
            icon: <Package size={20} className="text-blue-500" />,
            items: [
                {
                    key: 'order_confirmations',
                    label: 'Order Confirmations',
                    description: 'When you place an order',
                    icon: <Check size={16} />,
                    required: true
                },
                {
                    key: 'order_updates',
                    label: 'Order Status Updates',
                    description: 'When your order status changes',
                    icon: <Package size={16} />
                },
                {
                    key: 'shipping_notifications',
                    label: 'Shipping Notifications',
                    description: 'When your order ships',
                    icon: <Package size={16} />
                },
                {
                    key: 'delivery_confirmations',
                    label: 'Delivery Confirmations',
                    description: 'When your order is delivered',
                    icon: <Check size={16} />
                },
                {
                    key: 'payment_receipts',
                    label: 'Payment Receipts',
                    description: 'Payment confirmations and receipts',
                    icon: <Check size={16} />,
                    required: true
                },
                {
                    key: 'returns_refunds',
                    label: 'Returns & Refunds',
                    description: 'Updates on returns and refunds',
                    icon: <Package size={16} />
                }
            ]
        },
        {
            id: 'marketing_notifications',
            title: 'Marketing & Promotions',
            description: 'Stay updated on new products, sales, and exclusive offers',
            icon: <TrendingUp size={20} className="text-gold" />,
            items: [
                {
                    key: 'new_products',
                    label: 'New Product Launches',
                    description: 'Be first to know about new jewelry pieces',
                    icon: <Star size={16} />
                },
                {
                    key: 'sales_promotions',
                    label: 'Sales & Promotions',
                    description: 'Special offers and discount codes',
                    icon: <Gift size={16} />
                },
                {
                    key: 'exclusive_offers',
                    label: 'VIP Exclusive Offers',
                    description: 'Members-only deals and early access',
                    icon: <Star size={16} />
                },
                {
                    key: 'collection_launches',
                    label: 'Collection Launches',
                    description: 'New collection announcements',
                    icon: <ShoppingBag size={16} />
                },
                {
                    key: 'wishlist_updates',
                    label: 'Wishlist Updates',
                    description: 'When items in your wishlist go on sale',
                    icon: <Heart size={16} />
                },
                {
                    key: 'price_drops',
                    label: 'Price Drop Alerts',
                    description: 'When saved items drop in price',
                    icon: <TrendingUp size={16} />
                },
                {
                    key: 'abandoned_cart',
                    label: 'Cart Reminders',
                    description: 'Gentle reminders about items in your cart',
                    icon: <ShoppingBag size={16} />
                }
            ]
        },
        {
            id: 'account_notifications',
            title: 'Account & Security',
            description: 'Important updates about your account and security',
            icon: <AlertCircle size={20} className="text-red-500" />,
            items: [
                {
                    key: 'security_alerts',
                    label: 'Security Alerts',
                    description: 'Login attempts and security issues',
                    icon: <AlertCircle size={16} />,
                    required: true
                },
                {
                    key: 'password_changes',
                    label: 'Password Changes',
                    description: 'When your password is changed',
                    icon: <AlertCircle size={16} />,
                    required: true
                },
                {
                    key: 'profile_updates',
                    label: 'Profile Updates',
                    description: 'Confirmations of profile changes',
                    icon: <Check size={16} />
                },
                {
                    key: 'privacy_updates',
                    label: 'Privacy Policy Updates',
                    description: 'Changes to our privacy policy',
                    icon: <Info size={16} />
                }
            ]
        }
    ];

    const containerVariants = createStaggerContainer(0.1, 0.2);  // Default duration
    const itemVariants = createEntranceAnimation(20, 1, 0.5);

    if (isLoading) {
        return <NotificationSettingsSkeleton />;
    }

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8"
        >
            {/* Header */}
            <motion.div variants={itemVariants} className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-serif text-black dark:text-white mb-2">
                        Notification Settings
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        Control how and when we communicate with you
                    </p>
                </div>
            </motion.div>

            {/* Success/Error Messages */}
            <AnimatePresence>
                {successMessage && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg"
                    >
                        <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                            <Check size={16} />
                            <span className="text-sm">{successMessage}</span>
                        </div>
                    </motion.div>
                )}

                {error && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
                    >
                        <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                            <AlertCircle size={16} />
                            <span className="text-sm">{error}</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Notification Categories */}
            {notificationCategories.map((category) => (
                <motion.div
                    key={category.id}
                    variants={itemVariants}
                    className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700"
                >
                    {/* Category Header */}
                    <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                {category.icon}
                                <div>
                                    <h3 className="text-lg font-medium text-black dark:text-white">
                                        {category.title}
                                    </h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {category.description}
                                    </p>
                                </div>
                            </div>

                            {/* Category Toggle All */}
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => toggleCategory(category.id as keyof NotificationPreferences, false)}
                                    className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                                >
                                    Turn Off All
                                </button>
                                <button
                                    onClick={() => toggleCategory(category.id as keyof NotificationPreferences, true)}
                                    className="text-sm text-gold hover:text-gold/80 transition-colors"
                                >
                                    Turn On All
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Category Items */}
                    <div className="p-6 space-y-4">
                        {category.items.map((item) => {
                            const isEnabled = (preferences[category.id as keyof NotificationPreferences] as any)[item.key];

                            return (
                                <div key={item.key} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3 flex-1">
                                        {item.icon && (
                                            <span className="text-gray-400">{item.icon}</span>
                                        )}
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-medium text-black dark:text-white">
                                                    {item.label}
                                                </h4>
                                                {item.required && (
                                                    <span className="text-xs bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-2 py-0.5 rounded">
                                                        Required
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                {item.description}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Toggle Switch */}
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={isEnabled}
                                            onChange={(e) => updatePreference(category.id as keyof NotificationPreferences, item.key, e.target.checked)}
                                            disabled={item.required}
                                            className="sr-only peer"
                                        />
                                        <div className={`relative w-11 h-6 rounded-full transition-colors duration-300 ${isEnabled
                                            ? 'bg-gold'
                                            : 'bg-gray-200 dark:bg-gray-700'
                                            } ${item.required ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                            <div className={`absolute top-0.5 left-0.5 bg-white rounded-full h-5 w-5 transition-transform duration-300 ${isEnabled ? 'translate-x-5' : 'translate-x-0'
                                                }`} />
                                        </div>
                                    </label>
                                </div>
                            );
                        })}
                    </div>
                </motion.div>
            ))}

            {/* SMS Notifications */}
            <motion.div
                variants={itemVariants}
                className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700"
            >
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                        <MessageSquare size={20} className="text-green-500" />
                        <div>
                            <h3 className="text-lg font-medium text-black dark:text-white">
                                SMS Notifications
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Get important updates via text message
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-6 space-y-4">
                    {/* Enable SMS */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="font-medium text-black dark:text-white">Enable SMS Notifications</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Receive text messages for important updates
                            </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={preferences.sms_notifications.enabled}
                                onChange={(e) => updatePreference('sms_notifications', 'enabled', e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className={`relative w-11 h-6 rounded-full transition-colors duration-300 ${preferences.sms_notifications.enabled ? 'bg-gold' : 'bg-gray-200 dark:bg-gray-700'
                                }`}>
                                <div className={`absolute top-0.5 left-0.5 bg-white rounded-full h-5 w-5 transition-transform duration-300 ${preferences.sms_notifications.enabled ? 'translate-x-5' : 'translate-x-0'
                                    }`} />
                            </div>
                        </label>
                    </div>

                    {/* Phone Number Input */}
                    {preferences.sms_notifications.enabled && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-4"
                        >
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Phone Number
                                </label>
                                <div className="flex items-center gap-2">
                                    <Phone size={16} className="text-gray-400" />
                                    <input
                                        type="tel"
                                        value={preferences.sms_notifications.phone_number}
                                        onChange={(e) => updatePreference('sms_notifications', 'phone_number', e.target.value)}
                                        placeholder="(555) 123-4567"
                                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-black rounded-lg focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
                                    />
                                </div>
                            </div>

                            {/* SMS Options */}
                            <div className="space-y-3">
                                {[
                                    { key: 'order_updates', label: 'Order Updates', description: 'Status changes and confirmations' },
                                    { key: 'shipping_alerts', label: 'Shipping Alerts', description: 'When your order ships' },
                                    { key: 'delivery_notifications', label: 'Delivery Notifications', description: 'When your order arrives' },
                                    { key: 'security_alerts', label: 'Security Alerts', description: 'Important account security updates' }
                                ].map((option) => (
                                    <div key={option.key} className="flex items-center justify-between">
                                        <div>
                                            <h5 className="font-medium text-black dark:text-white">{option.label}</h5>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">{option.description}</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={(preferences.sms_notifications as any)[option.key]}
                                                onChange={(e) => updatePreference('sms_notifications', option.key, e.target.checked)}
                                                className="sr-only peer"
                                            />
                                            <div className={`relative w-11 h-6 rounded-full transition-colors duration-300 ${(preferences.sms_notifications as any)[option.key] ? 'bg-gold' : 'bg-gray-200 dark:bg-gray-700'
                                                }`}>
                                                <div className={`absolute top-0.5 left-0.5 bg-white rounded-full h-5 w-5 transition-transform duration-300 ${(preferences.sms_notifications as any)[option.key] ? 'translate-x-5' : 'translate-x-0'
                                                    }`} />
                                            </div>
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </div>
            </motion.div>

            {/* General Settings */}
            <motion.div
                variants={itemVariants}
                className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700"
            >
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                        <Bell size={20} className="text-purple-500" />
                        <div>
                            <h3 className="text-lg font-medium text-black dark:text-white">
                                General Settings
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Control notification timing and frequency
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    {/* Notification Frequency */}
                    <div>
                        <h4 className="font-medium text-black dark:text-white mb-3">Notification Frequency</h4>
                        <div className="space-y-2">
                            {[
                                { value: 'immediate', label: 'Immediate', description: 'Get notifications right away' },
                                { value: 'daily', label: 'Daily Digest', description: 'Once per day summary' },
                                { value: 'weekly', label: 'Weekly Summary', description: 'Once per week summary' }
                            ].map((option) => (
                                <label key={option.value} className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="frequency"
                                        value={option.value}
                                        checked={preferences.notification_frequency === option.value}
                                        onChange={(e) => setPreferences(prev => ({ ...prev, notification_frequency: e.target.value as any }))}
                                        className="w-4 h-4 text-gold focus:ring-gold border-gray-300"
                                    />
                                    <div>
                                        <span className="font-medium text-black dark:text-white">{option.label}</span>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">{option.description}</p>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Quiet Hours */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <h4 className="font-medium text-black dark:text-white">Quiet Hours</h4>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={preferences.quiet_hours.enabled}
                                    onChange={(e) => updatePreference('quiet_hours', 'enabled', e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className={`relative w-11 h-6 rounded-full transition-colors duration-300 ${preferences.quiet_hours.enabled ? 'bg-gold' : 'bg-gray-200 dark:bg-gray-700'
                                    }`}>
                                    <div className={`absolute top-0.5 left-0.5 bg-white rounded-full h-5 w-5 transition-transform duration-300 ${preferences.quiet_hours.enabled ? 'translate-x-5' : 'translate-x-0'
                                        }`} />
                                </div>
                            </label>
                        </div>

                        {preferences.quiet_hours.enabled && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="grid grid-cols-1 md:grid-cols-2 gap-4"
                            >
                                <div>
                                    <label className="block text-sm font-medium mb-2">Start Time</label>
                                    <input
                                        type="time"
                                        value={preferences.quiet_hours.start_time}
                                        onChange={(e) => updatePreference('quiet_hours', 'start_time', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-black rounded-lg focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">End Time</label>
                                    <input
                                        type="time"
                                        value={preferences.quiet_hours.end_time}
                                        onChange={(e) => updatePreference('quiet_hours', 'end_time', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-black rounded-lg focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
                                    />
                                </div>
                            </motion.div>
                        )}
                    </div>
                </div>
            </motion.div>

            {/* Save Button */}
            <motion.div variants={itemVariants} className="flex justify-end pt-6">
                <button
                    onClick={savePreferences}
                    disabled={isSaving}
                    className="flex items-center gap-2 bg-gold hover:bg-gold/90 text-black px-8 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSaving ? (
                        <Loader2 size={16} className="animate-spin" />
                    ) : (
                        <Check size={16} />
                    )}
                    {isSaving ? 'Saving...' : 'Save Preferences'}
                </button>
            </motion.div>

            {/* Footer Info */}
            <motion.div
                variants={itemVariants}
                className="text-center py-6 border-t border-gray-200 dark:border-gray-700"
            >
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                    You can update these preferences anytime. Some notifications are required for account security.
                </p>
                <p className="text-xs text-gray-400">
                    We respect your privacy and will never share your information with third parties.
                </p>
            </motion.div>
        </motion.div>
    );
}

// Loading Skeleton
function NotificationSettingsSkeleton() {
    return (
        <div className="space-y-8 animate-pulse">
            {/* Header Skeleton */}
            <div className="space-y-3">
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-96" />
            </div>

            {/* Category Skeletons */}
            {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                    {/* Header */}
                    <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded" />
                                <div className="space-y-2">
                                    <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-48" />
                                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-64" />
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20" />
                                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20" />
                            </div>
                        </div>
                    </div>

                    {/* Items */}
                    <div className="p-6 space-y-4">
                        {Array.from({ length: 4 }).map((_, j) => (
                            <div key={j} className="flex items-center justify-between">
                                <div className="flex items-center gap-3 flex-1">
                                    <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
                                    <div className="space-y-2 flex-1">
                                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32" />
                                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-48" />
                                    </div>
                                </div>
                                <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 rounded-full" />
                            </div>
                        ))}
                    </div>
                </div>
            ))}

            {/* Save Button Skeleton */}
            <div className="flex justify-end">
                <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded w-32" />
            </div>
        </div>
    );
}