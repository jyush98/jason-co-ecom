export interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    image_url: string;
    image_urls?: string[];
    category: string;
    featured: boolean;
    details?: Record<string, string | number>;
}