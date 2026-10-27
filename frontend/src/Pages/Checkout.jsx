import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { FiChevronRight, FiTruck, FiShield, FiArrowLeft } from 'react-icons/fi';
import { notify } from '../utils/notify';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';
import api from '../utils/api';
import PaystackLogo from '../assets/Paystack.png';

const Checkout = () => {
  const navigate = useNavigate();
  const { cartItems, cartTotal, clearCart, setIsCartOpen } = useCart();
  const { formatPrice } = useCurrency();
  const [isSubmitting, setIsSubmitting] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const processedRef = useRef(null); // ✅ Prevents double-submitting
  const [paymentMethod, setPaymentMethod] = useState('paystack');
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'Nigeria'
  });

    // Load Paystack script (v2)
  useEffect(() => {
    const existing = document.querySelector('script[src="https://js.paystack.co/v2/inline.js"]');
    if (!existing) {
      const script = document.createElement('script');
      script.src = 'https://js.paystack.co/v2/inline.js';
      script.async = true;
      if (document.body) {
        document.body.appendChild(script);
      } else {
        document.addEventListener('DOMContentLoaded', () => {
          document.body.appendChild(script);
        });
      }
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.address) {
      notify.error('Please fill in all required fields');
      return false;
    }
    return true;
  };

  // ✅ Place order via API (Guest + Logged-in)
    const placeOrder = async (paymentMethodUsed, reference = null) => {
    // ✅ PREVENT DUPLICATES
    if (reference) {
      const processedKey = `processed_${reference}`;
      if (localStorage.getItem(processedKey)) {
        console.log('⚠️ Duplicate frontend request blocked');
        return;
      }
      localStorage.setItem(processedKey, 'true');
    }

    try {
      const token = localStorage.getItem('token');
      
      const orderData = {
        items: cartItems.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          size: item.size || item.selectedSize || null,
        })),
        address: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          street: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          country: formData.country,
        },
        paymentMethod: paymentMethodUsed,
        total: cartTotal,
        paymentReference: reference,
      };

      const response = await api.post('/orders', orderData, {
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
        }
      });

      if (response.data.success) {
        const orderDetails = {
          orderId: response.data.order.id || `ORD-${Date.now()}`,
          customer: formData,
          items: cartItems,
          total: cartTotal,
          paymentMethod: paymentMethodUsed,
          paymentReference: reference,
          date: new Date().toISOString()
        };
        localStorage.setItem('lastOrder', JSON.stringify(orderDetails));
        clearCart(true); 

        if (paymentMethodUsed === 'COD') {
          notify.success('Order placed successfully!');
        }

        navigate('/order-confirmation');
      } else {
        notify.error(response.data.message || 'Failed to place order');
      }
    } catch (error) {
      console.error('Error placing order:', error);
      if (error.response?.status === 401) {
        notify.error('Please login to place an order');
        navigate('/login');
      } else {
        notify.error(error.response?.data?.message || 'Failed to place order');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // ✅ COD Order Handler
  const handleCodSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    await placeOrder('COD');
  };

    // ✅ Paystack Success Handler
    // ✅ Paystack Success Handler
  const handlePaystackSuccess = async (response) => {
    console.log('Paystack success:', response);
    
    // The duplicate lock is now handled inside placeOrder() using localStorage.
    // This guarantees it only fires once, even if Paystack calls this twice.
    await placeOrder('Paystack', response.reference);
  };

  // ✅ Paystack Payment Handler
  const handlePaystackPayment = () => {
    if (!validateForm()) return;
    
    setIsSubmitting(true);

    const publicKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;
    if (!publicKey || publicKey === 'pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx') {
      // Dev-only error — never surface env config to users
      console.error('❌ Paystack public key missing from .env');
      notify.error('Payment is temporarily unavailable. Please try another method.');
      setIsSubmitting(false);
      return;
    }

    const amountInKobo = Math.round(cartTotal * 100);
    
    const paystack = new window.PaystackPop();
    paystack.newTransaction({
      key: publicKey,
      email: formData.email,
      amount: amountInKobo,
      currency: 'NGN',
      metadata: {
        name: `${formData.firstName} ${formData.lastName}`,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        country: formData.country,
        email: formData.email,
        items: cartItems.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
          size: item.size || item.selectedSize || null,
        })),
        total: cartTotal,
      },
      channels: ['card', 'bank', 'ussd', 'qr', 'mobile_money', 'bank_transfer'],
      onSuccess: handlePaystackSuccess,
      onCancel: () => {
        console.log('Paystack modal closed');
        notify.info('Payment was not completed');
        setIsSubmitting(false);
      },
    });
  };

  const isFormValid = formData.firstName && formData.lastName && formData.email && formData.phone && formData.address;

  // Empty cart check
  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="bg-white rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 shadow-warm-lg border border-yellow-500/10">
            <FiTruck size={40} className="text-yellow-500" />
          </div>
          <h2 className="text-2xl font-serif mb-3">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Add some beautiful jewelry to your cart before checking out.</p>
          <Link
            to="/shop"
            className="inline-block bg-yellow-500 text-gray-900 px-8 py-3 rounded-lg font-semibold hover:bg-yellow-400 transition"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Breadcrumb */}
        <div className="flex items-center text-sm text-gray-500 mb-6">
          <Link to="/" className="hover:text-yellow-500 transition">Home</Link>
          <FiChevronRight size={14} className="mx-2" />
          <button
            onClick={() => setIsCartOpen(true)}
            className="hover:text-yellow-500 transition cursor-pointer"
          >
            Cart
          </button>
          <FiChevronRight size={14} className="mx-2" />
          <span className="text-gray-900 font-medium">Checkout</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Checkout Form */}
          <div className="lg:col-span-2">
            <div className="card-warm p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <button
                  onClick={() => navigate('/cart')}
                  className="text-gray-400 hover:text-yellow-600 transition p-2 -ml-2"
                >
                  <FiArrowLeft size={20} />
                </button>
                <h1 className="font-serif text-2xl md:text-3xl">Shipping Information</h1>
              </div>
              
              <form className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      First Name *
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-yellow-500/15 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition"
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-yellow-500/15 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition"
                      placeholder="Doe"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-yellow-500/15 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition"
                    placeholder="you@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-yellow-500/15 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition"
                    placeholder="080 1234 5678"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-yellow-500/15 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition"
                    placeholder="123 Main Street"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-yellow-500/15 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition"
                      placeholder="Lagos"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      State *
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-yellow-500/15 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition"
                      placeholder="Lagos"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      ZIP / Postal Code *
                    </label>
                    <input
                      type="text"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-yellow-500/15 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition"
                      placeholder="100001"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Country *
                    </label>
                    <select
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-yellow-500/15 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition bg-white"
                    >
                      <option value="Nigeria">Nigeria</option>
                      <option value="United States">United States</option>
                      <option value="United Kingdom">United Kingdom</option>
                      <option value="Canada">Canada</option>
                    </select>
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="card-warm p-6 sticky top-24">
              <h2 className="font-serif text-xl mb-4">Order Summary</h2>
              
              {/* Cart Items */}
              <div className="space-y-3 max-h-60 overflow-y-auto mb-4 pr-1">
                {cartItems.map((item) => (
                  <div key={`${item.id}-${item.size || item.selectedSize}`} className="flex gap-3 text-sm py-2 border-b border-yellow-500/10 last:border-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-14 h-14 object-cover rounded-lg flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{item.name}</p>
                      {(item.size || item.selectedSize) && (
                        <p className="text-xs text-gray-500">Size: {item.size || item.selectedSize}</p>
                      )}
                      <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-medium text-sm">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="border-t border-yellow-500/15 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span>{formatPrice(cartTotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Shipping</span>
                  <span className="text-green-600">Free</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t border-yellow-500/15">
                  <span>Total</span>
                  <span className="text-yellow-600">{formatPrice(cartTotal)}</span>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="mt-6">
                <h3 className="font-semibold mb-3 text-sm">Payment Method</h3>
                <div className="space-y-3">
                  <label className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition ${paymentMethod === 'paystack' ? 'border-yellow-500 bg-yellow-50 shadow-warm-sm' : 'border-yellow-500/15 hover:border-yellow-500/40'}`}>
                    <input
                      type="radio"
                      name="payment"
                      value="paystack"
                      checked={paymentMethod === 'paystack'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-4 h-4 text-yellow-500"
                    />
                    <img src={PaystackLogo} alt="Paystack" className="h-6" />
                    <span className="text-sm font-medium">Paystack</span>
                    <span className="text-[10px] text-gray-500 ml-auto">Card, Bank, USSD</span>
                  </label>
                  
                  <label className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition ${paymentMethod === 'cod' ? 'border-yellow-500 bg-yellow-50 shadow-warm-sm' : 'border-yellow-500/15 hover:border-yellow-500/40'}`}>
                    <input
                      type="radio"
                      name="payment"
                      value="cod"
                      checked={paymentMethod === 'cod'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-4 h-4 text-yellow-500"
                    />
                    <FiTruck className="text-gray-500" size={20} />
                    <span className="text-sm font-medium">Cash on Delivery</span>
                  </label>
                </div>
              </div>

              {/* Place Order Button */}
              {paymentMethod === 'cod' ? (
                <button
                  onClick={handleCodSubmit}
                  disabled={isSubmitting}
                  className="w-full mt-6 bg-yellow-500 text-gray-900 py-3.5 rounded-xl font-semibold hover:bg-yellow-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Processing...' : 'Place Order (COD)'}
                </button>
              ) : (
                <button
                  onClick={handlePaystackPayment}
                  disabled={!isFormValid || isSubmitting}
                  className="w-full mt-6 bg-gradient-to-r from-green-600 to-green-500 text-white py-3.5 rounded-xl font-semibold hover:from-green-700 hover:to-green-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Processing...' : 'Pay with Paystack'}
                </button>
              )}

              {/* Trust Badges */}
              <div className="mt-4 text-center text-xs text-gray-400">
                <div className="flex justify-center gap-4">
                  <span className="flex items-center gap-1"><FiShield size={12} /> Secure Checkout</span>
                  <span>🔒 100% Safe</span>
                </div>
                <p className="mt-2">Paystack supports cards, bank transfers, and USSD payments</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;