// OTPVerification.js
'use client';
import { useState, useEffect } from 'react';
import { FiLock, FiArrowRight, FiMail, FiCheckCircle, FiXCircle } from 'react-icons/fi';

export default function OTPVerification({ email, otp, setOtp, setRegistrationStep, backendUrl }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isOtpValid, setIsOtpValid] = useState(false);

  useEffect(() => {
    setIsOtpValid(/^\d{6}$/.test(otp));
  }, [otp]);

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!isOtpValid) return;

    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${backendUrl}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      setRegistrationStep(3);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-green-900 mb-2 flex items-center justify-center gap-2">
          <FiLock className="text-amber-600" />
          Verify Your Email
        </h2>
        <p className="text-gray-600">
          We've sent a 6-digit code to <span className="font-semibold">{email}</span>
        </p>
      </div>

      <form onSubmit={handleVerifyOTP} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Verification Code
          </label>
          <div className="relative">
            <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="w-full pl-10 pr-4 py-3 rounded-lg border-2 border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all"
              placeholder="000000"
              required
            />
          </div>
          <div className="mt-2 flex items-center gap-2 text-sm">
            {otp.length >= 1 && (
              <>
                {isOtpValid ? (
                  <FiCheckCircle className="text-green-600" />
                ) : (
                  <FiXCircle className="text-red-500" />
                )}
                <span className={isOtpValid ? 'text-green-600' : 'text-red-500'}>
                  {isOtpValid ? 'Valid OTP format' : 'Must be 6 digits'}
                </span>
              </>
            )}
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !isOtpValid}
          className="w-full bg-amber-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-amber-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? 'Verifying...' : 'Continue'}
          <FiArrowRight className="text-lg" />
        </button>
      </form>
    </div>
  );
}