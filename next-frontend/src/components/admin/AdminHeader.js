// components/admin/AdminHeader.jsx
"use client";
import Image from "next/image";
import { FiLogOut } from "react-icons/fi";

export const AdminHeader = ({ darkMode, toggleDarkMode, handleLogout }) => {
  return (
    <header className={`flex items-center justify-between p-6 border-b ${
      darkMode ? "border-gray-700/50" : "border-gray-200"
    }`}>
      <div className="flex items-center gap-4">
        <Image
          src="/logo.jpg"
          alt="Aroglin Spice Farms"
          width={60}
          height={40}
          className="rounded-lg border-2 border-amber-500"
        />
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-400 to-green-400 bg-clip-text text-transparent">
            Aroglin Spice Farms Admin Panel
          </h1>
          <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
            Logged in as: <span className="font-mono text-green-300">admin@aroglinspices.com</span>
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={toggleDarkMode}
          className="px-4 py-2 rounded-xl bg-amber-600/90 text-white hover:bg-amber-700 transition-all shadow-lg hover:shadow-amber-600/20"
        >
          {darkMode ? "☀️ Light Theme" : "🌙 Dark Theme"}
        </button>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600/90 hover:bg-red-700 text-white transition-all shadow-lg hover:shadow-red-600/20"
        >
          <FiLogOut size={20} />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </header>
  );
};