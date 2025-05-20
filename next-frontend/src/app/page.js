// app/page.js
'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import Header from '@/components/home/Header';
import Footer from '@/components/home/Footer';
import HeroCarousel from '@/components/home/HeroCarousel';
import Image from 'next/image';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};

export default function Home() {
  const [spices, setSpices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSpices = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/spices`);
        if (!response.ok) throw new Error('Failed to fetch spices');
        const data = await response.json();
        setSpices(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchSpices();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-700"></div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <p className="text-red-500 text-lg">{error}</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow">
        <HeroCarousel />

        {/* Featured Products Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-6">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "0px 0px -100px 0px" }}
              className="text-3xl font-bold text-center text-green-900 mb-12 relative"
            >
              <span className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-amber-700"></span>
              Our Premium Spices Collection
            </motion.h2>

            {spices.length === 0 ? (
              <p className="text-center text-gray-600">Discover our spices soon! Currently curating the finest selection...</p>
            ) : (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "0px 0px -100px 0px" }}
                className="grid grid-cols-1 md:grid-cols-3 gap-8"
              >
                {spices.map((spice) => (
                  <motion.div
                    key={spice.id}
                    variants={itemVariants}
                    className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 group overflow-hidden"
                  >
                    <div className="relative h-64 overflow-hidden">

                      <Image
                        src={spice.imageUrls?.[0] || '/spice-fallback/spice-placeholder.webp'}
                        alt={spice.name}
                        width={400}
                        height={300}
                        unoptimized
                        className="object-cover w-full h-full transform group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-green-900/40 to-transparent" />
                    </div>
                    <div className="p-6">
                      <div className="mb-4">
                        <h3 className="text-xl font-bold text-green-900 mb-2">
                          {spice.name}
                        </h3>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {spice.description}
                        </p>
                      </div>

                      <div className="space-y-3 mb-5">
                        {spice.variants.map((variant, i) => (
                          <div
                            key={i}
                            className="flex justify-between items-center bg-green-50/50 p-3 rounded-lg border border-green-100"
                          >
                            <span className="text-sm font-medium text-green-800">
                              {variant.qualityClass}
                            </span>
                            <span className="text-base font-bold text-amber-700">
                              ₹{variant.price.toFixed(2)} / {spice.unit}
                            </span>
                          </div>
                        ))}
                      </div>

                      <button className="w-full bg-gradient-to-r from-amber-600 to-amber-700 text-white px-4 py-3 rounded-lg hover:from-amber-700 hover:to-amber-800 transition-all duration-300 flex items-center justify-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                        </svg>
                        Add to Cart
                      </button>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </section>

        {/* Quality Promise Section */}
        <section className="bg-green-50 py-16">
          <div className="container mx-auto px-6">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              className="max-w-4xl mx-auto text-center"
            >
              <h2 className="text-3xl font-bold text-green-900 mb-6">
                Our Quality Promise
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Every spice is carefully sourced from trusted farmers, sun-dried naturally, and handpicked to ensure you get the purest flavors straight from Kerala's lush fields.
              </p>
              <div className="grid md:grid-cols-3 gap-8">
                {[
                  { icon: '🌿', title: 'Natural Farming', text: 'Chemical-free cultivation' },
                  { icon: '👩🌾', title: 'Direct from Farmers', text: 'Supporting local communities' },
                  { icon: '✨', title: 'Premium Selection', text: 'Only top-grade produce' }
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ y: -5 }}
                    className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="text-4xl mb-4">{item.icon}</div>
                    <h3 className="text-xl font-semibold text-green-900 mb-2">
                      {item.title}
                    </h3>
                    <p className="text-gray-600">{item.text}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}