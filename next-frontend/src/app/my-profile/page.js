'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Header from '@/components/home/Header';
import Footer from '@/components/home/Footer';
import NavTabs from '@/components/profile/NavTabs';
import ProfileForm from '@/components/profile/ProfileForm';
import PasswordForm from '@/components/profile/PasswordForm';
import OrdersList from '@/components/profile/OrdersList'; // Ensure this path is correct

export default function MyProfile() {
  const [userLoggedIn, setUserLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [orders, setOrders] = useState([]); // State to hold fetched orders
  const [ordersLoading, setOrdersLoading] = useState(false); // Loading state for orders
  const [ordersError, setOrdersError] = useState(null); // Error state for orders

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  // Effect to check session and fetch user profile data
  useEffect(() => {
    const checkSessionAndFetchData = async () => {
      setIsLoading(true);
      try {
        const sessionResponse = await fetch(`${backendUrl}/api/auth/check-session`, {
          credentials: 'include'
        });

        if (!sessionResponse.ok) {
          setUserLoggedIn(false);
          setIsLoading(false);
          return;
        }

        setUserLoggedIn(true); // User is logged in
        const userResponse = await fetch(`${backendUrl}/api/users/me`, {
          credentials: 'include'
        });

        if (!userResponse.ok) throw new Error('Failed to fetch user');
        const apiResponse = await userResponse.json(); // Assuming API response has { success, user }
        if (apiResponse.success && apiResponse.user) {
          setFormData({
            firstName: apiResponse.user.firstName,
            lastName: apiResponse.user.lastName,
            email: apiResponse.user.email
          });
        }
      } catch (error) {
        console.error('Error fetching profile data:', error);
        setUserLoggedIn(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkSessionAndFetchData();
  }, [backendUrl]); // Dependency array includes backendUrl

  // Effect to fetch orders when 'orders' tab is active or user logs in
  useEffect(() => {
    if (activeTab === 'orders' && userLoggedIn) {
      const fetchOrders = async () => {
        setOrdersLoading(true);
        setOrdersError(null); // Clear previous errors
        try {
          const response = await fetch(`${backendUrl}/api/orders/history`, {
            credentials: 'include',
          });

          if (!response.ok) {
            // Handle specific status codes if needed (e.g., 401 for unauthorized)
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
          }

          const apiResponse = await response.json(); // Assuming ApiResponse structure: { success, message, data }
          if (apiResponse.success) {
            setOrders(apiResponse.data); // Set the fetched orders (which should be an array of OrderHistoryDto)
          } else {
            setOrdersError(apiResponse.message || "Failed to fetch orders.");
          }
        } catch (e) {
          console.error('Error fetching orders:', e);
          setOrdersError(e.message || "An unexpected error occurred while fetching orders.");
        } finally {
          setOrdersLoading(false);
        }
      };

      fetchOrders();
    } else if (activeTab === 'orders' && !userLoggedIn) {
        // If orders tab is active but user is not logged in, clear orders and show an error
        setOrders([]);
        setOrdersError("Please log in to view your order history.");
    }
  }, [activeTab, userLoggedIn, backendUrl]); // Re-run when activeTab or userLoggedIn changes

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({});

  const validateProfileForm = () => {
    const newErrors = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = 'Invalid email address';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePasswordForm = () => {
    const newErrors = {};
    if (!passwordData.currentPassword) newErrors.currentPassword = 'Current password is required';
    if (passwordData.newPassword.length < 8) newErrors.newPassword = 'Password must be at least 8 characters';
    if (passwordData.newPassword !== passwordData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (validateProfileForm()) {
      try {
        const response = await fetch(`${backendUrl}/api/users/update`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
          credentials: 'include'
        });

        const data = await response.json();
        if (data.success) {
          alert("Profile updated successfully!");
        } else {
          alert("Error updating profile: " + data.message);
        }
      } catch (error) {
        console.error("Error updating profile:", error);
        alert("An error occurred while updating profile.");
      }
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (validatePasswordForm()) {
      try {
        const response = await fetch(`${backendUrl}/api/auth/change-password`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(passwordData),
          credentials: 'include'
        });

        const data = await response.json();
        if (data.success) {
          alert("Password changed successfully!");
          setPasswordData({ // Clear form on success
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
          });
          setErrors({}); // Clear any password errors
        } else {
          // Set errors specifically for password fields
          setErrors({ api: data.message || "Failed to change password." });
        }
      } catch (error) {
        console.error("Error changing password:", error);
        setErrors({ api: "An error occurred while changing password." });
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-green-50/50 to-white">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <p>Loading profile data...</p>
        </main>
        <Footer />
      </div>
    );
  }

  // If not logged in after initial check, redirect or show message
  if (!userLoggedIn) {
      return (
        <div className="min-h-screen flex flex-col bg-gradient-to-b from-green-50/50 to-white">
          <Header />
          <main className="flex-grow flex items-center justify-center">
            <p className="text-red-600 font-semibold text-lg">You must be logged in to view your profile.</p>
            {/* Optionally add a login button here */}
            <button
              onClick={() => window.location.href = '/my-account'} // Assuming /my-account is your login/signup page
              className="ml-4 px-6 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition"
            >
              Login / Sign Up
            </button>
          </main>
          <Footer />
        </div>
      );
    }


  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-green-50/50 to-white">
      <Header />

      <main className="flex-grow">
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4 md:px-6 max-w-5xl">
            <NavTabs activeTab={activeTab} setActiveTab={setActiveTab} />

            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="mt-8"
            >
              {activeTab === 'profile' && (
                <ProfileForm
                  user={userLoggedIn}
                  formData={formData}
                  setFormData={setFormData}
                  errors={errors}
                  onSubmit={handleProfileSubmit}
                />
              )}

              {activeTab === 'password' && (
                <PasswordForm
                  user={userLoggedIn}
                  setPasswordData={setPasswordData}
                  errors={errors}
                  onSubmit={handlePasswordSubmit}
                />
              )}

              {activeTab === 'orders' && (
                <>
                  {ordersLoading ? (
                    <div className="text-center text-gray-600">Loading orders...</div>
                  ) : ordersError ? (
                    <div className="text-center text-red-600">{ordersError}</div>
                  ) : (
                    <OrdersList orders={orders} />
                  )}
                </>
              )}
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}