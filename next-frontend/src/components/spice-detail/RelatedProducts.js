"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

export default function RelatedProducts({ products }) {
  if (!products || products.length === 0) return null;

  return (
    <section className="py-10 bg-gray-50 rounded-b-3xl max-w-7xl mx-auto px-6">
      <h3 className="text-4xl font-extrabold text-gray-900 mb-10 text-center tracking-wide">
        You Might Also Like
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
        {products.map((product) => {
          const prices =
            product.variants?.flatMap((v) => v.packs?.map((p) => p.price) || []) ||
            [];
          const minPrice = prices.length > 0 ? Math.min(...prices) : 0;

          return (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: product.id * 0.05 }}
              whileHover={{ scale: 1.05, y: -10 }}
              className="group relative bg-white rounded-2xl shadow-md hover:shadow-2xl transition-shadow duration-300 border border-gray-100 hover:border-amber-400 cursor-pointer overflow-hidden"
            >
              <Link href={`/products/${product.id}`} className="block">
                <motion.div
                  className="relative h-52 w-full rounded-t-2xl overflow-hidden bg-gray-100"
                  whileHover={{ scale: 1.1, rotate: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                >
                  <Image
                    src={product.imageUrls?.[0] || "/spice-placeholder.jpg"}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 50vw, 25vw"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black via-transparent opacity-0 group-hover:opacity-30 transition-opacity duration-500" />
                </motion.div>
                <div className="p-5">
                  <h4 className="font-semibold text-gray-900 text-lg mb-2 truncate group-hover:text-amber-600 group-hover:underline transition-colors duration-300">
                    {product.name}
                  </h4>

                  <div className="flex items-center justify-between mb-4">
                    <span className="text-amber-700 font-extrabold text-xl">
                      ₹{minPrice.toFixed(2)}
                    </span>
                    {product.origin && (
                      <span className="bg-emerald-100 text-emerald-800 text-xs px-3 py-1.5 rounded-full font-semibold select-none">
                        {product.origin}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
