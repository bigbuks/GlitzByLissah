import React from 'react';
import { Link } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import {
  FiHeart,
  FiAward,
  FiPackage,
  FiUsers,
  FiArrowRight,
} from 'react-icons/fi';

const About = () => {
  const values = [
    {
      icon: FiAward,
      title: 'Premium Quality',
      description:
        'Every piece is crafted with the finest materials and meticulous attention to detail.',
    },
    {
      icon: FiHeart,
      title: 'Made with Love',
      description:
        'Each design is thoughtfully created to celebrate life\u2019s special moments.',
    },
    {
      icon: FiPackage,
      title: 'Ethical Sourcing',
      description:
        'We work only with suppliers who share our commitment to ethical practices.',
    },
    {
      icon: FiUsers,
      title: 'Customer First',
      description:
        'Your satisfaction is our priority. We\u2019re here for you every step of the way.',
    },
  ];

  const stats = [
    { number: '5,000+', label: 'Happy Customers' },
    { number: '200+', label: 'Unique Designs' },
    { number: '4.9★', label: 'Average Rating' },
    { number: '24/7', label: 'Customer Support' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-yellow-600 font-medium mb-3 tracking-wider uppercase text-sm">
              Our Story
            </p>
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl mb-6">
              Timeless Elegance, Crafted for You
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed">
              GlitzByLissah was born from a simple belief: jewelry should tell
              your story. Every piece we create is a celebration of life's
              beautiful moments — an engagement, an anniversary, or simply the
              joy of treating yourself.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
        <section className="py-12 px-4 bg-gradient-to-r from-yellow-500 via-amber-400 to-yellow-500 relative overflow-hidden">
        {/* Subtle dot texture */}
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-10 mix-blend-overlay pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle, #fff 1px, transparent 1px)",
            backgroundSize: '24px 24px',
          }}
        />
        <div className="relative max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center text-gray-900">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
            >
              <p className="font-serif text-3xl md:text-4xl font-bold mb-1">
                {stat.number}
              </p>
              <p className="text-sm text-gray-800">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Our Values */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl md:text-4xl mb-3">
              What We Stand For
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Every piece we create is guided by values that put quality and
              people first.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, i) => {
              const Icon = value.icon;
              return (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className="card-warm p-6 hover:shadow-warm-lg transition"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-100 to-amber-100 rounded-xl flex items-center justify-center text-yellow-600 mb-4 shadow-warm-sm">
                    <Icon size={22} />
                  </div>
                  <h3 className="font-serif text-lg mb-2">{value.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {value.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-gray-900 text-white relative overflow-hidden">
        {/* Soft gold glow in corners */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 60% 50% at 0% 100%, rgba(212,175,55,0.15), transparent 60%), radial-gradient(ellipse 60% 50% at 100% 0%, rgba(212,175,55,0.12), transparent 60%)',
          }}
        />
        <div className="relative max-w-3xl mx-auto text-center">
          <h2 className="font-serif text-3xl md:text-4xl mb-4">
            Ready to find your perfect piece?
          </h2>
          <p className="text-gray-300 mb-8">
            Explore our collection and discover jewelry that speaks to you.
          </p>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 bg-yellow-500 text-gray-900 px-8 py-3.5 rounded-xl font-semibold hover:bg-yellow-400 transition shadow-warm-lg"
          >
            Shop the Collection
            <FiArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default About;