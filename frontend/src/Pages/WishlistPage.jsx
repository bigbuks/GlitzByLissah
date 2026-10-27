import React from 'react';
import { Link } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { FiHeart, FiShoppingCart, FiTrash2 } from 'react-icons/fi';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';
import { notify } from '../utils/notify';

const WishlistPage = () => {
  const { wishlistItems, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { formatPrice } = useCurrency();

  const handleAddToCart = (product) => {
    // Rings need a size — direct the user to the product page
    if (product.category.toLowerCase() === 'rings') {
      notify.info('Please select a size on the product page');
      return;
    }

    // CartContext fires the navbar bounce — no toast needed
    addToCart(product, null, 1);
  };

  const handleRemoveFromWishlist = (productId) => {
    // Silent — the item disappearing from the grid is the feedback
    removeFromWishlist(productId);
  };

  if (wishlistItems.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-white rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6 shadow-warm-lg border border-yellow-500/10">
            <FiHeart size={48} className="text-yellow-500/60" />
          </div>
          <h2 className="text-2xl font-serif mb-3">Your wishlist is empty</h2>
          <p className="text-gray-600 mb-8">
            Save your favorite jewelry pieces here to easily find them later.
          </p>
          <Link
            to="/shop"
            className="inline-block bg-yellow-500 text-gray-900 px-8 py-3 rounded-lg font-semibold hover:bg-yellow-400 transition"
          >
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="font-serif text-3xl md:text-4xl mb-2">My Wishlist</h1>
            <p className="text-gray-600">
              You have {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} saved
            </p>
          </div>
          <button
            onClick={() => {
              clearWishlist();
              // toast.info('Wishlist cleared');
            }}
            className="mt-4 sm:mt-0 text-sm text-gray-500 hover:text-red-500 transition flex items-center gap-1"
          >
            <FiTrash2 size={14} />
            Clear All
          </button>
        </div>

        {/* Wishlist Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlistItems.map((product, index) => (
            <motion.div
              key={product.id || product._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="group card-warm overflow-hidden hover:shadow-warm-lg transition-shadow"
            >
              {/* Product Image */}
              <Link to={`/product/${product.id || product._id}`}>
                <div className="relative aspect-square overflow-hidden bg-gray-100">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                  />
                  
                  {/* Quick action buttons */}
                  <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition duration-300 bg-white bg-opacity-90 py-3 flex justify-center space-x-4">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleAddToCart(product);
                      }}
                      className="p-2 hover:text-yellow-500 transition transform hover:scale-110"
                      aria-label="Add to cart"
                    >
                      <FiShoppingCart size={20} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleRemoveFromWishlist(product.id || product._id, product.name);
                      }}
                      className="p-2 text-red-500 hover:text-red-600 transition transform hover:scale-110"
                      aria-label="Remove from wishlist"
                    >
                      <FiTrash2 size={20} />
                    </button>
                  </div>

                  {/* Category Tag */}
                  <span className="absolute top-2 left-2 bg-white px-3 py-1 text-xs font-semibold rounded-full shadow-warm-sm border border-yellow-500/10">
                    {product.category}
                  </span>
                </div>
              </Link>

              {/* Product Info */}
              <div className="p-4">
                <Link to={`/product/${product.id || product._id}`}>
                  <h3 className="font-serif font-semibold text-lg mb-2 hover:text-yellow-500 transition line-clamp-2">
                    {product.name}
                  </h3>
                </Link>
                <div className="flex items-center justify-between">
                  <p className="text-gray-600 font-medium">
                    {formatPrice(product.price)}
                  </p>
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="text-sm bg-yellow-500 text-gray-900 px-3 py-1.5 rounded hover:bg-yellow-400 transition"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Continue Shopping Button */}
        <div className="text-center mt-12">
          <Link
            to="/shop"
            className="inline-block bg-white border border-yellow-500/20 text-gray-700 px-8 py-3 rounded-lg font-medium hover:bg-yellow-50 hover:border-yellow-500/40 transition shadow-warm-sm"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default WishlistPage;