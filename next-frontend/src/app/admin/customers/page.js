// app/admin/customers/page.js

"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/admin/Sidebar";
import {
  FiUsers,
  FiAlertTriangle,
  FiRefreshCw,
  FiMail,
  FiUser, // For firstName, lastName
  FiHash, // For ID
  FiFeather // For displayName (just an example icon, choose what fits)
} from "react-icons/fi";

export default function AdminCustomersPage() {
  const [darkMode] = useState(true);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCustomers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/all`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `Failed to fetch customers. Status: ${response.status}` }));
        throw new Error(errorData.message || `Failed to fetch customers. Status: ${response.status}`);
      }

      const data = await response.json();
      setCustomers(data);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching customers:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // --- Loading State (Skeleton Table) ---
  if (loading) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 p-6 md:p-10 bg-slate-900 text-gray-200">
          <div className="max-w-6xl mx-auto animate-pulse">
            <h1 className="h-12 bg-gradient-to-r from-teal-400 via-blue-400 to-purple-400 rounded-lg w-80 mb-10"></h1>
            <div className="bg-slate-800/60 p-6 rounded-2xl shadow-xl border border-slate-700">
              <div className="h-10 bg-slate-700 rounded-lg w-48 mb-6"></div> {/* Table title skeleton */}
              <div className="overflow-hidden rounded-lg">
                <table className="min-w-full divide-y divide-slate-700">
                  <thead>
                    <tr>
                      {[...Array(4)].map((_, i) => ( // Changed to 4 columns for skeleton (ID, Name, Display Name, Email)
                        <th key={i} className="px-6 py-3 bg-slate-700 text-left text-xs font-medium text-slate-300 uppercase tracking-wider h-10"></th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {[...Array(7)].map((_, rowIndex) => ( // 7 rows for skeleton
                      <tr key={rowIndex} className="bg-slate-800">
                        {[...Array(4)].map((_, colIndex) => ( // Changed to 4 columns for skeleton
                          <td key={colIndex} className="px-6 py-4 whitespace-nowrap">
                            <div className="h-6 bg-slate-700 rounded w-full"></div>
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

  // --- Error State ---
  if (error) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 p-6 md:p-10 bg-slate-900 text-gray-200 flex items-center justify-center">
          <div className="text-center py-16 bg-slate-800/70 p-10 rounded-2xl shadow-2xl border border-red-500/40 max-w-lg w-full">
            <FiAlertTriangle className="mx-auto h-20 w-20 text-red-400 mb-8" />
            <h2 className="text-3xl font-bold text-red-300 mb-4">Error Loading Customers</h2>
            <p className="text-red-400/80 mb-10 text-base">{error}</p>
            <button
              onClick={fetchCustomers}
              className="px-8 py-3 bg-amber-500/90 text-slate-900 rounded-xl hover:bg-amber-500 transition-all duration-300 ease-in-out text-lg font-semibold transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-opacity-70"
            >
              <FiRefreshCw className="inline-block mr-2 w-6 h-6" /> Try Again
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
      <main className={`flex-1 p-6 md:p-10 transition-colors duration-300 ${darkMode ? "bg-slate-900 text-gray-200" : "bg-gray-100 text-gray-800"}`}>
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-10 sm:mb-12">
            <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-teal-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-6 sm:mb-0 text-center sm:text-left">
              Customer Management
            </h1>
            <button
              onClick={fetchCustomers}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out flex items-center gap-3 text-base font-semibold transform hover:scale-105 group focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-70"
            >
              <FiRefreshCw className="w-6 h-6 group-hover:rotate-180 transition-transform duration-300" /> Refresh List
            </button>
          </div>

          <div className={`rounded-2xl shadow-2xl overflow-hidden ${darkMode ? "bg-slate-800/70 border border-slate-700" : "bg-white border border-gray-200"}`}>
            <div className="p-6 sm:p-8">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-teal-400 to-blue-400 bg-clip-text text-transparent mb-6">
                All Customers
              </h2>

              {customers.length === 0 && !loading && !error ? (
                <div className="text-center py-8">
                  <p className="text-gray-400 text-lg">No customers found.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-700">
                    <thead className="bg-slate-700">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider rounded-tl-lg">
                          <FiHash className="inline-block mr-1 text-slate-400" /> ID
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                          <FiUser className="inline-block mr-1 text-slate-400" /> Name
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                          <FiFeather className="inline-block mr-1 text-slate-400" /> Display Name
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider rounded-tr-lg">
                          <FiMail className="inline-block mr-1 text-slate-400" /> Email
                        </th>
                        {/* Removed Phone and Created At as they are not in your User model/database */}
                      </tr>
                    </thead>
                    <tbody className="bg-slate-800/50 divide-y divide-slate-700">
                      {customers.map((customer) => (
                        <tr key={customer.id} className="hover:bg-slate-700/50 transition-colors duration-200">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-300">
                            {customer.id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                            {customer.firstName} {customer.lastName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                            {customer.displayName ? customer.displayName : <span className="italic text-gray-500">N/A</span>}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                            {customer.email}
                          </td>
                          {/* Removed Phone and Created At cells */}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}