// app/admin/profile/edit/page.js

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; // For redirection
import { Sidebar } from "@/components/admin/Sidebar";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiSave,
  FiArrowLeft,
  FiAlertTriangle,
  FiCheckCircle,
  FiXCircle,
  FiInfo,
} from "react-icons/fi";

export default function AdminProfileEditPage() {
  const router = useRouter();
  const [darkMode] = useState(true);
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState(null);
  const [formError, setFormError] = useState(null);
  const [formSuccess, setFormSuccess] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // --- Validation Regex ---
  const nameRegex = /^[A-Za-z\s]+$/; // Only letters and spaces
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Basic email format
  const phoneRegex = /^\d{10,}$/; // At least 10 digits for phone number

  const fetchAdminProfile = async () => {
    setLoading(true);
    setPageError(null);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/profile`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `Failed to fetch admin profile. Status: ${response.status}` }));
        throw new Error(errorData.message || `Failed to fetch admin profile. Status: ${response.status}`);
      }

      const data = await response.json();
      setAdmin(data);
      // Pre-fill form fields, ensuring null/undefined are treated as empty strings
      setName(data.name || "");
      setEmail(data.email || "");
      setPhone(data.phone || "");
    } catch (err) {
      setPageError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminProfile();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);
    setIsSubmitting(true);

    // --- Client-Side Validation ---
    if (!name.trim()) {
      setFormError("Name is required.");
      setIsSubmitting(false);
      return;
    }
    if (!nameRegex.test(name)) {
      setFormError("Name can only contain letters and spaces.");
      setIsSubmitting(false);
      return;
    }

    if (!email.trim()) {
      setFormError("Email is required.");
      setIsSubmitting(false);
      return;
    }
    if (!emailRegex.test(email)) {
      setFormError("Please enter a valid email format.");
      setIsSubmitting(false);
      return;
    }

    // Phone number is optional, but if provided, it must be valid
    if (phone.trim() !== "" && !phoneRegex.test(phone)) {
      setFormError("Phone number must contain at least 10 digits and only numbers.");
      setIsSubmitting(false);
      return;
    }

    if (!admin?.id) {
      setFormError("Admin ID not found. Cannot update profile.");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/update-profile/${admin.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: admin.id,
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim() === "" ? null : phone.trim(), // Send null if empty
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || `Failed to update profile. Status: ${response.status}`);
      }

      setFormSuccess("Profile updated successfully!");
      // Refetch profile data to ensure local state is fresh
      await fetchAdminProfile();
      setTimeout(() => {
        setFormSuccess(null);
        router.push("/admin/profile"); // Redirect back to profile view
      }, 2000);
    } catch (err) {
      setFormError(err.message);
      setTimeout(() => setFormError(null), 5000); // Clear error after 5 seconds
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Loading State (Skeleton) ---
  if (loading) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 p-6 md:p-8 bg-slate-900 text-gray-200">
          <div className="max-w-xl mx-auto animate-pulse">
            <h1 className="h-10 bg-gradient-to-r from-teal-400 via-blue-400 to-purple-400 rounded-md w-64 mb-8"></h1>
            <div className="bg-slate-800/60 p-8 rounded-xl shadow-2xl border border-slate-700 space-y-6">
              <div className="space-y-4">
                <div className="h-4 bg-slate-700 rounded-md w-1/4"></div>
                <div className="h-12 bg-slate-700 rounded-lg w-full"></div>
              </div>
              <div className="space-y-4">
                <div className="h-4 bg-slate-700 rounded-md w-1/4"></div>
                <div className="h-12 bg-slate-700 rounded-lg w-full"></div>
              </div>
              <div className="space-y-4">
                <div className="h-4 bg-slate-700 rounded-md w-1/4"></div>
                <div className="h-12 bg-slate-700 rounded-lg w-full"></div>
              </div>
              <div className="h-12 bg-blue-700/50 rounded-lg w-full mt-8"></div>
              <div className="h-10 bg-gray-700/50 rounded-lg w-32 ml-auto"></div>
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
            <h2 className="text-xl sm:text-2xl font-semibold text-red-300 mb-3">Error Loading Profile</h2>
            <p className="text-red-400/80 mb-8 text-sm sm:text-base">{pageError}</p>
            <button
              onClick={fetchAdminProfile}
              className="px-6 py-2.5 bg-amber-500/80 text-slate-900 rounded-lg hover:bg-amber-500 transition-all duration-300 ease-in-out text-sm font-semibold transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-opacity-70"
            >
              Try Again
            </button>
          </div>
        </main>
      </div>
    );
  }

  // --- No Admin Data Found (Edge Case if fetchAdminProfile returns null after loading) ---
  if (!admin) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 p-6 md:p-8 bg-slate-900 text-gray-200 flex items-center justify-center">
          <div className="text-center py-12 bg-slate-800/70 p-8 sm:p-10 rounded-xl shadow-2xl border border-blue-500/40 max-w-md w-full">
            <FiInfo className="mx-auto h-16 w-16 text-blue-400 mb-6" />
            <h2 className="text-xl sm:text-2xl font-semibold text-blue-300 mb-3">Admin Profile Not Available</h2>
            <p className="text-blue-400/80 mb-8 text-sm sm:text-base">
              No admin profile could be loaded. Please ensure an admin user exists in the backend database.
            </p>
            <button
              onClick={fetchAdminProfile}
              className="px-6 py-2.5 bg-emerald-500/80 text-slate-900 rounded-lg hover:bg-emerald-500 transition-all duration-300 ease-in-out text-sm font-semibold transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-opacity-70"
            >
              Reload Profile
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
        <div className="max-w-xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-8 sm:mb-10">
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-teal-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-4 sm:mb-0 text-center sm:text-left">
              Edit Admin Profile
            </h1>
            <button
              onClick={() => router.push("/admin/profile")}
              className="px-5 py-2.5 bg-gray-700/80 hover:bg-gray-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 ease-in-out flex items-center gap-2.5 text-sm font-medium transform hover:scale-105 group focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-60"
            >
              <FiArrowLeft className="w-5 h-5" /> Back to Profile
            </button>
          </div>

          {/* Form Success/Error Messages */}
          {formSuccess && (
            <div className="mb-6 p-3.5 bg-green-900/50 border border-green-700 text-green-300 rounded-lg flex items-center gap-3 text-sm shadow-md">
              <FiCheckCircle className="w-5 h-5 flex-shrink-0" />
              <span>{formSuccess}</span>
            </div>
          )}
          {formError && (
            <div className="mb-6 p-3.5 bg-red-900/50 border border-red-700 text-red-300 rounded-lg flex items-center gap-3 text-sm shadow-md">
              <FiXCircle className="w-5 h-5 flex-shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div className={`rounded-xl shadow-2xl overflow-hidden ${darkMode ? "bg-slate-800/70 border border-slate-700" : "bg-white border border-gray-200"}`}>
            <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
              {/* Name Field */}
              <div>
                <label htmlFor="name" className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  <FiUser className="inline-block mr-2 align-middle" /> Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`block w-full py-2.5 px-4 rounded-lg text-sm ${darkMode ? 'bg-slate-700 text-gray-200 border border-slate-600 focus:border-blue-500 focus:ring-blue-500' : 'bg-white text-gray-800 border border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}
                  placeholder="Enter your name"
                  required
                />
              </div>

              {/* Email Field */}
              <div>
                <label htmlFor="email" className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  <FiMail className="inline-block mr-2 align-middle" /> Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`block w-full py-2.5 px-4 rounded-lg text-sm ${darkMode ? 'bg-slate-700 text-gray-200 border border-slate-600 focus:border-blue-500 focus:ring-blue-500' : 'bg-white text-gray-800 border border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}
                  placeholder="Enter your email"
                  required
                />
                <p className={`text-xs mt-1.5 ${darkMode ? 'text-gray-500' : 'text-gray-500'} italic`}>
                  <FiInfo className="inline-block mr-1 align-text-bottom text-blue-400" /> Be careful when changing your email. This may affect your login if session management is tied to it.
                </p>
              </div>

              {/* Phone Field */}
              <div>
                <label htmlFor="phone" className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  <FiPhone className="inline-block mr-2 align-middle" /> Phone Number (Optional)
                </label>
                <input
                  type="text"
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={`block w-full py-2.5 px-4 rounded-lg text-sm ${darkMode ? 'bg-slate-700 text-gray-200 border border-slate-600 focus:border-blue-500 focus:ring-blue-500' : 'bg-white text-gray-800 border border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}
                  placeholder="Enter your phone number (e.g., 9876543210)"
                />
                <p className={`text-xs mt-1.5 ${darkMode ? 'text-gray-500' : 'text-gray-500'} italic`}>
                  Must be at least 10 digits and contain only numbers.
                </p>
              </div>

              <button
                type="submit"
                className={`w-full px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md transition-all duration-300 ease-in-out text-sm font-semibold transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-70 flex items-center justify-center gap-2
                  ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  <>
                    <FiSave className="w-5 h-5" /> Save Changes
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}