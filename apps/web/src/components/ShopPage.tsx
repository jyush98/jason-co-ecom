"use client";

import ProductList from "./ProductList";
import { useSearchParams } from "next/navigation";


export default function ShopPage() {
    const searchParams = useSearchParams();
    const category = searchParams?.get("category") || undefined;
    return <ProductList initialCategory={category}/>;
}
