"use client";

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Header from '@/components/home/Header';
import Footer from '@/components/home/Footer';
import { CreditCardIcon, TruckIcon } from '@heroicons/react/24/outline'; // For payment icons
import { ShoppingBagIcon } from '@heroicons/react/24/solid'; // For empty cart icon
import { useRouter } from 'next/navigation'; // Import useRouter for navigation

// Dummy data for states - replace with actual data or fetch from an API if needed
const indianStates = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Ladakh", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya",
  "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim",
  "Tamil Nadu", "Telangana", "Tripura", "Uttarakhand", "Uttar Pradesh",
  "West Bengal", "Andaman and Nicobar Islands", "Chandigarh",
  "Dadra and Nagar Haveli", "Daman and Diu", "Delhi", "Lakshadweep",
  "Puducherry (Pondicherry)"
];

export default function CheckoutPage() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formMessage, setFormMessage] = useState(''); // For form-related messages

  // Form state
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    address: '',
    apartment: '',
    city: '',
    state: '',
    pinCode: '',
    phone: '',
    useSameAddressForBilling: true,
  });
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false); // State to track login status

  const router = useRouter(); // Initialize the router

  const fetchCart = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/cart`, {
        credentials: 'include'
      });

      if (!response.ok) {
        if (response.status === 404) {
          setCart({ items: [] }); // Cart is empty
          throw new Error('Your cart is empty. Please add items before checking out.');
        }
        throw new Error('Failed to fetch cart. Please try again.');
      }

      const cartData = await response.json();
      if (!cartData || cartData.items.length === 0) {
        setCart({ items: [] });
        throw new Error('Your cart is empty. Please add items before checking out.');
      }
      setCart(cartData);
      recalculateTotals(cartData); // Recalculate totals on fetch
    } catch (err) {
      setError(err.message);
      console.error('Cart fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const checkUserSession = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/check-session`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setIsUserLoggedIn(true);
        // Pre-fill email, first name, and last name if user is logged in
        setFormData(prev => ({
          ...prev,
          email: data.email || '',
          firstName: data.firstName || '',
          lastName: data.lastName || '',
        }));
      } else {
        setIsUserLoggedIn(false);
      }
    } catch (err) {
      console.error('Session check error:', err);
      setIsUserLoggedIn(false);
    }
  };

  useEffect(() => {
    fetchCart();
    checkUserSession(); // Check user session on component mount
  }, []);

  // Function to recalculate totals based on the provided cart data
  const recalculateTotals = (currentCart) => {
    if (!currentCart || !currentCart.items) return;

    const subtotal = currentCart.items.reduce(
      (sum, item) => sum + (item.price * item.quantity), 0
    );

    const shippingCost = subtotal >= 500 ? 0 : 50; // Free shipping logic for orders over ₹500
    const total = subtotal + shippingCost;

    setCart(prev => ({
      ...prev,
      subtotal,
      shippingCost,
      total
    }));
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormMessage('');
    // Basic form validation
    if (!formData.email || !formData.firstName || !formData.lastName ||
        !formData.address || !formData.city || !formData.state || !formData.pinCode) {
      setFormMessage('Please fill in all required shipping details.');
      setTimeout(() => setFormMessage(''), 5000);
      return;
    }

    if (!cart || cart.items.length === 0) {
      setFormMessage('Your cart is empty. Cannot place an order.');
      setTimeout(() => setFormMessage(''), 5000);
      return;
    }

    console.log('Checkout Form Data:', formData);
    console.log('Cart to be processed:', cart);

    setFormMessage('Proceeding with order...');
    // Simulate API call
    try {
      // In a real application, you would send this data to your backend
      // for order creation and payment processing.
      // This is where Razorpay integration would typically be initiated client-side
      // after the order is created on your backend.

      // Example: Call a backend endpoint to create an order
      // const orderResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/orders`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({
      //     cartItems: cart.items,
      //     shippingAddress: formData,
      //     paymentMethod: 'razorpay', // or 'cod' based on user selection
      //     totalAmount: cart.total,
      //   }),
      //   credentials: 'include'
      // });

      // if (!orderResponse.ok) {
      //   const errorData = await orderResponse.json();
      //   throw new Error(errorData.message || 'Failed to place order.');
      // }

      // const orderData = await orderResponse.json();
      setFormMessage('Order placed successfully! Redirecting...');
      // After successful order creation (backend), you would typically initiate Razorpay payment
      // For demo, we just show an alert and simulate redirect
      setTimeout(() => {
        alert('Order placed successfully! (This is a demo, no actual order was placed)');
        // router.push(`/order-confirmation/${orderData.orderId}`); // Redirect to confirmation page
      }, 2000);

    } catch (err) {
      setFormMessage(err.message || 'An error occurred while placing your order.');
      setTimeout(() => setFormMessage(''), 5000);
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-6 py-12">
          <div className="animate-pulse bg-white p-8 rounded-xl shadow-lg">
            <div className="h-10 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="space-y-6">
              <div className="h-48 bg-gray-100 rounded-xl"></div>
              <div className="h-48 bg-gray-100 rounded-xl"></div>
              <div className="h-32 bg-gray-100 rounded-xl"></div>
            </div>
            <div className="mt-8 h-20 bg-gray-100 rounded-xl"></div>
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
            <h2 className="text-2xl font-bold text-red-800 mb-4">Checkout Error</h2>
            <p className="text-red-700 mb-6">{error}</p>
            {cart && cart.items.length === 0 ? (
                <a href="/shop" className="inline-block px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700">
                    Continue Shopping
                </a>
            ) : (
                <a href="/cart" className="inline-block px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700">
                    Return to Cart
                </a>
            )}
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-6 py-24 text-center">
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
                  Looks like there are no items in your cart to checkout.
                </p>
                <a
                  href="/shop"
                  className="px-8 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors inline-block font-medium text-lg"
                >
                  Continue Shopping
                </a>
              </motion.div>
        </div>
        <Footer />
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="container mx-auto px-4 lg:px-8 py-12">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">Checkout</h1>

            {formMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className={`mb-6 p-4 rounded-lg shadow-sm text-center font-medium ${
                  formMessage.includes('successfully') ? 'bg-green-100 border border-green-200 text-green-800' : 'bg-red-100 border border-red-200 text-red-800'
                }`}
              >
                {formMessage}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Contact Information */}
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact Information</h2>
                <div className="mb-4">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="your_email@example.com"
                    required
                    // Disable if user is logged in
                    disabled={isUserLoggedIn}
                    className={`mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm ${isUserLoggedIn ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                  />
                  <p className="mt-2 text-sm text-gray-500">
                    We'll use this email to send you details and updates about your order.
                  </p>
                  {!isUserLoggedIn && (
                    <p className="mt-2 text-sm text-gray-600">
                      You are currently checking out as a guest.
                      <a href="/my-account" className="text-amber-600 hover:text-amber-700 ml-1 font-medium">
                        Log in
                      </a> or{' '}
                      <a href="/my-account?tab=signup" className="text-amber-600 hover:text-amber-700 ml-1 font-medium">
                        create an account
                      </a> with KSR Farms to save your details for faster checkout.
                    </p>
                  )}
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Shipping Address</h2>
                <p className="text-gray-600 mb-4 text-sm">Enter the address where you want your order delivered.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                      First name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                      Last name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                    Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Street address, P.O. Box"
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                  />
                </div>

                <div className="mt-4">
                  <label htmlFor="apartment" className="block text-sm font-medium text-gray-700 mb-2">
                    Apartment, suite, etc. (optional)
                  </label>
                  <input
                    type="text"
                    id="apartment"
                    name="apartment"
                    value={formData.apartment}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                  />
                </div>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                      City <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-2">
                      State <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm bg-white"
                    >
                      <option value="">Select State</option>
                      {indianStates.map((state) => (
                        <option key={state} value={state}>
                          {state}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="pinCode" className="block text-sm font-medium text-gray-700 mb-2">
                      PIN Code <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="pinCode"
                      name="pinCode"
                      value={formData.pinCode}
                      onChange={handleInputChange}
                      required
                      pattern="[0-9]{6}"
                      title="Please enter a 6-digit PIN code"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                      Phone (optional)
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                    />
                  </div>
                </div>

                <div className="mt-6 flex items-center">
                  <input
                    type="checkbox"
                    id="useSameAddressForBilling"
                    name="useSameAddressForBilling"
                    checked={formData.useSameAddressForBilling}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                  />
                  <label htmlFor="useSameAddressForBilling" className="ml-2 block text-sm text-gray-900">
                    Use same address for billing
                  </label>
                </div>
              </div>

              {/* Shipping Options */}
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Shipping Options</h2>
                <div className="p-4 border border-gray-200 rounded-lg bg-gray-50 flex justify-between items-center">
                  <label className="flex items-center space-x-3 text-gray-800 font-medium">
                    <input
                      type="radio"
                      name="shippingMethod"
                      value="flatRate"
                      checked // Only one option for now
                      readOnly
                      className="h-4 w-4 text-amber-600 border-gray-300 focus:ring-amber-500"
                    />
                    <span>Flat rate</span>
                  </label>
                  <span className="font-semibold">₹{cart.shippingCost?.toFixed(2)}</span>
                </div>
              </div>

              {/* Payment Options */}
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Payment Options</h2>
                <div className="space-y-4">
                  <div className="p-4 border border-gray-200 rounded-lg bg-gray-50 flex items-center gap-4">
                    <input
                      type="radio"
                      id="payByRazorpay"
                      name="paymentMethod"
                      value="razorpay"
                      checked // Default selected
                      readOnly
                      className="h-4 w-4 text-amber-600 border-gray-300 focus:ring-amber-500"
                    />
                    <label htmlFor="payByRazorpay" className="flex-1">
                      <div className="font-medium text-gray-800 flex items-center gap-2">
                        <CreditCardIcon className="h-5 w-5 text-gray-600" />
                        <span>Pay by Razorpay</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        Pay securely by Credit or Debit card or Internet Banking through Razorpay.
                      </p>
                    </label>
                    <Image
                        src="https://razorpay.com/assets/razorpay-logo.svg" // Official Razorpay logo URL
                        alt="Razorpay"
                        width={60} // Adjust width as needed
                        height={15} // Adjust height as needed
                        className="object-contain"
                        unoptimized
                    />
                  </div>

                  <div className="p-4 border border-gray-200 rounded-lg bg-gray-50 flex items-center gap-4">
                    <input
                      type="radio"
                      id="payByCod"
                      name="paymentMethod"
                      value="cod"
                      disabled={cart.total > 5000} // Example: Disable COD for large orders
                      className="h-4 w-4 text-amber-600 border-gray-300 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <label htmlFor="payByCod" className="flex-1 flex flex-col">
                      <div className="font-medium text-gray-800 flex items-center gap-2">
                        <TruckIcon className="h-5 w-5 text-gray-600" />
                        <span>Cash on Delivery</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        Pay with cash upon delivery.
                        {cart.total > 5000 && (
                          <span className="text-red-500 block text-xs">
                            (COD not available for orders over ₹5000)
                          </span>
                        )}
                      </p>
                    </label>
                  </div>
                </div>
              </div>

              {/* Order Notes */}
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Additional Information</h2>
                <div>
                  <label htmlFor="orderNotes" className="block text-sm font-medium text-gray-700 mb-2">
                    Add a note to your order (optional)
                  </label>
                  <textarea
                    id="orderNotes"
                    name="orderNotes"
                    rows="4"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                    placeholder="e.g., 'Deliver after 5 PM', 'Leave at doorstep'"
                  ></textarea>
                </div>
              </div>

              {/* Terms and Conditions */}
              <div className="text-center text-sm text-gray-600">
                By proceeding with your purchase you agree to our{' '}
                <a href="/terms" className="text-amber-600 hover:text-amber-700 font-medium">
                  Terms and Conditions
                </a>{' '}
                and{' '}
                <a href="/privacy" className="text-amber-600 hover:text-amber-700 font-medium">
                  Privacy Policy
                </a>
                .
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-4 mt-8">
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  type="submit"
                  className="w-full py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg text-lg font-bold
                            hover:from-amber-600 hover:to-amber-700 transition-all shadow-lg"
                >
                  Place Order
                </motion.button>
                <a
                  href="/cart"
                  className="block text-center text-amber-600 hover:text-amber-700 transition-colors text-base font-medium"
                >
                  ← Return to Cart
                </a>
              </div>
            </form>
          </div>

          {/* Order Summary */}
          <div className="bg-white p-6 rounded-xl shadow-sm h-fit lg:sticky lg:top-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Summary</h2>

            {/* Items in order */}
            <div className="space-y-4 mb-6">
              <div className="border-b border-gray-100 pb-4">
                <h3 className="font-semibold text-gray-800 mb-3">{cart.items.length} item{cart.items.length !== 1 ? 's' : ''}</h3>
                {cart.items.map(item => (
                  <div key={item.id} className="flex justify-between items-start text-sm mb-2">
                    <div className="flex items-center space-x-3">
                      <div className="relative w-12 h-12 rounded-md overflow-hidden flex-shrink-0 border border-gray-100">
                        {item.imageUrl ? (
                          <Image
                            src={item.imageUrl}
                            alt={item.spiceName || 'Product'}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        ) : (
                          <div className="bg-gray-200 w-full h-full flex items-center justify-center">
                            <span className="text-gray-500 text-xs">No image</span>
                          </div>
                        )}
                        <span className="absolute -top-2 -right-2 bg-amber-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                          {item.quantity}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{item.spiceName}</p>
                        <p className="text-gray-500">{item.packWeightInGrams}g</p>
                      </div>
                    </div>
                    <span className="font-medium text-gray-800">₹{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="space-y-4 mb-8">
              <div className="flex justify-between pb-3">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium text-gray-800">₹{cart.subtotal?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between pb-3">
                <span className="text-gray-600">Delivery</span>
                <span className={`font-medium ${cart.shippingCost === 0 ? 'text-green-600' : 'text-gray-800'}`}>
                  {cart.shippingCost === 0 ? 'Free' : `₹${cart.shippingCost?.toFixed(2)}`}
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
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}