import Hero from "../components/Hero";
import ProductList from "../components/ProductList";

export default function Home() {
    return (
        <main className="min-h-screen p-8">
            <Hero />
            <ProductList />
        </main>
    );
}
