import { formatCartPrice } from "@/config";

export function OrderTotals({
    subtotal,
    shipping,
    tax,
    discount,
    total
}: {
    subtotal: number;
    shipping: number;
    tax: number;
    discount?: number;
    total: number;
}) {
    return (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-2">
            <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatCartPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between">
                <span>Shipping</span>
                <span>{shipping > 0 ? formatCartPrice(shipping) : 'Free'}</span>
            </div>
            <div className="flex justify-between">
                <span>Tax</span>
                <span>{formatCartPrice(tax)}</span>
            </div>
            {discount && discount > 0 && (
                <div className="flex justify-between text-green-600 dark:text-green-400">
                    <span>Discount</span>
                    <span>-{formatCartPrice(discount)}</span>
                </div>
            )}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-2">
                <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span className="text-gold">{formatCartPrice(total)}</span>
                </div>
            </div>
        </div>
    );
}

