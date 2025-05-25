"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState, useCallback } from 'react';
import Header from '@/components/home/Header';
import Footer from '@/components/home/Footer';
import Image from 'next/image';
import { debounce } from 'lodash';
import Link from 'next/link';


const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 30, opacity: 0, scale: 0.95 },
  visible: {
    y: 0,
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 120,
      damping: 15,
      mass: 0.5
    }
  }
};

const fadeIn = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

export default function Shop() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [availableQualityClasses, setAvailableQualityClasses] = useState([]);


  // Fetch filter options on component mount
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const qualityRes = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/quality-classes`
        );
        const qualityClasses = await qualityRes.json();
        // Normalize and deduplicate on frontend for extra safety
        const uniqueClasses = [...new Set(qualityClasses.map(c => c.trim().toLowerCase()))]
          .sort()
          .map(lc =>
            qualityClasses.find(c => c.trim().toLowerCase() === lc) // Preserve original casing
          );
        setAvailableQualityClasses(uniqueClasses);
      } catch (err) {
        console.error('Failed to fetch quality classes:', err);
      }
    };
    fetchFilterOptions();
  }, []);


  const [filters, setFilters] = useState({
    search: '',
    minPrice: '',
    maxPrice: '',
    qualityClass: [],
    inStock: null
  });

  const fetchProducts = useCallback(
    debounce(async (page = 1) => {
      try {
        setLoading(true);
        setError('');

        const queryParams = {
          page,
          limit: 12,
          search: filters.search,
          minPrice: filters.minPrice,
          maxPrice: filters.maxPrice,
          qualityClass: filters.qualityClass,
          origin: filters.origin,
          inStock: filters.inStock
        };

        // Filter out null, undefined, empty string, and empty array values
        const filteredParams = Object.fromEntries(
          Object.entries(queryParams).filter(([key, value]) => {
            if (value === null || value === undefined) return false;
            if (typeof value === 'string' && value === '') return false;
            if (Array.isArray(value) && value.length === 0) return false;
            return true;
          })
        );

        const params = new URLSearchParams(filteredParams).toString();

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/products?${params}`
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch products');
        }
        const { products, totalPages } = await response.json();

        setProducts(products);
        setTotalPages(totalPages);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError(err.message || 'An unexpected error occurred. Please try again.');
      } finally {
        setLoading(false);
      }
    }, 300),
    [filters]
  );

  useEffect(() => {
    fetchProducts(currentPage);
  }, [currentPage, fetchProducts]);

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      if (filterType === 'qualityClass') {
        const normalizedValue = value.trim().toLowerCase();
        const currentValues = newFilters.qualityClass.map(v => v.trim().toLowerCase());
        newFilters.qualityClass = currentValues.includes(normalizedValue)
          ? newFilters.qualityClass.filter(v => v.trim().toLowerCase() !== normalizedValue)
          : [...newFilters.qualityClass, value];

        } else if (filterType === 'inStock') {
          if (prev.inStock === null) {
            newFilters.inStock = true;
          } else if (prev.inStock === true) {
            newFilters.inStock = false;
          } else {
            newFilters.inStock = null;
          }
        } else {
          newFilters[filterType] = value;
        }
        return newFilters;
      });
      setCurrentPage(1);
    };

  const resetFilters = () => {
    setFilters({
      search: '',
      minPrice: '',
      maxPrice: '',
      qualityClass: [], // Ensure this remains an array
      origin: [], // Ensure this remains an array when resetting
      inStock: null
    });
    setCurrentPage(1);
  };

  // Helper to get inStock button text and style
  const getInStockButtonProps = () => {
    if (filters.inStock === true) {
      return { text: 'In Stock Only', className: 'bg-amber-600 text-white shadow-md' };
    } else if (filters.inStock === false) {
      return { text: 'Out of Stock Only', className: 'bg-red-600 text-white shadow-md' };
    } else {
      return { text: 'All Stock', className: 'bg-green-200 text-green-800 hover:bg-green-300' };
    }
  };

  const inStockButtonProps = getInStockButtonProps();


  const handleViewDetails = (productId) => {

    console.log(`Navigating to product details for ID: ${productId}`);

  };


  return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />

        <main className="flex-grow">
          {/* Filters Section */}
          <section className="bg-gradient-to-r from-green-50 to-emerald-100 py-8 shadow-inner">
            <div className="container mx-auto px-6">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeIn}
                className="flex flex-col md:flex-row gap-4 items-center md:items-start flex-wrap"
              >
                {/* Search Input */}
                <div className="w-full md:w-auto flex-grow">
                  <input
                    type="text"
                    placeholder="Search spices by name or description..."
                    className="w-full px-4 py-2 rounded-lg border border-green-200 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-sm transition-all duration-200"
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                  />
                </div>

                {/* Price Filter */}
                <div className="flex flex-col sm:flex-row gap-2 items-center w-full md:w-auto">
                  <input
                    type="number"
                    placeholder="Min price"
                    className="w-full sm:w-28 px-3 py-2 rounded-lg border border-green-200 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-sm transition-all duration-200"
                    value={filters.minPrice}
                    onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                  />
                  <span className="text-gray-600 text-lg hidden sm:block">-</span>
                  <input
                    type="number"
                    placeholder="Max price"
                    className="w-full sm:w-28 px-3 py-2 rounded-lg border border-green-200 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-sm transition-all duration-200"
                    value={filters.maxPrice}
                    onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                  />
                </div>

                {/* Quality Class Filter - Corrected Implementation */}
                <div className="flex flex-wrap gap-2 w-full md:w-auto">
                  {availableQualityClasses.map(qc => {
                    const normalizedQC = qc.trim().toLowerCase();
                    const isActive = filters.qualityClass
                      .map(f => f.trim().toLowerCase())
                      .includes(normalizedQC);

                    return (
                      <button
                        key={qc}
                        onClick={() => handleFilterChange('qualityClass', qc)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ease-in-out
                          ${isActive
                            ? 'bg-amber-600 text-white shadow-md'
                            : 'bg-green-200 text-green-800 hover:bg-green-300'
                          }`}
                      >
                        {qc}
                      </button>
                    );
                  })}
                </div>

                {/* In Stock Filter Button */}
                <button
                  onClick={() => handleFilterChange('inStock', null)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ease-in-out
                    ${inStockButtonProps.className}`}
                >
                  {inStockButtonProps.text}
                </button>

                <button
                  onClick={resetFilters}
                  className="ml-auto px-6 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 hover:text-red-700 transition-colors duration-200 font-medium"
                >
                  Clear Filters
                </button>
              </motion.div>
            </div>
          </section>


        {/* Products Grid */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-6">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={i}
                    variants={itemVariants}
                    className="bg-gray-100 rounded-xl shadow-md animate-pulse overflow-hidden"
                  >
                    <div className="h-64 bg-gray-200 rounded-t-xl" />
                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-3 bg-gray-200 rounded w-1/2" />
                      <div className="h-3 bg-gray-200 rounded w-2/3" />
                      <div className="flex gap-2 mt-2">
                        <div className="h-6 w-16 bg-gray-200 rounded-full" />
                        <div className="h-6 w-20 bg-gray-200 rounded-full" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-16">
                <div className="bg-red-50 border-l-4 border-red-500 p-8 rounded-lg max-w-lg mx-auto shadow-lg">
                  <h3 className="text-xl font-bold text-red-800 mb-4">Error Loading Products</h3>
                  <p className="text-red-700 text-lg">{error}</p>
                  <button
                    onClick={() => fetchProducts(currentPage)}
                    className="mt-6 px-6 py-3 bg-red-700 text-white rounded-lg hover:bg-red-800 transition-colors duration-200 font-semibold shadow-md"
                  >
                    Retry
                  </button>
                </div>
              </div>
            ) : products.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-16"
              >
                <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-xl">
                  <div className="text-7xl mb-6 animate-bounce">🌿</div>
                  <h3 className="text-3xl font-bold text-green-900 mb-3">
                    No Products Found
                  </h3>
                  <p className="text-gray-700 text-lg mb-6">
                    It looks like your search or filters didn't match any spices.
                    Try adjusting your criteria or clearing all filters.
                  </p>
                  <button
                    onClick={resetFilters}
                    className="px-8 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors duration-200 font-semibold shadow-md"
                  >
                    Reset Filters
                  </button>
                </div>
              </motion.div>
            ) : (
              <>
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.2 }} // Trigger animation when 20% of element is in view
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
                >
                  {products.map((product, index) => {
                    const isProductOutOfStock = product.variants.every(variant =>
                        variant.packs.every(pack => pack.stockQuantity === 0)
                    );


                    return (
                      <motion.div
                        key={product.id}
                        variants={itemVariants}
                        className="group bg-white rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300 overflow-hidden border border-gray-100 relative flex flex-col"
                      >
                        <div className="relative h-64 w-full flex-shrink-0 bg-gray-100 flex items-center justify-center">
                          <Image
                              src={product.imageUrls?.[0] || "https://placehold.co/600x400/E0E0E0/FFFFFF?text=No+Image"}
                              alt={product.name}
                              fill
                              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                              className="object-cover group-hover:scale-105 transition-transform duration-300 ease-in-out p-2"
                              priority={index < 4}
                              onError={(e) => {
                                e.target.src = "https://placehold.co/600x400/E0E0E0/FFFFFF?text=No+Image";
                              }}
                            />
                          {isProductOutOfStock && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-t-xl">
                              <span className="text-white text-xl font-bold tracking-wide">OUT OF STOCK</span>
                            </div>
                          )}
                        </div>
                        <div className="p-5 flex flex-col flex-grow">
                          <h3 className="text-xl font-bold text-green-900 mb-2 truncate">
                            {product.name}
                          </h3>
                          <p className="text-gray-600 text-sm mb-3 line-clamp-2 flex-grow">
                            {product.description}
                          </p>

                          {/* Displaying the base unit if applicable, otherwise omit or use a placeholder */}
                          {product.unit && ( // Assuming 'unit' might be a top-level field for the spice type
                              <div className="flex justify-end items-center mb-3">
                                <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                  {product.unit}
                                </span>
                              </div>
                          )}


                          {/* Origin Badge */}
                          <div className="flex flex-wrap gap-2 mb-3">
                            {product.origin && (
                              <span className="bg-emerald-100 text-emerald-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                                Origin: {product.origin}
                              </span>
                            )}
                          </div>

                          {/* Variants with packs and prices */}
                          <div className="flex-grow overflow-y-auto max-h-48 pr-2 mb-4 scrollbar-thin scrollbar-thumb-green-200 scrollbar-track-green-50">
                            {product.variants && product.variants.length > 0 ? (
                              product.variants.map((variant) => (
                                <div key={variant.id || `${product.id}-${variant.qualityClass}`}> {/* Use variant.id or a composite key */}
                                  <h4 className="text-base font-semibold text-green-800 mb-1 mt-2 first:mt-0">
                                    {variant.qualityClass}
                                  </h4>
                                  {variant.packs && variant.packs.length > 0 ? (
                                    variant.packs.map((pack) => (
                                      <div
                                        key={pack.id || `${variant.id}-${pack.packWeightInGrams}`} // Use pack.id if available, or composite
                                        className="flex justify-between items-center bg-green-50 p-2 rounded-lg border border-green-100 mb-1 last:mb-0"
                                      >
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium text-green-700">
                                                {pack.packWeightInGrams}g
                                            </span>
                                            {pack.stockQuantity <= 10 && pack.stockQuantity > 0 && (
                                                <span className="text-xs text-amber-600 font-semibold">
                                                    (Only {pack.stockQuantity} left!)
                                                </span>
                                            )}
                                            {pack.stockQuantity === 0 && (
                                                <span className="text-xs text-red-600 font-semibold">
                                                    (Out of Stock)
                                                </span>
                                            )}
                                        </div>
                                        <span className="text-base font-bold text-amber-700">
                                          ₹{pack.price ? pack.price.toFixed(2) : 'N/A'}
                                        </span>
                                      </div>
                                    ))
                                  ) : (
                                    <p className="text-gray-500 text-sm italic ml-4">No packs for this variant.</p>
                                  )}
                                </div>
                              ))
                            ) : (
                              <p className="text-gray-500 text-sm italic">No variants available for this product.</p>
                            )}
                          </div>

                          {/* Rating and Reviews - Assuming these are top-level on productDto or fetched separately */}
                          <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <svg
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < (product.rating || 0) ? 'text-amber-400' : 'text-gray-300'
                                  }`}
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ))}
                            </div>
                            <span className="text-xs">
                              ({product.reviews || 0} reviews)
                            </span>
                          </div>

                          {/* View Details Button */}

                          <Link href={`/products/${product.id}`} passHref>
                            <button className="w-full bg-green-700 text-white py-2 rounded-lg font-semibold hover:bg-green-800 transition-colors duration-200 transform hover:scale-105 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 flex items-center justify-center gap-2 relative overflow-hidden">
                              <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              <span>View Details</span>
                              <span className="absolute right-0 w-8 h-full bg-white/20 transform -skew-x-12 translate-x-12 group-hover:translate-x-[-100px] transition-all duration-500"></span>
                            </button>
                          </Link>
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>

                {/* Pagination */}
                <div className="mt-16 flex justify-center items-center gap-3">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-5 py-2 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 font-medium shadow-sm"
                  >
                    Previous
                  </button>

                  {/* Render a limited number of page buttons around the current page */}
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(pageNumber =>
                      pageNumber === 1 ||
                      pageNumber === totalPages ||
                      (pageNumber >= currentPage - 2 && pageNumber <= currentPage + 2)
                    )
                    .map((pageNumber, index, array) => (
                      <span key={pageNumber}>
                        {index > 0 && pageNumber - array[index - 1] > 1 && (
                          <span className="text-gray-500 mx-1">...</span>
                        )}
                        <button
                          onClick={() => setCurrentPage(pageNumber)}
                          className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 shadow-sm
                            ${ currentPage === pageNumber
                              ? 'bg-amber-600 text-white shadow-md'
                              : 'bg-green-100 text-green-800 hover:bg-green-200'
                            }`}
                        >
                          {pageNumber}
                        </button>
                      </span>
                    ))}

                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-5 py-2 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 font-medium shadow-sm"
                  >
                    Next
                  </button>
                </div>
              </>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}