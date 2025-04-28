// app/components/Header.js
"use client";

import Link from 'next/link';
import Image from 'next/image';

export default function Header() {
  return (
    <header className="fixed top-0 w-full bg-white shadow-md z-50">
      <nav className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between gap-6">
          {/* Logo and Name */}
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/logo.jpg"
              alt="Aroglin Spice Farms Logo"
              width={60}
              height={60}
              className="rounded-full"
            />
            <span className="text-2xl font-bold text-green-800">
              Aroglin Spice Farms
            </span>
          </Link>

          {/* Search Bar */}
          <div className="flex-1 max-w-xl">
            <input
              type="text"
              placeholder="Search products..."
              className="w-full px-4 py-2 rounded-full border border-gray-300 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-600"
            />
          </div>

          {/* Navigation Links */}
          <div className="hidden lg:flex items-center gap-6">
            <Link href="/shop" className="text-gray-700 hover:text-green-700">Shop</Link>
            <Link href="/about" className="text-gray-700 hover:text-green-700">About</Link>
            <Link href="/blog" className="text-gray-700 hover:text-green-700">Blog</Link>
            <Link href="/contact" className="text-gray-700 hover:text-green-700">Contact</Link>
          </div>

          {/* Auth and Cart */}
          <div className="flex items-center gap-4">
            <Link href="/my-account" className="bg-green-700 text-white px-6 py-2 rounded-full hover:bg-green-800">
              Login
            </Link>
            <button className="bg-amber-700 text-white px-6 py-2 rounded-full hover:bg-amber-800">
              Cart (0)
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
}