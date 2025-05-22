"use client";
import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/admin/Sidebar";
import { FiEdit, FiTrash2, FiArrowLeft, FiImage, FiAlertTriangle } from "react-icons/fi";

export default function SpiceDetailsPage({ params: paramsPromise }) {
  const params = use(paramsPromise);
  const [darkMode] = useState(true);
  const [spice, setSpice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchSpice = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/spices/${params.id}`);
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: `Failed to fetch spice. Status: ${response.status}` }));
          throw new Error(errorData.message || `Failed to fetch spice. Status: ${response.status}`);
        }
        const data = await response.json();
        setSpice(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchSpice();
  }, [params.id]);

  const handleDelete = async () => {
    if (confirm("Are you sure you want to permanently delete this spice? This action cannot be undone.")) {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/spices/${params.id}`, {
          method: 'DELETE'
        });
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: 'Deletion failed on the server.' }));
          throw new Error(errorData.message || 'Deletion failed on the server.');
        }
        router.push('/admin/spice-list'); // Redirect to spice list on successful delete
      } catch (err) {
        setError(`Deletion failed: ${err.message}`);
      }
    }
  };

  const toggleAvailability = async () => {
    const originalStatus = spice.isAvailable;
    // Optimistic update
    setSpice({ ...spice, isAvailable: !originalStatus });

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/spices/${params.id}/availability`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ available: !originalStatus })
        }
      );
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to update availability on the server.' }));
        throw new Error(errorData.message || 'Failed to update availability on the server.');
      }
      // If successful, state is already updated.
    } catch (err) {
      setError(`Availability update failed: ${err.message}`);
      setSpice({ ...spice, isAvailable: originalStatus }); // Rollback on error
    }
  };

  // --- Skeleton Loader ---
  if (loading) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 p-6 md:p-8 bg-slate-900 text-gray-200">
          <div className="max-w-7xl mx-auto animate-pulse">
            {/* Back button placeholder */}
            <div className="h-10 bg-slate-700 rounded-lg w-32 mb-8"></div>

            {/* Header and action buttons placeholder */}
            <div className="flex justify-between items-center mb-8">
              <div className="h-10 bg-slate-700 rounded-md w-72"></div>
              <div className="flex gap-3">
                <div className="h-10 bg-slate-700 rounded-lg w-24"></div>
                <div className="h-10 bg-slate-700 rounded-lg w-24"></div>
                <div className="h-10 bg-slate-700 rounded-lg w-24"></div>
              </div>
            </div>

            {/* Main content sections placeholder */}
            <div className={`rounded-xl bg-slate-800/50 border border-slate-700 p-8 mb-8`}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <div className="h-6 bg-slate-700 rounded w-48 mb-4"></div> {/* Images title */}
                  <div className="flex flex-wrap gap-4">
                    <div className="w-32 h-32 bg-slate-700 rounded-lg"></div>
                    <div className="w-32 h-32 bg-slate-700 rounded-lg"></div>
                    <div className="w-32 h-32 bg-slate-700 rounded-lg"></div>
                  </div>
                </div>
                <div>
                  <div className="h-6 bg-slate-700 rounded w-48 mb-4"></div> {/* Details title */}
                  <div className="space-y-4">
                    <div className="h-4 bg-slate-700 rounded w-3/4"></div>
                    <div className="h-4 bg-slate-700 rounded w-full"></div>
                    <div className="h-4 bg-slate-700 rounded w-1/2"></div>
                    <div className="h-4 bg-slate-700 rounded w-2/3"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quality Classes placeholder */}
            <div className={`rounded-xl bg-slate-800/50 border border-slate-700 p-8`}>
              <div className="h-6 bg-slate-700 rounded w-64 mb-6"></div> {/* Quality Classes title */}
              <div className="space-y-6">
                <div className="border-b border-slate-700 pb-6">
                  <div className="h-5 bg-slate-600 rounded w-32 mb-4"></div> {/* Class title */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="h-24 bg-slate-700/30 rounded-lg"></div>
                    <div className="h-24 bg-slate-700/30 rounded-lg"></div>
                    <div className="h-24 bg-slate-700/30 rounded-lg"></div>
                  </div>
                </div>
                <div className="border-b border-slate-700 pb-6 last:border-0">
                  <div className="h-5 bg-slate-600 rounded w-32 mb-4"></div> {/* Class title */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="h-24 bg-slate-700/30 rounded-lg"></div>
                    <div className="h-24 bg-slate-700/30 rounded-lg"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // --- Error State ---
  if (error) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 p-6 md:p-8 bg-slate-900 text-gray-200 flex items-center justify-center">
          <div className="text-center py-12 bg-slate-800/70 p-8 sm:p-10 rounded-xl shadow-2xl border border-red-500/40 max-w-md w-full">
            <FiAlertTriangle className="mx-auto h-16 w-16 text-red-400 mb-6" />
            <h2 className="text-xl sm:text-2xl font-semibold text-red-300 mb-3">Error Loading Spice</h2>
            <p className="text-red-400/80 mb-8 text-sm sm:text-base">{error}</p>
            <button
              onClick={() => router.back()}
              className="px-6 py-2.5 bg-amber-500/80 text-slate-900 rounded-lg hover:bg-amber-500 transition-all duration-300 ease-in-out text-sm font-semibold transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-opacity-70"
            >
              Go Back
            </button>
          </div>
        </main>
      </div>
    );
  }

  // --- Not Found State (if spice is null after loading and no error) ---
  if (!spice) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 p-6 md:p-8 bg-slate-900 text-gray-200 flex items-center justify-center">
          <div className="text-center py-12 bg-slate-800/70 p-8 sm:p-10 rounded-xl shadow-2xl border border-blue-500/40 max-w-md w-full">
            <FiInfo className="mx-auto h-16 w-16 text-blue-400 mb-6" /> {/* Changed icon to FiInfo for 'not found' */}
            <h2 className="text-xl sm:text-2xl font-semibold text-blue-300 mb-3">Spice Not Found</h2>
            <p className="text-blue-400/80 mb-8 text-sm sm:text-base">The spice you are looking for does not exist or has been deleted.</p>
            <button
              onClick={() => router.push('/admin/spices')}
              className="px-6 py-2.5 bg-amber-500/80 text-slate-900 rounded-lg hover:bg-amber-500 transition-all duration-300 ease-in-out text-sm font-semibold transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-opacity-70"
            >
              Back to Spice List
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
          {/* Back Button */}
          <button
            onClick={() => router.back()}
            className="mb-8 px-5 py-2.5 bg-slate-800 text-gray-300 rounded-lg shadow-md hover:bg-slate-700/60 transition-all duration-300 ease-in-out flex items-center gap-2.5 text-sm font-medium transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-opacity-70"
          >
            <FiArrowLeft className="w-5 h-5" /> Back to List
          </button>

          {/* Page Header and Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-between items-center mb-8 sm:mb-10">
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-amber-400 via-orange-400 to-emerald-400 bg-clip-text text-transparent mb-4 sm:mb-0 text-center sm:text-left">
              {spice.name} Details
            </h1>
            <div className="flex gap-2 sm:gap-3">
              <button
                onClick={toggleAvailability}
                className={`px-5 py-2.5 rounded-lg transition-all duration-300 ease-in-out flex items-center gap-2.5 text-sm font-medium transform hover:scale-105 focus:outline-none focus:ring-2
                  ${spice.isAvailable
                    ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30 focus:ring-green-400 focus:ring-offset-slate-900'
                    : 'bg-red-500/20 text-red-400 hover:bg-red-500/30 focus:ring-red-400 focus:ring-offset-slate-900'
                  }`}
              >
                {spice.isAvailable ? 'Mark Unavailable' : 'Mark Available'}
              </button>
              <button
                onClick={() => router.push(`/admin/edit-spice/${spice.id}`)}
                className="px-5 py-2.5 bg-amber-500/20 text-amber-400 rounded-lg shadow-md hover:bg-amber-500/30 transition-all duration-300 ease-in-out flex items-center gap-2.5 text-sm font-medium transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-opacity-70"
              >
                <FiEdit className="w-5 h-5" /> Edit Spice
              </button>
              <button
                onClick={handleDelete}
                className="px-5 py-2.5 bg-red-500/20 text-red-400 rounded-lg shadow-md hover:bg-red-500/30 transition-all duration-300 ease-in-out flex items-center gap-2.5 text-sm font-medium transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-70"
              >
                <FiTrash2 className="w-5 h-5" /> Delete Spice
              </button>
            </div>
          </div>

          {/* Images and Details Section */}
          <div className={`rounded-xl shadow-2xl ${darkMode ? "bg-slate-800/70 border border-slate-700" : "bg-white border border-gray-200"} p-6 sm:p-8 mb-8`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
              {/* Images Column */}
              <div>
                <h2 className={`text-xl md:text-2xl font-semibold mb-5 ${darkMode ? 'text-amber-400' : 'text-amber-600'}`}>Spice Gallery</h2>
                <div className="flex flex-wrap gap-4">
                  {spice.imageUrls?.length > 0 ? (
                    spice.imageUrls.map((url, index) => (
                      <img
                        key={index}
                        src={url}
                        alt={`${spice.name} ${index + 1}`}
                        className={`w-28 h-28 sm:w-32 sm:h-32 object-cover rounded-lg border-2 ${darkMode ? 'border-slate-600 hover:border-amber-400' : 'border-gray-300 hover:border-amber-500'} shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer transform hover:scale-105`}
                        loading="lazy"
                      />
                    ))
                  ) : (
                    <div className={`flex flex-col items-center justify-center w-full h-32 rounded-lg border-2 border-dashed ${darkMode ? 'border-slate-600 bg-slate-700/30 text-gray-500' : 'border-gray-300 bg-gray-100 text-gray-400'} text-sm p-4 text-center`}>
                      <FiImage className="w-8 h-8 mb-2" />
                      <span>No images available for this spice.</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Details Column */}
              <div>
                <h2 className={`text-xl md:text-2xl font-semibold mb-5 ${darkMode ? 'text-amber-400' : 'text-amber-600'}`}>Spice Details</h2>
                <div className={`space-y-4 text-base ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  <div>
                    <span className={`font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Origin:</span> {spice.origin || <span className="italic text-gray-500">Not specified</span>}
                  </div>
                  <div>
                    <span className={`font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Description:</span> {spice.description || <span className="italic text-gray-500">No description provided</span>}
                  </div>
                  <div>
                    <span className={`font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Created At:</span> {new Date(spice.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
                  <div>
                    <span className={`font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Last Updated:</span> {new Date(spice.updatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
                  <div>
                    <span className={`font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Availability Status:</span>
                    <span className={`ml-2 px-2.5 py-0.5 rounded-full text-xs font-medium ${spice.isAvailable ? (darkMode ? 'bg-green-600/30 text-green-300' : 'bg-green-100 text-green-700') : (darkMode ? 'bg-red-600/30 text-red-300' : 'bg-red-100 text-red-700')}`}>
                      {spice.isAvailable ? 'AVAILABLE' : 'UNAVAILABLE'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quality Classes & Pricing Section */}
          <div className={`rounded-xl shadow-2xl ${darkMode ? "bg-slate-800/70 border border-slate-700" : "bg-white border border-gray-200"} p-6 sm:p-8`}>
            <h2 className={`text-xl md:text-2xl font-semibold mb-6 ${darkMode ? 'text-amber-400' : 'text-amber-600'}`}>Quality Classes & Pricing</h2>
            <div className="space-y-8">
              {spice.variants?.length > 0 ? (
                spice.variants.map((variant) => (
                  <div key={variant.id} className={`pb-8 last:pb-0 ${darkMode ? 'border-b border-slate-700 last:border-0' : 'border-b border-gray-200 last:border-0'}`}>
                    <h3 className={`font-medium text-xl mb-4 ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
                      {variant.qualityClass || 'Default Class'}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                      {variant.packs?.length > 0 ? (
                        variant.packs.map((pack) => (
                          <div key={pack.id} className={`p-5 rounded-lg ${darkMode ? 'bg-slate-700/50 hover:bg-slate-700 shadow-lg' : 'bg-gray-100 hover:bg-gray-200 shadow-md'} transition-all duration-200`}>
                            <div className={`font-semibold text-lg mb-2 ${darkMode ? 'text-amber-300' : 'text-amber-700'}`}>{pack.packWeightInGrams}g Pack</div>
                            <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Price: <span className="font-medium text-base">₹{pack.price}</span></div>
                            <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Stock: <span className="font-medium text-base">{pack.stockQuantity}</span></div>
                            <div className={`mt-2 text-xs font-medium px-2 py-0.5 rounded-full inline-block
                              ${pack.stockQuantity > 10 ? (darkMode ? 'bg-green-600/25 text-green-300' : 'bg-green-100 text-green-700') :
                                pack.stockQuantity > 0 ? (darkMode ? 'bg-yellow-600/25 text-yellow-300' : 'bg-yellow-100 text-yellow-700') :
                                (darkMode ? 'bg-red-600/25 text-red-300' : 'bg-red-100 text-red-700')
                              }`}
                            >
                              {pack.stockQuantity > 10 ? 'In Stock' : pack.stockQuantity > 0 ? 'Low Stock' : 'Out of Stock'}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className={`col-span-full text-center py-4 italic ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                          No packs defined for this quality class.
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className={`text-center py-8 italic ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  No quality variants defined for this spice.
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}