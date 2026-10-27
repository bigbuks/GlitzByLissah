import React, { useState } from 'react';
import {
  FiMail,
  FiPhone,
  FiMapPin,
  FiSend,
  FiInstagram,
  FiTwitter,
  FiFacebook,
} from 'react-icons/fi';
import { notify } from '../utils/notify';

const Contact = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Simulate submission (replace with real endpoint later)
    setTimeout(() => {
      notify.success("Message sent! We'll get back to you soon.");
      setFormData({ name: '', email: '', subject: '', message: '' });
      setLoading(false);
    }, 1200);
  };

  const contactInfo = [
    {
      icon: FiMail,
      title: 'Email Us',
      value: 'support@glitzbylissah.com',
      link: 'mailto:support@glitzbylissah.com',
    },
    {
      icon: FiPhone,
      title: 'Call Us',
      value: '+234 800 000 0000',
      link: 'tel:+2348000000000',
    },
    {
      icon: FiMapPin,
      title: 'Visit Us',
      value: 'Lagos, Nigeria',
      link: null,
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs md:text-sm tracking-[0.35em] uppercase text-yellow-600 mb-4 font-light">
            Get in Touch
          </p>
          <h1 className="font-serif text-4xl md:text-5xl mb-5">
            We'd Love to Hear From You
          </h1>
          <div className="mx-auto mb-6 h-px w-20 bg-gradient-to-r from-transparent via-yellow-500 to-transparent" />
          <p className="text-gray-600 max-w-2xl mx-auto font-light">
            Questions about an order, a product, or just want to say hi? Our
            team is here to help.
          </p>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="px-4 pb-12">
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4">
          {contactInfo.map((info) => {
            const Icon = info.icon;
            const content = (
              <div className="card-warm p-6 text-center hover:shadow-warm-lg hover:-translate-y-1 transition-all duration-300">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-100 to-amber-100 rounded-full flex items-center justify-center text-yellow-600 mx-auto mb-4 shadow-warm-sm">
                  <Icon size={22} />
                </div>
                <h3 className="font-serif text-lg mb-1">{info.title}</h3>
                <p className="text-sm text-gray-600">{info.value}</p>
              </div>
            );

            return info.link ? (
              <a key={info.title} href={info.link}>
                {content}
              </a>
            ) : (
              <div key={info.title}>{content}</div>
            );
          })}
        </div>
      </section>

      {/* Contact Form */}
      <section className="px-4 pb-20">
        <div className="max-w-2xl mx-auto card-warm p-6 md:p-8">
          <h2 className="font-serif text-2xl mb-6 text-center">
            Send Us a Message
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Your Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-yellow-500/15 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Your Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-yellow-500/15 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Subject
              </label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-yellow-500/15 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Message
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows="5"
                className="w-full px-4 py-3 border border-yellow-500/15 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-yellow-500 text-gray-900 py-3 rounded-xl font-semibold hover:bg-yellow-400 transition shadow-warm hover:shadow-warm-lg disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    />
                  </svg>
                  Sending...
                </>
              ) : (
                <>
                  <FiSend size={18} />
                  Send Message
                </>
              )}
            </button>
          </form>
        </div>
      </section>

      {/* Social */}
      <section className="px-4 pb-20">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-gray-500 mb-4">Or connect with us on social</p>
          <div className="flex justify-center gap-4">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-gray-600 hover:text-yellow-500 border border-yellow-500/15 hover:border-yellow-500/40 hover:shadow-warm transition-all duration-300"
            >
              <FiInstagram size={20} />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-gray-600 hover:text-yellow-500 border border-yellow-500/15 hover:border-yellow-500/40 hover:shadow-warm transition-all duration-300"
            >
              <FiTwitter size={20} />
            </a>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-gray-600 hover:text-yellow-500 border border-yellow-500/15 hover:border-yellow-500/40 hover:shadow-warm transition-all duration-300"
            >
              <FiFacebook size={20} />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;