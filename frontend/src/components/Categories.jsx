import React, { useState, useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';
import api from '../utils/api';

const categories = [
  {
    name: 'Rings',
    slug: 'rings',
    image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    path: '/category/rings',
  },
  {
    name: 'Necklaces',
    slug: 'necklaces',
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    path: '/category/necklaces',
  },
  {
    name: 'Earrings',
    slug: 'earrings',
    image: 'https://images.unsplash.com/photo-1635767798638-3e25273a8236?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    path: '/category/earrings',
  },
  {
    name: 'Bracelets',
    slug: 'bracelets',
    image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    path: '/category/bracelets',
  },
];

const Categories = () => {
  const prefersReducedMotion = useReducedMotion();
  const [counts, setCounts] = useState(null); // null = loading, {} = loaded

  // ==========================================
  // FETCH CATEGORY COUNTS FROM BACKEND
  // ==========================================
  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const response = await api.get('/products/categories/counts');
        if (response.data.success) {
          setCounts(response.data.counts || {});
        } else {
          setCounts({});
        }
      } catch (error) {
        console.error('❌ Category counts error:', error);
        setCounts({}); // stop the loader, hide counts gracefully
      }
    };
    fetchCounts();
  }, []);

  // ==========================================
  // COUNT FORMATTER
  // null → hide (still loading)
  // 0 → hide (avoid "0 pieces")
  // 1 → "1 piece"
  // n → "n pieces"
  // ==========================================
  const getCountLabel = (slug) => {
    if (!counts) return null;
    const n = counts[slug] || 0;
    if (n === 0) return null;
    return `${n} ${n === 1 ? 'piece' : 'pieces'}`;
  };

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

  const tileVariant = {
    hidden: prefersReducedMotion
      ? { opacity: 1 }
      : (i) => ({
          opacity: 0,
          y: 50,
          x: i % 2 === 0 ? -30 : 30,
        }),
    visible: (i) => ({
      opacity: 1,
      y: 0,
      x: 0,
      transition: prefersReducedMotion
        ? { duration: 0.01 }
        : {
            delay: i * 0.12,
            duration: 0.9,
            ease: [0.25, 0.4, 0.25, 1],
          },
    }),
  };

  return (
    <section className="py-16 md:py-20 bg-cream">
      <div className="max-w-7xl mx-auto px-4">

        {/* SECTION HEADER */}
        <motion.div
          variants={headerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="text-center mb-14"
        >
          <motion.p
            variants={headerItem}
            className="text-xs md:text-sm tracking-[0.35em] uppercase text-yellow-600 mb-4 font-light"
          >
            Curated Collections
          </motion.p>

          <motion.h2
            variants={headerItem}
            className="font-serif text-4xl md:text-5xl mb-5 leading-tight"
          >
            Shop by Category
          </motion.h2>

          <motion.div
            variants={lineVariant}
            className="mx-auto mb-6 h-px w-20 bg-gradient-to-r from-transparent via-yellow-500 to-transparent origin-center"
          />

          <motion.p
            variants={headerItem}
            className="text-gray-600 max-w-2xl mx-auto font-light"
          >
            Explore our exquisite collections crafted with precision and passion
          </motion.p>
        </motion.div>

        {/* CATEGORY TILES */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category, index) => {
            const countLabel = getCountLabel(category.slug);

            return (
              <motion.div
                key={category.slug}
                custom={index}
                variants={tileVariant}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                className="group"
              >
                <Link to={category.path} className="block">
                  <motion.div
                    whileHover={prefersReducedMotion ? {} : { y: -6 }}
                    transition={{ duration: 0.4, ease: [0.25, 0.4, 0.25, 1] }}
                    className="relative aspect-square overflow-hidden rounded-2xl shadow-sm hover:shadow-xl transition-shadow duration-500"
                  >
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-110"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent transition-opacity duration-500 group-hover:from-black/85" />

                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                      <div className="mb-3 h-px w-8 bg-yellow-400 origin-left scale-x-100 group-hover:scale-x-[2.5] transition-transform duration-500" />

                      <h3 className="font-serif text-2xl mb-1 transition-transform duration-500 group-hover:-translate-y-0.5">
                        {category.name}
                      </h3>

                      <div className="flex items-center justify-between">
                        {/* Real count — hidden while loading, hidden when 0 */}
                        {countLabel ? (
                          <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.4 }}
                            className="text-sm text-gray-200"
                          >
                            {countLabel}
                          </motion.p>
                        ) : (
                          <span />
                        )}

                        <FiArrowRight
                          size={18}
                          className="text-yellow-400 opacity-0 -translate-x-2 transition-all duration-500 group-hover:opacity-100 group-hover:translate-x-0 ml-auto"
                        />
                      </div>
                    </div>
                  </motion.div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Categories;