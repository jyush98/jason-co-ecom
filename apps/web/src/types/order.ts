import { Product } from "./product";
import { User } from "./user";

export interface OrderItem {
    id: number;
    product: Product; // Reference the Product type
    quantity: number;
}

export interface Order {
    id: number;
    user: User; // Reference the User type
    items: OrderItem[]; // List of ordered items
    total_price: number;
    status: "pending" | "processing" | "shipped" | "delivered"; // Order status
    created_at: string; // ISO 8601 format
}
