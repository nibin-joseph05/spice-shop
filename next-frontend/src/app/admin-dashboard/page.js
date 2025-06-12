// pages/admin/dashboard.js
"use client";
import { useRouter } from "next/navigation";
import { FiBox, FiUsers, FiDollarSign, FiCalendar } from "react-icons/fi"; // Added FiCalendar for the graph section
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { useState, useEffect } from "react";

// Import Chart.js components
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function AdminDashboard() {
  const router = useRouter();
  const [dashboardStats, setDashboardStats] = useState({
    totalProducts: "Loading...",
    todaysOrdersCount: "Loading...",
    activeCustomers: "Loading...",
    todaysRevenue: "Loading...",
  });
  const [orderData, setOrderData] = useState([]); // State to hold order data for the graph
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingOrderData, setLoadingOrderData] = useState(true);
  const [errorStats, setErrorStats] = useState(null);
  const [errorOrderData, setErrorOrderData] = useState(null);

  const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";

  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const fetchDashboardStats = async () => {
      try {
        const productsResponse = await fetch(`${API_BASE_URL}/api/spices`);
        if (!productsResponse.ok) throw new Error(`HTTP error! status: ${productsResponse.status} for products`);
        const productsData = await productsResponse.json();
        const totalProducts = productsData.length;

        const usersResponse = await fetch(`${API_BASE_URL}/api/users/count`);
        if (!usersResponse.ok) throw new Error(`HTTP error! status: ${usersResponse.status} for users`);
        const usersData = await usersResponse.json();
        const activeCustomers = usersData.count;

        const ordersResponse = await fetch(`${API_BASE_URL}/api/orders/all`);
        if (!ordersResponse.ok) throw new Error(`HTTP error! status: ${ordersResponse.status} for orders`);
        const ordersApiResponse = await ordersResponse.json();
        const allOrders = ordersApiResponse.data || [];

        let todaysOrdersCount = 0;
        let todaysRevenue = 0;

        allOrders.forEach(order => {
          const orderDate = new Date(order.orderDate);
          orderDate.setHours(0, 0, 0, 0);

          if (orderDate.getTime() === today.getTime()) {
            todaysOrdersCount++;
            todaysRevenue += order.totalAmount;
          }
        });

        setDashboardStats({
          totalProducts: totalProducts.toLocaleString(),
          todaysOrdersCount: todaysOrdersCount.toLocaleString(),
          activeCustomers: activeCustomers.toLocaleString(),
          todaysRevenue: `₹ ${todaysRevenue.toLocaleString("en-IN")}`,
        });
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
        setErrorStats(`Failed to load dashboard statistics: ${error.message}`);
      } finally {
        setLoadingStats(false);
      }
    };

    // Fetch Order Data for Graph
    const fetchOrderData = async () => {
      try {
        const ordersResponse = await fetch(`${API_BASE_URL}/api/orders/all`);
        if (!ordersResponse.ok) throw new Error(`HTTP error! status: ${ordersResponse.status} for orders`);
        const ordersApiResponse = await ordersResponse.json();
        const allOrders = ordersApiResponse.data || [];

        // Group orders by month for the graph (similar to the reference)
        const groupedOrders = {};
        allOrders.forEach(order => {
            const orderDate = new Date(order.orderDate);
            // Format to 'YYYY-MM' for consistent grouping, then 'Month YYYY' for display
            const monthKey = `${orderDate.getFullYear()}-${(orderDate.getMonth() + 1).toString().padStart(2, '0')}`;
            const displayMonth = orderDate.toLocaleString('default', { month: 'short', year: 'numeric' });

            if (!groupedOrders[monthKey]) {
                groupedOrders[monthKey] = { month: displayMonth, orderCount: 0, totalRevenue: 0 };
            }
            groupedOrders[monthKey].orderCount++;
            groupedOrders[monthKey].totalRevenue += order.totalAmount;
        });

        // Sort the grouped orders by month key (e.g., '2023-01', '2023-02')
        const sortedOrderData = Object.keys(groupedOrders)
            .sort()
            .map(key => groupedOrders[key]);

        setOrderData(sortedOrderData);

      } catch (error) {
        console.error("Failed to fetch order data for graph:", error);
        setErrorOrderData(`Failed to load order data: ${error.message}`);
      } finally {
        setLoadingOrderData(false);
      }
    };

    fetchDashboardStats();
    fetchOrderData();
  }, []);

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
            <DashboardStats
              darkMode={darkMode}
              stats={dashboardStats}
              loading={loadingStats}
              error={errorStats}
            />
            {/* Graph Section */}
            <OrderGraphSection
              darkMode={darkMode}
              orderData={orderData} // Pass the processed order data
              loading={loadingOrderData}
              error={errorOrderData}
            />
          </div>
        </>
      )}
    </AdminLayout>
  );
}

const DashboardStats = ({ darkMode, stats, loading, error }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
    {loading && <p className={`text-center ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Loading dashboard statistics...</p>}
    {error && <p className="text-red-500 text-center">{error}</p>}
    {!loading && !error && (
      <>
        {[
          { icon: FiBox, title: "Total Products", value: stats.totalProducts, color: "bg-green-500" },
          { icon: FiDollarSign, title: "Today's Revenue", value: stats.todaysRevenue, color: "bg-blue-500" },
          { icon: FiUsers, title: "Active Customers", value: stats.activeCustomers, color: "bg-purple-500" },
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
      </>
    )}
  </div>
);

const OrderGraphSection = ({ darkMode, orderData, loading, error }) => {
    // Function to format currency
    const formatCurrency = (amount) =>
        amount.toLocaleString('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0, // No decimal places for currency on graph
        });

    // Define colors for consistency and better visual appeal
    const orderCountColor = '#f97316'; // Tailwind orange-500 for order count
    const revenueColor = '#10b981'; // Tailwind emerald-500 for revenue (a fresh green)
    const chartBgColor = darkMode ? 'rgba(31, 41, 55, 0.7)' : 'rgba(255, 255, 255, 0.9)'; // Slightly transparent for glassmorphism
    const gridLineColor = darkMode ? 'rgba(55, 65, 81, 0.5)' : 'rgba(229, 231, 235, 0.7)';
    const textColor = darkMode ? '#E5E7EB' : '#374151'; // Lighter text for dark mode, darker for light mode

    // Chart data structure for Chart.js
    const chartData = {
        labels: orderData.map(dataPoint => dataPoint.month), // X-axis labels (e.g., 'Jan 2023')
        datasets: [
            {
                label: 'Order Count',
                data: orderData.map(dataPoint => dataPoint.orderCount),
                borderColor: orderCountColor,
                backgroundColor: 'rgba(249, 115, 22, 0.15)', // Lighter orange for fill
                fill: true,
                tension: 0.4, // Slightly more curve
                pointBorderColor: darkMode ? '#1F2937' : '#F9FAFB',
                pointBackgroundColor: orderCountColor,
                pointHoverRadius: 7, // Larger hover point
                pointRadius: 5,   // Slightly larger points
                pointBorderWidth: 2,
                yAxisID: 'y-order-count',
            },
            {
                label: 'Total Revenue (₹)',
                data: orderData.map(dataPoint => dataPoint.totalRevenue),
                borderColor: revenueColor,
                backgroundColor: 'rgba(16, 185, 129, 0.15)', // Lighter emerald for fill
                fill: true,
                tension: 0.4, // Slightly more curve
                pointBorderColor: darkMode ? '#1F2937' : '#F9FAFB',
                pointBackgroundColor: revenueColor,
                pointHoverRadius: 7, // Larger hover point
                pointRadius: 5,   // Slightly larger points
                pointBorderWidth: 2,
                yAxisID: 'y-revenue',
            }
        ]
    };

    // Chart options for Chart.js
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    color: textColor, // Use dynamic text color
                    font: { size: 14, family: 'Inter, sans-serif' } // Specify font family
                }
            },
            tooltip: {
                // Background and text colors based on dark mode
                backgroundColor: darkMode ? 'rgba(31, 41, 55, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                titleColor: darkMode ? '#F9FAFB' : '#111827',
                bodyColor: darkMode ? '#D1D5DB' : '#374151',
                borderColor: darkMode ? '#4B5563' : '#D1D5DB', // Slightly darker border
                borderWidth: 1,
                padding: 14, // Increased padding
                cornerRadius: 8, // Rounded corners for tooltips
                boxPadding: 6, // Space between color box and text
                usePointStyle: true,
                callbacks: {
                    label: function(context) {
                        let label = context.dataset.label || '';
                        if (label) {
                            label += ': ';
                        }
                        if (context.dataset.label === 'Total Revenue (₹)') {
                            label += formatCurrency(context.raw);
                        } else {
                            label += context.raw.toLocaleString();
                        }
                        return label;
                    }
                }
            }
        },
        scales: {
            x: {
                grid: {
                    color: gridLineColor,
                    drawBorder: false, // Don't draw the axis line itself
                },
                ticks: {
                    color: textColor,
                    font: { size: 12, family: 'Inter, sans-serif' }
                },
                title: {
                    display: true,
                    text: 'Month',
                    color: textColor,
                    font: { size: 14, weight: 'bold', family: 'Inter, sans-serif' }
                }
            },
            y: { // Order Count (Left Axis)
                type: 'linear',
                display: true,
                position: 'left',
                id: 'y-order-count',
                grid: {
                    color: gridLineColor,
                    drawBorder: false,
                },
                ticks: {
                    color: textColor,
                    font: { size: 12, family: 'Inter, sans-serif' },
                    beginAtZero: true,
                    max: 3000,
                    callback: value => value.toLocaleString()
                },
                title: {
                    display: true,
                    text: 'Number of Orders',
                    color: textColor,
                    font: { size: 14, weight: 'bold', family: 'Inter, sans-serif' }
                }
            },
            y1: { // Total Revenue (Right Axis)
                type: 'linear',
                display: true,
                position: 'right',
                id: 'y-revenue',
                // This specific grid option prevents duplicate horizontal lines from y-order-count
                grid: {
                    drawOnChartArea: false,
                    color: gridLineColor,
                    drawBorder: false,
                },
                ticks: {
                    color: textColor,
                    font: { size: 12, family: 'Inter, sans-serif' },
                    beginAtZero: true,
                    callback: value => formatCurrency(value)
                },
                title: {
                    display: true,
                    text: 'Total Revenue (INR)',
                    color: textColor,
                    font: { size: 14, weight: 'bold', family: 'Inter, sans-serif' }
                }
            }
        }
    };

    return (
        <div className={`p-6 rounded-2xl transition-all ${
            darkMode ? "bg-gray-800/50 border border-gray-700/50" : "bg-white/90 border border-gray-200"
        } shadow-xl hover:shadow-2xl`}>
            <h2 className="text-xl font-semibold bg-gradient-to-r from-green-400 to-amber-400 bg-clip-text text-transparent mb-2 flex items-center gap-2">
                <FiCalendar size={24} className={darkMode ? "text-amber-400" : "text-green-600"} />
                Monthly Order Trends: Count vs. Revenue
            </h2>
            <p className={`text-sm mb-4 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                This chart displays the **number of orders** (left axis, <span className="text-orange-500 font-semibold">orange line</span>) and the **total revenue** (right axis, <span className="text-emerald-500 font-semibold">green line</span>) generated each month. Use this to identify sales patterns and performance over time.
            </p>

            {loading && <p className={`text-center ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Loading order data...</p>}
            {error && <p className="text-red-500 text-center">{error}</p>}
            {!loading && !error && orderData.length === 0 && (
                <div className={`text-center py-10 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                    <p className="text-lg mb-2">No order data available for the historical trend.</p>
                    <p className="text-sm">Please ensure there are orders in the system to view this chart.</p>
                </div>
            )}
            {!loading && !error && orderData.length > 0 && (
                <div style={{ height: '350px', width: '100%' }}>
                    <Line
                        data={chartData}
                        options={chartOptions}
                    />
                </div>
            )}
        </div>
    );
};