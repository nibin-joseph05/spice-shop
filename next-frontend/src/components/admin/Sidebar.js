// components/Sidebar.js
"use client";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import { FiHome, FiPlusCircle, FiBox, FiUsers, FiDollarSign, FiList } from "react-icons/fi";

export const Sidebar = () => {
  const router = useRouter();
  const pathname = usePathname();

  const navItems = [
    { path: "/admin-dashboard", icon: FiHome, label: "Dashboard Overview" },
    { path: "/admin/add-spice", icon: FiPlusCircle, label: "Add New Product" },
    { path: "/admin/spice-list", icon: FiList, label: "Spice List" },
    { path: "/admin/orders", icon: FiBox, label: "View User Orders" },
    { path: "/admin/customers", icon: FiUsers, label: "Customer Management" },
    { path: "/admin/analytics", icon: FiDollarSign, label: "Order Analytics" },
  ];

  return (
    <aside className="w-64 bg-gradient-to-b from-green-800 to-green-900 p-6 flex flex-col shadow-xl border-r border-amber-500/20">
      <div className="flex items-center justify-center mb-8 group">
        <Image
          src="/logo.jpg"
          alt="Aroglin Spice Farms"
          width={120}
          height={80}
          className="rounded-lg border-2 border-amber-500 transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      <nav className="flex flex-col space-y-2">
        {navItems.map((item) => (
          <button
            key={item.path}
            onClick={() => router.push(item.path)}
            className={`flex items-center gap-3 w-full text-left px-4 py-3 rounded-xl transition-all duration-200 ${
              pathname === item.path
                ? "bg-amber-600/90 text-white shadow-lg"
                : "bg-green-700/30 text-gray-200 hover:bg-amber-600/40 hover:translate-x-2"
            }`}
          >
            <item.icon size={20} className="flex-shrink-0" />
            <span className="text-sm font-medium">{item.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
};
