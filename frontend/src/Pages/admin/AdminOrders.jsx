import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiEye, FiFilter } from 'react-icons/fi';
import { notify } from '../../utils/notify';   // ✅ correct
import api from '../../utils/api';

const AdminOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/orders');
      if (response.data.success) {
        setOrders(response.data.orders || []);
      }
    } catch (error) {
      console.error('❌ Error fetching orders:', error);
      notify.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

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

  const filteredOrders =
    filter === 'All'
      ? orders
      : orders.filter(
          (o) => o.orderStatus?.toLowerCase() === filter.toLowerCase()
        );

  const filterTabs = [
    'All',
    'Processing',
    'Shipped',
    'Out for Delivery',
    'Delivered',
    'Cancelled',
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 className="font-serif text-2xl lg:text-3xl">Orders</h1>
        <p className="text-sm text-gray-500">
          {orders.length} total {orders.length === 1 ? 'order' : 'orders'}
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {filterTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === tab
                ? 'bg-yellow-500 text-gray-900'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center text-gray-500">
          <FiFilter className="mx-auto mb-3 text-gray-400" size={32} />
          No orders with status "{filter}"
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Table Header - Desktop */}
          <div className="hidden lg:grid grid-cols-12 gap-4 px-6 py-3 bg-cream border-b border-gray-100 text-sm font-medium text-gray-600">
            <div className="col-span-2">Order ID</div>
            <div className="col-span-3">Customer</div>
            <div className="col-span-2">Date</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2 text-right">Total</div>
            <div className="col-span-1 text-center">Action</div>
          </div>

          {/* Order Rows */}
          <div className="divide-y divide-gray-100">
            {filteredOrders.map((order) => (
              <div
                key={order._id}
                className="p-4 lg:px-6 lg:py-4 grid grid-cols-1 lg:grid-cols-12 gap-3 lg:gap-4 items-center hover:bg-cream transition"
              >
                <div className="lg:col-span-2">
                  <p className="text-xs text-gray-400 lg:hidden">Order ID</p>
                  <p className="font-medium text-sm">
                    #{order._id?.slice(-8).toUpperCase()}
                  </p>
                </div>

                <div className="lg:col-span-3">
                  <p className="text-xs text-gray-400 lg:hidden">Customer</p>
                  <p className="text-sm">
                    {order.user?.name || order.address?.firstName || 'Guest'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {order.user?.email || order.address?.email || ''}
                  </p>
                </div>

                <div className="lg:col-span-2">
                  <p className="text-xs text-gray-400 lg:hidden">Date</p>
                  <p className="text-sm text-gray-600">
                    {new Date(order.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </div>

                <div className="lg:col-span-2">
                  <p className="text-xs text-gray-400 lg:hidden">Status</p>
                  <span
                    className={`inline-block text-xs px-3 py-1 rounded-full font-medium ${getStatusColor(
                      order.orderStatus
                    )}`}
                  >
                    {order.orderStatus}
                  </span>
                </div>

                <div className="lg:col-span-2 lg:text-right">
                  <p className="text-xs text-gray-400 lg:hidden">Total</p>
                  <p className="font-semibold text-yellow-600">
                    ${order.total?.toFixed(2)}
                  </p>
                </div>

                <div className="lg:col-span-1 lg:text-center">
                  <button
                    onClick={() => navigate(`/admin/orders/${order._id}`)}
                    className="inline-flex items-center gap-1 text-sm text-yellow-600 hover:text-yellow-700 transition"
                  >
                    <FiEye size={16} />
                    <span className="lg:hidden">View</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;