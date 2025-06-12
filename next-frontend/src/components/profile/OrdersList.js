'use client';

import { motion } from 'framer-motion';
import { FiBox, FiEye, FiCalendar, FiCreditCard } from 'react-icons/fi';
import Image from 'next/image';
import Link from 'next/link';

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function OrdersList({ orders }) {
  if (!orders || orders.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-amber-100 rounded-lg">
            <FiBox className="text-xl text-amber-700" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Order History</h2>
        </div>

        <div className="text-center py-12">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiBox className="text-2xl text-gray-400" />
          </div>
          <p className="text-gray-500 text-lg font-medium">No orders found</p>
          <p className="text-gray-400 text-sm mt-1">Your order history will appear here</p>
        </div>
      </motion.div>
    );
  }

  const getStatusClasses = (status) => {
    switch (status) {
      case 'DELIVERED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'PROCESSING':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'PENDING':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';

      case 'SHIPPED':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';

      case 'REFUNDED':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'CANCELLED':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'FAILED':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        visible: { transition: { staggerChildren: 0.1 } }
      }}
      className="bg-white rounded-2xl shadow-lg border border-gray-100"
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-100 rounded-lg">
            <FiBox className="text-xl text-amber-700" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Order History</h2>
        </div>
      </div>

      {/* Orders List */}
      <div className="divide-y divide-gray-100">
        {orders.map((order) => (
          <motion.div
            key={order.id}
            variants={itemVariants}
            className="p-6 hover:bg-gray-50 transition-colors duration-200 group"
          >
            {/* Mobile and Desktop Layout */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

              {/* Left Section - Order Info */}
              <div className="flex-1 min-w-0">
                {/* Order Number and Date */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-500">Order</span>
                    <span className="font-bold text-gray-900">
                      #{order.orderNumber || order.id}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <FiCalendar className="w-4 h-4" />
                    <span>
                      {new Date(order.orderDate).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                </div>

                {/* Items Overview */}
                <div className="mb-4">
                  {order.items && order.items.length > 0 ? (
                    <div className="space-y-2">
                      {order.items.slice(0, 3).map((item, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                            <Image
                              src={item.imageUrl || '/placeholder-spice.jpg'}
                              alt={item.spiceName}
                              width={40}
                              height={40}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">
                              {item.spiceName}
                            </p>
                            <p className="text-sm text-gray-500">
                              {item.quantity}x • {item.packWeightInGrams}g • {item.qualityClass}
                            </p>
                          </div>
                          <div className="text-sm font-semibold text-amber-600">
                            ₹{(item.unitPrice * item.quantity).toFixed(2)}
                          </div>
                        </div>
                      ))}
                      {order.items.length > 3 && (
                        <p className="text-sm text-gray-500 pl-13">
                          +{order.items.length - 3} more items
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">No items listed</p>
                  )}
                </div>
              </div>

              {/* Right Section - Status, Amount, Actions */}
              <div className="flex flex-col sm:flex-row lg:flex-col gap-4 lg:items-end lg:text-right">

                {/* Status Badges */}
                <div className="flex flex-wrap gap-2">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusClasses(order.orderStatus)}`}>
                    {order.orderStatus}
                  </span>
                  {order.paymentStatus && (
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusClasses(order.paymentStatus)}`}>
                      <FiCreditCard className="w-3 h-3 mr-1" />
                      {order.paymentStatus}
                    </span>
                  )}
                </div>

                {/* Total Amount */}
                <div className="text-right">
                  <p className="text-sm text-gray-500">Total Amount</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ₹{order.totalAmount.toFixed(2)}
                  </p>
                </div>

                {/* Action Button */}
                <Link href={`/my-profile/order-details/${order.id}`} passHref>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-600 to-green-700
                               text-white rounded-xl text-sm font-medium hover:from-green-700 hover:to-green-800
                               transition-all duration-200 shadow-md hover:shadow-lg group-hover:shadow-xl"
                  >
                    <FiEye className="w-4 h-4" />
                    View Details
                  </motion.button>
                </Link>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}