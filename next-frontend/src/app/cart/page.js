"use client";

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Header from '@/components/home/Header';
import Footer from '@/components/home/Footer';
import { PlusIcon, MinusIcon, TrashIcon, ShoppingBagIcon } from '@heroicons/react/24/solid';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const cartItemAnimation = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  },
  exit: {
    opacity: 0,
    x: 100,
    transition: {
      duration: 0.2,
      ease: "easeIn"
    }
  }
};

export default function CartPage() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isCartEmpty, setIsCartEmpty] = useState(false);
  const [featuredSpices, setFeaturedSpices] = useState([]);
  const [featuredLoading, setFeaturedLoading] = useState(false);

  const fetchCart = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/cart`, {
        credentials: 'include'
      });

      if (!response.ok) {
        if (response.status === 404) {
          setIsCartEmpty(true);
          fetchFeaturedSpices();
          return;
        }
        throw new Error('Failed to fetch cart');
      }

      const cartData = await response.json();
      setCart(cartData);
      setIsCartEmpty(cartData.items.length === 0);
      if (cartData.items.length === 0) fetchFeaturedSpices();
    } catch (err) {
      setError(err.message);
      console.error('Cart fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchFeaturedSpices = async () => {
    setFeaturedLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/products?page=1&limit=4`
      );

      if (!response.ok) throw new Error('Failed to fetch featured spices');

      const data = await response.json();
      setFeaturedSpices(data.products || []);
    } catch (err) {
      console.error('Featured spices error:', err);
    } finally {
      setFeaturedLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;

    setIsUpdating(true);
    // Optimistic UI update
    const previousCart = { ...cart };
    setCart(prev => {
      const newItems = prev.items.map(item =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      );

      return {
        ...prev,
        items: newItems
      };
    });

    // Recalculate totals immediately
    recalculateTotals();

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/cart/items/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quantity: newQuantity }),
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update quantity');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to update quantity');
      console.error('Update quantity error:', error);
      // Revert on error
      setCart(previousCart);
    } finally {
      setIsUpdating(false);
    }
  };

  const removeItem = async (itemId) => {
    setIsUpdating(true);
    // Optimistic UI update
    const previousCart = { ...cart };
    setCart(prev => {
      const newItems = prev.items.filter(item => item.id !== itemId);
      const newCart = { ...prev, items: newItems };
      setIsCartEmpty(newItems.length === 0);
      return newCart;
    });

    // Recalculate totals immediately
    recalculateTotals();

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/cart/items/${itemId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to remove item');
      }

      toast.success('Item removed from cart');
    } catch (error) {
      toast.error(error.message || 'Failed to remove item');
      console.error('Remove item error:', error);
      setCart(previousCart);
    } finally {
      setIsUpdating(false);
    }
  };

  const recalculateTotals = () => {
    setCart(prev => {
      if (!prev || !prev.items) return prev;

      const subtotal = prev.items.reduce(
        (sum, item) => sum + (item.price * item.quantity), 0
      );

      const shippingCost = subtotal >= 500 ? 0 : 50;
      const taxRate = 0.18;
      const taxes = subtotal * taxRate;
      const total = subtotal + shippingCost + taxes;

      return {
        ...prev,
        subtotal,
        shippingCost,
        taxes,
        total
      };
    });
  };

  const proceedToCheckout = () => {
    if (!cart || cart.items.length === 0) {
      toast.warn('Your cart is empty');
      return;
    }
    // Redirect to checkout page
    // router.push('/checkout');
    toast.info('Proceeding to checkout...');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-6 py-12">
          <div className="animate-pulse bg-white p-8 rounded-xl shadow-lg">
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
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">Your Shopping Cart</h1>

          {!cart || isCartEmpty ? (
            <div className="space-y-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center py-12 bg-white rounded-xl shadow-sm"
              >
                <div className="mx-auto w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center mb-6">
                  <ShoppingBagIcon className="h-12 w-12 text-amber-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-3">Your cart is empty</h2>
                <p className="text-gray-600 max-w-md mx-auto mb-8">
                  Why not explore our premium spices and add some flavor to your cart?
                </p>
                <a
                  href="/shop"
                  className="px-8 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors inline-block font-medium text-lg"
                >
                  Continue Shopping
                </a>
              </motion.div>

              {/* Featured Spices */}
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Featured Spices</h2>
                  <a href="/shop" className="text-sm text-amber-600 hover:text-amber-700 font-medium">
                    View All Spices
                  </a>
                </div>

                {featuredLoading ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="bg-gray-200 aspect-square rounded-lg"></div>
                        <div className="h-5 bg-gray-200 rounded mt-3 w-3/4"></div>
                        <div className="h-4 bg-gray-200 rounded mt-2 w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {featuredSpices.map((spice) => (
                      <a
                        key={spice.id}
                        href={`/spices/${spice.id}`}
                        className="group block transition-transform hover:scale-[1.02]"
                      >
                        <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                          {spice.images?.[0]?.imageUrl ? (
                            <Image
                              src={spice.images[0].imageUrl}
                              alt={spice.name}
                              fill
                              className="object-cover group-hover:opacity-90 transition-opacity"
                              unoptimized // Fixes image loading issue
                            />
                          ) : (
                            <div className="bg-gray-200 w-full h-full flex items-center justify-center">
                              <span className="text-gray-500">No image</span>
                            </div>
                          )}
                        </div>
                        <h3 className="font-medium text-gray-900 mt-3 truncate">{spice.name}</h3>
                        <p className="text-gray-600 text-sm mt-1">
                          From ₹{spice.variants?.[0]?.packs?.[0]?.price?.toFixed(2) || '0.00'}
                        </p>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white p-6 rounded-xl shadow-sm">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">Cart Items ({cart.items.length})</h2>
                    <button
                      onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}
                      className="text-sm text-amber-600 hover:text-amber-700 font-medium"
                    >
                      Proceed to Checkout
                    </button>
                  </div>

                  <div className="divide-y divide-gray-100">
                    <AnimatePresence mode="popLayout">
                      {cart.items.map(item => (
                        <motion.div
                            key={item.id}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            variants={cartItemAnimation}
                            layout
                            className="py-6 first:pt-0 last:pb-0"
                          >
                            <div className="flex gap-6">
                              {/* Product Image */}
                              <div className="relative w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                {isUpdating && (
                                  <div className="absolute inset-0 bg-white/70 flex items-center justify-center rounded-lg z-10">
                                    <svg className="animate-spin h-6 w-6 text-amber-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                  </div>
                                )}
                                {item.imageUrl ? (
                                  <Image
                                    src={item.imageUrl}
                                    alt={item.spiceName || 'Spice'}
                                    fill
                                    className="object-cover"
                                    unoptimized // Fixes image loading issue
                                  />
                                ) : (
                                  <div className="bg-gray-200 w-full h-full flex items-center justify-center">
                                    <span className="text-gray-500">No image</span>
                                  </div>
                                )}
                              </div>

                              {/* Product Details */}
                              <div className="flex-1">
                                <div className="flex justify-between">
                                  <div>
                                    <h3 className="text-lg font-medium text-gray-900">{item.spiceName || 'Unknown Spice'}</h3>
                                    <p className="text-gray-500 text-sm mt-1">
                                      {item.qualityClass || 'N/A'} • {item.packWeightInGrams}g
                                    </p>
                                  </div>
                                  <button
                                    onClick={() => removeItem(item.id)}
                                    className="text-gray-400 hover:text-red-500 transition-colors p-1"
                                    aria-label="Remove item from cart"
                                  >
                                    <TrashIcon className="h-5 w-5" />
                                  </button>
                                </div>

                                <div className="flex justify-between items-center mt-4">
                                  <div className="text-xl font-bold text-amber-700">
                                    ₹{(item.price * item.quantity).toFixed(2)}
                                  </div>

                                  {/* Modern Quantity Controls */}
                                  <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                                    <button
                                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                      disabled={isUpdating || item.quantity <= 1}
                                      className={`px-3 py-1.5 text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors ${
                                        isUpdating || item.quantity <= 1 ? 'opacity-50' : ''
                                      }`}
                                      aria-label="Decrease quantity"
                                    >
                                      <MinusIcon className="h-4 w-4" />
                                    </button>

                                    <span className="px-3 py-1.5 text-gray-800 font-medium min-w-[40px] text-center">
                                      {item.quantity}
                                    </span>

                                    <button
                                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                      disabled={isUpdating}
                                      className={`px-3 py-1.5 text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors ${
                                        isUpdating ? 'opacity-50' : ''
                                      }`}
                                      aria-label="Increase quantity"
                                    >
                                      <PlusIcon className="h-4 w-4" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-white p-6 rounded-xl shadow-sm h-fit lg:sticky lg:top-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Summary</h2>

                <div className="space-y-4 mb-8">
                  <div className="flex justify-between pb-3">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium text-gray-800">₹{cart.subtotal?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between pb-3">
                    <span className="text-gray-600">Shipping</span>
                    <span className={`font-medium ${cart.shippingCost === 0 ? 'text-green-600' : 'text-gray-800'}`}>
                      {cart.shippingCost === 0 ? 'Free' : `₹${cart.shippingCost?.toFixed(2)}`}
                      {cart.subtotal < 500 && (
                        <span className="block text-xs text-gray-500 mt-1">
                          Free shipping on orders over ₹500
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between pb-3">
                    <span className="text-gray-600">Taxes (18% GST)</span>
                    <span className="font-medium text-gray-800">
                      ₹{(cart.subtotal * 0.18).toFixed(2)}
                    </span>
                  </div>
                  <div className="pt-4 mt-4 border-t border-gray-100">
                    <div className="flex justify-between text-lg font-bold text-gray-900">
                      <span>Order Total</span>
                      <span>
                        ₹{cart.total?.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={proceedToCheckout}
                  className="w-full py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg text-lg font-bold
                            hover:from-amber-600 hover:to-amber-700 transition-all shadow-lg"
                >
                  Proceed to Checkout
                </motion.button>

                <div className="mt-6 text-center">
                  <p className="text-gray-500 text-sm mb-2">Accepted Payment Method</p>
                  <div className="flex justify-center items-center gap-2 bg-gray-50 py-2 rounded-lg">
                    <div className="bg-gray-100 w-20 h-6 rounded-sm flex items-center justify-center font-medium text-sm">
                      Razorpay
                    </div>
                  </div>
                </div>

                <a href="/shop" className="block mt-8 text-center text-amber-600 hover:text-amber-700 transition-colors text-sm font-medium">
                  ← Continue Shopping
                </a>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}