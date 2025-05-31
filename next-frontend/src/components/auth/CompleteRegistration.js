'use client';
import { useState } from 'react';
import { FiLock, FiUser, FiCheckCircle, FiXCircle, FiInfo } from 'react-icons/fi'; // Added FiInfo for consistent icon usage

export default function CompleteRegistration({ onSubmit, loading, error: propError }) { // Renamed error prop to propError to avoid conflict
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    password: '',
    confirmPassword: ''
  });

  const [touched, setTouched] = useState(false);
  const [internalError, setInternalError] = useState(''); // Internal error state for validation

  // Use the propError if it exists, otherwise use the internalError
  const displayError = propError || internalError;

  const validatePassword = (password) => ({
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setInternalError(''); // Clear internal error on new submission attempt

    const validations = validatePassword(formData.password);

    if (!Object.values(validations).every(Boolean)) {
      setInternalError('Password does not meet all requirements.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setInternalError("Passwords do not match.");
      return;
    }

    onSubmit(formData);
  };

  const validations = validatePassword(formData.password);
  const allValid = Object.values(validations).every(Boolean);

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">
          <FiUser className="text-amber-600" />
          Complete Your Profile
        </h2>
        <p className="text-gray-600">Just a few more details to set up your account.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              First Name *
            </label>
            <div className="relative">
              <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full pl-10 pr-4 py-3 rounded-lg border-2 border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Last Name *
            </label>
            <div className="relative">
              <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full pl-10 pr-4 py-3 rounded-lg border-2 border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all"
                required
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Password *
          </label>
          <div className="relative">
            <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={(e) => {
                setFormData({ ...formData, password: e.target.value });
                setTouched(true);
                setInternalError(''); // Clear internal error on password change
              }}
              className="w-full pl-10 pr-4 py-3 rounded-lg border-2 border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all"
              required
            />
          </div>

          {touched && (
            <div className="mt-3 space-y-2 text-sm p-3 bg-gray-50 rounded-lg border border-gray-100"> {/* Added styling to password rules */}
              <p className="font-medium text-gray-700 flex items-center gap-2"><FiInfo className="text-amber-500" />Password requirements:</p>
              <PasswordRule label="8+ characters" valid={validations.length} />
              <PasswordRule label="Uppercase letter" valid={validations.upper} />
              <PasswordRule label="Lowercase letter" valid={validations.lower} />
              <PasswordRule label="Number" valid={validations.number} />
              <PasswordRule label="Special character" valid={validations.special} />
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Confirm Password *
          </label>
          <div className="relative">
            <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={(e) => {
                setFormData({ ...formData, confirmPassword: e.target.value });
                setInternalError(''); // Clear internal error on confirm password change
              }}
              className="w-full pl-10 pr-4 py-3 rounded-lg border-2 border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all"
              required
            />
          </div>
        </div>

        {displayError && (
          <div className="p-3 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg">
            {displayError}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !allValid || formData.password !== formData.confirmPassword} // Disable if passwords don't match
          className="w-full bg-amber-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-amber-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Registering...
            </span>
          ) : (
            <>
              Complete Registration
              <FiCheckCircle className="text-lg" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}

function PasswordRule({ label, valid }) {
  return (
    <div className="flex items-center gap-2">
      {valid ? (
        <FiCheckCircle className="text-green-600" />
      ) : (
        <FiXCircle className="text-red-500" />
      )}
      <span className={valid ? 'text-green-600' : 'text-gray-500'}>{label}</span>
    </div>
  );
}