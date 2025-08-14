// Navigation Component Exports
// Account and user navigation components

export { default as AccountDropdown } from './AccountDropdown';

// Navigation constants
export const ACCOUNT_MENU_ITEMS = [
    { href: '/account', label: 'Dashboard' },
    { href: '/account/orders', label: 'Orders' },
    { href: '/account/wishlist', label: 'Wishlist' },
    { href: '/account/profile', label: 'Profile' },
] as const;

// Account dropdown types
export interface AccountMenuItem {
    href: string;
    label: string;
    icon?: React.ReactNode;
    description?: string;
}

export interface AccountDropdownProps {
    className?: string;
}