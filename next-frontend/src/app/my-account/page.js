'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Header from '@/components/home/Header';
import Footer from '@/components/home/Footer';
import { FiUser, FiLock, FiMail, FiArrowRight, FiUserPlus, FiCheckCircle, FiAlertCircle, FiInfo } from 'react-icons/fi'; // Added FiInfo for general info box
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
  const [isLoadingInitial, setIsLoadingInitial] = useState(true); // Added for initial session check

  // Separate states for login and registration
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-lime-100">
        <div className="flex flex-col items-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-t-4 border-green-500 border-t-transparent rounded-full"
          ></motion.div>
          <p className="mt-4 text-lg font-semibold text-green-800">Checking session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-green-50 to-lime-100">
      <Header />

      <main className="flex-grow py-12 flex items-center justify-center">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible" // Changed whileInView to animate for immediate animation on load
          className="container mx-auto px-4 max-w-4xl"
        >
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }} // Changed whileInView to animate
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-4xl md:text-5xl font-extrabold text-green-900 text-center mb-12 relative pb-4"
          >
            {success ? 'Registration Successful!' :
              registrationStep === 3 ? 'Complete Your Profile' : 'Welcome to Aroglin Spice Farms!'}
            <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-32 h-1.5 bg-amber-600 rounded-full" />
          </motion.h1>

          {success ? (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="text-center p-10 bg-white rounded-3xl border-2 border-green-200 shadow-2xl max-w-md mx-auto"
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
            <div className={`grid ${registrationStep === 1 ? 'md:grid-cols-2' : 'md:grid-cols-1'} gap-10`}>
              {/* Login Form */}
              {registrationStep === 1 && (
                <motion.div
                  variants={itemVariants}
                  className="bg-white p-8 lg:p-10 rounded-3xl shadow-2xl border border-gray-100 hover:shadow-3xl transition-shadow duration-300"
                >
                  <div className="space-y-8">
                    <h2 className="text-3xl font-bold text-green-900 flex items-center gap-4 border-b pb-4 border-gray-200">
                      <FiUser className="text-amber-600 text-3xl" />
                      Existing User Login
                    </h2>

                    <form onSubmit={handleLoginSubmit} className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email address
                        </label>
                        <div className="relative">
                          <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                          <input
                            type="email"
                            value={loginEmail}
                            onChange={(e) => setLoginEmail(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-amber-500 focus:ring-4 focus:ring-amber-100 transition-all duration-300 outline-none"
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
                          <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                          <input
                            type="password"
                            value={loginPassword}
                            onChange={(e) => setLoginPassword(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-amber-500 focus:ring-4 focus:ring-amber-100 transition-all duration-300 outline-none"
                            required
                            disabled={loginDisabled}
                          />
                        </div>
                      </div>

                      {loginError && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg shadow-sm"
                        >
                          <div className="flex items-center gap-3">
                            <FiAlertCircle className="text-xl" />
                            <div>
                              <p className="font-semibold">Login Error</p>
                              <p className="text-sm">{loginError}</p>
                              {loginAttempts > 0 && (
                                <p className="text-xs mt-1 text-red-600">
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
                        className="w-full bg-amber-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-amber-700 transition-colors duration-300 flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {loginLoading ? (
                          <span className="flex items-center">
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Logging in...
                          </span>
                        ) : (
                          <>
                            Log In
                            <FiArrowRight className="text-xl" />
                          </>
                        )}
                      </motion.button>

                      {loginDisabled && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-center text-sm text-red-700 mt-4 p-3 bg-red-100 rounded-lg border border-red-200"
                        >
                          <p className="font-semibold">Account temporarily locked.</p>
                          <p className="mt-1">Please try again in 30 seconds.</p>
                        </motion.div>
                      )}
                    </form>
                  </div>
                  <p className="mt-6 text-center text-gray-600 text-sm">
                    Are you an admin?{" "}
                    <a
                      href="/admin-login"
                      className="text-blue-600 hover:text-blue-800 font-semibold transition-colors duration-200 underline"
                    >
                      Login as Admin
                    </a>
                  </p>
                </motion.div>
              )}

              {/* Registration Form */}
              <motion.div
                variants={itemVariants}
                className="bg-white p-8 lg:p-10 rounded-3xl shadow-2xl border border-gray-100 hover:shadow-3xl transition-shadow duration-300"
              >
                <div className="space-y-8">
                  {registrationStep === 1 && (
                    <>
                      <h2 className="text-3xl font-bold text-green-900 flex items-center gap-4 border-b pb-4 border-gray-200">
                        <FiUserPlus className="text-amber-600 text-3xl" />
                        New User Registration
                      </h2>

                      {registrationError && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg shadow-sm"
                        >
                          <div className="flex items-center gap-3">
                            <FiAlertCircle className="text-xl" />
                            <p className="text-sm font-semibold">{registrationError}</p>
                          </div>
                        </motion.div>
                      )}

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="p-6 bg-amber-50 rounded-xl border-l-4 border-amber-600 shadow-md flex items-start gap-4"
                      >
                        <FiInfo className="text-amber-700 text-3xl flex-shrink-0 mt-1" />
                        <div>
                          <p className="text-base text-gray-800 font-medium mb-3">
                            Our Secure 3-Step Registration:
                          </p>
                          <ol className="space-y-3">
                            {[
                              { num: 1, text: 'Enter your email address' },
                              { num: 2, text: 'Verify with a One-Time Password (OTP)' },
                              { num: 3, text: 'Complete your profile details' }
                            ].map((step) => (
                              <li key={step.num} className="flex items-center gap-3 text-gray-700">
                                <span className="w-8 h-8 bg-amber-600 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-md">
                                  {step.num}
                                </span>
                                <span className="text-md">{step.text}</span>
                              </li>
                            ))}
                          </ol>
                        </div>
                      </motion.div>

                      <form onSubmit={handleEmailSubmit} className="space-y-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email address
                          </label>
                          <div className="relative">
                            <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                            <input
                              type="email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-amber-500 focus:ring-4 focus:ring-amber-100 transition-all duration-300 outline-none"
                              required
                            />
                          </div>
                          <p className="mt-2 text-xs text-gray-500">
                            We'll send a 6-digit verification code to this email address.
                          </p>
                        </div>

                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          type="submit"
                          disabled={registrationLoading}
                          className="w-full bg-amber-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-amber-700 transition-colors duration-300 flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          {registrationLoading ? (
                            <span className="flex items-center">
                              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Sending OTP...
                            </span>
                          ) : (
                            <>
                              Register Now
                              <FiArrowRight className="text-xl" />
                            </>
                          )}
                        </motion.button>
                      </form>
                    </>
                  )}

                  {registrationStep === 2 && (
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
                  )}

                  {registrationStep === 3 && (
                    <CompleteRegistration
                      onSubmit={handleCompleteRegistration}
                      loading={registrationLoading}
                      error={registrationError}
                    />
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}