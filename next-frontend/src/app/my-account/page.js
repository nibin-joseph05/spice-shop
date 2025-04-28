'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import Header from '@/components/home/Header';
import Footer from '@/components/home/Footer';
import { FiUser, FiLock, FiMail, FiArrowRight, FiUserPlus, FiCheckCircle } from 'react-icons/fi';
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${backendUrl}/api/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to send OTP');

      setRegistrationStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteRegistration = async (formData) => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${backendUrl}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          otp,
          ...formData
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Registration failed');

      setSuccess(true);
      setTimeout(() => {
        window.location.href = '/my-account';
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
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
          className="container mx-auto px-6 max-w-4xl"
        >
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl font-bold text-green-900 text-center mb-12 relative"
          >
            {success ? 'Registration Successful!' :
              registrationStep === 3 ? 'Complete Your Profile' : 'Welcome to KSR Farms!'}
            <span className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-amber-700"></span>
          </motion.h1>

          {success ? (
            <div className="text-center p-8 bg-green-50 rounded-xl">
              <FiCheckCircle className="text-6xl text-green-600 mx-auto mb-4" />
              <p className="text-lg text-gray-700">
                Redirecting to login page...
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-8">
              <motion.div
                variants={itemVariants}
                className="bg-white p-8 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-green-100 to-amber-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative">
                  <h2 className="text-2xl font-bold text-green-900 mb-6 flex items-center gap-2">
                    <FiUser className="text-amber-700" />
                    Existing User Login
                  </h2>
                  <form className="space-y-6">
                    <div>
                      <label className="block text-gray-700 mb-2 font-medium flex items-center gap-2">
                        <FiMail className="text-amber-700" />
                        Username or email address *
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all duration-300"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 mb-2 font-medium flex items-center gap-2">
                        <FiLock className="text-amber-700" />
                        Password *
                      </label>
                      <input
                        type="password"
                        className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all duration-300"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-amber-700 text-white px-6 py-3 rounded-full hover:bg-amber-800 transition-all duration-300 flex items-center justify-center gap-2 hover:gap-3"
                    >
                      Log in
                      <FiArrowRight className="inline-block" />
                    </button>
                    <div className="flex items-center justify-between mt-4">
                      <label className="flex items-center text-gray-600 hover:text-gray-800 transition-colors">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-amber-700 focus:ring-amber-500 transition-colors"
                        />
                        <span className="ml-2">Remember me</span>
                      </label>
                      <a href="#" className="text-amber-700 hover:text-amber-800 transition-colors flex items-center gap-1">
                        <FiLock className="inline-block" />
                        Lost password?
                      </a>
                    </div>
                  </form>
                </div>
              </motion.div>

              {/* Registration Section */}
              <motion.div
                variants={itemVariants}
                className="bg-white p-8 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-green-100 to-amber-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative">
                  {registrationStep === 1 && (
                    <>
                      <h2 className="text-2xl font-bold text-green-900 mb-6 flex items-center gap-2">
                        <FiUserPlus className="text-amber-700" />
                        New User Registration
                      </h2>
                      <form onSubmit={handleEmailSubmit} className="space-y-6">
                        <div>
                          <label className="block text-gray-700 mb-2 font-medium flex items-center gap-2">
                            <FiMail className="text-amber-700" />
                            Email address *
                          </label>
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all duration-300"
                            required
                          />
                        </div>
                        {error && <p className="text-red-600 text-sm">{error}</p>}
                        <button
                          type="submit"
                          disabled={loading}
                          className="w-full bg-amber-700 text-white px-6 py-3 rounded-full hover:bg-amber-800 transition-all duration-300 flex items-center justify-center gap-2 hover:gap-3 disabled:bg-amber-400"
                        >
                          {loading ? 'Sending OTP...' : 'Continue'}
                          <FiArrowRight className="inline-block" />
                        </button>
                      </form>
                    </>
                  )}

                  {registrationStep === 2 && (
                    <OTPVerification
                      email={email}
                      setRegistrationStep={setRegistrationStep}
                      setError={setError}
                      backendUrl={backendUrl}
                    />
                  )}

                  {registrationStep === 3 && (
                    <CompleteRegistration
                      email={email}
                      setError={setError}
                      backendUrl={backendUrl}
                    />
                  )}
                </div>
              </motion.div>
            </div>
          )}

          {/* Decorative Elements */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-0 right-0 w-48 h-48 bg-green-200/30 rounded-full blur-3xl -z-10"
          />
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute bottom-0 left-0 w-48 h-48 bg-amber-200/30 rounded-full blur-3xl -z-10"
          />
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
