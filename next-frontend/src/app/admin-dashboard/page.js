// app/admin-dashboard/page.js
"use client";
import { useRouter } from "next/navigation";
import { FiBox, FiUsers, FiDollarSign } from "react-icons/fi";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminHeader } from "@/components/admin/AdminHeader";

export default function AdminDashboard() {
  const router = useRouter();

  const handleLogout = () => {
    const confirmLogout = window.confirm("Are you sure you want to log out?");
    if (confirmLogout) {
      localStorage.removeItem("admin");
      router.push("/admin-login");
    }
  };

  return (
    <AdminLayout>
      {({ darkMode, toggleDarkMode }) => (
        <>
          <AdminHeader
            darkMode={darkMode}
            toggleDarkMode={toggleDarkMode}
            handleLogout={handleLogout}
          />

          <div className="p-8">
            <DashboardStats darkMode={darkMode} />
            <QuickActionsSection darkMode={darkMode} />
            <RecentActivitySection darkMode={darkMode} />
          </div>
        </>
      )}
    </AdminLayout>
  );
}

const DashboardStats = ({ darkMode }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
    {[
      { icon: FiBox, title: "Total Products", value: "1,234", color: "bg-green-500" },
      { icon: FiDollarSign, title: "Today's Orders", value: "₹ 2,34,567", color: "bg-blue-500" },
      { icon: FiUsers, title: "Active Customers", value: "5,678", color: "bg-purple-500" },
    ].map((stat, index) => (
      <div key={index} className={`p-6 rounded-2xl backdrop-blur-lg transition-all ${
        darkMode ? "bg-gray-800/50 border border-gray-700/50" : "bg-white/90 border border-gray-200"
      } shadow-xl hover:shadow-2xl`}>
        <div className="flex items-center gap-4">
          <div className={`p-3 ${stat.color} rounded-xl shadow-md`}>
            <stat.icon size={24} className="text-white" />
          </div>
          <div>
            <p className={`text-xs font-medium ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
              {stat.title}
            </p>
            <p className="text-2xl font-bold text-amber-500">{stat.value}</p>
          </div>
        </div>
      </div>
    ))}
  </div>
);

const QuickActionsSection = ({ darkMode }) => (
  <div className={`p-6 rounded-2xl mb-8 transition-all ${
    darkMode ? "bg-gray-800/50 border border-gray-700/50" : "bg-white/90 border border-gray-200"
  } shadow-xl hover:shadow-2xl`}>
    <h2 className="text-xl font-semibold bg-gradient-to-r from-green-400 to-amber-400 bg-clip-text text-transparent mb-4">
      Quick Actions
    </h2>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {[
        { label: "Update Inventory", color: "from-green-600 to-green-700" },
        { label: "View Orders", color: "from-amber-600 to-amber-700" },
        { label: "Manage Users", color: "from-blue-600 to-blue-700" },
        { label: "Sales Reports", color: "from-purple-600 to-purple-700" },
      ].map((action, index) => (
        <button
          key={index}
          className={`p-4 rounded-xl text-white bg-gradient-to-br ${action.color} shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02] active:scale-95`}
        >
          <span className="text-sm font-medium">{action.label}</span>
        </button>
      ))}
    </div>
  </div>
);

const RecentActivitySection = ({ darkMode }) => (
  <div className={`p-6 rounded-2xl transition-all ${
    darkMode ? "bg-gray-800/50 border border-gray-700/50" : "bg-white/90 border border-gray-200"
  } shadow-xl hover:shadow-2xl`}>
    <h2 className="text-xl font-semibold bg-gradient-to-r from-amber-400 to-green-400 bg-clip-text text-transparent mb-4">
      Recent Activity
    </h2>
    <div className="space-y-3">
      {[
        { text: "New order received (#12345)", time: "2 min ago" },
        { text: "Cardamom stock updated", time: "1 hour ago" },
        { text: "New customer registration", time: "3 hours ago" },
      ].map((activity, index) => (
        <div
          key={index}
          className={`p-3 rounded-lg flex items-center justify-between transition-all ${
            darkMode ? "bg-gray-700/30 hover:bg-gray-700/50" : "bg-gray-100/50 hover:bg-gray-200/50"
          } group`}
        >
          <span className="text-sm group-hover:text-amber-400 transition-colors">
            {activity.text}
          </span>
          <span className={`text-xs ${darkMode ? "text-amber-300/80" : "text-amber-600"}`}>
            {activity.time}
          </span>
        </div>
      ))}
    </div>
  </div>
);