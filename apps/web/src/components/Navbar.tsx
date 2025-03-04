import { UserButton, SignInButton, SignedIn, SignedOut } from "@clerk/nextjs";
import Link from "next/link";
import Image from "next/image";

const Navbar = () => {
    return (
        <nav className="p-6 bg-black text-white flex justify-between items-center border-b border-gray-800">
            <Link href="/" className="text-3xl font-serif tracking-wide uppercase">
                <Image src="/logo.jpg" alt="Jason & Co." width={240} height={120} priority />
            </Link>
            <div className="flex items-center space-x-6 text-lg">
                <Link href="/collections" className="hover:text-gold-400 transition">Collections</Link>
                <Link href="/cart" className="hover:text-gold-400 transition">🛒 Cart</Link>
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
