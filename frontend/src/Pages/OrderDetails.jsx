import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import {
  FiArrowLeft,
  FiPackage,
  FiTruck,
  FiCheckCircle,
  FiClock,
  FiXCircle,
  FiPrinter,
  FiRotateCcw,
  FiMapPin,
  FiCreditCard,
  FiHome,
} from 'react-icons/fi';
import { notify } from '../utils/notify';
import api from '../utils/api';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';

const OrderDetails = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { formatPrice } = useCurrency();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  // ==========================================
  // FETCH ORDER BY ID
  // ==========================================
  useEffect(() => {
    const fetchOrder = async () => {
      const token = localStorage.getItem('token');

      if (!token) {
        navigate('/login');
        return;
      }

      try {
        setLoading(true);
        const response = await api.get(`/orders/${orderId}`);

        if (response.data.success) {
          setOrder(response.data.order);
        }
      } catch (error) {
        console.error(
          '❌ Error fetching order:',
          error.response?.data || error.message
        );
        notify.error('Order not found');
        navigate('/orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, navigate]);

  // ==========================================
  // CANCEL ORDER
  // ==========================================
  const handleCancelOrder = async () => {
    if (
      !window.confirm(
        'Are you sure you want to cancel this order?'
      )
    ) {
      return;
    }

    try {
      const response = await api.put(
        `/orders/${orderId}/cancel`
      );

      if (response.data.success) {
        notify.success('Order cancelled successfully');
        setOrder(response.data.order);
      }
    } catch (error) {
      console.error(
        '❌ Error cancelling order:',
        error.response?.data || error.message
      );
      notify.error(
        error.response?.data?.message || 'Failed to cancel order'
      );
    }
  };

  // ==========================================
  // REORDER
  // ==========================================
  const handleReorder = async () => {
    try {
      for (const item of order.items) {
        const productId = item.product?._id || item.product;
        if (!productId) continue;

        await addToCart(
          {
            _id: productId,
            name: item.name,
            price: item.price,
            image: item.image,
            category: item.category || 'rings',
          },
          item.size,
          item.quantity
        );
      }

      // Silent — redirect to /cart is the feedback
      navigate('/cart');
    } catch (error) {
      console.error('❌ Reorder error:', error);
      notify.error('Failed to reorder');
    }
  };

  // ==========================================
  // PRINT
  // ==========================================
  const handlePrint = () => {
    window.print();
  };

  // ==========================================
  // LOADING
  // ==========================================
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="bg-white rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 shadow-warm-lg border border-yellow-500/10">
            <FiPackage size={40} className="text-yellow-500" />
          </div>
          <h2 className="text-2xl font-serif mb-3">Order Not Found</h2>
          <Link
            to="/orders"
            className="inline-block bg-yellow-500 text-gray-900 px-8 py-3 rounded-lg font-semibold hover:bg-yellow-400 transition shadow-warm"
          >
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  // ==========================================
  // STATUS TIMELINE
  // ==========================================
  const statusSteps = [
    { key: 'Processing', label: 'Processing', icon: FiClock },
    { key: 'Shipped', label: 'Shipped', icon: FiTruck },
    { key: 'Out for Delivery', label: 'Out for Delivery', icon: FiTruck },
    { key: 'Delivered', label: 'Delivered', icon: FiCheckCircle },
  ];

  const getCurrentStepIndex = () => {
    const status = order.orderStatus?.toLowerCase();
    if (status === 'processing') return 0;
    if (status === 'shipped') return 1;
    if (status === 'out for delivery') return 2;
    if (status === 'delivered') return 3;
    return -1; // Cancelled
  };

  const currentStep = getCurrentStepIndex();
  const isCancelled = order.orderStatus?.toLowerCase() === 'cancelled';

  const estimatedDelivery = new Date(order.createdAt);
  estimatedDelivery.setDate(estimatedDelivery.getDate() + 5);

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-3xl mx-auto px-4">
        {/* TOP BAR */}
        <div className="flex justify-between items-center mb-6 print:hidden">
          <button
            onClick={() => navigate('/orders')}
            className="inline-flex items-center gap-2 text-gray-500 hover:text-yellow-600 transition"
          >
            <FiArrowLeft size={18} />
            Back to Orders
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-warm-sm border border-yellow-500/10 hover:shadow-warm transition text-gray-600 hover:text-gray-900"
          >
            <FiPrinter size={18} />
            Print
          </button>
        </div>

        {/* ===== PRINT AREA ===== */}
        <div className="print-content">
          {/* HEADER */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card-warm p-6 mb-6"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="font-serif text-2xl">
                  Order #{order._id?.slice(-8).toUpperCase()}
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Placed on{' '}
                  {new Date(order.createdAt).toLocaleDateString(
                    'en-US',
                    {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    }
                  )}
                </p>
              </div>
              <span
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold ${
                  isCancelled
                    ? 'bg-red-100 text-red-700'
                    : currentStep === 3
                    ? 'bg-green-100 text-green-700'
                    : currentStep === 2
                    ? 'bg-purple-100 text-purple-700'
                    : currentStep === 1
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-yellow-100 text-yellow-700'
                }`}
              >
                {isCancelled ? (
                  <FiXCircle size={16} />
                ) : (
                  <FiPackage size={16} />
                )}
                {order.orderStatus}
              </span>
            </div>
          </motion.div>

          {/* TRACKING TIMELINE */}
          {!isCancelled && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="card-warm p-6 mb-6"
            >
              <h2 className="font-serif text-xl mb-6">Order Status</h2>

              <div className="flex items-center justify-between">
                {statusSteps.map((step, index) => {
                  const Icon = step.icon;
                  const isCompleted = index <= currentStep;
                  const isCurrent = index === currentStep;

                  return (
                    <React.Fragment key={step.key}>
                      <div className="flex flex-col items-center flex-1">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center transition ${
                            isCompleted
                              ? 'bg-yellow-500 text-white'
                              : 'bg-cream-deep text-gray-400 border border-yellow-500/15'
                          } ${isCurrent ? 'ring-4 ring-yellow-200/60' : ''}`}
                        >
                          <Icon size={18} />
                        </div>
                        <p
                          className={`text-xs mt-2 text-center ${
                            isCompleted
                              ? 'text-gray-900 font-medium'
                              : 'text-gray-400'
                          }`}
                        >
                          {step.label}
                        </p>
                      </div>
                      {index < statusSteps.length - 1 && (
                        <div
                          className={`flex-1 h-0.5 transition ${
                            index < currentStep
                              ? 'bg-yellow-500'
                              : 'bg-yellow-500/15'
                          }`}
                        />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>

              {currentStep < 3 && (
                <p className="text-sm text-gray-500 mt-6 text-center">
                  Estimated delivery:{' '}
                  {estimatedDelivery.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              )}
            </motion.div>
          )}

          {/* ORDER ITEMS */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card-warm p-6 mb-6"
          >
            <h2 className="font-serif text-xl mb-4">Items</h2>

            <div className="space-y-3">
              {order.items?.map((item, index) => (
                <div
                  key={index}
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

            {/* TOTALS */}
            <div className="border-t border-yellow-500/15 pt-4 mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span>{formatPrice(order.total)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Shipping</span>
                <span className="text-green-600">Free</span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-2 border-t border-yellow-500/15">
                <span>Total</span>
                <span className="text-yellow-600">
                  {formatPrice(order.total)}
                </span>
              </div>
            </div>
          </motion.div>

          {/* SHIPPING & PAYMENT */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card-warm p-6 mb-6"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* SHIPPING ADDRESS */}
              <div>
                <h3 className="font-serif text-lg mb-3 flex items-center gap-2">
                  <FiMapPin size={18} className="text-yellow-500" />
                  Shipping Address
                </h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p className="font-medium text-gray-900">
                    {order.address?.firstName}{' '}
                    {order.address?.lastName}
                  </p>
                  <p>{order.address?.street}</p>
                  <p>
                    {order.address?.city}, {order.address?.state}{' '}
                    {order.address?.zipCode}
                  </p>
                  <p>{order.address?.country}</p>
                  <p className="pt-2">
                    <span className="text-gray-500">Phone:</span>{' '}
                    {order.address?.phone}
                  </p>
                  <p>
                    <span className="text-gray-500">Email:</span>{' '}
                    {order.address?.email}
                  </p>
                </div>
              </div>

              {/* PAYMENT METHOD */}
              <div>
                <h3 className="font-serif text-lg mb-3 flex items-center gap-2">
                  <FiCreditCard size={18} className="text-yellow-500" />
                  Payment
                </h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>
                    <span className="text-gray-500">Method:</span>{' '}
                    {order.paymentMethod}
                  </p>
                  <p>
                    <span className="text-gray-500">Status:</span>{' '}
                    <span
                      className={`font-medium ${
                        order.paymentStatus === 'Paid'
                          ? 'text-green-600'
                          : 'text-yellow-600'
                      }`}
                    >
                      {order.paymentStatus}
                    </span>
                  </p>
                  {order.trackingNumber && (
                    <p>
                      <span className="text-gray-500">Tracking:</span>{' '}
                      {order.trackingNumber}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
        {/* ===== PRINT AREA ENDS ===== */}

        {/* ACTION BUTTONS */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-3 justify-center print:hidden"
        >
          <button
            onClick={handleReorder}
            className="inline-flex items-center justify-center gap-2 bg-yellow-500 text-gray-900 px-6 py-3 rounded-xl font-semibold hover:bg-yellow-400 transition shadow-warm"
          >
            <FiRotateCcw size={18} />
            Reorder
          </button>

          {order.orderStatus === 'Processing' && (
            <button
              onClick={handleCancelOrder}
              className="inline-flex items-center justify-center gap-2 border-2 border-red-300 text-red-500 px-6 py-3 rounded-xl font-semibold hover:bg-red-50 transition bg-white"
            >
              <FiXCircle size={18} />
              Cancel Order
            </button>
          )}

          <Link
            to="/shop"
            className="inline-flex items-center justify-center gap-2 border border-yellow-500/20 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-yellow-50 hover:border-yellow-500/40 transition bg-white"
          >
            <FiHome size={18} />
            Continue Shopping
          </Link>
        </motion.div>
      </div>

      {/* PRINT STYLES */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @media print {
          body * { visibility: hidden; }
          .print-content, .print-content * { visibility: visible; }
          .print-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 40px;
            background: white;
          }
          .print-content .bg-white,
          .print-content .card-warm {
            background: white !important;
            box-shadow: none !important;
            border: 1px solid #e5e7eb !important;
          }
          .print-content img {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
        }
      `,
        }}
      />
    </div>
  );
};

export default OrderDetails;