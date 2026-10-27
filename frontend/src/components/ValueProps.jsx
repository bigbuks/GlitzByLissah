import React from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, useReducedMotion } from 'framer-motion';
import {
  FiTruck,
  FiShield,
  FiAward,
  FiRefreshCw,
} from 'react-icons/fi';

const ValueProps = () => {
  const prefersReducedMotion = useReducedMotion();

  const valueProps = [
    {
      icon: FiTruck,
      title: 'Free Shipping',
      description: 'Free shipping on orders over $100',
    },
    {
      icon: FiShield,
      title: 'Secure Payment',
      description: 'Your payment information is always protected',
    },
    {
      icon: FiAward,
      title: 'Premium Quality',
      description: 'Beautiful jewelry made with quality materials',
    },
    {
      icon: FiRefreshCw,
      title: 'Easy Returns',
      description: 'Hassle-free returns within 30 days',
    },
  ];

  // ==========================================
  // MOTION VARIANTS
  // ==========================================
  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: prefersReducedMotion
        ? { duration: 0.01 }
        : { staggerChildren: 0.1, delayChildren: 0.05 },
    },
  };

  const item = {
    hidden: prefersReducedMotion
      ? { opacity: 1 }
      : { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: prefersReducedMotion
        ? { duration: 0.01 }
        : { duration: 0.7, ease: [0.25, 0.4, 0.25, 1] },
    },
  };

  return (
    <section className="py-14 md:py-16 bg-cream">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {valueProps.map((prop, index) => {
            const Icon = prop.icon;
            return (
              <motion.div
                key={index}
                variants={item}
                className="text-center group"
              >
                {/* Icon bubble with soft hover */}
                <motion.div
                  whileHover={prefersReducedMotion ? {} : { y: -4, scale: 1.05 }}
                  transition={{ duration: 0.35, ease: [0.25, 0.4, 0.25, 1] }}
                  className="flex justify-center mb-4"
                >
                  <div className="w-14 h-14 rounded-full bg-white shadow-sm flex items-center justify-center text-yellow-500 group-hover:shadow-md transition-shadow duration-500">
                    <Icon size={24} />
                  </div>
                </motion.div>

                <h3 className="font-semibold text-lg mb-2">
                  {prop.title}
                </h3>

                <p className="text-gray-600 text-sm max-w-[260px] mx-auto">
                  {prop.description}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default ValueProps;