"use client";

import Link from "next/link";
import Image from "next/image";
import { FaInstagram, FaTiktok, FaEnvelope } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-black text-white py-12 border-t border-gray-700 w-full">
      <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-start md:items-center">
        <div className="flex flex-col md:flex-row gap-12">
          <div>
            <h5 className="text-lg font-semibold mb-2">Quick Links</h5>
            <ul className="space-y-2 text-sm">
              <li><Link href="/shop" className="hover:underline">Shop</Link></li>
              <li><Link href="/custom" className="hover:underline">Custom Orders</Link></li>
              <li><Link href="/gallery" className="hover:underline">Gallery</Link></li>
              <li><Link href="/about" className="hover:underline">About</Link></li>
              <li><Link href="/contact" className="hover:underline">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h5 className="text-lg font-semibold mb-2">Connect</h5>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:underline">Instagram</a></li>
              <li><a href="#" className="hover:underline">TikTok</a></li>
              <li><a href="#" className="hover:underline">Email Us</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-6 md:mt-0 text-center">
          <Image src="/logo.jpg" alt="Jason & Co." width={250} height={125} className="object-contain mx-auto" />
          <div className="mt-2 flex justify-center space-x-6 text-xl">
            <a href="#" aria-label="Instagram" className="hover:text-gray-300"><FaInstagram /></a>
            <a href="#" aria-label="TikTok" className="hover:text-gray-300"><FaTiktok /></a>
            <a href="#" aria-label="Email" className="hover:text-gray-300"><FaEnvelope /></a>
          </div>
        </div>
      </div>
      <div className="mt-10 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} Jason & Co. All rights reserved.
      </div>
    </footer>
  );
}
