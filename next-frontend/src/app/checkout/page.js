"use client";

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Header from '@/components/home/Header';
import Footer from '@/components/home/Footer';
import { CreditCardIcon, TruckIcon, MapPinIcon, PlusCircleIcon, PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import { ShoppingBagIcon } from '@heroicons/react/24/solid';
import { useRouter } from 'next/navigation';


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
  const [formMessage, setFormMessage] = useState('');

  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pinCode: '',
    phone: '',
    note: '',
    billingSameAsShipping: true,
  });

  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [userSessionData, setUserSessionData] = useState(null);

  const router = useRouter();


  const showMessage = (msg, isSuccess = false) => {
    setFormMessage(msg);
    setTimeout(() => setFormMessage(''), 5000);
  };

  const fetchCart = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/cart`, {
        credentials: 'include'
      });

      if (!response.ok) {
        if (response.status === 404) {
          setCart({ items: [] });
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
      recalculateTotals(cartData);
    } catch (err) {
      setError(err.message);
      console.error('Cart fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserAddresses = useCallback(async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/me/addresses`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && Array.isArray(data.addresses) && data.addresses.length > 0) {
          setSavedAddresses(data.addresses);
          if (!selectedAddressId || !data.addresses.some(addr => addr.id === selectedAddressId)) {
            setSelectedAddressId(data.addresses[0].id);
            setFormDataFromAddress(data.addresses[0]);
            setIsEditingAddress(false);
          } else {
            const currentSelected = data.addresses.find(addr => addr.id === selectedAddressId);
            if (currentSelected) {
                setFormDataFromAddress(currentSelected);
            }
            setIsEditingAddress(false);
          }
        } else {

          setSavedAddresses([]);
          setSelectedAddressId(null);
          resetFormDataForNewAddress();
          setIsEditingAddress(false);


        }
      } else {

          let errorMessage = 'Failed to fetch user addresses. Please try again.';
          try {
            const errorData = await response.json();
            if (errorData && errorData.message) {
              errorMessage = errorData.message;
            }
            console.error('Failed to fetch user addresses:', errorData);
          } catch (jsonError) {

            console.error('Failed to parse error response:', response.status, response.statusText);
            errorMessage = `Failed to fetch user addresses. Server responded with status: ${response.status} ${response.statusText || ''}.`;
          }


          console.error('Error fetching user addresses (non-OK response):', errorMessage);
          setSavedAddresses([]);
          setSelectedAddressId(null);
          resetFormDataForNewAddress();
          setIsEditingAddress(false);
        }
    } catch (err) {

      console.error('Network or unexpected error fetching user addresses:', err);

      setSavedAddresses([]);
      setSelectedAddressId(null);
      resetFormDataForNewAddress();
      setIsEditingAddress(false);
    }
  }, [selectedAddressId, isUserLoggedIn, userSessionData]);

  const checkUserSession = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/check-session`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setIsUserLoggedIn(true);
        setUserSessionData(data);


        setFormData(prev => ({
          ...prev,
          email: data.email || prev.email,
          firstName: data.firstName || prev.firstName,
          lastName: data.lastName || prev.lastName,
        }));

        await fetchUserAddresses();
      } else {
        setIsUserLoggedIn(false);
        setUserSessionData(null);
        setSavedAddresses([]);
        setSelectedAddressId(null);

        setIsEditingAddress(false);
      }
    } catch (err) {
      console.error('Session check error:', err);
      setIsUserLoggedIn(false);
      setUserSessionData(null);
      setSavedAddresses([]);
      setSelectedAddressId(null);
      setIsEditingAddress(false);
    }
  };

  const resetFormDataForNewAddress = () => {
    setFormData(prev => ({
      ...prev,

      email: isUserLoggedIn && userSessionData ? userSessionData.email : prev.email,
      firstName: isUserLoggedIn && userSessionData ? userSessionData.firstName : prev.firstName,
      lastName: isUserLoggedIn && userSessionData ? userSessionData.lastName : prev.lastName,
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      pinCode: '',
      phone: '',
      note: '',
      billingSameAsShipping: true,
    }));
  };

  const setFormDataFromAddress = (address) => {
    setFormData(prev => ({
      ...prev,

      email: isUserLoggedIn && userSessionData ? userSessionData.email : prev.email,
      firstName: address.firstName,
      lastName: address.lastName,
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2 || '',
      city: address.city,
      state: address.state,
      pinCode: address.pinCode,
      phone: address.phone || '',
      note: address.note || '',
      billingSameAsShipping: address.billingSameAsShipping,
    }));
  };

  useEffect(() => {
    fetchCart();
    checkUserSession();
  }, []);


  const recalculateTotals = (currentCart) => {
    if (!currentCart || !currentCart.items) return;
    const subtotal = currentCart.items.reduce(
      (sum, item) => sum + (item.price * item.quantity), 0
    );
    const shippingCost = subtotal >= 500 ? 0 : 50;
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

  const handleAddressSelection = (e) => {
    const id = e.target.value === 'new' ? null : Number(e.target.value);
    setSelectedAddressId(id);
    setIsEditingAddress(false);

    if (id === null) {
      resetFormDataForNewAddress();
    } else {
      const address = savedAddresses.find(addr => addr.id === id);
      if (address) {
        setFormDataFromAddress(address);
      }
    }
  };

  const validateAddressForm = () => {
    if (!formData.email || !formData.firstName || !formData.lastName ||
        !formData.addressLine1 || !formData.city || !formData.state || !formData.pinCode) {
      showMessage('Please fill in all required shipping details.', false);
      return false;
    }
    return true;
  };

  const handleSaveAddress = async () => {
    if (!validateAddressForm()) {
      return;
    }

    if (!isUserLoggedIn) {
        showMessage('You must be logged in to save an address.', false);
        return;
    }

    setFormMessage('Saving address...');
    try {
        const payload = {
            firstName: formData.firstName,
            lastName: formData.lastName,
            addressLine1: formData.addressLine1,
            addressLine2: formData.addressLine2,
            city: formData.city,
            state: formData.state,
            pinCode: formData.pinCode,
            phone: formData.phone,
            note: formData.note,
            billingSameAsShipping: formData.billingSameAsShipping,
        };

        let response;
        let data;

        if (isEditingAddress && selectedAddressId) {
            response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/me/addresses/${selectedAddressId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
                credentials: 'include',
            });
        } else {
            response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/me/addresses`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
                credentials: 'include',
            });
        }

        data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(data.message || 'Failed to save address.');
        }

        showMessage(`Address ${isEditingAddress ? 'updated' : 'saved'} successfully!`, true);
        await fetchUserAddresses();
        if (!isEditingAddress && data.address && data.address.id) {
            setSelectedAddressId(data.address.id);
        }
        setIsEditingAddress(false);
    } catch (err) {
        showMessage(err.message, false);
        console.error('Error saving address:', err);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm('Are you sure you want to delete this address?')) {
        return;
    }
    setFormMessage('Deleting address...');
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/me/addresses/${addressId}`, {
            method: 'DELETE',
            credentials: 'include',
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(data.message || 'Failed to delete address.');
        }

        showMessage('Address deleted successfully!', true);
        await fetchUserAddresses();
        setSelectedAddressId(null);
        resetFormDataForNewAddress();
    } catch (err) {
        showMessage(err.message, false);
        console.error('Error deleting address:', err);
    }
  };

  const handleSubmit = async (e) => {
      e.preventDefault();
      setFormMessage('');

      if (!selectedAddressId && (!isEditingAddress && !validateAddressForm())) {
          showMessage('Please complete your shipping address details.', false);
          return;
      }

      if (!cart || cart.items.length === 0) {
        showMessage('Your cart is empty. Cannot proceed to payment.', false);
        return;
      }

      if (isEditingAddress) {
          showMessage('Please save the edited address or cancel editing before proceeding.', false);
          return;
      }

      showMessage('Redirecting to payment...', true);

      if (selectedAddressId) {
          router.push(`/checkout/payment?addressId=${selectedAddressId}`);
      } else {

          router.push(`/checkout/payment`);
      }
  };

  const isPlaceOrderDisabled = () => {
    if (!selectedAddressId && !isEditingAddress) return true;
    if ((selectedAddressId === null || isEditingAddress) && !validateAddressForm()) {
        return true;
    }
    if (isEditingAddress) {
        return true;
    }
    return false;
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

              {/* Shipping Address Selection/Input */}
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Shipping Address</h2>
                <p className="text-gray-600 mb-4 text-sm">Enter the address where you want your order delivered.</p>

                {isUserLoggedIn && savedAddresses.length > 0 && (
                  <div className="mb-6 border p-4 rounded-lg bg-gray-50">
                    <label htmlFor="addressSelection" className="block text-sm font-medium text-gray-700 mb-2">
                      Choose a saved address or add a new one:
                    </label>
                    <div className="relative flex items-center gap-2">
                        <MapPinIcon className="h-5 w-5 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <select
                        id="addressSelection"
                        name="addressSelection"
                        value={selectedAddressId === null ? 'new' : selectedAddressId}
                        onChange={handleAddressSelection}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 pl-10 pr-10 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm bg-white appearance-none"
                        >
                        {savedAddresses.map((address) => (
                            <option key={address.id} value={address.id}>
                            {`${address.addressLine1}, ${address.city}, ${address.state} - ${address.pinCode}`}
                            </option>
                        ))}
                        <option value="new">Add a new address</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                        </div>
                    </div>
                    {selectedAddressId && !isEditingAddress && (
                        <div className="mt-4 flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => setIsEditingAddress(true)}
                                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                            >
                                <PencilSquareIcon className="-ml-0.5 mr-2 h-4 w-4" aria-hidden="true" />
                                Edit Selected
                            </button>
                            <button
                                type="button"
                                onClick={() => handleDeleteAddress(selectedAddressId)}
                                className="inline-flex items-center px-3 py-2 border border-red-300 shadow-sm text-sm leading-4 font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            >
                                <TrashIcon className="-ml-0.5 mr-2 h-4 w-4" aria-hidden="true" />
                                Delete
                            </button>
                        </div>
                    )}
                  </div>
                )}

                {(selectedAddressId === null || isEditingAddress) && ( // Show form if new or editing existing
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4 overflow-hidden" // overflow-hidden to prevent jump on animation
                  >
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
                      <label htmlFor="addressLine1" className="block text-sm font-medium text-gray-700 mb-2">
                        Address Line 1 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="addressLine1"
                        name="addressLine1"
                        value={formData.addressLine1}
                        onChange={handleInputChange}
                        placeholder="Street address, P.O. Box"
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                      />
                    </div>

                    <div className="mt-4">
                      <label htmlFor="addressLine2" className="block text-sm font-medium text-gray-700 mb-2">
                        Address Line 2 (Apartment, suite, etc. - optional)
                      </label>
                      <input
                        type="text"
                        id="addressLine2"
                        name="addressLine2"
                        value={formData.addressLine2}
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

                    {/* Order Notes */}
                      <div className="mt-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Delivery Instructions</h3>
                        <div>
                          <label htmlFor="note" className="block text-sm font-medium text-gray-700 mb-2">
                            Special delivery instructions (optional)
                          </label>
                          <textarea
                            id="note"
                            name="note"
                            rows="4"
                            value={formData.note}
                            onChange={handleInputChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                            placeholder="e.g., 'Ring doorbell twice', 'Deliver to back entrance', 'Call before delivery'"
                          ></textarea>
                        </div>
                      </div>

                    <div className="mt-6 flex items-center">
                      <input
                        type="checkbox"
                        id="useSameAddressForBilling"
                        name="billingSameAsShipping"
                        checked={formData.billingSameAsShipping}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                      />
                      <label htmlFor="useSameAddressForBilling" className="ml-2 block text-sm text-gray-900">
                        Use same address for billing
                      </label>
                    </div>

                    {isUserLoggedIn && (selectedAddressId === null || isEditingAddress) && (
                        <div className="mt-6">
                            <motion.button
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                                type="button"
                                onClick={handleSaveAddress}
                                className="w-full py-3 bg-amber-500 text-white rounded-lg text-md font-bold
                                            hover:bg-amber-600 transition-all shadow-sm flex items-center justify-center gap-2"
                            >
                                {isEditingAddress ? (
                                    <>
                                        <PencilSquareIcon className="h-5 w-5" />
                                        <span>Update Address</span>
                                    </>
                                ) : (
                                    <>
                                        <PlusCircleIcon className="h-5 w-5" />
                                        <span>Save Address</span>
                                    </>
                                )}
                            </motion.button>
                            {isEditingAddress && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsEditingAddress(false);
                                        // Revert to selected address data if editing is cancelled
                                        if (selectedAddressId) {
                                            const originalAddress = savedAddresses.find(addr => addr.id === selectedAddressId);
                                            if (originalAddress) {
                                                setFormDataFromAddress(originalAddress);
                                            }
                                        }
                                    }}
                                    className="mt-2 w-full py-2 text-center text-gray-600 hover:text-gray-800 transition-colors text-sm font-medium"
                                >
                                    Cancel Edit
                                </button>
                            )}
                        </div>
                    )}
                  </motion.div>
                )}
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
                  <span className={`font-semibold ${cart.shippingCost === 0 ? 'text-green-600' : 'text-gray-800'}`}>
                    {cart.shippingCost === 0 ? 'Free Shipping' : `₹${cart.shippingCost?.toFixed(2)}`}
                  </span>
                </div>
              </div>

              {/* Payment Methods */}
                <div className="bg-white p-6 rounded-xl shadow-sm">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Payment Methods</h2>
                  <div className="mt-6 text-center">
                    <p className="text-gray-500 text-sm mb-2">Accepted Payment Methods</p>
                    <div className="flex justify-center items-center gap-4 bg-gray-50 py-3 rounded-lg">
                      {/* Razorpay Logo */}
                      <div className="flex items-center justify-center">
                        <Image
                          src="https://razorpay.com/assets/razorpay-logo.svg"
                          alt="Razorpay"
                          width={80}
                          height={20}
                          className="object-contain"
                          unoptimized
                        />
                      </div>
                      {/* Cash on Delivery */}
                      <div className="flex items-center gap-1 bg-gray-100 px-3 py-1.5 rounded-md font-medium text-sm text-gray-700">
                        <TruckIcon className="h-5 w-5 text-gray-500" />
                        <span>Cash on Delivery</span>
                        {cart.total > 5000 && (
                          <span className="text-red-500 text-xs ml-1">
                            (Not available for orders over ₹5000)
                          </span>
                        )}
                      </div>
                    </div>
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
                  disabled={isPlaceOrderDisabled()} // Disable based on new logic
                  className={`w-full py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg text-lg font-bold
                            hover:from-amber-600 hover:to-amber-700 transition-all shadow-lg
                            ${isPlaceOrderDisabled() ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  Proceed to Payment
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