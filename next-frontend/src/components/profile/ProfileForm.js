'use client';

import { motion } from 'framer-motion';
import { FiUser } from 'react-icons/fi';

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 }
};

export default function ProfileForm({ formData, setFormData, errors, onSubmit }) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        visible: { transition: { staggerChildren: 0.05 } }
      }}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8"
    >
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-amber-50 rounded-xl">
          <FiUser className="text-2xl text-amber-700" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Profile Information</h2>
          <p className="text-gray-500 mt-1">Update your personal details</p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Input fields */}
        <motion.div variants={itemVariants} className="space-y-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
          <input
            type="text"
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            className={`w-full px-4 py-2.5 rounded-lg border ${
              errors.firstName ? 'border-red-200 bg-red-50' : 'border-gray-200'
            } focus:ring-2 focus:ring-amber-500 focus:border-amber-500 placeholder-gray-400`}
            placeholder="Enter your first name"
          />
          {errors.firstName && (
            <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
              </svg>
              {errors.firstName}
            </p>
          )}
        </motion.div>

        <motion.div variants={itemVariants} className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Last Name</label>
          <input
            type="text"
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            className={`w-full px-4 py-3 rounded-lg border ${
              errors.lastName ? 'border-red-500' : 'border-gray-300'
            } focus:ring-2 focus:ring-amber-500 focus:border-amber-500`}
          />
          {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
        </motion.div>

        <motion.div variants={itemVariants} className="md:col-span-2 space-y-2">
          <label className="block text-sm font-medium text-gray-700">Email Address</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className={`w-full px-4 py-3 rounded-lg border ${
              errors.email ? 'border-red-500' : 'border-gray-300'
            } focus:ring-2 focus:ring-amber-500 focus:border-amber-500`}
          />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
        </motion.div>

        <motion.div variants={itemVariants} className="md:col-span-2 mt-4">
          <button
            type="submit"
            className="w-full bg-amber-600 text-white px-6 py-3 rounded-xl hover:bg-amber-700
                     transition-all duration-200 shadow-sm hover:shadow-md"
          >
            Save Changes
          </button>
        </motion.div>
      </form>
    </motion.div>
  );
}