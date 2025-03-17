"use client";

import ProductList from "../components/ProductList";
import { useSearchParams } from "next/navigation";


export default function Shop() {
    const searchParams = useSearchParams();
    const category = searchParams?.get("category") || undefined;
    return <ProductList initialCategory={category}/>;
}
