import { User } from "./user";

export interface OrderItem {
    id: number;
    product_id: number;
    product_name: string;
    unit_price: number;
    quantity: number;
}

export type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "completed";


export interface Order {
    id: number;
    user: User; // Reference the User type
    items: OrderItem[]; // List of ordered items
    total_price: number;
    status: OrderStatus;
    created_at: string; // ISO 8601 format
}
