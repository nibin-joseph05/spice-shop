"use client";
import { useEffect, useState } from "react";
import { Sidebar } from "@/components/admin/Sidebar";
import { FiInfo, FiAlertTriangle, FiChevronLeft, FiChevronRight, FiSearch, FiX, FiClock, FiCheckCircle, FiTruck, FiPackage, FiXCircle } from "react-icons/fi";

export default function AdminOrdersPage() {
  const [darkMode] = useState(true);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState(null);
  const [operationError, setOperationError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage] = useState(8);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [minAmountFilter, setMinAmountFilter] = useState('');
  const [maxAmountFilter, setMaxAmountFilter] = useState('');

   useEffect(() => {
      const fetchOrders = async () => {
        setLoading(true);
        setPageError(null);
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/orders/all`);
          if (!response.ok) {

            const errorData = await response.json();
            throw new Error(`Failed to fetch orders. Status: ${response.status}. Message: ${errorData.message || 'Unknown error'}`);
          }
          const apiResponse = await response.json();



          if (apiResponse && Array.isArray(apiResponse.data)) {
            setOrders(apiResponse.data);
          } else {

            throw new Error("Received unexpected data format from server.");
          }


        } catch (err) {
          console.error("Fetch orders error:", err);
          setPageError(err.message);
        } finally {
          setLoading(false);
        }
      };
      fetchOrders();
    }, []);

  const getStatusBadge = (status) => {
    const statusClasses = {
      PLACED: "bg-blue-500/25 text-blue-300",
      PROCESSING: "bg-yellow-500/25 text-yellow-300",
      SHIPPED: "bg-indigo-500/25 text-indigo-300",
      DELIVERED: "bg-green-500/25 text-green-300",
      CANCELLED: "bg-red-500/25 text-red-300"
    };
    
    const statusIcons = {
      PLACED: <FiClock className="mr-1.5" />,
      PROCESSING: <FiPackage className="mr-1.5" />,
      SHIPPED: <FiTruck className="mr-1.5" />,
      DELIVERED: <FiCheckCircle className="mr-1.5" />,
      CANCELLED: <FiXCircle className="mr-1.5" />
    };
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center ${statusClasses[status]}`}>
        {statusIcons[status]} {status}
      </span>
    );
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesStatus = statusFilter === 'all' || order.orderStatus === statusFilter;
    
    const orderAmount = order.totalAmount;
    const matchesMinAmount = minAmountFilter === '' || orderAmount >= parseFloat(minAmountFilter);
    const matchesMaxAmount = maxAmountFilter === '' || orderAmount <= parseFloat(maxAmountFilter);
    
    return matchesSearch && matchesStatus && matchesMinAmount && matchesMaxAmount;
  });

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setMinAmountFilter('');
    setMaxAmountFilter('');
    setCurrentPage(1);
  };

  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);

  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const nextPage = () => currentPage < totalPages && setCurrentPage(currentPage + 1);
  const prevPage = () => currentPage > 1 && setCurrentPage(currentPage - 1);


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
        return 'Invalid Date'; // Or a more specific error message
      }

      const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
      return date.toLocaleDateString(undefined, options);
    } catch (error) {
      console.error("Error formatting date:", dateString, error);
      return 'Error Date';
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 p-6 md:p-8 bg-slate-900 text-gray-200">
          <div className="max-w-7xl mx-auto">
            <div className="animate-pulse">
              <div className="flex flex-col sm:flex-row justify-between items-center mb-10">
                <div className="h-10 bg-slate-700 rounded-md w-3/4 sm:w-72 mb-4 sm:mb-0"></div>
                <div className="h-10 bg-slate-700 rounded-lg w-full sm:w-48"></div>
              </div>
              <div className="rounded-xl bg-slate-800/60 border border-slate-700 shadow-2xl">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[900px]">
                    <thead>
                      <tr className="border-b border-slate-700">
                        {['Order Details', 'Customer', 'Items', 'Amount', 'Status', 'Date', 'Actions'].map((_, idx) => (
                          <th key={idx} className="p-5 text-left">
                            <div className="h-5 bg-slate-700 rounded-md w-3/4"></div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {[...Array(5)].map((_, rowIdx) => (
                        <tr key={rowIdx} className="border-b border-slate-700/50">
                          <td className="p-5">
                            <div className="h-5 bg-slate-600 rounded-md w-5/6 mb-2"></div>
                          </td>
                          <td className="p-5">
                            <div className="h-5 bg-slate-600 rounded-md w-5/6 mb-1"></div>
                            <div className="h-4 bg-slate-700 rounded-md w-4/5"></div>
                          </td>
                          <td className="p-5">
                            <div className="h-4 bg-slate-600 rounded-md w-full mb-1"></div>
                            <div className="h-4 bg-slate-700 rounded-md w-3/4"></div>
                          </td>
                          <td className="p-5"><div className="h-5 bg-slate-600 rounded-md w-3/4"></div></td>
                          <td className="p-5"><div className="h-6 w-24 bg-slate-700 rounded-full"></div></td>
                          <td className="p-5"><div className="h-4 bg-slate-700 rounded-md w-5/6"></div></td>
                          <td className="p-5"><div className="h-8 w-8 bg-slate-700 rounded-md"></div></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
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
            <h2 className="text-xl sm:text-2xl font-semibold text-red-300 mb-3">Unable to Load Orders</h2>
            <p className="text-red-400/80 mb-8 text-sm sm:text-base">{pageError}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2.5 bg-amber-500/80 text-slate-900 rounded-lg hover:bg-amber-500 transition-all duration-300 ease-in-out text-sm font-semibold transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-opacity-70"
            >
              Try Again
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className={`flex-1 p-6 md:p-8 transition-colors duration-300 ${darkMode ? "bg-slate-900 text-gray-200" : "bg-gray-100 text-gray-800"}`}>
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-8 sm:mb-10">
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-amber-400 via-orange-400 to-emerald-400 bg-clip-text text-transparent mb-4 sm:mb-0 text-center sm:text-left">
              Order Management
            </h1>
            <div className="flex items-center gap-3">
              <div className={`text-sm px-3.5 py-1.5 rounded-lg ${darkMode ? "bg-slate-800 text-gray-400" : "bg-gray-200 text-gray-600"}`}>
                Total: {filteredOrders.length} orders
              </div>
            </div>
          </div>

          {operationError && (
            <div className="mb-6 p-3.5 bg-red-900/50 border border-red-700 text-red-300 rounded-lg flex items-center justify-between gap-3 text-sm shadow-md">
              <div className="flex items-center gap-2">
                <FiAlertTriangle className="w-5 h-5 flex-shrink-0" />
                <span>{operationError}</span>
              </div>
              <button onClick={() => setOperationError(null)} className="text-red-300 hover:text-red-200 text-lg p-1 hover:bg-red-700/50 rounded-full">&times;</button>
            </div>
          )}

          {/* Filters Section */}
          <div className={`mb-8 p-6 rounded-xl shadow-inner ${darkMode ? "bg-slate-800/60 border border-slate-700" : "bg-gray-100/70 border border-gray-200"}`}>
            <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Filter Orders</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-end">
              {/* Search */}
              <div className="flex flex-col">
                <label htmlFor="search" className={`block text-sm font-medium mb-1.5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Search (Order#, Name, Email)</label>
                <div className="relative">
                  <input
                    type="text"
                    id="search"
                    className={`block w-full py-2.5 pl-10 pr-3 rounded-lg text-sm ${darkMode ? 'bg-slate-700 text-gray-200 border border-slate-600 focus:border-amber-500 focus:ring-amber-500' : 'bg-white text-gray-800 border border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}
                    placeholder="e.g., ORD123, John Doe..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <FiSearch className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                  </div>
                </div>
              </div>

              {/* Status Filter */}
              <div className="flex flex-col">
                <label htmlFor="status" className={`block text-sm font-medium mb-1.5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Order Status</label>
                <select
                  id="status"
                  className={`block w-full py-2.5 pl-3 pr-8 rounded-lg text-sm appearance-none ${darkMode ? 'bg-slate-700 text-gray-200 border border-slate-600 focus:border-amber-500 focus:ring-amber-500' : 'bg-white text-gray-800 border border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="all">All Statuses</option>
                  <option value="PLACED">Placed</option>
                  <option value="PROCESSING">Processing</option>
                  <option value="SHIPPED">Shipped</option>
                  <option value="DELIVERED">Delivered</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>

              {/* Amount Range Filter */}
              <div className="flex flex-col">
                <label htmlFor="minAmount" className={`block text-sm font-medium mb-1.5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Amount Range (₹)</label>
                <div className="flex gap-3">
                  <input
                    type="number"
                    id="minAmount"
                    className={`block w-full py-2.5 pl-3 pr-3 rounded-lg text-sm ${darkMode ? 'bg-slate-700 text-gray-200 border border-slate-600 focus:border-amber-500 focus:ring-amber-500' : 'bg-white text-gray-800 border border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}
                    placeholder="Min"
                    value={minAmountFilter}
                    onChange={(e) => {
                      setMinAmountFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                  <span className={`self-center ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>-</span>
                  <input
                    type="number"
                    id="maxAmount"
                    className={`block w-full py-2.5 pl-3 pr-3 rounded-lg text-sm ${darkMode ? 'bg-slate-700 text-gray-200 border border-slate-600 focus:border-amber-500 focus:ring-amber-500' : 'bg-white text-gray-800 border border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}
                    placeholder="Max"
                    value={maxAmountFilter}
                    onChange={(e) => {
                      setMaxAmountFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                </div>
              </div>

              {/* Clear Filters Button */}
              {(searchTerm || statusFilter !== 'all' || minAmountFilter !== '' || maxAmountFilter !== '') && (
                <div className="md:col-span-3 flex justify-end">
                  <button
                    onClick={clearFilters}
                    className="px-4 py-2 bg-slate-700/70 hover:bg-slate-600/70 text-gray-300 rounded-lg shadow-md transition-colors duration-200 flex items-center gap-2 text-sm font-medium"
                  >
                    <FiX className="w-4 h-4" /> Clear Filters
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Orders Table */}
          <div className={`rounded-xl shadow-2xl overflow-hidden ${darkMode ? "bg-slate-800/70 border border-slate-700" : "bg-white border border-gray-200"}`}>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px]">
                <thead className={`${darkMode ? "bg-slate-800" : "bg-gray-50"}`}>
                  <tr className={`border-b ${darkMode ? "border-slate-700" : "border-gray-300"}`}>
                    {['Order Details', 'Customer', 'Items', 'Amount', 'Status', 'Date', 'Actions'].map((header) => (
                      <th key={header} className={`p-4 sm:p-5 text-left text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-amber-400/90' : 'text-amber-600'}`}>
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className={`${darkMode ? "divide-y divide-slate-700/60" : "divide-y divide-gray-200"}`}>
                  {currentOrders.map((order) => (
                    <tr key={order.id} className={`transition-colors duration-200 ${darkMode ? "hover:bg-slate-700/40" : "hover:bg-gray-50/70"}`}>
                      <td className="p-4 sm:p-5 align-top">
                        <div className={`font-semibold mb-1 ${darkMode ? 'text-blue-300' : 'text-blue-600'}`}>
                          #{order.orderNumber}
                        </div>
                        <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          ID: {order.id}
                        </div>
                      </td>

                      <td className="p-4 sm:p-5 align-top min-w-[180px]">
                        <div className={`font-medium mb-0.5 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                          {order.customerName}
                        </div>
                        <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {order.customerEmail}
                        </div>
                      </td>


                      <td className="p-4 sm:p-5 align-top min-w-[180px]">
                        <div className="text-sm">
                          {order.items.slice(0, 2).map((item, idx) => (
                            <div key={idx} className="mb-1.5">
                              <div className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                {item.spiceName} ({item.qualityClass})
                              </div>
                              <div className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                                {item.packWeightInGrams}g × {item.quantity}
                                <span className="mx-1.5">•</span>
                                ₹{item.unitPrice ? item.unitPrice.toFixed(2) : 'N/A'}/pack {/* <-- FIX THIS LINE */}
                              </div>
                            </div>
                          ))}
                          {order.items.length > 2 && (
                            <div className={`text-xs font-medium ${darkMode ? 'text-amber-300' : 'text-amber-600'}`}>
                              +{order.items.length - 2} more items
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="p-4 sm:p-5 align-top">
                        <div className={`font-semibold text-lg ${darkMode ? 'text-emerald-300' : 'text-emerald-700'}`}>
                          ₹{order.totalAmount.toFixed(2)}
                        </div>
                      </td>

                      <td className="p-4 sm:p-5 align-top">
                        {getStatusBadge(order.orderStatus)}
                      </td>

                      <td className="p-4 sm:p-5 align-top min-w-[150px]">
                        <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {formatDate(order.orderDate)}
                        </div>
                      </td>

                      <td className="p-4 sm:p-5 align-top text-center">
                        <div className="flex justify-center">
                          <button
                            className={`p-2 rounded-md transition-all duration-200 transform hover:scale-110 focus:outline-none focus:ring-2 ${darkMode ? 'hover:bg-blue-500/25 text-blue-400 focus:ring-blue-400 focus:ring-offset-slate-800' : 'hover:bg-blue-100 text-blue-600 focus:ring-blue-500 focus:ring-offset-white'}`}
                            title="View order details"
                            onClick={() => window.location.href = `/admin/orders/${order.id}`}
                          >
                            <FiInfo className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {currentOrders.length === 0 && !loading && (
              <div className="text-center py-16 px-6">
                <FiInfo className="inline-block text-4xl text-gray-500 dark:text-gray-600 mb-3" />
                <p className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-1">No Orders Found</p>
                {orders.length > 0 && (searchTerm || statusFilter !== 'all' || minAmountFilter !== '' || maxAmountFilter !== '') ? (
                  <p className="text-sm text-gray-500 dark:text-gray-500">
                    No orders match your filters. Try adjusting them.
                  </p>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-500">
                    No orders have been placed yet.
                  </p>
                )}
              </div>
            )}

            {/* Pagination Controls */}
            {filteredOrders.length > ordersPerPage && (
              <div className={`p-4 sm:p-5 flex justify-center items-center gap-2 ${darkMode ? "bg-slate-800 border-t border-slate-700" : "bg-white border-t border-gray-200"}`}>
                <button
                  onClick={prevPage}
                  disabled={currentPage === 1}
                  className={`p-2 rounded-md ${darkMode ? 'hover:bg-slate-700 text-gray-300' : 'hover:bg-gray-100 text-gray-700'} ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <FiChevronLeft className="w-5 h-5" />
                </button>
                <div className="flex gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                    <button
                      key={number}
                      onClick={() => paginate(number)}
                      className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-200
                        ${currentPage === number
                          ? (darkMode ? 'bg-amber-500 text-slate-900' : 'bg-amber-500 text-white')
                          : (darkMode ? 'bg-slate-700 text-gray-300 hover:bg-slate-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200')
                        }`}
                    >
                      {number}
                    </button>
                  ))}
                </div>
                <button
                  onClick={nextPage}
                  disabled={currentPage === totalPages}
                  className={`p-2 rounded-md ${darkMode ? 'hover:bg-slate-700 text-gray-300' : 'hover:bg-gray-100 text-gray-700'} ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <FiChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}