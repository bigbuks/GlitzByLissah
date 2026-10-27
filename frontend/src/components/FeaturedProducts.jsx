import React, { useState, useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';
import ProductCard from './ProductCard';
import api from '../utils/api';

const FeaturedProducts = () => {
  const prefersReducedMotion = useReducedMotion();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const response = await api.get('/products');

        if (response.data.success) {
          const featured = response.data.products.slice(0, 4);
          setProducts(featured);
        }
      } catch (error) {
        console.error('Error fetching featured products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchFeaturedProducts();
  }, []);

  // ==========================================
  // MOTION VARIANTS
  // ==========================================
  const headerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: prefersReducedMotion
        ? { duration: 0.01 }
        : { staggerChildren: 0.15, delayChildren: 0.1 },
    },
  };

  const headerItem = {
    hidden: prefersReducedMotion
      ? { opacity: 1 }
      : { opacity: 0, y: 30, filter: 'blur(6px)' },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: prefersReducedMotion
        ? { duration: 0.01 }
        : { duration: 0.9, ease: [0.25, 0.4, 0.25, 1] },
    },
  };

  const lineVariant = {
    hidden: prefersReducedMotion ? { scaleX: 1, opacity: 1 } : { scaleX: 0, opacity: 0 },
    visible: {
      scaleX: 1,
      opacity: 1,
      transition: prefersReducedMotion
        ? { duration: 0.01 }
        : { duration: 1.1, ease: [0.25, 0.4, 0.25, 1] },
    },
  };

  const cardVariant = {
    hidden: prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 40 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: prefersReducedMotion
        ? { duration: 0.01 }
        : {
            delay: i * 0.12,
            duration: 0.8,
            ease: [0.25, 0.4, 0.25, 1],
          },
    }),
  };

  // ==========================================
  // LOADING / EMPTY STATES
  // ==========================================
  if (loading) {
    return (
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading featured products...</p>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return (
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-600">No featured products available.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 md:py-20">
      <div className="max-w-7xl mx-auto px-4">

        {/* ==========================================
            SECTION HEADER — eyebrow + headline + divider + subtitle
        ========================================== */}
        <motion.div
          variants={headerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="text-center mb-14"
        >
          {/* Eyebrow */}
          <motion.p
            variants={headerItem}
            className="text-xs md:text-sm tracking-[0.35em] uppercase text-yellow-600 mb-4 font-light"
          >
            Handpicked for You
          </motion.p>

          {/* Headline */}
          <motion.h2
            variants={headerItem}
            className="font-serif text-4xl md:text-5xl mb-5 leading-tight"
          >
            Featured Products
          </motion.h2>

          {/* Gold divider */}
          <motion.div
            variants={lineVariant}
            className="mx-auto mb-6 h-px w-20 bg-gradient-to-r from-transparent via-yellow-500 to-transparent origin-center"
          />

          {/* Subtitle */}
          <motion.p
            variants={headerItem}
            className="text-gray-600 max-w-2xl mx-auto font-light"
          >
            Discover our most loved pieces, carefully selected for you
          </motion.p>
        </motion.div>

        {/* ==========================================
            PRODUCTS GRID — staggered blur reveal
        ========================================== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product, index) => (
            <motion.div
              key={product._id}
              custom={index}
              variants={cardVariant}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>

        {/* ==========================================
            VIEW ALL — arrow slides on hover
        ========================================== */}
        <motion.div
          initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={
            prefersReducedMotion
              ? { duration: 0.01 }
              : { delay: 0.5, duration: 0.7, ease: [0.25, 0.4, 0.25, 1] }
          }
          viewport={{ once: true }}
          className="text-center mt-14"
        >
          <Link
            to="/shop"
            className="group inline-flex items-center gap-2 bg-gray-900 text-white px-8 py-3 rounded-full font-semibold hover:bg-yellow-500 hover:text-gray-900 transition-all duration-300"
          >
            <span>View All Products</span>
            <FiArrowRight
              size={16}
              className="transform transition-transform duration-300 group-hover:translate-x-1"
            />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturedProducts;