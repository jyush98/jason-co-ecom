"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, ShoppingCart } from "lucide-react";
import { SignedIn, SignedOut, SignInButton, UserButton, useAuth } from "@clerk/nextjs";
import { useCartStore } from "@/app/store/cartStore";
import { getCart } from "@/utils/cart";
import { motion, AnimatePresence } from "framer-motion";
import FullScreenMenu from "@/components/FullScreenMenu";
import ThemeToggle from "./ThemeToggle";

const categories = [
  { name: "All Jewelry", path: "/shop" },
  { name: "Necklaces", path: "/shop?category=necklaces" },
  { name: "Bracelets", path: "/shop?category=bracelets" },
  { name: "Rings", path: "/shop?category=rings" },
  { name: "Watches", path: "/shop?category=watches" },
];

const collections = [
  { name: "Iced Out", path: "/shop?collection=iced" },
  { name: "Tennis Set", path: "/shop?collection=tennis" },
  { name: "Classics", path: "/shop?collection=classics" },
];

interface CartItem {
  quantity: number;
}

const navHover = {
  scale: 1.05,
  textDecoration: "underline" as const,
};

export default function NavbarClient() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [hoverImage, setHoverImage] = useState("/default.jpg");
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { getToken } = useAuth();
  const cartCount = useCartStore((state) => state.cartCount);
  const setCartCount = useCartStore((state) => state.setCartCount);

  useEffect(() => {
    const fetchCart = async () => {
      const token = await getToken();
      if (token) {
        const cart = await getCart(token);
        const itemCount = cart.reduce((acc: number, item: CartItem) => acc + item.quantity, 0);
        setCartCount(itemCount);
      }
    };
    fetchCart();
  }, [getToken, setCartCount]);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsDropdownOpen(false);
    }, 200);
  };

  const handleOtherNavHover = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsDropdownOpen(false);
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
    setHoverImage("/default.jpg");
  };

  const handleDropdownLinkClick = () => {
    if (window.innerWidth < 768) {
      setIsDropdownOpen(false);
    }
  };

  return (
    <header className="fixed top-0 left-0 w-full bg-black z-50 text-white shadow-md">
      {/* Top Row */}
      <div className="flex justify-between items-center px-4 py-3 h-[85px]">
        <div className="flex items-center space-x-3">
          <button onClick={toggleMenu}>
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          <ThemeToggle /> {/* ✅ Toggle sits to the right of the menu icon */}
        </div>

        <Link href="/" className="mx-auto" onClick={() => setMenuOpen(false)}>
          <Image src="/logo.jpg" alt="Jason & Co." width={200} height={100} priority />
        </Link>
        <div className="flex items-center space-x-4">
          <Link href="/cart" className="relative">
            <ShoppingCart className="w-6 h-6" />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-white text-black text-xs font-bold px-1.5 py-0.5 rounded-full">
                {cartCount}
              </span>
            )}
          </Link>
          <SignedOut>
            <SignInButton />
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>
      </div>

      {/* Bottom Nav */}
      {!menuOpen && (
        <nav
          className="flex justify-center space-x-8 py-2 text-sm tracking-wide font-sans"
          onMouseLeave={handleMouseLeave}
        >
          <div className="relative" onMouseEnter={handleMouseEnter}>
            <motion.div whileHover={navHover} transition={{ duration: 0.2 }}>
              <Link href="/shop" className="nav-link">
                Shop
              </Link>
            </motion.div>
          </div>
          {[
            ["/gallery", "Gallery"],
            ["/custom", "Custom Orders"],
            ["/about", "About"],
            ["/contact", "Contact"],
          ].map(([path, label]) => (
            <motion.div
              key={path}
              whileHover={navHover}
              transition={{ duration: 0.2 }}
              onMouseEnter={handleOtherNavHover}
            >
              <Link href={path} className="nav-link">
                {label}
              </Link>
            </motion.div>
          ))}
        </nav>
      )}

      {/* Mega Menu */}
      <AnimatePresence>
        {isDropdownOpen && (
          <motion.div
            key="mega-menu"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="absolute left-0 right-0 top-full w-full bg-black text-white py-10 shadow-lg"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            {/* Desktop Grid */}
            <div className="hidden md:grid px-[15%] grid-cols-12 gap-8">
              <div className="col-span-3">
                <h3 className="text-sm font-semibold uppercase mb-4">Categories</h3>
                <ul className="space-y-2">
                  {categories.map((category) => (
                    <li key={category.name}>
                      <Link href={category.path} className="hover:underline" onClick={handleDropdownLinkClick}>
                        {category.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="col-span-3">
                <h3 className="text-sm font-semibold uppercase mb-4">Collections</h3>
                <ul className="space-y-2">
                  {collections.map((collection) => (
                    <li key={collection.name}>
                      <Link href={collection.path} className="hover:underline" onClick={handleDropdownLinkClick}>
                        {collection.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="hidden md:flex col-span-6 space-x-4">
                <Image src="/cuban-link.webp" alt="Featured 1" width={200} height={200} className="object-cover rounded-lg" />
                <Image src="/cuban-link.webp" alt="Featured 2" width={200} height={200} className="object-cover rounded-lg" />
              </div>
            </div>

            {/* Mobile Flex Layout */}
            <div className="flex md:hidden w-full justify-between px-4">
              <div className="w-[20%]" />
              <div className="w-[30%]">
                <h3 className="text-sm font-semibold uppercase mb-4">Categories</h3>
                <ul className="space-y-2">
                  {categories.map((category) => (
                    <li key={category.name}>
                      <Link href={category.path} className="hover:underline" onClick={handleDropdownLinkClick}>
                        {category.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="w-[15%]" />
              <div className="w-[30%]">
                <h3 className="text-sm font-semibold uppercase mb-4">Collections</h3>
                <ul className="space-y-2">
                  {collections.map((collection) => (
                    <li key={collection.name}>
                      <Link href={collection.path} className="hover:underline" onClick={handleDropdownLinkClick}>
                        {collection.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="w-[15%]" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>


      {/* Fullscreen Menu */}
      {menuOpen && (
        <FullScreenMenu
          categories={categories}
          hoverImage={hoverImage}
          setHoverImage={setHoverImage}
          onClose={() => setMenuOpen(false)}
        />
      )}

      <style jsx>{`
        .nav-link {
          padding-bottom: 4px;
          font-weight: 400;
          transition: font-weight 0.3s ease;
        }

        .nav-link:hover {
          text-decoration: underline;
        }
      `}</style>
    </header>
  );
}
