"use client";

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useUser, useClerk } from '@clerk/nextjs';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User,
    ShoppingBag,
    Heart,
    Settings,
    LogOut,
    ChevronDown,
    Package,
} from 'lucide-react';

interface AccountMenuItem {
    href: string;
    label: string;
    icon: React.ReactNode;
    description?: string;
}

export default function AccountDropdown() {
    const { user, isSignedIn } = useUser();
    const { signOut } = useClerk();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Account menu items
    const accountMenuItems: AccountMenuItem[] = [
        {
            href: '/account',
            label: 'Dashboard',
            icon: <User size={16} />,
            description: 'Account overview and settings'
        },
        {
            href: '/account/orders',
            label: 'Orders',
            icon: <Package size={16} />,
            description: 'View your order history'
        },
        {
            href: '/account/wishlist',
            label: 'Wishlist',
            icon: <Heart size={16} />,
            description: 'Your saved items'
        },
        {
            href: '/account/profile',
            label: 'Profile',
            icon: <Settings size={16} />,
            description: 'Personal information and preferences'
        },
    ];

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSignOut = async () => {
        setIsOpen(false);
        await signOut();
    };

    if (!isSignedIn || !user) return null;

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Account Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
                aria-expanded={isOpen}
                aria-haspopup="true"
            >
                {/* User Avatar */}
                <div className="w-8 h-8 bg-gradient-to-br from-gold/20 to-gold/40 dark:from-gold/30 dark:to-gold/50 rounded-full flex items-center justify-center overflow-hidden">
                    {user.imageUrl ? (
                        <img
                            src={user.imageUrl}
                            alt={user.firstName || 'User'}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <User size={16} className="text-gold" />
                    )}
                </div>

                {/* User Name (hidden on mobile) */}
                <span className="hidden sm:block max-w-24 truncate">
                    {user.firstName || user.emailAddresses[0]?.emailAddress?.split('@')[0] || 'Account'}
                </span>

                {/* Dropdown Arrow */}
                <ChevronDown
                    size={16}
                    className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>

            {/* Dropdown Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-50"
                    >
                        {/* User Info Header */}
                        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-gradient-to-br from-gold/20 to-gold/40 dark:from-gold/30 dark:to-gold/50 rounded-full flex items-center justify-center overflow-hidden">
                                    {user.imageUrl ? (
                                        <img
                                            src={user.imageUrl}
                                            alt={user.firstName || 'User'}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <User size={20} className="text-gold" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                        {user.firstName && user.lastName
                                            ? `${user.firstName} ${user.lastName}`
                                            : user.firstName || 'Account'}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                        {user.emailAddresses[0]?.emailAddress}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Menu Items */}
                        <div className="py-2">
                            {accountMenuItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setIsOpen(false)}
                                    className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                >
                                    <div className="flex-shrink-0 text-gray-400 dark:text-gray-500">
                                        {item.icon}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium">{item.label}</p>
                                        {item.description && (
                                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                                {item.description}
                                            </p>
                                        )}
                                    </div>
                                </Link>
                            ))}
                        </div>

                        {/* Sign Out */}
                        <div className="border-t border-gray-100 dark:border-gray-700 py-2">
                            <button
                                onClick={handleSignOut}
                                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            >
                                <LogOut size={16} />
                                <span className="font-medium">Sign Out</span>
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}