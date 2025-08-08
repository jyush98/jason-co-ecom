// ✅ components/checkout/OrderSummaryCard.tsx
"use client";

import { Package } from "lucide-react";
import { OrderDetails } from "@/utils";
import { CartItem } from "@/types/cart";
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
                {order.items.map((item: CartItem, index: number) => (
                    <OrderSummaryItem key={`${item.product_id}-${index}`} item={item} />
                ))}
            </div>

            {/* Order Totals */}
            <OrderTotals
                subtotal={order.subtotal}
                shipping={order.shipping_cost}
                tax={order.tax}
                discount={order.discount}
                total={order.total_price}
            />
        </div>
    );
}