import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { fetchProduct } from "../../utils/api";
import { Product } from "../../types/product";

export default function ProductPage() {
    const router = useRouter();
    const { id } = router.query;
    const [product, setProduct] = useState<Product | null>(null);

    useEffect(() => {
        if (id) {
            fetchProduct(Number(id)).then(setProduct);
        }
    }, [id]);

    if (!product) return <p>Loading...</p>;

    return (
        <div>
            <h1>{product.name}</h1>
            <p>{product.description}</p>
            <p>${product.price.toFixed(2)}</p>
        </div>
    );
}
