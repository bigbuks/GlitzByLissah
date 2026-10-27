// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion, useAnimationControls } from 'framer-motion';
import { FiShoppingCart, FiUser, FiSearch, FiMenu, FiX, FiHeart, FiChevronDown, FiFileText, FiLogOut, FiPackage, FiCheck } from 'react-icons/fi';
import LissahLogo from '../assets/LissahLogo.png';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useCurrency } from '../context/CurrencyContext';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);
  const [isMobileCurrencyOpen, setIsMobileCurrencyOpen] = useState(false);
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const { currency, setCurrency, currencies } = useCurrency();
  const navigate = useNavigate();

  // ==========================================
  // CART BOUNCE ANIMATION (replaces "added to cart" toast)
  // ==========================================
  const cartControls = useAnimationControls();
  const badgeControls = useAnimationControls();

  useEffect(() => {
    const handleCartAdded = () => {
      cartControls.start({
        scale: [1, 1.25, 0.95, 1.1, 1],
        rotate: [0, -12, 10, -6, 0],
        transition: { duration: 0.6, ease: 'easeOut' },
      });

      badgeControls.start({
        scale: [1, 1.5, 1],
        transition: { duration: 0.5, ease: 'easeOut' },
      });
    };

    window.addEventListener('cart:added', handleCartAdded);
    return () => window.removeEventListener('cart:added', handleCartAdded);
  }, [cartControls, badgeControls]);

  const checkAuthStatus = () => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setIsLoggedIn(true);
      setUser(JSON.parse(userData));
    } else {
      setIsLoggedIn(false);
      setUser(null);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    checkAuthStatus();
  }, []);

  useEffect(() => {
    const handleStorageChange = () => {
      checkAuthStatus();
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    checkAuthStatus();
  }, [window.location.pathname]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchTerm)}`);
      setIsSearchOpen(false);
      setSearchTerm('');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setUser(null);
    // Silent — the redirect is the feedback
    navigate('/');
    setIsMenuOpen(false);
  };

  const activeLinkStyle = ({ isActive }) => ({
    color: isActive ? '#eab308' : '#374151',
    transition: 'color 0.2s ease'
  });

  return (
    <nav className="bg-cream/90 backdrop-blur-md border-b border-yellow-500/10 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">

          {/* Logo */}
          <Link to="/" className="flex items-center flex-shrink-0">
            <img src={LissahLogo} className='w-16 md:w-20' alt="Lissah Logo" />
          </Link>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center space-x-6 xl:space-x-8">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `relative group py-2 transition-all duration-300 ${
                  isActive ? 'text-yellow-500' : 'text-gray-700 hover:text-yellow-500'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  Home
                  <span
                    className={`absolute bottom-0 left-0 h-0.5 bg-yellow-500 transition-all duration-300 ${
                      isActive ? 'w-full' : 'w-0 group-hover:w-full'
                    }`}
                  ></span>
                </>
              )}
            </NavLink>

            <NavLink
              to="/shop"
              className={({ isActive }) =>
                `relative group py-2 transition-all duration-300 ${
                  isActive ? 'text-yellow-500' : 'text-gray-700 hover:text-yellow-500'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  Shop
                  <span
                    className={`absolute bottom-0 left-0 h-0.5 bg-yellow-500 transition-all duration-300 ${
                      isActive ? 'w-full' : 'w-0 group-hover:w-full'
                    }`}
                  ></span>
                </>
              )}
            </NavLink>

            <NavLink
              to="/custom"
              className={({ isActive }) =>
                `relative group py-2 transition-all duration-300 ${
                  isActive ? 'text-yellow-500' : 'text-gray-700 hover:text-yellow-500'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  Custom
                  <span
                    className={`absolute bottom-0 left-0 h-0.5 bg-yellow-500 transition-all duration-300 ${
                      isActive ? 'w-full' : 'w-0 group-hover:w-full'
                    }`}
                  ></span>
                </>
              )}
            </NavLink>

            <NavLink
              to="/categories"
              className={({ isActive }) =>
                `relative group py-2 transition-all duration-300 ${
                  isActive ? 'text-yellow-500' : 'text-gray-700 hover:text-yellow-500'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  Categories
                  <span
                    className={`absolute bottom-0 left-0 h-0.5 bg-yellow-500 transition-all duration-300 ${
                      isActive ? 'w-full' : 'w-0 group-hover:w-full'
                    }`}
                  ></span>
                </>
              )}
            </NavLink>

            <NavLink
              to="/about"
              className={({ isActive }) =>
                `relative group py-2 transition-all duration-300 ${
                  isActive ? 'text-yellow-500' : 'text-gray-700 hover:text-yellow-500'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  About
                  <span
                    className={`absolute bottom-0 left-0 h-0.5 bg-yellow-500 transition-all duration-300 ${
                      isActive ? 'w-full' : 'w-0 group-hover:w-full'
                    }`}
                  ></span>
                </>
              )}
            </NavLink>

            <NavLink
              to="/contact"
              className={({ isActive }) =>
                `relative group py-2 transition-all duration-300 ${
                  isActive ? 'text-yellow-500' : 'text-gray-700 hover:text-yellow-500'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  Contact
                  <span
                    className={`absolute bottom-0 left-0 h-0.5 bg-yellow-500 transition-all duration-300 ${
                      isActive ? 'w-full' : 'w-0 group-hover:w-full'
                    }`}
                  ></span>
                </>
              )}
            </NavLink>
          </div>

          {/* Icons */}
          <div className="flex items-center gap-1 md:gap-2">

            {/* Currency Switcher - Desktop Only */}
            <div className="hidden lg:block relative">
              <button
                onClick={() => setIsCurrencyOpen(!isCurrencyOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/70 hover:bg-yellow-50 border border-yellow-500/20 hover:border-yellow-500/50 transition text-gray-700"
                aria-label="Change currency"
              >
                <span className="text-base leading-none">
                  {currencies[currency].flag}
                </span>
                <span className="text-xs font-semibold tracking-wide">
                  {currency}
                </span>
                <FiChevronDown
                  size={12}
                  className={`text-gray-400 transition-transform duration-200 ${
                    isCurrencyOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {isCurrencyOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsCurrencyOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-warm-lg border border-yellow-500/10 py-2 z-50 overflow-hidden">
                    <p className="px-4 py-1.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                      Select Currency
                    </p>
                    {Object.values(currencies).map((curr) => (
                      <button
                        key={curr.code}
                        onClick={() => {
                          setCurrency(curr.code);
                          setIsCurrencyOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 hover:bg-yellow-50 transition text-sm ${
                          currency === curr.code ? 'bg-yellow-50/60' : ''
                        }`}
                      >
                        <span className="text-lg leading-none">{curr.flag}</span>
                        <div className="flex-1 text-left">
                          <p className="font-medium text-gray-800 leading-tight">
                            {curr.label}
                          </p>
                          <p className="text-[11px] text-gray-400 leading-tight">
                            {curr.code}
                          </p>
                        </div>
                        {currency === curr.code && (
                          <FiCheck size={16} className="text-yellow-500" />
                        )}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Search Icon */}
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="text-gray-700 hover:text-yellow-500 transition p-1"
            >
              <FiSearch size={18} className="md:w-5 md:h-5" />
            </button>

            {/* Desktop Wishlist */}
            <Link
              to="/wishlist"
              className="hidden lg:block text-gray-700 hover:text-yellow-500 transition relative p-1"
            >
              <FiHeart size={20} />
              {wishlistCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-4.5 h-4.5 flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Desktop Profile - Hover Dropdown */}
            <div className="hidden lg:block relative group p-1">
              <button className="text-gray-700 hover:text-yellow-500 transition relative flex items-center gap-0.5 cursor-pointer">
                <FiUser size={20} />
                {isLoggedIn && (
                  <span className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                )}
                <FiChevronDown size={12} className="text-gray-400 group-hover:text-yellow-500 transition" />
              </button>

              {/* Hover Dropdown */}
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-warm-lg border border-yellow-500/10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 py-1 z-50">
                {isLoggedIn ? (
                  <>
                    {user && (
                      <div className="px-4 py-2 text-sm text-gray-700 border-b border-yellow-500/10">
                        <p className="font-medium">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    )}
                    <Link
                      to="/account"
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-yellow-50 transition text-sm"
                    >
                      <FiUser size={16} className="text-gray-500" />
                      <span>My Account</span>
                    </Link>
                    <Link
                      to="/orders"
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-yellow-50 transition text-sm"
                    >
                      <FiFileText size={16} className="text-gray-500" />
                      <span>My Orders</span>
                    </Link>
                    <div className="border-t border-yellow-500/10 my-1"></div>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 transition text-sm w-full text-left text-red-500"
                    >
                      <FiLogOut size={16} />
                      <span>Logout</span>
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-yellow-50 transition text-sm"
                    >
                      <FiUser size={16} className="text-gray-500" />
                      <span>Login</span>
                    </Link>
                    <div className="border-t border-yellow-500/10 my-1"></div>
                    <Link
                      to="/track-order"
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-yellow-50 transition text-sm"
                    >
                      <FiPackage size={16} className="text-gray-500" />
                      <span>Track Order</span>
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* Cart Icon — with bounce animation on add */}
            <Link
              to="/cart"
              className="text-gray-700 hover:text-yellow-500 transition relative p-1 flex items-center"
            >
              <motion.div animate={cartControls} className="flex items-center">
                <FiShoppingCart size={20} className="md:w-5 md:h-5" />
              </motion.div>
              {cartCount > 0 && (
                <motion.span
                  animate={badgeControls}
                  className="absolute -top-2 -right-2 bg-yellow-500 text-white text-[12px] rounded-full w-4 h-4 flex items-center justify-center"
                >
                  {cartCount}
                </motion.span>
              )}
            </Link>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden text-gray-700 hover:text-yellow-500 transition p-1"
            >
              {isMenuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
            </button>
          </div>
        </div>

        {/* Search Bar */}
        {isSearchOpen && (
          <div className="py-4 border-t border-yellow-500/10">
            <form onSubmit={handleSearch} className="flex gap-2">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search for jewelry..."
                className="w-full px-4 py-2 border border-yellow-500/20 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                autoFocus
              />
              <button
                type="submit"
                className="px-6 py-2 bg-yellow-500 text-gray-900 rounded-lg hover:bg-yellow-400 transition"
              >
                Search
              </button>
            </form>
          </div>
        )}

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden py-4 border-t border-yellow-500/10">
            <div className="flex flex-col space-y-3">
              <NavLink to="/" style={activeLinkStyle} className="py-2 transition" onClick={() => setIsMenuOpen(false)}>Home</NavLink>
              <NavLink to="/shop" style={activeLinkStyle} className="py-2 transition" onClick={() => setIsMenuOpen(false)}>Shop</NavLink>
              <NavLink to="/custom" style={activeLinkStyle} className="py-2 transition" onClick={() => setIsMenuOpen(false)}>Custom</NavLink>
              <NavLink to="/categories" style={activeLinkStyle} className="py-2 transition" onClick={() => setIsMenuOpen(false)}>Categories</NavLink>
              <NavLink to="/about" style={activeLinkStyle} className="py-2 transition" onClick={() => setIsMenuOpen(false)}>About</NavLink>
              <NavLink to="/contact" style={activeLinkStyle} className="py-2 transition" onClick={() => setIsMenuOpen(false)}>Contact</NavLink>

              {/* Mobile Menu - Divider */}
              <div className="border-t border-yellow-500/10 pt-3 mt-2">
                <Link
                  to="/wishlist"
                  className="flex items-center gap-3 py-2 text-gray-700 hover:text-yellow-500 transition"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <FiHeart size={18} />
                  <span>Wishlist</span>
                  {wishlistCount > 0 && (
                    <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">{wishlistCount}</span>
                  )}
                </Link>

                {isLoggedIn ? (
                  <>
                    <Link
                      to="/account"
                      className="flex items-center gap-3 py-2 text-gray-700 hover:text-yellow-500 transition"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <FiUser size={18} />
                      <span>My Account</span>
                    </Link>
                    <Link
                      to="/orders"
                      className="flex items-center gap-3 py-2 text-gray-700 hover:text-yellow-500 transition"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <FiFileText size={18} />
                      <span>My Orders</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 py-2 text-red-500 hover:text-red-600 transition w-full text-left"
                    >
                      <FiLogOut size={18} />
                      <span>Logout</span>
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="flex items-center gap-3 py-2 text-gray-700 hover:text-yellow-500 transition"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <FiUser size={18} />
                      <span>Login</span>
                    </Link>
                    <Link
                      to="/track-order"
                      className="flex items-center gap-3 py-2 text-gray-700 hover:text-yellow-500 transition"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <FiPackage size={18} />
                      <span>Track Order</span>
                    </Link>
                  </>
                )}

                {/* Mobile Currency Collapsible Dropdown - Compact */}
                <div className="border-t border-yellow-500/10 pt-3 mt-3">
                  <button
                    onClick={() => setIsMobileCurrencyOpen(!isMobileCurrencyOpen)}
                    className="w-full flex items-center justify-between py-1.5 text-gray-700 hover:text-yellow-500 transition"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base leading-none">
                        {currencies[currency].flag}
                      </span>
                      <span className="text-sm font-medium">Currency</span>
                      <span className="text-xs text-gray-400">({currency})</span>
                    </div>
                    <FiChevronDown
                      size={16}
                      className={`text-gray-400 transition-transform duration-200 ${
                        isMobileCurrencyOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {isMobileCurrencyOpen && (
                    <div className="mt-2 flex gap-2">
                      {Object.values(currencies).map((curr) => (
                        <button
                          key={curr.code}
                          onClick={() => {
                            setCurrency(curr.code);
                            setIsMobileCurrencyOpen(false);
                          }}
                          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-full border transition text-xs font-medium ${
                            currency === curr.code
                              ? 'bg-yellow-500 text-gray-900 border-yellow-500'
                              : 'bg-white/70 text-gray-600 border-yellow-500/20 hover:border-yellow-500/50'
                          }`}
                        >
                          <span className="text-sm leading-none">{curr.flag}</span>
                          <span>{curr.code}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;