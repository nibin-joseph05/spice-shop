'use client';

import { motion } from 'framer-motion';
import { FiLock, FiCheckCircle, FiXCircle, FiInfo } from 'react-icons/fi';
import { useState } from 'react';

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function PasswordForm({ user, passwordData, setPasswordData, errors, onSubmit }) {
  const [touched, setTouched] = useState(false);

  const validatePassword = (password) => ({
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
  });

  const validations = validatePassword(passwordData.newPassword);
  const allValid = Object.values(validations).every(Boolean);
  const passwordsMatch = passwordData.newPassword === passwordData.confirmPassword;

  if (!user) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 text-center"
      >
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">Access Restricted</h2>
        <p className="text-gray-500 text-sm">
          You must be logged in to change your password. Please sign in to continue.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        visible: { transition: { staggerChildren: 0.05 } }
      }}
      className="bg-white rounded-xl shadow-xl p-8"
    >
      <div className="flex items-center gap-3 mb-8">
        <FiLock className="text-2xl text-amber-700" />
        <h2 className="text-2xl font-bold text-green-900">Change Password</h2>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        <motion.div variants={itemVariants} className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Current Password *</label>
          <div className="relative">
            <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="password"
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
              className={`w-full pl-10 pr-4 py-3 rounded-lg border-2 ${
                errors.currentPassword ? 'border-red-500' : 'border-gray-200'
              } focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all`}
              required
            />
          </div>
          {errors.currentPassword && (
            <p className="text-red-500 text-sm mt-1">{errors.currentPassword}</p>
          )}
        </motion.div>

        <motion.div variants={itemVariants} className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">New Password *</label>
          <div className="relative">
            <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="password"
              value={passwordData.newPassword}
              onChange={(e) => {
                setPasswordData({ ...passwordData, newPassword: e.target.value });
                setTouched(true);
              }}
              className={`w-full pl-10 pr-4 py-3 rounded-lg border-2 ${
                errors.newPassword ? 'border-red-500' : 'border-gray-200'
              } focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all`}
              required
            />
          </div>

          {touched && passwordData.newPassword && (
            <div className="mt-3 space-y-2 text-sm p-3 bg-gray-50 rounded-lg border border-gray-100">
              <p className="font-medium text-gray-700 flex items-center gap-2">
                <FiInfo className="text-amber-500" />
                Password requirements:
              </p>
              <PasswordRule label="8+ characters" valid={validations.length} />
              <PasswordRule label="Uppercase letter" valid={validations.upper} />
              <PasswordRule label="Lowercase letter" valid={validations.lower} />
              <PasswordRule label="Number" valid={validations.number} />
              <PasswordRule label="Special character" valid={validations.special} />
            </div>
          )}

          {errors.newPassword && (
            <p className="text-red-500 text-sm mt-1">{errors.newPassword}</p>
          )}
        </motion.div>

        <motion.div variants={itemVariants} className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Confirm New Password *</label>
          <div className="relative">
            <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="password"
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
              className={`w-full pl-10 pr-4 py-3 rounded-lg border-2 ${
                errors.confirmPassword || (!passwordsMatch && passwordData.confirmPassword) ? 'border-red-500' : 'border-gray-200'
              } focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all`}
              required
            />
          </div>
          {!passwordsMatch && passwordData.confirmPassword && (
            <p className="text-red-500 text-sm mt-1">Passwords do not match</p>
          )}
          {errors.confirmPassword && (
            <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
          )}
        </motion.div>

        {/* Display API errors */}
        {errors.api && (
          <motion.div variants={itemVariants} className="p-3 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg">
            {errors.api}
          </motion.div>
        )}

        <motion.div variants={itemVariants} className="mt-6">
          <button
            type="submit"
            disabled={!allValid || !passwordsMatch || !passwordData.currentPassword}
            className="w-full bg-amber-700 text-white px-6 py-3 rounded-lg hover:bg-amber-800
                     transition-all transform hover:scale-[1.02] shadow-md disabled:opacity-50
                     disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
          >
            <FiLock className="text-lg" />
            Change Password
          </button>
        </motion.div>
      </form>
    </motion.div>
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