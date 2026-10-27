import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import {
  FiPackage,
  FiTruck,
  FiCheckCircle,
  FiClock,
  FiShoppingBag,
  FiEye,
  FiRotateCcw,
  FiChevronRight,
  FiXCircle,
} from 'react-icons/fi';
import { notify } from '../utils/notify';
import api from '../utils/api';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';

const Orders = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { formatPrice } = useCurrency();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  // ==========================================
  // FETCH ORDERS FROM BACKEND
  // ==========================================
  const fetchOrders = async () => {
    const token = localStorage.getItem('token');

    if (!token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await api.get('/orders/my-orders');

      if (response.data.success) {
        setOrders(response.data.orders || []);
      }
    } catch (error) {
      console.error(
        '❌ Error fetching orders:',
        error.response?.data || error.message
      );
      notify.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // ==========================================
  // STATUS COLOR & ICON
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
        return <FiCheckCircle size={14} />;
      case 'shipped':
        return <FiTruck size={14} />;
      case 'out for delivery':
        return <FiTruck size={14} />;
      case 'processing':
        return <FiClock size={14} />;
      case 'cancelled':
        return <FiXCircle size={14} />;
      default:
        return <FiPackage size={14} />;
    }
  };

  // ==========================================
  // REORDER FUNCTION
  // ==========================================
  const handleReorder = async (order) => {
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
  // FILTER ORDERS
  // ==========================================
  const filteredOrders =
    filter === 'All'
      ? orders
      : orders.filter(
          (order) =>
            order.orderStatus?.toLowerCase() === filter.toLowerCase()
        );

  const filterTabs = ['All', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered'];

  // ==========================================
  // NOT LOGGED IN
  // ==========================================
  const token = localStorage.getItem('token');

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="bg-white rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 shadow-warm-lg border border-yellow-500/10">
            <FiPackage size={40} className="text-yellow-500" />
          </div>
          <h2 className="text-2xl font-serif mb-3">Please Login</h2>
          <p className="text-gray-600 mb-6">
            You need to be logged in to view your orders.
          </p>
          <Link
            to="/login"
            className="inline-block bg-yellow-500 text-gray-900 px-8 py-3 rounded-lg font-semibold hover:bg-yellow-400 transition shadow-warm"
          >
            Login
          </Link>
        </div>
      </div>
    );
  }

  // ==========================================
  // LOADING
  // ==========================================
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your orders...</p>
        </div>
      </div>
    );
  }

  // ==========================================
  // NO ORDERS
  // ==========================================
  if (orders.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="bg-white rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 shadow-warm-lg border border-yellow-500/10">
            <FiPackage size={40} className="text-yellow-500" />
          </div>
          <h2 className="text-2xl font-serif mb-3">No Orders Yet</h2>
          <p className="text-gray-600 mb-6">
            You haven't placed any orders yet. Start shopping to see your
            orders here.
          </p>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 bg-yellow-500 text-gray-900 px-8 py-3 rounded-lg font-semibold hover:bg-yellow-400 transition shadow-warm"
          >
            <FiShoppingBag size={18} />
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* HEADER */}
        <div className="mb-6">
          <h1 className="font-serif text-3xl md:text-4xl mb-2">My Orders</h1>
          <p className="text-gray-600">
            {orders.length} {orders.length === 1 ? 'order' : 'orders'} found
          </p>
        </div>

        {/* FILTER TABS */}
        <div className="flex flex-wrap gap-2 mb-6">
          {filterTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition border ${
                filter === tab
                  ? 'bg-yellow-500 text-gray-900 border-yellow-500 shadow-warm-sm'
                  : 'bg-white text-gray-600 border-yellow-500/15 hover:border-yellow-500/40 hover:bg-yellow-50/50'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* ORDERS LIST */}
        {filteredOrders.length === 0 ? (
          <div className="card-warm p-12 text-center">
            <p className="text-gray-500">
              No orders with status "{filter}"
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order, index) => (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="card-warm overflow-hidden hover:shadow-warm-lg transition-shadow"
              >
                {/* ORDER HEADER */}
                <div className="p-4 sm:p-6 border-b border-yellow-500/10">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm text-gray-500">
                        Order #{order._id?.slice(-8).toUpperCase()}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {new Date(order.createdAt).toLocaleDateString(
                          'en-US',
                          {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          }
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                          order.orderStatus
                        )}`}
                      >
                        {getStatusIcon(order.orderStatus)}
                        {order.orderStatus}
                      </span>
                      <Link
                        to={`/orders/${order._id}`}
                        className="text-sm text-yellow-600 hover:text-yellow-700 transition flex items-center gap-1"
                      >
                        View Details <FiChevronRight size={16} />
                      </Link>
                    </div>
                  </div>
                </div>

                {/* ORDER ITEMS PREVIEW */}
                <div className="p-4 sm:p-6">
                  <div className="flex flex-wrap gap-3 mb-4">
                    {order.items?.slice(0, 3).map((item, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3"
                      >
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-14 h-14 object-cover rounded-lg"
                        />
                        <div className="text-sm">
                          <p className="font-medium">{item.name}</p>
                          <p className="text-gray-500">
                            Qty: {item.quantity}
                            {item.size && ` | Size: ${item.size}`}
                          </p>
                        </div>
                      </div>
                    ))}
                    {order.items?.length > 3 && (
                      <span className="text-sm text-gray-500 self-center">
                        +{order.items.length - 3} more
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center justify-between pt-4 border-t border-yellow-500/10 gap-3">
                    <div className="text-sm text-gray-500">
                      <span className="font-medium">Payment:</span>{' '}
                      {order.paymentMethod}
                    </div>
                    <div className="font-bold text-lg text-yellow-600">
                      {formatPrice(order.total)}
                    </div>
                  </div>

                  {/* ACTION BUTTONS */}
                  <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-yellow-500/10">
                    <Link
                      to={`/orders/${order._id}`}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-yellow-500/20 text-gray-700 rounded-lg text-sm font-medium hover:bg-yellow-50 hover:border-yellow-500/40 transition"
                    >
                      <FiEye size={16} />
                      View Details
                    </Link>
                    <button
                      onClick={() => handleReorder(order)}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500 text-gray-900 rounded-lg text-sm font-medium hover:bg-yellow-400 transition shadow-warm-sm"
                    >
                      <FiRotateCcw size={16} />
                      Reorder
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;