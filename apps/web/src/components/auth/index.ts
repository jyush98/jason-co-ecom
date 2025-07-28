// components/auth/index.ts - Clean exports for all auth components

// Main layout and background components
export { default as AuthLayout } from './AuthLayout';
export { default as AuthBackground } from './AuthBackground';

// Custom auth page components
export { default as CustomSignInPage } from './CustomSignInPage';
export { default as CustomSignUpPage } from './CustomSignUpPage';
export { default as PasswordResetPage } from './PasswordResetPage';
export { default as SSOCallback } from './SSOCallback';

// Specialized background exports
export {
    SignInBackground,
    SignUpBackground,
    PasswordResetBackground
} from './AuthBackground';

// Type exports (if you have any custom types)
export type AuthLayoutProps = {
    children: React.ReactNode;
    title: string;
    subtitle: string;
    showBackButton?: boolean;
    backHref?: string;
};

export type AuthBackgroundProps = {
    children: React.ReactNode;
    variant?: 'luxury' | 'minimal' | 'jewelry' | 'gradient';
    showPattern?: boolean;
    animated?: boolean;
    className?: string;
};