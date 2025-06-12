'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Header from '@/components/home/Header';
import Footer from '@/components/home/Footer';
import NavTabs from '@/components/profile/NavTabs';
import ProfileForm from '@/components/profile/ProfileForm';
import PasswordForm from '@/components/profile/PasswordForm';
import OrdersList from '@/components/profile/OrdersList';
import { FiLock, FiLogIn, FiUserPlus } from 'react-icons/fi';

export default function MyProfile() {
  const [userLoggedIn, setUserLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState(null);

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;


  const validatePassword = (password) => ({
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
  });


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

        setUserLoggedIn(true);
        const userResponse = await fetch(`${backendUrl}/api/users/me`, {
          credentials: 'include'
        });

        if (!userResponse.ok) throw new Error('Failed to fetch user');
        const apiResponse = await userResponse.json();
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
  }, [backendUrl]);


  useEffect(() => {
    if (activeTab === 'orders' && userLoggedIn) {
      const fetchOrders = async () => {
        setOrdersLoading(true);
        setOrdersError(null);
        try {
          const response = await fetch(`${backendUrl}/api/orders/history`, {
            credentials: 'include',
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
          }

          const apiResponse = await response.json();
          if (apiResponse.success) {
            setOrders(apiResponse.data);
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
      setOrders([]);
      setOrdersError("Please log in to view your order history.");
    }
  }, [activeTab, userLoggedIn, backendUrl]);

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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePasswordForm = () => {
    const newErrors = {};


    if (!passwordData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }


    const passwordValidations = validatePassword(passwordData.newPassword);
    if (!Object.values(passwordValidations).every(Boolean)) {
      newErrors.newPassword = 'Password must meet all requirements';
    }


    if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }


    if (passwordData.currentPassword && passwordData.newPassword &&
        passwordData.currentPassword === passwordData.newPassword) {
      newErrors.newPassword = 'New password must be different from current password';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (validateProfileForm()) {
      try {
        const updateData = {
          firstName: formData.firstName,
          lastName: formData.lastName
        };

        const response = await fetch(`${backendUrl}/api/users/update`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updateData),
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


    setErrors({});

    if (validatePasswordForm()) {
      try {
        const response = await fetch(`${backendUrl}/api/auth/change-password`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            currentPassword: passwordData.currentPassword,
            newPassword: passwordData.newPassword
          }),
          credentials: 'include'
        });

        const data = await response.json();
        if (data.success) {
          alert("Password changed successfully!");
          setPasswordData({
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
          });
          setErrors({});
        } else {
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
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="text-center space-y-4 p-8 bg-white rounded-2xl shadow-xl border border-gray-100"
          >
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-500 mx-auto"></div>
            <h2 className="text-2xl font-bold text-gray-800">Loading Your Profile...</h2>
            <p className="text-gray-600">Please wait while we fetch your personal data and order history.</p>
          </motion.div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!userLoggedIn) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-green-50/50 to-white">
        <Header />
        <main className="flex-grow flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center border border-gray-100"
          >
            <div className="mb-6">
              <FiLock className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Access Restricted</h2>
              <p className="text-gray-600 leading-relaxed">
                To view your profile and manage your orders, settings, and other personal details,
                please log in or create an account.
              </p>
            </div>

            <div className="flex flex-col space-y-4">
              <motion.button
                whileHover={{ scale: 1.02, backgroundColor: '#059669' }} // Darker green on hover
                whileTap={{ scale: 0.98 }}
                onClick={() => window.location.href = '/my-account'}
                className="w-full inline-flex items-center justify-center px-6 py-3 bg-green-600 text-white
                           font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
              >
                <FiLogIn className="w-5 h-5 mr-2" />
                Login to Your Account
              </motion.button>

              <p className="text-gray-500 text-sm">Don't have an account?</p>

              <motion.button
                whileHover={{ scale: 1.02, backgroundColor: '#f0fdf4', borderColor: '#34d399' }} // Lighter green on hover
                whileTap={{ scale: 0.98 }}
                onClick={() => window.location.href = '/my-account?tab=signup'} // Assuming a tab or route for sign up
                className="w-full inline-flex items-center justify-center px-6 py-3 bg-green-50 text-green-700
                           font-semibold rounded-lg border border-green-200 shadow-sm hover:shadow-md transition-all duration-200"
              >
                <FiUserPlus className="w-5 h-5 mr-2" />
                Create a New Account
              </motion.button>
            </div>
          </motion.div>
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
                  passwordData={passwordData}
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