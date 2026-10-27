import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { FiShoppingCart, FiTrash2, FiChevronRight, FiArrowLeft } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';
// eslint-disable-next-line no-unused-vars
import { notify } from '../utils/notify';

const Cart = () => {
  const navigate = useNavigate();
  const {
    cartItems,
    cartTotal,
    removeFromCart,
    updateQuantity,
    clearCart
  } = useCart();
  const { formatPrice } = useCurrency();

  // Handle quantity update
  const handleUpdateQuantity = (itemId, size, newQuantity) => {
    if (newQuantity < 1) {
      handleRemoveItem(itemId, size);
      return;
    }
    updateQuantity(itemId, size, newQuantity);
  };

  // Handle remove item
  const handleRemoveItem = (itemId, size) => {
    // Silent — the item disappearing from the list is the feedback
    removeFromCart(itemId, size);
  };

  // If cart is empty 
  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="bg-white rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6 shadow-warm-lg border border-yellow-500/10">
            <FiShoppingCart size={48} className="text-yellow-500" />
          </div>
          <h2 className="text-2xl font-serif mb-3 text-gray-800">Your cart is empty</h2>
          <p className="text-gray-600 mb-8">
            Looks like you haven't added any items to your cart yet.
          </p>
          <Link
            to="/shop"
            className="inline-block bg-gradient-to-r from-yellow-500 to-amber-400 text-gray-900 px-8 py-3 rounded-lg font-semibold hover:from-yellow-600 hover:to-amber-500 transition shadow-warm hover:shadow-warm-lg"
          >
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
      <div className="min-h-screen py-8">
      <div className="max-w-5xl mx-auto px-4">
        {/* Breadcrumb */}
        <div className="flex items-center text-sm text-gray-500 mb-6">
          <Link to="/" className="hover:text-yellow-500 transition">Home</Link>
          <FiChevronRight size={14} className="mx-2" />
          <span className="text-gray-900 font-medium">Cart</span>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h1 className="font-serif text-3xl md:text-4xl text-gray-800">Your Cart</h1>
            <p className="text-gray-500 text-sm mt-1">
              {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in your cart
            </p>
          </div>
          <button
            onClick={() => {
              clearCart();
              // toast.info('Cart cleared');
            }}
            className="mt-4 sm:mt-0 text-sm text-red-500 hover:text-red-600 transition flex items-center gap-1"
          >
            <FiTrash2 size={16} />
            Clear Cart
          </button>
        </div>

        {/* Cart Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items - 2/3 width */}
          <div className="lg:col-span-2">
            <div className="card-warm overflow-hidden">
              {/* Desktop Header */}
              <div className="hidden md:grid md:grid-cols-12 gap-4 px-6 py-3 bg-gradient-to-r from-yellow-50 to-amber-50/60 border-b border-yellow-500/10 text-sm font-medium text-gray-600">
                <div className="col-span-6">Product</div>
                <div className="col-span-2 text-center">Quantity</div>
                <div className="col-span-3 text-right">Total</div>
                <div className="col-span-1 text-center">Action</div>
              </div>

              {/* Cart Items List */}
              <div className="divide-y divide-gray-100">
                {cartItems.map((item, index) => {
                  const sizeKey = item.selectedSize !== undefined ? item.selectedSize : item.size;
                  
                  return (
                    <motion.div
                      key={`${item.id}-${sizeKey || 'default'}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="p-4 md:p-6 hover:bg-yellow-50/40 transition"
                    >
                      {/* Mobile View */}
                      <div className="md:hidden flex items-start gap-3">
                        <Link to={`/product/${item.id}`} className="flex-shrink-0">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-16 h-16 object-cover rounded-lg shadow-sm"
                          />
                        </Link>
                        
                        <div className="flex-1 min-w-0">
                          <Link to={`/product/${item.id}`} className="font-serif font-medium hover:text-yellow-500 transition text-sm">
                            {item.name}
                          </Link>
                          {sizeKey && (
                            <p className="text-xs text-gray-500">Size: {sizeKey}</p>
                          )}
                          <p className="text-sm font-semibold mt-1 text-gray-800">{formatPrice(item.price)}</p>
                          
                          <div className="flex items-center gap-3 mt-2">
                            <div className="flex items-center border border-yellow-500/20 rounded-lg bg-white">
                              <button
                                onClick={() => handleUpdateQuantity(item.id, sizeKey, item.quantity - 1)}
                                className="w-7 h-7 flex items-center justify-center hover:bg-yellow-50 rounded-l-lg transition text-gray-600"
                              >
                                -
                              </button>
                              <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                              <button
                                onClick={() => handleUpdateQuantity(item.id, sizeKey, item.quantity + 1)}
                                className="w-7 h-7 flex items-center justify-center hover:bg-yellow-50 rounded-r-lg transition text-gray-600"
                              >
                                +
                              </button>
                            </div>
                            <span className="text-sm font-semibold text-yellow-600">
                              {formatPrice(item.price * item.quantity)}
                            </span>
                          </div>
                        </div>
                        
                        <button
                          onClick={() => handleRemoveItem(item.id, sizeKey)}
                          className="text-gray-400 hover:text-red-500 transition p-1 flex-shrink-0"
                          aria-label="Remove item"
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </div>

                      {/* Desktop View */}
                      <div className="hidden md:grid md:grid-cols-12 gap-4 items-center">
                        <div className="flex items-center gap-4 md:col-span-6">
                          <Link to={`/product/${item.id}`} className="flex-shrink-0">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-20 h-20 object-cover rounded-lg shadow-sm"
                            />
                          </Link>
                          <div>
                            <Link to={`/product/${item.id}`} className="font-serif font-medium hover:text-yellow-500 transition">
                              {item.name}
                            </Link>
                            {sizeKey && (
                              <p className="text-sm text-gray-500">Size: {sizeKey}</p>
                            )}
                            <p className="text-sm text-gray-500">{formatPrice(item.price)}</p>
                          </div>
                        </div>

                        <div className="md:col-span-2 flex items-center justify-center">
                          <div className="flex items-center border border-yellow-500/20 rounded-lg bg-white">
                            <button
                              onClick={() => handleUpdateQuantity(item.id, sizeKey, item.quantity - 1)}
                              className="w-8 h-8 flex items-center justify-center hover:bg-yellow-50 rounded-l-lg transition text-gray-600"
                            >
                              -
                            </button>
                            <span className="w-10 text-center font-medium">{item.quantity}</span>
                            <button
                              onClick={() => handleUpdateQuantity(item.id, sizeKey, item.quantity + 1)}
                              className="w-8 h-8 flex items-center justify-center hover:bg-yellow-50 rounded-r-lg transition text-gray-600"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        <div className="md:col-span-3 text-right font-semibold text-lg text-gray-800">
                          {formatPrice(item.price * item.quantity)}
                        </div>

                        <div className="md:col-span-1 flex justify-center">
                          <button
                            onClick={() => handleRemoveItem(item.id, sizeKey)}
                            className="text-gray-400 hover:text-red-500 transition p-2"
                            aria-label="Remove item"
                          >
                            <FiTrash2 size={18} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Continue Shopping */}
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 text-gray-500 hover:text-yellow-500 transition mt-6"
            >
              <FiArrowLeft size={16} />
              Continue Shopping
            </Link>
          </div>

          {/* Order Summary - 1/3 width */}
          <div className="lg:col-span-1">
            <div className="card-warm p-6 sticky top-24">
              <h2 className="font-serif text-xl mb-4 text-gray-800">Order Summary</h2>
              
              <div className="flex justify-between py-2 text-sm">
                <span className="text-gray-500">Items ({cartItems.length})</span>
                <span className="text-gray-800">{formatPrice(cartTotal)}</span>
              </div>
              
              <div className="flex justify-between py-2 text-sm">
                <span className="text-gray-500">Shipping</span>
                <span className="text-green-500 font-medium">Free</span>
              </div>
              
              <div className="flex justify-between py-4 mt-2 border-t border-yellow-500/15 font-bold text-lg">
                <span className="text-gray-700">Total</span>
                <span className="text-yellow-600">{formatPrice(cartTotal)}</span>
              </div>

              <button
                onClick={() => navigate('/checkout')}
                className="w-full mt-4 bg-gradient-to-r from-yellow-500 to-amber-400 text-gray-900 py-3 rounded-xl font-semibold hover:from-yellow-600 hover:to-amber-500 hover:shadow-warm-lg transition shadow-warm cursor-pointer"
              >
                Proceed to Checkout
              </button>

              <div className="mt-4 text-center text-xs text-gray-400">
                <p>🔒 Secure Checkout</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;