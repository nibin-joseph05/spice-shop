
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  FiArrowLeft,
  FiTag,
  FiCalendar,
  FiDollarSign,
  FiPackage,
  FiCreditCard,
  FiMapPin,
  FiPhone,
  FiClock,
  FiCheck,
  FiX,
  FiLoader
} from 'react-icons/fi';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/home/Header';
import Footer from '@/components/home/Footer';

export default function OrderDetailsPage() {
  const { orderId } = useParams();
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

  const getStatusConfig = (status) => {
    const configs = {
      'COMPLETED': {
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        border: 'border-emerald-200',
        icon: <FiCheck className="w-4 h-4" />
      },
      'PROCESSING': {
        bg: 'bg-blue-50',
        text: 'text-blue-700',
        border: 'border-blue-200',
        icon: <FiLoader className="w-4 h-4 animate-spin" />
      },
      'PENDING': {
        bg: 'bg-amber-50',
        text: 'text-amber-700',
        border: 'border-amber-200',
        icon: <FiClock className="w-4 h-4" />
      },
      'CANCELLED': {
        bg: 'bg-red-50',
        text: 'text-red-700',
        border: 'border-red-200',
        icon: <FiX className="w-4 h-4" />
      },
      'FAILED': {
        bg: 'bg-red-50',
        text: 'text-red-700',
        border: 'border-red-200',
        icon: <FiX className="w-4 h-4" />
      }
    };
    return configs[status] || {
      bg: 'bg-gray-50',
      text: 'text-gray-700',
      border: 'border-gray-200',
      icon: <FiClock className="w-4 h-4" />
    };
  };

  const StatusBadge = ({ status }) => {
    const config = getStatusConfig(status);
    return (
      <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border ${config.bg} ${config.text} ${config.border}`}>
        {config.icon}
        {status}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-emerald-50 via-white to-teal-50">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
            <p className="text-gray-600 text-lg">Loading order details...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-emerald-50 via-white to-teal-50">
        <Header />
        <main className="flex-grow flex flex-col items-center justify-center p-4">
          <div className="text-center space-y-6 max-w-md">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <FiX className="w-8 h-8 text-red-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Oops! Something went wrong</h2>
              <p className="text-red-600 font-medium">{error}</p>
            </div>
            <Link href="/my-profile?tab=orders">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg
                           hover:bg-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
              >
                <FiArrowLeft className="w-4 h-4" />
                Back to Orders
              </motion.button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-emerald-50 via-white to-teal-50">
        <Header />
        <main className="flex-grow flex flex-col items-center justify-center p-4">
          <div className="text-center space-y-6 max-w-md">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
              <FiPackage className="w-8 h-8 text-gray-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h2>
              <p className="text-gray-600">The order you're looking for doesn't exist or has been removed.</p>
            </div>
            <Link href="/my-profile?tab=orders">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg
                           hover:bg-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
              >
                <FiArrowLeft className="w-4 h-4" />
                Back to Orders
              </motion.button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      <Header />
      <main className="flex-grow py-8 md:py-12">
        <div className="container mx-auto px-4 md:px-6 max-w-6xl">
          {/* Breadcrumb */}
          <Link href="/my-profile?tab=orders">
            <motion.button
              whileHover={{ x: -3 }}
              className="inline-flex items-center gap-2 text-emerald-700 hover:text-emerald-900
                         transition-all duration-200 mb-8 group"
            >
              <FiArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium">Back to Order History</span>
            </motion.button>
          </Link>

          {/* Header Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 md:p-8 mb-8"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                  Order #{order.orderNumber || order.id}
                </h1>
                <p className="text-gray-600 flex items-center gap-2">
                  <FiCalendar className="w-4 h-4 text-emerald-600" />
                  Placed on {new Date(order.orderDate).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-emerald-600 mb-2">₹{order.totalAmount.toFixed(2)}</p>
                <StatusBadge status={order.orderStatus} />
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Order Items */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 md:p-8"
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <FiPackage className="w-4 h-4 text-emerald-600" />
                  </div>
                  Order Items ({order.items?.length || 0})
                </h2>

                <div className="space-y-4">
                  {order.items && order.items.length > 0 ? (
                    order.items.map((item, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 + 0.2 }}
                        className="group p-4 rounded-xl border border-gray-100 hover:border-emerald-200
                                   hover:shadow-lg transition-all duration-300 bg-gradient-to-r from-white to-emerald-50/30"
                      >
                        <div className="flex items-center gap-4">
                          <div className="relative overflow-hidden rounded-xl bg-gray-100 flex-shrink-0">
                            <Image
                              src={item.imageUrl || '/placeholder-spice.jpg'}
                              alt={item.spiceName}
                              width={80}
                              height={80}
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>

                          <div className="flex-grow min-w-0">
                            <h3 className="text-lg font-semibold text-gray-900 mb-1 truncate">
                              {item.spiceName}
                            </h3>
                            <div className="flex flex-wrap gap-3 text-sm text-gray-600 mb-2">
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full">
                                <FiTag className="w-3 h-3" />
                                {item.packWeightInGrams}g
                              </span>
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full">
                                {item.qualityClass}
                              </span>
                            </div>
                            <p className="text-gray-700">
                              Quantity: <span className="font-semibold text-gray-900">{item.quantity}</span>
                            </p>
                          </div>

                          <div className="text-right flex-shrink-0">
                            <p className="text-2xl font-bold text-emerald-600 mb-1">
                              ₹{(item.unitPrice * item.quantity).toFixed(2)}
                            </p>
                            <p className="text-sm text-gray-500">
                              ₹{item.unitPrice.toFixed(2)} per unit
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <FiPackage className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 italic">No items found for this order.</p>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Payment Information */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                  <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <FiCreditCard className="w-4 h-4 text-emerald-600" />
                  </div>
                  Payment Details
                </h3>

                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Payment Status</span>
                    {order.paymentStatus && <StatusBadge status={order.paymentStatus} />}
                  </div>

                  {order.paymentMethod && (
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600">Payment Method</span>
                      <span className="font-medium text-gray-900 capitalize">
                        {order.paymentMethod.replace(/_/g, ' ').toLowerCase()}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between items-center py-2 pt-4">
                    <span className="text-lg font-semibold text-gray-900">Total Amount</span>
                    <span className="text-2xl font-bold text-emerald-600">
                      ₹{order.totalAmount.toFixed(2)}
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Shipping Address */}
              {order.shippingAddress && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 }}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6"
                >
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                    <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                      <FiMapPin className="w-4 h-4 text-emerald-600" />
                    </div>
                    Shipping Address
                  </h3>

                  <div className="space-y-2 text-gray-700">
                    <p className="font-medium text-gray-900">{order.shippingAddress.addressLine1}</p>
                    {order.shippingAddress.addressLine2 && (
                      <p>{order.shippingAddress.addressLine2}</p>
                    )}
                    <p>
                      {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
                    </p>
                    <p className="font-medium">{order.shippingAddress.country}</p>

                    <div className="pt-3 mt-3 border-t border-gray-100">
                      <p className="flex items-center gap-2 text-gray-600">
                        <FiPhone className="w-4 h-4 text-emerald-600" />
                        {order.shippingAddress.phoneNumber}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}