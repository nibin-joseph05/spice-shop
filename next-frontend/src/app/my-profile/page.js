'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Header from '@/components/home/Header';
import Footer from '@/components/home/Footer';
import NavTabs from '@/components/profile/NavTabs';
import ProfileForm from '@/components/profile/ProfileForm';
import PasswordForm from '@/components/profile/PasswordForm';
import OrdersList from '@/components/profile/OrdersList';

export default function MyProfile() {
  const [userLoggedIn, setUserLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [formData, setFormData] = useState({
      firstName: '',
      lastName: '',
      email: ''
    });
  const [isLoading, setIsLoading] = useState(true);

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  useEffect(() => {
      const checkSessionAndFetchData = async () => {
        setIsLoading(true);
        try {
          // First check session validity
          const sessionResponse = await fetch(`${backendUrl}/api/auth/check-session`, {
            credentials: 'include'
          });

          if (!sessionResponse.ok) {
            setUserLoggedIn(false);
            setIsLoading(false);
            return;
          }

          // If session valid, fetch user data
          setUserLoggedIn(true);
          const userResponse = await fetch(`${backendUrl}/api/users/me`, {
            credentials: 'include'
          });

          if (!userResponse.ok) throw new Error('Failed to fetch user');
          const { success, user } = await userResponse.json();

          if (success) {
            setFormData({
              firstName: user.firstName,
              lastName: user.lastName,
              email: user.email
            });
          }
        } catch (error) {
          console.error('Error:', error);
          setUserLoggedIn(false);
        } finally {
          setIsLoading(false);
        }
      };

      checkSessionAndFetchData();
    }, []);



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

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    if (validateProfileForm()) {
      console.log('Profile data:', formData);
      // API call
    }
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (validatePasswordForm()) {
      console.log('Password data:', passwordData);
      // API call
    }
  };

  const orders = [
    { id: 1, items: 'Cardamom (Class 1), Black Pepper', date: '2024-03-15', amount: '₹640', status: 'Delivered' },
    { id: 2, items: 'Turmeric Powder, Red Chilli', date: '2024-02-28', amount: '₹320', status: 'Processing' }
  ];


  if (isLoading) {
      return (
        <div className="min-h-screen flex flex-col bg-gradient-to-b from-green-50/50 to-white">
          <Header />
          <main className="flex-grow flex items-center justify-center">
            <p>Loading profile...</p>
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

              {activeTab === 'orders' && <OrdersList orders={orders} />}
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}