// components/auth/CompleteRegistration.js
'use client';
import { useState } from 'react';
import { FiLock, FiUser } from 'react-icons/fi';

export default function CompleteRegistration({ onSubmit, loading, error }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    password: '',
    confirmPassword: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords don't match!");
      return;
    }
    onSubmit({
      firstName: formData.firstName,
      lastName: formData.lastName,
      password: formData.password
    });
  };

  return (
    <>
      <h2 className="text-2xl font-bold text-green-900 mb-6 flex items-center gap-2">
        <FiUser className="text-amber-700" />
        Complete Registration
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Form fields */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-amber-700 text-white px-6 py-3 rounded-full hover:bg-amber-800 transition-all duration-300 flex items-center justify-center gap-2 hover:gap-3 disabled:bg-amber-400"
        >
          {loading ? 'Registering...' : 'Complete Registration'}
          <FiLock className="inline-block" />
        </button>
        {error && <p className="text-red-600 text-sm">{error}</p>}
      </form>
    </>
  );
}