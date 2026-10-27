import React from 'react';
import { Link } from 'react-router-dom';
import { FiShoppingCart, FiHeart } from 'react-icons/fi';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useCurrency } from '../context/CurrencyContext';
import { notify } from '../utils/notify';

const ProductCard = ({ product }) => {
  // ✅ Use _id from MongoDB, fallback to id
  const productId = product._id || product.id;
  const { name, price, image, category } = product;
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { formatPrice } = useCurrency();
  const isWishlisted = isInWishlist(productId);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Rings need a size — direct them to the product page
    if (category?.toLowerCase() === 'rings') {
      notify.info('Please select a size on the product page');
      return;
    }

    // CartContext fires the navbar bounce — no toast needed
    addToCart(product, null, 1);
  };

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Silent — the heart icon fill is the feedback
    if (isWishlisted) {
      removeFromWishlist(productId);
    } else {
      addToWishlist(product);
    }
  };

  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
      className="group bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-lg transition-shadow"
    >
      <Link to={`/product/${productId}`}>
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
          />

          {/* Quick action buttons */}
          <div className="absolute inset-x-0 bottom-0 translate-y-0 md:translate-y-full md:group-hover:translate-y-0 transition duration-300 bg-white bg-opacity-90 py-3 flex justify-center space-x-4">
            <button
              onClick={handleAddToCart}
              className="p-2 hover:text-yellow-500 transition transform hover:scale-110"
              aria-label="Add to cart"
            >
              <FiShoppingCart size={20} />
            </button>
            <button
              onClick={handleWishlistToggle}
              className={`p-2 transition transform hover:scale-110 ${isWishlisted ? 'text-red-500' : 'hover:text-yellow-500'}`}
              aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
            >
              <FiHeart size={20} fill={isWishlisted ? "currentColor" : "none"} />
            </button>
          </div>

          <span className="absolute top-2 left-2 bg-white px-3 py-1 text-xs font-semibold rounded-full shadow">
            {category}
          </span>
        </div>
      </Link>

      <div className="p-4">
        <Link to={`/product/${productId}`}>
          <h3 className="font-serif font-semibold text-lg mb-2 hover:text-yellow-500 transition">
            {name}
          </h3>
        </Link>
        <p className="text-gray-600 font-medium">
          {formatPrice(price)}
        </p>
      </div>
    </motion.div>
  );
};

export default ProductCard;