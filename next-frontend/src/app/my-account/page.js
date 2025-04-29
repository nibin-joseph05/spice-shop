'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Header from '@/components/home/Header';
import Footer from '@/components/home/Footer';
import { FiUser, FiLock, FiMail, FiArrowRight, FiUserPlus, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import OTPVerification from '@/components/auth/OTPVerification';
import CompleteRegistration from '@/components/auth/CompleteRegistration';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
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

  // Separate states for login and registration
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [registrationLoading, setRegistrationLoading] = useState(false);
  const [registrationError, setRegistrationError] = useState('');
  const [success, setSuccess] = useState(false);

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/auth/check-session`, {
        credentials: 'include'
      });
      if (response.ok) window.location.href = '/my-profile';
    } catch (error) {
      console.error('Session check failed:', error);
    }
  };

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

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-green-50 to-amber-50">
      <Header />

      <main className="flex-grow py-12">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "0px 0px -100px 0px" }}
          className="container mx-auto px-4 max-w-4xl"
        >
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold text-green-900 text-center mb-8 relative"
          >
            {success ? 'Registration Successful!' :
              registrationStep === 3 ? 'Complete Your Profile' : 'Welcome to Aroglin Spice Farms!'}
            <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-3 w-24 h-1 bg-amber-600" />
          </motion.h1>

          {success ? (
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center p-8 bg-green-50 rounded-xl border-2 border-green-200"
            >
              <FiCheckCircle className="text-6xl text-green-600 mx-auto mb-4 animate-pulse" />
              <p className="text-lg text-gray-700 mb-2">
                Redirecting to your account...
              </p>
              <p className="text-sm text-gray-500">
                You need to log in to explore and access all features.
              </p>
            </motion.div>

          ) : (
            <div className={`grid ${registrationStep === 1 ? 'md:grid-cols-2' : 'md:grid-cols-1'} gap-8`}>
              {/* Login Form */}
              {registrationStep === 1 && (
                <motion.div
                  variants={itemVariants}
                  className="bg-white p-6 md:p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-shadow"
                >
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-green-900 flex items-center gap-3">
                      <FiUser className="text-amber-600" />
                      Existing User Login
                    </h2>

                    <form onSubmit={handleLoginSubmit} className="space-y-6">
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
                            className="w-full pl-10 pr-4 py-3 rounded-lg border-2 border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-100 transition-all"
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
                            className="w-full pl-10 pr-4 py-3 rounded-lg border-2 border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-100 transition-all"
                            required
                            disabled={loginDisabled}
                          />
                        </div>
                      </div>

                      {loginError && (
                        <div className="p-3 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg">
                          <div className="flex items-center gap-2">
                            <FiAlertCircle />
                            <div>
                              <p className="font-medium">Login Error</p>
                              <p className="text-sm">{loginError}</p>
                              {loginAttempts > 0 && (
                                <p className="text-xs mt-1">
                                  Remaining attempts: {3 - loginAttempts}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={loginLoading || loginDisabled}
                        className="w-full bg-amber-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-amber-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {loginLoading ? 'Logging in...' : 'Continue'}
                        <FiArrowRight className="text-lg" />
                      </button>

                      {loginDisabled && (
                        <div className="text-center text-sm text-red-600 mt-2">
                          <p>Account temporarily locked due to multiple failed attempts.</p>
                          <p className="mt-1">Please try again in 30 seconds.</p>
                        </div>
                      )}
                    </form>
                  </div>
                </motion.div>
              )}

              {/* Registration Form */}
              <motion.div
                variants={itemVariants}
                className="bg-white p-6 md:p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-shadow"
              >
                <div className="space-y-6">
                  {registrationStep === 1 && (
                    <>
                      <h2 className="text-2xl font-bold text-green-900 flex items-center gap-3">
                        <FiUserPlus className="text-amber-600" />
                        New User Registration
                      </h2>

                      {registrationError && (
                        <div className="p-3 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg">
                          <div className="flex items-center gap-2">
                            <FiAlertCircle />
                            <p className="text-sm">{registrationError}</p>
                          </div>
                        </div>
                      )}

                      <div className="p-4 bg-amber-50 rounded-lg border-l-4 border-amber-600">
                        <p className="text-sm text-gray-600 mb-3">
                          Secure 3-step registration process:
                        </p>
                        <ol className="space-y-3">
                          {[1, 2, 3].map((step) => (
                            <li key={step} className="flex items-center gap-3">
                              <span className="w-6 h-6 bg-amber-600 text-white rounded-full flex items-center justify-center">
                                {step}
                              </span>
                              <span className="text-sm">
                                {step === 1 && 'Enter your email'}
                                {step === 2 && 'Verify with OTP'}
                                {step === 3 && 'Complete profile'}
                              </span>
                            </li>
                          ))}
                        </ol>
                      </div>

                      <form onSubmit={handleEmailSubmit} className="space-y-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email address
                          </label>
                          <div className="relative">
                            <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                              type="email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              className="w-full pl-10 pr-4 py-3 rounded-lg border-2 border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-100 transition-all"
                              required
                            />
                          </div>
                          <p className="mt-2 text-sm text-gray-500">
                            We'll send a 6-digit verification code to this email address
                          </p>
                        </div>

                        <button
                          type="submit"
                          disabled={registrationLoading}
                          className="w-full bg-amber-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-amber-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          {registrationLoading ? 'Sending OTP...' : 'Continue'}
                          <FiArrowRight className="text-lg" />
                        </button>
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