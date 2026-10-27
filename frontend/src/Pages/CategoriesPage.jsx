import React from 'react';
import { Link } from 'react-router-dom';
import Categories from '../components/Categories';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';

const CategoriesPage = () => {
  return (
    <div className="min-h-screen">
      {/* ==========================================
          HERO — page intro
      ========================================== */}
      <div className="relative border-b border-yellow-500/10">
        <div className="max-w-7xl mx-auto px-4 py-16 sm:py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.25, 0.4, 0.25, 1] }}
            viewport={{ once: true }}
            className="text-center"
          >
            <p className="text-xs md:text-sm tracking-[0.35em] uppercase text-yellow-600 mb-4 font-light">
              Explore
            </p>
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl mb-5 text-gray-900 leading-tight">
              Our Categories
            </h1>
            <div className="mx-auto mb-6 h-px w-24 bg-gradient-to-r from-transparent via-yellow-500 to-transparent" />
            <p className="text-gray-600 text-base md:text-lg max-w-2xl mx-auto leading-relaxed font-light">
              Discover the perfect piece that speaks to you. From timeless
              classics to contemporary designs, explore our curated collections.
            </p>
          </motion.div>
        </div>
      </div>

      {/* ==========================================
          CATEGORIES GRID
          Rendered as-is — the component supplies its own
          section wrapper + header. This page just hands off.
      ========================================== */}
      <Categories />

      {/* ==========================================
          BOTTOM CTA
      ========================================== */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.25, 0.4, 0.25, 1] }}
        viewport={{ once: true }}
        className="relative overflow-hidden mt-16"
        style={{
          background:
            'linear-gradient(135deg, #F4C948 0%, #D4AF37 55%, #C9A227 100%)',
        }}
      >
        {/* Subtle radial highlight */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(255,255,255,0.25), transparent 60%)',
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 py-16 text-center">
          <h2 className="font-serif text-3xl md:text-4xl text-gray-900 mb-4">
            Can't Find What You're Looking For?
          </h2>
          <p className="text-gray-800/90 mb-8 max-w-2xl mx-auto font-light">
            Browse our complete collection or contact us for custom designs
            tailored just for you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/shop"
              className="inline-block bg-gray-900 text-white px-8 py-3 rounded-xl font-semibold hover:bg-gray-800 hover:shadow-warm-lg transition-all shadow-warm"
            >
              Browse All Products
            </Link>
            <Link
              to="/contact"
              className="inline-block bg-white text-gray-900 px-8 py-3 rounded-xl font-semibold hover:bg-cream border border-yellow-500/20 hover:border-yellow-500/40 transition-all shadow-warm-sm"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </motion.section>
    </div>
  );
};

export default CategoriesPage;