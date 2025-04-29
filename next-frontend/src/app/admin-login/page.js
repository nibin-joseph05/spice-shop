'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Header from '@/components/home/Header';
import Footer from '@/components/home/Footer';
import Image from 'next/image';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${backendUrl}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Invalid admin credentials');
      }

      const data = await response.json();
      localStorage.setItem('admin', JSON.stringify(data));

      router.push('/admin-dashboard');
    } catch (error) {
      setError(error.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-green-50 to-amber-50">
      <main className="flex-grow flex items-center justify-center px-4 py-24">
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
            </div>

            <form onSubmit={handleLogin} className="p-8 space-y-6">
              {error && (
                <motion.div
                  initial={{ scale: 0.95 }}
                  animate={{ scale: 1 }}
                  className="p-3 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg flex items-center gap-3"
                >
                  <span className="text-xl">⚠️</span>
                  <div>
                    <p className="font-medium">Authentication Error</p>
                    <p className="text-sm">{error}</p>
                  </div>
                </motion.div>
              )}

              <div>
                <label className="block text-sm font-medium text-green-900 mb-2">
                  Admin Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-4 pr-4 py-3 bg-green-50 border border-green-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 placeholder-green-600/60 transition-all"
                    placeholder="admin@aroglinspices.com"
                    required
                  />
                  <span className="absolute right-3 top-3 text-green-600">✉️</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-green-900 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-4 pr-4 py-3 bg-green-50 border border-green-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 placeholder-green-600/60 transition-all"
                    placeholder="••••••••"
                    required
                  />
                  <span className="absolute right-3 top-3 text-green-600">🔑</span>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-green-700 to-amber-700 py-3 rounded-xl font-semibold text-white shadow-lg hover:shadow-xl transition-all relative overflow-hidden"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Authenticating...
                  </div>
                ) : (
                  <>
                    <span className="relative z-10">Secure Login</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-amber-600 opacity-0 hover:opacity-100 transition-opacity" />
                  </>
                )}
              </motion.button>

              <div className="text-center pt-4 border-t border-green-100">
                <a
                  href="/forgot-password"
                  className="text-sm text-green-700 hover:text-amber-700 transition-colors"
                >
                  Forgot Password?
                </a>

                <p className="mt-3 text-sm text-green-600">
                  User login?{' '}
                  <a
                    href="/my-account"
                    className="font-semibold text-amber-700 hover:text-amber-800"
                  >
                    Switch to User Portal
                  </a>
                </p>
              </div>
            </form>
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

      <Footer />
    </div>
  );
}