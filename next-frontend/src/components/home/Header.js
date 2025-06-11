'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { debounce } from 'lodash'; // Import debounce

export default function Header() {
  const [userLoggedIn, setUserLoggedIn] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(''); // State for search input value
  const [searchResults, setSearchResults] = useState([]); // State for search results
  const [loadingSearch, setLoadingSearch] = useState(false); // State for search loading
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  const router = useRouter();

  // Debounced function to fetch spices
  const fetchSpices = debounce(async (query) => {
    if (query.length > 2) { // Only search if query is at least 3 characters
      setLoadingSearch(true);
      try {
        // Use your /api/products endpoint with the 'search' parameter
        const response = await fetch(`${backendUrl}/api/products?search=${encodeURIComponent(query)}&limit=5`); // Limit to 5 results for dropdown
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setSearchResults(data.products); // Assuming data.products contains the array of spices
      } catch (error) {
        console.error("Error fetching search results:", error);
        setSearchResults([]); // Clear results on error
      } finally {
        setLoadingSearch(false);
      }
    } else {
      setSearchResults([]); // Clear results if query is too short
    }
  }, 300); // Debounce by 300ms

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch(`${backendUrl}/api/auth/check-session`, {
          credentials: 'include',
        });
        setUserLoggedIn(response.ok);

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

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleSearchInputChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    fetchSpices(query); // Call the debounced function
  };

  const handleProductClick = (productId) => {
    router.push(`/products/${productId}`); // Navigate to the product detail page
    setSearchQuery(''); // Clear search input
    setSearchResults([]); // Clear search results
    setIsMobileMenuOpen(false); // Close mobile menu if open
  };

  return (
    <header className="fixed top-0 w-full bg-white shadow-md z-50">
      <nav className="container mx-auto px-6 py-4">
        <div className="flex flex-wrap items-center justify-between gap-4 md:gap-6">
          {/* Logo and Name */}
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/logo.jpg"
              alt="Aroglin Spice Farms Logo"
              width={60}
              height={60}
              className="rounded-full"
            />
            <span className="text-xl md:text-2xl font-bold text-green-800 whitespace-nowrap">
              Aroglin Spice Farms
            </span>
          </Link>

          {/* Hamburger Menu Button (visible on small screens) */}
          <div className="flex items-center gap-4 lg:hidden">
            <button
              onClick={toggleMobileMenu}
              className="text-gray-700 hover:text-green-700 focus:outline-none focus:ring-2 focus:ring-green-600 rounded p-2"
              aria-label="Toggle mobile menu"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            {/* Cart Link for Mobile (positioned near hamburger) */}
            <Link
              href="/cart"
              className="relative bg-amber-700 text-white px-4 py-2 rounded-full hover:bg-amber-800 transition text-sm"
            >
              Cart
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>

          {/* Search Bar with Dropdown (flex-grow on larger screens, limited on small) */}
          <div className="relative order-last w-full lg:order-none lg:flex-1 lg:max-w-xl">
            <input
              type="text"
              placeholder="Search products..."
              className="w-full px-4 py-2 rounded-full border border-gray-300 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-600 transition text-sm md:text-base"
              value={searchQuery}
              onChange={handleSearchInputChange}
              onFocus={() => {
                if (searchQuery.length <= 2) setSearchResults([]);
              }}
              onBlur={() => {
                  setTimeout(() => setSearchResults([]), 200);
              }}
              aria-label="Search products"
            />

            {/* Search Results Dropdown */}
            {searchQuery.length > 0 && searchResults.length > 0 && (
              <div className="absolute top-full left-0 w-full bg-white text-gray-800 border border-gray-300 rounded-lg shadow-lg mt-1 z-50 overflow-hidden">
                {loadingSearch ? (
                  <div className="p-3 text-center text-gray-500">Loading...</div>
                ) : searchResults.length > 0 ? (
                  searchResults.map((spice) => (
                    <div
                      key={spice.id}
                      className="flex items-center p-3 hover:bg-gray-100 cursor-pointer"
                      onClick={() => handleProductClick(spice.id)}
                    >
                      <Image
                        src={spice.imageUrls && spice.imageUrls.length > 0 ? spice.imageUrls[0] : '/placeholder-spice.jpg'}
                        alt={spice.name}
                        width={48} // Smaller image for dropdown
                        height={48}
                        objectFit="cover"
                        className="rounded mr-3"
                      />
                      <div>
                        <p className="font-semibold text-base">{spice.name}</p>
                        <p className="text-gray-600 text-sm">{spice.origin}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-3 text-center text-gray-500">No results found</div>
                )}
              </div>
            )}
          </div>

          {/* Desktop Navigation Links (hidden on small screens) */}
          <div className="hidden lg:flex items-center gap-6">
            <Link href="/" className="text-gray-700 hover:text-green-700 transition">Home</Link>
            <Link href="/shop" className="text-gray-700 hover:text-green-700 transition">Shop</Link>
            <Link href="/my-profile" className="text-gray-700 hover:text-green-700 transition">My Account</Link>
            <Link href="/about" className="text-gray-700 hover:text-green-700 transition">About</Link>
            <Link href="/contact" className="text-gray-700 hover:text-green-700 transition">Contact</Link>
          </div>

          {/* Auth (Login/Logout) and Cart (Desktop) */}
          <div className="hidden lg:flex items-center gap-4">
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

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 bg-white bg-opacity-95 z-50 flex flex-col items-center py-8 animate-fade-in-down">
          <button
            onClick={toggleMobileMenu}
            className="absolute top-4 right-6 text-gray-700 hover:text-green-700 focus:outline-none focus:ring-2 focus:ring-green-600 rounded p-2"
            aria-label="Close mobile menu"
          >
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="flex flex-col items-center gap-6 mt-12">
            {/* Search bar inside mobile menu */}
            <div className="relative w-4/5 max-w-sm mb-4">
                <input
                    type="text"
                    placeholder="Search products..."
                    className="w-full px-4 py-2 rounded-full border border-gray-300 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-600 transition text-base"
                    value={searchQuery}
                    onChange={handleSearchInputChange}
                    onFocus={() => {
                        if (searchQuery.length <= 2) setSearchResults([]);
                    }}
                    onBlur={() => {
                        setTimeout(() => setSearchResults([]), 200);
                    }}
                    aria-label="Search products in mobile menu"
                />
                {/* Search Results Dropdown for Mobile */}
                {searchQuery.length > 0 && searchResults.length > 0 && (
                  <div className="absolute top-full left-0 w-full bg-white text-gray-800 border border-gray-300 rounded-lg shadow-lg mt-1 z-50 overflow-hidden">
                    {loadingSearch ? (
                      <div className="p-3 text-center text-gray-500">Loading...</div>
                    ) : searchResults.length > 0 ? (
                      searchResults.map((spice) => (
                        <div
                          key={spice.id}
                          className="flex items-center p-3 hover:bg-gray-100 cursor-pointer"
                          onClick={() => handleProductClick(spice.id)}
                        >
                          <Image
                            src={spice.imageUrls && spice.imageUrls.length > 0 ? spice.imageUrls[0] : '/placeholder-spice.jpg'}
                            alt={spice.name}
                            width={48}
                            height={48}
                            objectFit="cover"
                            className="rounded mr-3"
                          />
                          <div>
                            <p className="font-semibold text-base">{spice.name}</p>
                            <p className="text-gray-600 text-sm">{spice.origin}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-3 text-center text-gray-500">No results found</div>
                    )}
                  </div>
                )}
            </div>

            <Link href="/" className="text-xl text-gray-800 hover:text-green-700 transition" onClick={toggleMobileMenu}>Home</Link>
            <Link href="/shop" className="text-xl text-gray-800 hover:text-green-700 transition" onClick={toggleMobileMenu}>Shop</Link>
            <Link href="/my-profile" className="text-xl text-gray-800 hover:text-green-700 transition" onClick={toggleMobileMenu}>My Account</Link>
            <Link href="/about" className="text-xl text-gray-800 hover:text-green-700 transition" onClick={toggleMobileMenu}>About</Link>
            <Link href="/contact" className="text-xl text-gray-800 hover:text-green-700 transition" onClick={toggleMobileMenu}>Contact</Link>
            <div className="mt-8">
                {!userLoggedIn ? (
                <Link
                    href="/my-account"
                    className="bg-green-600 text-white px-8 py-3 rounded-full text-lg hover:bg-green-700 transition"
                    onClick={toggleMobileMenu}
                >
                    Login
                </Link>
                ) : (
                <button
                    onClick={() => {
                        handleLogout();
                        toggleMobileMenu();
                    }}
                    className="bg-green-700 text-white px-8 py-3 rounded-full text-lg hover:bg-green-800 transition"
                >
                    Logout
                </button>
                )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}