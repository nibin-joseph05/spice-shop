'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useState, useEffect } from 'react';

const remoteImages = [
  'https://images.unsplash.com/photo-1716816211590-c15a328a5ff0?q=80&w=2023&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  'https://images.unsplash.com/photo-1506368249639-73a05d6f6488?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
];

const fallbackImages = [
  '/home/main-image1.jpg',
  '/home/main-image2.avif',
  '/home/main-image3.avif'
];

const imageVariants = {
  enter: (direction) => ({
    opacity: 0,
    scale: 1.1,
    x: direction > 0 ? 100 : -100,
  }),
  center: {
    zIndex: 1,
    opacity: 1,
    scale: 1,
    x: 0,
  },
  exit: (direction) => ({
    zIndex: 0,
    opacity: 0,
    scale: 0.95,
    x: direction > 0 ? -100 : 100,
  }),
};

const textVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function HeroCarousel() {
  const [[current, direction], setCurrent] = useState([0, 0]);
  const [errorImages, setErrorImages] = useState([false, false, false]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent(([prev]) => [prev + 1, 1]);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleError = (index) => {
    setErrorImages(prev => {
      const newErrors = [...prev];
      newErrors[index] = true;
      return newErrors;
    });
  };

  const currentIndex = current % remoteImages.length;

  return (
    <section className="relative h-[70vh] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={current}
            custom={direction}
            variants={imageVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              duration: 1.2,
              ease: [0.33, 1, 0.68, 1],
            }}
            className="absolute inset-0"
          >
            <Image
              src={errorImages[currentIndex] ? fallbackImages[currentIndex] : remoteImages[currentIndex]}
              alt="Fresh Spices"
              fill
              priority
              className="object-cover object-center"
              onError={() => handleError(currentIndex)}
            />
            <motion.div
              className="absolute inset-0 bg-black/50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="text-center px-6 z-10 max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={textVariants}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <motion.h1
              className="text-3xl md:text-5xl font-semibold text-white mb-4 drop-shadow-2xl"
              variants={textVariants}
            >
              Premium Organic Spices from Kerala Hills
            </motion.h1>
            <motion.p
              className="text-lg md:text-2xl text-white mb-6 max-w-3xl mx-auto font-medium leading-relaxed drop-shadow-lg"
              variants={textVariants}
              transition={{ delay: 0.4 }}
            >
              Directly sourced from our family-owned farms. Experience the authentic flavors of Kerala with our chemical-free, sun-dried spices.
            </motion.p>
            <motion.button
              whileHover={{
                scale: 1.05,
                boxShadow: '0 8px 25px rgba(72, 133, 67, 0.4)'
              }}
              whileTap={{ scale: 0.95 }}
              className="bg-green-700 text-white font-semibold px-8 py-3 rounded-full text-lg md:text-xl relative overflow-hidden"
            >
              <span className="relative z-10">Shop Now</span>
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-green-600/30 to-transparent"
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'linear'
                }}
              />
            </motion.button>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Pagination Dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-10">
        {remoteImages.map((_, index) => (
          <motion.div
            key={index}
            className={`w-3 h-3 rounded-full cursor-pointer ${currentIndex === index ? 'bg-green-500' : 'bg-white/50'}`}
            onClick={() => setCurrent([index, index > currentIndex ? 1 : -1])}
            whileHover={{ scale: 1.2 }}
          />
        ))}
      </div>
    </section>
  );
}
