'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function Header() {
  const [userLoggedIn, setUserLoggedIn] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch(`${backendUrl}/api/auth/check-session`, {
          credentials: 'include',
        });
        setUserLoggedIn(response.ok);

        // Fetch cart count
        const cartResponse = await fetch(`${backendUrl}/api/cart/count`, {
          credentials: 'include',
        });
        if (cartResponse.ok) {
          const count = await cartResponse.json();
          setCartCount(count);
        }
      } catch (error) {
        console.error('Session check failed:', error);
        setUserLoggedIn(false);
      }
    };
    checkSession();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch(`${backendUrl}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
      setUserLoggedIn(false);
      window.location.href = '/';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <header className="fixed top-0 w-full bg-white shadow-md z-50">
      <nav className="container mx-auto px-6 py-4">
        <div className="flex flex-wrap items-center justify-between gap-6">
          {/* Logo and Name */}
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/logo.jpg"
              alt="Aroglin Spice Farms Logo"
              width={60}
              height={60}
              className="rounded-full"
            />
            <span className="text-2xl font-bold text-green-800 whitespace-nowrap">
              Aroglin Spice Farms
            </span>
          </Link>

          {/* Search Bar */}
          <div className="flex-1 max-w-xl w-full">
            <input
              type="text"
              placeholder="Search products..."
              className="w-full px-4 py-2 rounded-full border border-gray-300 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-600 transition"
            />
          </div>

          {/* Navigation Links */}
          <div className="hidden lg:flex items-center gap-6">
            <Link href="/" className="text-gray-700 hover:text-green-700 transition">Home</Link>
            <Link href="/shop" className="text-gray-700 hover:text-green-700 transition">Shop</Link>
            <Link href="/my-profile" className="text-gray-700 hover:text-green-700 transition">My Account</Link>
            <Link href="/about" className="text-gray-700 hover:text-green-700 transition">About</Link>
            <Link href="/contact" className="text-gray-700 hover:text-green-700 transition">Contact</Link>
          </div>

          {/* Auth and Cart */}
          <div className="flex items-center gap-4">
            {!userLoggedIn ? (
              <Link
                href="/my-account"
                className="bg-green-600 text-white px-6 py-2 rounded-full hover:bg-green-700 transition"
              >
                Login
              </Link>
            ) : (
              <button
                onClick={handleLogout}
                className="bg-green-700 text-white px-6 py-2 rounded-full hover:bg-green-800 transition"
              >
                Logout
              </button>
            )}
            {/* Cart Link */}
            <Link
              href="/cart"
              className="relative bg-amber-700 text-white px-6 py-2 rounded-full hover:bg-amber-800 transition"
            >
              Cart
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
}