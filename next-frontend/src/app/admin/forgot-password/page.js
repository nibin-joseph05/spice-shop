// app/admin/forgot-password/page.js
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';

import Header from '@/components/home/Header';
import Footer from '@/components/home/Footer';

import {
  FiMail,
  FiKey,
  FiLock,
  FiArrowLeft,
  FiLoader,
  FiCheckCircle,
  FiXCircle,
}
 from 'react-icons/fi';

// Password strength validation regex (Keep this as it's not using PasswordResetForm)
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()]).{8,}$/;

// PasswordRequirements component (Keep this as it's not using PasswordResetForm)
const PasswordRequirements = ({ password }) => {
  const isLengthValid = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*()]/.test(password);

  const RequirementItem = ({ isValid, text }) => (
    <li className={`flex items-center text-sm ${isValid ? 'text-green-600' : 'text-red-500'}`}>
      {isValid ? <FiCheckCircle className="mr-2" /> : <FiXCircle className="mr-2" />}
      {text}
    </li>
  );

  return (
    <ul className="list-none p-0 mt-4 space-y-1 text-green-800">
      <RequirementItem isValid={isLengthValid} text="At least 8 characters long" />
      <RequirementItem isValid={hasUpperCase} text="Includes an uppercase letter" />
      <RequirementItem isValid={hasLowerCase} text="Includes a lowercase letter" />
      <RequirementItem isValid={hasNumber} text="Includes a number" />
      <RequirementItem isValid={hasSpecialChar} text="Includes a special character (!@#$%^&*())" />
    </ul>
  );
};

// Framer Motion variants for consistent animation with AdminLogin
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};


export default function AdminForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1: Enter Email, 2: Enter Secret Key, 3: Set New Password
  const [email, setEmail] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  const handleRequestReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setIsError(false);

    try {
      const response = await fetch(`${backendUrl}/api/admin/forgot-password/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success === 'true') {
        setMessage(
          data.message ||
            'If an admin with that email exists, a secret key has been sent to your email.'
        );
        setIsError(false);
        setStep(2);
      } else {
        setMessage(data.message || 'Failed to request password reset. Please check the email entered.'); // More specific error message
        setIsError(true);
      }
    } catch (err) {
      setMessage('An unexpected error occurred. Please try again.');
      setIsError(true);
      console.error('Request reset error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifySecretKey = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setIsError(false);

    try {
      const response = await fetch(`${backendUrl}/api/admin/forgot-password/verify-key`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, secretKey }),
      });

      const data = await response.json();

      if (data.success === 'true') {
        setMessage(data.message || 'Secret key verified. Please set your new password.');
        setIsError(false);
        setStep(3);
      } else {
        setMessage(data.message || 'Invalid email or secret key.');
        setIsError(true);
      }
    } catch (err) {
      setMessage('An unexpected error occurred during key verification. Please try again.');
      setIsError(true);
      console.error('Verify key error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setIsError(false);

    if (newPassword !== confirmPassword) {
      setMessage('New password and confirm password do not match.'); // Specific message
      setIsError(true);
      setLoading(false);
      return;
    }

    if (!passwordRegex.test(newPassword)) {
      setMessage('New password does not meet the requirements.');
      setIsError(true);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${backendUrl}/api/admin/forgot-password/reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, secretKey, newPassword }),
      });

      const data = await response.json();

      if (data.success === 'true') {
        setMessage(
          data.message || 'Password reset successfully. You can now log in with your new password.'
        );
        setIsError(false);
        setTimeout(() => {
          router.push('/admin-login'); // Use /admin-login for consistency
        }, 3000);
      } else {
        setMessage(data.message || 'Failed to reset password. Please check your details.');
        setIsError(true);
      }
    } catch (err) {
      setMessage('An unexpected error occurred during password reset. Please try again.');
      setIsError(true);
      console.error('Reset password error:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <form onSubmit={handleRequestReset} className="p-8 space-y-6">
            {message && (
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                className={`p-3 rounded-lg flex items-center gap-3 ${
                  isError
                    ? 'bg-red-50 border-l-4 border-red-500 text-red-700'
                    : 'bg-green-50 border-l-4 border-green-500 text-green-700'
                }`}
              >
                <span className="text-xl">{isError ? '⚠️' : '✅'}</span>
                <div>
                  <p className="font-medium">{isError ? 'Error' : 'Success'}</p>
                  <p className="text-sm">{message}</p>
                </div>
              </motion.div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-green-900 mb-2">
                Admin Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-4 pr-4 py-3 bg-green-50 border border-green-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 placeholder-green-600/60 transition-all"
                  placeholder="admin@aroglinspices.com"
                />
                <span className="absolute right-3 top-3 text-green-600">✉️</span>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-700 to-amber-700 py-3 rounded-xl font-semibold text-white shadow-lg hover:shadow-xl transition-all relative overflow-hidden"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Requesting...
                </div>
              ) : (
                <>
                  <span className="relative z-10">Request Reset</span> {/* Changed button text */}
                  <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-amber-600 opacity-0 hover:opacity-100 transition-opacity" />
                </>
              )}
            </motion.button>
          </form>
        );
      case 2:
        return (
          <form onSubmit={handleVerifySecretKey} className="p-8 space-y-6">
            {message && (
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                className={`p-3 rounded-lg flex items-center gap-3 ${
                  isError
                    ? 'bg-red-50 border-l-4 border-red-500 text-red-700'
                    : 'bg-green-50 border-l-4 border-green-500 text-green-700'
                }`}
              >
                <span className="text-xl">{isError ? '⚠️' : '✅'}</span>
                <div>
                  <p className="font-medium">{isError ? 'Error' : 'Success'}</p>
                  <p className="text-sm">{message}</p>
                </div>
              </motion.div>
            )}
            <p className="text-sm text-center text-green-800">
              A secret key has been sent to{' '}
              <span className="font-semibold text-amber-700">{email}</span>. Please enter it
              below.
            </p>
            <div>
              <label htmlFor="secretKey" className="block text-sm font-medium text-green-900 mb-2">
                Secret Key
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="secretKey"
                  name="secretKey"
                  value={secretKey}
                  onChange={(e) => setSecretKey(e.target.value)}
                  required
                  className="w-full pl-4 pr-4 py-3 bg-green-50 border border-green-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 placeholder-green-600/60 transition-all"
                  placeholder="Your secret key"
                />
                <span className="absolute right-3 top-3 text-green-600">🔑</span>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-700 to-amber-700 py-3 rounded-xl font-semibold text-white shadow-lg hover:shadow-xl transition-all relative overflow-hidden"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Verifying...
                </div>
              ) : (
                <>
                  <span className="relative z-10">Verify Key</span> {/* Changed button text */}
                  <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-amber-600 opacity-0 hover:opacity-100 transition-opacity" />
                </>
              )}
            </motion.button>
            <button
              type="button"
              onClick={() => { setStep(1); setMessage(''); setIsError(false); }} // Reset message/error when going back
              className="w-full flex justify-center items-center py-2 px-4 rounded-md text-sm font-medium text-green-700 hover:text-amber-700 transition-colors duration-200"
            >
              <FiArrowLeft className="mr-2" /> Back to Email
            </button>
          </form>
        );
      case 3:
        return (
          <form onSubmit={handleResetPassword} className="p-8 space-y-6">
             {message && (
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                className={`p-3 rounded-lg flex items-center gap-3 ${
                  isError
                    ? 'bg-red-50 border-l-4 border-red-500 text-red-700'
                    : 'bg-green-50 border-l-4 border-green-500 text-green-700'
                }`}
              >
                <span className="text-xl">{isError ? '⚠️' : '✅'}</span>
                <div>
                  <p className="font-medium">{isError ? 'Error' : 'Success'}</p>
                  <p className="text-sm">{message}</p>
                </div>
              </motion.div>
            )}
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-green-900 mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="w-full pl-4 pr-4 py-3 bg-green-50 border border-green-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 placeholder-green-600/60 transition-all"
                  placeholder="Enter new password"
                />
                <span className="absolute right-3 top-3 text-green-600">🔒</span>
              </div>
              <PasswordRequirements password={newPassword} />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-green-900 mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full pl-4 pr-4 py-3 bg-green-50 border border-green-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 placeholder-green-600/60 transition-all"
                  placeholder="Confirm new password"
                />
                <span className="absolute right-3 top-3 text-green-600">🔒</span>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              // The disabled state now includes checking if passwords match
              disabled={loading || !passwordRegex.test(newPassword) || newPassword !== confirmPassword}
              className="w-full bg-gradient-to-r from-green-700 to-amber-700 py-3 rounded-xl font-semibold text-white shadow-lg hover:shadow-xl transition-all relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Resetting Password...
                </div>
              ) : (
                <>
                  <span className="relative z-10">Reset Password</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-amber-600 opacity-0 hover:opacity-100 transition-opacity" />
                </>
              )}
            </motion.button>
          </form>
        );
      default:
        return null;
    }
  };

  const getStepTitle = () => {
    switch (step) {
      case 1:
        return 'Request Password Reset';
      case 2:
        return 'Verify Secret Key';
      case 3:
        return 'Set New Password';
      default:
        return '';
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-green-50 to-amber-50">
      <Header /> {/* Assuming you want the header on this page too */}
      <main className="flex-grow flex items-center justify-center px-4 py-12">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="w-full max-w-md"
        >
          <motion.div
            variants={itemVariants}
            className="bg-white rounded-2xl shadow-xl border border-green-100 overflow-hidden"
          >
            <div className="bg-green-900 p-6 text-center">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Image
                  src="/logo.jpg"
                  alt="Aroglin Spice Farms"
                  width={48}
                  height={48}
                  className="rounded-full border-2 border-amber-500"
                />
                <h1 className="text-2xl font-bold text-white">
                  Aroglin Spice Farms
                </h1>
              </div>
              <h2 className="text-xl font-semibold text-amber-400">
                <span className="mr-2">🔒</span>
                Admin Portal
              </h2>
              <p className="mt-2 text-sm text-gray-200">
                {getStepTitle()}
              </p>
            </div>

            {renderStepContent()}

            {/* Adjusted conditional rendering for the "Return to Admin Login" link */}
            {step === 1 || step === 2 ? (
              <div className="text-center pt-4 border-t border-green-100 p-8">
                <Link
                  href="/admin-login"
                  className="text-sm text-green-700 hover:text-amber-700 transition-colors"
                >
                  <FiArrowLeft className="inline-block mr-1" /> Remembered password? Return to Admin Login
                </Link>
              </div>
            ) : ( // For step 3, only show if reset was successful
              step === 3 && !isError && message.includes("successfully") && (
                <div className="text-center pt-4 border-t border-green-100 p-8">
                  <Link
                    href="/admin-login"
                    className="text-sm text-green-700 hover:text-amber-700 transition-colors"
                  >
                    <FiArrowLeft className="inline-block mr-1" /> Proceed to Admin Login
                  </Link>
                </div>
              )
            )}
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="mt-6 text-center text-sm text-green-600/80"
          >
            <p className="flex items-center justify-center gap-2">
              <span>🛡️</span>
              Secured by Aroglin Spice Farms Admin System
              <span>🛡️</span>
            </p>
            <p className="mt-2">v2.4.1 | HTTPS Encrypted</p>
          </motion.div>
        </motion.div>
      </main>
      <Footer /> {/* Assuming you want the footer on this page too */}
    </div>
  );
}