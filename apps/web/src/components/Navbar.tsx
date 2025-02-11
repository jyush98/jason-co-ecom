import { UserButton, SignInButton, SignedIn, SignedOut } from "@clerk/nextjs";
import Link from "next/link";

const Navbar = () => {
    return (
        <nav className="p-4 bg-gray-800 text-white flex justify-between items-center">
            <Link href="/" className="text-xl font-bold">Jason & Co.</Link>
            <div className="flex items-center space-x-4">
                <Link href="/cart" className="text-lg hover:underline">Cart</Link>
                <SignedOut>
                    <SignInButton />
                </SignedOut>
                <SignedIn>
                    <UserButton />
                </SignedIn>
            </div>
        </nav>
    );
};

export default Navbar;
