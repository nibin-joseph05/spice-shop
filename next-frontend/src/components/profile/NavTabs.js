'use client';

import { FiLock, FiUser, FiBox, FiLogOut } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function NavTabs({ activeTab, setActiveTab }) {
  const [userLoggedIn, setUserLoggedIn] = useState(false);
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch(`${backendUrl}/api/auth/check-session`, {
          credentials: 'include',
        });
        setUserLoggedIn(response.ok);
      } catch (error) {
        console.error('Session check failed:', error);
        setUserLoggedIn(false);
      }
    };
    checkSession();
  }, []);

  const handleLogout = async () => {
      try {
        await fetch(`${backendUrl}/api/auth/logout`, {
          method: 'POST',
          credentials: 'include',
        });
        setUserLoggedIn(false);
        window.location.href = '/';
      } catch (error) {
        console.error('Logout failed:', error);
      }
    };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: <FiUser className="text-lg" /> },
    { id: 'password', label: 'Password', icon: <FiLock className="text-lg" /> },
    { id: 'orders', label: 'Orders', icon: <FiBox className="text-lg" /> },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8"
    >
      <div className="flex flex-col md:flex-row gap-2 items-start md:items-center">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`relative flex items-center gap-3 px-5 py-3 rounded-xl transition-colors
              ${activeTab === tab.id
                ? 'text-amber-700 font-semibold bg-amber-50'
                : 'text-gray-600 hover:bg-gray-50'}`}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {activeTab === tab.id && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-x-0 -bottom-2 h-0.5 bg-amber-700"
                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
              />
            )}
          </button>
        ))}

        {userLoggedIn ? (
          <button
            onClick={handleLogout}
            className="ml-auto flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <FiLogOut className="text-lg" />
            <span className="hidden md:inline font-medium">Logout</span>
          </button>
        ) : (
          <Link
            href="/my-account"
            className="ml-auto flex items-center gap-2 px-4 py-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
          >
            <FiUser className="text-lg" />
            <span className="hidden md:inline font-medium">Login</span>
          </Link>
        )}
      </div>
    </motion.div>
  );
}
