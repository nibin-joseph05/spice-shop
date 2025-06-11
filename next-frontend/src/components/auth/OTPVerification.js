'use client';
import { useState } from 'react';
import { FiLock, FiArrowRight, FiMail, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';

export default function OTPVerification({
  email,
  otp,
  setOtp,
  setRegistrationStep,
  error,
  setError,
  resendCooldown,
  handleResendOTP
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [otpResent, setOtpResent] = useState(false);
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(''); // Clear previous errors on new attempt

    try {
      const response = await fetch(`${backendUrl}/api/auth/verify-otp`, {
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
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setError(''); // Clear previous errors before resending
    await handleResendOTP();
    setOtpResent(true);
    setTimeout(() => setOtpResent(false), 5000);
  };

  return (
    <div className="relative p-8 space-y-6"> {/* Added padding for consistency */}
      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <FiLock className="text-amber-700" />
        Verify Your Email
      </h2>
      {error && (
        <div className="p-3 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg flex items-center gap-2">
          <FiAlertCircle className="text-lg flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}
      {otpResent && (
        <div className="p-3 bg-green-50 border-l-4 border-green-500 text-green-700 rounded-lg flex items-center gap-2">
          <FiCheckCircle className="text-lg flex-shrink-0" />
          <p>A new OTP has been sent to your email. Please check your inbox (and spam folder).</p>
        </div>
      )}
      <form onSubmit={handleVerifyOTP} className="space-y-6">
        <div>
          <p className="text-gray-600 mb-4">
            We've sent a 6-digit code to <span className="font-semibold text-gray-800">{email}</span>. Please enter it below to verify your email.
          </p>
          <label className="block text-gray-700 mb-2 font-medium flex items-center gap-2">
            <FiMail className="text-amber-700" />
            Enter OTP *
          </label>
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all duration-300 text-lg tracking-wider font-mono" // Added monospaced font for OTP
            required
            maxLength="6"
            pattern="\d{6}" // Ensure only 6 digits are expected
            inputMode="numeric" // Optimized for numeric input on mobile devices
          />
        </div>
        <button
          type="submit"
          disabled={isLoading || otp.length !== 6} // Disable if OTP is not 6 digits
          className="w-full bg-amber-700 text-white px-6 py-3 rounded-lg hover:bg-amber-800 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed" // Adjusted button styling
        >
          {isLoading ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Verifying...
            </span>
          ) : (
            <>
              Verify OTP
              <FiArrowRight className="inline-block" />
            </>
          )}
        </button>
      </form>
      <div className="mt-6 text-center">
        <button
          type="button"
          onClick={handleResend}
          disabled={resendCooldown > 0 || isLoading}
          className={`text-amber-700 hover:text-amber-800 text-sm font-medium ${
            resendCooldown > 0 ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'
          } transition-opacity`} // Added transition for opacity
        >
          Didn't receive code? Resend OTP
          {resendCooldown > 0 && ` (${resendCooldown}s)`}
        </button>
      </div>
    </div>
  );
}
