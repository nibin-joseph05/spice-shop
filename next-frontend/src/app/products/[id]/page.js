"use client";


import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Header from '@/components/home/Header';
import Footer from '@/components/home/Footer';
import RelatedProducts from '@/components/spice-detail/RelatedProducts';
import { motion, AnimatePresence } from 'framer-motion';
import { StarIcon, ShoppingCartIcon } from '@heroicons/react/24/solid';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

const scaleUp = {
  hidden: { scale: 0.95, opacity: 0 },
  visible: { scale: 1, opacity: 1, transition: { duration: 0.3 } }
};

export default function ProductDetails() {
  const { id } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedPack, setSelectedPack] = useState(null);
  const [mainImage, setMainImage] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [activeTab, setActiveTab] = useState('description');
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [relatedLoading, setRelatedLoading] = useState(true);
  const [isImageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const isMountedRef = useRef(false);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/check-session`, {
          credentials: 'include'
        });
        if (response.ok && isMountedRef.current) {
          setIsLoggedIn(true);
        }
      } catch (err) {
        console.error('Session check failed:', err);
      }
    };
    checkSession();
  }, []);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setImageLoading(true);
        setImageError(false);

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/spices/${id}`
        );

        if (!response.ok) throw new Error('Product not found');

        const data = await response.json();
        if (isMountedRef.current) {
          setProduct(data);
          setMainImage(data.imageUrls[0] || '');
          setSelectedVariant(data.variants[0]);
          setLoading(false);
        }
      } catch (err) {
        if (isMountedRef.current) {
          setError(err.message);
          setLoading(false);
        }
      }
    };

    fetchProduct();
  }, [id]);

  useEffect(() => {
    if (product) {
      setRelatedLoading(true);
      fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/spices/${id}/related`)
        .then(res => {
          if (!res.ok) throw new Error('Failed to fetch related products');
          return res.json();
        })
        .then(data => {
          if (isMountedRef.current) {
            setRelatedProducts(data);
            setRelatedLoading(false);
          }
        })
        .catch(err => {
          console.error(err);
          if (isMountedRef.current) {
            setRelatedLoading(false);
          }
        });
    }
  }, [product, id]);

  const handleImageLoad = () => {
    if (isMountedRef.current) {
      setImageLoading(false);
      setImageError(false);
    }
  };

  const handleImageError = () => {
    if (isMountedRef.current) {
      setImageLoading(false);
      setImageError(true);
    }
  };

  const handleAddToCart = async () => {
      if (!isLoggedIn) {
        setShowLoginPrompt(true);
        return;
      }

      if (!selectedPack) {
        toast.warn('Please select a pack size');
        return;
      }

      setAddingToCart(true);
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/cart/items`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            spicePackId: selectedPack.id,
            quantity: 1
          }),
          credentials: 'include'
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to add to cart');
        }

        toast.success('Item added to cart!', {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });


        router.push('/cart');
      } catch (error) {
        toast.error(error.message || 'Failed to add item to cart');
        console.error('Add to cart error:', error);
      } finally {
        setAddingToCart(false);
      }
    };

  const handlePackSelect = (pack) => {
    setSelectedPack(pack);
  };

  const handleThumbnailClick = (img) => {
    setMainImage(img);
    setImageLoading(true);
    setImageError(false);
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-6 py-12">
          <div className="animate-pulse bg-white p-8 rounded-xl shadow-lg">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="space-y-4">
                <div className="h-96 bg-gray-200 rounded-xl" />
                <div className="flex gap-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-20 w-20 bg-gray-200 rounded-lg" />
                  ))}
                </div>
              </div>
              <div className="space-y-6">
                <div className="h-8 bg-gray-200 w-3/4 rounded" />
                <div className="h-4 bg-gray-200 w-1/2 rounded" />
                <div className="h-12 bg-gray-200 w-full rounded" />
                <div className="h-32 bg-gray-200 rounded" />
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-6 py-24 text-center">
          <div className="max-w-md mx-auto bg-red-50 p-8 rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold text-red-800 mb-4">Product Not Found</h2>
            <p className="text-red-700 mb-6">{error}</p>
            <a
              href="/shop"
              className="inline-block px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
            >
              Back to Shop
            </a>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Header />

      <main className="container mx-auto px-4 lg:px-8 py-12">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          {/* Product Main Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
            {/* Enhanced Image Gallery */}
            <div className="space-y-6">
              <motion.div
                className="relative h-96 w-full bg-gray-100 rounded-xl overflow-hidden shadow-lg"
                whileHover={{ scale: 1.02 }}
              >
                {isImageLoading && !imageError && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-600"></div>
                  </div>
                )}

                {imageError ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-50 p-4">
                    <span className="text-red-600 text-lg font-medium mb-2">
                      Failed to load image
                    </span>
                    <button
                      onClick={() => {
                        setImageLoading(true);
                        setImageError(false);
                      }}
                      className="text-amber-600 hover:text-amber-700 font-medium"
                    >
                      Retry
                    </button>
                  </div>
                ) : (
                  <Image
                    src={mainImage}
                    alt={product.name}
                    fill
                    className={`object-cover transition-opacity duration-300 ${
                      isImageLoading ? 'opacity-0' : 'opacity-100'
                    }`}
                    priority
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    onLoad={handleImageLoad}
                    onError={handleImageError}
                  />
                )}
              </motion.div>

              <div className="flex flex-wrap gap-3">
                {product.imageUrls.map((img, index) => (
                  <motion.button
                    key={index}
                    onClick={() => handleThumbnailClick(img)}
                    whileHover={{ scale: 1.05 }}
                    className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                      mainImage === img
                        ? 'border-amber-600 scale-105 shadow-md'
                        : 'border-gray-200 hover:border-amber-400'
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`Thumbnail ${index + 1}`}
                      width={64}
                      height={64}
                      className="object-cover w-full h-full"
                      onError={(e) => {
                        e.target.src = '/placeholder-image.jpg';
                      }}
                    />
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Product Info Section */}
            <div className="space-y-6">
              <h1 className="text-4xl font-bold text-gray-900">{product.name}</h1>

              <div className="flex items-center gap-4">
                <div className="flex items-center bg-amber-100 px-4 py-2 rounded-full">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon
                      key={i}
                      className={`h-6 w-6 ${
                        i < (product.rating || 0)
                          ? 'text-amber-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-gray-600">
                  ({product.reviews?.length || 0} reviews)
                </span>
              </div>

              {product.origin && (
                <div className="inline-flex items-center bg-emerald-100 text-emerald-800 px-4 py-2 rounded-full">
                  <span className="text-sm font-semibold">Origin:</span>
                  <span className="ml-2 font-medium">{product.origin}</span>
                </div>
              )}

              {/* Variants Selection */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-900">Quality Class</h3>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((variant) => (
                    <motion.button
                      key={variant.id}
                      onClick={() => setSelectedVariant(variant)}
                      whileHover={{ y: -2 }}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        selectedVariant?.id === variant.id
                          ? 'bg-amber-600 text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {variant.qualityClass}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Pack Sizes */}
              {selectedVariant && (
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-gray-900">Available Sizes</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {selectedVariant.packs.map((pack) => (
                      <motion.button
                        key={pack.id}
                        onClick={() => !pack.stockQuantity || handlePackSelect(pack)}
                        disabled={!pack.stockQuantity}
                        whileHover={{ scale: 1.02 }}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${
                          selectedPack?.id === pack.id
                            ? 'border-amber-600 bg-amber-50 shadow-md'
                            : 'border-gray-200 hover:border-amber-400'
                        } ${!pack.stockQuantity ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <div className="font-semibold text-gray-900">
                          {pack.packWeightInGrams}g
                        </div>
                        <div className="text-2xl font-bold text-amber-700 mt-2">
                          ₹{pack.price.toFixed(2)}
                        </div>
                        <div className="text-sm mt-2">
                          {pack.stockQuantity > 0 ? (
                            <span className="text-green-600">
                              {pack.stockQuantity <= 10
                                ? `Only ${pack.stockQuantity} left!`
                                : 'In Stock'}
                            </span>
                          ) : (
                            <span className="text-red-600">Out of Stock</span>
                          )}
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {/* Add to Cart Section */}
              <div className="pt-6 border-t border-gray-200">
                  <motion.div
                    className="flex items-center gap-4"
                    variants={scaleUp}
                  >
                    <button
                      onClick={handleAddToCart}
                      disabled={!selectedPack || addingToCart}
                      className={`flex items-center gap-3 px-8 py-4 rounded-xl text-lg font-bold transition-all ${
                        selectedPack && !addingToCart
                          ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-lg hover:shadow-xl'
                          : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      <ShoppingCartIcon className="h-6 w-6" />
                      {addingToCart ? 'Adding...' : 'Add to Cart'}
                    </button>
                    {selectedPack && (
                      <div className="text-2xl font-bold text-gray-900">
                        ₹{(selectedPack.price).toFixed(2)}
                      </div>
                    )}
                  </motion.div>
              </div>
            </div>
          </div>

          {/* Tabs Section */}
          <div className="border-t border-gray-200">
            <div className="flex border-b border-gray-200">
              {['description', 'reviews'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-8 py-4 text-lg font-medium capitalize ${
                    activeTab === tab
                      ? 'text-amber-600 border-b-2 border-amber-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="p-8">
              <AnimatePresence mode='wait'>
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {activeTab === 'description' ? (
                    <div className="prose max-w-none">
                      <h3 className="text-2xl font-bold text-gray-900 mb-4">Product Details</h3>
                      <p className="text-gray-700 leading-relaxed">
                        {product.description}
                      </p>

                      <div className="grid md:grid-cols-2 gap-8 mt-8">
                        <div className="bg-gray-50 p-6 rounded-xl">
                          <h4 className="text-lg font-semibold mb-3">Storage Instructions</h4>
                          <ul className="list-disc pl-5 space-y-2 text-gray-600">
                            <li>Store in a cool, dry place (below 25°C)</li>
                            <li>Keep away from direct sunlight</li>
                            <li>Use airtight containers for best preservation</li>
                          </ul>
                        </div>

                        <div className="bg-gray-50 p-6 rounded-xl">
                          <h4 className="text-lg font-semibold mb-3">Shipping Info</h4>
                          <ul className="list-disc pl-5 space-y-2 text-gray-600">
                            <li>Free shipping on orders above ₹500</li>
                            <li>Usually ships within 24 hours</li>
                            <li>100% quality guarantee</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <h3 className="text-2xl font-bold text-gray-900">Customer Reviews</h3>

                      {product.reviews?.length > 0 ? (
                        product.reviews.map(review => (
                          <div key={review.id} className="bg-gray-50 p-6 rounded-xl">
                            <div className="flex items-center gap-4 mb-3">
                              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                                <span className="font-bold text-amber-600">
                                  {review.userName[0]}
                                </span>
                              </div>
                              <div>
                                <h4 className="font-semibold">{review.userName}</h4>
                                <div className="flex items-center gap-1">
                                  {[...Array(5)].map((_, i) => (
                                    <StarIcon
                                      key={i}
                                      className={`h-5 w-5 ${
                                        i < review.rating
                                          ? 'text-amber-400'
                                          : 'text-gray-300'
                                      }`}
                                    />
                                  ))}
                                </div>
                              </div>
                            </div>
                            <p className="text-gray-700">{review.comment}</p>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 bg-gray-50 rounded-xl">
                          <p className="text-gray-500 mb-4">
                            No reviews yet. Be the first to review this product!
                          </p>
                          <button className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700">
                            Write a Review
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Related Products Section */}
          <div className="mt-12 border-t border-gray-200 pt-8">
            {relatedLoading ? (
              <div className="text-center py-8">Loading related products...</div>
            ) : relatedProducts.length > 0 ? (
              <RelatedProducts products={relatedProducts} />
            ) : (
              <div className="text-center py-8 text-gray-500">
                No related products available
              </div>
            )}
          </div>

        </motion.div>

        {/* Login Prompt Modal */}
        <AnimatePresence>
          {showLoginPrompt && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center p-4"
              onClick={() => setShowLoginPrompt(false)}
            >
              <motion.div
                initial={{ y: 20 }}
                animate={{ y: 0 }}
                className="bg-white rounded-xl p-6 max-w-md w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-xl font-bold mb-4">Login Required</h3>
                <p className="text-gray-600 mb-6">
                  You need to be logged in to add items to your cart.
                </p>
                <div className="flex gap-4">
                  <button
                    onClick={() => setShowLoginPrompt(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    Cancel
                  </button>
                  <a
                    href="/my-account"
                    className="flex-1 px-4 py-2 bg-amber-600 text-white rounded-lg text-center hover:bg-amber-700"
                  >
                    Go to Login
                  </a>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
}