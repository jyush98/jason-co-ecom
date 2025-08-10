export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: '404 - Page Not Found | Jason & Co.',
    description: 'The page you are looking for could not be found. Return to Jason & Co. to explore our luxury jewelry collection.',
    robots: 'noindex, follow',
};

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center px-4">
            <div className="max-w-lg mx-auto text-center">
                <div className="mb-8">
                    <h1 className="text-9xl font-bold text-gray-200 dark:text-gray-800">
                        404
                    </h1>
                    <div className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                        Page Not Found
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-8">
                        The page you're looking for doesn't exist or has been moved.
                    </p>
                </div>

                <div className="space-y-4">
                    <Link
                        href="/"
                        className="inline-block bg-black dark:bg-white text-white dark:text-black px-8 py-3 rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors duration-200"
                    >
                        Return Home
                    </Link>

                    <div className="flex justify-center space-x-4 text-sm">
                        <Link
                            href="/products"
                            className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors"
                        >
                            Browse Jewelry
                        </Link>
                        <span className="text-gray-400">•</span>
                        <Link
                            href="/contact"
                            className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors"
                        >
                            Contact Us
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}