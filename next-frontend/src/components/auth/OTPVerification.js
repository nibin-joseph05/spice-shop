// components/auth/OTPVerification.js
'use client';
import { useState } from 'react';
import { FiLock, FiArrowRight, FiMail } from 'react-icons/fi';

export default function OTPVerification({ email, setRegistrationStep, setError }) {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`${backendUrl}/api/auth/register/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'OTP verification failed');
      }

      setRegistrationStep(3);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      <h2 className="text-2xl font-bold text-green-900 mb-6 flex items-center gap-2">
        <FiLock className="text-amber-700" />
        Verify Your Email
      </h2>
      <form onSubmit={handleVerifyOTP} className="space-y-6">
        <div>
          <p className="text-gray-600 mb-4">
            We've sent a 6-digit code to <span className="font-semibold">{email}</span>
          </p>
          <label className="block text-gray-700 mb-2 font-medium flex items-center gap-2">
            <FiMail className="text-amber-700" />
            Enter OTP *
          </label>
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all duration-300"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-amber-700 text-white px-6 py-3 rounded-full hover:bg-amber-800 transition-all duration-300 flex items-center justify-center gap-2 hover:gap-3 disabled:bg-amber-400"
        >
          {loading ? 'Verifying...' : 'Verify OTP'}
          <FiArrowRight className="inline-block" />
        </button>
      </form>
    </div>
  );
}