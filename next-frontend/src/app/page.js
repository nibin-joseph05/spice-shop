'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState, useCallback } from 'react';
import Header from '@/components/home/Header';
import Footer from '@/components/home/Footer';
import HeroCarousel from '@/components/home/HeroCarousel';
import Image from 'next/image';
import { debounce } from 'lodash';
import Link from 'next/link';


const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.3
    }
  }
};

const itemVariants = {
  hidden: { y: 30, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 12
    }
  }
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.8 }
  }
};

export default function Home() {
  const [spices, setSpices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isClient, setIsClient] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [featuredSpices, setFeaturedSpices] = useState([]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    const fetchSpices = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/spices`,
          { signal }
        );

        if (!response.ok) throw new Error('Failed to fetch spices');

        const data = await response.json();
        setSpices(data);


        setFeaturedSpices(data.slice(0, 6));
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchSpices();

    return () => {
      controller.abort();
    };
  }, []);



  if (!isClient) return null;

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-amber-700"></div>
            <p className="text-amber-800 animate-pulse">Loading premium spices...</p>
          </div>
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
          <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg max-w-lg mx-auto">
            <div className="flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="text-lg font-semibold text-red-800">Something went wrong</h3>
                <p className="text-red-600">{error}</p>
              </div>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-md transition-colors"
            >
              Try Again
            </button>
          </div>
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
        <section className="py-16 mt-8">
          <div className="container mx-auto px-6">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "0px 0px -100px 0px" }}
              variants={fadeIn}
              className="relative mb-16 text-center"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-green-900 inline-block relative">
                Our Premium Spices Collection
                <span className="absolute -bottom-3 left-0 right-0 mx-auto w-24 h-1.5 bg-amber-600 rounded-full"></span>
              </h2>
              <p className="mt-6 text-gray-600 max-w-2xl mx-auto">
                Handpicked from Kerala's finest farms and processed with care to preserve their authentic flavors and aromatic essence.
              </p>
            </motion.div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {featuredSpices.map((spice, index) => (
                <motion.div
                  key={spice.id}
                  variants={itemVariants}
                  className="group relative bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100"
                  whileHover={{ y: -5 }}
                >
                  <div className="relative h-64 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-green-900/40 to-transparent z-20" />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/10 z-30" />
                    <Image
                      src={spice.imageUrls?.[0] || '/spice-fallback/spice-placeholder.webp'}
                      alt={spice.name}
                      width={400}
                      height={300}
                      className="object-cover w-full h-full transform group-hover:scale-105 transition-transform duration-500 ease-out"
                      onError={(e) => {
                        e.target.src = '/spice-fallback/spice-placeholder.webp';
                        e.target.srcset = '/spice-fallback/spice-placeholder.webp';
                      }}
                      priority={index < 3}
                    />
                    <div className="absolute top-4 right-4 z-40 flex gap-2">
                      {spice.qualityClass === 'Organic' && (
                        <span className="bg-amber-500 text-white px-3 py-1 rounded-full text-sm font-medium shadow-md backdrop-blur-sm">
                          Organic
                        </span>
                      )}
                      <span className="bg-green-700 text-white px-3 py-1 rounded-full text-sm font-medium shadow-md backdrop-blur-sm">
                        Direct Farm
                      </span>
                    </div>
                    <div className="absolute bottom-4 left-4 z-30">
                      <span className="bg-white/90 text-green-900 px-3 py-1 rounded-full text-sm font-medium shadow-sm flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-amber-600" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M6.267 3.455c1.277-.552 2.593-.827 3.97-.827 1.377 0 2.693.275 3.97.827l.328.588c.36.646.54.969.82 1.182.28.213.63.292 1.33.45l.636.144c2.46.557 3.689.835 3.982 1.776.292.94-.546 1.921-2.223 3.882l-.434.507c-.476.557-.715.836-.822 1.18-.107.345-.071.717.001 1.46l.066.677c.253 2.617.38 3.925-.386 4.506-.766.582-1.918.051-4.22-1.009l-.597-.274c-.654-.302-.981-.452-1.328-.452-.347 0-.674.15-1.329.452l-.595.274c-2.303 1.06-3.455 1.59-4.22 1.01-.767-.582-.64-1.89-.387-4.507l.066-.676c.072-.744.108-1.116 0-1.46-.106-.345-.345-.624-.821-1.18l-.434-.508c-1.677-1.96-2.515-2.941-2.223-3.882.293-.94 1.523-1.22 3.983-1.776l.636-.144c.699-.158 1.048-.237 1.329-.45.28-.213.46-.536.82-1.182l.328-.588zM9 10.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4a1 1 0 00-1.414-1.414L9 10.586z" clipRule="evenodd" />
                        </svg>
                        Freshness Guarantee
                      </span>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="mb-4">
                      <h3 className="text-xl font-bold text-green-900 mb-2 group-hover:text-amber-700 transition-colors">
                        {spice.name}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                        {spice.description}
                      </p>
                      <div className="flex items-center text-sm text-green-700 mb-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                        <span>Origin: {spice.origin || 'Kerala'}</span>
                      </div>
                      {spice.heatLevel && (
                        <div className="flex items-center text-sm text-amber-700 mb-3">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10 3.5a1.5 1.5 0 013 0V4a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-.5a1.5 1.5 0 000 3h.5a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-.5a1.5 1.5 0 00-3 0v.5a1 1 0 01-1 1H6a1 1 0 01-1-1v-3a1 1 0 00-1-1h-.5a1.5 1.5 0 010-3H4a1 1 0 001-1V6a1 1 0 011-1h3a1 1 0 001-1v-.5z" />
                          </svg>
                          <span>Heat Level: {spice.heatLevel}</span>
                        </div>
                      )}
                    </div>

                    <div className="h-48 overflow-y-auto pr-2 mb-5 scrollbar-thin scrollbar-thumb-green-200 scrollbar-track-green-50">
                      {spice.variants && spice.variants.length > 0 ? (
                        spice.variants.map((variant, i) => (
                          <div key={variant.id || `${spice.id}-${variant.qualityClass}-${i}`}>
                            <div className="text-sm font-semibold text-green-900 mb-2 mt-2 first:mt-0">
                              {variant.qualityClass}
                            </div>
                            {variant.packs && variant.packs.length > 0 ? (
                              variant.packs.map((pack, j) => (
                                <motion.div
                                  key={pack.id || `${variant.id}-${pack.packWeightInGrams}-${j}`}
                                  whileHover={{ scale: 1.02 }}
                                  className="flex justify-between items-center bg-green-50 p-3 rounded-lg border border-green-100 hover:border-green-200 transition-all mb-3 last:mb-0"
                                >
                                  <div>
                                    <span className="block text-sm font-medium text-green-800">
                                      {pack.packWeightInGrams}g Pack
                                    </span>
                                  </div>
                                  <div className="text-right">
                                    <div className="flex items-center gap-2">
                                      {pack.stockQuantity < 10 && pack.stockQuantity > 0 && (
                                        <span className="text-xs text-red-600">Only {pack.stockQuantity} left!</span>
                                      )}
                                      {pack.stockQuantity === 0 && (
                                        <span className="text-xs text-gray-500">Out of Stock</span>
                                      )}
                                      <div>
                                        <span className="block text-base font-bold text-amber-700">
                                          ₹{pack.price.toFixed(2)}
                                        </span>
                                        <span className="text-sm text-green-600">per pack</span>
                                      </div>
                                    </div>
                                  </div>
                                </motion.div>
                              ))
                            ) : (
                              <p className="text-gray-500 text-sm italic ml-4">No packs for this variant.</p>
                            )}
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500 text-sm italic">No variants available for this spice.</p>
                      )}
                    </div>

                    <Link href={`/products/${spice.id}`} passHref>
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        className="w-full bg-gradient-to-r from-amber-500 to-amber-700 text-white px-4 py-3 rounded-lg hover:from-amber-600 hover:to-amber-800 transition-all duration-300 flex items-center justify-center gap-2 relative overflow-hidden"
                      >
                        <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                          <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                        </svg>
                        <span>View Details</span>
                        <span className="absolute right-0 w-8 h-full bg-white/20 transform -skew-x-12 translate-x-12 group-hover:translate-x-[-100px] transition-all duration-500"></span>
                      </motion.button>
                    </Link>
                  </div>
                </motion.div>
              ))}
              {featuredSpices.length === 0 && !loading && !error && (
                <div className="md:col-span-3 text-center py-10 text-gray-500">
                  No spices found to feature.
                </div>
              )}
            </motion.div>

            {spices.length > featuredSpices.length && (
              <div className="text-center mt-12">
                <Link href="/shop" passHref>
                  <button className="inline-flex items-center px-8 py-4 bg-green-800 text-white rounded-lg shadow-lg hover:bg-green-900 transition-colors transform hover:-translate-y-1">
                    <span>View All Spices</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* Quality Promise Section */}
        <section className="py-16 bg-gradient-to-b from-white to-green-50">
          <div className="container mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true, margin: "0px 0px -100px 0px" }}
              className="max-w-4xl mx-auto text-center"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-green-900 mb-6 relative inline-block">
                Our Quality Promise
                <svg className="absolute -top-6 -right-12 text-amber-400 w-10 h-10 opacity-70" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </h2>
              <p className="text-lg text-gray-600 mb-10 max-w-3xl mx-auto">
                Every spice in our collection is carefully sourced from trusted farmers,
                sun-dried naturally, and handpicked to ensure you get the purest flavors
                straight from Kerala's lush fields to your kitchen.
              </p>

              <div className="grid md:grid-cols-3 gap-8">
                {[
                  {
                    icon: '🌿',
                    title: 'Natural Farming',
                    text: 'Grown without chemicals or pesticides, preserving both flavor and health benefits'
                  },
                  {
                    icon: '👩‍🌾',
                    title: 'Direct from Farmers',
                    text: 'Supporting local communities with fair prices and sustainable practices'
                  },
                  {
                    icon: '✨',
                    title: 'Premium Selection',
                    text: 'Every batch is carefully inspected to ensure only top-grade spices reach your table'
                  }
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.2 }}
                    viewport={{ once: true }}
                    whileHover={{ y: -8, boxShadow: "0 15px 30px rgba(0,0,0,0.1)" }}
                    className="p-8 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-green-100"
                  >
                    <div className="text-5xl mb-6">{item.icon}</div>
                    <h3 className="text-xl font-semibold text-green-900 mb-3">
                      {item.title}
                    </h3>
                    <p className="text-gray-600">{item.text}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-16 bg-amber-50">
          <div className="container mx-auto px-6">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl font-bold text-center text-green-900 mb-12 relative"
            >
              <span className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-amber-600"></span>
              What Our Customers Say
            </motion.h2>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {[
                {
                  name: "Priya S.",
                  location: "Mumbai",
                  text: "The cardamom is exceptional! It has transformed my chai completely. So much more aromatic than what I used to buy at supermarkets.",
                  rating: 5
                },
                {
                  name: "Rahul M.",
                  location: "Delhi",
                  text: "I've been using their black pepper for 6 months now. The flavor is incredible and the grind is perfect for my cooking needs.",
                  rating: 5
                },
                {
                  name: "Anita K.",
                  location: "Bangalore",
                  text: "Their turmeric has the most vibrant color I've ever seen. You can really tell the difference in quality compared to standard brands.",
                  rating: 4
                }
              ].map((testimonial, i) => (
                <motion.div
                  key={i}
                  variants={itemVariants}
                  className="bg-white p-6 rounded-xl shadow-md relative"
                >
                  <div className="absolute -top-4 right-6 bg-amber-500 text-white rounded-full p-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-800 font-bold mr-4">
                      {testimonial.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-semibold">{testimonial.name}</h4>
                      <p className="text-sm text-gray-500">{testimonial.location}</p>
                    </div>
                  </div>
                  <div className="flex mb-3">
                    {[...Array(5)].map((_, starIndex) => (
                      <svg
                        key={starIndex}
                        className={`h-5 w-5 ${starIndex < testimonial.rating ? 'text-amber-500' : 'text-gray-300'}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-gray-600 italic">"{testimonial.text}"</p>
                </motion.div>
              ))}
            </motion.div>

            <div className="text-center mt-10">
              <button className="inline-flex items-center px-6 py-3 bg-green-800 text-white rounded-lg hover:bg-green-900 transition-colors">
                <span>View All Reviews</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </section>


        {/* A Glimpse of Our Premium Spices Section */}
        <section className="py-16">
          <div className="container mx-auto px-6">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "0px 0px -100px 0px" }}
              variants={fadeIn}
              className="relative mb-12 text-center"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-green-900 inline-block relative">
                A Glimpse of Our Premium Spices
                <span className="absolute -bottom-3 left-0 right-0 mx-auto w-32 h-1.5 bg-amber-600 rounded-full"></span>
              </h2>
              <p className="mt-6 text-gray-600 max-w-2xl mx-auto">
                Experience the visual richness of our high-quality spices sourced directly from Kerala.
              </p>
            </motion.div>

            <motion.div
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
            >
              {[
                "https://images.unsplash.com/photo-1581600140682-d4e68c8cde32?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c3BpY2V8ZW58MHx8MHx8fDA%3D",
                "https://images.unsplash.com/photo-1532336414038-cf19250c5757?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8c3BpY2V8ZW58MHx8MHx8fDA%3D",
                "https://images.unsplash.com/photo-1517646458010-ea6bd9f4a75f?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTh8fHNwaWNlfGVufDB8fDB8fHww",
                "https://plus.unsplash.com/premium_photo-1661337223133-a92f4f68d001?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8c3BpY2V8ZW58MHx8MHx8fDA%3D",
                "https://images.unsplash.com/photo-1592457711340-2412dc07b733?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fHNwaWNlfGVufDB8fDB8fHww",
                "https://plus.unsplash.com/premium_photo-1672076780330-ae81962ee3ce?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTd8fHNwaWNlfGVufDB8fDB8fHww",
                "https://media.istockphoto.com/id/979264404/photo/ground-black-pepper.webp?a=1&b=1&s=612x612&w=0&k=20&c=VT7S3Vj7CDVI2UwPhqZqWOtsQaoZr97avKhUQxxd57E=",
                "https://media.istockphoto.com/id/518709136/photo/green-cardamom-pods-in-steel-bowl.webp?a=1&b=1&s=612x612&w=0&k=20&c=bjkqgmdl1KmGfH1pVFkPKSSYQCNtgMjCW1pzL4w6ZMg="
              ].map((src, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="relative rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 aspect-square"
                >
                  <div className="w-full h-full relative">
                    <Image
                      src={src}
                      alt="Spice image"
                      fill
                      sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      className="object-cover transform hover:scale-105 transition-transform duration-300 ease-in-out"
                      onError={(e) => {
                        e.target.src = '/spice-fallback/spice-placeholder.webp';
                        e.target.srcset = '/spice-fallback/spice-placeholder.webp';
                      }}
                    />
                  </div>
                </motion.div>
              ))}
            </motion.div>

            <div className="text-center mt-8">
              <Link href="/shop" passHref>
                <button className="inline-flex items-center px-6 py-3 bg-green-800 text-white rounded-lg shadow-lg hover:bg-green-900 transition-colors transform hover:-translate-y-1">
                  <span>Explore Our Full Collection</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </Link>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-16 bg-green-900 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="spice-pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M20 0C9 0 0 9 0 20s9 20 20 20 20-9 20-20S31 0 20 0zm0 30c-5.5 0-10-4.5-10-10s4.5-10 10-10 10 4.5 10 10-4.5 10-10 10z" fill="currentColor" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#spice-pattern)" />
            </svg>
          </div>

          <div className="container mx-auto px-6 relative z-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="max-w-3xl mx-auto text-center"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Experience the Authentic Taste of Kerala
              </h2>
              <p className="text-lg mb-8 text-green-100">
                Join thousands of satisfied customers who have elevated their cooking
                with our premium, ethically-sourced spices.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/shop" passHref>
                  <button className="px-8 py-4 bg-amber-500 hover:bg-amber-600 text-white rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 flex-1 w-full sm:w-auto">
                    Shop Now
                  </button>
                </Link>
                <button className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-lg hover:bg-white hover:text-green-900 transition-all flex-1 w-full sm:w-auto">
                  Learn More
                </button>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}