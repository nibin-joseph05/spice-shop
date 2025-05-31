// components/cart/SuggestedProducts.js
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const SuggestedProducts = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchSuggestedProducts = async () => {
            setLoading(true);
            try {
                // Adjust the limit as needed to show more or fewer products
                const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/products?limit=4`);
                if (!response.ok) {
                    throw new Error('Failed to fetch suggested products');
                }
                const data = await response.json();
                setProducts(data.products);
            } catch (err) {
                setError(err.message);
                console.error('Suggested products fetch error:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchSuggestedProducts();
    }, []);

    if (loading) {
        return (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 animate-pulse">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-gray-100 rounded-lg p-4 space-y-3">
                        <div className="w-full h-32 bg-gray-200 rounded-md"></div>
                        <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
                    </div>
                ))}
            </div>
        );
    }

    if (error) {
        return <p className="text-red-600 text-center">Error loading suggestions: {error}</p>;
    }

    if (products.length === 0) {
        return <p className="text-gray-500 text-center">No suggested products available.</p>;
    }

    return (
        <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Popular Spices You Might Like</h2>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {products.map(product => (
                  <Link href={`/products/${product.id}`} key={product.id}>
                    <div className="block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden cursor-pointer">
                      <div className="relative w-full h-40">
                        <Image
                          src={product.imageUrls?.[0] || '/placeholder.jpg'}
                          alt={product.name}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">{product.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{product.origin}</p>
                        <p className="text-md font-bold text-amber-700 mt-2">
                          ₹{product.variants?.[0]?.packs?.[0]?.price?.toFixed(2) || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
            </div>
            <div className="text-center mt-10">
                <a
                    href="/shop"
                    className="px-8 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors transform hover:scale-105 inline-block font-medium"
                >
                    View All Spices
                </a>
            </div>
        </div>
    );
};

export default SuggestedProducts;