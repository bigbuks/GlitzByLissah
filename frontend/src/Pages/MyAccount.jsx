import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FiUser,
  FiMail,
  FiFileText,
  FiHeart,
  FiLogOut,
  FiPackage,
  FiShoppingBag,
} from 'react-icons/fi';
import { notify } from '../utils/notify';
import { useWishlist } from '../context/WishlistContext';

const MyAccount = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { wishlistCount } = useWishlist();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      notify.error('Please login first');
      navigate('/login');
      return;
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUser(JSON.parse(userData));
    setLoading(false);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    notify.success('Logged out successfully');
    navigate('/');
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  // Get first letter of name or email for avatar
  const avatarLetter =
    user.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || '?';

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-serif text-3xl md:text-4xl mb-2">My Account</h1>
          <p className="text-gray-600">Manage your profile and orders</p>
        </div>

        {/* Profile Card */}
        <div className="card-warm p-6 md:p-8 mb-6">
          {/* Mobile: Stack vertically, Desktop: Side by side */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
            {/* Top row on mobile: Avatar + Logout */}
            <div className="flex items-center justify-between gap-4 sm:contents">
              {/* Avatar */}
              <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-warm-lg flex-shrink-0">
                {avatarLetter}
              </div>

              {/* Logout Button - top-right on mobile, right side on desktop */}
              <button
                onClick={handleLogout}
                className="sm:order-last flex items-center gap-2 border border-red-300/70 bg-white text-red-500 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl font-medium hover:bg-red-50 hover:border-red-400 transition text-sm sm:text-base flex-shrink-0 shadow-warm-sm"
              >
                <FiLogOut size={16} />
                Logout
              </button>
            </div>

            {/* User Info */}
            <div className="flex-1 min-w-0">
              <h2 className="font-serif text-2xl mb-1 break-words">
                {user.name ? `Welcome, ${user.name}` : 'Welcome'}
              </h2>
              <div className="flex items-center gap-2 text-gray-500 text-sm">
                <FiMail size={14} className="flex-shrink-0" />
                <span className="break-all">{user.email}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link
            to="/orders"
            className="group card-warm p-6 hover:shadow-warm-lg hover:-translate-y-1 transition-all duration-300"
          >
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center text-yellow-600 mb-4 group-hover:bg-yellow-500 group-hover:text-white transition">
              <FiFileText size={22} />
            </div>
            <h3 className="font-serif text-lg mb-1">My Orders</h3>
            <p className="text-sm text-gray-500">Track and manage your orders</p>
          </Link>

          <Link
            to="/wishlist"
            className="group card-warm p-6 hover:shadow-warm-lg hover:-translate-y-1 transition-all duration-300"
          >
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center text-red-500 mb-4 group-hover:bg-red-500 group-hover:text-white transition">
              <FiHeart size={22} />
            </div>
            <h3 className="font-serif text-lg mb-1">My Wishlist</h3>
            <p className="text-sm text-gray-500">
              {wishlistCount} {wishlistCount === 1 ? 'item' : 'items'} saved
            </p>
          </Link>

          <Link
            to="/track-order"
            className="group card-warm p-6 hover:shadow-warm-lg hover:-translate-y-1 transition-all duration-300"
          >
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 mb-4 group-hover:bg-blue-500 group-hover:text-white transition">
              <FiPackage size={22} />
            </div>
            <h3 className="font-serif text-lg mb-1">Track Order</h3>
            <p className="text-sm text-gray-500">Find your order status</p>
          </Link>
        </div>

        {/* Continue Shopping */}
        <div className="mt-8 text-center">
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 bg-yellow-500 text-gray-900 px-8 py-3 rounded-xl font-semibold hover:bg-yellow-400 hover:shadow-warm-lg transition shadow-warm"
          >
            <FiShoppingBag size={18} />
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MyAccount;