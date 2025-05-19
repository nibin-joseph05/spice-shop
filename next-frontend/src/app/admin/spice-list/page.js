// app/admin/spices/page.js
"use client";
import { useEffect, useState } from "react";
import { Sidebar } from "@/components/admin/Sidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { FiEdit, FiTrash2, FiInfo, FiImage, FiAlertTriangle } from "react-icons/fi";

export default function SpiceListPage() {
  const [darkMode] = useState(true);
  const [spices, setSpices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSpices = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/spices`);
        if (!response.ok) throw new Error('Failed to fetch spices');
        const data = await response.json();
        setSpices(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchSpices();
  }, []);

  const handleDelete = async (spiceId) => {
    if (confirm("Are you sure you want to permanently delete this spice?")) {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/spices/${spiceId}`, {
          method: 'DELETE'
        });
        if (!response.ok) throw new Error('Deletion failed');
        setSpices(spices.filter(spice => spice.id !== spiceId));
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const toggleAvailability = async (spiceId, currentStatus) => {
    const originalStatus = currentStatus;
    try {
      setSpices(spices.map(spice =>
        spice.id === spiceId ? { ...spice, isAvailable: !currentStatus } : spice
      ));

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/spices/${spiceId}/availability`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ available: !currentStatus })
      });

      if (!response.ok) throw new Error('Update failed');
    } catch (err) {
      setError(err.message);
      setSpices(spices.map(spice =>
        spice.id === spiceId ? { ...spice, isAvailable: originalStatus } : spice
      ));
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 p-8 bg-gray-900 text-gray-100">
          <div className="max-w-6xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-800 rounded w-64 mb-8"></div>
              <div className="rounded-2xl bg-gray-800/50 border border-gray-700">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      {['Spice Details', 'Images', 'Quality Classes', 'Stock Status', 'Actions'].map((header, idx) => (
                        <th key={idx} className="p-5 text-left">
                          <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[1, 2, 3].map((row) => (
                      <tr key={row} className="border-b border-gray-700">
                        {[1, 2, 3, 4, 5].map((cell) => (
                          <td key={cell} className="p-5">
                            <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                          </td>
                        ))}
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

  if (error) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 p-8 bg-gray-900 text-gray-100 flex items-center justify-center">
          <div className="text-center py-12">
            <FiAlertTriangle className="mx-auto h-12 w-12 text-red-400 mb-4" />
            <p className="text-red-400 mb-4">Error loading spices: {error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-amber-400/20 text-amber-400 rounded-lg hover:bg-amber-400/30 transition-colors"
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
      <main className={`flex-1 p-8 ${darkMode ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"}`}>
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-400 to-green-400 bg-clip-text text-transparent">
              Spice Inventory Management
            </h1>
            <button
              onClick={() => window.location.href = '/admin/add-spice'}
              className="px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/30 transition-colors"
            >
              + Add New Spice
            </button>
          </div>

          <div className={`rounded-2xl ${darkMode ? "bg-gray-800/50 border border-gray-700" : "bg-white border border-gray-200"} shadow-xl`}>
            <table className="w-full">
              <thead>
                <tr className={`border-b ${darkMode ? "border-gray-700" : "border-gray-200"}`}>
                  {['Spice Details', 'Images', 'Quality Classes & Pricing', 'Stock Status', 'Actions'].map((header, idx) => (
                    <th key={idx} className="p-5 text-left text-sm font-semibold text-amber-400">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {spices.map((spice) => (
                  <tr key={spice.id} className={`hover:${darkMode ? "bg-gray-800/30" : "bg-gray-50"} border-b ${darkMode ? "border-gray-700" : "border-gray-200"}`}>
                    {/* Spice Details */}
                    <td className="p-5">
                      <div className="font-medium text-amber-400">{spice.name}</div>
                      <div className="text-sm mt-2 space-y-1">
                        <div>
                          <span className="text-gray-400">Origin:</span> {spice.origin || 'Origin not provided'}
                        </div>
                        <div>
                          <span className="text-gray-400">Unit:</span> {spice.unit}
                        </div>
                      </div>
                    </td>

                    {/* Images */}
                    <td className="p-5">
                      <div className="flex gap-2 overflow-x-auto pb-2">
                        {spice.imageUrls?.length > 0 ? (
                          spice.imageUrls.map((url, index) => (
                            <img
                              key={index}
                              src={url}
                              alt={`${spice.name} ${index + 1}`}
                              className="w-16 h-16 object-cover rounded-lg border border-gray-700"
                              loading="lazy"
                            />
                          ))
                        ) : (
                          <div className="flex items-center text-gray-400 text-sm">
                            <FiImage className="mr-2" /> No images uploaded
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Variants */}
                    <td className="p-5">
                      <div className="space-y-2">
                        {spice.variants?.map((variant, index) => (
                          <div key={index} className="text-sm flex items-center gap-2">
                            <span className="font-medium text-emerald-400">Class {variant.qualityClass}:</span>
                            <span className={`${darkMode ? 'bg-gray-700/40' : 'bg-gray-100'} px-2 py-1 rounded`}>
                              ₹{variant.price}
                            </span>
                          </div>
                        ))}
                      </div>
                    </td>

                    {/* Availability */}
                    <td className="p-5">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => toggleAvailability(spice.id, spice.isAvailable)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                            ${spice.isAvailable ? 'bg-green-500' : 'bg-red-500'}
                            ${darkMode ? 'hover:bg-opacity-80' : 'hover:bg-opacity-60'}`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                            ${spice.isAvailable ? 'translate-x-6' : 'translate-x-1'}`}
                          />
                        </button>
                        <span className="text-sm font-medium">
                          {spice.isAvailable ? 'Available' : 'Unavailable'}
                        </span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="p-5">
                      <div className="flex gap-2">
                        <button
                          className="p-2 hover:bg-amber-400/20 text-amber-400 rounded-lg transition-colors"
                          title="Edit spice details"
                          onClick={() => window.location.href = `/admin/edit-spice/${spice.id}`}
                        >
                          <FiEdit className="w-5 h-5" />
                        </button>
                        <button
                          className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                          title="Delete spice permanently"
                          onClick={() => handleDelete(spice.id)}
                        >
                          <FiTrash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {spices.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <FiInfo className="inline-block mr-2" />
              No spices found in inventory. Start by adding a new spice.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}