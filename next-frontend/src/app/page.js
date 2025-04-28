// app/page.js
'use client';

import { motion } from 'framer-motion';
import Header from '@/components/home/Header';
import Footer from '@/components/home/Footer';
import HeroCarousel from '@/components/home/HeroCarousel';
import Image from 'next/image';

const products = [
  {
    name: 'Cardamom (100gm)',
    prices: ['Class 1 - ₹500', 'Class 2 - ₹450', 'Class 3 - ₹300'],
    image: '/cardamom.jpg'
  },
  {
    name: 'Black Pepper (100gm)',
    prices: ['Class 1 - ₹140', 'Class 2 - ₹90'],
    image: '/pepper.jpg'
  },
  // Add other products
];

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
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow">
        <HeroCarousel />

        {/* Featured Products */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-6">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "0px 0px -100px 0px" }}
              className="text-3xl font-bold text-center text-green-900 mb-12 relative"
            >
              <span className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-amber-700"></span>
              Our Best Selling Products
            </motion.h2>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "0px 0px -100px 0px" }}
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
            >
              {products.map((product, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 group overflow-hidden"
                >
                  <div className="relative overflow-hidden">
                    <Image
                      src={product.image}
                      alt={product.name}
                      width={400}
                      height={300}
                      className="rounded-t-lg h-64 object-cover transform group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                      {product.name.split('(')[0]}
                    </h3>
                    <div className="space-y-2 mb-4">
                      {product.prices.map((price, i) => (
                        <div
                          key={i}
                          className="flex justify-between items-center bg-green-50 p-3 rounded-lg"
                        >
                          <span className="text-green-700 font-medium">
                            {price.split(' - ')[0]}
                          </span>
                          <span className="text-amber-700 font-bold">
                            {price.split(' - ')[1]}
                          </span>
                        </div>
                      ))}
                    </div>
                    <button className="w-full bg-amber-700 text-white px-4 py-3 rounded-full hover:bg-amber-800 transition-colors duration-300 transform hover:-translate-y-1">
                      Add to Cart
                    </button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Quality Section */}
        <section className="bg-green-900 text-white py-16">
          <div className="container mx-auto px-6 text-center">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "0px 0px -100px 0px" }}
              className="text-3xl font-bold mb-6 relative"
            >
              <span className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-amber-700"></span>
              Why Choose Us?
            </motion.h2>

            <div className="grid md:grid-cols-3 gap-8 mt-12">
              {[
                {
                  icon: '🌱',
                  title: '100% Organic',
                  text: 'Certified organic farming practices'
                },
                {
                  icon: '✈️',
                  title: 'Fast Shipping',
                  text: 'Pan-India delivery within 3-5 days'
                },
                {
                  icon: '💎',
                  title: 'Premium Quality',
                  text: 'Handpicked and carefully processed'
                }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, margin: "0px 0px -100px 0px" }}
                  className="p-6 bg-green-800/30 rounded-xl hover:bg-green-800/50 transition-colors duration-300"
                >
                  <div className="text-5xl mb-4 hover:scale-110 transition-transform duration-300">
                    {item.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                  <p className="text-green-100">{item.text}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}