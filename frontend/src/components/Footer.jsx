import React from 'react';
import { Link } from 'react-router-dom';
import { FaInstagram, FaTiktok, FaWhatsapp } from 'react-icons/fa';
import LissahLogo from '../assets/LissahLogo.png';

const Footer = () => {
  return (
    <footer
      className="text-white border-t border-yellow-500/20 relative overflow-hidden"
      style={{ backgroundColor: '#1A1614' }}
    >
      {/* Soft gold glow in corners — adds depth to the dark */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 50% 60% at 0% 0%, rgba(212,175,55,0.10), transparent 60%), radial-gradient(ellipse 50% 60% at 100% 100%, rgba(212,175,55,0.07), transparent 60%)',
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">

          {/* About Section */}
          <div>
            <img src={LissahLogo} className="w-25 mb-4" alt="Logo" />
            <p className="text-gray-400 text-sm leading-relaxed">
              Crafting timeless elegance since 2024. Each piece tells a unique
              story of beauty and sophistication.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-serif text-lg mb-4 text-yellow-500/90">
              Shop
            </h4>
            <ul className="space-y-2.5 text-gray-400 text-sm">
              <li>
                <Link to="/shop" className="hover:text-yellow-400 transition">
                  Shop All
                </Link>
              </li>
              <li>
                <Link to="/category/rings" className="hover:text-yellow-400 transition">
                  Rings
                </Link>
              </li>
              <li>
                <Link to="/category/necklaces" className="hover:text-yellow-400 transition">
                  Necklaces
                </Link>
              </li>
              <li>
                <Link to="/category/earrings" className="hover:text-yellow-400 transition">
                  Earrings
                </Link>
              </li>
              <li>
                <Link
                  to="/custom"
                  className="hover:text-yellow-400 transition text-yellow-500/90 inline-flex items-center gap-1"
                >
                  Custom Design
                  <span aria-hidden="true">→</span>
                </Link>
              </li>
              <li>
                <Link to="/categories" className="hover:text-yellow-400 transition">
                  All Categories
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="font-serif text-lg mb-4 text-yellow-500/90">
              Support
            </h4>
            <ul className="space-y-2.5 text-gray-400 text-sm">
              <li>
                <Link to="/contact" className="hover:text-yellow-400 transition">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/track-order" className="hover:text-yellow-400 transition">
                  Track Order
                </Link>
              </li>
              <li>
                <Link to="/orders" className="hover:text-yellow-400 transition">
                  My Orders
                </Link>
              </li>
              <li>
                <Link to="/wishlist" className="hover:text-yellow-400 transition">
                  Wishlist
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-yellow-400 transition">
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="font-serif text-lg mb-4 text-yellow-500/90">
              Connect
            </h4>
            <p className="text-gray-400 text-sm mb-5 leading-relaxed">
              Follow us for new collections, styling inspiration, and exclusive
              offers.
            </p>
            <div className="flex space-x-3">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-yellow-500/20 text-gray-300 hover:text-yellow-400 transition-all duration-300 border border-white/5 hover:border-yellow-500/30"
              >
                <FaInstagram size={18} />
              </a>
              <a
                href="https://tiktok.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok"
                className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-yellow-500/20 text-gray-300 hover:text-yellow-400 transition-all duration-300 border border-white/5 hover:border-yellow-500/30"
              >
                <FaTiktok size={18} />
              </a>
              <a
                href="https://wa.me/2348000000000"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-yellow-500/20 text-gray-300 hover:text-yellow-400 transition-all duration-300 border border-white/5 hover:border-yellow-500/30"
              >
                <FaWhatsapp size={18} />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-yellow-500/15 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-gray-500 text-xs">
          <p>
            &copy; {new Date().getFullYear()} GlitzByLissah. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;