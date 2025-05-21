'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState, useCallback } from 'react';
import Header from '@/components/home/Header';
import Footer from '@/components/home/Footer';
import Image from 'next/image';
import { debounce } from 'lodash';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08, // Slightly faster stagger for a snappier feel
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
      stiffness: 120, // Slightly stiffer spring
      damping: 15,
      mass: 0.5 // Added mass for a more natural bounce
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
  const [filters, setFilters] = useState({
    search: '',
    minPrice: '',
    maxPrice: '',
    // Removed 'origin' filter as per request
    qualityClass: [],
    inStock: null // Initial state: null (no filter applied for stock)
  });
  const [cart, setCart] = useState([]); // State for the shopping cart
  const [notification, setNotification] = useState(null); // State for toast notifications

  // Available filter options
  const filterOptions = {
    // Removed 'origins' as per request
    qualityClasses: ['Premium', 'Standard', 'Economy', 'Organic', 'Handpicked', 'Super Premium'] // Added 'Super Premium'
  };

  const fetchProducts = useCallback(
    debounce(async (page = 1) => {
      try {
        setLoading(true);
        setError(''); // Clear previous errors

        const queryParams = {
          page,
          limit: 12,
          search: filters.search,
          minPrice: filters.minPrice,
          maxPrice: filters.maxPrice,
          // 'origin' is no longer sent
          qualityClass: filters.qualityClass,
          inStock: filters.inStock // This will be null, true, or false
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
      if (filterType === 'inStock') {
        // Toggle logic for inStock: null (no filter) -> true (in stock) -> false (out of stock) -> null
        if (prev.inStock === null) {
          newFilters.inStock = true; // Filter for in-stock
        } else if (prev.inStock === true) {
          newFilters.inStock = false; // Filter for out-of-stock
        } else { // prev.inStock === false
          newFilters.inStock = null; // No stock filter
        }
      } else if (Array.isArray(newFilters[filterType])) {
        newFilters[filterType] = newFilters[filterType].includes(value)
          ? newFilters[filterType].filter(item => item !== value)
          : [...newFilters[filterType], value];
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
      // Removed 'origin' from reset
      qualityClass: [],
      inStock: null // Reset to no filter
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

  // Add to cart function
  const addToCart = (product, selectedVariant) => {
    const itemToAdd = {
      productId: product.id,
      productName: product.name,
      variantId: selectedVariant.id,
      qualityClass: selectedVariant.qualityClass,
      price: selectedVariant.price,
      quantity: 1, // Default quantity
      imageUrl: product.imageUrls?.[0] || "https://placehold.co/600x400/E0E0E0/FFFFFF?text=No+Image"
    };

    setCart(prevCart => {
      const existingItemIndex = prevCart.findIndex(
        item => item.productId === itemToAdd.productId && item.variantId === itemToAdd.variantId
      );

      if (existingItemIndex > -1) {
        // If item exists, update quantity
        const updatedCart = [...prevCart];
        updatedCart[existingItemIndex].quantity += 1;
        return updatedCart;
      } else {
        // Otherwise, add new item
        return [...prevCart, itemToAdd];
      }
    });

    setNotification(`${product.name} (${selectedVariant.qualityClass}) added to cart!`);
    setTimeout(() => setNotification(null), 3000); // Clear notification after 3 seconds
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

              {/* Origin Filter Badges - Removed as per request */}
              {/* <div className="flex flex-wrap gap-2 w-full md:w-auto">
                {filterOptions.origins.map(origin => (
                  <button
                    key={origin}
                    onClick={() => handleFilterChange('origin', origin)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ease-in-out
                      ${ filters.origin.includes(origin)
                        ? 'bg-amber-600 text-white shadow-md'
                        : 'bg-green-200 text-green-800 hover:bg-green-300'
                      }`}
                  >
                    {origin}
                  </button>
                ))}
              </div> */}

              {/* Quality Class Filter Badges */}
              <div className="flex flex-wrap gap-2 w-full md:w-auto">
                {filterOptions.qualityClasses.map(qc => (
                  <button
                    key={qc}
                    onClick={() => handleFilterChange('qualityClass', qc)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ease-in-out
                      ${ filters.qualityClass.includes(qc)
                        ? 'bg-amber-600 text-white shadow-md'
                        : 'bg-green-200 text-green-800 hover:bg-green-300'
                      }`}
                  >
                    {qc}
                  </button>
                ))}
              </div>

              {/* In Stock Filter Button */}
              <button
                onClick={() => handleFilterChange('inStock', null)} // Value doesn't matter for toggle
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
                  {products.map((product) => (
                    <motion.div
                      key={product.id}
                      variants={itemVariants}
                      className="group bg-white rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300 overflow-hidden cursor-pointer border border-gray-100 relative flex flex-col"
                    >
                      <div className="relative h-64 w-full flex-shrink-0"> {/* Fixed height for image container */}
                        <Image
                          src={product.imageUrls?.[0] || "https://placehold.co/600x400/E0E0E0/FFFFFF?text=No+Image"} // Fallback image
                          alt={product.name}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                          className="object-contain group-hover:scale-105 transition-transform duration-300 ease-in-out p-2" // Changed to object-contain and added padding
                        />
                        {!product.isAvailable && (
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
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-amber-700 text-2xl font-extrabold">
                            ₹{product.variants && product.variants.length > 0 ? product.variants[0].price : 'N/A'}
                          </span>
                          <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                            {product.unit}
                          </span>
                        </div>

                        {/* Origin and Quality Class Badges */}
                        <div className="flex flex-wrap gap-2 mb-3">
                          {product.origin && (
                            <span className="bg-emerald-100 text-emerald-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                              Origin: {product.origin}
                            </span>
                          )}
                          {/* Display all unique quality classes */}
                          {product.variants && product.variants.length > 0 && (
                            [...new Set(product.variants.map(v => v.qualityClass))].map((qc, idx) => (
                              <span key={idx} className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                                Quality: {qc}
                              </span>
                            ))
                          )}
                        </div>

                        {/* Rating and Reviews - Assuming these are part of DTO or derived */}
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
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                          <span className="text-xs">
                            ({product.reviews || 0} reviews)
                          </span>
                        </div>

                        {/* Add to Cart Button */}
                        {product.isAvailable && product.variants && product.variants.length > 0 ? (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation(); // Prevent card click from propagating
                                    // For simplicity, adding the first variant to cart.
                                    // In a real app, you might have a variant selector.
                                    addToCart(product, product.variants[0]);
                                }}
                                className="w-full bg-amber-600 text-white py-2 rounded-lg font-semibold hover:bg-amber-700 transition-colors duration-200 transform hover:scale-105 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
                            >
                                Add to Cart
                            </button>
                        ) : (
                            <button
                                disabled
                                className="w-full bg-gray-400 text-gray-700 py-2 rounded-lg font-semibold cursor-not-allowed opacity-70"
                            >
                                Out of Stock
                            </button>
                        )}
                      </div>
                    </motion.div>
                  ))}
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

      {/* Notification Toast */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.8 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-6 right-6 bg-green-700 text-white px-6 py-3 rounded-lg shadow-xl flex items-center gap-2 z-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{notification}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}