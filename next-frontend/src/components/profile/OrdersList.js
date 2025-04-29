'use client';

import { motion } from 'framer-motion';
import { FiBox } from 'react-icons/fi';

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function OrdersList({ orders }) {
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
        <FiBox className="text-2xl text-amber-700" />
        <h2 className="text-2xl font-bold text-green-900">Order History</h2>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-4 gap-4 text-sm font-semibold text-green-900 border-b pb-3">
          <div>Order #</div>
          <div>Items</div>
          <div>Date</div>
          <div>Amount</div>
        </div>

        {orders.map((order) => (
          <motion.div
            key={order.id}
            variants={itemVariants}
            className="grid grid-cols-4 gap-4 text-sm text-gray-600 hover:bg-green-50 p-3 rounded-lg
                     transition-colors border-b border-green-100 last:border-0"
          >
            <div className="font-medium text-green-900">#{order.id}</div>
            <div className="truncate pr-2">{order.items}</div>
            <div>
              {new Date(order.date).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
              })}
            </div>
            <div className="font-semibold text-amber-700">{order.amount}</div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}