import { UserButton, SignInButton, SignedIn, SignedOut } from "@clerk/nextjs";

const Navbar = () => {
    return (
        <nav className="p-4 bg-gray-800 text-white flex justify-between">
            <h1 className="text-xl font-bold">Jewelry Store</h1>
            <div>
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
