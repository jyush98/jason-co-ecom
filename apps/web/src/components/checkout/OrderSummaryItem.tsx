import { formatCartPrice } from "@/config";
import { JewelryImage } from "../ui/OptimizedImage";

// ✅ components/checkout/OrderSummaryItem.tsx


export function OrderSummaryItem({ item }: { item: any }) {
    return (
        <div className="flex gap-4">
            <div className={`w-16 h-16 ${item.product.display_theme === "dark" ? "bg-black" : "bg-white"} rounded overflow-hidden`}>
                {item.product_image && (
                    <JewelryImage.Product
                        src={item.product_image}
                        alt={item.product_name}
                        className="w-full h-full object-cover"
                    />
                )}
            </div>
            <div className="flex-1">
                <h3 className="font-medium">{item.product_name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    Qty: {item.quantity}
                </p>
                {item.custom_options && Object.keys(item.custom_options).length > 0 && (
                    <div className="text-xs text-gray-500 mt-1">
                        {Object.entries(item.custom_options).map(([key, value]) => (
                            <span key={key} className="block">
                                {key}: {String(value)}
                            </span>
                        ))}
                    </div>
                )}
                <p className="font-medium text-gold">
                    {formatCartPrice(item.unit_price * item.quantity)}
                </p>
            </div>
        </div>
    );
}