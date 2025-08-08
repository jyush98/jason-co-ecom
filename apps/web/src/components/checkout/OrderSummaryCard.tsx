// ✅ components/checkout/OrderSummaryCard.tsx - FIXED
"use client";

import { Package } from "lucide-react";
import { OrderDetails } from "@/utils";
import { OrderSummaryItem } from "./OrderSummaryItem";
import { OrderTotals } from "./OrderTotals";

interface OrderSummaryCardProps {
    order: OrderDetails;
    _formattedOrder?: any; // Prefixed with underscore to indicate intentionally unused
}

export function OrderSummaryCard({ order, _formattedOrder }: OrderSummaryCardProps) {
    return (
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
            <h2 className="text-xl font-serif mb-6 flex items-center gap-2">
                <Package size={20} className="text-gold" />
                Order Summary
            </h2>

            {/* Order Items */}
            <div className="space-y-4 mb-6">
                {order.items.map((item, index) => {
                    // ✅ FIXED: Convert OrderItem to CartItem-like structure for display
                    const cartItemForDisplay = {
                        product_id: item.product_id,
                        quantity: item.quantity,
                        custom_options: item.custom_options,
                        product: {
                            id: item.product_id,
                            name: item.product_name,
                            price: item.unit_price,
                            image_url: item.product_image_url || '',
                            category: item.product_category || 'jewelry'
                        }
                    };

                    return (
                        <OrderSummaryItem
                            key={`${item.product_id}-${index}`}
                            item={cartItemForDisplay}
                        />
                    );
                })}
            </div>

            {/* Order Totals */}
            <OrderTotals
                subtotal={order.subtotal || 0} // ✅ FIXED: Provide default value
                shipping={order.shipping_amount || 0} // ✅ FIXED: Use correct property name
                tax={order.tax_amount || 0} // ✅ FIXED: Use correct property name
                discount={order.discount_amount} // ✅ FIXED: Use correct property name
                total={order.total_price}
            />
        </div>
    );
}