import { notFound } from "next/navigation";
import Image from "next/image";
import AddToCartButton from "@/components/AddToCartButton";

interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  category: string;
}

export default async function ProductPage({ params }: { params: { id: string } }) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/products/${params.id}`, {
    next: { revalidate: 60 },
  });

  if (!res.ok) return notFound();

  const product: Product = await res.json();

  return (
    <div className="pt-[var(--navbar-height)] max-w-5xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-2 gap-10">
      {product.image_url && (
        <div className="relative w-full h-96">
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            className="object-cover rounded-2xl"
          />
        </div>
      )}

      <div className="flex flex-col justify-between">
        <div>
          <h1 className="text-3xl font-bold">{product.name}</h1>
          <p className="text-xl text-gray-500 mt-2">${product.price.toFixed(2)}</p>
          <p className="mt-4 text-gray-700">{product.description}</p>

          <div className="mt-6">
            <AddToCartButton productId={product.id} />
          </div>
        </div>
      </div>
    </div>
  );
}
