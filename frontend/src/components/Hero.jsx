import React from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';

const Hero = () => {
  // ✅ Respect user's OS-level "reduce motion" setting
  const prefersReducedMotion = useReducedMotion();

  // ==========================================
  // TEXT STAGGER VARIANTS
  // ==========================================
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: prefersReducedMotion
        ? { duration: 0.01 }
        : {
            staggerChildren: 0.18,
            delayChildren: 0.3,
          },
    },
  };

  const itemVariants = {
    hidden: prefersReducedMotion
      ? { opacity: 1 }
      : { opacity: 0, y: 40, filter: 'blur(8px)' },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: prefersReducedMotion
        ? { duration: 0.01 }
        : { duration: 1, ease: [0.25, 0.4, 0.25, 1] },
    },
  };

  const lineVariants = {
    hidden: prefersReducedMotion
      ? { opacity: 1, scaleX: 1 }
      : { opacity: 0, scaleX: 0 },
    visible: {
      opacity: 1,
      scaleX: 1,
      transition: prefersReducedMotion
        ? { duration: 0.01 }
        : { duration: 1.2, delay: 0.9, ease: [0.25, 0.4, 0.25, 1] },
    },
  };

  // ==========================================
  // SPARKLE PARTICLES (skipped when reduced motion)
  // ==========================================
  const sparkles = prefersReducedMotion
    ? []
    : Array.from({ length: 14 }, (_, i) => ({
        id: i,
        left: `${8 + (i * 6.5) % 85}%`,
        top: `${15 + (i * 11) % 70}%`,
        size: 2 + (i % 3),
        delay: i * 0.4,
        duration: 5 + (i % 4),
      }));

  return (
    <div className="relative h-screen max-h-[750px] overflow-hidden">

      {/* ==========================================
          1. KEN BURNS BACKGROUND (static when reduced motion)
      ========================================== */}
      {prefersReducedMotion ? (
        <img
          src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80"
          alt="Luxury Jewelry Collection"
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <motion.img
          src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80"
          alt="Luxury Jewelry Collection"
          className="absolute inset-0 w-full h-full object-cover"
          initial={{ scale: 1.15, x: 0, y: 0 }}
          animate={{
            scale: 1.25,
            x: [0, -12, 0],
            y: [0, -8, 0],
          }}
          transition={{
            scale: { duration: 18, ease: 'linear' },
            x: { duration: 22, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' },
            y: { duration: 26, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' },
          }}
        />
      )}

      {/* ==========================================
          2. LAYERED GRADIENT OVERLAY
      ========================================== */}
      <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/60 via-black/55 to-black/80" />
      <div
        className="absolute inset-0 z-10"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.5) 100%)',
        }}
      />

      {/* ==========================================
          3. SPARKLE PARTICLES
      ========================================== */}
      {sparkles.length > 0 && (
        <div className="absolute inset-0 z-10 pointer-events-none">
          {sparkles.map((s) => (
            <motion.div
              key={s.id}
              className="absolute rounded-full bg-yellow-400/60"
              style={{
                left: s.left,
                top: s.top,
                width: s.size,
                height: s.size,
                boxShadow: '0 0 6px 1px rgba(234, 179, 8, 0.6)',
              }}
              animate={{
                y: [0, -40, -80],
                opacity: [0, 0.9, 0],
              }}
              transition={{
                duration: s.duration,
                delay: s.delay,
                repeat: Infinity,
                ease: 'easeOut',
              }}
            />
          ))}
        </div>
      )}

      {/* ==========================================
          4. CONTENT — STAGGERED REVEAL WITH BLUR
      ========================================== */}
      <div className="relative z-20 h-full flex items-center justify-center text-center text-white">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-4xl px-4"
        >

          {/* Headline */}
          <motion.h1
            variants={itemVariants}
            className="font-serif text-5xl md:text-7xl mb-6 leading-[1.05]"
          >
            Elegance to Perfection
          </motion.h1>

          {/* Animated gold divider */}
          <motion.div
            variants={lineVariants}
            className="mx-auto mb-7 h-px w-24 bg-gradient-to-r from-transparent via-yellow-400 to-transparent origin-center"
          />

          {/* Subtitle */}
          <motion.p
            variants={itemVariants}
            className="text-xl md:text-2xl mb-8 text-gray-200 font-light tracking-wide"
          >
            Discover our exquisite collection of handcrafted jewelry
          </motion.p>

          {/* CTA */}
          <motion.div variants={itemVariants} className="space-x-4">
            <Link
              to="/shop"
              className="group relative inline-block overflow-hidden bg-yellow-500 text-gray-900 px-10 py-3 rounded-full font-semibold transition-transform duration-300 hover:scale-105"
            >
              {/* Shine sweep on hover (still allowed — user-triggered) */}
              <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/40 to-transparent" />
              <span className="relative z-10">Shop Now</span>
            </Link>

            {/* <Link
              to="/collections"
              className="inline-block border-2 border-white text-white px-8 py-3 rounded-full font-semibold hover:bg-white hover:text-gray-900 transition transform hover:scale-105"
            >
              View Collections
            </Link> */}
          </motion.div>
        </motion.div>
      </div>

      {/* ==========================================
          5. SCROLL INDICATOR (no bounce when reduced motion)
      ========================================== */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          delay: prefersReducedMotion ? 0 : 2,
          duration: prefersReducedMotion ? 0.01 : 1,
        }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2"
      >
        <span className="text-[10px] tracking-[0.3em] uppercase text-white/50">
          Scroll
        </span>
        {prefersReducedMotion ? (
          <div className="w-[1px] h-8 bg-gradient-to-b from-yellow-400/80 to-transparent" />
        ) : (
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
            className="w-[1px] h-8 bg-gradient-to-b from-yellow-400/80 to-transparent"
          />
        )}
      </motion.div>

    </div>
  );
};

export default Hero;