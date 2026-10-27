import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FiMail,
  FiPackage,
  FiArrowLeft,
  FiSearch,
  FiTruck,
  FiCheckCircle,
  FiClock,
  FiXCircle,
} from 'react-icons/fi';
import { notify } from '../utils/notify';
import api from '../utils/api';
import { useCurrency } from '../context/CurrencyContext';

const TrackOrder = () => {
  const { formatPrice } = useCurrency();
  const [step, setStep] = useState('lookup'); // 'lookup', 'otp', 'result'
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [orderId, setOrderId] = useState('');
  const [otp, setOtp] = useState('');
  const [order, setOrder] = useState(null);

  // ==========================================
  // REQUEST OTP
  // ==========================================
  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post('/orders/track/request', {
        email,
        orderId,
      });

      if (response.data.success) {
        setStep('otp');
        notify.success('Code sent to your email!');
      }
    } catch (error) {
      console.error('❌ Error:', error);
      notify.error(
        error.response?.data?.message ||
          'Order not found. Check your details.'
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // VERIFY OTP
  // ==========================================
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post('/orders/track/verify', {
        email,
        otp,
        orderId,
      });

      if (response.data.success) {
        setOrder(response.data.order);
        setStep('result');
        notify.success('Order found!');
      }
    } catch (error) {
      console.error('❌ Error:', error);
      notify.error(error.response?.data?.message || 'Invalid code');
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // STATUS STYLING
  // ==========================================
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return 'bg-green-100 text-green-700';
      case 'shipped':
        return 'bg-blue-100 text-blue-700';
      case 'out for delivery':
        return 'bg-purple-100 text-purple-700';
      case 'processing':
        return 'bg-yellow-100 text-yellow-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return <FiCheckCircle size={16} />;
      case 'shipped':
      case 'out for delivery':
        return <FiTruck size={16} />;
      case 'processing':
        return <FiClock size={16} />;
      case 'cancelled':
        return <FiXCircle size={16} />;
      default:
        return <FiPackage size={16} />;
    }
  };

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Back */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-yellow-600 transition mb-6"
        >
          <FiArrowLeft size={18} />
          Back to Home
        </Link>

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-yellow-100 to-amber-100 rounded-full mb-5 shadow-warm border border-yellow-500/15">
            <FiPackage size={40} className="text-yellow-600" />
          </div>
          <h1 className="font-serif text-3xl md:text-4xl mb-3">Track Your Order</h1>
          <div className="mx-auto mb-4 h-px w-24 bg-gradient-to-r from-transparent via-yellow-500 to-transparent" />
          <p className="text-gray-600 font-light">
            {step === 'lookup' &&
              'Enter your email and order ID to view your order status'}
            {step === 'otp' && `We sent a verification code to ${email}`}
            {step === 'result' && 'Here are your order details'}
          </p>
        </div>

        {/* Step 1: Lookup */}
        {step === 'lookup' && (
          <form
            onSubmit={handleRequestOTP}
            className="card-warm p-6 md:p-8 space-y-5"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <FiMail
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  placeholder="The email you used at checkout"
                  className="w-full pl-10 pr-4 py-3 border border-yellow-500/15 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Order ID
              </label>
              <div className="relative">
                <FiSearch
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  type="text"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  required
                  disabled={loading}
                  placeholder="e.g. 8DF924C8"
                  className="w-full pl-10 pr-4 py-3 border border-yellow-500/15 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition uppercase"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1.5">
                Find your Order ID in your confirmation email or on the order confirmation page.
              </p>
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
                  Sending code...
                </>
              ) : (
                'Send Verification Code'
              )}
            </button>
          </form>
        )}

        {/* Step 2: OTP */}
        {step === 'otp' && (
          <form
            onSubmit={handleVerifyOTP}
            className="card-warm p-6 md:p-8 space-y-5"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Verification Code
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                required
                maxLength="6"
                disabled={loading}
                placeholder="000000"
                className="w-full px-4 py-4 border border-yellow-500/15 rounded-xl text-center text-2xl tracking-[0.5em] font-medium focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
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
                  Verifying...
                </>
              ) : (
                'View Order'
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setStep('lookup');
                setOtp('');
              }}
              className="w-full text-sm text-gray-500 hover:text-yellow-600 transition"
            >
              Use different details
            </button>
          </form>
        )}

        {/* Step 3: Result */}
        {step === 'result' && order && (
          <div className="space-y-6">
            {/* Order Header */}
            <div className="card-warm p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-gray-500">
                    Order #{order._id?.slice(-8).toUpperCase()}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(order.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                <span
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(
                    order.orderStatus
                  )}`}
                >
                  {getStatusIcon(order.orderStatus)}
                  {order.orderStatus}
                </span>
              </div>

              {order.trackingNumber && (
                <div className="mt-4 pt-4 border-t border-yellow-500/15">
                  <p className="text-xs text-gray-500">Tracking Number</p>
                  <p className="font-medium">{order.trackingNumber}</p>
                </div>
              )}
            </div>

            {/* Items */}
            <div className="card-warm p-6">
              <h2 className="font-serif text-xl mb-4">Items</h2>
              <div className="space-y-3">
                {order.items?.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 py-2 border-b border-yellow-500/10 last:border-0"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-gray-500">
                        Qty: {item.quantity}
                        {item.size && ` | Size: ${item.size}`}
                      </p>
                    </div>
                    <p className="font-medium">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t border-yellow-500/15 pt-4 mt-4 flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-yellow-600">
                  {formatPrice(order.total)}
                </span>
              </div>
            </div>

            {/* Shipping */}
            <div className="card-warm p-6">
              <h2 className="font-serif text-xl mb-4">Shipping Address</h2>
              <div className="text-sm text-gray-600 space-y-1">
                <p className="font-medium text-gray-900">
                  {order.address?.firstName} {order.address?.lastName}
                </p>
                <p>{order.address?.street}</p>
                <p>
                  {order.address?.city}, {order.address?.state}{' '}
                  {order.address?.zipCode}
                </p>
                <p>{order.address?.country}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => {
                  setStep('lookup');
                  setEmail('');
                  setOrderId('');
                  setOtp('');
                  setOrder(null);
                }}
                className="px-6 py-3 bg-white border border-yellow-500/20 text-gray-700 rounded-xl font-medium hover:bg-yellow-50 hover:border-yellow-500/40 transition shadow-warm-sm"
              >
                Track Another Order
              </button>
              <Link
                to="/shop"
                className="px-6 py-3 bg-yellow-500 text-gray-900 rounded-xl font-semibold hover:bg-yellow-400 transition shadow-warm hover:shadow-warm-lg text-center"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackOrder;