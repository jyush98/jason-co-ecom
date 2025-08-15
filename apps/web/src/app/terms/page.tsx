import { businessInfo, EMAIL_ADDRESSES, formatAddress } from '@/config/businessInfo';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: `Terms of Service | ${businessInfo.company.name}`,
    description: `Terms of service for ${businessInfo.company.name} luxury jewelry platform.`,
    robots: {
        index: false,
        follow: true,
    },
};

export default function TermsOfServicePage() {
    return (
        <div className="min-h-screen bg-white dark:bg-gray-900 pt-[var(--navbar-height)]">
            {/* Header */}
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 dark:from-gray-800 dark:to-gray-900">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <h1 className="text-4xl font-bold text-white mb-4">Terms of Service</h1>
                    <p className="text-xl text-gray-300">
                        These terms govern your use of our website and services.
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
                    <h2>Acceptance of Terms</h2>
                    <p>
                        By accessing and using this website, you accept and agree to be bound by the terms
                        and provision of this agreement. If you do not agree to abide by the above, please
                        do not use this service.
                    </p>

                    <h2>About {businessInfo.company.name}</h2>
                    <p>
                        {businessInfo.company.name} is operated by {businessInfo.legal.businessName}, a luxury jewelry
                        company dedicated to creating exceptional pieces where ambition meets artistry. Our services
                        include custom jewelry design, luxury jewelry sales, and personalized consultation services.
                    </p>

                    <h2>Use License</h2>
                    <p>
                        Permission is granted to temporarily download one copy of the materials on {businessInfo.company.name}'s
                        website for personal, non-commercial transitory viewing only. This is the grant of a
                        license, not a transfer of title, and under this license you may not:
                    </p>
                    <ul>
                        <li>Modify or copy the materials</li>
                        <li>Use the materials for any commercial purpose or for any public display</li>
                        <li>Attempt to reverse engineer any software contained on the website</li>
                        <li>Remove any copyright or other proprietary notations from the materials</li>
                    </ul>

                    <h2>Product Information</h2>
                    <p>
                        We strive to ensure that all information on our website is accurate and up-to-date.
                        However, we do not warrant that product descriptions or other content is accurate,
                        complete, reliable, current, or error-free. All jewelry pieces are photographed under
                        professional lighting conditions and actual appearance may vary slightly.
                    </p>

                    <h2>Pricing and Availability</h2>
                    <p>
                        All prices are subject to change without notice. We reserve the right to refuse
                        or cancel any order for any reason at any time. In the event of a pricing error,
                        we reserve the right to cancel the order and refund any payment received. Custom
                        jewelry pricing is provided through individual consultation and quotes.
                    </p>

                    <h2>Payment Terms</h2>
                    <p>
                        Payment is due at the time of purchase unless otherwise arranged. We accept major
                        credit cards and other payment methods as indicated during checkout. All transactions
                        are processed securely through our payment providers. For custom orders exceeding
                        $10,000, payment plans may be available upon approval.
                    </p>

                    <h2>Shipping and Delivery</h2>
                    <p>
                        We will make every effort to ship your order within the timeframe specified.
                        Delivery times are estimates and not guaranteed. All jewelry shipments are fully
                        insured and require signature confirmation. Risk of loss and title for items pass
                        to you upon delivery to the shipping carrier.
                    </p>

                    <h2>Returns and Exchanges</h2>
                    <p>
                        We want you to be completely satisfied with your purchase. Please refer to our{' '}
                        <a href="/returns" className="text-[#D4AF37] hover:text-[#FFD700] transition-colors">
                            Returns Policy
                        </a>{' '}
                        for detailed information about returns, exchanges, and refunds. All returns must
                        be authorized in advance by contacting{' '}
                        <a href={`mailto:${EMAIL_ADDRESSES.RETURNS}`} className="text-[#D4AF37] hover:text-[#FFD700] transition-colors">
                            {EMAIL_ADDRESSES.RETURNS}
                        </a>.
                    </p>

                    <h2>Custom Orders</h2>
                    <p>
                        Custom jewelry orders are subject to additional terms and conditions. Custom
                        pieces typically cannot be returned or exchanged unless there is a manufacturing
                        defect or the piece does not meet the agreed specifications. Full payment may be
                        required before production begins. Contact our custom design team at{' '}
                        <a href={`mailto:${EMAIL_ADDRESSES.CUSTOM}`} className="text-[#D4AF37] hover:text-[#FFD700] transition-colors">
                            {EMAIL_ADDRESSES.CUSTOM}
                        </a>{' '}
                        for detailed terms and timeline estimates.
                    </p>

                    <h2>Privacy and Data Protection</h2>
                    <p>
                        Your privacy is important to us. Please review our{' '}
                        <a href="/privacy" className="text-[#D4AF37] hover:text-[#FFD700] transition-colors">
                            Privacy Policy
                        </a>{' '}
                        to understand how we collect, use, and protect your personal information. We implement
                        industry-standard security measures to protect your data and payment information.
                    </p>

                    <h2>Intellectual Property</h2>
                    <p>
                        All content on this website, including but not limited to text, graphics, logos,
                        images, and jewelry designs, is the property of {businessInfo.company.name} and is
                        protected by copyright and other intellectual property laws. Custom designs created
                        for customers remain the intellectual property of {businessInfo.company.name} unless
                        otherwise agreed in writing.
                    </p>

                    <h2>Limitation of Liability</h2>
                    <p>
                        In no event shall {businessInfo.company.name} or its suppliers be liable for any damages
                        (including, without limitation, damages for loss of data or profit, or due to
                        business interruption) arising out of the use or inability to use the materials
                        on this website, even if authorized representatives have been notified orally or
                        in writing of the possibility of such damage.
                    </p>

                    <h2>Governing Law</h2>
                    <p>
                        These terms and conditions are governed by and construed in accordance with the laws
                        of the State of {businessInfo.locations.headquarters.address.state} and you irrevocably
                        submit to the exclusive jurisdiction of the courts in that state or location.
                    </p>

                    <h2>Changes to Terms</h2>
                    <p>
                        We reserve the right to modify these terms at any time. Changes will be effective
                        immediately upon posting on this website. Your continued use of the website after
                        any changes constitutes acceptance of the new terms.
                    </p>

                    <h2>Contact Information</h2>
                    <p>
                        Questions about the Terms of Service should be sent to us at:
                    </p>
                    <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg mt-6">
                        <p className="font-semibold text-gray-900 dark:text-white">{businessInfo.legal.businessName}</p>
                        <p className="text-gray-700 dark:text-gray-300">
                            Email: <a href={`mailto:${EMAIL_ADDRESSES.LEGAL}`} className="text-[#D4AF37] hover:text-[#FFD700] transition-colors">{EMAIL_ADDRESSES.LEGAL}</a>
                        </p>
                        <p className="text-gray-700 dark:text-gray-300">
                            Phone: <a href={`tel:${businessInfo.contact.primary.phone.replace(/\D/g, '')}`} className="text-[#D4AF37] hover:text-[#FFD700] transition-colors">{businessInfo.contact.primary.phone}</a>
                        </p>
                        <p className="text-gray-700 dark:text-gray-300">
                            Address: {formatAddress(businessInfo.locations.headquarters.address)}
                        </p>
                        <p className="text-gray-700 dark:text-gray-300">
                            Business Hours: {businessInfo.locations.headquarters.hours.monday} - {businessInfo.locations.headquarters.hours.friday}
                        </p>
                    </div>

                    <div className="bg-[#D4AF37]/5 border border-[#D4AF37]/20 rounded-lg p-6 mt-8">
                        <h3 className="text-lg font-semibold text-[#D4AF37] mb-2">
                            Questions About Our Terms?
                        </h3>
                        <p className="text-gray-700 dark:text-gray-300">
                            Our legal team is available to clarify any questions about these terms.
                            For immediate assistance, contact our customer support team at{' '}
                            <a href={`mailto:${EMAIL_ADDRESSES.SUPPORT}`} className="text-[#D4AF37] hover:text-[#FFD700] transition-colors">
                                {EMAIL_ADDRESSES.SUPPORT}
                            </a>{' '}
                            or call{' '}
                            <a href={`tel:${businessInfo.contact.primary.phone.replace(/\D/g, '')}`} className="text-[#D4AF37] hover:text-[#FFD700] transition-colors">
                                {businessInfo.contact.primary.phone}
                            </a>.
                        </p>
                    </div>

                    <div className="border-t border-gray-200 dark:border-gray-700 pt-8 mt-12">
                        <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                            © {new Date().getFullYear()} {businessInfo.legal.businessName}. All rights reserved. |
                            Business Registration: {businessInfo.legal.registrationNumber}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}