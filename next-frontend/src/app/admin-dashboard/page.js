"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { FiHome, FiPlusCircle, FiLogOut, FiBox, FiUsers, FiDollarSign } from "react-icons/fi";

export default function AdminDashboard() {
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(true);
  const [adminEmail, setAdminEmail] = useState('');

  const handleLogout = () => {
    const confirmLogout = window.confirm("Are you sure you want to log out?");
    if (confirmLogout) {
      localStorage.removeItem("admin");
      router.push("/admin-login");
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar - Dark Theme */}
      <aside className="w-64 bg-green-900 p-6 flex flex-col shadow-lg">
        <div className="flex items-center justify-center mb-8">
          <Image
            src="/logo.jpg"
            alt="Aroglin Spice Farms"
            width={120}
            height={80}
            className="rounded-lg border-2 border-amber-500"
          />
        </div>

        <nav className="flex flex-col space-y-4 text-white">
          <button
            onClick={() => router.push("/admin-dashboard")}
            className="flex items-center gap-3 w-full text-left px-4 py-3 rounded-lg bg-green-800 hover:bg-amber-600 transition-all"
          >
            <FiHome size={20} />
            Dashboard Overview
          </button>

          <button
            onClick={() => router.push("/admin/add-product")}
            className="flex items-center gap-3 w-full text-left px-4 py-3 rounded-lg bg-green-800 hover:bg-amber-600 transition-all"
          >
            <FiPlusCircle size={20} />
            Add New Product
          </button>

          <button className="flex items-center gap-3 w-full text-left px-4 py-3 rounded-lg bg-green-800 hover:bg-amber-600 transition-all">
            <FiBox size={20} />
            Manage Inventory
          </button>

          <button className="flex items-center gap-3 w-full text-left px-4 py-3 rounded-lg bg-green-800 hover:bg-amber-600 transition-all">
            <FiUsers size={20} />
            Customer Management
          </button>

          <button className="flex items-center gap-3 w-full text-left px-4 py-3 rounded-lg bg-green-800 hover:bg-amber-600 transition-all">
            <FiDollarSign size={20} />
            Order Analytics
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 p-8 relative transition-colors duration-300 ${
        darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"
      }`}>
        {/* Top Controls */}
        <div className="absolute top-4 right-4 flex space-x-4">
          <button
            onClick={toggleDarkMode}
            className="px-4 py-2 rounded-lg bg-amber-600 text-white hover:bg-amber-700 transition-all"
          >
            {darkMode ? "☀️ Light Theme" : "🌙 Dark Theme"}
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-all"
          >
            <FiLogOut size={20} />
            Logout
          </button>
        </div>

        {/* Dashboard Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-amber-500 mb-2">
            Aroglin Spice Farms Admin Panel
          </h1>
          <p className={`text-lg ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
            Logged in as: <span className="text-green-400">admin@aroglinspices.com</span>
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className={`p-6 rounded-xl shadow-lg ${darkMode ? "bg-gray-800" : "bg-white"}`}>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-500 rounded-lg">
                <FiBox size={24} className="text-white" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Total Products</p>
                <p className="text-2xl font-bold text-amber-500">1,234</p>
              </div>
            </div>
          </div>

          <div className={`p-6 rounded-xl shadow-lg ${darkMode ? "bg-gray-800" : "bg-white"}`}>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500 rounded-lg">
                <FiDollarSign size={24} className="text-white" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Today's Orders</p>
                <p className="text-2xl font-bold text-amber-500">₹ 2,34,567</p>
              </div>
            </div>
          </div>

          <div className={`p-6 rounded-xl shadow-lg ${darkMode ? "bg-gray-800" : "bg-white"}`}>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-500 rounded-lg">
                <FiUsers size={24} className="text-white" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Active Customers</p>
                <p className="text-2xl font-bold text-amber-500">5,678</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className={`p-6 rounded-xl shadow-lg ${darkMode ? "bg-gray-800" : "bg-white"} mb-8`}>
          <h2 className="text-2xl font-semibold text-green-500 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="p-4 bg-green-700 hover:bg-green-600 rounded-lg text-white transition-all">
              Update Inventory
            </button>
            <button className="p-4 bg-amber-600 hover:bg-amber-500 rounded-lg text-white transition-all">
              View Orders
            </button>
            <button className="p-4 bg-blue-600 hover:bg-blue-500 rounded-lg text-white transition-all">
              Manage Users
            </button>
            <button className="p-4 bg-purple-600 hover:bg-purple-500 rounded-lg text-white transition-all">
              Sales Reports
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className={`p-6 rounded-xl shadow-lg ${darkMode ? "bg-gray-800" : "bg-white"}`}>
          <h2 className="text-2xl font-semibold text-green-500 mb-4">Recent Activity</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-900/30 rounded-lg">
              <span>New order received (#12345)</span>
              <span className="text-amber-400">2 min ago</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-900/30 rounded-lg">
              <span>Cardamom stock updated</span>
              <span className="text-amber-400">1 hour ago</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-900/30 rounded-lg">
              <span>New customer registration</span>
              <span className="text-amber-400">3 hours ago</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}