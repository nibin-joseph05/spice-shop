"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Sidebar } from "@/components/admin/Sidebar";
import {
  FiInfo,
  FiAlertTriangle,
  FiClock,
  FiCheckCircle,
  FiTruck,
  FiPackage,
  FiXCircle,
  FiChevronLeft,
  FiUser, // Added for customer info icon
  FiMail, // Added for customer email icon
} from "react-icons/fi";
import Link from "next/link";

export default function AdminOrderDetailsPage() {
  const [darkMode] = useState(true);
  const { orderId } = useParams();
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState(null);
  const [operationError, setOperationError] = useState(null); // For update operations
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false); // New state for update loading

  useEffect(() => {
    if (!orderId) {
      setPageError("Order ID is missing.");
      setLoading(false);
      return;
    }

    const fetchOrderDetails = async () => {
      setLoading(true);
      setPageError(null);
      setOperationError(null); // Clear any previous operation errors
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/orders/admin/${orderId}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            `Failed to fetch order details. Status: ${response.status}. Message: ${
              errorData.message || "Unknown error"
            }`
          );
        }
        const apiResponse = await response.json();

        if (apiResponse && apiResponse.data) {
          setOrderDetails(apiResponse.data);
        } else {
          throw new Error("Received unexpected data format from server.");
        }
      } catch (err) {
        console.error("Fetch order details error:", err);
        setPageError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchOrderDetails();
  }, [orderId]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      let cleanedDateString = dateString;
      const dotIndex = dateString.indexOf('.');
      if (dotIndex > -1) {
        const timezoneIndex = dateString.indexOf('+', dotIndex);
        const zIndex = dateString.indexOf('Z', dotIndex);
        const endIndex = timezoneIndex > -1 ? timezoneIndex : zIndex > -1 ? zIndex : dateString.length;
        const precisionPart = dateString.substring(dotIndex + 1, endIndex);
        if (precisionPart.length > 3) {
          cleanedDateString = dateString.substring(0, dotIndex + 4) + dateString.substring(endIndex);
        }
      }
      const date = new Date(cleanedDateString);
      if (isNaN(date.getTime())) {
        console.warn(`Invalid date string encountered: ${dateString}`);
        return 'Invalid Date';
      }
      const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
      return date.toLocaleDateString(undefined, options);
    } catch (error) {
      console.error("Error formatting date:", dateString, error);
      return 'Error Date';
    }
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      PLACED: "bg-blue-500/25 text-blue-300",
      PROCESSING: "bg-yellow-500/25 text-yellow-300",
      SHIPPED: "bg-indigo-500/25 text-indigo-300",
      DELIVERED: "bg-green-500/25 text-green-300",
      CANCELLED: "bg-red-500/25 text-red-300",
      COMPLETED: "bg-green-500/25 text-green-300", // Assuming COMPLETED for payment status
      PENDING: "bg-orange-500/25 text-orange-300", // For pending payment
      FAILED: "bg-red-500/25 text-red-300" // For failed payment
    };

    const statusIcons = {
      PLACED: <FiClock className="mr-1.5" />,
      PROCESSING: <FiPackage className="mr-1.5" />,
      SHIPPED: <FiTruck className="mr-1.5" />,
      DELIVERED: <FiCheckCircle className="mr-1.5" />,
      CANCELLED: <FiXCircle className="mr-1.5" />,
      COMPLETED: <FiCheckCircle className="mr-1.5" />,
      PENDING: <FiClock className="mr-1.5" />,
      FAILED: <FiXCircle className="mr-1.5" />
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center ${statusClasses[status] || 'bg-gray-500/25 text-gray-300'}`}>
        {statusIcons[status] || <FiInfo className="mr-1.5" />} {status || 'UNKNOWN'}
      </span>
    );
  };

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    if (!orderDetails || !newStatus) return;

    setIsUpdatingStatus(true);
    setOperationError(null); // Clear previous operation errors

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/orders/admin/${orderId}/status`, {
        method: 'PATCH', // Or 'PUT' as decided for your backend
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to update status. Status: ${response.status}`);
      }

      const apiResponse = await response.json();
      if (apiResponse && apiResponse.data) {
        setOrderDetails(apiResponse.data); // Update local state with the new order details
        // You can add a toast/success message here if desired
      } else {
        throw new Error("Received unexpected data format after status update.");
      }
    } catch (err) {
      console.error("Error updating order status:", err);
      setOperationError(err.message);
    } finally {
      setIsUpdatingStatus(false);
    }
  };


  if (loading) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 p-6 md:p-8 bg-slate-900 text-gray-200">
          <div className="max-w-4xl mx-auto animate-pulse">
            <div className="h-8 bg-slate-700 rounded w-64 mb-6"></div>
            <div className="bg-slate-800/60 p-8 rounded-xl shadow-2xl border border-slate-700">
              <div className="h-6 bg-slate-700 rounded w-48 mb-4"></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="h-4 bg-slate-600 rounded"></div>
                <div className="h-4 bg-slate-600 rounded"></div>
                <div className="h-4 bg-slate-600 rounded"></div>
                <div className="h-4 bg-slate-600 rounded"></div>
              </div>
              <div className="h-5 bg-slate-700 rounded w-3/4 mt-8 mb-4"></div>
              <div className="space-y-3">
                <div className="h-16 bg-slate-600 rounded"></div>
                <div className="h-16 bg-slate-600 rounded"></div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (pageError) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 p-6 md:p-8 bg-slate-900 text-gray-200 flex items-center justify-center">
          <div className="text-center py-12 bg-slate-800/70 p-8 sm:p-10 rounded-xl shadow-2xl border border-red-500/40 max-w-md w-full">
            <FiAlertTriangle className="mx-auto h-16 w-16 text-red-400 mb-6" />
            <h2 className="text-xl sm:text-2xl font-semibold text-red-300 mb-3">Error Loading Order</h2>
            <p className="text-red-400/80 mb-8 text-sm sm:text-base">{pageError}</p>
            <Link
              href="/admin/orders"
              className="px-6 py-2.5 bg-amber-500/80 text-slate-900 rounded-lg hover:bg-amber-500 transition-all duration-300 ease-in-out text-sm font-semibold transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-opacity-70 inline-flex items-center gap-2"
            >
              <FiChevronLeft /> Back to Orders
            </Link>
          </div>
        </main>
      </div>
    );
  }

  if (!orderDetails) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 p-6 md:p-8 bg-slate-900 text-gray-200 flex items-center justify-center">
          <div className="text-center py-12 bg-slate-800/70 p-8 sm:p-10 rounded-xl shadow-2xl border border-blue-500/40 max-w-md w-full">
            <FiInfo className="mx-auto h-16 w-16 text-blue-400 mb-6" />
            <h2 className="text-xl sm:text-2xl font-semibold text-blue-300 mb-3">Order Not Found</h2>
            <p className="text-blue-400/80 mb-8 text-sm sm:text-base">
              The order you are looking for does not exist or you do not have permission to view it.
            </p>
            <Link
              href="/admin/orders"
              className="px-6 py-2.5 bg-amber-500/80 text-slate-900 rounded-lg hover:bg-amber-500 transition-all duration-300 ease-in-out text-sm font-semibold transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-opacity-70 inline-flex items-center gap-2"
            >
              <FiChevronLeft /> Back to Orders
            </Link>
          </div>
        </main>
      </div>
    );
  }

  // Destructure for easier access
  const {
    orderNumber,
    orderDate,
    totalAmount,
    orderStatus,
    paymentStatus,
    paymentMethod,
    customerName,    // New field
    customerEmail,   // New field
    shippingAddress,
    orderNotes,      // New field
    items,
  } = orderDetails;

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className={`flex-1 p-6 md:p-8 transition-colors duration-300 ${darkMode ? "bg-slate-900 text-gray-200" : "bg-gray-100 text-gray-800"}`}>
        <div className="max-w-5xl mx-auto">
          {/* Back to orders link */}
          <Link href="/admin/orders" className="inline-flex items-center text-amber-400 hover:text-amber-300 transition-colors duration-200 mb-6">
            <FiChevronLeft className="mr-2" /> Back to All Orders
          </Link>

          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-amber-400 via-orange-400 to-emerald-400 bg-clip-text text-transparent mb-6">
            Order Details: #{orderNumber}
          </h1>

          {operationError && (
            <div className="mb-6 p-3.5 bg-red-900/50 border border-red-700 text-red-300 rounded-lg flex items-center justify-between gap-3 text-sm shadow-md">
              <div className="flex items-center gap-2">
                <FiAlertTriangle className="w-5 h-5 flex-shrink-0" />
                <span>{operationError}</span>
              </div>
              <button onClick={() => setOperationError(null)} className="text-red-300 hover:text-red-200 text-lg p-1 hover:bg-red-700/50 rounded-full">&times;</button>
            </div>
          )}

          <div className={`grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8`}>
            {/* Order Summary Card */}
            <div className={`lg:col-span-2 p-6 rounded-xl shadow-2xl ${darkMode ? "bg-slate-800/70 border border-slate-700" : "bg-white border border-gray-200"}`}>
              <h2 className={`text-xl font-semibold mb-5 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Order Summary</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 text-sm">
                <div>
                  <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Order Number:</p>
                  <p className={`font-medium ${darkMode ? 'text-blue-300' : 'text-blue-600'}`}>{orderNumber}</p>
                </div>
                <div>
                  <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Order Date:</p>
                  <p className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{formatDate(orderDate)}</p>
                </div>
                <div>
                  <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Amount:</p>
                  <p className={`font-semibold text-lg ${darkMode ? 'text-emerald-300' : 'text-emerald-700'}`}>₹{totalAmount.toFixed(2)}</p>
                </div>

                {/* Customer Information */}
                <div>
                  <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Customer Name:</p>
                  <p className={`font-medium flex items-center ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                    <FiUser className="mr-1.5 text-gray-500" /> {customerName}
                  </p>
                </div>
                <div>
                  <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Customer Email:</p>
                  <p className={`font-medium flex items-center ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                    <FiMail className="mr-1.5 text-gray-500" /> {customerEmail}
                  </p>
                </div>

                {/* Order Status Dropdown */}
                <div>
                  <label htmlFor="orderStatusSelect" className={`block text-sm font-medium mb-1.5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Order Status:</label>
                  <select
                    id="orderStatusSelect"
                    value={orderStatus}
                    onChange={handleStatusChange}
                    className={`block w-full py-2.5 pl-3 pr-8 rounded-lg text-sm appearance-none ${darkMode ? 'bg-slate-700 text-gray-200 border border-slate-600 focus:border-amber-500 focus:ring-amber-500' : 'bg-white text-gray-800 border border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}
                    disabled={isUpdatingStatus}
                  >
                    {/* Make sure these options match your Order.OrderStatus enum in Java */}
                    <option value="PLACED">Placed</option>
                    <option value="PROCESSING">Processing</option>
                    <option value="SHIPPED">Shipped</option>
                    <option value="DELIVERED">Delivered</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                  {isUpdatingStatus && (
                    <p className="text-xs text-amber-400 mt-1">Updating status...</p>
                  )}
                </div>

                <div>
                  <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Payment Status:</p>
                  {getStatusBadge(paymentStatus)}
                </div>
                <div>
                  <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Payment Method:</p>
                  <p className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{paymentMethod}</p>
                </div>
              </div>
            </div>

            {/* Shipping Address Card */}
            <div className={`p-6 rounded-xl shadow-2xl ${darkMode ? "bg-slate-800/70 border border-slate-700" : "bg-white border border-gray-200"}`}>
              <h2 className={`text-xl font-semibold mb-5 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Shipping Address</h2>
              <div className="text-sm">
                <p className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                  {shippingAddress.addressLine1}
                </p>
                {shippingAddress.addressLine2 && (
                  <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {shippingAddress.addressLine2}
                  </p>
                )}
                <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {shippingAddress.city}, {shippingAddress.state} - {shippingAddress.postalCode}
                </p>
                <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {shippingAddress.country}
                </p>
                {shippingAddress.phoneNumber && (
                  <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'} mt-2`}>
                    Phone: {shippingAddress.phoneNumber} {/* Corrected field name */}
                  </p>
                )}
                {orderNotes && ( // Display orderNotes from the main OrderDetailsDto
                  <div className="mt-4 p-3 rounded-md bg-slate-700/50 border border-slate-600 text-gray-300 text-xs">
                    <p className="font-semibold mb-1">Order Notes:</p>
                    <p>{orderNotes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Order Items Table */}
          <div className={`p-6 rounded-xl shadow-2xl overflow-hidden ${darkMode ? "bg-slate-800/70 border border-slate-700" : "bg-white border border-gray-200"}`}>
            <h2 className={`text-xl font-semibold mb-5 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Order Items</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-700/60">
                <thead className={`${darkMode ? "bg-slate-800" : "bg-gray-50"}`}>
                  <tr>
                    <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-amber-400/90' : 'text-amber-600'}`}>Item</th>
                    <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-amber-400/90' : 'text-amber-600'}`}>Quantity</th>
                    <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-amber-400/90' : 'text-amber-600'}`}>Unit Price</th>
                    <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-amber-400/90' : 'text-amber-600'}`}>Total</th>
                  </tr>
                </thead>
                <tbody className={`${darkMode ? "divide-y divide-slate-700/60" : "divide-y divide-gray-200"}`}>
                  {items.map((item, index) => (
                    <tr key={index}>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center">
                          {item.imageUrl && (
                            <img
                              src={item.imageUrl}
                              alt={item.spiceName}
                              className="w-10 h-10 object-cover rounded-md mr-3 flex-shrink-0"
                            />
                          )}
                          <div>
                            <div className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                              {item.spiceName} ({item.qualityClass})
                            </div>
                            <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              {item.packWeightInGrams}g
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className={`px-4 py-3 whitespace-nowrap text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{item.quantity}</td>
                      <td className={`px-4 py-3 whitespace-nowrap text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>₹{item.unitPrice.toFixed(2)}</td>
                      <td className={`px-4 py-3 whitespace-nowrap font-medium ${darkMode ? 'text-emerald-300' : 'text-emerald-700'}`}>₹{(item.unitPrice * item.quantity).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}