// components/checkout/PaymentPage.js (or wherever your PaymentPage component resides)

'use client';

import { useState, useEffect, useCallback } from 'react'; // Added useCallback
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  CreditCardIcon,
  TruckIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import Footer from '@/components/home/Footer';

export default function PaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const addressId = searchParams.get('addressId');
  const tempAddressData = searchParams.get('tempAddress') ? JSON.parse(decodeURIComponent(searchParams.get('tempAddress'))) : null;


  const [user, setUser] = useState(null);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false); // New state to track login
  const [userLoading, setUserLoading] = useState(true);
  const [cart, setCart] = useState(null);

  const [shippingAddress, setShippingAddress] = useState(null);
  const [loading, setLoading] = useState(true); // Overall loading for the page
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [paymentMessage, setPaymentMessage] = useState('');

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('razorpay');

  const showMessage = (msg, isSuccess) => {
    setPaymentMessage(msg);
    setPaymentStatus(isSuccess ? 'success' : 'failure');
    setTimeout(() => {
      setPaymentMessage('');
      setPaymentStatus(null);
    }, 5000);
  };

  // Function to fetch user session
  const checkUserSession = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/check-session`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setIsUserLoggedIn(true);
        setUser(data); // Set the actual user data
      } else {
        setIsUserLoggedIn(false);
        setUser(null);
        router.push('/login?redirect=/checkout/payment'); // Redirect if not logged in
      }
    } catch (err) {
      console.error('Session check error:', err);
      setIsUserLoggedIn(false);
      setUser(null);
      router.push('/login?redirect=/checkout/payment'); // Redirect on error
    } finally {
      setUserLoading(false);
    }
  };

  // Function to fetch cart data
  const fetchCartData = async () => {
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
      // Recalculate totals as a safeguard, though your backend should also provide them
      const subtotal = cartData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const shippingCost = subtotal >= 500 ? 0 : 50;
      const total = subtotal + shippingCost;

      setCart({
        ...cartData,
        subtotal,
        shippingCost,
        total
      });
    } catch (err) {
      console.error('Cart fetch error:', err.message);
      showMessage(err.message, false);
      setCart(null); // Set cart to null to show empty cart message
    }
  };

  // Function to fetch address by ID (used for saved addresses)
  const fetchAddressById = useCallback(async (id) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/me/addresses/${id}`, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch selected address.');
      }
      const data = await response.json();
      if (data.success && data.address) {
        return data.address;
      }
      throw new Error('Address not found or unauthorized.');
    } catch (error) {
      console.error('Error fetching address:', error);
      showMessage('Could not retrieve selected address. Please check your address details.', false);
      return null;
    }
  }, []);

  useEffect(() => {
    const loadAllOrderData = async () => {
      setUserLoading(true);
      await checkUserSession(); // This will set user and handle redirection
    };
    loadAllOrderData();
  }, []); // Run once on component mount

  useEffect(() => {
    if (!userLoading && user) { // Only proceed if user session check is done and user is logged in
      const fetchPageData = async () => {
        setLoading(true);
        try {
          await fetchCartData(); // Fetch the real cart data

          if (addressId) {
            const address = await fetchAddressById(Number(addressId));
            if (address) {
              setShippingAddress(address);
            } else {

              showMessage('Selected address not found. Please review your address or select a new one.', false);
              router.push('/checkout');
            }
          } else if (tempAddressData) {
            // Use temporary address data if available from query param
            setShippingAddress(tempAddressData);
          } else {

            showMessage('No shipping address provided. Please enter or select one.', false);
            router.push('/checkout');
          }
        } catch (error) {
          console.error('Error loading order data:', error);
          // Error messages are already handled by individual fetch functions
        } finally {
          setLoading(false);
        }
      };
      fetchPageData();
    } else if (!userLoading && !user) {
      // If user is not logged in, redirection already handled by checkUserSession
      setLoading(false);
    }
  }, [userLoading, user, addressId, tempAddressData, fetchAddressById, router]); // Depend on userLoading, user, and address data

  // Razorpay script loading remains the same
  useEffect(() => {
    const loadRazorpayScript = () => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => {
        console.log('Razorpay script loaded.');
      };
      script.onerror = (error) => {
        console.error('Failed to load Razorpay script:', error);
        setPaymentMessage('Payment gateway script failed to load. Please refresh.', false);
      };
      document.body.appendChild(script);
    };

    loadRazorpayScript();
  }, []);


  const handlePaymentMethodChange = (e) => {
    setSelectedPaymentMethod(e.target.value);
  };

  const clearCartLocally = async () => {
    // Clear cart on the backend
    try {
      await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/cart/clear`, {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Failed to clear cart on backend:', error);
    }
    // Clear local cart state
    setCart({ items: [], subtotal: 0, shippingCost: 0, total: 0, id: 'new-cart' });
  };


  const handlePlaceOrderAndPay = async () => {
    if (!cart || cart.items.length === 0 || !shippingAddress || !user) {
      showMessage('Missing order details. Please go back to checkout.', false);
      return;
    }

    setLoading(true);
    setPaymentStatus(null);
    setPaymentMessage('Processing your order...');

    try {
      const orderPayload = {
        userId: user.id, // Use actual user ID from state
        cartItems: cart.items.map(item => ({
          spiceId: item.spiceId,
          quantity: item.quantity,
          packWeightInGrams: item.packWeightInGrams,
          price: item.price
        })),
        shippingAddress: shippingAddress,
        paymentMethod: selectedPaymentMethod,
        orderNotes: '',
        totalAmount: cart.total,
      };

      console.log('Sending orderPayload to backend:', orderPayload);

      const orderResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/orders/place`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderPayload),
        credentials: 'include',
      });

      const responseData = await orderResponse.json();

      if (!orderResponse.ok || !responseData.success) {
        throw new Error(responseData.message || 'Failed to initiate order. Please try again.');
      }

      showMessage('Order initiated. Proceeding to payment gateway...', true);

      if (selectedPaymentMethod === 'razorpay' && responseData.razorpayOrderId) {
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: responseData.amount * 100, // Razorpay amounts are in paisa/cents
          currency: "INR",
          name: "Your Store Name",
          description: "Purchase Description",
          order_id: responseData.razorpayOrderId,
          handler: async function (response) {
            console.log("Razorpay Payment Success:", response);
            setPaymentMessage('Payment successful! Verifying order...', true);

            try {
              const verifyResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/payments/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  orderId: responseData.orderId, // Order ID from your backend
                }),
                credentials: 'include',
              });

              const verifyData = await verifyResponse.json();

              if (verifyResponse.ok && verifyData.success) {
                showMessage('Payment verified and order confirmed!', true);
                await clearCartLocally(); // Clear cart on success
                router.push(`/order-confirmation?orderId=${responseData.orderId}`);
              } else {
                throw new Error(verifyData.message || 'Payment verification failed. Please contact support.');
              }
            } catch (verifyErr) {
              console.error('Payment verification error:', verifyErr);
              showMessage(verifyErr.message || 'Error verifying payment. Your order might be pending.', false);
              setPaymentStatus('failure');
            }
          },
          prefill: {
            name: user?.name || '',
            email: user?.email || '',
            contact: shippingAddress.phone || '',
          },
          notes: {
            orderId: responseData.orderId,
          },
          theme: {
            color: "#F59E0B"
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (response) {
          console.error("Razorpay Payment Failed:", response);
          showMessage(response.error.description || 'Payment failed. Please try again.', false);
        });
        rzp.open();

      } else if (selectedPaymentMethod === 'cod') {
        showMessage('Cash on Delivery selected. Order placed successfully!', true);
        await clearCartLocally(); // Clear cart for COD as well
        router.push(`/order-confirmation?orderId=${responseData.orderId}`);
      } else {
          throw new Error('Invalid payment method selected or missing Razorpay Order ID for online payment.');
      }

    } catch (err) {
      console.error('Order/Payment initiation error:', err);
      showMessage(err.message || 'An unexpected error occurred during payment initiation.', false);
      setPaymentStatus('failure');
    } finally {
      setLoading(false);
    }
  };

  if (loading || userLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center text-amber-600">
          <svg className="animate-spin h-10 w-10 text-amber-500 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-4 text-lg font-medium">Loading payment details...</p>
        </div>
      </div>
    );
  }

  // Handle cases where cart is empty after fetching real data
  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-md text-center">
          <XCircleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Cart is Empty</h2>
          <p className="text-gray-600 mb-6">Please add items to your cart before proceeding to payment.</p>
          <button
            onClick={() => router.push('/cart')}
            className="py-3 px-6 bg-amber-500 text-white rounded-lg text-md font-bold
                       hover:bg-amber-600 transition-all shadow-sm"
          >
            Go to Cart
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <main className="flex-grow container mx-auto p-4 md:p-8 lg:px-16">
        <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Payment Options</h2>
              <div className="space-y-4">
                <div className="p-4 border border-gray-200 rounded-lg bg-gray-50 flex items-center gap-4">
                  <input
                    type="radio"
                    id="payByRazorpay"
                    name="paymentMethod"
                    value="razorpay"
                    checked={selectedPaymentMethod === 'razorpay'}
                    onChange={handlePaymentMethodChange}
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
                      src="https://razorpay.com/assets/razorpay-logo.svg"
                      alt="Razorpay"
                      width={60}
                      height={15}
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
                    checked={selectedPaymentMethod === 'cod'}
                    onChange={handlePaymentMethodChange}
                    disabled={cart.total > 5000}
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

            {paymentMessage && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-lg flex items-center gap-3 ${
                  paymentStatus === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}
              >
                {paymentStatus === 'success' ? (
                  <CheckCircleIcon className="h-6 w-6" />
                ) : (
                  <XCircleIcon className="h-6 w-6" />
                )}
                <p className="font-medium">{paymentMessage}</p>
              </motion.div>
            )}

            <div className="flex flex-col gap-4 mt-8">
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={handlePlaceOrderAndPay}
                disabled={loading || !shippingAddress || !cart || cart.items.length === 0}
                className={`w-full py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg text-lg font-bold
                            hover:from-amber-600 hover:to-amber-700 transition-all shadow-lg
                            ${(loading || !shippingAddress || !cart || cart.items.length === 0) ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {loading ? 'Processing...' : `Pay ₹${cart?.total?.toFixed(2) || '0.00'}`}
              </motion.button>
              <a
                href="/checkout"
                className="block text-center text-amber-600 hover:text-amber-700 transition-colors text-base font-medium"
              >
                ← Return to Checkout
              </a>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm h-fit lg:sticky lg:top-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Summary</h2>

            <div className="space-y-4 mb-6">
              <div className="border-b border-gray-100 pb-4">
                <h3 className="font-semibold text-gray-800 mb-3">{cart?.items?.length || 0} item{cart?.items?.length !== 1 ? 's' : ''}</h3>
                {cart?.items?.map(item => (
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

            <div className="space-y-4 mb-8">
              <div className="flex justify-between pb-3">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium text-gray-800">₹{cart?.subtotal?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="flex justify-between pb-3">
                <span className="text-gray-600">Delivery</span>
                <span className={`font-medium ${cart?.shippingCost === 0 ? 'text-green-600' : 'text-gray-800'}`}>
                  {cart?.shippingCost === 0 ? 'Free' : `₹${cart?.shippingCost?.toFixed(2) || '0.00'}`}
                </span>
              </div>
              <div className="pt-4 mt-4 border-t border-gray-100">
                <div className="flex justify-between text-lg font-bold text-gray-900">
                  <span>Order Total</span>
                  <span>
                    ₹{cart?.total?.toFixed(2) || '0.00'}
                  </span>
                </div>
              </div>
            </div>

            {shippingAddress && (
              <div className="mt-8 pt-6 border-t border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Shipping Address</h3>
                <div className="text-gray-700 text-sm space-y-1">
                  <p className="font-medium">{shippingAddress.firstName} {shippingAddress.lastName}</p>
                  <p>{shippingAddress.addressLine1}</p>
                  {shippingAddress.addressLine2 && <p>{shippingAddress.addressLine2}</p>}
                  <p>{shippingAddress.city}, {shippingAddress.state} - {shippingAddress.pinCode}</p>
                  {shippingAddress.phone && <p>Phone: {shippingAddress.phone}</p>}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}