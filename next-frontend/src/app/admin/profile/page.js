// app/admin/profile/page.js

"use client"; // This directive is necessary for client-side functionality in the App Router

import { useEffect, useState } from "react";
import Link from "next/link"; // Import Link for navigation
import { Sidebar } from "@/components/admin/Sidebar";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiKey,
  FiEye,
  FiEyeOff,
  FiAlertTriangle,
  FiRefreshCw,
  FiClipboard,
  FiInfo,
  FiLock,
  FiCheckCircle,
  FiXCircle,
  FiEdit, // Added for Edit Profile button
} from "react-icons/fi";

export default function AdminProfilePage() {
  const [darkMode] = useState(true);
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState(null);
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [operationMessage, setOperationMessage] = useState(null);

  // State for password change form
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [passwordChangeError, setPasswordChangeError] = useState("");
  const [passwordChangeLoading, setPasswordChangeLoading] = useState(false);

  // --- Password Validation Regular Expressions ---
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  // Function to fetch admin profile data
  const fetchAdminProfile = async () => {
    setLoading(true);
    setPageError(null);
    setOperationMessage(null); // Clear any previous operation messages
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/profile`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `Failed to fetch admin profile. Status: ${response.status}` }));
        throw new Error(errorData.message || `Failed to fetch admin profile. Status: ${response.status}`);
      }

      const data = await response.json();
      setAdmin(data);
    } catch (err) {
      setPageError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch admin profile on component mount
  useEffect(() => {
    fetchAdminProfile();
  }, []);

  // Handler for copying the secret key to clipboard
  const handleCopySecretKey = async () => {
    if (admin?.secretKey) {
      try {
        await navigator.clipboard.writeText(admin.secretKey);
        setOperationMessage({ type: 'success', text: "Secret key copied to clipboard!" });
        setTimeout(() => setOperationMessage(null), 3000);
      } catch (err) {
        setOperationMessage({ type: 'error', text: "Failed to copy secret key." });
        console.error("Failed to copy secret key:", err);
        setTimeout(() => setOperationMessage(null), 3000);
      }
    }
  };

  // Handler for changing password
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordChangeError("");
    setOperationMessage(null);
    setPasswordChangeLoading(true);

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setPasswordChangeError("All password fields are required.");
      setPasswordChangeLoading(false);
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setPasswordChangeError("New password and confirm password do not match.");
      setPasswordChangeLoading(false);
      return;
    }

    if (!passwordRegex.test(newPassword)) {
      setPasswordChangeError(
        "New password must be at least 8 characters long and include uppercase, lowercase, numbers, and symbols."
      );
      setPasswordChangeLoading(false);
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: admin.email,
          currentPassword,
          newPassword,
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || `Failed to change password. Status: ${response.status}`);
      }

      setOperationMessage({ type: 'success', text: "Password changed successfully!" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      setTimeout(() => setOperationMessage(null), 3000);
    } catch (err) {
      setPasswordChangeError(err.message);
      setOperationMessage({ type: 'error', text: "Failed to change password." });
      console.error("Password change error:", err);
      setTimeout(() => setOperationMessage(null), 3000);
    } finally {
      setPasswordChangeLoading(false);
    }
  };

  // --- Loading State (Skeleton) ---
  if (loading) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 p-6 md:p-8 bg-slate-900 text-gray-200">
          <div className="max-w-3xl mx-auto animate-pulse"> {/* Increased max-width for skeleton */}
            <h1 className="h-10 bg-gradient-to-r from-teal-400 via-blue-400 to-purple-400 rounded-md w-64 mb-8"></h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8"> {/* Grid for profile and password */}
              {/* Profile Details Skeleton */}
              <div className="bg-slate-800/60 p-8 rounded-xl shadow-2xl border border-slate-700 space-y-6">
                <div className="flex justify-between items-center mb-4">
                  <div className="h-6 bg-slate-700 rounded w-1/3"></div>
                  <div className="h-8 w-24 bg-blue-700/50 rounded"></div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="h-7 w-7 bg-amber-600/50 rounded-full flex-shrink-0"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-700 rounded-md w-2/5"></div>
                    <div className="h-6 bg-slate-600 rounded-md w-full"></div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="h-7 w-7 bg-emerald-600/50 rounded-full flex-shrink-0"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-700 rounded-md w-2/5"></div>
                    <div className="h-6 bg-slate-600 rounded-md w-full"></div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="h-7 w-7 bg-blue-600/50 rounded-full flex-shrink-0"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-700 rounded-md w-2/5"></div>
                    <div className="h-6 bg-slate-600 rounded-md w-full"></div>
                  </div>
                </div>
                <div className="space-y-3 pt-4 border-t border-slate-700/60">
                  <div className="flex items-center gap-3">
                    <div className="h-7 w-7 bg-purple-600/50 rounded-full flex-shrink-0"></div>
                    <div className="h-5 bg-slate-700 rounded-md w-3/4"></div>
                  </div>
                  <div className="h-12 bg-slate-700 rounded-lg w-full"></div>
                  <div className="h-4 bg-slate-700 rounded-md w-full"></div>
                </div>
              </div>
              {/* Password Change Skeleton */}
              <div className="bg-slate-800/60 p-8 rounded-xl shadow-2xl border border-slate-700 space-y-6">
                <h2 className="h-8 bg-slate-700 rounded-md w-3/4"></h2>
                <div className="space-y-4">
                  <div className="h-12 bg-slate-700 rounded-lg w-full"></div>
                  <div className="h-12 bg-slate-700 rounded-lg w-full"></div>
                  <div className="h-12 bg-slate-700 rounded-lg w-full"></div>
                </div>
                <div className="h-12 bg-purple-700/50 rounded-lg w-full"></div>
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

  // --- No Admin Data Found ---
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

  // --- Main Content (Admin Profile) ---
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className={`flex-1 p-6 md:p-8 transition-colors duration-300 ${darkMode ? "bg-slate-900 text-gray-200" : "bg-gray-100 text-gray-800"}`}>
        <div className="max-w-3xl mx-auto"> {/* Increased max-width for content */}
          <div className="flex flex-col sm:flex-row justify-between items-center mb-8 sm:mb-10">
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-teal-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-4 sm:mb-0 text-center sm:text-left">
              Admin Profile
            </h1>
            <button
              onClick={fetchAdminProfile}
              className="px-5 py-2.5 bg-blue-500/90 hover:bg-blue-500 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 ease-in-out flex items-center gap-2.5 text-sm font-medium transform hover:scale-105 group focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-60"
            >
              <FiRefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-300" /> Refresh Data
            </button>
          </div>

          {/* Operation Message Display (for copy secret key or password change success) */}
          {operationMessage && (
            <div className={`mb-6 p-3.5 rounded-lg flex items-center justify-between gap-3 text-sm shadow-md
              ${operationMessage.type === 'success' ? 'bg-green-900/50 border border-green-700 text-green-300' : 'bg-red-900/50 border border-red-700 text-red-300'}`}>
              <div className="flex items-center gap-2">
                {operationMessage.type === 'success' ? <FiCheckCircle className="w-5 h-5 flex-shrink-0" /> : <FiXCircle className="w-5 h-5 flex-shrink-0" />}
                <span>{operationMessage.text}</span>
              </div>
              <button onClick={() => setOperationMessage(null)} className={`text-lg p-1 rounded-full
                ${operationMessage.type === 'success' ? 'text-green-300 hover:text-green-200 hover:bg-green-700/50' : 'text-red-300 hover:text-red-200 hover:bg-red-700/50'}`}>
                &times;
              </button>
            </div>
          )}

          {/* Main content grid: Profile Details on left, Password Change on right */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* --- Profile Details Section --- */}
            <div className={`rounded-xl shadow-2xl overflow-hidden ${darkMode ? "bg-slate-800/70 border border-slate-700" : "bg-white border border-gray-200"}`}>
              <div className="p-6 sm:p-8 space-y-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-teal-400 to-blue-400 bg-clip-text text-transparent">
                    Your Details
                  </h2>
                  <Link href="/admin/profile/edit" passHref> {/* Link to future edit page */}
                    <button
                      className="px-4 py-2 bg-emerald-500/90 hover:bg-emerald-500 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 ease-in-out flex items-center gap-2 text-sm font-medium transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-opacity-60"
                    >
                      <FiEdit className="w-4 h-4" /> Edit Profile
                    </button>
                  </Link>
                </div>

                {/* Admin Name */}
                <div className="flex items-center gap-4">
                  <FiUser className={`w-7 h-7 ${darkMode ? 'text-amber-400' : 'text-amber-600'} flex-shrink-0`} />
                  <div>
                    <h3 className={`text-lg font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Name</h3>
                    <p className={`text-xl font-bold ${darkMode ? 'text-amber-300' : 'text-amber-700'}`}>{admin.name}</p>
                  </div>
                </div>

                {/* Admin Email */}
                <div className="flex items-center gap-4">
                  <FiMail className={`w-7 h-7 ${darkMode ? 'text-emerald-400' : 'text-emerald-600'} flex-shrink-0`} />
                  <div>
                    <h3 className={`text-lg font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Email</h3>
                    <p className={`text-xl font-bold ${darkMode ? 'text-emerald-300' : 'text-emerald-700'}`}>{admin.email}</p>
                  </div>
                </div>

                {/* Admin Phone Number */}
                <div className="flex items-center gap-4">
                  <FiPhone className={`w-7 h-7 ${darkMode ? 'text-blue-400' : 'text-blue-600'} flex-shrink-0`} />
                  <div>
                    <h3 className={`text-lg font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Phone Number</h3>
                    <p className={`text-xl font-bold ${darkMode ? 'text-blue-300' : 'text-blue-700'}`}>
                      {admin.phone ? admin.phone : <span className="text-gray-500 italic">Not set</span>}
                    </p>
                  </div>
                </div>

                {/* Secret Key with Toggle and Copy */}
                <div className="space-y-3 pt-4 border-t border-slate-700/60">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FiKey className={`w-7 h-7 ${darkMode ? 'text-purple-400' : 'text-purple-600'} flex-shrink-0`} />
                      <h3 className={`text-lg font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Secret Key</h3>
                    </div>
                    <button
                      onClick={() => setShowSecretKey(!showSecretKey)}
                      className={`p-2 rounded-full transition-colors duration-200 ${darkMode ? 'hover:bg-slate-700 text-gray-400' : 'hover:bg-gray-200 text-gray-600'}`}
                      title={showSecretKey ? "Hide Secret Key" : "Show Secret Key"}
                    >
                      {showSecretKey ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                    </button>
                  </div>
                  <div className={`relative ${darkMode ? 'bg-slate-700' : 'bg-gray-100'} p-3 rounded-lg flex items-center justify-between gap-3`}>
                    <code className={`break-all font-mono text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {showSecretKey ? admin.secretKey : "****************************************"}
                    </code>
                    {showSecretKey && (
                      <button
                        onClick={handleCopySecretKey}
                        className={`ml-2 p-2 rounded-md transition-colors duration-200 ${darkMode ? 'hover:bg-blue-500/25 text-blue-400' : 'hover:bg-blue-100 text-blue-600'}`}
                        title="Copy to clipboard"
                      >
                        <FiClipboard className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'} italic mt-2`}>
                    Keep this key secure. It can be used to recover your admin account if you forget your password.
                  </p>
                </div>
              </div>
            </div>

            {/* --- Password Change Section --- */}
            <div className={`rounded-xl shadow-2xl ${darkMode ? "bg-slate-800/70 border border-slate-700" : "bg-white border border-gray-200"}`}>
              <div className="p-6 sm:p-8 space-y-6">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent mb-6">
                  Change Password
                </h2>

                {passwordChangeError && (
                  <div className="mb-6 p-3.5 bg-red-900/50 border border-red-700 text-red-300 rounded-lg flex items-center gap-3 text-sm shadow-md">
                    <FiXCircle className="w-5 h-5 flex-shrink-0" />
                    <span>{passwordChangeError}</span>
                  </div>
                )}

                <form onSubmit={handleChangePassword} className="space-y-5">
                  {/* Current Password */}
                  <div>
                    <label htmlFor="currentPassword" className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Current Password
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        id="currentPassword"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className={`block w-full py-2.5 pl-10 pr-3 rounded-lg text-sm ${darkMode ? 'bg-slate-700 text-gray-200 border border-slate-600 focus:border-purple-500 focus:ring-purple-500' : 'bg-white text-gray-800 border border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}
                        placeholder="Enter current password"
                        required
                      />
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <FiLock className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                      </div>
                    </div>
                  </div>

                  {/* New Password */}
                  <div>
                    <label htmlFor="newPassword" className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        id="newPassword"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className={`block w-full py-2.5 pl-10 pr-3 rounded-lg text-sm ${darkMode ? 'bg-slate-700 text-gray-200 border border-slate-600 focus:border-purple-500 focus:ring-purple-500' : 'bg-white text-gray-800 border border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}
                        placeholder="Enter new password"
                        required
                      />
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <FiLock className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                      </div>
                    </div>
                    <p className={`text-xs mt-1.5 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                      Min 8 characters, with uppercase, lowercase, number, and symbol.
                    </p>
                  </div>

                  {/* Confirm New Password */}
                  <div>
                    <label htmlFor="confirmNewPassword" className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        id="confirmNewPassword"
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        className={`block w-full py-2.5 pl-10 pr-3 rounded-lg text-sm ${darkMode ? 'bg-slate-700 text-gray-200 border border-slate-600 focus:border-purple-500 focus:ring-purple-500' : 'bg-white text-gray-800 border border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}
                        placeholder="Confirm new password"
                        required
                      />
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <FiLock className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className={`w-full px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg shadow-md transition-all duration-300 ease-in-out text-sm font-semibold transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-70 flex items-center justify-center gap-2
                      ${passwordChangeLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                    disabled={passwordChangeLoading}
                  >
                    {passwordChangeLoading ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Changing...
                      </>
                    ) : (
                      <>
                        <FiLock className="w-5 h-5" /> Change Password
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}