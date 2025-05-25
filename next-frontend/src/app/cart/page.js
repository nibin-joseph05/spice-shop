"use client";

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Header from '@/components/home/Header';
import Footer from '@/components/home/Footer';
import { XMarkIcon, ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/solid';

const cartItemAnimation = {
  hidden: { opacity: 0, x: -50 },
  visible: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 50 }
};

export default function CartPage() {
  // Initialize cartItems with static data
  const [cartItems, setCartItems] = useState([
    {
      id: '1',
      name: 'Premium Cardamom',
      qualityClass: 'Grade A',
      packWeight: 100,
      price: 550.00,
      quantity: 2,
      imageUrl: '/images/cardamom.webp' // Replace with a valid image path if needed
    },
    {
      id: '2',
      name: 'Organic Turmeric Powder',
      qualityClass: 'Standard',
      packWeight: 250,
      price: 120.00,
      quantity: 1,
      imageUrl: '/images/turmeric.webp' // Replace with a valid image path if needed
    },
    {
      id: '3',
      name: 'Malabar Black Pepper',
      qualityClass: 'Bold',
      packWeight: 50,
      price: 300.00,
      quantity: 3,
      imageUrl: '/images/black-pepper.webp' // Replace with a valid image path if needed
    }
  ]);
  const [loading, setLoading] = useState(false); // Set to false as data is static
  const [error, setError] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Removed useEffect for fetching cart as per request to make it static

  // Static updateQuantity function
  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity < 1) return; // Prevent quantity from going below 1

    setIsUpdating(true); // Simulate update process
    setTimeout(() => { // Simulate network delay
      setCartItems(items =>
        items.map(item =>
          item.id === itemId ? { ...item, quantity: newQuantity } : item
        )
      );
      setIsUpdating(false);
    }, 300);
  };

  // Static removeItem function
  const removeItem = (itemId) => {
    setIsUpdating(true); // Simulate update process
    setTimeout(() => { // Simulate network delay
      setCartItems(items => items.filter(item => item.id !== itemId));
      setIsUpdating(false);
    }, 300);
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) =>
      total + (item.price * item.quantity), 0
    ).toFixed(2);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-6 py-12">
          <div className="animate-pulse bg-white p-8 rounded-xl shadow-lg">
            {/* Loading skeleton */}
            <div className="h-10 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="space-y-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex gap-6 p-6 bg-gray-100 rounded-xl">
                  <div className="w-32 h-32 bg-gray-200 rounded-lg"></div>
                  <div className="flex-1 space-y-4">
                    <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="flex justify-between items-center">
                      <div className="h-8 bg-gray-200 rounded w-24"></div>
                      <div className="flex gap-3">
                        <div className="h-8 w-8 bg-gray-200 rounded-lg"></div>
                        <div className="h-8 bg-gray-200 rounded w-12"></div>
                        <div className="h-8 w-8 bg-gray-200 rounded-lg"></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 h-64 bg-gray-100 rounded-xl"></div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-6 py-24 text-center">
          <div className="max-w-md mx-auto bg-red-50 p-8 rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold text-red-800 mb-4">Cart Error</h2>
            <p className="text-red-700 mb-6">{error}</p>
            <a href="/shop" className="inline-block px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700">
              Back to Shop
            </a>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="container mx-auto px-4 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Your Shopping Cart</h1>

        {cartItems.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center py-16 bg-white rounded-xl shadow-lg"
          >
            <p className="text-2xl text-gray-600 mb-6">Your cart is empty</p>
            <a href="/shop" className="px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors transform hover:scale-105">
              Continue Shopping
            </a>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-6">
              <AnimatePresence>
                {cartItems.map(item => (
                  <motion.div
                    key={item.id}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    variants={cartItemAnimation}
                    layout // Enable layout animations for smooth removal/addition
                    transition={{ duration: 0.3 }}
                    className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 relative"
                  >
                    {isUpdating && (
                      <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-xl z-10">
                        <svg className="animate-spin h-8 w-8 text-amber-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      </div>
                    )}
                    <div className="flex gap-6">
                      {/* Product Image */}
                      <div className="relative w-32 h-32 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        <Image
                          src={item.imageUrl}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>

                      {/* Product Details */}
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-xl font-semibold text-gray-900">{item.name}</h3>
                            <p className="text-gray-600 mt-1">{item.qualityClass}</p>
                            <p className="text-gray-600">{item.packWeight}g</p>
                          </div>
                          <motion.button
                            onClick={() => removeItem(item.id)}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="text-gray-400 hover:text-red-600 transition-colors p-1 rounded-full"
                            aria-label="Remove item from cart"
                          >
                            <XMarkIcon className="h-6 w-6" />
                          </motion.button>
                        </div>

                        {/* Price and Quantity */}
                        <div className="flex items-center justify-between mt-4">
                          <div className="text-2xl font-bold text-amber-700">
                            ₹{(item.price * item.quantity).toFixed(2)}
                          </div>
                          <div className="flex items-center gap-3">
                            <motion.button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              disabled={isUpdating || item.quantity <= 1}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              aria-label="Decrease quantity"
                            >
                              <ChevronDownIcon className="h-5 w-5" />
                            </motion.button>
                            <span className="text-xl font-medium w-8 text-center">
                              {item.quantity}
                            </span>
                            <motion.button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              disabled={isUpdating}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              aria-label="Increase quantity"
                            >
                              <ChevronUpIcon className="h-5 w-5" />
                            </motion.button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Order Summary */}
            <div className="bg-white p-6 rounded-xl shadow-sm h-fit lg:sticky lg:top-8 border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Summary</h2>

              <div className="space-y-4">
                <div className="flex justify-between pb-2 border-b border-gray-100">
                  <span className="text-gray-600">Subtotal ({cartItems.length} items)</span>
                  <span className="font-medium text-gray-800">₹{calculateTotal()}</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-gray-100">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium text-green-600">Free</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-gray-100">
                  <span className="text-gray-600">Estimated Taxes (18% GST)</span>
                  <span className="font-medium text-gray-800">₹{(parseFloat(calculateTotal()) * 0.18).toFixed(2)}</span>
                </div>
                <div className="pt-4 mt-4">
                  <div className="flex justify-between text-xl font-bold text-gray-900">
                    <span>Order Total</span>
                    <span>₹{(parseFloat(calculateTotal()) * 1.18).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full mt-8 px-6 py-4 bg-amber-600 text-white rounded-lg text-lg font-bold
                          hover:bg-amber-700 transition-colors shadow-lg transform active:shadow-md"
              >
                Proceed to Checkout
              </motion.button>

              <a href="/shop" className="block mt-4 text-center text-amber-600 hover:text-amber-700 transition-colors text-sm">
                ← Continue Shopping
              </a>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}