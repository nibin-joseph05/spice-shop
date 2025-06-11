// src/app/my-profile/order-details/[orderId]/page.jsx
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation'; // For Next.js App Router
import { motion } from 'framer-motion';
import { FiArrowLeft, FiTag, FiCalendar, FiDollarSign, FiPackage, FiCreditCard } from 'react-icons/fi';
import Image from 'next/image';
import Link from 'next/link'; // For the back button
import Header from '@/components/home/Header';
import Footer from '@/components/home/Footer';

export default function OrderDetailsPage() {
  const { orderId } = useParams(); // Get orderId from the URL
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  useEffect(() => {
    if (!orderId) return;

    const fetchOrderDetails = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`${backendUrl}/api/orders/${orderId}`, {
          credentials: 'include',
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
        }

        const apiResponse = await response.json();
        if (apiResponse.success) {
          setOrder(apiResponse.data);
        } else {
          setError(apiResponse.message || "Failed to fetch order details.");
        }
      } catch (e) {
        console.error('Error fetching order details:', e);
        setError(e.message || "An unexpected error occurred while fetching order details.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId, backendUrl]);

  const getStatusClasses = (status) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'PROCESSING':
        return 'bg-blue-100 text-blue-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      case 'FAILED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-green-50/50 to-white">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <p className="text-gray-600">Loading order details...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-green-50/50 to-white">
        <Header />
        <main className="flex-grow flex flex-col items-center justify-center p-4">
          <p className="text-red-600 font-semibold text-lg mb-4">{error}</p>
          <Link href="/my-profile?tab=orders" passHref>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-full
                         hover:bg-green-700 transition-colors duration-200 shadow-md"
            >
              <FiArrowLeft className="mr-2" /> Back to Orders
            </motion.button>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-green-50/50 to-white">
        <Header />
        <main className="flex-grow flex flex-col items-center justify-center p-4">
          <p className="text-gray-600 font-semibold text-lg mb-4">Order not found.</p>
          <Link href="/my-profile?tab=orders" passHref>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-full
                         hover:bg-green-700 transition-colors duration-200 shadow-md"
            >
              <FiArrowLeft className="mr-2" /> Back to Orders
            </motion.button>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-green-50/50 to-white">
      <Header />
      <main className="flex-grow py-12 md:py-16">
        <div className="container mx-auto px-4 md:px-6 max-w-4xl">
          <Link href="/my-profile?tab=orders" passHref>
            <motion.button
              whileHover={{ x: -5 }}
              className="inline-flex items-center text-green-700 hover:text-green-900 transition-colors mb-6"
            >
              <FiArrowLeft className="mr-2" /> Back to Order History
            </motion.button>
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-xl shadow-xl p-6 md:p-8"
          >
            <h1 className="text-3xl font-bold text-green-900 mb-6 flex items-center gap-3">
              <FiPackage className="text-amber-700" /> Order Details #{order.orderNumber || order.id}
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Order Summary */}
              <div>
                <h2 className="text-xl font-semibold text-green-800 mb-3 flex items-center">
                  <FiTag className="mr-2 text-amber-600" /> Summary
                </h2>
                <div className="space-y-2 text-gray-700">
                  <p className="flex justify-between items-center">
                    <span className="font-medium">Order Date:</span>
                    <span className="text-gray-600">
                      {new Date(order.orderDate).toLocaleDateString('en-GB', {
                        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}
                    </span>
                  </p>
                  <p className="flex justify-between items-center">
                    <span className="font-medium">Total Amount:</span>
                    <span className="text-amber-700 text-lg font-bold">₹{order.totalAmount.toFixed(2)}</span>
                  </p>
                  <p className="flex justify-between items-center">
                    <span className="font-medium">Order Status:</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusClasses(order.orderStatus)}`}>
                      {order.orderStatus}
                    </span>
                  </p>
                  {order.paymentStatus && (
                    <p className="flex justify-between items-center">
                      <span className="font-medium">Payment Status:</span>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusClasses(order.paymentStatus)}`}>
                        {order.paymentStatus}
                      </span>
                    </p>
                  )}
                  {order.paymentMethod && (
                    <p className="flex justify-between items-center">
                      <span className="font-medium">Payment Method:</span>
                      <span className="capitalize flex items-center">
                        <FiCreditCard className="mr-1 text-gray-500" /> {order.paymentMethod.replace(/_/g, ' ').toLowerCase()}
                      </span>
                    </p>
                  )}
                </div>
              </div>

              {/* Shipping Address */}
              {order.shippingAddress && (
                <div>
                  <h2 className="text-xl font-semibold text-green-800 mb-3 flex items-center">
                    <FiCalendar className="mr-2 text-amber-600" /> Shipping Address
                  </h2>
                  <div className="space-y-1 text-gray-700">
                    <p>{order.shippingAddress.addressLine1}</p>
                    {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
                    <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}</p>
                    <p>{order.shippingAddress.country}</p>
                    <p className="font-medium">Phone: {order.shippingAddress.phoneNumber}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Order Items */}
            <h2 className="text-xl font-semibold text-green-800 mb-4 flex items-center">
              <FiDollarSign className="mr-2 text-amber-600" /> Items in this Order
            </h2>
            <div className="space-y-4">
              {order.items && order.items.length > 0 ? (
                order.items.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center p-4 bg-green-50 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
                  >
                    {item.imageUrl && (
                      <Image
                        src={item.imageUrl || '/placeholder-spice.jpg'}
                        alt={item.spiceName}
                        width={80}
                        height={80}
                        className="rounded-lg object-cover mr-4 border border-green-200"
                      />
                    )}
                    <div className="flex-grow">
                      <h3 className="text-lg font-semibold text-green-900">{item.spiceName}</h3>
                      <p className="text-gray-600 text-sm">
                        {item.packWeightInGrams}g - {item.qualityClass}
                      </p>
                      <p className="text-gray-700 mt-1">Quantity: <span className="font-medium">{item.quantity}</span></p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-amber-700 font-bold text-lg">₹{(item.unitPrice * item.quantity).toFixed(2)}</p>
                      <p className="text-gray-500 text-xs">₹{item.unitPrice.toFixed(2)} / unit</p>
                    </div>
                  </motion.div>
                ))
              ) : (
                <p className="text-gray-600 italic">No items found for this order.</p>
              )}
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}