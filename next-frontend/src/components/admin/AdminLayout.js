// components/admin/AdminLayout.jsx
"use client";
import { useState } from "react";
import { Sidebar } from "@/components/admin/Sidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";

export const AdminLayout = ({ children }) => {
  const [darkMode, setDarkMode] = useState(true);
  const toggleDarkMode = () => setDarkMode(!darkMode);

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className={`flex-1 relative transition-colors duration-300 ${
        darkMode ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900" : "bg-gray-50"
      }`}>
        {children({ darkMode, toggleDarkMode })}
      </main>
    </div>
  );
};