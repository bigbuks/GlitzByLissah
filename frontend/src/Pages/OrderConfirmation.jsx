import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import {
  FiCheckCircle,
  FiPackage,
  FiTruck,
  FiClock,
  FiHome,
  FiShoppingBag,
  FiPrinter,
} from 'react-icons/fi';
import { useCurrency } from '../context/CurrencyContext';

const OrderConfirmation = () => {
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedOrder = localStorage.getItem('lastOrder');
    if (savedOrder) {
      try {
        const order = JSON.parse(savedOrder);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setOrderDetails(order);
      } catch (error) {
        console.error('Error parsing order:', error);
      }
    } else {
      setTimeout(() => {
        navigate('/shop');
      }, 3000);
    }
    setLoading(false);
  }, [navigate]);

  const handlePrint = () => {
    window.print();
  };

  if (!loading && !orderDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="bg-white rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 shadow-warm-lg border border-yellow-500/10">
            <FiPackage size={40} className="text-yellow-500" />
          </div>
          <h2 className="text-2xl font-serif mb-3">No Order Found</h2>
          <p className="text-gray-600 mb-6">
            We couldn't find any order details. If you just placed an order, it
            should appear here shortly.
          </p>
          <Link
            to="/shop"
            className="inline-block bg-yellow-500 text-gray-900 px-8 py-3 rounded-lg font-semibold hover:bg-yellow-400 transition shadow-warm"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your order details...</p>
        </div>
      </div>
    );
  }

  const { customer, items, total, paymentMethod, orderId, date } = orderDetails;
  const estimatedDelivery = new Date(date);
  estimatedDelivery.setDate(estimatedDelivery.getDate() + 5);

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-3xl mx-auto px-4">
        {/* Print Button - Hidden when printing */}
        <div className="flex justify-end mb-4 print:hidden">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-warm-sm border border-yellow-500/10 hover:shadow-warm transition text-gray-600 hover:text-gray-900"
          >
            <FiPrinter size={18} />
            Print Order
          </button>
        </div>

        {/* ===== PRINT AREA STARTS HERE ===== */}
        <div className="print-content">
          {/* Success Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-10"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5, type: 'spring', stiffness: 200 }}
              className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-100 to-green-50 rounded-full mb-5 shadow-warm border border-green-200 print:bg-green-100"
            >
              <FiCheckCircle size={40} className="text-green-600" />
            </motion.div>
            <h1 className="font-serif text-3xl md:text-4xl mb-3">
              Thank You for Your Order! 🎉
            </h1>
            <div className="mx-auto mb-4 h-px w-24 bg-gradient-to-r from-transparent via-yellow-500 to-transparent" />
            <p className="text-gray-600">
              We've received your order and will process it shortly.
            </p>
            <p className="text-sm text-gray-500 mt-2 font-medium">
              Order #{orderId || 'Loading...'}
            </p>
          </motion.div>

          {/* Order Summary Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="card-warm p-6 mb-6"
          >
            <h2 className="font-serif text-xl mb-4">Order Summary</h2>

            {/* Order Status */}
            <div className="flex flex-wrap items-center gap-4 mb-6 pb-4 border-b border-yellow-500/15">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FiClock size={16} className="text-yellow-500" />
                <span>
                  Order placed:{' '}
                  {new Date(date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FiTruck size={16} className="text-yellow-500" />
                <span>
                  Est. delivery:{' '}
                  {estimatedDelivery.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </div>
            </div>

            {/* Order Items */}
            <div className="space-y-3 mb-4">
              {items?.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-2 hover:bg-yellow-50/40 rounded-lg transition print:hover:bg-transparent"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-sm">{item.name}</p>
                    <p className="text-sm text-gray-500">
                      Qty: {item.quantity}{' '}
                      {item.selectedSize && `| Size: ${item.selectedSize}`}
                    </p>
                  </div>
                  <p className="font-medium">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="border-t border-yellow-500/15 pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span>{formatPrice(total)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Shipping</span>
                <span className="text-green-600">Free</span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-2 border-t border-yellow-500/15">
                <span>Total</span>
                <span className="text-yellow-600">{formatPrice(total)}</span>
              </div>
            </div>
          </motion.div>

          {/* Shipping Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.5 }}
            className="card-warm p-6 mb-6"
          >
            <h2 className="font-serif text-xl mb-4">Shipping Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Contact</p>
                <p className="font-medium">{customer?.email}</p>
                <p className="font-medium">{customer?.phone}</p>
              </div>
              <div>
                <p className="text-gray-500">Shipping Address</p>
                <p className="font-medium">
                  {customer?.firstName} {customer?.lastName}
                </p>
                <p className="font-medium">{customer?.address}</p>
                <p className="font-medium">
                  {customer?.city}, {customer?.state} {customer?.zipCode}
                </p>
                <p className="font-medium">{customer?.country}</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-yellow-500/15">
              <p className="text-gray-500 text-sm">Payment Method</p>
              <p className="font-medium text-sm">{paymentMethod}</p>
            </div>
          </motion.div>
        </div>
        {/* ===== PRINT AREA ENDS HERE ===== */}

        {/* Action Buttons - Hidden when printing */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="flex flex-col sm:flex-row gap-3 justify-center print:hidden"
        >
          <Link
            to="/shop"
            className="flex items-center justify-center gap-2 bg-yellow-500 text-gray-900 px-6 py-3 rounded-xl font-semibold hover:bg-yellow-400 hover:shadow-warm-lg transition-all shadow-warm"
          >
            <FiShoppingBag size={18} />
            Continue Shopping
          </Link>

          <Link
            to="/track-order"
            className="flex items-center justify-center gap-2 bg-white border border-yellow-500/20 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-yellow-50 hover:border-yellow-500/40 transition shadow-warm-sm"
          >
            <FiPackage size={18} />
            Track Order
          </Link>

          <Link
            to="/orders"
            className="flex items-center justify-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-800 hover:shadow-warm transition-all shadow-warm-sm"
          >
            <FiPackage size={18} />
            View All Orders
          </Link>

          <Link
            to="/"
            className="flex items-center justify-center gap-2 bg-white border border-yellow-500/20 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-yellow-50 hover:border-yellow-500/40 transition shadow-warm-sm"
          >
            <FiHome size={18} />
            Back to Home
          </Link>
        </motion.div>
      </div>

      {/* Print Styles */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
          @media print {
            @page {
              size: A4;
              margin: 0;
            }

            html, body {
              margin: 0 !important;
              padding: 0 !important;
              height: auto !important;
              overflow: visible !important;
            }

            body * {
              visibility: hidden;
            }

            .print-content, .print-content * {
              visibility: visible;
            }

            .print-content {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              padding: 15mm !important;
              background: white;
            }

            .print-content .mb-10 { margin-bottom: 12px !important; }
            .print-content .mb-8 { margin-bottom: 12px !important; }
            .print-content .mb-6 { margin-bottom: 10px !important; }
            .print-content .mb-5 { margin-bottom: 8px !important; }
            .print-content .mb-4 { margin-bottom: 8px !important; }
            .print-content .mb-3 { margin-bottom: 6px !important; }
            .print-content .mb-2 { margin-bottom: 4px !important; }
            .print-content .mt-2 { margin-top: 4px !important; }
            .print-content .mt-1 { margin-top: 2px !important; }
            .print-content .mt-4 { margin-top: 8px !important; }
            .print-content .pb-4 { padding-bottom: 8px !important; }
            .print-content .pt-4 { padding-top: 8px !important; }
            .print-content .pt-2 { padding-top: 4px !important; }

            .print-content .p-6 { padding: 12px !important; }
            .print-content .p-2 { padding: 4px !important; }

            .print-content h1 { font-size: 22px !important; }
            .print-content h2 { font-size: 15px !important; }
            .print-content p { font-size: 11px !important; }
            .print-content span { font-size: 11px !important; }

            .print-content .w-20 { width: 50px !important; height: 50px !important; }
            .print-content svg { width: 24px !important; height: 24px !important; }

            .print-content img {
              width: 40px !important;
              height: 40px !important;
              print-color-adjust: exact;
              -webkit-print-color-adjust: exact;
            }

            .print-content .shadow-sm,
            .print-content .shadow-warm,
            .print-content .shadow-warm-sm,
            .print-content .shadow-warm-lg,
            .print-content .card-warm {
              box-shadow: none !important;
              border: 1px solid #e5e7eb !important;
              background-color: white !important;
            }
            .print-content .card-warm { border-radius: 6px !important; }
            .print-content .rounded-2xl { border-radius: 6px !important; }

            .print-content .bg-green-100 { background-color: #d1fae5 !important; }
            .print-content .text-green-600 { color: #059669 !important; }
            .print-content .text-yellow-600 { color: #d97706 !important; }
            .print-content .text-yellow-500 { color: #ca8a04 !important; }

            .print-content .hover\\:bg-yellow-50\\/40 { background: transparent !important; }

            .print-content .bg-white {
              page-break-inside: avoid !important;
              break-inside: avoid !important;
            }

            .print-content > * {
              page-break-after: avoid !important;
              break-after: avoid !important;
            }

            .print-content * {
              animation: none !important;
              transition: none !important;
            }
          }
        `,
        }}
      />
    </div>
  );
};

export default OrderConfirmation;