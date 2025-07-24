"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth, useUser } from "@clerk/nextjs";
import {
    MapPin,
    Plus,
    Edit,
    Trash2,
    Star,
    Check,
    X,
    Home,
    Building,
    AlertCircle,
    Loader2
} from "lucide-react";

// Address interfaces
interface Address {
    id: number;
    label: string; // "Home", "Work", "Mom's House", etc.
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
    is_default: boolean;
    created_at: string;
    updated_at: string;
}

interface AddressFormData {
    label: string;
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
    is_default: boolean;
}

export default function AddressBook() {
    const { getToken } = useAuth();
    const { user } = useUser();
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string>('');
    const [showForm, setShowForm] = useState(false);
    const [editingAddress, setEditingAddress] = useState<Address | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form state
    const [formData, setFormData] = useState<AddressFormData>({
        label: '',
        first_name: user?.firstName || '',
        last_name: user?.lastName || '',
        company: '',
        address_line_1: '',
        address_line_2: '',
        city: '',
        state: '',
        postal_code: '',
        country: 'US',
        phone: '',
        is_default: false
    });

    // Fetch addresses on mount
    useEffect(() => {
        fetchAddresses();
    }, []);

    // Update form when user data changes
    useEffect(() => {
        if (user && !editingAddress) {
            setFormData(prev => ({
                ...prev,
                first_name: user.firstName || '',
                last_name: user.lastName || ''
            }));
        }
    }, [user, editingAddress]);

    const fetchAddresses = async () => {
        try {
            const token = await getToken();
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/account/addresses`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();
                setAddresses(data);
            } else {
                setError('Failed to load addresses');
            }
        } catch (error) {
            console.error('Failed to fetch addresses:', error);
            setError('Failed to load addresses');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        try {
            const token = await getToken();
            const url = editingAddress
                ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/account/addresses/${editingAddress.id}`
                : `${process.env.NEXT_PUBLIC_API_BASE_URL}/account/addresses`;

            const method = editingAddress ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                await fetchAddresses(); // Refresh the list
                resetForm();
                setShowForm(false);
                setEditingAddress(null);
            } else {
                const errorData = await response.json();
                setError(errorData.detail || 'Failed to save address');
            }
        } catch (error) {
            console.error('Failed to save address:', error);
            setError('Failed to save address');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEdit = (address: Address) => {
        setEditingAddress(address);
        setFormData({
            label: address.label,
            first_name: address.first_name,
            last_name: address.last_name,
            company: address.company || '',
            address_line_1: address.address_line_1,
            address_line_2: address.address_line_2 || '',
            city: address.city,
            state: address.state,
            postal_code: address.postal_code,
            country: address.country,
            phone: address.phone || '',
            is_default: address.is_default
        });
        setShowForm(true);
    };

    const handleDelete = async (addressId: number) => {
        if (!confirm('Are you sure you want to delete this address?')) return;

        try {
            const token = await getToken();
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/account/addresses/${addressId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                await fetchAddresses(); // Refresh the list
            } else {
                setError('Failed to delete address');
            }
        } catch (error) {
            console.error('Failed to delete address:', error);
            setError('Failed to delete address');
        }
    };

    const handleSetDefault = async (addressId: number) => {
        try {
            const token = await getToken();
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/account/addresses/${addressId}/set-default`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                await fetchAddresses(); // Refresh the list
            } else {
                setError('Failed to set default address');
            }
        } catch (error) {
            console.error('Failed to set default address:', error);
            setError('Failed to set default address');
        }
    };

    const resetForm = () => {
        setFormData({
            label: '',
            first_name: user?.firstName || '',
            last_name: user?.lastName || '',
            company: '',
            address_line_1: '',
            address_line_2: '',
            city: '',
            state: '',
            postal_code: '',
            country: 'US',
            phone: '',
            is_default: false
        });
        setError('');
    };

    const handleCancel = () => {
        setShowForm(false);
        setEditingAddress(null);
        resetForm();
    };

    const getAddressIcon = (label: string) => {
        switch (label.toLowerCase()) {
            case 'home':
                return <Home size={16} className="text-blue-500" />;
            case 'work':
            case 'office':
                return <Building size={16} className="text-green-500" />;
            default:
                return <MapPin size={16} className="text-gold" />;
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5, ease: "easeOut" },
        },
    };

    if (isLoading) {
        return <AddressBookSkeleton />;
    }

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
        >
            {/* Header */}
            <motion.div variants={itemVariants} className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-serif text-black dark:text-white mb-2">
                        Address Book
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        Manage your shipping and billing addresses
                    </p>
                </div>

                {!showForm && (
                    <button
                        onClick={() => setShowForm(true)}
                        className="flex items-center gap-2 bg-gold hover:bg-gold/90 text-black px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                        <Plus size={18} />
                        Add Address
                    </button>
                )}
            </motion.div>

            {/* Error Display */}
            <AnimatePresence>
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

            {/* Add/Edit Form */}
            <AnimatePresence>
                {showForm && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-700"
                    >
                        <h3 className="text-lg font-medium text-black dark:text-white mb-6">
                            {editingAddress ? 'Edit Address' : 'Add New Address'}
                        </h3>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Address Label */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Address Label *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.label}
                                        onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                                        placeholder="Home, Work, Mom's House, etc."
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-black rounded-lg focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
                                        required
                                    />
                                </div>

                                <div className="flex items-end">
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={formData.is_default}
                                            onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
                                            className="w-4 h-4 text-gold focus:ring-gold border-gray-300 rounded"
                                        />
                                        <span className="text-sm font-medium">Set as default address</span>
                                    </label>
                                </div>
                            </div>

                            {/* Name Fields */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        First Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.first_name}
                                        onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-black rounded-lg focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Last Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.last_name}
                                        onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-black rounded-lg focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Company (Optional) */}
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Company (Optional)
                                </label>
                                <input
                                    type="text"
                                    value={formData.company}
                                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-black rounded-lg focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
                                />
                            </div>

                            {/* Address Lines */}
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Street Address *
                                </label>
                                <input
                                    type="text"
                                    value={formData.address_line_1}
                                    onChange={(e) => setFormData({ ...formData, address_line_1: e.target.value })}
                                    placeholder="123 Main Street"
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-black rounded-lg focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Apartment, Suite, etc. (Optional)
                                </label>
                                <input
                                    type="text"
                                    value={formData.address_line_2}
                                    onChange={(e) => setFormData({ ...formData, address_line_2: e.target.value })}
                                    placeholder="Apt 4B, Suite 100, etc."
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-black rounded-lg focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
                                />
                            </div>

                            {/* City, State, ZIP */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        City *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.city}
                                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-black rounded-lg focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        State *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.state}
                                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                        placeholder="NY"
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-black rounded-lg focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        ZIP Code *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.postal_code}
                                        onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-black rounded-lg focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Phone (Optional) */}
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Phone Number (Optional)
                                </label>
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    placeholder="(555) 123-4567"
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-black rounded-lg focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
                                />
                            </div>

                            {/* Form Actions */}
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex items-center gap-2 bg-gold hover:bg-gold/90 text-black px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? (
                                        <Loader2 size={16} className="animate-spin" />
                                    ) : (
                                        <Check size={16} />
                                    )}
                                    {isSubmitting ? 'Saving...' : 'Save Address'}
                                </button>

                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    className="flex items-center gap-2 border border-gray-300 dark:border-gray-600 px-6 py-2 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                >
                                    <X size={16} />
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Address List */}
            <motion.div variants={itemVariants} className="space-y-4">
                {addresses.length > 0 ? (
                    addresses.map((address) => (
                        <div
                            key={address.id}
                            className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-700 hover:border-gold/40 transition-colors"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    {/* Address Header */}
                                    <div className="flex items-center gap-3 mb-3">
                                        {getAddressIcon(address.label)}
                                        <h3 className="font-medium text-black dark:text-white">
                                            {address.label}
                                        </h3>
                                        {address.is_default && (
                                            <span className="inline-flex items-center gap-1 bg-gold text-black text-xs font-medium px-2 py-1 rounded">
                                                <Star size={12} />
                                                Default
                                            </span>
                                        )}
                                    </div>

                                    {/* Address Details */}
                                    <div className="text-gray-600 dark:text-gray-400 space-y-1">
                                        <p className="font-medium text-black dark:text-white">
                                            {address.first_name} {address.last_name}
                                        </p>
                                        {address.company && (
                                            <p>{address.company}</p>
                                        )}
                                        <p>{address.address_line_1}</p>
                                        {address.address_line_2 && (
                                            <p>{address.address_line_2}</p>
                                        )}
                                        <p>
                                            {address.city}, {address.state} {address.postal_code}
                                        </p>
                                        {address.phone && (
                                            <p>{address.phone}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Address Actions */}
                                <div className="flex items-center gap-2 ml-4">
                                    {!address.is_default && (
                                        <button
                                            onClick={() => handleSetDefault(address.id)}
                                            className="p-2 text-gray-400 hover:text-gold transition-colors"
                                            title="Set as default"
                                        >
                                            <Star size={16} />
                                        </button>
                                    )}

                                    <button
                                        onClick={() => handleEdit(address)}
                                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                                        title="Edit address"
                                    >
                                        <Edit size={16} />
                                    </button>

                                    <button
                                        onClick={() => handleDelete(address.id)}
                                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                                        title="Delete address"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-12 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                        <MapPin size={48} className="mx-auto mb-4 text-gray-400" />
                        <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-2">
                            No addresses saved
                        </h3>
                        <p className="text-gray-500 dark:text-gray-500 mb-6">
                            Add an address to speed up future checkouts
                        </p>
                        <button
                            onClick={() => setShowForm(true)}
                            className="inline-flex items-center gap-2 bg-gold hover:bg-gold/90 text-black px-6 py-3 rounded-lg font-medium transition-colors"
                        >
                            <Plus size={18} />
                            Add Your First Address
                        </button>
                    </div>
                )}
            </motion.div>
        </motion.div>
    );
}

// Loading Skeleton
function AddressBookSkeleton() {
    return (
        <div className="space-y-6 animate-pulse">
            {/* Header Skeleton */}
            <div className="flex justify-between items-center">
                <div className="space-y-2">
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48" />
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-64" />
                </div>
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-32" />
            </div>

            {/* Address Cards Skeleton */}
            {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg" />
            ))}
        </div>
    );
}