"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Shield,
    Palette,
    Globe,
    Download,
    Trash2,
    Eye,
    EyeOff,
    Smartphone,
    Monitor,
    Moon,
    Sun,
    Lock,
    Link2,
    AlertTriangle,
    Check,
    Settings,
    Loader2
} from "lucide-react";
import { useAuth, useUser } from "@clerk/nextjs";
import { useTheme } from "next-themes";

interface AccountSettingsProps {
    className?: string;
}

interface SecuritySettings {
    twoFactorEnabled: boolean;
    loginNotifications: boolean;
    deviceTracking: boolean;
    sessionTimeout: number;
}

interface PrivacySettings {
    dataCollection: boolean;
    marketingEmails: boolean;
    personalizedAds: boolean;
    publicProfile: boolean;
}

interface ConnectedAccount {
    id: string;
    provider: string;
    email: string;
    connectedAt: string;
    isDefault: boolean;
}

export default function AccountSettings({ className = "" }: AccountSettingsProps) {
    const { user } = useUser();
    const { getToken } = useAuth();
    const { theme, setTheme, systemTheme } = useTheme();

    // State for all settings
    const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
        twoFactorEnabled: false,
        loginNotifications: true,
        deviceTracking: true,
        sessionTimeout: 30
    });

    const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({
        dataCollection: true,
        marketingEmails: true,
        personalizedAds: false,
        publicProfile: false
    });

    const [connectedAccounts, setConnectedAccounts] = useState<ConnectedAccount[]>([]);
    const [language, setLanguage] = useState('en-US');
    const [currency, setCurrency] = useState('USD');
    const [timezone, setTimezone] = useState('America/New_York');

    // Loading states
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [dataExportLoading, setDataExportLoading] = useState(false);

    // Success/error states
    const [saveMessage, setSaveMessage] = useState<string>('');
    const [error, setError] = useState<string>('');

    // Load settings on component mount
    useEffect(() => {
        loadUserSettings();
    }, []);

    const loadUserSettings = async () => {
        setIsLoading(true);
        try {
            const token = await getToken();

            // Load user preferences from API
            const response = await fetch('/api/account/settings', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const settings = await response.json();
                setSecuritySettings(settings.security || securitySettings);
                setPrivacySettings(settings.privacy || privacySettings);
                setLanguage(settings.language || 'en-US');
                setCurrency(settings.currency || 'USD');
                setTimezone(settings.timezone || 'America/New_York');
            }
        } catch (error) {
            console.error('Failed to load settings:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const saveSettings = async () => {
        setIsSaving(true);
        setError('');

        try {
            const token = await getToken();

            const response = await fetch('/api/account/settings', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    security: securitySettings,
                    privacy: privacySettings,
                    language,
                    currency,
                    timezone
                }),
            });

            if (response.ok) {
                setSaveMessage('Settings saved successfully');
                setTimeout(() => setSaveMessage(''), 3000);
            } else {
                throw new Error('Failed to save settings');
            }
        } catch (error) {
            setError('Failed to save settings. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDataExport = async () => {
        setDataExportLoading(true);
        try {
            const token = await getToken();

            const response = await fetch('/api/account/export-data', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = url;
                a.download = `jasonco-account-data-${Date.now()}.json`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);

                setSaveMessage('Data export downloaded successfully');
                setTimeout(() => setSaveMessage(''), 3000);
            }
        } catch (error) {
            setError('Failed to export data. Please try again.');
        } finally {
            setDataExportLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        // This would integrate with Clerk's user deletion
        try {
            if (user) {
                await user.delete();
                // Redirect to home page or logout
                window.location.href = '/';
            }
        } catch (error) {
            setError('Failed to delete account. Please contact support.');
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const sectionVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 size={32} className="animate-spin text-gold" />
                <span className="ml-3 text-gray-600 dark:text-gray-400">Loading settings...</span>
            </div>
        );
    }

    return (
        <motion.div
            className={`space-y-8 ${className}`}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {/* Success/Error Messages */}
            <AnimatePresence>
                {saveMessage && (
                    <motion.div
                        className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                    >
                        <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                            <Check size={16} />
                            <span className="text-sm">{saveMessage}</span>
                        </div>
                    </motion.div>
                )}

                {error && (
                    <motion.div
                        className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                    >
                        <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                            <AlertTriangle size={16} />
                            <span className="text-sm">{error}</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Theme & Appearance */}
            <motion.section
                variants={sectionVariants}
                className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6"
            >
                <h3 className="text-lg font-serif mb-6 flex items-center gap-2">
                    <Palette size={20} className="text-gold" />
                    Theme & Appearance
                </h3>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-3">Theme Preference</label>
                        <div className="grid grid-cols-3 gap-3">
                            {[
                                { value: 'light', label: 'Light', icon: Sun },
                                { value: 'dark', label: 'Dark', icon: Moon },
                                { value: 'system', label: 'System', icon: Monitor }
                            ].map(({ value, label, icon: Icon }) => (
                                <button
                                    key={value}
                                    onClick={() => setTheme(value)}
                                    className={`p-4 border rounded-lg flex flex-col items-center gap-2 transition-all duration-200 ${theme === value
                                            ? 'border-gold bg-gold/5 text-gold'
                                            : 'border-gray-300 dark:border-gray-600 hover:border-gold/50'
                                        }`}
                                >
                                    <Icon size={20} />
                                    <span className="text-sm">{label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </motion.section>

            {/* Security Settings */}
            <motion.section
                variants={sectionVariants}
                className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6"
            >
                <h3 className="text-lg font-serif mb-6 flex items-center gap-2">
                    <Shield size={20} className="text-gold" />
                    Security & Privacy
                </h3>

                <div className="space-y-6">
                    {/* Two-Factor Authentication */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="font-medium">Two-Factor Authentication</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Add an extra layer of security to your account
                            </p>
                        </div>
                        <button
                            onClick={() => setSecuritySettings(prev => ({
                                ...prev,
                                twoFactorEnabled: !prev.twoFactorEnabled
                            }))}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${securitySettings.twoFactorEnabled ? 'bg-gold' : 'bg-gray-300 dark:bg-gray-600'
                                }`}
                        >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${securitySettings.twoFactorEnabled ? 'translate-x-6' : 'translate-x-1'
                                }`} />
                        </button>
                    </div>

                    {/* Login Notifications */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="font-medium">Login Notifications</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Get notified of new sign-ins to your account
                            </p>
                        </div>
                        <button
                            onClick={() => setSecuritySettings(prev => ({
                                ...prev,
                                loginNotifications: !prev.loginNotifications
                            }))}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${securitySettings.loginNotifications ? 'bg-gold' : 'bg-gray-300 dark:bg-gray-600'
                                }`}
                        >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${securitySettings.loginNotifications ? 'translate-x-6' : 'translate-x-1'
                                }`} />
                        </button>
                    </div>

                    {/* Session Timeout */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Session Timeout</label>
                        <select
                            value={securitySettings.sessionTimeout}
                            onChange={(e) => setSecuritySettings(prev => ({
                                ...prev,
                                sessionTimeout: parseInt(e.target.value)
                            }))}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-black rounded-lg focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
                        >
                            <option value={15}>15 minutes</option>
                            <option value={30}>30 minutes</option>
                            <option value={60}>1 hour</option>
                            <option value={240}>4 hours</option>
                            <option value={480}>8 hours</option>
                        </select>
                    </div>
                </div>
            </motion.section>

            {/* Language & Region */}
            <motion.section
                variants={sectionVariants}
                className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6"
            >
                <h3 className="text-lg font-serif mb-6 flex items-center gap-2">
                    <Globe size={20} className="text-gold" />
                    Language & Region
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">Language</label>
                        <select
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-black rounded-lg focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
                        >
                            <option value="en-US">English (US)</option>
                            <option value="en-GB">English (UK)</option>
                            <option value="es-ES">Español</option>
                            <option value="fr-FR">Français</option>
                            <option value="de-DE">Deutsch</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Currency</label>
                        <select
                            value={currency}
                            onChange={(e) => setCurrency(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-black rounded-lg focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
                        >
                            <option value="USD">USD ($)</option>
                            <option value="EUR">EUR (€)</option>
                            <option value="GBP">GBP (£)</option>
                            <option value="CAD">CAD ($)</option>
                            <option value="AUD">AUD ($)</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Timezone</label>
                        <select
                            value={timezone}
                            onChange={(e) => setTimezone(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-black rounded-lg focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
                        >
                            <option value="America/New_York">Eastern Time</option>
                            <option value="America/Chicago">Central Time</option>
                            <option value="America/Denver">Mountain Time</option>
                            <option value="America/Los_Angeles">Pacific Time</option>
                            <option value="UTC">UTC</option>
                        </select>
                    </div>
                </div>
            </motion.section>

            {/* Privacy Controls */}
            <motion.section
                variants={sectionVariants}
                className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6"
            >
                <h3 className="text-lg font-serif mb-6 flex items-center gap-2">
                    <Eye size={20} className="text-gold" />
                    Privacy Controls
                </h3>

                <div className="space-y-4">
                    {[
                        {
                            key: 'dataCollection',
                            title: 'Analytics & Data Collection',
                            description: 'Help us improve by sharing anonymous usage data'
                        },
                        {
                            key: 'marketingEmails',
                            title: 'Marketing Communications',
                            description: 'Receive emails about new products and special offers'
                        },
                        {
                            key: 'personalizedAds',
                            title: 'Personalized Advertising',
                            description: 'Show ads based on your browsing and purchase history'
                        },
                        {
                            key: 'publicProfile',
                            title: 'Public Profile',
                            description: 'Allow others to see your public wishlist and reviews'
                        }
                    ].map(({ key, title, description }) => (
                        <div key={key} className="flex items-center justify-between">
                            <div>
                                <h4 className="font-medium">{title}</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
                            </div>
                            <button
                                onClick={() => setPrivacySettings(prev => ({
                                    ...prev,
                                    [key]: !prev[key as keyof PrivacySettings]
                                }))}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${privacySettings[key as keyof PrivacySettings] ? 'bg-gold' : 'bg-gray-300 dark:bg-gray-600'
                                    }`}
                            >
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${privacySettings[key as keyof PrivacySettings] ? 'translate-x-6' : 'translate-x-1'
                                    }`} />
                            </button>
                        </div>
                    ))}
                </div>
            </motion.section>

            {/* Data Management */}
            <motion.section
                variants={sectionVariants}
                className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6"
            >
                <h3 className="text-lg font-serif mb-6 flex items-center gap-2">
                    <Download size={20} className="text-gold" />
                    Data Management
                </h3>

                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border border-gray-300 dark:border-gray-600 rounded-lg">
                        <div>
                            <h4 className="font-medium">Export Your Data</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Download a copy of your account data and order history
                            </p>
                        </div>
                        <button
                            onClick={handleDataExport}
                            disabled={dataExportLoading}
                            className="px-4 py-2 bg-gold hover:bg-gold/90 text-black font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {dataExportLoading ? (
                                <div className="flex items-center gap-2">
                                    <Loader2 size={16} className="animate-spin" />
                                    Exporting...
                                </div>
                            ) : (
                                'Export Data'
                            )}
                        </button>
                    </div>
                </div>
            </motion.section>

            {/* Danger Zone */}
            <motion.section
                variants={sectionVariants}
                className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6"
            >
                <h3 className="text-lg font-serif mb-6 flex items-center gap-2 text-red-600 dark:text-red-400">
                    <AlertTriangle size={20} />
                    Danger Zone
                </h3>

                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border border-red-300 dark:border-red-600 rounded-lg">
                        <div>
                            <h4 className="font-medium text-red-600 dark:text-red-400">Delete Account</h4>
                            <p className="text-sm text-red-500 dark:text-red-400">
                                Permanently delete your account and all associated data. This action cannot be undone.
                            </p>
                        </div>
                        <button
                            onClick={() => setShowDeleteConfirm(true)}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
                        >
                            Delete Account
                        </button>
                    </div>
                </div>
            </motion.section>

            {/* Save Settings Button */}
            <div className="flex justify-end pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                    onClick={saveSettings}
                    disabled={isSaving}
                    className="px-8 py-3 bg-gold hover:bg-gold/90 text-black font-medium rounded-lg transition-all duration-300 hover:scale-[1.02] tracking-widest uppercase text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                    {isSaving ? (
                        <div className="flex items-center gap-2">
                            <Loader2 size={16} className="animate-spin" />
                            Saving...
                        </div>
                    ) : (
                        'Save Settings'
                    )}
                </button>
            </div>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {showDeleteConfirm && (
                    <motion.div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowDeleteConfirm(false)}
                    >
                        <motion.div
                            className="bg-white dark:bg-black p-6 rounded-lg max-w-md mx-4 border border-red-200 dark:border-red-800"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <AlertTriangle size={24} className="text-red-600" />
                                <h3 className="text-lg font-serif">Delete Account</h3>
                            </div>

                            <p className="text-gray-600 dark:text-gray-400 mb-6">
                                Are you sure you want to delete your account? This action cannot be undone and will permanently remove:
                            </p>

                            <ul className="text-sm text-gray-600 dark:text-gray-400 mb-6 ml-4 space-y-1">
                                <li>• Your profile and account information</li>
                                <li>• Order history and tracking data</li>
                                <li>• Wishlist and saved items</li>
                                <li>• Address book and preferences</li>
                            </ul>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowDeleteConfirm(false)}
                                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDeleteAccount}
                                    className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                                >
                                    Delete Account
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}