'use client';

import { motion } from 'framer-motion';
import { FiLock } from 'react-icons/fi';

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function PasswordForm({ user, passwordData, setPasswordData, errors, onSubmit }) {
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
          <label className="block text-sm font-medium text-gray-700">Current Password</label>
          <input
            type="password"
            value={passwordData.currentPassword}
            onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
            className={`w-full px-4 py-3 rounded-lg border ${
              errors.currentPassword ? 'border-red-500' : 'border-gray-300'
            } focus:ring-2 focus:ring-amber-500 focus:border-amber-500`}
          />
          {errors.currentPassword && (
            <p className="text-red-500 text-sm mt-1">{errors.currentPassword}</p>
          )}
        </motion.div>

        <motion.div variants={itemVariants} className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">New Password</label>
          <input
            type="password"
            value={passwordData.newPassword}
            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
            className={`w-full px-4 py-3 rounded-lg border ${
              errors.newPassword ? 'border-red-500' : 'border-gray-300'
            } focus:ring-2 focus:ring-amber-500 focus:border-amber-500`}
          />
          {errors.newPassword && (
            <p className="text-red-500 text-sm mt-1">{errors.newPassword}</p>
          )}
        </motion.div>

        <motion.div variants={itemVariants} className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
          <input
            type="password"
            value={passwordData.confirmPassword}
            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
            className={`w-full px-4 py-3 rounded-lg border ${
              errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
            } focus:ring-2 focus:ring-amber-500 focus:border-amber-500`}
          />
          {errors.confirmPassword && (
            <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
          )}
        </motion.div>

        <motion.div variants={itemVariants} className="mt-6">
          <button
            type="submit"
            className="w-full bg-amber-700 text-white px-6 py-3 rounded-lg hover:bg-amber-800
                     transition-all transform hover:scale-[1.02] shadow-md"
          >
            Change Password
          </button>
        </motion.div>
      </form>
    </motion.div>
  );
}
