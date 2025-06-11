'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Header from '@/components/home/Header';
import Footer from '@/components/home/Footer';
import { FiUser, FiLock, FiMail, FiArrowRight, FiUserPlus, FiCheckCircle, FiAlertCircle, FiInfo } from 'react-icons/fi';
import OTPVerification from '@/components/auth/OTPVerification';
import CompleteRegistration from '@/components/auth/CompleteRegistration';

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      when: "beforeChildren",
      staggerChildren: 0.1,
      duration: 0.5
    }
  }
};

const itemVariants = {
  hidden: { y: 30, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.6, ease: "easeOut" } }
};

export default function MyAccount() {
  const [registrationStep, setRegistrationStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [loginDisabled, setLoginDisabled] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isLoadingInitial, setIsLoadingInitial] = useState(true);


  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [registrationLoading, setRegistrationLoading] = useState(false);
  const [registrationError, setRegistrationError] = useState('');
  const [success, setSuccess] = useState(false);

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  useEffect(() => {
    const checkSessionAndRedirect = async () => {
      try {
        const response = await fetch(`${backendUrl}/api/auth/check-session`, {
          credentials: 'include'
        });
        if (response.ok) {
          window.location.href = '/my-profile';
        } else {
          setIsLoadingInitial(false);
        }
      } catch (error) {
        console.error('Session check failed:', error);
        setIsLoadingInitial(false);
      }
    };
    checkSessionAndRedirect();
  }, []);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');

    try {
      const response = await fetch(`${backendUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Login failed');

      window.location.href = '/my-profile';
    } catch (err) {
      const attempts = loginAttempts + 1;
      setLoginAttempts(attempts);

      if (attempts >= 3) {
        setLoginDisabled(true);
        setTimeout(() => {
          setLoginDisabled(false);
          setLoginAttempts(0);
        }, 30000);
      }

      setLoginError(err.message || 'Invalid email or password');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setRegistrationLoading(true);
    setRegistrationError('');
    try {
      const response = await fetch(`${backendUrl}/api/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      setRegistrationStep(2);
      setResendCooldown(30);
    } catch (err) {
      setRegistrationError(err.message);
    } finally {
      setRegistrationLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setRegistrationLoading(true);
    try {
      const response = await fetch(`${backendUrl}/api/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) throw new Error('Failed to resend OTP');

      setResendCooldown(30);
    } catch (err) {
      setRegistrationError(err.message);
    } finally {
      setRegistrationLoading(false);
    }
  };

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [resendCooldown]);

  const handleCompleteRegistration = async (formData) => {
    setRegistrationLoading(true);
    setRegistrationError('');
    try {
      const response = await fetch(`${backendUrl}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, ...formData }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      setSuccess(true);
      setTimeout(() => window.location.href = '/my-account', 2000);
    } catch (err) {
      setRegistrationError(err.message);
    } finally {
      setRegistrationLoading(false);
    }
  };

  if (isLoadingInitial) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-6 py-24 flex items-center justify-center">
          <div className="flex flex-col items-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 border-4 border-t-4 border-green-500 border-t-transparent rounded-full"
            ></motion.div>
            <p className="mt-4 text-lg font-semibold text-green-800">Checking session...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="container mx-auto px-4 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto"> {/* Adjusted max-width for better centering */}
          <motion.h1
            variants={itemVariants}
            className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 text-center"
          >
            {success ? 'Registration Successful!' :
              registrationStep === 3 ? 'Complete Your Profile' : 'Welcome to Aroglin Spice Farms!'}
          </motion.h1>

          {success ? (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center p-10 bg-white rounded-xl border-2 border-green-200 shadow-lg max-w-md mx-auto"
            >
              <FiCheckCircle className="text-7xl text-green-600 mx-auto mb-6 animate-bounce" />
              <h2 className="text-3xl font-bold text-green-800 mb-3">Welcome Aboard!</h2>
              <p className="text-lg text-gray-700 mb-4">
                Your account has been successfully created.
              </p>
              <p className="text-md text-gray-500">
                Redirecting to your account dashboard shortly...
              </p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Login Form */}
              {registrationStep === 1 && (
                <motion.div
                  variants={itemVariants}
                  className="bg-white p-8 rounded-xl shadow-md border border-gray-200 flex flex-col justify-between"
                >
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3 mb-6">
                      <FiUser className="text-amber-600 text-2xl" />
                      Existing User Login
                    </h2>

                    <form onSubmit={handleLoginSubmit} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email address
                        </label>
                        <div className="relative">
                          <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input
                            type="email"
                            value={loginEmail}
                            onChange={(e) => setLoginEmail(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-100 transition-all outline-none"
                            required
                            disabled={loginDisabled}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Password
                        </label>
                        <div className="relative">
                          <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input
                            type="password"
                            value={loginPassword}
                            onChange={(e) => setLoginPassword(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-100 transition-all outline-none"
                            required
                            disabled={loginDisabled}
                          />
                        </div>
                      </div>

                      {loginError && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-3 bg-red-50 border-l-4 border-red-500 text-red-700 rounded"
                        >
                          <div className="flex items-center gap-2">
                            <FiAlertCircle className="text-lg" />
                            <div>
                              <p className="font-medium">{loginError}</p>
                              {loginAttempts > 0 && (
                                <p className="text-xs mt-1">
                                  Attempts remaining: {3 - loginAttempts}
                                </p>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      )}

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={loginLoading || loginDisabled}
                        className="w-full bg-amber-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-amber-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                      >
                        {loginLoading ? (
                          <span className="flex items-center">
                            <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Logging in...
                          </span>
                        ) : (
                          <>
                            Log In
                            <FiArrowRight />
                          </>
                        )}
                      </motion.button>

                      {loginDisabled && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-center text-sm text-red-700 mt-3 p-2 bg-red-100 rounded border border-red-200"
                        >
                          <p className="font-medium">Account temporarily locked.</p>
                          <p>Please try again in 30 seconds.</p>
                        </motion.div>
                      )}
                    </form>
                  </div>
                  <p className="mt-6 text-center text-gray-600 text-sm">
                    Are you an admin?{" "}
                    <a
                      href="/admin-login"
                      className="text-blue-600 hover:text-blue-800 font-medium transition-colors underline"
                    >
                      Login as Admin
                    </a>
                  </p>
                </motion.div>
              )}

              {/* Registration Form (Adjusted logic for display based on step) */}
              {registrationStep === 1 && (
                <motion.div
                  variants={itemVariants}
                  className="bg-white p-8 rounded-xl shadow-md border border-gray-200 flex flex-col justify-between"
                >
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3 mb-6">
                      <FiUserPlus className="text-amber-600 text-2xl" />
                      Create an account
                    </h2>

                    {registrationError && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-3 bg-red-50 border-l-4 border-red-500 text-red-700 rounded"
                      >
                        <div className="flex items-center gap-2">
                          <FiAlertCircle className="text-lg" />
                          <p className="font-medium">{registrationError}</p>
                        </div>
                      </motion.div>
                    )}

                    <form onSubmit={handleEmailSubmit} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email address *
                        </label>
                        <div className="relative">
                          <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-100 transition-all outline-none"
                            required
                          />
                        </div>
                        <p className="mt-1 text-xs text-gray-500">
                          A 6-digit verification code will be sent to your email address.
                        </p>
                      </div>

                      <p className="text-sm text-gray-600 mt-4">
                        Your personal data will be used to support your experience throughout this website, to manage access to your account, and for other purposes described in our <a href="/privacy-policy" className="text-blue-600 hover:text-blue-800 underline">privacy policy</a>.
                      </p>

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={registrationLoading}
                        className="w-full bg-amber-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-amber-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                      >
                        {registrationLoading ? (
                          <span className="flex items-center">
                            <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Registering...
                          </span>
                        ) : (
                          <>
                            Register
                            <FiArrowRight />
                          </>
                        )}
                      </motion.button>
                    </form>
                  </div>
                </motion.div>
              )}

              {/* OTP Verification and Complete Registration (take full width when active) */}
              {registrationStep === 2 && (
                <motion.div
                  variants={itemVariants}
                  className="bg-white p-8 rounded-xl shadow-md border border-gray-200 lg:col-span-2"
                >
                  <OTPVerification
                    email={email}
                    otp={otp}
                    setOtp={setOtp}
                    setRegistrationStep={setRegistrationStep}
                    error={registrationError}
                    setError={setRegistrationError}
                    resendCooldown={resendCooldown}
                    handleResendOTP={handleResendOTP}
                    loading={registrationLoading}
                  />
                </motion.div>
              )}

              {registrationStep === 3 && (
                <motion.div
                  variants={itemVariants}
                  className="bg-white p-8 rounded-xl shadow-md border border-gray-200 lg:col-span-2"
                >
                  <CompleteRegistration
                    onSubmit={handleCompleteRegistration}
                    loading={registrationLoading}
                    error={registrationError}
                  />
                </motion.div>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}