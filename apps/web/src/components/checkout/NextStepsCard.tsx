// ✅ components/checkout/NextStepsCard.tsx
"use client";

import { motion } from "framer-motion";
import { Mail } from "lucide-react";

interface NextStepsCardProps {
    variants: any; // Framer motion variants
}

export function NextStepsCard({ variants }: NextStepsCardProps) {
    return (
        <motion.div
            variants={variants}
            className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6"
        >
            <h2 className="text-xl font-serif mb-4 flex items-center gap-2">
                <Mail size={20} className="text-blue-600 dark:text-blue-400" />
                What's Next?
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <NextStepItem
                    title="Order Confirmation Email"
                    description="You'll receive a confirmation email with your receipt and tracking information within 15 minutes."
                />
                <NextStepItem
                    title="Order Processing"
                    description="Your order will be processed within 1-2 business days. You'll receive tracking information once shipped."
                />
            </div>
        </motion.div>
    );
}

function NextStepItem({ title, description }: { title: string; description: string }) {
    return (
        <div>
            <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                {title}
            </h3>
            <p className="text-sm text-blue-700 dark:text-blue-300">
                {description}
            </p>
        </div>
    );
}