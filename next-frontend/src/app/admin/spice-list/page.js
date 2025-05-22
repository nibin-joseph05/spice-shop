// app/admin/spices/page.js
"use client";
import { useEffect, useState } from "react";
import { Sidebar } from "@/components/admin/Sidebar";
import { FiInfo, FiTrash2, FiAlertTriangle, FiPlus, FiImage, FiChevronLeft, FiChevronRight, FiSearch, FiX } from "react-icons/fi"; // Added pagination icons and filter icons

export default function SpiceListPage() {
  const [darkMode] = useState(true);
  const [spices, setSpices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState(null);
  const [operationError, setOperationError] = useState(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [spicesPerPage] = useState(5); // Set 5 spices per page

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState('all'); // 'all', 'available', 'unavailable'
  const [minStock, setMinStock] = useState('');

  useEffect(() => {
    const fetchSpices = async () => {
      setLoading(true);
      setPageError(null);
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/spices`);
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: `Failed to fetch spices. Status: ${response.status}` }));
          throw new Error(errorData.message || `Failed to fetch spices. Status: ${response.status}`);
        }
        const data = await response.json();
        setSpices(data);
      } catch (err) {
        setPageError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchSpices();
  }, []);

  const handleDelete = async (spiceId) => {
    if (confirm("Are you sure you want to permanently delete this spice? This action cannot be undone.")) {
      setOperationError(null);
      const originalSpices = [...spices];
      setSpices(spices.filter(spice => spice.id !== spiceId));

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/spices/${spiceId}`, {
          method: 'DELETE'
        });
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: 'Deletion failed on the server.' }));
          throw new Error(errorData.message || 'Deletion failed on the server.');
        }
      } catch (err) {
        setOperationError(`Failed to delete spice: ${err.message}.`);
        setSpices(originalSpices);
      }
    }
  };

  const toggleAvailability = async (spiceId, currentStatus) => {
    setOperationError(null);
    const originalSpices = spices.map(s => ({...s}));

    setSpices(spices.map(spice =>
      spice.id === spiceId ? { ...spice, isAvailable: !currentStatus } : spice
    ));

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/spices/${spiceId}/availability`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ available: !currentStatus })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to update availability on the server.' }));
        throw new Error(errorData.message || 'Failed to update availability on the server.');
      }
    } catch (err) {
      setOperationError(`Failed to update availability: ${err.message}.`);
      setSpices(originalSpices);
    }
  };

  // --- Filtering Logic ---
  const filteredSpices = spices.filter(spice => {
    // Search Term Filter
    const matchesSearch = spice.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          spice.origin?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          spice.variants?.some(variant =>
                            variant.qualityClass?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            variant.packs?.some(pack => pack.packWeightInGrams.toString().includes(searchTerm))
                          );

    // Availability Filter
    const matchesAvailability = availabilityFilter === 'all' ||
                                (availabilityFilter === 'available' && spice.isAvailable) ||
                                (availabilityFilter === 'unavailable' && !spice.isAvailable);

    // Minimum Stock Filter
    const matchesMinStock = minStock === '' ||
                            spice.variants?.some(variant =>
                              variant.packs?.some(pack => pack.stockQuantity >= parseInt(minStock))
                            );

    return matchesSearch && matchesAvailability && matchesMinStock;
  });

  const clearFilters = () => {
    setSearchTerm('');
    setAvailabilityFilter('all');
    setMinStock('');
    setCurrentPage(1); // Reset to first page after clearing filters
  };

  // --- Pagination Logic (applied to filteredSpices) ---
  const indexOfLastSpice = currentPage * spicesPerPage;
  const indexOfFirstSpice = indexOfLastSpice - spicesPerPage;
  const currentSpices = filteredSpices.slice(indexOfFirstSpice, indexOfLastSpice); // Apply slice to filteredSpices

  const totalPages = Math.ceil(filteredSpices.length / spicesPerPage); // Base totalPages on filteredSpices.length

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // --- Skeleton Loader ---
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
                        {['Spice Details', 'Gallery', 'Variations & Stock', 'Availability', 'Actions'].map((_, idx) => (
                          <th key={idx} className="p-5 text-left">
                            <div className="h-5 bg-slate-700 rounded-md w-3/4"></div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {[...Array(5)].map((_, rowIdx) => ( // Simulate 5 rows for skeleton
                        <tr key={rowIdx} className="border-b border-slate-700/50">
                          <td className="p-5">
                            <div className="h-5 bg-slate-600 rounded-md w-5/6 mb-2"></div>
                            <div className="h-3 bg-slate-700 rounded-md w-3/4"></div>
                          </td>
                          <td className="p-5">
                            <div className="flex gap-2">
                              <div className="h-16 w-16 bg-slate-700 rounded-md"></div>
                              <div className="h-16 w-16 bg-slate-700 rounded-md"></div>
                            </div>
                          </td>
                          <td className="p-5">
                            <div className="h-4 bg-slate-600 rounded-md w-full mb-2"></div>
                            <div className="h-3 bg-slate-700 rounded-md w-4/5"></div>
                            <div className="h-3 bg-slate-700 rounded-md w-4/5 mt-1"></div>
                          </td>
                          <td className="p-5"><div className="h-6 w-11 bg-slate-700 rounded-full"></div></td>
                          <td className="p-5"><div className="flex gap-2"><div className="h-8 w-8 bg-slate-700 rounded-md"></div><div className="h-8 w-8 bg-slate-700 rounded-md"></div></div></td>
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

  // --- Page Error Display ---
  if (pageError) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 p-6 md:p-8 bg-slate-900 text-gray-200 flex items-center justify-center">
          <div className="text-center py-12 bg-slate-800/70 p-8 sm:p-10 rounded-xl shadow-2xl border border-red-500/40 max-w-md w-full">
            <FiAlertTriangle className="mx-auto h-16 w-16 text-red-400 mb-6" />
            <h2 className="text-xl sm:text-2xl font-semibold text-red-300 mb-3">Unable to Load Spices</h2>
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

  // --- Main Content ---
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className={`flex-1 p-6 md:p-8 transition-colors duration-300 ${darkMode ? "bg-slate-900 text-gray-200" : "bg-gray-100 text-gray-800"}`}>
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-8 sm:mb-10">
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-amber-400 via-orange-400 to-emerald-400 bg-clip-text text-transparent mb-4 sm:mb-0 text-center sm:text-left">
              Spice Inventory
            </h1>
            <button
              onClick={() => window.location.href = '/admin/add-spice'}
              className="px-5 py-2.5 bg-emerald-500/90 hover:bg-emerald-500 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 ease-in-out flex items-center gap-2.5 text-sm font-medium transform hover:scale-105 group focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-opacity-60"
            >
              <FiPlus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" /> Add New Spice
            </button>
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

          {/* --- Filters Section --- */}
          <div className={`mb-8 p-6 rounded-xl shadow-inner ${darkMode ? "bg-slate-800/60 border border-slate-700" : "bg-gray-100/70 border border-gray-200"}`}>
            <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Filter Spices</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-end">
              {/* Search by Name/Origin/Variant */}
              <div className="flex flex-col">
                <label htmlFor="search" className={`block text-sm font-medium mb-1.5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Search (Name, Origin, Variant)</label>
                <div className="relative">
                  <input
                    type="text"
                    id="search"
                    className={`block w-full py-2.5 pl-10 pr-3 rounded-lg text-sm ${darkMode ? 'bg-slate-700 text-gray-200 border border-slate-600 focus:border-amber-500 focus:ring-amber-500' : 'bg-white text-gray-800 border border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}
                    placeholder="e.g., Turmeric, India, Supreme..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1); // Reset to first page on search
                    }}
                  />
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <FiSearch className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                  </div>
                </div>
              </div>

              {/* Availability Filter */}
              <div className="flex flex-col">
                <label htmlFor="availability" className={`block text-sm font-medium mb-1.5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Availability</label>
                <select
                  id="availability"
                  className={`block w-full py-2.5 pl-3 pr-8 rounded-lg text-sm appearance-none ${darkMode ? 'bg-slate-700 text-gray-200 border border-slate-600 focus:border-amber-500 focus:ring-amber-500' : 'bg-white text-gray-800 border border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}
                  value={availabilityFilter}
                  onChange={(e) => {
                    setAvailabilityFilter(e.target.value);
                    setCurrentPage(1); // Reset to first page on filter change
                  }}
                >
                  <option value="all">All</option>
                  <option value="available">Available</option>
                  <option value="unavailable">Unavailable</option>
                </select>
              </div>

              {/* Min Stock Filter */}
              <div className="flex flex-col">
                <label htmlFor="minStock" className={`block text-sm font-medium mb-1.5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Minimum Stock Quantity</label>
                <input
                  type="number"
                  id="minStock"
                  className={`block w-full py-2.5 pl-3 pr-3 rounded-lg text-sm ${darkMode ? 'bg-slate-700 text-gray-200 border border-slate-600 focus:border-amber-500 focus:ring-amber-500' : 'bg-white text-gray-800 border border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}
                  placeholder="e.g., 10"
                  value={minStock}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === '' || /^\d+$/.test(value)) { // Allow empty string or digits only
                      setMinStock(value);
                      setCurrentPage(1); // Reset to first page on filter change
                    }
                  }}
                />
              </div>

              {/* Clear Filters Button */}
              {(searchTerm || availabilityFilter !== 'all' || minStock !== '') && (
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

          <div className={`rounded-xl shadow-2xl overflow-hidden ${darkMode ? "bg-slate-800/70 border border-slate-700" : "bg-white border border-gray-200"}`}>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead className={`${darkMode ? "bg-slate-800" : "bg-gray-50"}`}>
                  <tr className={`border-b ${darkMode ? "border-slate-700" : "border-gray-300"}`}>
                    {['Spice Details', 'Gallery', 'Variations & Stock', 'Availability', 'Actions'].map((header) => (
                      <th key={header} className={`p-4 sm:p-5 text-left text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-amber-400/90' : 'text-amber-600'}`}>
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className={`${darkMode ? "divide-y divide-slate-700/60" : "divide-y divide-gray-200"}`}>
                  {currentSpices.map((spice) => (
                    <tr key={spice.id} className={`transition-colors duration-200 ${darkMode ? "hover:bg-slate-700/40" : "hover:bg-gray-50/70"}`}>
                      <td className="p-4 sm:p-5 align-top min-w-[200px]">
                        <div className={`font-semibold text-base mb-1.5 ${darkMode ? 'text-amber-300' : 'text-amber-700'}`}>{spice.name}</div>
                        <div className={`text-xs space-y-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          <div><span className="font-medium text-gray-500 dark:text-gray-400/70">Origin:</span> {spice.origin || 'N/A'}</div>
                        </div>
                      </td>

                      <td className="p-4 sm:p-5 align-top min-w-[180px]">
                        <div className="flex flex-wrap gap-2.5">
                          {spice.imageUrls?.length > 0 ? (
                            spice.imageUrls.slice(0, 3).map((url, index) => (
                              <img
                                key={index}
                                src={url}
                                alt={`${spice.name} ${index + 1}`}
                                className={`w-16 h-16 object-cover rounded-lg border-2 ${darkMode ? 'border-slate-600 hover:border-amber-400' : 'border-gray-300 hover:border-amber-500'} shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer transform hover:scale-105`}
                                loading="lazy"
                              />
                            ))
                          ) : (
                            <div className={`flex flex-col items-center justify-center w-16 h-16 rounded-lg border ${darkMode ? 'border-slate-600 bg-slate-700/50 text-gray-500' : 'border-gray-300 bg-gray-100 text-gray-400'} text-xs p-1 text-center`}>
                              <FiImage className="w-5 h-5 mb-0.5" />
                              <span>No Image</span>
                            </div>
                          )}
                           {spice.imageUrls?.length > 3 && (
                            <div className={`flex items-center justify-center w-16 h-16 rounded-lg border text-xs font-medium ${darkMode ? 'border-slate-600 bg-slate-700/50 text-amber-400' : 'border-gray-300 bg-gray-100 text-amber-600'} cursor-pointer`}>
                              +{spice.imageUrls.length - 3} more
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="p-4 sm:p-5 align-top min-w-[280px]">
                        <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
                          {spice.variants?.length > 0 ? spice.variants.map((variant) => (
                            <div key={variant.id || variant.qualityClass} className={`text-xs p-2.5 rounded-lg ${darkMode ? 'bg-slate-700/70 shadow' : 'bg-gray-100/90 border border-gray-200'}`}>
                              <div className={`font-semibold mb-1.5 text-sm ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
                                {variant.qualityClass || 'Default Class'}
                              </div>
                              <div className="space-y-1.5 ml-1">
                                {variant.packs?.map((pack) => (
                                  <div key={pack.id || `${pack.packWeightInGrams}-${pack.price}`} className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} flex justify-between items-center`}>
                                    <span>{pack.packWeightInGrams}g &mdash; <span className="font-medium">₹{pack.price}</span></span>
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${pack.stockQuantity > 10 ? (darkMode ? 'bg-green-500/25 text-green-300' : 'bg-green-100 text-green-700') : pack.stockQuantity > 0 ? (darkMode ? 'bg-yellow-500/25 text-yellow-300' : 'bg-yellow-100 text-yellow-700') : (darkMode ? 'bg-red-500/25 text-red-300' : 'bg-red-100 text-red-700')}`}>
                                      Stock: {pack.stockQuantity}
                                    </span>
                                  </div>
                                ))}
                                {(!variant.packs || variant.packs.length === 0) && <span className="text-gray-500/80 dark:text-gray-400/60 text-xs italic">No packs defined.</span>}
                              </div>
                            </div>
                          )) : <span className="text-gray-500/80 dark:text-gray-400/60 text-xs italic">No variations defined for this spice.</span>}
                        </div>
                      </td>

                      <td className="p-4 sm:p-5 align-top min-w-[150px]">
                        <div className="flex items-center gap-2.5">
                          <button
                            aria-label={spice.isAvailable ? 'Mark as unavailable' : 'Mark as available'}
                            onClick={() => toggleAvailability(spice.id, spice.isAvailable)}
                            className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors duration-300 ease-in-out cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 ${darkMode ? 'focus:ring-offset-slate-800' : 'focus:ring-offset-white'}
                              ${spice.isAvailable ? 'bg-green-500 hover:bg-green-600 focus:ring-green-400' : 'bg-red-500 hover:bg-red-600 focus:ring-red-400'}`}
                          >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-300 ease-in-out
                              ${spice.isAvailable ? 'translate-x-6' : 'translate-x-1'}`}
                            />
                          </button>
                          <span className={`text-xs font-medium ${spice.isAvailable ? (darkMode ? 'text-green-300' : 'text-green-700') : (darkMode ? 'text-red-300' : 'text-red-700')}`}>
                            {spice.isAvailable ? 'Available' : 'Unavailable'}
                          </span>
                        </div>
                      </td>

                      <td className="p-4 sm:p-5 align-top text-center sm:text-left">
                        <div className="flex gap-2 sm:gap-2.5">
                          <button
                            className={`p-2 rounded-md transition-all duration-200 transform hover:scale-110 focus:outline-none focus:ring-2 ${darkMode ? 'hover:bg-blue-500/25 text-blue-400 focus:ring-blue-400 focus:ring-offset-slate-800' : 'hover:bg-blue-100 text-blue-600 focus:ring-blue-500 focus:ring-offset-white'}`}
                            title="View/Edit details"
                            onClick={() => window.location.href = `/admin/spice-list/${spice.id}`}
                          >
                            <FiInfo className="w-4.5 h-4.5" />
                          </button>
                          <button
                            className={`p-2 rounded-md transition-all duration-200 transform hover:scale-110 focus:outline-none focus:ring-2 ${darkMode ? 'hover:bg-red-500/25 text-red-400 focus:ring-red-400 focus:ring-offset-slate-800' : 'hover:bg-red-100 text-red-600 focus:ring-red-500 focus:ring-offset-white'}`}
                            title="Delete Spice"
                            onClick={() => handleDelete(spice.id)}
                          >
                            <FiTrash2 className="w-4.5 h-4.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {currentSpices.length === 0 && !loading && ( // Check currentSpices for 'no results' when filters are applied
              <div className="text-center py-16 px-6">
                <FiInfo className="inline-block text-4xl text-gray-500 dark:text-gray-600 mb-3" />
                <p className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-1">No Spices Found</p>
                {spices.length > 0 && (searchTerm || availabilityFilter !== 'all' || minStock !== '') ? (
                  <p className="text-sm text-gray-500 dark:text-gray-500">
                    Your current filters returned no results. Try adjusting them.
                  </p>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-500">
                    It looks like the spice rack is empty. Click "Add New Spice" to get started!
                  </p>
                )}
              </div>
            )}


            {/* Pagination Controls */}
            {filteredSpices.length > spicesPerPage && ( // Show pagination only if filtered results exceed one page
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