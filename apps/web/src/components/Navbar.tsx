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

// Main navigation links for FullScreenMenu
const mainNavigation = [
  { name: "Shop", path: "/shop" },
  { name: "Gallery", path: "/gallery" },
  { name: "Custom Orders", path: "/custom-orders" },
  { name: "About", path: "/about" },
  { name: "Contact", path: "/contact" },
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
  const [isMobile, setIsMobile] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { getToken } = useAuth();
  const cartCount = useCartStore((state) => state.cartCount);
  const setCartCount = useCartStore((state) => state.setCartCount);

  const { resolvedTheme, setTheme } = useTheme();

  // Enhanced mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Enhanced scroll detection with mobile optimization
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const isScrolled = scrollTop > (isMobile ? 10 : 20);
      setScrolled(isScrolled);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isMobile]);

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

  // Mobile-friendly dropdown handlers
  const handleMouseEnter = () => {
    if (!isMobile) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setIsDropdownOpen(true);
    }
  };

  const handleMouseLeave = () => {
    if (!isMobile) {
      timeoutRef.current = setTimeout(() => {
        setIsDropdownOpen(false);
      }, 200);
    }
  };

  const handleDropdownToggle = () => {
    if (isMobile) {
      setIsDropdownOpen(!isDropdownOpen);
    }
  };

  const handleOtherNavHover = () => {
    if (!isMobile) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setIsDropdownOpen(false);
    }
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
    // Prevent body scroll when menu is open on mobile
    if (!menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  };

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  const handleDropdownLinkClick = () => {
    setIsDropdownOpen(false);
  };

  // Close dropdown when clicking outside on mobile
  useEffect(() => {
    if (isMobile && isDropdownOpen) {
      const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as Element;
        if (!target.closest('.shop-dropdown')) {
          setIsDropdownOpen(false);
        }
      };

      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isMobile, isDropdownOpen]);

  // Cleanup body scroll on unmount
  useEffect(() => {
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <>
      <motion.header
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${scrolled
          ? 'bg-white/95 dark:bg-black/95 backdrop-blur-md shadow-2xl border-b border-gold/20'
          : 'bg-white dark:bg-black'
          } text-black dark:text-white`}
        initial={{ y: -100 }}
        animate={{
          y: menuOpen ? -100 : 0,
          opacity: 1
        }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        {/* Main Navigation */}
        <div className="max-w-7xl mx-auto">
          {/* CLEAN Mobile Header */}
          <div className={`flex justify-between items-center px-6 ${isMobile ? 'py-4 h-[80px]' : 'py-4 h-[90px]'
            }`}>

            {/* Left Actions - MINIMAL */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              <motion.button
                onClick={toggleMenu}
                className="p-2 rounded-full transition-colors duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Toggle menu"
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
                      <X className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'}`} />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="menu"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Menu className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'}`} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>

              {/* Theme Toggle - Keep on desktop, remove on mobile */}
              {!isMobile && (
                <motion.button
                  onClick={toggleTheme}
                  aria-label="Toggle Theme"
                  className="p-2 rounded-full transition-colors duration-200"
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
                        <Sun className="text-gold w-5 h-5" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="moon"
                        initial={{ rotate: 180, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        exit={{ rotate: -180, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Moon className="text-gold w-5 h-5" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>
              )}
            </div>

            {/* Center Logo - PROMINENT */}
            <motion.div
              className="mx-auto"
              whileHover={{ scale: isMobile ? 1.02 : 1.05 }}
              transition={{ duration: 0.3 }}
            >
              <Link href="/" onClick={() => setMenuOpen(false)}>
                <Image
                  src={resolvedTheme === "dark" ? "/logo-dark.png" : "/logo-light.png"}
                  alt="Jason & Co."
                  width={isMobile ? 180 : 220}
                  height={isMobile ? 90 : 110}
                  priority
                  className="h-auto"
                />
              </Link>
            </motion.div>

            {/* Right Actions - CLEAN */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Cart */}
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  href="/cart"
                  className="relative p-2 rounded-full transition-colors duration-200"
                  aria-label={`Cart with ${cartCount} items`}
                >
                  <ShoppingCart className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'}`} />
                  {cartCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className={`absolute ${isMobile ? '-top-1 -right-1' : 'bottom-10 -right-7'
                        } bg-black dark:bg-white text-white dark:text-black text-xs font-bold ${isMobile ? 'px-1 py-0.5' : 'px-1.5 py-0.5'
                        } rounded-full min-w-[18px] text-center`}
                    >
                      {cartCount > 99 ? '99+' : cartCount}
                    </motion.span>
                  )}
                </Link>
              </motion.div>

              {/* Auth Section */}
              <SignedOut>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    href="/sign-in"
                    className={`flex items-center gap-2 ${isMobile ? 'px-2 py-1 text-xs' : 'px-4 py-2 text-sm'
                      } font-medium transition-all duration-200 rounded-full border border-transparent`}
                  >
                    <User className={`${isMobile ? 'w-4 h-4' : 'w-4 h-4'}`} />
                    <span className="hidden sm:inline">Sign In</span>
                  </Link>
                </motion.div>
              </SignedOut>

              <SignedIn>
                <AccountDropdown />
              </SignedIn>
            </div>
          </div>

          {/* Desktop Navigation ONLY */}
          {!menuOpen && !isMobile && (
            <motion.nav
              className="flex justify-center items-center space-x-12 py-3 text-sm tracking-widest font-medium border-t border-gold/10"
              onMouseLeave={handleMouseLeave}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
            >
              {/* Shop with Dropdown */}
              <div
                className="relative shop-dropdown"
                onMouseEnter={handleMouseEnter}
                onClick={handleDropdownToggle}
              >
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
                  <Link
                    href={path}
                    className="nav-link uppercase tracking-wider font-semibold transition-colors duration-200"
                  >
                    {label}
                  </Link>
                </motion.div>
              ))}
            </motion.nav>
          )}

          {/* NO Mobile Navigation Bar - Removed completely */}
        </div>

        {/* Desktop Mega Menu - UNCHANGED */}
        <AnimatePresence>
          {isDropdownOpen && !isMobile && (
            <motion.div
              key="mega-menu"
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="absolute left-0 right-0 top-full w-full bg-white/95 dark:bg-black/95 backdrop-blur-md text-black dark:text-white shadow-2xl border-t border-gold/20 py-12"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              {/* Desktop Grid */}
              <div className="max-w-7xl mx-auto px-8 grid grid-cols-12 gap-12">
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
                          className="text-lg transition-colors duration-200 tracking-wide"
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
                          className="text-lg transition-colors duration-200 tracking-wide"
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

      {/* FullScreen Menu with Main Navigation */}
      {menuOpen && (
        <FullScreenMenu
          categories={mainNavigation}
          onClose={() => setMenuOpen(false)}
        />
      )}
    </>
  );
}