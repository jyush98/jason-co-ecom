"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, ShoppingCart, Sun, Moon, User, ChevronDown } from "lucide-react";
import { SignedIn, SignedOut, useAuth } from "@clerk/nextjs";
import { useCartStore } from "@/app/store/cartStore";
import { getCart } from "@/utils/cart";
import { motion, AnimatePresence } from "framer-motion";
import FullScreenMenu from "@/components/FullScreenMenu";
import { useTheme } from "next-themes";
import { AccountDropdown } from "./navigation";
// import { useUser } from "@clerk/nextjs";

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
  scale: 1.02,
  y: -1,
  transition: { duration: 0.2, ease: "easeOut" }
};

export default function Navbar() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { getToken } = useAuth();
  // const { user } = useUser(); // Get user for AccountDropdown
  const cartCount = useCartStore((state) => state.cartCount);
  const setCartCount = useCartStore((state) => state.setCartCount);

  const { resolvedTheme, setTheme } = useTheme();

  // Enhanced scroll detection with premium effects
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 20;
      setScrolled(isScrolled);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
  };

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  const handleDropdownLinkClick = () => {
    if (window.innerWidth < 768) {
      setIsDropdownOpen(false);
    }
  };

  return (
    <>
      <motion.header
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${scrolled
          ? 'bg-white/95 dark:bg-black/95 backdrop-blur-md shadow-2xl border-b border-gold/20'
          : 'bg-white dark:bg-black'
          } text-black dark:text-white`}
        initial={{ y: -100 }}
        animate={{
          y: menuOpen ? -100 : 0,
          opacity: 1
        }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {/* Premium Brand Bar */}
        <div className="hidden bg-gradient-to-r from-gold/10 via-gold/5 to-gold/10 border-b border-gold/20">
          <div className="max-w-7xl mx-auto px-4 py-2">
            <div className="flex justify-between items-center text-xs tracking-wider font-medium">
              <span className="text-gold">WHERE AMBITION MEETS ARTISTRY</span>
              <div className="hidden md:flex space-x-6 text-gray-600 dark:text-gray-400">
                <span>Free Shipping on Orders $500+</span>
                <span>|</span>
                <span>Lifetime Warranty</span>
                <span>|</span>
                <span>Custom Designs Available</span>
              </div>
              <span className="text-gold">DESIGNED WITHOUT LIMITS</span>
            </div>
          </div>
        </div>

        {/* Main Navigation */}
        <div className="max-w-7xl mx-auto">
          {/* Top Row */}
          <div className="flex justify-between items-center px-6 py-4 h-[90px]">
            {/* Left Actions */}
            <div className="flex items-center space-x-4">
              <motion.button
                onClick={toggleMenu}
                className="p-2 rounded-full hover:bg-gold/10 transition-colors duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <AnimatePresence mode="wait">
                  {menuOpen ? (
                    <motion.div
                      key="x"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <X className="w-6 h-6" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="menu"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Menu className="w-6 h-6" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>

              <motion.button
                onClick={toggleTheme}
                aria-label="Toggle Theme"
                className="p-2 rounded-full hover:bg-gold/10 transition-colors duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <AnimatePresence mode="wait">
                  {resolvedTheme === "dark" ? (
                    <motion.div
                      key="sun"
                      initial={{ rotate: -180, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 180, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Sun className="w-5 h-5 text-gold" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="moon"
                      initial={{ rotate: 180, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -180, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Moon className="w-5 h-5 text-gold" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>

            {/* Center Logo */}
            <motion.div
              className="mx-auto"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              <Link href="/" onClick={() => setMenuOpen(false)}>
                <Image
                  src={resolvedTheme === "dark" ? "/logo-dark.png" : "/logo-light.png"}
                  alt="Jason & Co."
                  width={220}
                  height={110}
                  priority
                  className="h-auto"
                />
              </Link>
            </motion.div>

            {/* Right Actions */}
            <div className="flex items-center space-x-4">
              {/* Cart */}
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link href="/cart" className="relative p-2 rounded-full transition-colors duration-200">
                  <ShoppingCart className="w-6 h-6" />
                  {cartCount > 0 && (
                    <span className="absolute bottom-10 -right-7 bg-black dark:bg-white text-white dark:text-black text-xs font-bold px-1.5 py-0.5 rounded-full">
                      {cartCount}
                    </span>
                  )}
                </Link>
              </motion.div>

              {/* Enhanced Auth Section with AccountDropdown */}
              <SignedOut>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    href="/sign-in"
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium hover:text-gold transition-all duration-200 rounded-full hover:bg-gold/10 border border-transparent hover:border-gold/30"
                  >
                    <User className="w-4 h-4" />
                    <span className="hidden sm:inline">Sign In</span>
                  </Link>
                </motion.div>
              </SignedOut>

              <SignedIn>
                {/* Account Dropdown - Complete account management */}
                <AccountDropdown />
              </SignedIn>
            </div>
          </div>

          {/* Enhanced Bottom Navigation */}
          {!menuOpen && (
            <motion.nav
              className="flex justify-center items-center space-x-12 py-3 text-sm tracking-widest font-medium border-t border-gold/10"
              onMouseLeave={handleMouseLeave}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
            >
              {/* Shop with Dropdown */}
              <div className="relative" onMouseEnter={handleMouseEnter}>
                <motion.div
                  className="flex items-center space-x-1 cursor-pointer group"
                  whileHover={navHover}
                >
                  <Link href="/shop" className="nav-link uppercase tracking-wider font-semibold">
                    Shop
                  </Link>
                  <ChevronDown className="w-4 h-4 transition-transform duration-200 group-hover:rotate-180" />
                </motion.div>
              </div>

              {/* Other Nav Items */}
              {[
                ["/gallery", "Gallery"],
                ["/custom-orders", "Custom Orders"],
                ["/about", "About"],
                ["/contact", "Contact"],
              ].map(([path, label]) => (
                <motion.div
                  key={path}
                  whileHover={navHover}
                  onMouseEnter={handleOtherNavHover}
                >
                  <Link href={path} className="nav-link uppercase tracking-wider font-semibold hover:text-gold transition-colors duration-200">
                    {label}
                  </Link>
                </motion.div>
              ))}
            </motion.nav>
          )}
        </div>

        {/* Enhanced Mega Menu */}
        <AnimatePresence>
          {isDropdownOpen && (
            <motion.div
              key="mega-menu"
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="absolute left-0 right-0 top-full w-full bg-white/95 dark:bg-black/95 backdrop-blur-md text-black dark:text-white py-12 shadow-2xl border-t border-gold/20"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              {/* Desktop Grid */}
              <div className="hidden md:grid max-w-7xl mx-auto px-8 grid-cols-12 gap-12">
                {/* Categories */}
                <div className="col-span-3">
                  <h3 className="text-lg font-bold uppercase mb-6 text-gold tracking-wider">Categories</h3>
                  <ul className="space-y-3">
                    {categories.map((category, index) => (
                      <motion.li
                        key={category.name}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Link
                          href={category.path}
                          className="text-lg hover:text-gold transition-colors duration-200 tracking-wide"
                          onClick={handleDropdownLinkClick}
                        >
                          {category.name}
                        </Link>
                      </motion.li>
                    ))}
                  </ul>
                </div>

                {/* Collections */}
                <div className="col-span-3">
                  <h3 className="text-lg font-bold uppercase mb-6 text-gold tracking-wider">Collections</h3>
                  <ul className="space-y-3">
                    {collections.map((collection, index) => (
                      <motion.li
                        key={collection.name}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 + 0.2 }}
                      >
                        <Link
                          href={collection.path}
                          className="text-lg hover:text-gold transition-colors duration-200 tracking-wide"
                          onClick={handleDropdownLinkClick}
                        >
                          {collection.name}
                        </Link>
                      </motion.li>
                    ))}
                  </ul>
                </div>

                {/* Featured Images */}
                <div className="col-span-6 grid grid-cols-2 gap-6">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className="relative group overflow-hidden rounded-lg"
                  >
                    <Image
                      src="/cuban-link.webp"
                      alt="Featured Collection"
                      width={300}
                      height={200}
                      className="object-cover rounded-lg group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg">
                      <div className="absolute bottom-4 left-4">
                        <h4 className="text-white font-bold text-lg">Iced Out Collection</h4>
                        <p className="text-gold text-sm">Shop Now</p>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                    className="relative group overflow-hidden rounded-lg"
                  >
                    <Image
                      src="/cuban-link.webp"
                      alt="Tennis Collection"
                      width={300}
                      height={200}
                      className="object-cover rounded-lg group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg">
                      <div className="absolute bottom-4 left-4">
                        <h4 className="text-white font-bold text-lg">Tennis Sets</h4>
                        <p className="text-gold text-sm">Explore</p>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* Mobile Layout */}
              <div className="flex md:hidden w-full justify-between px-6">
                <div className="w-[45%]">
                  <h3 className="text-lg font-bold uppercase mb-4 text-gold">Categories</h3>
                  <ul className="space-y-3">
                    {categories.map((category) => (
                      <li key={category.name}>
                        <Link
                          href={category.path}
                          className="text-base hover:text-gold transition-colors duration-200"
                          onClick={handleDropdownLinkClick}
                        >
                          {category.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="w-[45%]">
                  <h3 className="text-lg font-bold uppercase mb-4 text-gold">Collections</h3>
                  <ul className="space-y-3">
                    {collections.map((collection) => (
                      <li key={collection.name}>
                        <Link
                          href={collection.path}
                          className="text-base hover:text-gold transition-colors duration-200"
                          onClick={handleDropdownLinkClick}
                        >
                          {collection.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <style jsx>{`
          .nav-link {
            position: relative;
            padding-bottom: 4px;
            transition: all 0.3s ease;
          }

          .nav-link::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 50%;
            width: 0;
            height: 2px;
            background: linear-gradient(90deg, #D4AF37, #FFD700);
            transition: all 0.3s ease;
            transform: translateX(-50%);
          }

          .nav-link:hover::after {
            width: 100%;
          }
        `}</style>
      </motion.header>

      {/* Fullscreen Menu - Separate from header to avoid z-index issues */}
      {menuOpen && (
        <FullScreenMenu
          categories={categories}
          onClose={() => setMenuOpen(false)}
        />
      )}
    </>
  );
}