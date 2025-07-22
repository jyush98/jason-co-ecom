// ✅ components/checkout/PaymentInfoCard.tsx
"use client";

import { CreditCard, Check, AlertCircle } from "lucide-react";
import { getOrderStatusColor } from "@/utils";

interface PaymentInfoCardProps {
    paymentMethod: string;
    status: 'completed' | 'pending' | 'failed';
    lastFour?: string;
    brand?: string;
}

export function PaymentInfoCard({
    paymentMethod,
    status,
    lastFour,
    brand
}: PaymentInfoCardProps) {
    const getStatusIcon = () => {
        switch (status) {
            case 'completed':
                return <Check size={16} className="text-green-600" />;
            case 'pending':
                return <AlertCircle size={16} className="text-yellow-600" />;
            case 'failed':
                return <AlertCircle size={16} className="text-red-600" />;
            default:
                return <CreditCard size={16} className="text-gray-600" />;
        }
    };

    const getStatusText = () => {
        switch (status) {
            case 'completed':
                return 'Payment processed successfully';
            case 'pending':
                return 'Payment is being processed';
            case 'failed':
                return 'Payment failed';
            default:
                return 'Payment status unknown';
        }
    };

    return (
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
            <h2 className="text-xl font-serif mb-4 flex items-center gap-2">
                <CreditCard size={20} className="text-gold" />
                Payment Information
            </h2>

            <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
                    <CreditCard size={16} className="text-gray-600" />
                </div>
                <div className="flex-1">
                    <p className="font-medium">
                        {brand && brand.charAt(0).toUpperCase() + brand.slice(1)}
                        {lastFour && ` ending in ${lastFour}`}
                    </p>
                    <div className="flex items-center gap-2">
                        {getStatusIcon()}
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            {getStatusText()}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

