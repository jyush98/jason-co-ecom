// ✅ components/checkout/DeliveryInfoCard.tsx
"use client";

import { Truck, MapPin, Calendar, Package } from "lucide-react";
import { formatAddressForDisplay } from "@/utils";
import { ShippingAddress } from "@/types/cart";

interface DeliveryInfoCardProps {
    shippingAddress: ShippingAddress;
    estimatedDelivery: { formatted: string } | null;
    shippingMethod: string;
    trackingNumber?: string;
}

export function DeliveryInfoCard({
    shippingAddress,
    estimatedDelivery,
    shippingMethod,
    trackingNumber
}: DeliveryInfoCardProps) {
    return (
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
            <h2 className="text-xl font-serif mb-4 flex items-center gap-2">
                <Truck size={20} className="text-gold" />
                Delivery Information
            </h2>

            <div className="space-y-4">
                <div className="flex items-start gap-3">
                    <MapPin size={16} className="text-gray-400 mt-1" />
                    <div>
                        <p className="font-medium">Shipping Address</p>
                        <div className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-line">
                            {formatAddressForDisplay(shippingAddress)}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Calendar size={16} className="text-gray-400" />
                    <div>
                        <p className="font-medium">Estimated Delivery</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            {estimatedDelivery?.formatted || 'Processing'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Package size={16} className="text-gray-400" />
                    <div>
                        <p className="font-medium">Shipping Method</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            {shippingMethod}
                        </p>
                    </div>
                </div>

                {trackingNumber && (
                    <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded">
                        <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                            Tracking Number
                        </p>
                        <p className="text-sm text-blue-700 dark:text-blue-300 font-mono">
                            {trackingNumber}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

