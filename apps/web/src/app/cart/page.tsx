import Cart from "../../components/Cart";

export default function CartPage() {
    return (
        <div className="container mx-auto p-8">
            <h1 className="text-3xl font-bold text-center mb-8 text-gray-900">Your Shopping Cart</h1>
            <Cart />
        </div>
    );
}
