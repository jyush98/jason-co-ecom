import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Privacy Policy | Jason & Co.',
    description: 'Privacy policy for Jason & Co. luxury jewelry platform.',
    robots: {
        index: false, // Don't index legal pages typically
        follow: true,
    },
};

export default function PrivacyPolicyPage() {
    return (
        <div className="min-h-screen bg-white dark:bg-gray-900 pt-[var(--navbar-height)]">
            {/* Header */}
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 dark:from-gray-800 dark:to-gray-900">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <h1 className="text-4xl font-bold text-white mb-4">Privacy Policy</h1>
                    <p className="text-xl text-gray-300">
                        Your privacy is important to us. This policy explains how we collect, use, and protect your information.
                    </p>
                    <p className="text-sm text-gray-400 mt-4">
                        Last updated: {new Date().toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}
                    </p>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="prose prose-lg dark:prose-invert max-w-none">
                    <h2>Information We Collect</h2>
                    <p>
                        We collect information you provide directly to us, such as when you create an account,
                        make a purchase, or contact us for support. This may include:
                    </p>
                    <ul>
                        <li>Name and contact information</li>
                        <li>Payment and billing information</li>
                        <li>Shipping addresses</li>
                        <li>Account credentials</li>
                        <li>Communication preferences</li>
                    </ul>

                    <h2>How We Use Your Information</h2>
                    <p>We use the information we collect to:</p>
                    <ul>
                        <li>Process and fulfill your orders</li>
                        <li>Communicate with you about your purchases</li>
                        <li>Provide customer support</li>
                        <li>Send you marketing communications (with your consent)</li>
                        <li>Improve our products and services</li>
                        <li>Comply with legal obligations</li>
                    </ul>

                    <h2>Information Sharing</h2>
                    <p>
                        We do not sell, trade, or otherwise transfer your personal information to third parties
                        without your consent, except as described in this policy. We may share information with:
                    </p>
                    <ul>
                        <li>Service providers who assist in our operations</li>
                        <li>Payment processors for transaction processing</li>
                        <li>Shipping companies for order fulfillment</li>
                        <li>Legal authorities when required by law</li>
                    </ul>

                    <h2>Data Security</h2>
                    <p>
                        We implement appropriate security measures to protect your personal information against
                        unauthorized access, alteration, disclosure, or destruction. This includes:
                    </p>
                    <ul>
                        <li>Encryption of sensitive data</li>
                        <li>Secure payment processing</li>
                        <li>Regular security assessments</li>
                        <li>Access controls and monitoring</li>
                    </ul>

                    <h2>Your Rights</h2>
                    <p>You have the right to:</p>
                    <ul>
                        <li>Access and update your personal information</li>
                        <li>Request deletion of your data</li>
                        <li>Opt out of marketing communications</li>
                        <li>Request data portability</li>
                        <li>Lodge a complaint with supervisory authorities</li>
                    </ul>

                    <h2>Cookies and Tracking</h2>
                    <p>
                        We use cookies and similar technologies to enhance your browsing experience,
                        analyze site traffic, and provide personalized content. You can control cookie
                        settings through your browser preferences.
                    </p>

                    <h2>Contact Us</h2>
                    <p>
                        If you have questions about this Privacy Policy or our data practices,
                        please contact us at:
                    </p>
                    <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg mt-6">
                        <p className="font-semibold">Jason & Co.</p>
                        <p>Email: privacy@jasonandco.com</p>
                        {/* <p>Phone: (555) 123-4567</p> */}
                    </div>
                </div>
            </div>
        </div>
    );
}