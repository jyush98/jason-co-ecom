import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Returns & Exchanges | Jason & Co.',
    description: 'Returns and exchange policy for Jason & Co. luxury jewelry.',
    robots: {
        index: false,
        follow: true,
    },
};

export default function ReturnsPage() {
    return (
        <div className="min-h-screen bg-white dark:bg-gray-900 pt-[var(--navbar-height)]">
            {/* Header */}
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 dark:from-gray-800 dark:to-gray-900">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <h1 className="text-4xl font-bold text-white mb-4">Returns & Exchanges</h1>
                    <p className="text-xl text-gray-300">
                        Your satisfaction is our priority. Learn about our return and exchange process.
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
                    <h2>Our Return Policy</h2>
                    <p>
                        We want you to love your Jason & Co. jewelry. If you're not completely satisfied
                        with your purchase, we offer a comprehensive return and exchange policy to ensure
                        your complete satisfaction.
                    </p>

                    <h2>Return Timeframe</h2>
                    <p>
                        You may return most items within <strong>30 days</strong> of delivery for a full refund
                        or exchange. The item must be in its original condition, unworn, and in the original
                        packaging with all tags and certificates.
                    </p>

                    <h2>Eligible Items</h2>
                    <p>The following items are eligible for return:</p>
                    <ul>
                        <li>Unworn jewelry in original condition</li>
                        <li>Items with original packaging and certificates</li>
                        <li>Non-custom, non-personalized pieces</li>
                        <li>Items purchased at full price or during promotions</li>
                    </ul>

                    <h2>Non-Returnable Items</h2>
                    <p>The following items cannot be returned:</p>
                    <ul>
                        <li>Custom or personalized jewelry pieces</li>
                        <li>Engraved items (unless due to our error)</li>
                        <li>Items worn or showing signs of wear</li>
                        <li>Earrings (for hygiene reasons)</li>
                        <li>Sale items marked as "final sale"</li>
                    </ul>

                    <h2>How to Return an Item</h2>
                    <div className="bg-gold/5 border border-gold/20 rounded-lg p-6 my-6">
                        <h3 className="text-lg font-semibold text-gold mb-4">Step-by-Step Return Process</h3>
                        <ol>
                            <li><strong>Contact Us:</strong> Email returns@jasonandco.com or call (555) 123-4567</li>
                            <li><strong>Receive Authorization:</strong> We'll provide a return authorization number</li>
                            <li><strong>Package Securely:</strong> Include all original packaging and documentation</li>
                            <li><strong>Ship Safely:</strong> Use our prepaid return label for insured shipping</li>
                            <li><strong>Track Return:</strong> Monitor your return status online</li>
                        </ol>
                    </div>

                    <h2>Exchanges</h2>
                    <p>
                        We're happy to exchange your item for a different size, style, or color subject
                        to availability. Exchanges follow the same return process, and we'll ship your
                        new item once we receive the original.
                    </p>

                    <h2>Refund Processing</h2>
                    <p>
                        Once we receive and inspect your return, we'll process your refund within
                        <strong> 5-7 business days</strong>. Refunds will be credited to your original
                        payment method. Shipping costs are non-refundable unless the return is due to our error.
                    </p>

                    <h2>Custom Orders</h2>
                    <p>
                        Custom and personalized jewelry orders are generally non-returnable. However,
                        if there's a manufacturing defect or the item doesn't match your specifications,
                        we'll work with you to make it right.
                    </p>

                    <h2>Damaged or Defective Items</h2>
                    <p>
                        If you receive a damaged or defective item, please contact us immediately.
                        We'll provide a replacement or full refund, including shipping costs, and
                        arrange for return of the defective item.
                    </p>

                    <h2>International Returns</h2>
                    <p>
                        International customers are responsible for return shipping costs unless the
                        return is due to our error. Additional customs fees may apply and are the
                        customer's responsibility.
                    </p>

                    <h2>Contact Our Returns Team</h2>
                    <p>
                        Have questions about returning an item? Our customer service team is here to help:
                    </p>
                    <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg mt-6">
                        <p className="font-semibold">Returns Department</p>
                        <p>Email: returns@jasonandco.com</p>
                        {/* <p>Phone: (555) 123-4567</p> */}
                        <p>Hours: Monday-Friday, 9 AM - 6 PM EST</p>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mt-8">
                        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
                            Need Help Choosing?
                        </h3>
                        <p className="text-blue-800 dark:text-blue-200">
                            If you're unsure about size, style, or have any questions before purchasing,
                            our jewelry consultants are available to help you make the perfect choice.
                            Contact us for personalized assistance.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}